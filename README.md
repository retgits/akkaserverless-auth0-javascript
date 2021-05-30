# akkaserverless-auth0-javascript

A JavaScript-based example on how to secure [Akka Serverless](https://akkaserverless.com) apps with [Auth0](https://auth0.com)

## What is this example?

To help you get started with Akka Serverless, we've built some example apps that showcase the capabilities of the platform and integrations with other SaaS tools. This example application shows an Action which validates JWT tokens, signed by Auth0.

## Prerequisites

To build and deploy this example application, you'll need to have:

* An [Akka Serverless account](https://developer.lightbend.com/docs/akka-serverless/getting-started/lightbend-account.html)
* Node.js v14 or higher installed
* The Docker CLI installed
* An account with [Auth0](https://auth0.com/signup)

## Build, Deploy, and Test

After signing up for Auth0:

* Create a new API (`Application -> APIs`) with `RS256` as the signing algorithm
* Update line 42 of `greetingservice.js` with the HTTP header name you want to use for the token (it's `X-Custom-JWT-Auth` in this example) and change `<your tenant>` to your Auth0 username

### Build your container

To build your own containers, execute the below command:

```bash
## Set your dockerhub username
export DOCKER_REGISTRY=docker.io
export DOCKER_USER=<your dockerhub username>

## Run the npm install command
npm install

## Build container
docker build . -t $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-auth0-javascript:1.0.0
```

### Deploy your container

To deploy the containers as a service in Akka Serverless, you'll need to:

```bash
## Set your dockerhub username
export DOCKER_REGISTRY=docker.io
export DOCKER_USER=<your dockerhub username>

## Push the container to a container registry
docker push $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-auth0-javascript:1.0.0

## Set your Akka Serverless project name
export AKKASLS_PROJECT=<your project>

## Deploy the service to your Akka Serverless project
akkasls svc deploy greetingservice $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-auth0-javascript:1.0.0 --project $AKKASLS_PROJECT
```

### Testing your service

To test your services, you'll first need to expose them on a public URL:

```bash
## Set your Akka Serverless project name
export AKKASLS_PROJECT=<your project>

## Expose the service with a public HTTP endpoint
akkasls svc expose greetingservice --enable-cors --project $AKKASLS_PROJECT
```

Next, you'll have to get the Access Token for an application that's authorized to access your API. If you've created a new API in Auth0, it'll automatically create a new application for you to test called `<name of your API> (Test Application)`. When you go to `Applications -> APIs -> <your API> -> Test` in Auth0, that application is selected by default and under the response heading, you can see the `access_token`.

From there, you can use the endpoints with the below cURL command:

#### A successful request

```bash
## Set your Access Token
export ACCESS_TOKEN=<your access token>

## Send a request
curl --request POST \
  --url https://<your Akka Serverless endpoint>/greet \
  --header 'Content-Type: application/json' \
  --header 'X-Custom-JWT-Auth: '$ACCESS_TOKEN'' \
  --data '{
    "name": "Leon",
    "greeting": "Hello"
}'
```

Should result in:

```bash
{"message":"Hello, Leon!"}
```

#### An unsuccessful request

```bash
## Set your Access Token to something invalid
export ACCESS_TOKEN=1234

## Send a request
curl --request POST \
  --url https://<your Akka Serverless endpoint>/greet \
  --header 'Content-Type: application/json' \
  --header 'X-Custom-JWT-Auth: '$ACCESS_TOKEN'' \
  --data '{
    "name": "Leon",
    "greeting": "Hello"
}'
```

Should result in:

```bash
Error: Unable to obtain valid JWT token
```

### Testing your services locally

To test your service locally, you'll need to run the proxy on your own machine and use the containers you've built.

```bash
## Set your dockerhub username
export DOCKER_REGISTRY=docker.io
export DOCKER_USER=<your dockerhub username>

## Create a docker bridged network
docker network create -d bridge akkasls

## Run your userfunction
docker run -d --name userfunction --hostname userfunction --network akkasls $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-auth0-javascript:1.0.0

## Run the proxy
docker run -d --name proxy --network akkasls -p 9000:9000 --env USER_FUNCTION_HOST=userfunction gcr.io/akkaserverless-public/akkaserverless-proxy:0.7.0-beta.9 -Dconfig.resource=dev-mode.conf -Dcloudstate.proxy.protocol-compatibility-check=false
```

To clean it all up, you can run

```bash
docker stop userfunction
docker rm userfunction
docker stop proxy
docker rm proxy
docker network rm akkasls
```

## Contributing

We welcome all contributions! [Pull requests](https://github.com/retgits/akkaserverless-auth0-javascript/pulls) are the preferred way to share your contributions. For major changes, please open [an issue](https://github.com/retgits/akkaserverless-auth0-javascript/issues) first to discuss what you would like to change.

## License

See the [LICENSE](./LICENSE).