import requests
import re
import os
from dotenv import load_dotenv

load_dotenv()
NODE_API = os.getenv("NODE_API")

def execute_intent(intent, text, token):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    text = text.lower()

    # Fetch all user categories to validate
    categories_res = requests.get(f"{NODE_API}/categories", headers=headers, timeout=5)
    categories = categories_res.json() if categories_res.status_code == 200 else []

    # ---------------- GET EXPENSES ----------------
    if intent == "GET_EXPENSES":
        res = requests.get(f"{NODE_API}/expenses", headers=headers, timeout=5)
        return res.json()

    # ---------------- ADD EXPENSE ----------------
    elif intent == "ADD_EXPENSE":
        # Extract amount
        amount_match = re.search(r'\d+(?:\.\d+)?', text)
        if not amount_match:
            return {"error": "Please mention an amount in your command."}
        amount = float(amount_match.group())

        # Try to match category from user categories
        matched_category = None
        for cat in categories:
            if cat["category"].lower() in text:
                matched_category = cat
                break

        if not matched_category:
            return {"error": "Category mentioned in your command does not exist."}

        payload = {
            "expenseAmount": amount,
            "note": matched_category["category"],   # Prefill note as category name
            "categoryID": matched_category["categoryID"]
        }

        res = requests.post(f"{NODE_API}/expenses/add", json=payload, headers=headers, timeout=5)

        if res.status_code in [200, 201]:
            # Return data for React prefill
            return {
                "amount": amount,
                "categoryID": matched_category["categoryID"],
                "category": matched_category["category"]
            }
        else:
            return {"error": "Failed to add expense via Node API."}

    # ---------------- DELETE EXPENSE ----------------
    elif intent == "DELETE_EXPENSE":
        expense_id_match = re.search(r'\d+', text)
        if not expense_id_match:
            return {"error": "Please mention the expense ID to delete."}
        expense_id = expense_id_match.group()
        res = requests.delete(f"{NODE_API}/expenses/{expense_id}", headers=headers, timeout=5)
        return res.json()

    # ---------------- UPDATE EXPENSE ----------------
    elif intent == "UPDATE_EXPENSE":
        numbers = re.findall(r'\d+(?:\.\d+)?', text)
        if len(numbers) < 2:
            return {"error": "Please provide both expense ID and new amount."}
        expense_id = numbers[0]
        amount = float(numbers[1])
        payload = {"amount": amount}
        res = requests.put(f"{NODE_API}/expenses/{expense_id}", json=payload, headers=headers, timeout=5)
        return res.json()

    return {"error": "Intent not supported."}