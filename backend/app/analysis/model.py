from flask import current_app as app
from flask import  request
#importing neccessary library
# from passlib.hash import pbkdf2_sha256
import jwt
from yahooquery import Ticker

#importing utils and auth tools
import app.utils as tools
import pandas as pd
import json
import numpy as np

#importing dev related lib
from pprint import pprint

#Plotly for plotting data and sending json
import plotly
import plotly.express as px

class Analysis:

    def __init__(self):
        self.StockData = self.get_stock_data()
        self.tickers = list(self.StockData.keys())
        self.snpTicker = '^GSPC'
        self.yf_data = tools.get_historical_data(self.tickers,'3mo','1d')
        self.stockDf = self.get_stock_df(self.tickers,self.yf_data)
        self.yf_adj_close = self.get_adj_close_df(self.yf_data,self.tickers)
        self.yf_returns = self.get_returns (self.yf_adj_close)
        self.yf_cumm_returns = (self.yf_returns+1).cumprod()
    
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
        stockDf['invested_amt']= [x['price']*x['quantity'] for x in self.StockData.values()]
        
        total_investment = stockDf['invested_amt'].sum()
        stockDf['weight']= stockDf['invested_amt']/total_investment
        stockDf['sector']= sectors
        stockDf['current_holding_value']= close_last*stockDf['quantity']
        stockDf['market_cap']= market_cap
        stockDf['Profit/loss']= stockDf['current_holding_value']-stockDf['invested_amt']
        stockDf['Return of Invest']= stockDf['current_holding_value']/stockDf['invested_amt']
        stockDf['Country']= country
        stockDf.set_index('ticker',inplace=True)
        # pprint(stockDf)
        return stockDf
    
    def response(self):
        analysis_resp = self.get_metrics_resp()
        adj_close_resp = self.adjClosePrices_json()
        returns_resp = self.dailyReturns_json()
        cummulative_resp = self.get_cumm_return_json()
        return_metric_resp = self.get_return_metric_json()
        hist_json = self.returns_hist_plot()
        
        # pprint(analysis_resp)
        return tools.JsonResp({
            "analysis":analysis_resp,
            "adj_close_data":adj_close_resp.to_dict(),
            "returns_data":returns_resp.to_dict(),
            "cummulative_return_data":cummulative_resp.to_dict(),
            "return_metric":return_metric_resp,
            "hist_json":hist_json
        },200)

    def adjClosePrices_json(self):
        adj_close_resp = self.yf_adj_close.round(decimals=5)
        adj_close_resp.index = adj_close_resp.index.format()
        return adj_close_resp
        # return tools.JsonResp({"adj_close_data":adj_close_resp.to_dict()},200)
    
    def dailyReturns_json(self):
        returns_resp = self.yf_returns.round(decimals=5)
        returns_resp.index = self.yf_returns.index.format()
        return returns_resp
        # return tools.JsonResp({"daily_returns_data":returns_resp.to_dict()},200)
    
    def get_metrics_resp(self):
        initial_invested_amt = np.sum(self.stockDf['invested_amt'])
        current_portfolio_value = np.sum(self.stockDf['current_holding_value'])
        total_profit_loss = round(current_portfolio_value -  initial_invested_amt, 4)
        portfolio_roi =  round((total_profit_loss/initial_invested_amt)*100, 3)
        current_holdings = self.stockDf['current_holding_value'].to_dict()

        return {
            'Invested Amount':float(initial_invested_amt),
            'Current Portfolio value':float(current_portfolio_value),
            'Profit/Loss':float(total_profit_loss),
            'Return Of Invetment':float(portfolio_roi),
            'Current Holding':current_holdings
        }
    
    def get_return_metric_json(self):
        avg_returns_stocks = self.yf_returns.mean()*100
        annualised_return = ((avg_returns_stocks)*252)
        annualised_Volatality = self.yf_returns.std() * (252**0.5)*100
        return_per_unit_risk = (avg_returns_stocks/annualised_Volatality)*100
        
        avg_returns_stocks = tools.dict_values_to_float(avg_returns_stocks.to_dict())
        annualised_return = tools.dict_values_to_float(annualised_return.to_dict())
        annualised_Volatality = tools.dict_values_to_float(annualised_Volatality.to_dict())
        return_per_unit_risk = tools.dict_values_to_float(return_per_unit_risk.to_dict())
        import scipy
        skewness = {}
        for ticker in self.tickers:
            skewness[ticker]= scipy.stats.skew( self.yf_returns[ticker])
            skewness[ticker]= round(skewness[ticker],5)
        kurtosis = {}
        for ticker in self.tickers:
            kurtosis[ticker]= scipy.stats.kurtosis( self.yf_returns[ticker])
            kurtosis[ticker]= round(kurtosis[ticker],5)

        return {
            "Avg Returns Stocks":avg_returns_stocks,
            "Annualised Return":annualised_return,
            "Annualised Volatality":annualised_Volatality,
            "Return per Unit Risk":return_per_unit_risk,
            "Skewness":skewness,
            "Kurtosis":kurtosis
        }
    
    def get_cumm_return_json(self):
        cumm_ret_resp = self.yf_cumm_returns.round(decimals=5)
        cumm_ret_resp.index = self.yf_cumm_returns.index.format()
        return cumm_ret_resp
    
    def returns_hist_plot(self):
        import plotly.figure_factory as ff
        fig = ff.create_distplot([self.yf_returns[c] for c in self.yf_returns.columns], self.yf_returns.columns, show_hist=False,bin_size=150)
        fig.update_layout(
            title="Distribution Of Returns of stocks",
            xaxis_title="Returns",
            yaxis_title="Frequency",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
        )
        # fig.show()
        graphJSON = plotly.io.to_json(fig, pretty=True)
        
        return json.loads(graphJSON)


