from flask import Blueprint
from app.auth import token_required

from app.portfolio.model import Portfolio
portfolio = Blueprint("portfolio",__name__)

@portfolio.route("/",methods=['GET'])
@token_required
def get():
    return Portfolio().get_portfolio()

@portfolio.route("/updatestocks",methods=['POST'])
@token_required
def update_stocks():
    return Portfolio().updateStocks()

@portfolio.route("/dailyreturns",methods=['GET'])
@token_required
def daily_returns():
    return Portfolio().dailyReturns()

