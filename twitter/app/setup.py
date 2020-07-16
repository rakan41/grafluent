from setuptools import setup

setup(
    name='data_module',
    version='0.1',
    install_requires=[
        'waitress',
        'pandas',
        'tweepy',
        'regex',
        's3fs',
        'configparser',
        'DateTime',
        'beautifulsoup4',
        'pillow',
        'newspaper3k',
        'newsapi-python',
        'flask-restplus'
    ],
)