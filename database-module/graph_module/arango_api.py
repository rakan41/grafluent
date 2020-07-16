# This module interfaces with the Arango DB directly. It is used to:
# 1) Create and modify projects
# 2) Insert new vertex and edge collections
# 3) Load named graphs
# 4) Query graph and collection data

# importing libaries
import json
import sys
from pathlib import Path

from pyArango import collection, graph, theExceptions

from graph_module import s3
from graph_module import aran
from graph_module import S3BUCKET

# define vertex model classes
class vertices(collection.Collection):
    pass

# create edge classes for each relationship type
class edges(collection.Edges):
    pass


class edges_same_document(collection.Edges):
    pass


class edges_same_sentence(collection.Edges):
    pass


class same_semantic(collection.Edges):
    pass

# create named graph class using above collection classes
class Grafluent(graph.Graph):
    _edgeDefinitions = [
        graph.EdgeDefinition("edges", fromCollections=["vertices"], toCollections=["vertices"])]
    _orphanedCollections = []


# separate graph types for each edge type
class GraphDocument(graph.Graph):
    _edgeDefinitions = [
        graph.EdgeDefinition("edges_same_document", fromCollections=["vertices"], toCollections=["vertices"])]
    _orphanedCollections = []


class GraphSentence(graph.Graph):
    _edgeDefinitions = [
        graph.EdgeDefinition("edges_same_sentence", fromCollections=["vertices"], toCollections=["vertices"])]
    _orphanedCollections = []


class GraphSemantic(graph.Graph):
    _edgeDefinitions = [
        graph.EdgeDefinition("edges_same_semantic", fromCollections=["vertices"], toCollections=["vertices"])]
    _orphanedCollections = []


# read a json object from s3
def load_json_from_s3(user_name, project_name, collection_type, file_name):
    json_obj = s3.open('{}/{}/{}/nlp_outputs/{}/{}'.format(S3BUCKET, user_name, project_name, collection_type, file_name)).read()
    return json_obj


# function that loads a vertex or edge jsons into arangoDB collections
def load_collections(user_name, project_name, json_obj, collection_name, collection_type):
    # create database if doesn't already exist
    db_name = user_name + '-' + project_name
    if aran.hasDatabase(db_name):
        db = aran[db_name]
    else:
        db = aran.createDatabase(db_name)
    db.reload()
    # create collection it doesn't already exist
    if db.hasCollection(collection_name):
        col = db[collection_name]
    else:
        col = db.createCollection(className=collection_type, name=collection_name)

    # try bulk uploading documents to collection
    try:
        col.bulkSave(json.loads(json_obj), onDuplicate='update')
        print("Uploaded collection {}".format(collection_name))
        results = {"response": "All documents processed successfully."}
    # return errors if not all the documents were processed successfully
    except theExceptions.UpdateError:
        error_type, value, traceback = sys.exc_info()
        print("Uploading collection {}...".format(collection_name))
        print('WARNING: Not all documents were processed')
        print('{} documents were created/updated'.format(value.errors['updated']+value.errors['created']))
        print('{} documents contained errors'.format(value.errors['errors']))
        results = {"response": "Collection partially processed.", "results": value.errors}
    return results


# creates arango named graphs from existing collections
def load_graph(user_name, project_name, relationship_type):
    db_name = user_name + '-' + project_name
    db = aran[db_name]
    db.reload()

    # create graph based on relationship
    if relationship_type == 'same_document':
        graph_name = 'GraphDocument'
    elif relationship_type == 'same_sentence':
        graph_name = 'GraphSentence'
    else:
        graph_name = 'GraphSemantic'
    if db.hasGraph(graph_name):
        db.graphs[graph_name].delete()
    grafluent = db.createGraph(graph_name)

    return grafluent.name

# truncates all data for a project
def truncate_project(user_name, project_name):
    db_name = user_name + '-' + project_name

    # delete if doesn't exist
    if aran.hasDatabase(db_name):
        aran[db_name].reload()
        aran[db_name].dropAllCollections()
        result = {"response": "All project data has been successfully removed."}
    else:
        result = {"response": "Project doesn't exist."}
    return result


# delete this
def load_arango(user_name, project_name, vertices, edges):
    db_name = user_name + '-' + project_name

    # create database if doesn't already exist
    if aran.hasDatabase(db_name):
        db = aran[db_name]
        db.reload()
    else:
        db = aran.createDatabase(db_name)
    print("Using database {}".format(db_name))
    # reload/refresh database
    db.reload()

    # create arango collections from nlp outputs if don't exist, otherwise append/update.
    vCol = load_collections(db, vertices, 'vertices', 'Collection')
    eCol = load_collections(db, edges, 'edges', 'Edges')

    # loan arango graph using the vertices and edges collections
    if db.hasGraph("Grafluent"):
        db.graphs['Grafluent'].delete()
    grafluent = db.createGraph('Grafluent')
    return vCol, eCol, db, grafluent

# Returns a json list of vertices that match a search string
def list_vertices(user_name, project_name, entity_type,
                  result_limit, query_type, search_string=None, centrality_measure='same_document_centrality'):
    db_name = user_name + '-' + project_name
    db = aran[db_name]
    db.reload()

    # AQL query construction
    AQL = "FOR doc IN vertices "
    if search_string is not None:
        AQL += "FILTER UPPER(doc.label_orig) like '%{}%' ".format(search_string.upper())
    if entity_type is not None:
        AQL += "FILTER doc.type == '{}' ".format(entity_type.upper())
    if query_type in ['feelingLucky']:
        AQL += "SORT RAND() "
    elif query_type in ['mostCentral']:
        AQL += "SORT '{}' desc ".format(centrality_measure)
    AQL += "LIMIT {} ".format(int(result_limit))
    AQL += "RETURN doc"

    # execute AQL query
    results = db.AQLQuery(AQL, rawResults=True)
    results = json.dumps(list(results))
    return results


