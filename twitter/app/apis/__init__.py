import os
from flask_restplus import Api
from s3fs import S3FileSystem
from .flask_news import api as fn
from .flask_twitter import api as ft
from .flask_wiki import api as fw
from .flask_all import api as fa

api = Api( 
        title = "API",
        version= '1.0',
        description = "An API designed to retrieve data from Twitter, News Articles and Wikipedia")

api.add_namespace(fn)
api.add_namespace(ft)
api.add_namespace(fw)
api.add_namespace(fa)

s3 = S3FileSystem(anon=False)
s3.connect()

