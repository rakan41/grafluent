from flask import Flask, Response

from flask_restx import Api, Resource, inputs
import nlp_module
import uwsgi
import pickle

app = Flask(__name__)
api = Api(app)

parser = api.parser()

parser.add_argument(
    'debug', type=inputs.boolean, default=False, help='Debug logging.')
parser.add_argument('host', help='Stanford CoreNLP server host.')
parser.add_argument('port', type=int, help='Stanford CoreNLP server port.')
parser.add_argument(
    'close', type=inputs.boolean, default=False, help='Close Stanford CoreNLP server on completion.')
parser.add_argument('memory', default='6g',
                    help='Memory for NLP parsing: e.g. 4g, 6g, 8g')
parser.add_argument('input', required=True, help='Input file.')
parser.add_argument('output', required=True,
                    help='Output location or S3 bucket.')
parser.add_argument('arango', help='Arango host:port.')
parser.add_argument('user', required=True, help='Arango user name.')
parser.add_argument('project', required=True, help='Arango project name.')
parser.add_argument('limit', type=int,
                    help='Limit number of docs')
parser.add_argument('pictures', type=inputs.boolean, default=False,
                    help='Get wikipedia image urls for vertices (can be slow with a lot of vertices)')
parser.add_argument('summary', type=inputs.boolean, default=False,
                    help='Get wikipedia summary for vertices (can be slow with a lot of vertices)')
parser.add_argument('relations', type=inputs.boolean, default=False,
                    help='Extract semantic relations (much slower)')
parser.add_argument('corefs', type=inputs.boolean, default=False,
                    help='Resolve coreferences')
parser.add_argument('newgraph', type=inputs.boolean, default=False,
                    help='Overwrite existing graph. Otherwise it will append.')
parser.add_argument('documentedges', type=inputs.boolean, default=False,
                    help='Extract same document edges.')


@api.route('/run')
class AppRunner(Resource):
    @api.expect(parser)
    def post(self):
        if uwsgi.cache_get('busy') == b'1':
            return "Server busy", 409

        args = parser.parse_args()
        return Response(nlp_module.run(args.debug, args.host, args.port, args.close, args.memory, args.input, args.output,
                                       args.arango, args.user, args.project, args.limit, args.pictures, args.summary,
                                       args.relations, args.corefs,
                                       args.newgraph, args.documentedges), mimetype='text/event-stream', headers={'X-Accel-Buffering': 'no'})


@api.route('/restart')
class RestartNLP(Resource):
    def get(self):
        nlp_bytes = uwsgi.cache_get('nlp')
        if nlp_bytes or uwsgi.cache_get('busy'):
            if nlp_bytes:
                temp_nlp = pickle.loads(nlp_bytes)
                temp_nlp.close()
                uwsgi.cache_del('nlp')
                uwsgi.cache_del('busy')
                return 'success. closed.', 200
            else:
                uwsgi.cache_del('busy')
                return 'success', 200
        return 'Server already closed.', 304


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6970, debug=False)
