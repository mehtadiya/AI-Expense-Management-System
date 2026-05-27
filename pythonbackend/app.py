from fastapi import FastAPI, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatbot.chatbot import detect_intent
from chatbot.intent_parser import execute_intent
from faster_whisper import WhisperModel
import tempfile, os
from dotenv import load_dotenv
import requests
import re
import datetime
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None

load_dotenv()

NODE_API = os.getenv("NODE_API")

def get_model():
    global model
    if model is None:
        model = WhisperModel("tiny", device="cpu", compute_type="int8")
    return model

def extract_date(text: str):
    text = text.lower()
    today = datetime.datetime.now()

    if "day before yesterday" in text:
        return (today - datetime.timedelta(days=2)).strftime("%Y-%m-%d")

    if "yesterday" in text:
        return (today - datetime.timedelta(days=1)).strftime("%Y-%m-%d")

    if "today" in text:
        return today.strftime("%Y-%m-%d")

    match = re.search(r'(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})', text)
    if match:
        d, m, y = match.groups()
        y = int("20" + y) if len(y) == 2 else int(y)
        try:
            return datetime.datetime(y, int(m), int(d)).strftime("%Y-%m-%d")
        except:
            pass

    return today.strftime("%Y-%m-%d")

class ChatRequest(BaseModel):
    message: str

def get_user_categories(token: str):
    try:
        res = requests.get(
            f"{NODE_API}/categories",
            headers={"Authorization": f"Bearer {token}"}
        )
        return res.json()
    except:
        return []

def parse_expense_command(cmd: str, user_categories: list):
    cmd_lower = cmd.lower()

    amount_match = re.search(r'(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)', cmd_lower)
    amount = float(amount_match.group(1)) if amount_match else None

    note_match = re.search(r'(?:for|in|on)\s+([a-zA-Z0-9\s]+)', cmd_lower)
    note = note_match.group(1).strip() if note_match else "general"

    cmd_clean = re.sub(r'[^a-z0-9]', ' ', cmd_lower)

    matched_category = None

    for cat in user_categories:
        cat_clean = re.sub(r'[^a-z0-9]', ' ', cat["category"].lower())
        if all(word in cmd_clean for word in cat_clean.split()):
            matched_category = cat
            break

    if not matched_category:
        for cat in user_categories:
            cat_clean = re.sub(r'[^a-z0-9]', ' ', cat["category"].lower())
            if any(word in cmd_clean for word in cat_clean.split()):
                matched_category = cat
                break

    if not matched_category:
        keyword_map = {
            "food": ["food", "dining", "restaurant", "lunch", "dinner"],
            "transport": ["travel", "uber", "bus"],
            "shopping": ["shopping", "mall", "clothes"]
        }

        for cat in user_categories:
            name = cat["category"].lower()
            for key, words in keyword_map.items():
                if key in name and any(w in cmd_clean for w in words):
                    matched_category = cat
                    break
            if matched_category:
                break

    return {
        "amount": amount,
        "note": note,
        "categoryID": matched_category["categoryID"] if matched_category else None,
        "category": matched_category["category"] if matched_category else "other"
    }

