from flask import current_app as app
from flask import  request

#importing neccessary library
# from passlib.hash import pbkdf2_sha256
import jwt

#importing utils and auth tools
import app.utils as tools
import pandas as pd
import json
import numpy as np
import yfinance as yf
from urllib.request import urlopen, Request
from bs4 import BeautifulSoup
import datetime
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

#Plotly for plotting data and sending json
import plotly
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots 

#importing dev related lib
from pprint import pprint


class Sentiment:

    def __init__(self) -> None:
        self.StockData = self.get_stock_data()
        self.tickers = list(self.StockData.keys())
        self.website_url = 'https://finviz.com/quote.ashx?t='
        self.dataset = self.get_news_senti_dataset()
        self.stock_df = self.get_stock_df_relevent()
        self.dataset_company = self.get_company_senti_df()
        
        nltk.download('vader_lexicon')


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

    def get_news_senti_dataset(self):
        news_tables = {}
        for ticker in self.tickers:
            url = self.website_url + ticker

            req = Request(url=url, headers={'user-agent': 'my-scrape'})
            response = urlopen(req)
            html = BeautifulSoup(response,'html')
            news_data = html.find(id='news-table')
            news_tables[ticker] = news_data
        parsed_data = []

        for ticker, news_table in news_tables.items():
            for row in news_table.findAll('tr'):
                title = row.a.text
                date_data = row.td.text.split(' ')

                if len(date_data) == 1:
                    time = date_data[0][0:7]
                else:
                    date = datetime.datetime.strptime(date_data[0], '%b-%d-%y').strftime('%Y/%m/%d')
                    time = date_data[1][0:7]
                parsed_data.append([ticker, date, time, title])
        dataset = pd.DataFrame(parsed_data, columns=["Company", "Date", "Time", "News Headline"])
        sia=SentimentIntensityAnalyzer()
        dataset['Compound'] = dataset['News Headline'].apply(lambda headline: sia.polarity_scores(headline)['compound'])
        def sentiment_declareation(sentiment_value):
            if -0.2 < sentiment_value <= 0.2:
                return 'neu'
            elif 0.2 < sentiment_value <= 1.0:
                return 'pos'
            elif -1.0 <= sentiment_value <= -0.2:
                return 'neg'
        dataset['Sentiment'] = dataset['Compound'].apply(lambda value: sentiment_declareation(value))
        dataset['Date'] = pd.to_datetime(dataset.Date).dt.date
        return dataset

    def get_stock_df_relevent(self):
        max_min_date = self.dataset.groupby(['Company']).agg({'Date': [np.min,np.max]})
        self.dataset['MaxDate'] = self.dataset.groupby('Company').Date.transform('max')
        self.dataset['MinDate'] = self.dataset.groupby('Company').Date.transform('min')

        company_early_late_dates = {}

        for index, row in self.dataset.iterrows():
            if row['Company'] in company_early_late_dates:
                company_early_late_dates[row['Company']]['early'] = row['MinDate']
                company_early_late_dates[row['Company']]['late'] = row['MaxDate']
            else:
                company_early_late_dates[row['Company']] = {'early': None, 'late': None}

        stock_df = {}

        for key, value in company_early_late_dates.items():
            
            tmp_df = yf.download(key, start=value['early'], end=value['late'])
            tmp_df['date'] = tmp_df.index
            # pprint(tmp_df)
            stock_df[key]= tmp_df
        
        return stock_df
    
    def get_company_senti_df(self):
        result_by_companies = {}
        
        for index, row in self.dataset.iterrows():
            if row['Company'] in result_by_companies:
                if row['Sentiment'] == 'neu':
                    result_by_companies[row['Company']]['neu'] +=1
                if row['Sentiment'] == 'pos':
                    result_by_companies[row['Company']]['pos'] +=1
                if row['Sentiment'] == 'neg':
                    result_by_companies[row['Company']]['neg'] +=1
            else:
                result_by_companies[row['Company']] = {'neg': 0, 'neu': 0, 'pos': 0}
        dataframe_list = []
        for key, value in result_by_companies.items():
            dataframe_list.append([key, value['neg'], value['neu'], value['pos']])


        dataset_company = pd.DataFrame(dataframe_list, columns=["Company", "Neg", "Neu", "Pos"])
        return dataset_company

    def total_senti_plot(self):
        pos_senti = np.sum(self.dataset_company['Pos'])
        neg_senti = np.sum(self.dataset_company['Neg'])
        neu_senti = np.sum(self.dataset_company['Neu'])
        
        labels = ['Positive','Negitive','Neutral']
        values = [pos_senti,neg_senti,neu_senti]

        fig = go.Figure(data=[go.Pie(labels=labels, values=values,textinfo='label+percent')])
        fig.update_layout(
            title="Overal Sentiment of the Portfolio",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)
        

    def company_senti_dist_plot_json(self):
        fig= px.bar(self.dataset_company,x='Company',y=['Neg','Neu','Pos'],barmode='group')
        fig.update_layout(
            title='Company Wise Count of Different Headlines Sentiment',
            xaxis_title = 'Stock',
            yaxis_title = 'Frequency',
            height=500,
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white"
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)
    
    def comp_senti_hist_time_plot_json(self):
        mean_df = self.dataset.groupby(['Company', 'Date']).mean(numeric_only=True)
        mean_df = mean_df.unstack()
        mean_df = mean_df.xs('Compound', axis='columns').transpose()
        fig= px.bar(mean_df,x=mean_df.index,y=mean_df.columns,barmode='group')
        fig.update_layout(
            title='Time Series Sentiment Score of new Headline grouped by companies  ',
            xaxis_title = 'Date / Time ',
            yaxis_title = 'Sentiment Score',
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
            height=500
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)

    def company_specific_sentiment_visualization(self,company_name,r,fig):
        company_df = self.dataset[self.dataset['Company'] == company_name]
        temp = company_df.groupby(['Company', 'Date']).mean(numeric_only=True)
        # pprint(temp)
        temp= temp.unstack()
        # pprint(temp)
        temp = temp.xs('Compound', axis='columns').transpose()
        # pprint(temp)
        # pprint((temp[company_name].index))
        # pprint(temp[company_name].values)
        fig.append_trace(
            go.Scatter(
            x=list(temp[company_name].index),
            y=list(temp[company_name].values),name=company_name),row=r,col=1
        )
        fig.update_xaxes(title_text="Headline Date", row=r, col=1)
        fig.update_yaxes(title_text="Headline Sentiment", row=r, col=1)

    def comp_senti_time_plot_json(self):

        fig = make_subplots(rows=len(self.tickers),cols=1,subplot_titles=["Sentiment Trend for {}".format(x) for x in self.tickers])
        for i,ticker in enumerate(self.tickers):
            self.company_specific_sentiment_visualization(ticker,r=i+1,fig=fig)

        fig.update_layout(
            title="News Headline Sentiment Trend Over Time for the Stocks in Portfolio",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor= 'rgba(0,0,0,0)',
            font_color="white",
            height=1200
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)

    def company_specific_sentiment_and_stockclose_day_focus_dataframe(self,company_name, company_stock_dataframe):
        company_specific = self.dataset[self.dataset['Company'] == company_name]
        temp_company = company_specific.groupby(['Company', 'Date']).mean(numeric_only=True)
        
        temp_dataframe = temp_company.xs(key=company_name)
        temp_dataframe.reset_index(inplace=True)
        
        temp_dataframe['adjclose'] = temp_dataframe.Date.map(company_stock_dataframe.set_index('date')['Adj Close'].to_dict())

        return temp_dataframe

    def company_compound_adjclose_normalized(self,company_name, stock_senti_combined_df,r,fig):
        normalized_df=(stock_senti_combined_df-stock_senti_combined_df.mean(numeric_only=True))/stock_senti_combined_df.std(numeric_only=True)
        # pprint(normalized_df)
        fig.append_trace(
            go.Scatter(
            x=list(stock_senti_combined_df['Date']),
            y=list(normalized_df['Compound']),name="Sentiment {}".format(company_name)),row=r,col=1
        )
        fig.append_trace(
            go.Scatter(
            x=list(stock_senti_combined_df['Date']),
            y=list(normalized_df['adjclose']),name="adj close {}".format(company_name)),row=r,col=1
        )
        fig.update_xaxes(title_text="Date", row=r, col=1)
        fig.update_yaxes(title_text="Compound Score", row=r, col=1)

    def adjclose_senti_plot_json(self):
        stock_senti_combined_df = {}
        for ticker in self.tickers:
            stock_senti_combined_df[ticker] =self.company_specific_sentiment_and_stockclose_day_focus_dataframe(ticker,self.stock_df[ticker])
        
        fig = make_subplots(rows=len(self.tickers),cols=1,subplot_titles=["Sentiment Trend for {}".format(x) for x in self.tickers])
        for i,ticker in enumerate(self.tickers):
            self.company_compound_adjclose_normalized(ticker,stock_senti_combined_df[ticker],r=i+1,fig=fig)

        fig.update_layout(
            title="Normalised Adj Close price along sentiment Trend Over Time for the Stocks in Portfolio",
            plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor= 'rgba(0,0,0,0)',
                font_color="white",
                hovermode='x unified',
                hoverlabel=dict(
            bgcolor='grey'
            ),
            height=1200
        )
        plotJson = plotly.io.to_json(fig)
        return json.loads(plotJson)
    
    def response(self):
        total_senti_plot = self.total_senti_plot()
        comp_senti_hist_plot = self.company_senti_dist_plot_json()
        comp_senti_hist_time_plot = self.comp_senti_hist_time_plot_json()
        comp_senti_time_plot = self.comp_senti_time_plot_json()
        adj_senti_plot = self.adjclose_senti_plot_json()
        return {
            "DataRecieved":True,
            "TotalSentiPlot":total_senti_plot,
            "CompanySentiData":self.dataset_company.set_index('Company').T.to_dict(),
            "CompHistPlot":comp_senti_hist_plot,
            "CompSentiHistTimePlot":comp_senti_hist_time_plot,
            "CompSentiTimePlot":comp_senti_time_plot,
            "AdjSentiPlot":adj_senti_plot
        }