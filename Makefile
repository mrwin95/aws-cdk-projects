AWS_PROFILE ?= ausan

AWS_ACCOUNT := $(shell AWS_PROFILE=$(AWS_PROFILE) aws sts get-caller-identity --query Account --output text)
AWS_REGION  := $(shell AWS_PROFILE=$(AWS_PROFILE) aws configure get region)
IMAGE_REPO := 442042528400.dkr.ecr.ap-south-1.amazonaws.com/demo-node-ts-backend-eks
IMAGE_TAG := latest
bootstrap:
	@echo "Bootstrapping CDK... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk bootstrap aws://$(AWS_ACCOUNT)/$(AWS_REGION)
list:
	AWS_PROFILE=$(AWS_PROFILE) cdk list
diff:
	AWS_PROFILE=$(AWS_PROFILE) cdk diff --all
deploy:
	@echo "Deploying CDK... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk deploy --all --require-approval never
deploy-vpc:
	@echo "Deploying CDK VPC... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk deploy VpcStack --require-approval never
deploy-admin-role:
	@echo "Deploying CDK IAM Role... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk deploy IamAdminRoleStack --require-approval never
deploy-dev:
	@echo "Deploying CDK to dev... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk deploy DevEksStack --require-approval never
deploy-ecr:
	@echo "Deploying CDK ECR... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk deploy EcrStack --require-approval never
synth:
	AWS_PROFILE=$(AWS_PROFILE) cdk synth
context:
	AWS_PROFILE=$(AWS_PROFILE) cdk context
doctor:
	AWS_PROFILE=$(AWS_PROFILE) cdk doctor
destroy:
	@echo "Destroying CDK... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk destroy --all
destroy-dev:
	@echo "Destroying CDK in dev... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk destroy DevEksStack
destroy-vpc:
	@echo "Destroying CDK VPC... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk destroy VpcStack
docker-build-multiarch:
	docker buildx build --platform linux/amd64,linux/arm64 -t $(IMAGE_REPO):$(IMAGE_TAG) -f ./demo-apps/Dockerfile . --push
docker-build-amd64:
	docker buildx build --platform linux/amd64 -t $(IMAGE_REPO):$(IMAGE_TAG) -f ./demo-apps/Dockerfile . --push