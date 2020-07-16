import itertools
import json
import logging
import os
import uuid
from pathlib import Path
import uwsgi
import pickle
import time

import networkx as nx
import pandas as pd
from networkx.algorithms.centrality import eigenvector_centrality
from networkx.readwrite import json_graph
from corenlp import StanfordCoreNLP
from unidecode import unidecode
from s3fs import S3FileSystem
from bs4 import BeautifulSoup
import requests
import wikipedia

from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Thread

import pdf_parser


class Relationship:
    def __init__(self, entity1, entity2, source_file, document_id, document_date, type, semantic_type=None):
        self.entity1 = Entity(entity1)
        self.entity2 = Entity(entity2)
        self.source_file = os.path.basename(source_file)
        self.document_id = document_id
        self.document_date = document_date
        self.e1_char_start = entity1["characterOffsetBegin"]
        self.e1_char_end = entity1["characterOffsetEnd"]
        self.e2_char_start = entity2["characterOffsetBegin"]
        self.e2_char_end = entity2["characterOffsetEnd"]
        self.type = type
        self.semantic_type = semantic_type

        if entity1.get('docTokenBegin') and entity2.get('docTokenBegin'):
            if entity1['docTokenBegin'] > entity2['docTokenBegin']:
                self.word_dist = entity1['docTokenBegin'] - \
                    entity2['docTokenEnd']
            else:
                self.word_dist = entity2['docTokenBegin'] - \
                    entity1['docTokenEnd']
        else:
            self.word_dist = None

    def set_doc_date(self, set_doc_date):
        self.document_date = set_doc_date

    def set_doc_id(self, doc_id):
        self.document_id = doc_id

    def __hash__(self):
        return hash((self.entity1, self.entity2, self.source_file, self.document_id,
                     self.document_date, self.e1_char_start, self.e1_char_end,
                     self.e2_char_start, self.e2_char_end, self.type, self.semantic_type))

    def __eq__(self, other):
        if type(other) is type(self):
            return self.entity1 == other.entity1 and self.entity2 == other.entity2 and \
                self.source_file == other.source_file and self.type == other.type and \
                self.document_id == other.document_id and self.document_date == other.document_date and \
                self.semantic_type == other.semantic_type


class Entity:
    def __init__(self, entity):
        self.label_orig = entity['text']
        self.label = unidecode(entity['text'])
        self.type = entity['ner']

        self._key = unidecode(entity['entitylink'])

    def __hash__(self):
        return hash(self._key)

    def __eq__(self, other):
        if type(other) is type(self):
            return self._key == other._key
        else:
            return False

    def __repr__(self):
        return self.label + "_" + self.type

    def __str__(self):
        return self.label + "_" + self.type


def clean_label(text):
    return text.replace(" ", "_").replace(",", "").replace("\"", "")


