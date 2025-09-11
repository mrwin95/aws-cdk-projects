import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as cdk from "aws-cdk-lib";

export interface EcrConstructProps {
  repositoryName: string;
  lifecycleDays?: number;
}

export class EcrConstruct extends Construct {
  readonly repository: ecr.IRepository;
  constructor(scope: Construct, id: string, props: EcrConstructProps) {
    super(scope, id);

    this.repository = new ecr.Repository(this, "EcrRepository", {
      repositoryName: props.repositoryName,
      imageScanOnPush: true,
      lifecycleRules: props.lifecycleDays
        ? [
            {
              description: `Expire images older than ${props.lifecycleDays} days`,
              maxImageAge: cdk.Duration.days(props.lifecycleDays),
            },
          ]
        : undefined,
      removalPolicy:
        process.env.ECR_DESTROY_REPOSITORIES === "true"
          ? cdk.RemovalPolicy.DESTROY
          : cdk.RemovalPolicy.RETAIN, // NOT recommended for production code
    });
  }
}
