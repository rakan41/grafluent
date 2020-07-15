# Grafluent
Welcome to Grafluent, a graph-based text data exploration tool. 

## About Us
Our goal is to help our users make sense of large volumes of textual data. Grafluent is a data visualisation tool that allows users to explore a large network of entities and relationships extracted from a corpus of text.

Upload collections of text into Grafluent, which are then analysed through NLP techniques to extract named entities such as natural persons, organisations, and locations. Grafluent then analyses the text to determine how these entities are connected to each other. Once all the data has been processed, you will be able to explore all the named entities and their links through a graph-based user interface. They will also be able to view the original text from where the relationship is inferred. 

## User Instructions 
Visit to https://grafluent-au.web.app/ 
### Use our demo user
Login into Grafluent using:
username: DemoUser
password: opensesame
You will find projects that are preloaded and already processed by our NLP engine. You can start exploring  data straight away!
### Create your own profile
1) Click on the "Sign Up" page and create a profile. 
2) Once logged in, create a new project. 
3) Under the "Data" tab, either 
a) Upload your own source documents. Some sample documents can be found - https://github.com/unsw-cse-comp3900-9900/capstone-project-grafluent/tree/master/examples; Or
b) Use the Twitter, News or Wikipedia API to retrieve articles to load into your project.
4) You can see your upload progress in the notifications bar. 
5) Once processed and loaded, click on the "Explore" tab to begin exploring. 

## Deployment Instructions 
Deploy your own instance of Grafluent on AWS. Please note the following prerequisites:
1) AWS account. 
2) Docker account

### Create s3 bucket for grafluent project. 
User data and NLP outputs will be stored in S3. As such, you will need to create your own S3 bucket. 
1) From the AWS Console, navigate to Services tab and click on S3 under storage. 
2) Click create new bucket. 
3) Choose a bucket name and default region. Please note a bucket name must be unique for each region. Ensure that "Block all public access" is selected and click on create bucket. 

### Deploying the front-end components
1. To deploy `www`, please [read this instruction](www/README.md)
2. To deploy `www-edge` and `graph-exporter`, please [read this instruction](www-edge/README.md)

### Provision EC2 Instance 
All Grafluent docker containers will be deployed via an EC2 instance.
1) From the AWS Console, navigate to Services tab and click on EC2 under compute. 
2) Choose the Ubuntu Server 20.04 AMI.
3) Choose the c5.xlarge instance type and click on "next". Note that Grafluent's NLP module requires a powerful instance type, so it is not recommended to use any lower performance instances. 
4) Under "configure instance details", leave all the defaults except IAM role. Give it the IAM role you created above. For "User Data", select the "As file" radio button and select the "awsLaunchScript.sh" in repo root directory. This will install some depdencies and set some configurations. Then, click "next: add storage". 
5) Increase size to 32gb and then "next".
6) Add tags if required, then click "Next: Configure Security Group". 
7) Create a new security group called "grafluent". Open up the required ports (22 and 80). Click "Review and Launch". 
8) Review your configurations and then click "Launch" when satisfied. 

### Associate Elastic IP 
1) On the side panel of EC2 screen, click on "Elastic IPs". 
2) Create a new Elastic IP, click on "Allocate Elastic IP address". 
3) Select "Amazon's pool of IPv4 addresses" and click "Allocate". 
4) Select your new EIP and click on "Actions", then "Associate Elastic IP". 
5) Search for the instance created above and then click "Associate". 
Now your EC2 instance can always be reached by the same IP address. 

### Setting up AWS permissions
These are high-level instructions. For more detailed information, please refer to the AWS documentation.
1) From the AWS Console, navigate to Services tab and click on IAM under "Security, Identity, Compliance".
2) Under policies, create a new policy that allows S3 access to this particular bucket. 
3) Under groups, create a grafluent group which inherits the above policy. 
4) Under users, create a user called grafluent and to the above group (or add policies directly). Then create access keys which will be provided later to docker containers via env variables.
5) Under roles, create new role and provide it the policy created above. 

### Deploy Docker Containers
1) SSH into the EC2 instance. 
2) Login into super user. 
```bash
sudo -i
```
3) Run the below command to see whether arangodb and sqlite directories have been created. These should have been created as part of the AWS launch script. This is where the Docker volumes are mounted. 
```bash
ls /home/volumes/
```
4) Run the below command 
```bash
docker images
```
You should see the following images:
arangodb
* rakan41/grafluent:database_module
* rakan41/grafluent:data_api
* rakan41/grafluent:nlp_module

If not, please pull them from docker repo. 

7) Download a copy of the "grafluent.ini" file from the repo folder "config_template" to your local. This is template config file that will be used to set the environment variables for the Docker containers. It should look like the below. 
```
[default]
# AWS
# aws credentials  
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=ap-southeast-2
# aws parameters (change bucket if grafluent is deployed on another bucket)
DEFAULT_BUCKET=grafluent

# DATABASE MODULE
# arango_parameters
ARANGO_HOST=
ARANGO_PORT=8529
ARANGO_ROOT_PASSWORD=
# flask parameters
LISTEN_PORT=6969
FLASK_APP=main.py
FLASK_RUN_HOST=0.0.0.0

# DATA API MODULE
# twitter
twitter_API_key=
twitter_API_secret=
twitter_access_token=
twitter_access_token_secret=
# news
news_API_key=

# WWWW-EDGE Module 
GRAPH_ENDPOINT=
DATA_API_ENDPOINT=
NLP_ENDPOINT=
NLP_CONFIG_ARANGO=
JWT_SECRET=
AWS_S3_BUCKET=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_REGION=ap-southeast-2
```

8) Create a file "grafluent_nlp.ini" and enter the details below:
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=ap-southeast-2
```

9) Once completed, then copy to /home/ubuntu/grafluent/ on the EC2 instance (via scp or WinSCP). 

10) Run the following docker commands to deploy the containers. NOTE: Please ensure your current path is /home/ubuntu/grafluent/ as that is where the config file is located. 

``` bash
# deploy Arango docker container
docker run -d --name arango_container --env-file=grafluent.ini -p 8529:8529 -v /home/volumes/arangodb/:/var/lib/arangodb3  arangodb

# deploy database_module
docker run -d -p 6969:6969 --name database_module --env-file=grafluent.ini -v /home/volumes/sqlite:/db rakan41/grafluent:database_module

# deploy data_api
docker run -d -p 8989:8989 --name data_api_module --env-file=grafluent.ini rakan41/grafluent:data_api

# deploy nlp_module
docker run -d -p 6970:6970 --name nlp_module --env-file=grafluent_nlp.ini rakan41/grafluent:nlp_module
```