def init(data_loc, output, nlp, relations, corefs, chunk_size, limit):
    if data_loc[:5] == 's3://' or output[:5] == 's3://':
        s3 = S3FileSystem(anon=False)
    else:
        s3 = None

    n_items = 0
    if data_loc[:5] == 's3://' and data_loc[-4:] in ('.pdf', 'epub'):
        with s3.open(data_loc, 'rb') as f:
            pdf_p = pdf_parser.pdf_parser(
                '../deps/tika/tika-app-1.24.jar')
            data = pdf_p.parse(f.read(), file=True)

            n_items = int(len(data['content'][0]) / chunk_size)

    elif data_loc[-4:] in ('.pdf', 'epub'):
        pdf_p = pdf_parser.pdf_parser(
            '../deps/tika/tika-app-1.24.jar')
        data = pdf_p.parse(data_loc)

        n_items = int(len(data['content'][0]) / chunk_size)
    elif data_loc[-4:] == '.csv':
        data = pd.read_csv(data_loc, encoding='utf-8')

        if limit and limit < data.shape[0]:
            max_item = limit
        else:
            max_item = data.shape[0]

        logging.debug("using max_item: {}.".format(max_item))

        for i in range(max_item-1):
            n_items += 1 + int(len(data['content'][i]) / chunk_size)

    if relations:
        properties = {'annotators': 'tokenize,ssplit,pos,lemma,ner, parse,coref, entitylink, natlog, openie',
                      'entitylink.caseless': 'false',
                      'ner.model': 'edu/stanford/nlp/models/ner/english.conll.4class.distsim.crf.ser.gz',
                      'ner.applyNumericClassifiers': 'false', 'ner.applyFineGrained': 'false', 'outputFormat': 'json',
                      'coref.algorithm': 'neural', 'coref.neural.greedyness': 0.5, 'pipelineLanguage': 'en',
                      'openie.resolve_coref': True, 'openie.splitter.disable': False
                      }
    else:
        if corefs:
            properties = {'annotators': 'tokenize,ssplit,pos,lemma,ner, parse,coref, entitylink', 'entitylink.caseless': 'false',
                          'ner.model': 'edu/stanford/nlp/models/ner/english.conll.4class.distsim.crf.ser.gz', 'pipelineLanguage': 'en',
                          'ner.applyNumericClassifiers': 'false', 'ner.applyFineGrained': 'false', 'outputFormat': 'json'}
        else:
            properties = {'annotators': 'tokenize,ssplit,pos,lemma,ner, parse, entitylink', 'entitylink.caseless': 'false',
                          'ner.model': 'edu/stanford/nlp/models/ner/english.conll.4class.distsim.crf.ser.gz', 'pipelineLanguage': 'en',
                          'ner.applyNumericClassifiers': 'false', 'ner.applyFineGrained': 'false', 'outputFormat': 'json'}

    return data, n_items or 1, properties, s3


def parse_docs(data, data_loc, output, user, project, nlp, properties, chunk_size, limit=None, s3=None):
    logging.debug('Parsing docs:')

    out_path = os.path.join(output, user, project, "nlp_outputs")
    if out_path[:5] != 's3://':
        os.makedirs(out_path, exist_ok=True)

    for index, row in data.iterrows():
        if limit is not None and index == int(limit):
            break

        logging.debug(index)
        # NOTE: corenlp parser can only do documents of up to 100,000 characters so we chunk it

        content_chunks = chunk_text(row.content, chunk_size)

        for chunk in content_chunks:
            processed = nlp.annotate(chunk, properties=properties)
            yield (index, json.loads(processed), data_loc, row.date)

        next_file_name = os.path.splitext(os.path.basename(data_loc))[0]

        if out_path[:5] == 's3://':
            f = s3.open(os.path.join(out_path, next_file_name +
                                     "_" + str(index) + ".tsv"), 'w')
        else:
            f = open(os.path.join(out_path, next_file_name +
                                  "_" + str(index) + ".tsv"), 'w')

        f.write("".join(row[['content']]))

        f.close()


def resolve_coreferences(doc):
    for _, corefs in doc['corefs'].items():
        rep_mention = None
        for rep_idx, ref in enumerate(corefs):
            if ref['isRepresentativeMention'] == True:
                rep_mention = ref
                break

        # This is in some ways better than the method above because it simply determines the
        # representative mention as the earliest mention. Could consider changing.
        # rep_mention = corefs[0]

        if rep_mention['type'] != 'PROPER':
            continue

        for idx, ref in enumerate(corefs):
            if idx != rep_idx:
                sent = doc['sentences'][ref['sentNum'] - 1]
                for ent in sent['entitymentions']:
                    if ref['headIndex'] - 1 >= ent['tokenBegin'] and ref['headIndex'] - 1 <= ent['tokenEnd']:
                        if sent['tokens'][ent['tokenBegin']]['pos'] in 'PRP$':
                            ent['entitylink'] = clean_label(rep_mention['text']) + "_" + ent[
                                'ner']
                            ent['resolvedCoref'] = True
                        break
                else:
                    if ref['type'] == 'PROPER':
                        try:
                            new_entity = {'text': ref['text'], 'ner': 'MISC',
                                          'characterOffsetBegin': sent['tokens'][ref['startIndex'] - 1][
                                'characterOffsetBegin'],
                                'characterOffsetEnd': sent['tokens'][ref['endIndex'] - 1]['characterOffsetEnd'],
                                'tokenBegin': ref['startIndex'] - 1, 'tokenEnd': ref['endIndex'] - 1,
                                'ner': 'COREF', 'resolvedCoref': True,
                                'entitylink': clean_label(rep_mention['text']) + "_COREF"}
                            sent['entitymentions'].append(new_entity)
                        except IndexError:
                            pass
    for sent in doc['sentences']:
        sent['entitymentions'] = [ent for ent in sent['entitymentions'] if
                                  sent['tokens'][ent['tokenBegin']
                                                 ]['pos'] not in 'PRP$'
                                  or ent.get('resolvedCoref')]


