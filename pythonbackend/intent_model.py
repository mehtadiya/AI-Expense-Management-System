import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle


data = {
    "text": [
        
        "show expenses",
        "show my expenses",
        "show all expenses",
        "give expenses",
        "display expenses",
        "list expenses",
        "show me my expenses",
        "list all my expenses",
        "give me expenses",
        "show expense history",
        "show today's expenses",
        "show monthly expenses",

        
        "add expense",
        "add new expense",
        "create expense",
        "i spent 50 rs in travel",
        "i spent 200 in food",
        "spent 40 on burger",
        "record expense",
        "log expense",
        "i spent money",
        "bought clothes for 500",
        "paid 100 rs for taxi",
        "spent 250 on groceries",

        
        "delete expense",
        "remove expense"
    ],

    "intent": [
        
        "GET_EXPENSES",
        "GET_EXPENSES",
        "GET_EXPENSES",
        "GET_EXPENSES",
        "GET_EXPENSES",
        "GET_EXPENSES",
        "GET_EXPENSES",
        "GET_EXPENSES",
        "GET_EXPENSES",
        "GET_EXPENSES",
        "GET_EXPENSES",
        "GET_EXPENSES",

       
        "ADD_EXPENSE",
        "ADD_EXPENSE",
        "ADD_EXPENSE",
        "ADD_EXPENSE",
        "ADD_EXPENSE",
        "ADD_EXPENSE",
        "ADD_EXPENSE",
        "ADD_EXPENSE",
        "ADD_EXPENSE",
        "ADD_EXPENSE",
        "ADD_EXPENSE",
        "ADD_EXPENSE",

        
        "DELETE_EXPENSE",
        "DELETE_EXPENSE"
    ]
}


df = pd.DataFrame(data)

vectorizer = TfidfVectorizer() 
# Term Frequency – Inverse Document Frequency
# It converts sentences into feature vectors based on word importance.(word jetlo imp hoi e hisabe convert kre number ma ,Where each number represents the importance of a word.)
X = vectorizer.fit_transform(df["text"])
# X becomes a TF-IDF matrix.

model = LogisticRegression()
model.fit(X, df["intent"])
# model.fit(features, labels)

pickle.dump(model, open("intent_model.pkl", "wb"))
# This saves the trained ML model to a file.
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))
# we save vectorizer Because during prediction we must convert user input to TF-IDF vectors using the same vocabulary used during training.

print("Intent model trained and saved successfully!")