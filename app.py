from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from flask_cors import CORS
import pickle


# Dropping unnecessary columns


app = Flask(__name__)
CORS(app)

# Load the model, scaler, and label encoder
with open('fraud_model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)
with open('type_encoder.pkl', 'rb') as f:
    type_encoder = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Receive input JSON
        data = request.get_json()
        df = pd.DataFrame([data])

        # Validate transaction_ratio exists in the input
        if 'transaction_ratio' not in df.columns:
            return jsonify({"error": "Missing transaction_ratio in input"}), 400

        # Logic to calculate 'is_high_ratio'
        df['is_high_ratio'] = (df['transaction_ratio'] >= 0.90).astype(int)

        # Predict fraud based on is_high_ratio
        prediction = 1 if df['is_high_ratio'].iloc[0] == 1 else 0
        probability = 1.0 if prediction == 1 else 0.0  # Dummy probability for rule-based detection

        # Return the response
        return jsonify({
            "fraud_probability": f"{probability:.2%}",
            "prediction": prediction,
            "transaction_details": {
                "amount": data.get('amount', 0),
                "type": data.get('type', 'UNKNOWN')
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400
if __name__ == '__main__':
    app.run(debug=True)
