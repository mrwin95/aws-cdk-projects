AWS_PROFILE ?= ausan

AWS_ACCOUNT := $(shell AWS_PROFILE=$(AWS_PROFILE) aws sts get-caller-identity --query Account --output text)
AWS_REGION  := $(shell AWS_PROFILE=$(AWS_PROFILE) aws configure get region)

bootstrap:
	@echo "Bootstrapping CDK... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk bootstrap aws://$(AWS_ACCOUNT)/$(AWS_REGION)
list:
	AWS_PROFILE=$(AWS_PROFILE) cdk list
diff:
	AWS_PROFILE=$(AWS_PROFILE) cdk diff
deploy:
	@echo "Deploying CDK... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk deploy
deploy-dev:
	@echo "Deploying CDK to dev... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk deploy DevEksStack --require-approval never
synth:
	AWS_PROFILE=$(AWS_PROFILE) cdk synth
context:
	AWS_PROFILE=$(AWS_PROFILE) cdk context
doctor:
	AWS_PROFILE=$(AWS_PROFILE) cdk doctor
destroy:
	@echo "Destroying CDK... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk destroy
destroy-dev:
	@echo "Destroying CDK in dev... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk destroy DevEksStack
destroy-vpc:
	@echo "Destroying CDK VPC... Using profile $(AWS_PROFILE) in account $(AWS_ACCOUNT) and region $(AWS_REGION)"
	AWS_PROFILE=$(AWS_PROFILE) cdk destroy VpcStack