def make_entity_relationships(doc_id, doc, data_loc, date, relations, documentedges):
    for sent in doc['sentences']:
        if (len(sent['entitymentions']) > 1):
            pairs = itertools.combinations(
                [{'entitylink': clean_label(ent['text']) + "_" + ent['ner'], **ent}
                 for ent in sent['entitymentions']
                 if (sent['tokens'][ent['tokenBegin']]['pos'] not in 'PRP$'
                     or ent.get('resolvedCoref')
                     )], 2)

            for pair in pairs:
                if relations:
                    for ie in sent['openie']:
                        if (pair[0]['text'] in ie['subject'] and pair[1]['text'] in ie['object']) or \
                                (pair[1]['text'] in ie['subject'] and pair[0]['text'] in ie['object']):
                            yield Relationship(pair[0], pair[1], data_loc, doc_id, date, "same_sentence",
                                               semantic_type=ie['relation'])
                            break
                    else:
                        yield Relationship(pair[0], pair[1], data_loc, doc_id, date, "same_sentence",
                                           semantic_type=None)
                else:
                    yield Relationship(pair[0], pair[1], data_loc, doc_id, date, "same_sentence",
                                       semantic_type=None)

    if documentedges:
        all_entities = [{'entitylink': clean_label(ent['text']) + "_" + ent['ner'], **ent}
                        for sent in doc['sentences'] for ent in sent['entitymentions']
                        if (sent['tokens'][ent['tokenBegin']]['pos'] not in 'PRP$' or ent.get('resolvedCoref'))]

        all_pairs = itertools.combinations([ent for ent in all_entities], 2)

        for pair in all_pairs:
            if (pair[0]['entitylink'] != pair[1]['entitylink']):
                yield Relationship(pair[0], pair[1], data_loc,
                                   doc_id, date, "same_document")


def send_to_arango(data, db_host, user, project, size_limit, doc_type):
    header = {
        "Content-Type": "application/json",
    }

    if doc_type in ('same_document', 'same_sentence'):
        edges = [e for e in data['edges'] if e['type'] == doc_type]
        logging.debug("{} edges: {}".format(doc_type, len(edges)))
        for lst in chunks(edges, size_limit):
            r = requests.put(
                "http://" + db_host + "/ingest/edge/" +
                doc_type + "/" + user + "/" + project + "/",
                headers=header,
                data=json.dumps(lst),
            )
        r = requests.put(
            "http://" + db_host + "/ingest/graph/" +
            doc_type + "/" + user + "/" + project + "/",
            headers=header
        )

    elif doc_type == 'vertices':
        r = requests.put(
            "http://" + db_host + "/ingest/vertex/" + user + "/" + project + "/",
            headers=header,
            data=json.dumps(data['vertices']),
        )


