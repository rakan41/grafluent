# This module contains all the Flask API endpoints for graph methods.
# There are 3 main sections, ingestion, querying, and administration.

import json
from flask import request, jsonify
from flask_restx import Resource, fields, reqparse, abort

from graph_module import admin
from graph_module import arango_api
from graph_module import ns_query, ns_ingest, ns_admin


# Provide descriptions for endpoint parameters
user_project_params = {'user_name': "The username of the project owner. "
                                    "\nExample: test_user",
                       'project_name': "The project name that the graph belongs to."
                                       "\nExample: project1"}
entity_type_params = {'entity_type': "Filter by a entity type."
                                     "\nLeave blank if you want to return all types."
                                     "\nAvailable Types: PERSON, ORGANIZATION, LOCATION, MISC"}
relationship_type_params = {"relationship_type": "Filter by relationship type."
                                                "\nAvailable Types: same_document or same_sentence."
                                                "\nIf left blank, value will default to same_document."}
result_limit_params = {"result_limit": "The maximum number of vertices to return.\n"
                                       "Example: 20"}
off_set_params = {"offset": "The starting position of results list."
                            "For example, offset of 100 with limit of 20 will return first 20 items starting from 100."}
edge_key_params = {"edge_key": "The unique _key of the edge."}
vertex_key_params = {"vertex_key": "The key of the entity you want to expand."
                                   "\nExample: Donald_Trump"}
depth_params = {'depth': "How many degrees of separation"
                         "\nLeaving blank will default to 1."
                         "\nMax allowable value is 3."
                         "\nWARNING: Use this with caution on large graphs."}
full_text_params = {"full_text": "Change to true to retrieve full document text in addition to quoted text."}
expand_params = {'user_name': "The username of the project owner. "
                              "\nExample: test_user",
                 'project_name': "The project name that the graph belongs to."
                                 "\nExample: project1",
                 "vertex_key": "The key of the entity you want to expand."
                               "\nExample: Donald_Trump",
                 'entity_type': "Filter by a entity type."
                                "\nLeave blank if you want to return all types."
                                "\nAvailable Types: PERSON, ORGANIZATION, LOCATION, MISC",
                 'relationship_type': "Filter by relationship type."
                                      "\nAvailable Types: same_document or same_sentence."
                                      "\nIf left blank, value will default to same_document.",
                 'depth': "How many degrees of separation"
                          "\nLeaving blank will default to 1."
                          "\nMax allowable value is 3."
                          "\nWARNING: Use this with caution on large graphs.",
                 "result_limit": "The maximum number of vertices to return."
                                 "Example: 20",
                 "offset": "The starting position of results list."
                           "For example, offset of 100 with limit of 20 will return first 20 items starting from 100."}


# Define API models
vertex_model = ns_ingest.model('Vertex', {
    "_key": fields.String(required=True, example='Donald_Trump'),
    "type": fields.String(required=True, example='PERSON'),
    "label_orig": fields.String(required=True, example='Donald Trump'),
    "label": fields.String(required=True, example='Donald Trump'),
    "same_document_centrality": fields.String(required=True, example='0.10486135588697124'),
    "same_sentence_centrality": fields.String(required=True, example='0.09293094608873993'),
    "semantic_centrality": fields.String(required=True, example='0')})

edge_model = ns_ingest.model('Edge', {
    "_key": fields.String(required=True, example='9ae173c5-60e6-4fdd-8e02-62c3eb4d7af6'),
    "source_file": fields.String(example='../../data/articles1.csv'),
    "word_dist": fields.Integer(example=11),
    "document_id": fields.Integer(example=2989),
    "document_date": fields.String(example='2016-12-31'),
    "from_char_offset": fields.List(fields.Integer, example=[95, 106]),
    "to_char_offset": fields.List(fields.Integer, example=[0, 10]),
    "semantic_type": fields.String(example='owns')})

