import os
import sys
from flask import Flask
from apis import api
from waitress import serve


app = Flask(__name__)
api.init_app(app)

# retrieve port and host set as environment variables.
if len(sys.argv) < 3:
    HOST = os.getenv('FLASK_RUN_HOST', '0.0.0.0')
    PORT = os.getenv('LISTEN_PORT', '8989')
else:
    HOST = sys.argv[1]
    PORT = sys.argv[2]

if __name__ == "__main__":
    serve(app, host=HOST, port=PORT)