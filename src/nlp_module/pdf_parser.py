from tikapp import TikaApp
import json
import re
from datetime import datetime
import pandas as pd
import base64
import dateutil.parser


class pdf_parser:
    def __init__(self, tika_jar_path):
        self.tika_client = TikaApp(file_jar=tika_jar_path)

    def parse(self, doc_path, file=False):
        if file:
            encoded = base64.b64encode(doc_path)
            content = json.loads(
                self.tika_client.extract_all_content(payload=encoded))
        else:
            content = json.loads(
                self.tika_client.extract_all_content(path=doc_path))
        content_string = re.sub(
            r'\n(?![\n])', r'', content[0]['X-TIKA:content'])
        content_string = re.sub(r'(\n)(\n+)', r'\1', content_string)

        date_string = content[0].get('Last-Modified') \
            or content[0].get('Last-Save-Date') \
            or content[0].get('Creation-Date') \
            or datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')

        if date_string:
            date_string = str(dateutil.parser.parse(date_string).date())

        df = pd.DataFrame(columns=['date', 'content'])

        df.loc[0] = [date_string, content_string]

        return df
