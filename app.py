from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from model import model
import json

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def index():
    return "Moodacado model backend"

@app.route("/model", methods=["POST"])
def get_model_pred():

    if request.is_json:
        try:
            req = request.get_json()
            features_list = req.get("audio_features")
            result_str = model.prediction(features_list)
            result = json.loads(result_str)
            return result["0"]
        except Exception as e:
            print(e)
            return "Error getting prediction", 400
    else:
        return "Request body must be a JSON object"

if __name__ == '__main__':
    app.run(debug=True)