# returns jsons of edges and vertices immediately neighbouring target vertex
def expand_vertex(user_name, project_name, vertex_key, entity_type, relationship_type, depth, result_limit, offset):
    db_name = user_name + '-' + project_name
    db = aran[db_name]
    db.reload()

    # choose graph relevant to edge type
    if relationship_type == 'same_document':
        graph = 'GraphDocument'
        centrality_measure = 'same_document_centrality'
    elif relationship_type == 'same_sentence':
        graph = 'GraphSentence'
        centrality_measure = 'same_sentence_centrality'
    else:
        graph = 'GraphSemantic'

    # AQL query construction
    AQL_v = "Let vResult = (FOR v,e in 1..{} ".format(int(depth))
    AQL_v += "ANY 'vertices/{}' ".format(vertex_key)
    AQL_v += "Graph '{}' ".format(graph)
    AQL_v += "OPTIONs {'bfs': True} "
    if entity_type is not None:
        AQL_v += "FILTER v.type == '{}' ".format(entity_type.upper())
    AQL_v += "SORT v.{} desc ".format(centrality_measure)
    AQL_v += "LIMIT {}, {} return v) ".format(offset, result_limit)
    # edge query
    AQL_e = "LET eResult = (for v, e, p in 1..{} ".format(int(depth))
    AQL_e += "ANY 'vertices/{}' ".format(vertex_key)
    AQL_e += "Graph '{}' ".format(graph)
    AQL_e += "FILTER v._key in vResult[*]._key return e) "
    AQL = AQL_v + AQL_e + "RETURN { edges: eResult, vertices: vResult }"

    # execute AQL query
    results = db.AQLQuery(AQL, rawResults=True)
    results = json.dumps(list(results))
    return results


# returns the most central neighbours of a node
def top_neighbours(user_name, project_name, vertex_key, entity_type, relationship_type, depth, result_limit, offset):
    db_name = user_name + '-' + project_name
    db = aran[db_name]
    db.reload()

    # choose graph relevant to edge type
    if relationship_type == 'same_document':
        graph = 'GraphDocument'
        centrality_measure = 'same_document_centrality'
    elif relationship_type == 'same_sentence':
        graph = 'GraphSentence'
        centrality_measure = 'same_sentence_centrality'
    else:
        graph = 'GraphSemantic'

    # AQL query construction
    AQL = "FOR v in 1..{} ".format(int(depth))
    AQL += "ANY 'vertices/{}' ".format(vertex_key)
    AQL += "Graph '{}' ".format(graph)
    AQL += "OPTIONS {'bfs': True} "
    if entity_type is not None:
        AQL += "FILTER v.type == '{}' ".format(entity_type.upper())
    AQL += "SORT v.{} desc ".format(centrality_measure)
    AQL += "LIMIT {}, {} return v  ".format(offset, result_limit)


    # execute AQL query
    results = db.AQLQuery(AQL, rawResults=True)
    results = json.dumps(list(results))
    return results


# returns source text in which edge was inferred from
def get_source_text(user_name, project_name, relationship_type, edge_key, full_text=False):
    # get arango connection
    db_name = user_name + '-' + project_name
    db = aran[db_name]
    db.reload()

    # AQL query
    AQL = "for e in edges_{} ".format(relationship_type)
    AQL += "filter e._key == '{}' ".format(edge_key)
    AQL += "return e "
    results = db.AQLQuery(AQL, rawResults=True)
    e = results[0]

    # retrieve text
    filename = Path(e['source_file']).name.split('.')[0] + "_" + str(e['document_id']) + ".tsv"
    filepath = '{}/{}/{}/nlp_outputs/{}'.format(S3BUCKET, user_name, project_name, filename)
    text = s3.open(filepath).read().decode()

    # retrieve where relationship was inferred. if too long, retrieve a sample.
    if e['from_char_offset'][1] - e['to_char_offset'][0] > 800:
        quoted_text = text[e['from_char_offset'][0]:e['from_char_offset'][1]+400] + " \n...\n"
        + text[e['to_char_offset'][0] - 400:e['to_char_offset'][1]]
    else:
        quoted_text = text[e['from_char_offset'][0]:e['to_char_offset'][1]]
    if full_text:
        document = {"text": text, "quoted_text": quoted_text}
    else:
        document = {"quoted_text": quoted_text}
    message = "Source document retrieved successfully."
    return {"result": True, "message": message, "document": document}


# returns k paths from one vertex to another
def find_k_paths(user_name, project_name, relationship_type, start_vertex, end_vertex, k):
    db_name = user_name + '-' + project_name
    db = aran[db_name]
    db.reload()

    # choose graph relevant to edge type
    if relationship_type == 'same_document':
        graph = 'GraphDocument'
    elif relationship_type == 'same_sentence':
        graph = 'GraphSentence'
    else:
        graph = 'GraphSemantic'

    # AQL query construction
    AQL = "FOR path IN ANY K_SHORTEST_PATHS "
    AQL += "'vertices/{}' to 'vertices/{}' ".format(start_vertex, end_vertex)
    AQL += "Graph '{}' ".format(graph)
    AQL += "LIMIT {} ".format(min(int(k), 5))
    AQL += "RETURN path"

    # execute AQL query
    results = db.AQLQuery(AQL, rawResults=True)
    results = json.dumps(list(results))
    return results
