# Building

### Requirements

- Docker stable

### Steps

1. Run the following command to build the image

```bash
cd www-edge
docker build . -t <YOUR CUSTOM TAG NAME>
```

to push the image to Docker Registry, make sure you supply a valid docker tag.

2. Push to Docker Regisistry by running:

```bash
docker push <YOUR CUSTOM TAG NAME>
```

# Running

## Environment Variables (www-edge only)

The following is the example of environment variables you can set:

```
PORT=7766
GRAPH_ENDPOINT=http://3.106.96.72:6969
DATA_API_ENDPOINT=http://3.106.96.72:8989
NLP_ENDPOINT=http://3.24.207.187:6970
NLP_CONFIG_ARANGO=3.106.96.72:6969
JWT_SECRET=         *retracted*
AWS_S3_BUCKET=grafluent
AWS_ACCESS_KEY=     *retracted*
AWS_SECRET_KEY=     *retracted*
AWS_REGION=ap-southeast-2
```

Save the env as a file, for example: `config.env`. Then, run the app by using this command:

```bash
docker run --name <<custom name if you like> -p 7766:7766 --env-file config.env <<DOCKER TAG>>
```

# Deploying to EBS

It is recommended to deploy `www-edge` and `graph-exporter` with Elastic Bean Stalk since SSL privisioning is done by the system. To deploy to EBS, please [follow this instruction](https://medium.com/@sommershurbaji/deploying-a-docker-container-to-aws-with-elastic-beanstalk-28adfd6e7e95).
