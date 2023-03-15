from flask import current_app as app
from flask import  request
#importing neccessary library
# from passlib.hash import pbkdf2_sha256
import jwt
import json
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
        req_data = jwt.decode(AccessToken,app.config['SECRET_KEY'],algorithms=['HS256'])
        # pprint(req_data)
        try:
            portfolio = app.db.portfolios.find_one({"id":req_data['portfolio_id']})
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
        req_data = jwt.decode(AccessToken,app.config['SECRET_KEY'],algorithms=['HS256'])
        payload = json.loads(request.data)
        # pprint(payload)
        try:
            portfolio = app.db.portfolios.find_one({"id":req_data['portfolio_id']})
            if portfolio:
                initial_Stocks = portfolio['stocks']
                if len(payload)==0:
                    initial_Stocks={}
                else:
                    initial_Stocks.update(payload)
                # pprint(initial_Stocks)
            
            app.db.portfolios.update_one({"id":req_data["portfolio_id"]},{"$set":{"stocks":initial_Stocks,"stock_count":len(initial_Stocks)}})
            resp = tools.JsonResp({"msg":"Stock Updated","Stock":initial_Stocks},200)
        except Exception as e:
            pprint(e)
            return tools.JsonResp({"message":"An Exception Occured-> {}"},500)
        
        return resp


        
