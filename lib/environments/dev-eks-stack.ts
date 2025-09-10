import { Stack, StackProps, Fn } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { EksConstruct } from "../base/eks-construct";
import * as cdk from "aws-cdk-lib";
export class DevEksStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const publicSubnetIds = [
      Fn.importValue("SharedPublicSubnet0"),
      Fn.importValue("SharedPublicSubnet1"),
      Fn.importValue("SharedPublicSubnet2"),
    ];

    const privateSubnetIds = [
      Fn.importValue("SharedPrivateSubnet0"),
      Fn.importValue("SharedPrivateSubnet1"),
      Fn.importValue("SharedPrivateSubnet2"),
    ];

    const vpc = ec2.Vpc.fromVpcAttributes(this, "ImportedVPC", {
      vpcId: this.importValue("SharedVpcId"),
      availabilityZones: this.availabilityZones,
      publicSubnetIds,
      privateSubnetIds,
    });

    new EksConstruct(this, "DevEks", {
      clusterName: "dev-eks",
      vpc,
    }).cluster;
  }

  private importValue(exportName: string): string {
    return Stack.of(this).resolve({ "Fn::ImportValue": exportName }) as string;
  }
}
