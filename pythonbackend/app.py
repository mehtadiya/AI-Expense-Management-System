from fastapi import FastAPI, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatbot.chatbot import detect_intent
import whisper
import tempfile, os
import requests
import re
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading Whisper model...")
model = whisper.load_model("base.en")
print("Whisper loaded!")

NODE_API = "http://localhost:3002"

# ----------- DATE EXTRACTOR -----------
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


# ----------- REQUEST MODEL -----------
class ChatRequest(BaseModel):
    message: str


# ----------- FETCH CATEGORIES -----------
def get_user_categories(token: str):
    try:
        res = requests.get(
            f"{NODE_API}/categories",
            headers={"Authorization": f"Bearer {token}"}
        )
        return res.json()
    except:
        return []


# ----------- PARSE EXPENSE -----------
def parse_expense_command(cmd: str, user_categories: list):
    cmd_lower = cmd.lower()

    amount_match = re.search(r'(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)', cmd_lower)
    amount = float(amount_match.group(1)) if amount_match else None

    note_match = re.search(r'(?:for|in|on)\s+([a-zA-Z0-9\s]+)', cmd_lower)
    note = note_match.group(1).strip() if note_match else "general"

    cmd_clean = re.sub(r'[^a-z0-9]', ' ', cmd_lower)

    matched_category = None

    # EXACT MATCH
    for cat in user_categories:
        cat_clean = re.sub(r'[^a-z0-9]', ' ', cat["category"].lower())
        if all(word in cmd_clean for word in cat_clean.split()):
            matched_category = cat
            break

    # PARTIAL MATCH
    if not matched_category:
        for cat in user_categories:
            cat_clean = re.sub(r'[^a-z0-9]', ' ', cat["category"].lower())
            if any(word in cmd_clean for word in cat_clean.split()):
                matched_category = cat
                break

    # KEYWORD MATCH
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


# ----------- CHAT API -----------
@app.post("/chat")
async def chat_command(req: ChatRequest, authorization: str = Header(None)):
    try:
        text = req.message.strip().lower()
        print("USER:", text)

        token = authorization.split(" ")[1] if authorization else None
        categories = get_user_categories(token)

        intent = detect_intent(text)

        # 🔥 FIXED PRIORITY RULES
        if "category" in text or "categories" in text:
            intent = "COUNT_CATEGORIES"

        elif "how many" in text or "count" in text:
            intent = "COUNT_EXPENSES"

        elif "how much" in text or "total" in text or "spent" in text:
            intent = "TOTAL_EXPENSE"

        elif "show" in text or "list" in text or "give" in text:
            intent = "GET_EXPENSES"

        # -------- CATEGORY COUNT --------
        if intent == "COUNT_CATEGORIES":
            return {"reply": f"📂 You have {len(categories)} categories"}

        # -------- FETCH EXPENSES --------
        expenses = []
        if intent in ["GET_EXPENSES", "COUNT_EXPENSES", "TOTAL_EXPENSE"]:
            expenses = requests.get(
                f"{NODE_API}/expenses",
                headers={"Authorization": f"Bearer {token}"}
            ).json()

        # -------- SHOW --------
        if intent == "GET_EXPENSES":
            if not expenses:
                return {"reply": "No expenses found"}

            msg = "🧾 Your Expenses:\n\n"
            for e in expenses:
                msg += f"• ₹{e['expenseAmount']} - {e.get('note','')} ({e.get('category','')})\n"

            return {"reply": msg}

        # -------- COUNT --------
        if intent == "COUNT_EXPENSES":
            return {"reply": f"📊 You have {len(expenses)} expenses"}

        # -------- TOTAL --------
        if intent == "TOTAL_EXPENSE":
            total = sum(float(e.get("expenseAmount", 0)) for e in expenses)

            for cat in categories:
                if cat["category"].lower() in text:
                    filtered = [
                        e for e in expenses
                        if e.get("category", "").lower() == cat["category"].lower()
                    ]
                    total = sum(float(e.get("expenseAmount", 0)) for e in filtered)
                    return {"reply": f"💰 You spent ₹{total} on {cat['category']}"}

            return {"reply": f"💰 Total spending is ₹{total}"}

        # -------- ADD --------
        if intent == "ADD_EXPENSE":
            parsed = parse_expense_command(text, categories)

            if parsed["amount"] is None:
                return {"reply": "❌ Please mention amount"}

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
                return {
                    "reply": f"✅ Added ₹{parsed['amount']} to {parsed['category']}"
                }

            return {"reply": "❌ Failed to save expense"}

        return {"reply": "🤔 I didn’t understand"}

    except Exception as e:
        print("ERROR:", e)
        return {"reply": "❌ Server error"}

# from fastapi import FastAPI, UploadFile, File, Header
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from openai import OpenAI
# import whisper
# import tempfile, os
# import requests
# import json
# import datetime
# from dotenv import load_dotenv

# # -------- INIT --------
# app = FastAPI()
# load_dotenv()

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# print("Loading Whisper model...")
# model = whisper.load_model("base.en")
# print("Whisper loaded!")

# NODE_API = "http://localhost:3002"