class SnPCompare:

    def __init__(self) -> None:
        self.StockData = self.get_stock_data()
        self.tickers = list(self.StockData.keys())
        self.yf_data = tools.get_historical_data(self.tickers,'3mo','1d')
        self.snp_data = tools.get_historical_data('^GSPC','3mo','1d')
        self.combined_df = self.get_combined_df()
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


    def get_combined_df(self):
        adj_close_yf = pd.DataFrame()
        for x in self.tickers:
            adj_close_yf[x]= self.yf_data[x]['Adj Close']
        adj_close_snp = self.snp_data['Adj Close']
        invested_amt = np.array([x['quantity']*x['price'] for x in self.StockData.values()])
        weights = invested_amt/np.sum(invested_amt)
        stocks_returns = adj_close_yf.pct_change().dropna()
        ret = pd.DataFrame()
        ret['Portfolio'] = stocks_returns.dot(weights)
        ret['Snp500'] = adj_close_snp.pct_change().dropna()
        return ret
    
    def get_combined_df_json (self):
        comb_returns = self.combined_df.round(decimals=5)
        comb_returns.index = self.combined_df.index.format()
        return comb_returns.to_dict()
    
    def get_cumm_return_json(self):
        cumm_return_df = (self.combined_df+1).cumprod()
        cumm_ret_resp = cumm_return_df.round(decimals=5)
        cumm_ret_resp.index = cumm_return_df.index.format()
        return cumm_ret_resp.to_dict()
    
    def returns_hist_plot(self):
        import plotly.figure_factory as ff
        fig = ff.create_distplot([self.combined_df[c] for c in self.combined_df.columns], self.combined_df.columns, show_hist=False,bin_size=150)
        fig.update_layout(
            title="Distribution Of Returns of Portfolio and Snp500",
            xaxis_title="Returns",
            yaxis_title="Frequency",
            hoverlabel=dict(
            bgcolor='grey'
            ),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
            hovermode='x unified',
        )
        # fig.show()
        graphJSON = plotly.io.to_json(fig, pretty=True)
        
        return json.loads(graphJSON)
    
    def get_return_metric_json(self):
        avg_returns_portfolio = self.combined_df.mean()*100
        annualised_return_portfolio = ((avg_returns_portfolio)*252)
        annualised_Volatality_portfolio = self.combined_df.std() * (252**0.5)*100
        return_per_unit_risk_port = (avg_returns_portfolio/annualised_Volatality_portfolio)*100
        
        avg_returns_portfolio = tools.dict_values_to_float(avg_returns_portfolio.to_dict())
        annualised_return_portfolio = tools.dict_values_to_float(annualised_return_portfolio.to_dict())
        annualised_Volatality_portfolio = tools.dict_values_to_float(annualised_Volatality_portfolio.to_dict())
        return_per_unit_risk_port = tools.dict_values_to_float(return_per_unit_risk_port.to_dict())
        
        import scipy
        skewness = {}
        for ticker in self.combined_df.columns:
            skewness[ticker]= scipy.stats.skew( self.combined_df[ticker])
            skewness[ticker]= round(skewness[ticker],5)
        kurtosis = {}
        for ticker in self.combined_df.columns:
            kurtosis[ticker]= scipy.stats.kurtosis( self.combined_df[ticker])
            kurtosis[ticker]= round(kurtosis[ticker],5)

        return {
            "Avg Returns ":avg_returns_portfolio,
            "Annualised Return ":annualised_return_portfolio,
            "Annualised Volatality ":annualised_Volatality_portfolio,
            "Return per Unit Risk ":return_per_unit_risk_port,
            "Skewness":skewness,
            "Kurtosis":kurtosis
        }
    

    def response(self):
        comb_returns = self.get_combined_df_json()
        cumm_returns = self.get_cumm_return_json()
        returnMetrics = self.get_return_metric_json()
        hist_plot = self.returns_hist_plot()
        return tools.JsonResp(
            {
                "combinedDf":comb_returns,
                "cummReturn":cumm_returns,
                "ReturnMetrics":returnMetrics,
                "histPlot":hist_plot
            }

            ,200)
