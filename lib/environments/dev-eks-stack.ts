import { Stack, StackProps, Fn } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { EksConstruct } from "../base/eks-construct";
import * as iam from "aws-cdk-lib/aws-iam";
import { NginxIngressConstruct } from "../addons/nginx-ingress-construct";
export class DevEksStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const azs = this.availabilityZones;
    const pubIds = azs.map((_, i) => this.importValue(`SharedPublicSubnet${i}`));

    const priIds = azs.map((_, i) =>
      this.importValue(`SharedPrivateSubnet${i}`)
    );

    const pubRts = azs.map((_, i) =>
      this.importValue(`SharedPublicSubnetRouteTable${i}`)
    );

    const priRts = azs.map((_, i) =>
      this.importValue(`SharedPrivateSubnetRouteTable${i}`)
    );

    const vpc = ec2.Vpc.fromVpcAttributes(this, "ImportedVPC", {
      vpcId: this.importValue("SharedVpcId"),
      availabilityZones: azs,
      publicSubnetIds: pubIds,
      publicSubnetRouteTableIds: pubRts,
      privateSubnetIds: priIds,
      privateSubnetRouteTableIds: priRts,
    });

    const cluster = new EksConstruct(this, "DevEks", {
      clusterName: process.env.EKS_CLUSTER_NAME ?? "dev-eks",
      vpc,
    }).cluster;

    //
    // const eksAdminUserArn = this.importValue("EksAdminUserArn");
    const eksAdminUser = iam.User.fromUserAttributes(
      this,
      "ImportedEksAdminUser",
      {
        userArn: Fn.importValue("EksAdminUserArn"),
      }
    );
    // import iam role from IamAdminRoleStack
    const eksAdminRole = iam.Role.fromRoleName(
      this,
      "ImportedEKSAdminRole",
      process.env.IAM_ADMIN_ROLE_NAME ?? "DevEksAdminRole"
    );

    cluster.awsAuth.addUserMapping(eksAdminUser, {
      username: eksAdminUser.userName,
      groups: ["system:masters"],
    });
    // map iam role to system:masters in aws-auth configmap
    cluster.awsAuth.addMastersRole(eksAdminRole);

    // add nginx ingress addon

    new NginxIngressConstruct(this, "NginxIngress", {
      cluster: cluster,
      internetFacing: true,
      //   sslCertificateArn: process.env.SSL_CERT_ARN,
    });
  }

  private importValue(exportName: string): string {
    return Stack.of(this).resolve({ "Fn::ImportValue": exportName }) as string;
  }
}
