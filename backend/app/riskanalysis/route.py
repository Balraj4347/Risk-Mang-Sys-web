from flask import Blueprint
from app.auth import token_required

from app.riskanalysis.model import RiskAnalysis,ValueAtRisk
risk = Blueprint("risk",__name__)

@risk.route("/result",methods=['GET'])
@token_required
def get_risk():
    return RiskAnalysis().response()

@risk.route("/var",methods=['GET'])
@token_required
def get_var():
    return ValueAtRisk().response()