# # -------- REQUEST MODEL --------
# class ChatRequest(BaseModel):
#     message: str


# # -------- FETCH CATEGORIES --------
# def get_user_categories(token: str):
#     try:
#         res = requests.get(
#             f"{NODE_API}/categories",
#             headers={"Authorization": f"Bearer {token}"}
#         )
#         return res.json()
#     except Exception as e:
#         print("Category fetch error:", e)
#         return []


# # -------- DATE PARSER --------
# def parse_date(date_str):
#     today = datetime.date.today()

#     if not date_str:
#         return today.strftime("%Y-%m-%d")

#     d = date_str.lower()

#     if "yesterday" in d:
#         return (today - datetime.timedelta(days=1)).strftime("%Y-%m-%d")

#     if "day before" in d:
#         return (today - datetime.timedelta(days=2)).strftime("%Y-%m-%d")

#     return date_str


# # -------- AI PARSER --------
# def ai_parse(text: str, categories: list):
#     category_list = [c["category"] for c in categories]

#     prompt = f"""
#     Extract structured data.

#     Input: "{text}"
#     Categories: {category_list}

#     Return JSON:
#     {{
#       "intent": "ADD_EXPENSE or GET_EXPENSES or TOTAL_EXPENSE or COUNT_EXPENSES",
#       "amount": number or null,
#       "category": "category name or null",
#       "note": "text",
#       "date": "YYYY-MM-DD or null"
#     }}
#     """

#     try:
#         print("🔥 CALLING OPENAI...")

#         response = client.chat.completions.create(
#             model="gpt-4.1-mini",
#             temperature=0,
#             response_format={"type": "json_object"},
#             messages=[{"role": "user", "content": prompt}]
#         )

#         content = response.choices[0].message.content
#         print("✅ AI RAW RESPONSE:", content)

#         return json.loads(content)

#     except Exception as e:
#         import traceback
#         print("❌ FULL AI ERROR BELOW:")
#         traceback.print_exc()
#         return None
       
# # -------- CHAT API --------
# @app.post("/chat")
# async def chat_command(req: ChatRequest, authorization: str = Header(None)):
#     try:
#         text = req.message.strip()
#         print("USER:", text)

#         token = authorization.split(" ")[1] if authorization else None
#         print("TOKEN:", token)

#         categories = get_user_categories(token)

#         ai_data = ai_parse(text, categories)
#         print("AI DATA:", ai_data)

#         if not ai_data:
#             return {"reply": "❌ AI failed"}

#         intent = ai_data.get("intent")

#         # -------- GET EXPENSES --------
#         if intent in ["GET_EXPENSES", "COUNT_EXPENSES", "TOTAL_EXPENSE"]:
#             try:
#                 res = requests.get(
#                     f"{NODE_API}/expenses",
#                     headers={"Authorization": f"Bearer {token}"}
#                 )
#                 expenses = res.json()
#                 print("EXPENSES:", expenses)
#             except Exception as e:
#                 print("FETCH ERROR:", e)
#                 return {"reply": "❌ Cannot fetch expenses"}

#         # -------- SHOW --------
#         if intent == "GET_EXPENSES":
#             if not expenses:
#                 return {"reply": "No expenses found"}

#             msg = "🧾 Your Expenses:\n\n"
#             for e in expenses:
#                 msg += f"• ₹{e.get('expenseAmount')} - {e.get('note','')}\n"

#             return {"reply": msg}

#         # -------- COUNT --------
#         if intent == "COUNT_EXPENSES":
#             return {"reply": f"📊 Total entries: {len(expenses)}"}

#         # -------- TOTAL --------
#         if intent == "TOTAL_EXPENSE":
#             total = sum(float(e.get("expenseAmount", 0)) for e in expenses)
#             return {"reply": f"💰 Total = ₹{total}"}

#         # -------- ADD --------
#         if intent == "ADD_EXPENSE":

#             amount = ai_data.get("amount")
#             if not amount:
#                 return {"reply": "❌ Amount missing"}

#             category_id = None
#             for c in categories:
#                 if ai_data.get("category") and c["category"].lower() == ai_data["category"].lower():
#                     category_id = c["categoryID"]

#             if not category_id:
#                 return {"reply": "❌ Category not found"}

#             date = parse_date(ai_data.get("date"))

#             try:
#                 response = requests.post(
#                     f"{NODE_API}/expenses/add",
#                     json={
#                         "expenseAmount": amount,
#                         "note": ai_data.get("note", ""),
#                         "categoryID": category_id,
#                         "expenseDate": date
#                     },
#                     headers={"Authorization": f"Bearer {token}"}
#                 )

#                 if response.status_code in [200, 201]:
#                     return {"reply": f"✅ Added ₹{amount} on {date}"}
#                 else:
#                     return {"reply": f"❌ Failed: {response.text}"}

#             except Exception as e:
#                 print("SAVE ERROR:", e)
#                 return {"reply": "❌ Save failed"}

#         return {"reply": "🤔 Not understood"}

#     except Exception as e:
#         print("MAIN ERROR:", e)
#         return {"reply": "❌ Server crashed"}