def set_type_centrality(G, type_str):
    g_ss = nx.Graph()
    g_ss.edges.data('weight', default=1)
    for u, v, k in G.edges(keys=True):
        if k[:13] == type_str:
            if g_ss.has_edge(u, v):
                g_ss[u][v]['weight'] += 1
            else:
                g_ss.add_edge(u, v, weight=1)

    max_iterations = 300

    # Need a lot of exception handling in case algorithm doesn't converge.
    try:
        centrality_dict = dict(eigenvector_centrality(
            g_ss, weight='weight'))
        nx.set_node_attributes(G, centrality_dict, type_str + '_centrality')
    except nx.NetworkXPointlessConcept:
        nx.set_node_attributes(G, 0, type_str + '_centrality')
    except nx.PowerIterationFailedConvergence:
        logging.debug(
            "Centrality algorithm failed to converge in 100 iterations.")

        try:
            centrality_dict = dict(eigenvector_centrality(
                g_ss, max_iter=max_iterations, weight='weight'))
            nx.set_node_attributes(
                G, centrality_dict, type_str + '_centrality')
        except nx.PowerIterationFailedConvergence:
            logging.debug("Centrality algorithm failed to converge in {} iterations.".format(
                max_iterations))
            nx.set_node_attributes(G, 0, type_str + '_centrality')

    except Exception:
        logging.debug("Centrality algorithm failed")
        nx.set_node_attributes(G, 0, type_str + '_centrality')


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def chunk_text(text, n):
    i = 0
    while i < len(text):
        j = 0
        if i + n + j < len(text):
            while text[i + n + j] != ".":
                j += 1
        yield text[i:i + n + j + 1]
        i += n + j + 1


def write_list_in_chunks(in_list, size_limit, pathname, user, project, filename_prefix):
    if 'edges' in filename_prefix:
        directory = 'edges'
    elif 'vertices' in filename_prefix:
        directory = 'vertices'
    else:
        raise Exception('Invalid directory.')

    path = os.path.join(pathname, user, project, "nlp_outputs", directory)
    if pathname[:5] != 's3://':
        os.makedirs(path, exist_ok=True)

    i = 0
    for lst in chunks(in_list, size_limit):
        if pathname[:5] == 's3://':
            s3 = S3FileSystem(anon=False)
            with s3.open(os.path.join(path, filename_prefix+str(i)+'.json'), 'w') as out:
                json.dump(lst, out)
        else:
            with open(os.path.join(path, filename_prefix+str(i)+'.json'), 'w') as out:
                json.dump(lst, out)
        i += 1


def _wikiSummary(title):
    i = 0
    while i < 10:
        try:
            return wikipedia.summary(title)
        except wikipedia.exceptions.DisambiguationError as e:
            logging.debug("trying disambig. option: {}".format(e.options[i]))
            title = e.options[i]
            i += 1
        except IndexError:
            return None
        except Exception as e:
            i += 1
            continue
    else:
        return None


def getWikiImageSummary(url, get_image=True, get_summary=True, index=None):
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'html.parser')
    imageSRC = None
    summary = None

    if get_image:
        image = soup.find("a", {"class": "image"})

        try:
            imageSRC = image.img['src']
        except wikipedia.exceptions.PageError:
            imageSRC = None
        except Exception:
            imageSRC = None

    if get_summary:
        title = soup.find("h1", {"id": "firstHeading"}).text
        summary = _wikiSummary(title)

    return imageSRC, summary, index


