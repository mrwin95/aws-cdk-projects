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