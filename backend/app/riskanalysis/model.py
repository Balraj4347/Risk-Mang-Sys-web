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
import scipy.stats

#Plotly for plotting data and sending json
import plotly
import plotly.express as px
import plotly.graph_objects as go

#importing dev related lib
from pprint import pprint

class RiskAnalysis():
    def __init__(self) -> None:
        self.StockData = self.get_stock_data()
        self.tickers = list(self.StockData.keys())
        self.yf_data = tools.get_historical_data(self.tickers,'3mo','1d')
        self.stockDf = self.get_stock_df(self.tickers,self.yf_data)
        self.yf_adj_close = self.get_adj_close_df(self.yf_data,self.tickers)
        self.yf_returns = self.get_returns (self.yf_adj_close)
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
    
    def stockBoxPlotJson(self):
        fig = px.box(self.yf_returns)
        fig.update_layout(
            title="Box Plot Showing the spread/ distribution of returns of the Stocks",
            xaxis_title = "Stock ",
            yaxis_title = "Returns ",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)
    
    def portfolioBoxPlotJson(self):
        fig = px.box(self.combined_df)
        fig.update_layout(
            title="Box Plot Showing the spread/ distribution of returns of Portfolio vs Market(SnP500)",
            xaxis_title = "Stock ",
            yaxis_title = "Returns ",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)

    def stockRiskVsReturnJson(self):
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=self.yf_returns.mean().values,
            y=self.yf_returns.std().values,
            marker={"size":15},
            mode = "markers+text",
            text=self.yf_returns.columns,
            textposition="top center"))

        fig.update_layout(
            title = "Returns vs Risk Scatter Plot of the stocks in Portfolio",
            xaxis_title = "Returns",
            yaxis_title = "Risk",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
        )
        plotjson = plotly.io.to_json(fig)
        return json.loads(plotjson)
    
    def possible_value_change(self,confInt):
        return self.yf_returns.quantile(confInt)
    
    def risk_market_comp(self):
        portfolioStd = self.combined_df['Portfolio'].std()
        SnP500Std = self.combined_df['SnP500'].std()
        trading_days = 252
        annualised_Portfolio_std = portfolioStd * np.sqrt(trading_days)
        annualised_SnP500_std = SnP500Std * np.sqrt(trading_days)
        Correlation_Coeff = scipy.stats.pearsonr(self.combined_df['Portfolio'],self.combined_df['SnP500'])[0]
        isRiskier = "Yes" if portfolioStd>SnP500Std else "No"
        return {
            "Portfolio Std dev":round(portfolioStd,5),
            "Market(SnP500) Std Dev":round(SnP500Std,5),
            "Annual Portfolio Std Dev":round(annualised_Portfolio_std,5),
            "Annual Market Std Dev":round(annualised_SnP500_std,5),
            "Pearsons Correlation Coeff": round(Correlation_Coeff,7),
            "is Risker Than Market": isRiskier
        }
    
    def risk_over_time_plot_json(self):
        rolling_std = self.combined_df.rolling(window=21).std().dropna()
        fig = go.Figure()
        fig.add_trace(
            go.Scatter(x=list(rolling_std.index),y=list(rolling_std['Portfolio'].values),name = "Portfolio")
        )
        fig.add_trace(
            go.Scatter(x=list(rolling_std.index),y=list(rolling_std['SnP500'].values),name = "SnP500")
        )
        fig.update_layout(
            title="Portfolio vs SnP500 Risk (Calculated Over a window of 21 days) Over time ",
            xaxis_title = "Date/ Time",
            yaxis_title = "Risk / Standard Deviation",
            hoverlabel=dict(
            bgcolor='grey'
            ),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
            hovermode='x unified',
            height=600

        )
        Plot_Json = plotly.io.to_json(fig)
        return json.loads(Plot_Json)
    
    def sharpe_computation(self):
        annulised_sharpe_ratio = (self.combined_df.mean() * 252) / (self.combined_df.std() * np.sqrt(252))
        return annulised_sharpe_ratio.round(decimals=5).to_dict()
        
    def response(self):
        lost_value_worst_5 = self.possible_value_change(0.05)*100
        gained_value_best_95 = self.possible_value_change(0.95)*100
        market_comp_box_plot = self.portfolioBoxPlotJson()
        stock_return_box_plot_resp = self.stockBoxPlotJson()
        stock_riskvsreturn_resp = self.stockRiskVsReturnJson()
        marketRiskComp_resp = self.risk_market_comp()
        risk_over_time_plot = self.risk_over_time_plot_json()
        sharpe_resp = self.sharpe_computation()
        return tools.JsonResp({
            "dataReceived":True,
            "best_gained_95":gained_value_best_95.to_dict(),
            "lost_worst_5":lost_value_worst_5.to_dict(),
            "MarketComparision":marketRiskComp_resp,
            "SharpeRatioData":sharpe_resp,
            "MarketBoxPlot": market_comp_box_plot,
            "StockRiskBoxPlot":stock_return_box_plot_resp,
            "StockRiskBoxPlot":stock_return_box_plot_resp,
            "RiskVsReturnPlot":stock_riskvsreturn_resp,
            "RiskOverTime":risk_over_time_plot
        },200)
    

