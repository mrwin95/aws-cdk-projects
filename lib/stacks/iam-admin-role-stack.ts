import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
export class IamAdminRoleStack extends Stack {
  readonly eksAdminRole: iam.Role;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //create IAM Admin Role
    const eksAdminRole = new iam.Role(this, "EKSAdminRole", {
      assumedBy: new iam.AccountPrincipal(this.account),
      roleName: process.env.IAM_ADMIN_ROLE_NAME ?? "DevEksAdminRole",
      description: "IAM role for EKS administrators with kubectl access",
    });

    eksAdminRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["eks:DescribeCluster"],
        resources: ["*"],
      })
    );

    this.eksAdminRole = eksAdminRole;
  }
}
