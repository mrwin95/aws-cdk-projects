import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
export class EksAdminUserStack extends Stack {
  readonly eksAdminUser: iam.User;

  constructor(scope: Construct, id: string, props?: StackProps) {
    //
    super(scope, id, props);

    // create IAM Admin User
    const eksAdminUser = new iam.User(this, "EKSAdminUser", {
      userName: process.env.EKS_ADMIN_USER_NAME ?? "eks-admin-user",
    });

    // grant eksAdminUser to assume eksAdminRole
    eksAdminUser.addToPolicy(
      new iam.PolicyStatement({
        actions: ["sts:DescribeCluster", "sts:AssumeRole"],
        resources: ["*"],
      })
    );

    // map eksAdminUser to eksAdminRole in aws-auth configmap

    new CfnOutput(this, "EksAdminUserArn", {
      value: eksAdminUser.userArn,
      exportName: "EksAdminUserArn",
    });

    this.eksAdminUser = eksAdminUser;
  }
}
