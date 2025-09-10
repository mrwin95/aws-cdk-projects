import { Stack, StackProps, Fn } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { EksConstruct } from "../base/eks-construct";
import { Tags } from "aws-cdk-lib";
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

    new EksConstruct(this, "DevEks", {
      clusterName: process.env.EKS_CLUSTER_NAME ?? "dev-eks",
      vpc,
    }).cluster;
  }

  private importValue(exportName: string): string {
    return Stack.of(this).resolve({ "Fn::ImportValue": exportName }) as string;
  }
}
