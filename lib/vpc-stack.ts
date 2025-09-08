import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CustomVpc } from "./constructs/custom-vpc";

export class VpcStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const customVpc = new CustomVpc(this, "CustomVpc", {
      azs: this.availabilityZones.slice(0, 2),
    });

    new CfnOutput(this, "VpcId", {
      value: customVpc.vpc.vpcId,
    });
  }
}
