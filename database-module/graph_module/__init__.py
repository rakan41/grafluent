# Initialises Arango connection, S3 connection, and flask application.

# importing modules
import configparser
import json
import os
import sys

from flask import Flask
from flask_restx import Api, Resource
from pyArango import connection
from s3fs import S3FileSystem
import waitress

# instantiating flask app and api
app = Flask(__name__)
api = Api(app = app, ui=True, title="Graph Database Module",
          description="Processes API requests made to the Arango graph database. First function is to \
          ingestion vertex and edge data from NLP module. The second function is to serve graph results \
          from queries made by the front-end module.")
ns_query = api.namespace('query', 'Query graph data from ArangoDB.')
ns_ingest = api.namespace('ingest', 'Ingest graph data into ArangoDB.')
ns_admin = api.namespace('admin', 'Perform administrative tasks.')


# set aws environment variables
S3BUCKET = os.getenv('DEFAULT_BRACKET', 'grafluent')

# start session with s3
s3 = S3FileSystem(anon=False)
s3.connect()


# set up an Arango connection
ARANGO_HOST = os.getenv('ARANGO_HOST')
ARANGO_PORT = os.getenv('ARANGO_PORT', '6969')
ARANGO_PWD = os.getenv('ARANGO_ROOT_PASSWORD', '')

aran = connection.Connection(arangoURL='http://{}:{}'.format(ARANGO_HOST, ARANGO_PORT), username='root', password=ARANGO_PWD)


