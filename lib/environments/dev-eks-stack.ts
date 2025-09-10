import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { EksConstruct } from "../base/eks-construct";
export class DevEksStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromVpcAttributes(this, "ImportedVPC", {
      vpcId: this.importValue("SharedVpcId"),
      availabilityZones: this.availabilityZones,
      publicSubnetIds: this.importValue("SharedPublicSubnetIds").split(","),
      privateSubnetIds: this.importValue("SharedPrivateSubnetIds").split(","),
    });

    const eks = new EksConstruct(this, "DevEks", {
      clusterName: "dev-eks",
      vpc,
    }).cluster;
  }

  private importValue(name: string): string {
    return Stack.of(this).resolve({ "Fn::ImportValue": name }) as string;
  }
}
