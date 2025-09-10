import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CustomVpc } from "./base/vpc-construct";

export class VpcStack extends Stack {
  readonly vpcId: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const customVpc = new CustomVpc(this, "CustomVpc", {
      vpcCidr: "10.30.0.0/16",
      maxAzs: 3,
      natGateways: 1,
      enableEndpoint: true,
      enableFlowLogs: true,
      azs: this.availabilityZones,
      //   azs: this.availabilityZones.slice(0, 2),
    });

    this.vpcId = customVpc.vpc.vpcId;

    new CfnOutput(this, "VpcId", {
      value: customVpc.vpc.vpcId,
      exportName: "SharedVpcId",
    });

    new CfnOutput(this, "PublicSubnetIds", {
      value: customVpc.vpc.publicSubnets
        .map((subnet) => subnet.subnetId)
        .join(","),
    });

    new CfnOutput(this, "PrivateSubnetIds", {
      value: customVpc.vpc.privateSubnets
        .map((subnet) => subnet.subnetId)
        .join(","),
    });
  }
}