add_user_model = ns_ingest.model('AddUser', {
    "user_name": fields.String(required=True, example='johnsmith'),
    "account_type": fields.String(required=True, example='GENERIC'),
    "password": fields.String(example='opensesame'),
    "email": fields.String(example='johnsmith@hotmail.com')})

check_password = ns_ingest.model('CheckPassword', {
    "user_name": fields.String(required=True, example='johnsmith'),
    "password": fields.String(required=True, example='opensesame')})

update_password = ns_ingest.model('UpdatePassword', {
    "user_name": fields.String(required=True, example='johnsmith'),
    "old_password": fields.String(required=True, example='opensesame'),
    "new_password": fields.String(required=True, example="closesesame")})

# put vertex json to an Arango collection
@ns_ingest.route('/vertex/<string:user_name>/<string:project_name>/',
                 doc={"description": "Ingst a vertex JSON for a particular project"})
@ns_ingest.doc(params={'user_name': "The user's name.",
                       'project_name': "The project's name."})
class AddVertices(Resource):
    @ns_ingest.expect([vertex_model])
    def put(self, user_name, project_name):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # ingest vertex from request body
        payload = request.data
        result = arango_api.load_collections(
            user_name=user_name,
            project_name=project_name,
            json_obj=payload,
            collection_name='vertices',
            collection_type='Collection')
        return jsonify(result)


# put vertex json to an Arango collection directly from s3 location
@ns_ingest.route('/vertex/s3/<string:user_name>/<string:project_name>/<string:file_name>/',
                 doc={"description": "Ingest a vertex JSON into Arango from an s3 location"})
@ns_ingest.doc(params={'user_name': "The user's name.",
                       'project_name': "The project's name.",
                       "file_name": "The filename of the json to be loaded from s3."})
class AddVerticesS3(Resource):
    def put(self, user_name, project_name, file_name):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # add vertex
        payload = arango_api.load_json_from_s3(
            user_name=user_name,
            project_name=project_name,
            file_name=file_name,
            collection_type='vertices'
        )
        result = arango_api.load_collections(
            user_name=user_name,
            project_name=project_name,
            json_obj=payload,
            collection_name='vertices',
            collection_type='Collection')
        return jsonify(result)


# put edge json to an Arango collection
@ns_ingest.route('/edge/<string:type>/<string:user_name>/<string:project_name>/',
                 doc={"description": "Ingest a edge JSON for a particular project"})
@ns_ingest.doc(params={'type': 'Edge type can be same_document, or same_sentence',
                       'user_name': "The user's name.",
                       'project_name': "The project's name."})
class AddEdges(Resource):
    @ns_ingest.expect([edge_model])
    def put(self, type, user_name, project_name):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # load an edge collection for that particular relationship type
        payload = request.data
        result = arango_api.load_collections(
            user_name=user_name,
            project_name=project_name,
            json_obj=payload,
            collection_name='edges_{}'.format(type),
            collection_type='Edges')

        return jsonify(result)


# put edge json to an Arango collection from s3 location
@ns_ingest.route('/edge/s3/<string:type>/<string:user_name>/<string:project_name>/<string:file_name>/',
                 doc={"description": "Ingest a edge JSON from an s3 location."})
@ns_ingest.doc(params={'type': 'Edge type can be same_document, or same_sentence',
                       'user_name': "The user's name.",
                       'project_name': "The project's name.",
                       "file_name": "The filename of the json to be loaded from s3."})
class AddEdgesS3(Resource):
    def put(self, type, user_name, project_name, file_name):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # read json object from s3.
        payload = arango_api.load_json_from_s3(
            user_name=user_name,
            project_name=project_name,
            file_name=file_name,
            collection_type='edges'
        )
        # load an edge collection for that particular relationship type
        result = arango_api.load_collections(
            user_name=user_name,
            project_name=project_name,
            json_obj=payload,
            collection_name='edges_{}'.format(type),
            collection_type='Edges')

        return jsonify(result)


