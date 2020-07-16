# Dockerfile for Grafluent - Database Module
# Docker repo - rakan41/grafluent:database_module
# Instructions: docker run -d -p 6969:6969 --name database_module --env-file=grafluent.ini -v /home/volumes/sqlite:/db rakan41/grafluent:database_module

FROM python:3.7-alpine

# Flask ENV variables
ENV LISTEN_PORT 6969
ENV FLASK_APP main.py
ENV FLASK_RUN_HOST 0.0.0.0

# Arango ENV variables 
ENV ARANGO_HOST=host.docker.internal
ENV ARANGO_PORT=8529
ENV ARANGO_ROOT_PASSWORD=

# AWS ENV variables 
ENV AWS_ACCESS_KEY_ID=
ENV AWS_SECRET_ACCESS_KEY=
ENV AWS_DEFAULT_REGION=
ENV DEFAULT_BUCKET=

# misc 
EXPOSE 6969
COPY . .

# install python dependencies
RUN pip install -r requirements.txt

# persist data on host machine
VOLUME ["/db"]
ENTRYPOINT ["python", "main.py"]