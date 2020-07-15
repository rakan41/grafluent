#!/bin/sh

sudo -i
apt-get update -y

# download script files from s3
apt install awscli -y


# create volumes directory in host directory
mkdir /home/volumes/arangodb/ -p
mkdir /home/volumes/sqlite/ -p

# install python and requisite packages
apt install python-pip -y
apt-get install python3-pip -y
pip3 install pyarango
pip3 install flask
pip3 install flask-restplus
pip3 install boto3
pip3 install S3fs
pip3 install flask-restx
pip3 install flask-login
pip3 install waitress
pip3 install configparser


# increase swap file
fallocate -l 8G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# install docker dependencies
apt install docker.io -y
service docker start

# pull docker images
docker pull arangodb
docker pull rakan41/grafluent:database_module
docker pull rakan41/grafluent:data_api
docker pull rakan41/grafluent:nlp_module

