
from fastapi import FastAPI, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from faster_whisper import WhisperModel
import tempfile, os
from dotenv import load_dotenv
import requests
import re
import datetime
import subprocess
from ai.groq_agent import ask_agent
from ai.memory import save_memory, get_memory
import tempfile
import subprocess
import json
from ai.tools import (
    get_expenses,
    get_categories,
    get_budgets
)
from ai.tools import get_categories
from ai.groq_agent import ask_receipt_agent
import easyocr

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


MONTHS = {
    "january": 1,
    "february": 2,
    "march": 3,
    "april": 4,
    "may": 5,
    "june": 6,
    "july": 7,
    "august": 8,
    "september": 9,
    "october": 10,
    "november": 11,
    "december": 12
}

class ChatRequest(BaseModel):
    message: str



reader = easyocr.Reader(
    ['en'],
    gpu=False
)

def extract_text_from_image(image_path):
    result = reader.readtext(
    image_path,
    detail=0,
    paragraph=False
    )

    return "\n".join(result)


def normalize(text: str):
    return text.lower().strip()


def safe_json_loads(text):
    try:
        return json.loads(text)
    except:
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            return json.loads(text[start:end])
        except:
            return None


@app.post("/chat-v2")
async def chat_v2(req: ChatRequest, authorization: str = Header(None)):
    try:
        token = authorization.split(" ")[1]
        user_id = token

        memory = get_memory(user_id)
        response = ask_agent(req.message, memory)

        data = safe_json_loads(response)

        if not data:
            data = {"type": "CHAT", "reply": response}

        action = data.get("type") or "CHAT"

        if action == "GET_EXPENSES":
            expenses = get_expenses(token) or []

            msg = req.message.lower()

            def parse_date(e):
                try:
                    return datetime.datetime.fromisoformat(
                        e.get("expenseDate", "1970-01-01")
                    )
                except:
                    return datetime.datetime(1970, 1, 1)

            if "how many" in msg or "count" in msg:
                reply = f"You have {len(expenses)} expenses"

            elif "latest" in msg or "last" in msg:
                e = max(expenses, key=parse_date) if expenses else None
                reply = (
                    f"Latest expense: ₹{e['expenseAmount']} - "
                    f"{e['category']} - {e['note']}"
                ) if e else "No expenses found"

            elif "highest" in msg or "max" in msg:
                e = max(
                    expenses,
                    key=lambda x: float(x.get("expenseAmount", 0))
                ) if expenses else None

                reply = (
                    f"Highest expense: ₹{e['expenseAmount']} - "
                    f"{e['category']} - {e['note']}"
                ) if e else "No expenses found"

            else:
                reply = "Your expenses:\n\n"

                for e in expenses[:20]:
                    reply += (
                        f"₹{e['expenseAmount']} - "
                        f"{e['category']} - "
                        f"{e['note']}\n"
                    )

            save_memory(user_id, "user", req.message)
            save_memory(user_id, "assistant", reply)

            return {"reply": reply}

        if action == "GET_CATEGORIES":
            categories = get_categories(token) or []

            if (
                "how many" in req.message.lower()
                or "count" in req.message.lower()
            ):
                reply = f"You have {len(categories)} categories"
            else:
                reply = "Your Categories:\n\n"

                for c in categories:
                    reply += f"{c['category']}\n"

            save_memory(user_id, "user", req.message)
            save_memory(user_id, "assistant", reply)

            return {"reply": reply}

        if action == "GET_BUDGET":

            budgets = get_budgets(token) or []

            msg = req.message.lower()

            target_month = None

            for month_name, month_num in MONTHS.items():
                if month_name in msg:
                    target_month = month_num
                    break

            if target_month is None:
                target_month = datetime.datetime.now().month

            

            total_budget = None
            category_budgets = []

            for b in budgets:

                from_date = b.get("fromDate")
                to_date = b.get("toDate")

                if not from_date or not to_date:
                    continue

                try:
                    end = datetime.datetime.fromisoformat(
                        str(to_date).replace("Z", "+00:00")
                    )
                except:
                    continue

                if end.month != target_month:
                    continue

                amount = float(b.get("amountLimit") or 0)

                if b.get("categoryID") is None:
                    total_budget = amount
                else:
                    category_budgets.append({
                        "category": b["category"],
                        "amount": amount
                    })


            month_name = datetime.date(
                1900,
                target_month,
                1
            ).strftime("%B")

            if total_budget is not None:

                reply = (
                    f"Your total budget for "
                    f"{month_name} is ₹{total_budget:.0f}"
                )

            elif category_budgets:

                total_category_budget = sum(
                    item["amount"] for item in category_budgets
                )

                reply = (
                    f"Your total budget for "
                    f"{month_name} is ₹{total_category_budget:.0f}\n\n"
                    f"Category-wise budgets:\n"
                )

                for item in category_budgets:
                    reply += (
                        f"• {item['category']}: "
                        f"₹{item['amount']:.0f}\n"
                    )

            else:

                reply = (
                    f"You don't have any budget set for "
                    f"{month_name}"
                )

            save_memory(user_id, "user", req.message)
            save_memory(user_id, "assistant", reply)

            return {"reply": reply}
        if action == "ADD_EXPENSE":
            categories = get_categories(token) or []

            amount = data.get("data", {}).get("amount")
            note = data.get("data", {}).get("note", "general")
            ai_category = (
                data.get("data", {}).get("category") or ""
            ).lower()

            category_id = None

            for c in categories:
                db_cat = c["category"].lower()

                if ai_category in db_cat or db_cat in ai_category:
                    category_id = c["categoryID"]
                    break

            if not category_id:
                reply = "Category not found"

                save_memory(user_id, "user", req.message)
                save_memory(user_id, "assistant", reply)

                return {"reply": reply}

            requests.post(
                f"{NODE_API}/expenses/add",
                json={
                    "expenseAmount": amount,
                    "note": note,
                    "categoryID": category_id,
                    "expenseDate": datetime.datetime.now().strftime(
                        "%Y-%m-%d"
                    )
                },
                headers={
                    "Authorization": f"Bearer {token}"
                }
            )

            reply = f"Added ₹{amount} to {ai_category}"

            save_memory(user_id, "user", req.message)
            save_memory(user_id, "assistant", reply)

            return {"reply": reply}
        
        if action == "ADD_CATEGORY":

            category_name = (
                data.get("data", {})
                .get("category", "")
                .strip()
            )

            if not category_name:
                return {
                    "reply": "Please provide category name"
                }

            categories = get_categories(token) or []

            for c in categories:
                if c["category"].lower() == category_name.lower():

                    reply = (
                        f"Category '{category_name}' "
                        f"already exists"
                    )

                    save_memory(user_id, "user", req.message)
                    save_memory(user_id, "assistant", reply)

                    return {"reply": reply}

            icons = requests.get(
                f"{NODE_API}/icons",
                headers={
                    "Authorization": f"Bearer {token}"
                }
            ).json()

            default_icon_id = (
                icons[0]["iconID"]
                if icons else 1
            )

            response = requests.post(
                f"{NODE_API}/categories/add",
                json={
                    "category": category_name,
                    "iconID": default_icon_id
                },
                headers={
                    "Authorization": f"Bearer {token}"
                }
            )

            if response.status_code in [200, 201]:
                reply = (
                    f"Category '{category_name}' "
                    f"added successfully"
                )
            else:
                try:
                    reply = response.json().get(
                        "message",
                        "Failed to add category"
                    )
                except:
                    reply = "Failed to add category"

            save_memory(user_id, "user", req.message)
            save_memory(user_id, "assistant", reply)

            return {"reply": reply}
        reply = data.get("reply") or "OK"

        save_memory(user_id, "user", req.message)
        save_memory(user_id, "assistant", reply)

        return {"reply": reply}

    except Exception as e:
        return {"reply": str(e)}


