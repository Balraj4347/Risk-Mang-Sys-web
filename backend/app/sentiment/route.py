from flask import Blueprint
from app.auth import token_required

from app.sentiment.model import Sentiment
sentiment = Blueprint("senti",__name__)

@sentiment.route("/result",methods=['GET'])
@token_required
def get_result():
    return Sentiment().response()

# @diversification.route("/var",methods=['GET'])
# @token_required
# def get_var():
#     return Diversification().response()




