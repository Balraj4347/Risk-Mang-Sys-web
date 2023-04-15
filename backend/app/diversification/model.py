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

#Plotly for plotting data and sending json
import plotly
import plotly.express as px
import plotly.graph_objects as go

#importing dev related lib
from pprint import pprint

class Diversification:

    def __init__(self) -> None:
        self.StockData = self.get_stock_data()
        self.tickers = list(self.StockData.keys())
        self.yf_data = tools.get_historical_data(self.tickers,'3mo','1d')
        self.stockDf = self.get_stock_df(self.tickers,self.yf_data)
        self.yf_adj_close = self.get_adj_close_df(self.yf_data,self.tickers)
        self.yf_returns = self.get_returns (self.yf_adj_close)
        self.snp_data = tools.get_historical_data('^GSPC','3mo','1d')
        self.combined_df = self.get_combined_df()
        self.mean_returns = self.yf_returns.mean()
        self.cov_matrix = self.yf_returns.cov()

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

    def get_adj_close_df(self,data,tickers):
        adj_close = pd.DataFrame()
        for x in tickers:
            adj_close[x]= data[x]['Adj Close']
        return adj_close
    
    def get_returns(self,adj_close_df):
        returns = adj_close_df.pct_change().dropna()
        return returns
    
    def get_combined_df(self):
        adj_close_snp = self.snp_data['Adj Close']
        invested_amt = np.array([x['quantity']*x['price'] for x in self.StockData.values()])
        weights = invested_amt/np.sum(invested_amt)
        stocks_returns = self.yf_adj_close.pct_change().dropna()
        ret = pd.DataFrame()
        ret['Portfolio'] = stocks_returns.dot(weights)
        ret['SnP500'] = adj_close_snp.pct_change().dropna()
        return ret
    
    def sector_wise_pie_plot_json(self):
        sectorsDF = self.stockDf.groupby('sector').size().to_frame('count')
        sectorsDF['weight']= sectorsDF['count']/len(self.tickers)*100

        fig = px.pie(sectorsDF,values='weight',names=sectorsDF.index)
        fig.update_traces(textposition='inside', textinfo='percent+label')
        fig.update_layout(
            title = "Composition of Stocks in term of sectors",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
            
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)
        
    def adj_close_corr_plot(self):
        corr_mat = self.yf_adj_close.corr()
        fig = px.imshow(corr_mat,text_auto=True,aspect=True)
        fig.update_layout(
            title="Correlation between closing prices of stocks",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)

    def simulate_portfolio_weight_df(self,num_sim):
        num_portfolios = num_sim
        tickers = self.tickers
        results = np.zeros((4+len(tickers)-1,num_portfolios))
        for i in range(num_portfolios):
            #select random weights for portfolio holdings
            weights = np.array(np.random.random(len(tickers)))
            #rebalance weights to sum to 1
            weights = weights/ np.sum(weights)
        
            #calculate portfolio return and volatility(standard deviation)
            portfolio_return = np.sum(self.mean_returns * weights) * 252
            portfolio_std_dev = np.sqrt(np.dot(weights.T,np.dot(self.cov_matrix, weights)))*np.sqrt(252)
        
            #store results in results array
            results[0,i] = portfolio_return
            results[1,i] = portfolio_std_dev
            #store Sharpe Ratio (return / volatility) - risk free rate element excluded for simplicity
            results[2,i] = ( results[0,i] )/ (results[1,i] )
            #iterate through the weight vector and add data to results array
            for j in range(0,len(tickers)):
                results[j+3,i] = weights[j]
        columns=['ret','stdev','sharpe']
        for x in tickers:
            columns.append(x)
        results_frame = pd.DataFrame(results.T,columns=columns)
        return results_frame

    def simulate_portfolio_weight_resp(self,simulated_rest):
        
        tickers= self.tickers
        maxSharpe = simulated_rest.iloc[simulated_rest['sharpe'].idxmax()]
        minVolatility = simulated_rest.iloc[simulated_rest['stdev'].idxmin()]
        return{
            "MaxSharpe Value":maxSharpe['sharpe'],
            "MaxSharpe Weight Dist": dict({x:maxSharpe[x] for x in tickers}),
            "Min volatility":minVolatility['stdev'],
            "MinVolatility Weight Dist":dict({x:minVolatility[x] for x in tickers}),
        }
    
    def simult_weight_corr_plot_json(self,simulated_rest ):
        fig = px.scatter(simulated_rest,x='ret',y='stdev',color='sharpe',trendline="ols")
        fig.update_layout(
            title="Correlation between returns and std dev for simulated weights",
            xaxis_title= "Returns",
            yaxis_title= "Std Deviation / Volatality",
            # height=600,
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)
    
    def calculate_beta_metrics(self):
        snp500_returns = self.combined_df['SnP500']
        market_std = self.combined_df['SnP500'].std()
        stock_std = list(self.yf_returns.std())
        tickers = self.tickers
        correlation_stocks_to_snp = {}
        for x in tickers:
            corr = self.yf_returns[x].corr(snp500_returns)
            correlation_stocks_to_snp[x]=corr

        betas = {}
        for b,i,x in zip(correlation_stocks_to_snp.values(), stock_std,tickers):
            beta_calc = b * (i/market_std)
            betas[x]=beta_calc

        return{
            "Stock Market Correlation":correlation_stocks_to_snp,
            "Betas":betas
        }

    def beta_hist_plot_json(self,betas) :
        betas_df = pd.DataFrame(list(zip(self.tickers,betas)),columns=['ticker','betas'])
        betas_df.set_index('ticker',inplace=True)   
        
        fig= px.bar(betas_df,x=betas_df.index,y='betas')
        fig.update_layout(
            title="Betas Value for the Stocks in Portfolio",
            xaxis_title = "Stock",
            yaxis_title="Betas Value",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
            height=600
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)

    def response(self):

        sector_dist_plot = self.sector_wise_pie_plot_json()
        adj_close_corr_plot = self.adj_close_corr_plot()
        simulated_rest = self.simulate_portfolio_weight_df(3000)
        weight_simulation_res = self.simulate_portfolio_weight_resp(simulated_rest)
        sim_weight_plot = self.simult_weight_corr_plot_json(simulated_rest)
        market_corr_beta_resp = self.calculate_beta_metrics()
        beta_hist_plot = self.beta_hist_plot_json(market_corr_beta_resp['Betas'].values())
        return {
            "SectorDistPlot":sector_dist_plot,
            "AdjCloseCorrPlot":adj_close_corr_plot,
            "WeightSimulationData":weight_simulation_res,
            "SimulWeightPlot":sim_weight_plot,
            "BetasMetricData":market_corr_beta_resp,
            "BetasHistPlot":beta_hist_plot,
            "DataRecieved":True,
        }