@app.post("/voice-v2")
async def voice_v2(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    tmp_path = None
    wav_path = None

    try:
        token = authorization.split(" ")[1]

        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        wav_path = tmp_path + ".wav"

        subprocess.run(
            ["ffmpeg", "-y", "-i", tmp_path, "-ar", "16000", "-ac", "1", wav_path],
            capture_output=True
        )

        model = get_model()
        segments, _ = model.transcribe(wav_path, language="en")

        transcript = " ".join(segment.text for segment in segments).strip()

        if not transcript:
            return {"transcript": "", "action": "ERROR"}

        memory = get_memory(token)
        response = ask_agent(transcript, memory)

        data = safe_json_loads(response)

        if not data:
            data = {"type": "CHAT", "reply": response}

        action = data.get("type", "CHAT")

        if action == "GET_EXPENSES":
            return {"transcript": transcript, "action": "GET_EXPENSES"}

        if action == "ADD_EXPENSE":

            categories = get_categories(token) or []

            amount = data.get("data", {}).get("amount")
            note = data.get("data", {}).get("note", "")
            ai_category = (data.get("data", {}).get("category", "")).lower()

            category_id = None

            for c in categories:
                db_cat = c["category"].lower()
                if ai_category in db_cat or db_cat in ai_category:
                    category_id = c["categoryID"]
                    ai_category = c["category"]
                    break

            if not category_id:
                category_id = categories[0]["categoryID"] if categories else None
                ai_category = categories[0]["category"] if categories else "general"

            expense = {
                "categoryID": category_id,
                "category": ai_category,
                "note": note,
                "expenseAmount": amount,
                "expenseDate": datetime.datetime.now().strftime("%Y-%m-%d")
            }

            r = requests.post(
                f"{NODE_API}/voiceDrafts/add",
                json=expense,
                headers={"Authorization": f"Bearer {token}"}
            )

            saved = r.json() if r.headers.get("content-type","").startswith("application/json") else expense

            return {
                "transcript": transcript,
                "action": "ADD_EXPENSE",
                "data": [saved]
            }

        if action == "ADD_MULTIPLE":

            categories = get_categories(token) or []
            items = data.get("data", [])

            if not isinstance(items, list):
                items = []

            saved_expenses = []

            for item in items:

                raw_cat = (item.get("category", "")).lower()

                category_id = None
                final_category = raw_cat

                for c in categories:
                    db_cat = c["category"].lower()
                    if raw_cat in db_cat or db_cat in raw_cat:
                        category_id = c["categoryID"]
                        final_category = c["category"]
                        break

                if not category_id and categories:
                    category_id = categories[0]["categoryID"]
                    final_category = categories[0]["category"]

                payload = {
                    "categoryID": category_id,
                    "category": final_category,
                    "note": item.get("note", ""),
                    "expenseAmount": item.get("amount"),
                    "expenseDate": datetime.datetime.now().strftime("%Y-%m-%d")
                }

                r = requests.post(
                    f"{NODE_API}/voiceDrafts/add",
                    json=payload,
                    headers={"Authorization": f"Bearer {token}"}
                )

                try:
                    saved_expenses.append(r.json())
                except:
                    saved_expenses.append(payload)

            return {
                "transcript": transcript,
                "action": "ADD_MULTIPLE",
                "data": saved_expenses
            }

        return {
            "transcript": transcript,
            "action": action,
            "reply": data.get("reply")
        }

    except Exception as e:
        return {"action": "ERROR", "error": str(e)}

    finally:
        try:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)
        except:
            pass

        try:
            if wav_path and os.path.exists(wav_path):
                os.remove(wav_path)
        except:
            pass




