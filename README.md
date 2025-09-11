# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


Login docker:

aws ecr get-login-password --region ap-south-1 --profile ausan \
  | docker login --username AWS --password-stdin xxxx.dkr.ecr.ap-south-1.amazonaws.com/demo-node-ts-backend-eks

docker tag:

docker tag demo-node-ts-backend-eks:latest xxxxx.dkr.ecr.ap-south-1.amazonaws.com/demo-node-ts-backend-eks:latest


docker push xxx.dkr.ecr.ap-south-1.amazonaws.com/demo-node-ts-backend-eks:latest