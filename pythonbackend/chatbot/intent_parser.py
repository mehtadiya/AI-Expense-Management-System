import requests
# Used to send HTTP requests to the Node.js backend API.
import re
# re stands for Regular Expressions.
# It is used to extract numbers from user text.


NODE_API = "https://expense-management-2-ez4q.onrender.com"


def execute_intent(intent, text, token):

    headers = {
        "Authorization": f"Bearer {token}"
    }

    text = text.lower()

    if intent == "GET_EXPENSES":

        res = requests.get(
            f"{NODE_API}/expenses",
            headers=headers,
            timeout=5
        )

        return res.json()

    elif intent == "ADD_EXPENSE":

        amount = re.search(r'\d+', text)
        # Means find numbers in text.
        if amount:
            amount = int(amount.group())

        payload = {
            "amount": amount
        }

        res = requests.post(
            f"{NODE_API}/expenses/add",
            json=payload,
            headers=headers,
            timeout=5
        )

        return res.json()

    elif intent == "DELETE_EXPENSE":

        expense_id = re.search(r'\d+', text)

        if expense_id:
            expense_id = expense_id.group()

        res = requests.delete(
            f"{NODE_API}/expenses/{expense_id}",
            headers=headers,
            timeout=5
        )

        return res.json()

    elif intent == "UPDATE_EXPENSE":

        numbers = re.findall(r'\d+', text)

        if len(numbers) >= 2:

            expense_id = numbers[0]
            amount = numbers[1]

            payload = {
                "amount": amount
            }

            res = requests.put(
                f"{NODE_API}/expenses/{expense_id}",
                json=payload,
                headers=headers,
                timeout=5
            )

            return res.json()

    return {"message": "Intent not supported"}