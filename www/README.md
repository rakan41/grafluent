# Building www and deploying www

### Requirements

- Node JS v12 or newer
- \*NIX Like OS (Windows user, please use WSL)

### Steps

1. Install libraries and dependencies by issuing this command:

```

npm install

```

2. Configure endpoints for `www-edge` and `graph-exporter`. Open `package.json`, and find the `build` section as following:

```json
{
...
  "scripts": {
    ...
    "build": "REACT_APP_EDGE_ENDPOINT=https://grafluent-edge.herokuapp.com REACT_APP_GRAPH_ENDPOINT=https://grafluent-share.herokuapp.com react-scripts build",
    ...
  },
...
}

```

replace the endpoints as required.

3. Build static files by running this command:

```
npm run build
```

4. Upload all files in the `build/` folder into a S3 bucket and configure static web hosting. For more instruction, please follow [this link](https://support.cloudflare.com/hc/en-us/articles/360037983412-Configuring-an-Amazon-Web-Services-static-site-to-use-Cloudflare) or [this link](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html).
