from flask import Flask, jsonify
from flask_cors import CORS
from crypto_data import get_crypto

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Welcome to the Crypto API! 🚀 Try /crypto/bitcoin"

@app.route('/crypto/<coin>')
def crypto_info(coin):
    data = get_crypto(coin)
    return jsonify(data)  

if __name__ == '__main__':
    app.run(debug=True)
