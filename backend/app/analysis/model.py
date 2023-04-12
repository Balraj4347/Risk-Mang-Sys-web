from flask import current_app as app
from flask import  request
#importing neccessary library
# from passlib.hash import pbkdf2_sha256
import jwt
from yahooquery import Ticker
import matplotlib.pyplot as plt
#importing utils and auth tools
import app.utils as tools
import pandas as pd

#importing dev related lib
from pprint import pprint

class Analysis:

    def __init__(self):
        self.StockData = self.get_stock_data()
        self.tickers = list(self.StockData.keys())
        self.snpTicker = '^GSPC'
        self.yf_data = tools.get_historical_data(self.tickers,'3mo','1d')
        # self.snp500_data = tools.get_historical_data(self.snpTicker,'6mo','1d')
        self.stockDf = self.get_stock_df(self.tickers,self.yf_data)
        self.yf_adj_close = self.get_adj_close_df(self.yf_data,self.tickers)
        self.yf_returns = self.get_returns (self.yf_adj_close)
    
    def get_stock_data(self):
        AccessToken = request.headers.get('AccessToken')
        
        res_user = jwt.decode(AccessToken,app.config['SECRET_KEY'],algorithms=['HS256'])
        # pprint(res_user)
        try:
            portfolio = app.db.portfolios.find_one({"id":res_user['portfolio_id']})
            
            if portfolio['stock_count'] == 0:
                return tools.JsonResp({"message":"User has no stocks in the portfolio"},204)
            
            stocks = dict(portfolio['stocks'])

        except Exception as e:
            pprint("exception in tickers extraction")
            pprint(e)
            return tools.JsonResp({"message":"An Exception Occured-> {}"},500)
        
        return stocks

    def get_adj_close_df(self,data,tickers):
        adj_close = pd.DataFrame()
        for x in tickers:
            adj_close[x]= data[x]['Adj Close']
        return adj_close
    
    def get_returns(self,adj_close_df):
        returns = adj_close_df.pct_change().dropna()
        return returns

    def adjClosePrices_json(self):
        adj_close_resp = self.yf_adj_close.round(decimals=5)
        adj_close_resp.index = adj_close_resp.index.format()

        return tools.JsonResp({"adj_close_data":adj_close_resp.to_dict()},200)
    
    def get_stock_df(self,tickers,yf_data):
        close_last = []
        market_cap = []
        stock_name = []
        sectors = []
        country = []

        for x in tickers:
            tickerObj = Ticker(x)
            stock_name.append( self.StockData[x]['name'])
            market_cap.append(tickerObj.price[x]['marketCap'])
            sectors.append(tickerObj.summary_profile[x]['sector'])
            country.append(tickerObj.summary_profile[x]['country'])
            close_last.append(yf_data[x]['Close'].iloc[-1])
                        
        stockDf = pd.DataFrame()
        stockDf['ticker']= tickers
        stockDf['Name']= stock_name
        stockDf['quantity']=[x['quantity'] for x in self.StockData.values()]
        stockDf['buying_price']=[x['price'] for x in self.StockData.values()]
        stockDf['invested_amt']= stockDf['quantity']*stockDf['buying_price']
        total_investment = stockDf['invested_amt'].sum()
        stockDf['weight']= stockDf['invested_amt']/total_investment
        stockDf['sector']= sectors
        stockDf['current_holding_value']= close_last*stockDf['quantity']
        stockDf['market_cap']= market_cap
        stockDf['Profit/loss']= stockDf['current_holding_value']-stockDf['invested_amt']
        stockDf['Return of Invest']= stockDf['current_holding_value']/stockDf['invested_amt']
        stockDf['Country']= country
        stockDf.set_index('ticker',inplace=True)
        pprint(stockDf)
        return stockDf
    
    def dailyReturns_json(self):
        returns_resp = self.yf_returns.round(decimals=5)
        returns_resp.index = self.yf_returns.index.format()

        return tools.JsonResp({"daily_returns_data":returns_resp.to_dict()},200)
        
