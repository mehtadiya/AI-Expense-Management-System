import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are a financial AI assistant for an expense tracking app.

You MUST ALWAYS return ONLY valid JSON.

Schema:
{
  "type": "GET_EXPENSES | GET_CATEGORIES | ADD_EXPENSE | ADD_MULTIPLE | GET_BUDGET | ADD_CATEGORY | CHAT",
  "reply": "string message for user",
  "data": {}
}

RULES:

1. GET_EXPENSES:
- when user asks: list expenses, show expenses, how many expenses, total expenses, latest expense, highest expense

2. GET_CATEGORIES:
- when user asks: categories, how many categories, list categories

3. ADD_EXPENSE:
- extract:
  amount (number)
  category (string)
  note (optional text)

4. ADD_CATEGORY:
- when user says:
  add category food
  create category travel
  make a category called shopping
  new category entertainment

5. ADD_CATEGORY:
- when user says:
  add category food
  create category travel
  make a category called shopping
  new category groceries
- extract category name

6. CHAT:
- normal conversation

7.ADD_MULTIPLE:
When user mentions multiple expenses.

Examples:

"spent 100 on petrol and 50 on tea"

"add 200 shopping for tshirt and 100 food for burger"

Return:

{
  "type":"ADD_MULTIPLE",
  "reply":"Adding multiple expenses",
  "data":[
    {
      "amount":100,
      "category":"Transport",
      "note":"petrol"
    },
    {
      "amount":50,
      "category":"Food",
      "note":"tea"
    }
  ]
}

Return:

{
  "type":"ADD_CATEGORY",
  "reply":"Adding category",
  "data":{
      "category":"Food"
  }
}

5. GET_BUDGET:
- when user asks about budget, monthly budget, spending limit

6. CHAT:
- normal conversation

IMPORTANT:
- ALWAYS return valid JSON
- NEVER return text outside JSON
"""


def ask_agent(message, memory, categories=None):

    history = "\n".join(
        [f"{m['role']}: {m['text']}" for m in memory]
    )

    # Convert database categories into simple names
    category_names = [
        c["category"] for c in (categories or [])
    ]

    available_categories = ", ".join(category_names)

    prompt = f"""
Conversation:
{history}

Available expense categories:
{available_categories}

IMPORTANT CATEGORY RULE:
When adding an expense, you MUST choose the category from the
Available expense categories above.

Use semantic understanding, NOT exact keyword matching.

Examples:
- burger → Food
- pizza → Food
- chocolate → Food
- ice cream → Food
- coffee → Food
- tea → Food
- restaurant → Food
- groceries → Food
- petrol → Transport
- bus → Transport
- train → Transport
- flight → Travel
- movie → Entertainment
- clothes → Shopping

If the item clearly belongs to an existing category, use that
existing category.

DO NOT create a new category just because the item name itself
does not match the category name.

User:
{message}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()


def ask_receipt_agent(receipt_text):

    SYSTEM_PROMPT = """
You are an AI receipt parser.

Extract ALL purchased items from receipt OCR.

Return ONLY valid JSON.

Schema:

{
  "items": [
    {
      "name": "",
      "amount": 0,
      "category": "Food"
    }
  ],
  "date": "YYYY-MM-DD"
}

Rules:

1. Extract only purchased items.
2. Ignore:
   - SGST
   - CGST
   - Service Charge
   - Round off
   - Grand Total
   - Total Qty

3. Use the final Amount column.

4. Merge multiline names:
   Example:
   Paneer Kurkura
   Tikka

   becomes:
   Paneer Kurkura Tikka

5. Category is usually Food.

6. Return ONLY JSON.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": receipt_text
            }
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()