# Load/Reload named graph from vertex and edge collections
@ns_ingest.route('/graph/<string:type>/<string:user_name>/<string:project_name>/',
                 doc={"description": "Load/Reload named graph from vertex and edge collections"})
@ns_ingest.doc(params={'type': 'Edge type can be same_document, or same_sentence',
                       'user_name': "The user's name.",
                       'project_name': "The project's name."})
class LoadGraph(Resource):
    def put(self, user_name, project_name, type):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))


        # create a graph based on the edge type
        graph_name = arango_api.load_graph(user_name=user_name,
                                           project_name=project_name,
                                           relationship_type=type)
        return jsonify({"result": "Created {}".format(graph_name)})


# truncates all arango data in a project
@ns_ingest.route('/<string:user_name>/<string:project_name>/',
                 doc={"description": "Truncates all collections and graphs that belong to a project."})
@ns_ingest.doc(params={'user_name': "The user's name.",
                       'project_name': "The project's name."})
class TruncateProject(Resource):
    def delete(self, user_name, project_name):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # delete project from arango
        result = arango_api.truncate_project(user_name, project_name)
        return jsonify(result)


# Returns a json list of entities that match a search string
@ns_query.route('/searchNames/<string:user_name>/<string:project_name>/',
                doc={"description": "Returns a json list of entities that match a search string"})
@ns_query.doc(params={'user_name': "The username of the project owner. "
                                   "\nExample: test_user",
                      'project_name': "The project name that the graph belongs to."
                                      "\nExample: project1",
                      'search_string': "The label of the entity you are trying to find.\n"
                                       "Example: trump",
                      'entity_type': "Filter by a entity type."
                                     "\nLeave blank if you want to return all types."
                                     "\nAvailable Types: PERSON, ORGANIZATION, LOCATION, MISC",
                      'result_limit': "The max length of results list."
                                      "\nDefault value will be used if left blank."})
class SearchNames(Resource):
    def get(self, user_name, project_name):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # Parsing query parameters
        parser = reqparse.RequestParser()
        parser.add_argument('search_string', required=True, help='Please provide a valid entity label to search for.',
                            trim=True),
        parser.add_argument('entity_type', required=False, help='Please provide a valid entity type to filter on.',
                            default=None, trim=True, choices=("LOCATION", "MISC", "PERSON", "ORGANIZATION"),
                            case_sensitive=False)
        parser.add_argument('result_limit', type=int, required=False, help='Limit must be a positive integer.',
                            default=20, store_missing=True)
        args = parser.parse_args()

        results = arango_api.list_vertices(
            user_name=user_name,
            project_name=project_name,
            search_string=args['search_string'],
            entity_type=args['entity_type'],
            result_limit=args['result_limit'],
            query_type='searchNames')
        return results


# Returns a json list of random vertices
@ns_query.route('/feelingLucky/<string:user_name>/<string:project_name>/',
                doc={"description": "Returns a random entity"})
@ns_query.doc(params={'user_name': "The username of the project owner. "
                                   "\nExample: test_user",
                      'project_name': "The project name that the graph belongs to."
                                      "\nExample: project1",
                      'entity_type': "Filter by a entity type."
                                     "\nLeave blank if you want to return all types."
                                     "\nAvailable Types: PERSON, ORGANIZATION, LOCATION, MISC",
                      'result_limit': "The max length of results list."
                                      "\nDefault value will be used if left blank."})
class FeelingLucky(Resource):
    def get(self, user_name, project_name):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # Parsing query parameters
        parser = reqparse.RequestParser()
        parser.add_argument('entity_type', required=False, help='Please provide a valid entity type to filter on.',
                            default=None, trim=True, choices=("LOCATION", "MISC", "PERSON", "ORGANIZATION"),
                            case_sensitive=False)
        parser.add_argument('result_limit', required=False, help='Limit must be a positive integer.',
                            default=1, store_missing=True)
        args = parser.parse_args()

        results = arango_api.list_vertices(
            user_name=user_name,
            project_name=project_name,
            entity_type=args['entity_type'],
            result_limit=args['result_limit'],
            query_type='feelingLucky')
        return results


