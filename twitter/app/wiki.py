from bs4 import BeautifulSoup
import requests
import re
from datetime import datetime
import pandas as pd

class wiki:
    # code snipped for searchWiki from https://www.mediawiki.org/wiki/API:Info
    def searchWiki(self, query):
        S = requests.Session()
        URL = "https://en.wikipedia.org/w/api.php"
        PARAMS = {
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": query
        }

        R = S.get(url=URL, params=PARAMS)
        DATA = R.json()

        if(re.match(r'.*may refer to:', DATA['query']['search'][0]['snippet'])):
            page = DATA['query']['search'][1]['pageid']
        else:
            page = DATA['query']['search'][0]['pageid']
        
        return str(page)

    # constructor for wiki object
    def __init__(self, query) :
        # check if wiki link is legal
        self.pageID = self.searchWiki(query)
        try :
            self.url = "https://en.wikipedia.org/?curid=" + self.pageID
            
            # get html file
            self.r = requests.get(self.url)
            self.soup = BeautifulSoup(self.r.text, 'html.parser')
        except requests.exceptions.InvalidSchema as exception:
            
            #if wiki link is invalid
            print ("Please enter a valid url")
            self.url = None
            return None
    
    # method to return corpus of text from wiki    
    def getContent(self) :
        # check if url was inputted by user
        if(self.pageID):
            # find all html with <p> tag
            container = self.soup.findAll('p')

            output = ''

            # loop through array of <p> and combine text into a single corpus
            for text in container:
                output += '\n' + ''.join(text.getText())
            
            # return single corpus of all text
            return output

    # method to return the title of wiki
    def getTitle(self):
        title  = self.soup.find('h1', {'id': 'firstHeading'}).text
        return title
    
    # get date from wiki
    def getDate(self):
        
        # using beatiful soup to get date from html
        wikiDate = self.soup.find('li', {'id' : 'footer-info-lastmod'}).text
        
        # strip date from text returned from wikiDate
        time = datetime.strptime(re.findall(r"\d+\s\w+\s\d+", wikiDate)[0], '%d %B %Y')
        
        #correctly format date 
        date = str(time.year) + '-' + str(time.month) + '-' + str(time.day)
        
        # return date
        return date

    def createDF(self):
        data = {
            'date'      : self.getDate(),
            'title'     : self.getTitle(),
            'content'   : self.getContent()
        }

        df = pd.DataFrame(data, index=[0])

        return df