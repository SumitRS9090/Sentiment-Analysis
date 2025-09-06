from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

# Initialize Flask
app = Flask(__name__)
CORS(app)  # Enable CORS so React can talk to Flask

# Load model and vectorizer
model = joblib.load("sentiment_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Get JSON data from request
        data = request.get_json()
        text = data.get("text", "")

        if not text.strip():
            return jsonify({"error": "Empty text provided"}), 400

        # Transform text using vectorizer
        features = vectorizer.transform([text])
        
        # Predict sentiment
        prediction = model.predict(features)[0]

        return jsonify({"sentiment": prediction})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
