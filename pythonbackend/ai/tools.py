import os
import requests

NODE_API = os.getenv("NODE_API")

def get_expenses(token):
    response = requests.get(
        f"{NODE_API}/expenses",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json()

def get_categories(token):
    response = requests.get(
        f"{NODE_API}/categories",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json()

def get_budgets(token):
    response = requests.get(
        f"{NODE_API}/categoriesBudgets",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json()

def add_voice_draft(token, expense):
    response = requests.post(
        f"{NODE_API}/voiceDrafts/add",
        json=expense,
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    return response.json()