# Returns a json list of most entities with highest centrality
@ns_query.route('/mostCentral/<string:user_name>/<string:project_name>/',
                doc={"description": "Returns a list of most important/mentioned entities"})
@ns_query.doc(params={'user_name': "The username of the project owner. "
                                   "\nExample: test_user",
                      'project_name': "The project name that the graph belongs to."
                                      "\nExample: project1",
                      'entity_type': "Filter by a entity type."
                                     "\nLeave blank if you want to return all types."
                                     "\nAvailable Types: PERSON, ORGANIZATION, LOCATION, MISC",
                      "centrality_measure": "The centrality metric used to rank an entity's importance."
                                            "\nAvailable Options: same_document_centrality, same_sentence_centrality, semantic_centrality",
                      "result_limit": "The max length of results list."
                                      "\nDefault value will be used if left blank."})
class MostCentral(Resource):
    def get(self, user_name, project_name):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # Parsing query parameters
        parser = reqparse.RequestParser()
        parser.add_argument('entity_type', required=False, help='Please provide a valid entity type to filter on.',
                            default=None, trim=True, choices=("LOCATION", "MISC", "PERSON", "ORGANIZATION"),
                            case_sensitive=False)
        parser.add_argument('centrality_measure', required=False, help='Please provide a valid centrality measure',
                            default='same_document_centrality', trim=True,
                            choices=("same_document_centrality", "semantic_centrality", "same_sentence_centrality"),
                            case_sensitive=False, store_missing=True)
        parser.add_argument('result_limit', required=False, help='Limit must be a positive integer.',
                            default=10, store_missing=True)
        args = parser.parse_args()

        results = arango_api.list_vertices(
            user_name=user_name,
            project_name=project_name,
            entity_type=args['entity_type'],
            centrality_measure=args['centrality_measure'],
            result_limit=args['result_limit'],
            query_type='mostCentral')
        return results



# Returns a graph of entity's immediate neighbours
@ns_query.route('/expand/<string:user_name>/<string:project_name>/')
@ns_query.doc(params=expand_params,
              doc={"description": "Returns all the entities that immediately neighbour a target entity."})
class expandVertex(Resource):
    def get(self, user_name, project_name):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # Parsing query parameters
        parser = reqparse.RequestParser()
        parser.add_argument('vertex_key', required=True, help='Please provide the _key for starting vertex.',
                            trim=True),
        parser.add_argument('entity_type', required=False, help='Please provide a valid entity type to filter on.',
                            default=None, trim=True, choices=("LOCATION", "MISC", "PERSON", "ORGANIZATION"),
                            case_sensitive=False)
        parser.add_argument('relationship_type', required=False, help='Limit must be a positive integer.',
                            choices=('same_sentence', 'same_document', 'semantic'), case_sensitive=False,
                            store_missing=True, trim=True, default='same_document')
        parser.add_argument('depth', required=False, help='Limit must be a positive integer.',
                            default=1, store_missing=True)
        parser.add_argument('result_limit', required=False, help='Limit must be a positive integer.',
                            default=20, store_missing=True)
        parser.add_argument('offset', required=False, help='Limit must be a positive integer.',
                            default=0, store_missing=True)
        args = parser.parse_args()

        results = arango_api.expand_vertex(
            user_name=user_name,
            project_name=project_name,
            vertex_key=args['vertex_key'],
            entity_type=args['entity_type'],
            relationship_type=args['relationship_type'],
            depth=args['depth'],
            result_limit=args['result_limit'],
            offset=args['offset'])
        return results


# Returns a graph of entity's top neighbours
@ns_query.route('/topNeighbours/<string:user_name>/<string:project_name>/')
@ns_query.doc(params=expand_params,
              doc={"description": "Returns an entities top neighbours by centrality."})
