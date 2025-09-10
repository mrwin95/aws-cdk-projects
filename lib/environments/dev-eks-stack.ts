import { Stack, StackProps, Fn } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { EksConstruct } from "../base/eks-construct";
import * as iam from "aws-cdk-lib/aws-iam";
export class DevEksStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const azs = this.availabilityZones;
    const pubIds = azs.map((_, i) => this.importValue(`SharedPublicSubnet${i}`));
    const publicSubnetIds = [
      this.importValue("SharedPublicSubnet0"),
      this.importValue("SharedPublicSubnet1"),
      this.importValue("SharedPublicSubnet2"),
    ];

    const priIds = azs.map((_, i) =>
      this.importValue(`SharedPrivateSubnet${i}`)
    );
    const privateSubnetIds = [
      this.importValue("SharedPrivateSubnet0"),
      this.importValue("SharedPrivateSubnet1"),
      this.importValue("SharedPrivateSubnet2"),
    ];

    const pubRts = azs.map((_, i) =>
      this.importValue(`SharedPublicSubnetRouteTable${i}`)
    );

    const publicSubnetRouteTableIds = [
      this.importValue("SharedPublicSubnetRouteTable0"),
      this.importValue("SharedPublicSubnetRouteTable1"),
      this.importValue("SharedPublicSubnetRouteTable2"),
    ];

    const priRts = azs.map((_, i) =>
      this.importValue(`SharedPrivateSubnetRouteTable${i}`)
    );
    const privateSubnetRouteTableIds = [
      this.importValue("SharedPrivateSubnetRouteTable0"),
      this.importValue("SharedPrivateSubnetRouteTable1"),
      this.importValue("SharedPrivateSubnetRouteTable2"),
    ];

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

    // import iam role from IamAdminRoleStack
    const eksAdminRole = iam.Role.fromRoleName(
      this,
      "ImportedEKSAdminRole",
      process.env.IAM_ADMIN_ROLE_NAME ?? "DevEksAdminRole"
    );

    // map iam role to system:masters in aws-auth configmap
    cluster.awsAuth.addMastersRole(eksAdminRole);
  }

  private importValue(exportName: string): string {
    return Stack.of(this).resolve({ "Fn::ImportValue": exportName }) as string;
  }
}