@app.post("/chat")
async def chat_command(req: ChatRequest, authorization: str = Header(None)):
    try:
        text = req.message.strip().lower()

        token = authorization.split(" ")[1] if authorization else None
        categories = get_user_categories(token)

        intent = detect_intent(text)

        if "category" in text or "categories" in text:
            intent = "COUNT_CATEGORIES"

        elif "how many" in text or "count" in text:
            intent = "COUNT_EXPENSES"

        elif "how much" in text or "total" in text or "spent" in text:
            intent = "TOTAL_EXPENSE"

        elif "show" in text or "list" in text or "give" in text:
            intent = "GET_EXPENSES"

        if intent == "COUNT_CATEGORIES":
            return {"reply": f"You have {len(categories)} categories"}

        expenses = []
        if intent in ["GET_EXPENSES", "COUNT_EXPENSES", "TOTAL_EXPENSE"]:
            expenses = requests.get(
                f"{NODE_API}/expenses",
                headers={"Authorization": f"Bearer {token}"}
            ).json()

        if intent == "GET_EXPENSES":
            if not expenses:
                return {"reply": "No expenses found"}

            msg = "Your Expenses:\n\n"
            for e in expenses:
                msg += f"• ₹{e['expenseAmount']} - {e.get('note','')} ({e.get('category','')})\n"

            return {"reply": msg}

        if intent == "COUNT_EXPENSES":
            return {"reply": f"You have {len(expenses)} expenses"}

        if intent == "TOTAL_EXPENSE":
            total = sum(float(e.get("expenseAmount", 0)) for e in expenses)

            for cat in categories:
                if cat["category"].lower() in text:
                    filtered = [
                        e for e in expenses
                        if e.get("category", "").lower() == cat["category"].lower()
                    ]
                    total = sum(float(e.get("expenseAmount", 0)) for e in filtered)
                    return {"reply": f"You spent ₹{total} on {cat['category']}"}

            return {"reply": f"Total spending is ₹{total}"}

        if intent == "ADD_EXPENSE":
            parsed = parse_expense_command(text, categories)

            if parsed["amount"] is None:
                return {"reply": "Please mention amount"}

            expense_date = extract_date(text)

            response = requests.post(
                f"{NODE_API}/expenses/add",
                json={
                    "expenseAmount": parsed["amount"],
                    "note": parsed["note"],
                    "categoryID": parsed["categoryID"],
                    "expenseDate": expense_date
                },
                headers={"Authorization": f"Bearer {token}"}
            )

            if response.status_code in [200, 201]:
                return {"reply": f"Added ₹{parsed['amount']} to {parsed['category']}"}

            return {"reply": "Failed to save expense"}

        return {"reply": "I didn’t understand"}

    except Exception as e:
        return {"reply": str(e)}

# @app.post("/voice")
# async def voice_input(file: UploadFile = File(...), authorization: str = Header(None)):
#     tmp_path = None
#     wav_path = None

#     try:
#         suffix = ".webm"

#         if file.filename:
#             ext = os.path.splitext(file.filename)[1]
#             if ext:
#                 suffix = ext

#         with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
#             contents = await file.read()
#             tmp.write(contents)
#             tmp_path = tmp.name

#         wav_path = tmp_path + ".wav"

#         ffmpeg_result = subprocess.run(
#             ["ffmpeg", "-y", "-i", tmp_path, "-ar", "16000", "-ac", "1", wav_path],
#             capture_output=True,
#             text=True
#         )

#         if ffmpeg_result.returncode != 0:
#             return {
#                 "transcript": "",
#                 "intent": "ERROR",
#                 "data": {"error": ffmpeg_result.stderr}
#             }

#         model = get_model()
#         segments, info = model.transcribe(wav_path, language="en")

#         text = " ".join([segment.text for segment in segments]).strip()

#         if not text:
#             return {
#                 "transcript": "",
#                 "intent": "ERROR",
#                 "data": {"error": "No speech detected"}
#             }

#         intent = detect_intent(text)

#         token = None

#         if authorization and " " in authorization:
#             token = authorization.split(" ")[1]

#         data = None

#         if token:
#             try:
#                 data = execute_intent(intent, text, token)
#             except Exception as e:
#                 data = {"error": str(e)}

#         if data and "error" in data:
#             intent = "ERROR"

#         return {
#             "transcript": text,
#             "intent": intent,
#             "data": data
#         }

#     except Exception as e:
#         return {
#             "transcript": "",
#             "intent": "ERROR",
#             "data": {"error": str(e)}
#         }

#     finally:
#         try:
#             if tmp_path and os.path.exists(tmp_path):
#                 os.remove(tmp_path)
#         except:
#             pass

#         try:
#             if wav_path and os.path.exists(wav_path):
#                 os.remove(wav_path)
#         except:
#             pass

@app.post("/voice")
async def voice_input(file: UploadFile = File(...), authorization: str = Header(None)):
    return {"ok": True}