class TopNeighbours(Resource):
    def get(self, user_name, project_name):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # Parsing query parameters
        parser = reqparse.RequestParser()
        parser.add_argument('vertex_key', required=True, help='Please provide the _key for starting vertex.',
                            trim=True),
        parser.add_argument('entity_type', required=False, help='Please provide a valid entity type to filter on.',
                            default=None, trim=True, choices=("LOCATION", "MISC", "PERSON", "ORGANIZATION"),
                            case_sensitive=False)
        parser.add_argument('relationship_type', required=False, help='Limit must be a positive integer.',
                            choices=('same_sentence', 'same_document', 'semantic'), case_sensitive=False,
                            store_missing=True, trim=True, default='same_document')
        parser.add_argument('depth', required=False, help='Limit must be a positive integer.',
                            default=1, store_missing=True)
        parser.add_argument('result_limit', required=False, help='Limit must be a positive integer.',
                            default=5, store_missing=True)
        parser.add_argument('offset', required=False, help='Limit must be a positive integer.',
                            default=0, store_missing=True)
        args = parser.parse_args()

        results = arango_api.top_neighbours(
            user_name=user_name,
            project_name=project_name,
            vertex_key=args['vertex_key'],
            entity_type=args['entity_type'],
            relationship_type=args['relationship_type'],
            depth=args['depth'],
            result_limit=args['result_limit'],
            offset=args['offset'])
        return results


# returns the text in which the edge was mentioned
@ns_query.route('/text/<string:user_name>/<string:project_name>/<string:relationship_type>/<string:edge_key>/')
@ns_query.doc(params={**user_project_params, **relationship_type_params, **edge_key_params, **full_text_params},
              doc={"description": "Returns the text where relationship was inferred."})
class GetSourceText(Resource):
    def get(self, user_name, project_name, relationship_type, edge_key):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # parsing query parameters
        parser = reqparse.RequestParser()
        parser.add_argument(
            'full_text', required=False, help='Change to true to retrieve full document text with the quoted text.',
                            default=False, store_missing=True)
        args = parser.parse_args()

        # Retrieves source document text and other metadata
        results = arango_api.get_source_text(
            user_name=user_name,
            project_name=project_name,
            relationship_type=relationship_type,
            edge_key=edge_key,
            full_text=args['full_text']
        )
        return jsonify(results)


# finds K shortest paths between two vertices
@ns_query.route('/kPaths/<string:user_name>/<string:project_name>/')
@ns_query.doc(params={'user_name': "The username of the project owner. "
                                   "\nExample: test_user",
                      'project_name': "The project name that the graph belongs to."
                                      "\nExample: project1",
                      "start_vertex": "The key of the entity you want to start from."
                                      "\nExample: Donald_Trump",
                      'end_vertex': "The key of the entity you want find."
                                    "\nExample: Barack_Obama",
                      'entity_type': "Filter by a entity type."
                                     "\nLeave blank if you want to return all types."
                                     "\nAvailable Types: PERSON, ORGANIZATION, LOCATION, MISC",
                      'relationship_type': "Filter by relationship type."
                                           "\nAvailable Types: same_document or same_sentence."
                                           "\nIf left blank, value will default to same_document.",
                      'k': "Number of paths to return"
                           "\nLeaving blank will default to 1."
                           "\nMax allowable value is 3."
                           "\nWARNING: This query can take a long time to execute."},
              doc={"description": "Finds k shortest paths from one entity to another."})
