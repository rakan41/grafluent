# Database Module API
# Description: Processes API requests made to the Arango graph database. First function is to ingestion vertex and
# edge data from NLP module. The second function is to serve graph results from queries made by the front-end module.
# Arguments: host, port_number

# importing libraries
import os
import sys
from graph_module import flask_api
from graph_module import app
import waitress

if len(sys.argv) < 3:
    HOST = os.getenv('FLASK_RUN_HOST', '0.0.0.0')
    PORT = os.getenv('LISTEN_PORT', '6969')
else:
    HOST = sys.argv[1]
    PORT = sys.argv[2]

if __name__ == '__main__':
    waitress.serve(app, host=HOST, port=PORT)
    #app.run(host=HOST, port=PORT, threaded=True)

