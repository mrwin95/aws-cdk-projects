import { Stack, StackProps, Fn } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { EksConstruct } from "../base/eks-construct";
import * as iam from "aws-cdk-lib/aws-iam";
export class DevEksStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const publicSubnetIds = [
      this.importValue("SharedPublicSubnet0"),
      this.importValue("SharedPublicSubnet1"),
      this.importValue("SharedPublicSubnet2"),
    ];

    const privateSubnetIds = [
      this.importValue("SharedPrivateSubnet0"),
      this.importValue("SharedPrivateSubnet1"),
      this.importValue("SharedPrivateSubnet2"),
    ];

    const publicSubnetRouteTableIds = [
      this.importValue("SharedPublicSubnetRouteTable0"),
      this.importValue("SharedPublicSubnetRouteTable1"),
      this.importValue("SharedPublicSubnetRouteTable2"),
    ];

    const privateSubnetRouteTableIds = [
      this.importValue("SharedPrivateSubnetRouteTable0"),
      this.importValue("SharedPrivateSubnetRouteTable1"),
      this.importValue("SharedPrivateSubnetRouteTable2"),
    ];

    const vpc = ec2.Vpc.fromVpcAttributes(this, "ImportedVPC", {
      vpcId: this.importValue("SharedVpcId"),
      availabilityZones: this.availabilityZones,
      publicSubnetIds,
      publicSubnetRouteTableIds,
      privateSubnetIds,
      privateSubnetRouteTableIds,
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
