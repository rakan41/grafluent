from setuptools import setup

setup(
    name='nlp_module',
    version='0.1',
    py_modules=['nlp_module'],
    install_requires=[
        'pandas',
        'networkx',
        'unidecode',
        's3fs',
        'tika-app',
        'flask-restx',
        'beautifulsoup4',
        'wikipedia',
        'psutil'
    ],
)
