from flask import current_app as app
from flask import  request
#importing neccessary library
# from passlib.hash import pbkdf2_sha256
import jwt
import json
import yfinance as yf
import matplotlib.pyplot as plt
#importing utils and auth tools
import app.utils as tools
import app.auth as auth

#importing dev related lib
from pprint import pprint

class Portfolio:

    def __init__(self):
        self.defaults={
            "id": tools.randID(),
            "date_created": tools.nowDatetimeUTC(),
            "last_updated": tools.nowDatetimeUTC(),
            "user_id":"",
            "stocks":{},
            "stock_count":0
        }

    def create_portfolio(self,user_id):
        self.defaults.update({"user_id":user_id})
        portfolio= self.defaults
        try:
            if app.db.portfolios.find_one({"user_id":user_id}):
                return tools.JsonResp({"message":"Already Exists A portfolio for the User"},409)
            
            app.db.portfolios.insert_one(portfolio)
        except Exception as e:
            pprint(e)
            return
        
        return portfolio['id']
    
    def get_portfolio(self):
        AccessToken = request.headers.get('AccessToken')
        res_user = jwt.decode(AccessToken,app.config['SECRET_KEY'],algorithms=['HS256'])
        # pprint(req_data)
        try:
            portfolio = app.db.portfolios.find_one({"id":res_user['portfolio_id']})
            if portfolio:
                resp = tools.JsonResp(portfolio,200)
            else:
                resp = tools.JsonResp({"message":"No portfolio exists for the given data"},400)
        except Exception as e:
            pprint(e)
            return tools.JsonResp({"message":"An Exception Occured-> {}"},500)
        
        return resp

    def updateStocks(self):
        AccessToken = request.headers.get('AccessToken')
        req_user = jwt.decode(AccessToken,app.config['SECRET_KEY'],algorithms=['HS256'])
        payload = json.loads(request.data)
        # pprint(payload)
        try:
            portfolio = app.db.portfolios.find_one({"id":req_user['portfolio_id']})
            # if portfolio:
            #     initial_Stocks = portfolio['stocks']
            #     if len(payload)==0:
            #         initial_Stocks={}
            #     else:
            #         initial_Stocks.update(payload)
                # pprint(initial_Stocks)
            
            app.db.portfolios.update_one({"id":req_user["portfolio_id"]},{"$set":{"stocks":payload,"stock_count":len(payload)}})
            resp = tools.JsonResp({"msg":"Stock Updated","Stock":payload},200)
        except Exception as e:
            pprint(e)
            return tools.JsonResp({"message":"An Exception Occured-> {}"},500)
        
        return resp

    def dailyReturns(self):
        AccessToken = request.headers.get('AccessToken')
        
        res_user = jwt.decode(AccessToken,app.config['SECRET_KEY'],algorithms=['HS256'])
        # pprint(res_user)
        try:
            portfolio = app.db.portfolios.find_one({"id":res_user['portfolio_id']})
            
            if portfolio['stock_count'] == 0:
                return tools.JsonResp({"message":"User has no stocks in the portfolio"},204)
            
            stocks = dict(portfolio['stocks'])

        except Exception as e:
            pprint(e)
            return tools.JsonResp({"message":"An Exception Occured-> {}"},500)
        
        tickers = list(stocks.keys())
        tickers_str = " ".join(tickers)

        yf_data = yf.download(tickers_str,period='6mo',interval='1wk',group_by='ticker')
        daily_returns={}
        for x in tickers:
            temp=yf_data[x]['Adj Close'].pct_change().iloc[1:]
            df = dict(zip(temp.index.format(),temp.round(decimals=5)))
            # df = list(zip(temp.index.format(),temp))
            daily_returns[x]=df

        return tools.JsonResp({"daily_returns_data":daily_returns},200)
        
