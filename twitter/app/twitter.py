import tweepy
import configparser
import re
import pandas as pd
import os

# constructor 
class twitter:
    def __init__(self, twitterID=None, hashtag=None) :
        #creates auth object for accessing twitter
        # config  = configparser.ConfigParser()
        # config.read('../grafluent.ini')

        twitter_key = os.getenv('twitter_API_key')
        twitter_key_secret = os.getenv('twitter_API_secret')
        twitter_token = os.getenv('twitter_access_token')
        twitter_token_secret = os.getenv('twitter_access_token_secret')

        auth = tweepy.OAuthHandler(twitter_key, twitter_key_secret)
        auth.set_access_token(twitter_token, twitter_token_secret)

        #initialise twitter
        self.api = tweepy.API(auth)
        self.twitterID = twitterID
        self.hashtag = hashtag      
    

    # get list of tuples with date/time and tweet text
    def createDF(self, count) :
        #check if user entered twitter ID
        if(self.twitterID):
            #array to store tweets and date
            data = []
            #username and count is the amount of tweets user wants to get
            for currTweet in tweepy.Cursor(self.api.user_timeline, id=self.twitterID, lang="en", q='-filter:retweets', tweet_mode='extended').items(count):
                if(re.match(r'RT', currTweet.full_text.split(' ', 1 )[0]) == None):
                    tweet = {
                        'date'     : str(currTweet.created_at),
                        'username' : str(currTweet.user.name),
                        'content'  : str(currTweet.full_text.encode('utf-8'))
                    }

                    data.append(tweet)
            
            #create dataframe 
            df = pd.DataFrame(data)
            
            return df       
            # return text
        elif self.hashtag:
            #array to store tweets and date
            data = []

            #check that hashtags query is legal
            match = re.findall(r'^#\w+|\s*AND\s#\w+|\s*OR\s#\w+', self.hashtag)
            query = ''.join(match)
            # print(query)

            #make a list of (tweet creation date, tweet)
            if(query) :
                for currTweet in tweepy.Cursor(self.api.search, q=self.hashtag+' -filter:retweets', lang="en", tweet_mode='extended').items(count):
                    tweet = {
                        'date'     : str(currTweet.created_at),
                        'username' : str(currTweet.user.name),
                        'content'  : str(currTweet.full_text.encode('utf-8'))  
                    }
                    data.append(tweet)
                
                # create dataframe
                df = pd.DataFrame(data)

                return df
        # If user did not enter Twitter ID then return nothing
        else:
            return None
    

    def printDate(self):
        for currTweet in tweepy.Cursor(self.api.user_timeline, id=self.twitterID, lang="en", q='-filter:retweets').items(1):
            print (str(currTweet.created_at))

    def getHashtag(self):
        return self.hashtag

    def getTwitterID(self):
        return self.twitterID