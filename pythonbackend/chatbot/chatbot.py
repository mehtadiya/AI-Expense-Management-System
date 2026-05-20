
import pickle

# load trained model
model = pickle.load(open("intent_model.pkl", "rb"))

# load vectorizer
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))


def detect_intent(text):
# This function takes user input text.
    text_vec = vectorizer.transform([text])
    # This converts the user sentence into TF-IDF vector format.
    # aaya transform etle use kryu bcz already training thai gai che so learn karavni jarur nathi etle fit() ni jarur nathi

    prediction = model.predict(text_vec)[0]
    # The trained model predicts the intent class.
    # [0] is used because predict() returns a list like:

    return prediction