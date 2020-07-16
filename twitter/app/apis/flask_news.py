from flask_restplus import Namespace, Resource, fields, reqparse
from s3fs import S3FileSystem
from news import news
import configparser
import pandas as pd
import re
import os

api = Namespace('news', description='Get data from news articles given search query')

s3 = S3FileSystem(anon=False)
s3.connect()

@api.route('/<string:user_name>/<string:project_name>/')
@api.doc(params={'user_name': "The username of the project owner. "
                                   "\nExample: test_user",
                 'project_name': "The project name that the graph belongs to."
                                      "\nExample: project1",
                 'query': "Query to search the News API."
                                       "\nExample: Donald Trump",
                 'num_req': "Number of requests for News API"
                                        "\nExample: 20",
                 'file_name' : "Name of file wanted to be deleted"
                                        "\nExample: donald_trump.csv or donald trump"})

class newsAPI(Resource):
    # @api.expect(news_model)

    def get(self, user_name, project_name):
        try:

            # config = configparser.ConfigParser()
            # config.read('../grafluent.ini')

            bucket_name = os.getenv('DEFAULT_BUCKET')

            parser = reqparse.RequestParser()
            parser.add_argument('query', required=True, help='Please provide a valid search query.', trim=True),
            args = parser.parse_args()

            if(re.match(r'\S*\.csv$', args['query']) is None):
                query = "news_" + args['query'].replace(" ", "_").lower() + '.csv'
            else:
                query = args['query']

            csv = bucket_name.strip() + '/%s/%s/source_documents/' % (user_name.strip(), project_name.strip()) + query.strip()
            with s3.open(csv, 'rb') as f:
                df = pd.read_csv(f)

            df_list = df.values.tolist()

            return {
                'data' : df_list
            }, 200
        except FileNotFoundError as exception:
            return {
                'failed' : 'Please enter valid file name'
            }, 400    

        
    def post(self, user_name, project_name):

        # config = configparser.ConfigParser()
        # config.read('../grafluent.ini')

        bucket_name = os.getenv('DEFAULT_BUCKET')

        parser = reqparse.RequestParser()
        parser.add_argument('query', required=True, help='Please provide a valid search query.', trim=True),
        parser.add_argument('num_req', required=True, type=int, help='Please provide the number of requests for News API')
        args = parser.parse_args()

        article = news(query=args['query'])
        articles = article.createDF(args['num_req'])
        df_list = articles.values.tolist()

        if(df_list):
            fname = article.getName().replace(" ", "_").lower()
            csv   = bucket_name.strip() + '/%s/%s/source_documents/news_%s.csv' % (user_name.strip(), project_name.strip(), fname.strip()) 
            with s3.open(csv, 'w') as file:
                articles.to_csv(file)
            
            return {

                'status' : 'Posted new data',
                'file_name' : str(fname) + '.csv',
                'articles' : df_list
            }, 201
        else :
            return {
                'status' : 'Please enter valid query'
            }, 400

    def delete(self, user_name, project_name):
        try:
            # config = configparser.ConfigParser()
            # config.read('../grafluent.ini')

            bucket_name = os.getenv('DEFAULT_BUCKET')

            parser = reqparse.RequestParser()
            parser.add_argument('file_name', required=True, help='Please provide valid file_name', trim=True),
            args = parser.parse_args()

            file_name = args['file_name']

            if(re.match(r'\S*\.csv$', args['file_name']) is None):
                file_name = "news_" + args['file_name'].replace(" ", "_").lower() + '.csv'
            else:
                file_name = args['file_name']

            s3.delete(bucket_name.strip() + '/' + user_name.strip() + '/' + project_name.strip() + '/source_documents/' + file_name)
            
            return {
                'status' : 'File successfully deleted.', 
            }, 200
            
        except FileNotFoundError as exception:
            return {
                'failed' : 'Please enter valid file name'
            }, 400