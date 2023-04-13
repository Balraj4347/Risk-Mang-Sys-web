from flask import Blueprint
from app.auth import token_required

from app.analysis.model import Analysis
from app.analysis.model import SnPCompare
analysis = Blueprint("analysis",__name__)


@analysis.route("/dailyreturns",methods=['GET'])
@token_required
def daily_returns():
    return Analysis().dailyReturns_json()

@analysis.route("/adjclose",methods=['GET'])
@token_required
def adj_close():
    return Analysis().adjClosePrices_json()

@analysis.route("/result",methods=['GET'])
@token_required
def analysis_response():
    return Analysis().response()

@analysis.route("/snp500",methods=['GET'])
@token_required
def snp_resp():
    return SnPCompare().response()