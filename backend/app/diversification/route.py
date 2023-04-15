from flask import Blueprint
from app.auth import token_required

from app.diversification.model import Diversification
diversification = Blueprint("diversify",__name__)

@diversification.route("/result",methods=['GET'])
@token_required
def get_result():
    return Diversification().response()

# @diversification.route("/var",methods=['GET'])
# @token_required
# def get_var():
#     return Diversification().response()