def run(debug, host, port, close, memory, input, output,  arango, user, project, limit, pictures, summary, relations, corefs, newgraph, documentedges):
    uwsgi.cache_update('busy', b'1')

    if debug:
        logging.basicConfig(level=logging.DEBUG)
        logging.debug("Debug on.")
    else:
        logging.basicConfig(level=logging.INFO)

    nlp_bytes = None
    nlp_bytes = uwsgi.cache_get('nlp')

    # Set progress bar start parameters
    if nlp_bytes:
        init_time = 2
    else:
        init_time = 10

    if pictures or summary:
        nlp_time = 60
    else:
        nlp_time = 80

    yield "data:1\n\n"

    # If standford corenlp server host and port given use that, otherwise start a new instance through python wrapper
    if host and port:
        if nlp_bytes:
            temp_nlp = pickle.loads(nlp_bytes)
            temp_nlp.close()

        nlp = StanfordCoreNLP(host, port)
        uwsgi.cache_update('nlp', pickle.dumps(nlp))
        logging.debug("nlp to cache: host {}".format(
            uwsgi.cache_get('nlp')))
    elif nlp_bytes:
        nlp = pickle.loads(nlp_bytes)
        logging.debug("nlp from cache: {}".format(
            uwsgi.cache_get('nlp')))
    else:
        nlp = StanfordCoreNLP(r'../deps/stanford-corenlp/',
                              memory=memory, timeout=200000, quiet=not debug)
        uwsgi.cache_update('nlp', pickle.dumps(nlp))
        logging.debug("nlp to cache: file {}".format(
            uwsgi.cache_get('nlp')))

    DOC_CHUNK_SIZE = 10000

    # Initialise corenlp properties, s3 bucket connection, and doc count for progress bar
    data, n_items, properties, s3 = init(input, output, nlp,
                                         relations=relations, corefs=corefs, chunk_size=DOC_CHUNK_SIZE, limit=limit)
    logging.debug("items to process: {}".format(n_items))

    logging.debug("Loading CoreNLP models...")

    # Load corenlp models in separate thread to allow to send regular pings to the frontend
    server_init_thread = Thread(target=nlp.annotate, args=("", properties))
    server_init_thread.start()

    while server_init_thread.is_alive():
        time.sleep(30)
        yield "data:1\n\n"
    else:
        server_init_thread.join()
        yield "data:"+str(init_time)+"\n\n"

    # Create or load existing networkx graph object for this project
    graph_path = os.path.join(output, user, project,
                              "nlp_outputs", 'graph_temp.pkl')
    if not newgraph:
        if output[:5] == 's3://' and s3.exists(graph_path):
            with s3.open(graph_path, 'rb') as f:
                logging.debug("Reading existing graph...")
                G = nx.read_gpickle(f)
        elif os.path.isfile(graph_path):
            G = nx.read_gpickle(graph_path)
        else:
            G = nx.MultiGraph()
    else:
        if arango:
            r = requests.delete(
                "http://" + arango + "/ingest/" + user + "/" + project + "/"
            )
        G = nx.MultiGraph()

    # Main NLP parsing loop. Run corenlp annotator pipeline, resolve coreferences and extract relations. Then load into networkx graph
    i = 0
    for document in parse_docs(data, input, output, user, project, nlp, properties, chunk_size=DOC_CHUNK_SIZE, limit=limit, s3=s3):
        yield "data:" + str(int(i/n_items*nlp_time)+init_time) + "\n\n"

        if corefs:
            resolve_coreferences(document[1])
            yield "data:" + str(int(i/n_items*nlp_time)+init_time) + "\n\n"

        for r in make_entity_relationships(document[0], document[1], document[2], document[3],
                                           relations=relations,
                                           documentedges=documentedges):
            key_suffix = r.semantic_type or ""
            G.add_edge(r.entity1._key, r.entity2._key, key=r.type + key_suffix,
                       source_file=r.source_file, word_dist=r.word_dist,
                       document_id=r.document_id, document_date=r.document_date,
                       from_char_offset=(r.e1_char_start, r.e1_char_end),
                       to_char_offset=(r.e2_char_start, r.e2_char_end),
                       semantic_type=r.semantic_type,
                       label_first=r.entity1.label_orig,
                       label_second=r.entity2.label_orig)

            nodes = []
            elements1 = r.entity1.__dict__
            nodes.append((r.entity1._key, elements1))
            elements2 = r.entity2.__dict__
            nodes.append((r.entity2._key, elements2))

            G.add_nodes_from(nodes)
        yield "data:" + str(int(i/n_items*nlp_time)+init_time) + "\n\n"
        i += 1

    # Close the NLP server if required. Keep open to avoid model loading next time
    if close:
        nlp.close()
        uwsgi.cache_del('nlp')

    logging.debug("Calculating same sentence centrality...")
    set_type_centrality(G, "same_sentence")

    if documentedges:
        yield "data:"+str(init_time+nlp_time+2)+"\n\n"
        set_type_centrality(G, "same_document")
        yield "data:"+str(init_time+nlp_time+5)+"\n\n"
    else:
        yield "data:"+str(init_time+nlp_time+5)+"\n\n"

    # Write graph object to JSON representation
    out_data = json_graph.node_link_data(G)

    # Serialise and write the graph object for use in next upload
    if output[:5] == 's3://':
        with s3.open(graph_path, 'wb') as f:
            nx.write_gpickle(G, f)
    else:
        nx.write_gpickle(G, graph_path)

    del G

    # remove and rename output variables to fit data api requirements
    out_data.pop('directed')
    out_data.pop('multigraph')

    out_data['vertices'] = out_data.pop('nodes')
    out_data['edges'] = out_data.pop('links')

    # Run wikipedia lookups of thumbnail urls and article summaries
    if pictures or summary:
        processes = []
        with ThreadPoolExecutor(max_workers=None) as executor:
            for idx, v in enumerate(out_data['vertices']):
                v.pop('id')

                if v['_key'].split("_")[-1] not in ('LOCATION', 'MISC', 'ORGANIZATION', 'PERSON', 'COREF'):
                    url = 'https://en.wikipedia.org/wiki/' + v['_key']
                    processes.append(executor.submit(
                        getWikiImageSummary, url, pictures, summary, idx))

            i = 0
            for task in as_completed(processes):
                logging.debug("Finished processing vertex: {} out of {}".format(
                    i+1, len(processes)))
                imageurl, summarytext, idx = task.result()
                out_data['vertices'][idx]['image_url'], out_data['vertices'][idx]['summary'] = imageurl, summarytext
                if i % 10 == 0:
                    yield "data:" + str(int(i/len(processes)*(80-nlp_time))+nlp_time+init_time+5) + "\n\n"
                i += 1

    # More renaming to fit data api requirements
    for e in out_data['edges']:
        e['_from'] = "vertices/" + clean_label(e.pop('source'))
        e['_to'] = "vertices/" + clean_label(e.pop('target'))
        e['type'] = e.pop('key')[:13]
        e['_key'] = str(uuid.uuid4())

    yield "data:96\n\n"

    # Either load data into arango db, or save json representation to file system or s3
    LINE_LIMIT = 100000

    if arango:
        logging.debug("sending: {}, {}, {}".format(arango, user, project))

        send_to_arango(out_data, arango, user, project,
                       LINE_LIMIT, doc_type="vertices")
        yield "data:97\n\n"

        send_to_arango(out_data, arango, user, project,
                       LINE_LIMIT, doc_type="same_sentence")

        yield "data:98\n\n"

        if documentedges:
            logging.debug("adding document edges")
            send_to_arango(out_data, arango, user, project,
                           LINE_LIMIT, doc_type="same_document")

    else:
        edges_ss = [e for e in out_data['edges']
                    if e['type'] == "same_sentence"]

        if documentedges:
            edges_sd = [e for e in out_data['edges']
                        if e['type'] == "same_document"]

        write_list_in_chunks(out_data['vertices'],
                             LINE_LIMIT//10, output, user, project, 'vertices')
        yield "data:97\n\n"
        write_list_in_chunks(edges_ss, LINE_LIMIT, output,
                             user, project, 'edges_ss')
        yield "data:98\n\n"
        if documentedges:
            write_list_in_chunks(edges_sd, LINE_LIMIT,
                                 output, user, project, 'edges_sd')

    uwsgi.cache_del('busy')
    yield "data:100\n\n"