class ValueAtRisk :
    def __init__(self) -> None:
        self.metaData = RiskAnalysis()
        self.covMatrix = self.metaData.yf_returns.cov()
        self.starting_price = self.get_starting_prices()

    def get_starting_prices(self):
        starting_price = {}
        for x in self.metaData.tickers:
            starting_price[x] = self.metaData.yf_data[x]['Open'][0]
        return starting_price
    
    ## Variance Co-Variance Var Functions
    def cov_heatmap_plot_json(self):
        fig = px.imshow(self.covMatrix,aspect='auto',text_auto=True)
        fig.update_layout(
            title="Covariance Heatmap of stocks",
             plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
        )
        PlotJson=  plotly.io.to_json(fig)
        return json.loads(PlotJson)
    
    def var_cov_var_metrics(self,confidence_level):
        initial_invested_amt = np.sum(self.metaData.stockDf['invested_amt'])
        avg_returns = self.metaData.yf_returns.mean()
        portfolio_returns_mean = avg_returns.dot(self.metaData.stockDf['weight'])
        portfolio_returns_std = np.sqrt(self.metaData.stockDf['weight'].dot(self.covMatrix).dot(self.metaData.stockDf['weight']))
        mean_investment = (1+portfolio_returns_mean)*initial_invested_amt
        stdev_investment = portfolio_returns_std * initial_invested_amt
        initial_invested_amt = np.sum(self.metaData.stockDf['invested_amt'])

        from scipy.stats import norm
        z_score = norm.ppf(confidence_level, mean_investment, stdev_investment)
        Var_cov = initial_invested_amt-z_score
        var_array = []
        num_days = int(15)
        for x in range(1, num_days+1):    
            var_array.append(np.round(Var_cov * np.sqrt(x),2))
        return {
            "Average Returns": avg_returns.round(decimals=4).to_dict(),
            "Portfolio Returns Mean":float(portfolio_returns_mean),
            "Portfolio Returns Std Dev":float(portfolio_returns_std),
            "Investment Mean":float(mean_investment),
            "Investment Std":float(stdev_investment),
            "LeftTailCuttOff":z_score,
            "ValueAtRisk":Var_cov,
            "ValueAtRisk_15days":var_array,
            "InitialInvst":float(initial_invested_amt)
        }

    def var_cov_norm_plot_json(self,cutoff,mean,initial_invested_amt):
        
        xvalues = self.metaData.combined_df['Portfolio'].apply(lambda x: x*initial_invested_amt+ mean).values
        
        import plotly.figure_factory as ff
        fig = ff.create_distplot(hist_data=[xvalues], group_labels=["investment value"],show_hist=False)
        fig.add_vline(x=cutoff,line_width=3,line_color="red",annotation_text="Z-score: {}".format(cutoff), annotation_position="bottom right",)
        fig.update_layout(
            title="Distribution of investment value over time ",
            yaxis_title="Frequency",
            xaxis_title="Investment Value",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
            height=600
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)
    
    def var_cov_nday_plot_json(self,var_array):
        fig = px.line(y=var_array)
        fig.update_traces(mode="markers+lines",hovertemplate='Day: %{x} <br>VAR: %{y}')
        fig.update_layout(
            title="Value at Risk (var-Cov method over N-day time period)",
            xaxis_title = "days",
            yaxis_title = "Value at risk",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
            height=600
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)

    # MonteCarlo Var Functions
    def stock_monte_carlo(self,start_price,days,mu,sigma):
        ''' This function takes in starting stock price, days of simulation,mu,sigma, and returns simulated price array'''
        dt = 1/days
        # Define a price array
        price = np.zeros(days)
        price[0] = start_price
        
        # Schok and Drift
        shock = np.zeros(days)
        drift = np.zeros(days)
        
        # Run price array for number of days
        for x in range(1,days):
            
            # Calculate Schock
            shock[x] = np.random.normal(loc=mu * dt, scale=sigma * np.sqrt(dt))
            # Calculate Drift
            drift[x] = mu * dt
            # Calculate Price
            price[x] = price[x-1] + (price[x-1] * (drift[x] + shock[x]))
            
        return price
    
    def plotly_monteCarlo_var(self,ticker,r,fig):
        days = 365
        mu = self.metaData.yf_returns[ticker].mean()
        sigma = self.metaData.yf_returns[ticker].std()
        days_list = list(range(1,days))
        # fg = go.Figure()
        for run in range(100):
            data = self.stock_monte_carlo(self.starting_price[ticker],days,mu,sigma)
            fig.append_trace(go.Scatter(y=data,x=days_list),row=r,col=1)
            # ax.plot(stock_monte_carlo(starting_price[ticker],days,mu,sigma))  
        
        fig.update_xaxes(title_text="Days", row=r, col=1)
        fig.update_yaxes(title_text="Simulated Price", row=r, col=1)  
        fig.update()

    def monetcarlo_stock_plot_json(self):
        from plotly.subplots import make_subplots
        tickers = self.metaData.tickers
        fig = make_subplots(rows=len(tickers),cols=1,subplot_titles=["MonetCarlo Simulation for {}".format(x) for x in tickers])
        for i,x in enumerate(tickers):
            self.plotly_monteCarlo_var(x,i+1,fig)

        fig.update_layout(
            title="Montecarlo Simulation for every Stocks (100 Simulations each) ",
            showlegend=False,
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
            height=2700,
            
        )

        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)

    def plot_hist_monte_Carlo(self,ticker,fig,rowN):
        runs = 1000
        simulations = np.zeros(runs)
        days = 365
        
        mu = self.metaData.yf_returns[ticker].mean()
        sigma = self.metaData.yf_returns[ticker].std()
        for run in range(runs):
            simulations[run]= self.stock_monte_carlo(self.starting_price[ticker],days,mu,sigma)[days-1]
        # 99% confidence inteval
        q = np.percentile(simulations,1)
        
        fig.append_trace(go.Histogram(x=simulations,xbins={"size":0.2}),row=rowN,col=1)
        xlast = np.max(simulations)
        
        
        
        PlotTxt = "{}  --> Start Price : {},\
        Mean Price : {},\
        Var(0.99): {},\
        Z-Score(0.99): {}\
        ".format(ticker,self.starting_price[ticker],simulations.mean(),self.starting_price[ticker]-q,q)
        
        
        # Plot a line at the 1% quantile result
        
        fig.add_shape(
            go.layout.Shape(type='line', xref='x', yref='y domain',
                            x0=q, y0=0, x1=q, y1=0.9),row=rowN, col=1)


        fig.update_xaxes(title="Prices simlated by MonteCarlo Var",row=rowN,col=1)
        fig.update_yaxes(title="Count",row=rowN,col=1)
        fig.add_annotation(xref='x domain',
                    yref='y domain',
                    x=0.01,
                    y=0.99,
                    text=PlotTxt,
                    showarrow=False,
                    row=rowN, col=1)

        return [self.starting_price[ticker],simulations.mean(),self.starting_price[ticker]-q,q]
    
    def montecarlo_dis_hist_json(self):
        from plotly.subplots import make_subplots
        tickers = self.metaData.tickers
        fig = make_subplots(rows=len(tickers),cols=1,subplot_titles=["Final price distribution for {} Stock after 365 days".format(x) for x in tickers])
        simulation_result = {x:[] for x in tickers}
        for i,x in enumerate(tickers):
            simulation_result[x]=  self.plot_hist_monte_Carlo(x,fig,i+1)
            
        fig.update_layout(
            title="Distribution of the Monetcarlo Simulation Prices and 99%  confidence interval mark",
            showlegend= False,
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
            height=3200
        )
        plotJson = plotly.io.to_json(fig)
        
        return {"plotJson":json.loads(plotJson),"simulation_result":simulation_result}
    
    def response(self):

        cov_heatmap_resp = self.cov_heatmap_plot_json()
        #Variance Covariance
        var_cov_var_metrics_data = self.var_cov_var_metrics(0.05)
        var_cov_norm_plot = self.var_cov_norm_plot_json(
            var_cov_var_metrics_data['LeftTailCuttOff'],
            var_cov_var_metrics_data['Investment Mean'],var_cov_var_metrics_data['InitialInvst'])
        var_cov_nday_plot = self.var_cov_nday_plot_json(var_cov_var_metrics_data['ValueAtRisk_15days'])
        montecarlo_simulation_plot = self.monetcarlo_stock_plot_json()
        montecarlo_var_hist_plot =self.montecarlo_dis_hist_json()
        #MonteCarlo

        return {
            "receivedData":True,
            "CovHeatmapPlot":cov_heatmap_resp,
            "CovVarMetricsData":var_cov_var_metrics_data,
            "VarCovNormPlot":var_cov_norm_plot,
            "VarCovNdayPlot":var_cov_nday_plot,
            "MonteCarloSimPlot":montecarlo_simulation_plot,
            "MonteCarloHistPlot":montecarlo_var_hist_plot["plotJson"],
            "MonetCarloSimulationResult":montecarlo_var_hist_plot["simulation_result"]
            }