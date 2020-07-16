from flask_restplus import Namespace, Resource, fields, reqparse
from s3fs import S3FileSystem
import configparser
import os

api = Namespace('All', description='Manipulate and display files for a project stored in s3')

s3 = S3FileSystem(anon=False)
s3.connect()

@api.route('/<string:user_name>/<string:project_name>/')
@api.doc(params={'user_name': "The username of the project owner. "
                                   "\nExample: test_user",
                 'project_name': "The project name that the graph belongs to."
                                      "\nExample: project1"})


class allAPI(Resource):
    
    def get(self, user_name, project_name):
        # config = configparser.ConfigParser()
        # config.read('../grafluent.ini')
        bucket_name = os.getenv('DEFAULT_BUCKET')

        return {

            'files' : s3.ls(bucket_name.strip() + '/' + user_name.strip() + '/' + project_name.strip() + '/source_documents/')
        }
    
    def delete(self, user_name, project_name):
        # config = configparser.ConfigParser()
        # config.read('../grafluent.ini')

        bucket_name = os.getenv('DEFAULT_BUCKET')

        files = s3.ls(bucket_name.strip() + '/' + user_name.strip() + '/' + project_name.strip() + '/source_documents/')
        s3.bulk_delete(files)
        return {
            'status' : 'All files successfully deleted'
        }