@app.post("/scan-receipt")
@app.post("/scan-receipt")
async def scan_receipt(
    receipt: UploadFile = File(...),
    authorization: str = Header(None)
):

    image_path = None

    try:

        token = authorization.split(" ")[1]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".jpg"
        ) as tmp:

            contents = await receipt.read()
            tmp.write(contents)
            image_path = tmp.name

        
        text = extract_text_from_image(image_path)

        

        if not text.strip():
            return {
                "success": False,
                "message": "No text found in receipt"
            }

        
        response = ask_receipt_agent(text)

        

        data = safe_json_loads(response)

        if not data:
            return {
                "success": False,
                "message": "AI extraction failed"
            }

        items = data.get("items", [])
        date = data.get(
            "date",
            datetime.datetime.now().strftime("%Y-%m-%d")
        )

        categories = get_categories(token) or []

        saved_expenses = []

        for item in items:

            ai_category = item.get(
                "category",
                "Other"
            ).lower()

            category_id = None

            for c in categories:

                db_cat = c["category"].lower()

                if (
                    ai_category in db_cat
                    or db_cat in ai_category
                ):
                    category_id = c["categoryID"]
                    break

            if not category_id and categories:
                category_id = categories[0]["categoryID"]

            payload = {
                "expenseAmount": item["amount"],
                "categoryID": category_id,
                "note": item["name"],
                "expenseDate": date
            }

            r = requests.post(
                f"{NODE_API}/voiceDrafts/add",
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}"
                }
            )

            try:
                saved_expenses.append(r.json())
            except:
                saved_expenses.append(payload)

        return {
            "success": True,
            "ocrText": text,
            "count": len(saved_expenses),
            "data": saved_expenses
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }

    finally:

        if (
            image_path
            and os.path.exists(image_path)
        ):
            os.remove(image_path)