class kPaths(Resource):
    def get(self, user_name, project_name):
        # checks if user exists
        if not admin.user_exists(user_name)['result']:
            abort(404, "User {} does not exist.".format(user_name))
        # checks if project exists
        if not admin.project_exists(user_name, project_name)['result']:
            abort(404, "Project {} does not exist for user {}.".format(project_name, user_name))

        # Parsing query parameters
        parser = reqparse.RequestParser()
        parser.add_argument('start_vertex', required=True, help='Please provide the _key for starting vertex.',
                            trim=True),
        parser.add_argument('end_vertex', required=True, help='Please provide the _key for destination vertex.',
                            trim=True),
        parser.add_argument('entity_type', required=False, help='Please provide a valid entity type to filter on.',
                            default=None, trim=True, choices=("LOCATION", "MISC", "PERSON", "ORGANIZATION"),
                            case_sensitive=False)
        parser.add_argument('relationship_type', required=False, help='Limit must be a positive integer.',
                            choices=('same_sentence', 'same_document', 'semantic'), case_sensitive=False,
                            store_missing=True, trim=True, default='same_document')
        parser.add_argument('k', required=False, help='k must be a positive integer.',
                            default=1, store_missing=True)
        args = parser.parse_args()

        results = arango_api.find_k_paths(
            user_name=user_name,
            project_name=project_name,
            relationship_type=args['relationship_type'],
            start_vertex=args['start_vertex'],
            end_vertex=args['end_vertex'],
            k=args['k'])
        return results


# Admin Functions
@ns_admin.route('/user/', doc={"description": "Add, delete, or update user."})
class UserAddRemove(Resource):
    # adds user
    @ns_admin.expect([add_user_model])
    def post(self):
        payload = json.loads(request.data)[0]

        # create a user in sql database and create s3 bucket
        result = admin.add_user(user_name=payload['user_name'],
                                account_type=payload['account_type'],
                                password=payload['password'],
                                email=payload['email'])

        return jsonify(result)

    @ns_admin.expect([check_password])
    def delete(self):
        payload = json.loads(request.data)[0]

        # delete user from database and remove s3 bucket
        result = admin.delete_user(user_name=payload['user_name'],
                                   password=payload['password'])
        return jsonify(result)

    # generate a list of grafluent users
    def get(self):
        result = admin.list_users()
        return jsonify(result)


# returns a list of projects that belong to a user
@ns_admin.route('/user/project/<string:user_name>/', doc={
    "description": "Returns a list of projects that belong to a user"})
class UserProjects(Resource):
    def get(self, user_name):
        result = admin.list_projects(user_name)
        return result


# checks if project exists
@ns_admin.route('/user/project/<string:user_name>/<string:project_name>/', doc={
    "description": "Checks if a project exists."})
class UserProjects(Resource):
    def get(self, user_name, project_name):
        result = admin.project_exists(user_name, project_name)
        return result


# user login or update password
@ns_admin.route('/user/login/', doc={"description": "Login to a user account or update password"})
class LoginUser(Resource):
    @ns_admin.expect([check_password])
    def post(self):
        payload = json.loads(request.data)[0]

        # verifies user and password combination against sql database
        result = admin.check_password(user_name=payload['user_name'],
                                      password=payload['password'])
        return jsonify(result)

    # update password
    @ns_admin.expect([update_password])
    def put(self):
        payload = json.loads(request.data)[0]

        # verifies user and password combination against sql database
        result = admin.update_password(user_name=payload['user_name'],
                                       old_password=payload['old_password'],
                                       new_password=payload['new_password'])
        return jsonify(result)


project_model = ns_ingest.model('Project', {
    "user_name": fields.String(required=True, example='johnsmith'),
    "password": fields.String(required=True, example='opensesame'),
    "project_name": fields.String(example='project1')})


# add, delete or modify projects
@ns_admin.route('/user/project/')
class AdminProject(Resource):
    # creates new project
    @ns_admin.expect([project_model])
    def post(self):
        payload = json.loads(request.data)[0]

        # verifies user and password combination against sql database
        result = admin.add_project(user_name=payload['user_name'],
                                   password=payload['password'],
                                   project_name=payload['project_name'])
        return jsonify(result)

    # deletes existing project
    @ns_admin.expect([project_model])
    def delete(self):
        payload = json.loads(request.data)[0]

        # verifies user and password combination against sql database
        result = admin.delete_project(user_name=payload['user_name'],
                                      password=payload['password'],
                                      project_name=payload['project_name'])

        #truncate

        return jsonify(result)
