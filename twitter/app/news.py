from newsapi import NewsApiClient
from newspaper import Article
import configparser
import re
import pandas as pd
import os

class news:
    def __init__(self, query=None, source=None) :
        #initalise api
        # config  = configparser.ConfigParser()
        # config.read('../grafluent.ini')
        news_key = os.getenv('news_API_key')

        self.newsapi = NewsApiClient(api_key=news_key)
        self.query = query
        self.source = source

    
    def createDF(self, count):
        if(self.query) :
            newsData = self.newsapi.get_everything(q=self.query, sources=self.source, language='en', page_size=count)
            articles = newsData['articles']

            data = []

            for article in articles :
                # initate Article object to print full text of article given url
                currArticle = Article(article['url'])
                currArticle.download()
                currArticle.parse()
                tuple = {
                    'date'        : re.findall(r"\d+-\d+-\d+", article['publishedAt'])[0],
                    'title'       : article['title'],
                    'content'     : currArticle.text 
                    }
                data.append(tuple)

            df = pd.DataFrame(data)

            return df
        
        return None

    def getName(self):
        return self.query