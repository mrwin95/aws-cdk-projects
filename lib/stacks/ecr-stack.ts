import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EcrConstruct } from "../base/ecr-construct";
export class EcrStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const ecrRepo = new EcrConstruct(this, "MyEcrRepo", {
      repositoryName: process.env.DEMO_APP_ECR_NAME ?? "my-ecr-repo",
      lifecycleDays: Number.parseInt(
        process.env.DEMO_APP_ECR_LIFECYCLE_DAYS ?? "30",
        10
      ),
    }).repository;

    new CfnOutput(this, "EcrRepositoryUri", {
      value: ecrRepo.repositoryUri,
      description: "The URI of the ECR repository",
      exportName: "EcrRepositoryUri",
    });
  }
}
