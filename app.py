from flask import Flask, request, jsonify
from flask_cors import CORS
import smiley

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Smiley backend is running 🚀"

@app.route("/command", methods=["POST"])
def command():
    data = request.json
    text = data.get("text", "")

    reply, mood = smiley.handle_command(text)

    return jsonify({
        "reply": reply,
        "mood": mood
    })

if __name__ == "__main__":
    app.run(debug=True)
