import { Stack } from "aws-cdk-lib";
import { IpAddresses, Subnet, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface CustomVpcProps {
  vpcCidr?: string;
  azs: string[];
  enableFlowLogs?: boolean;
}

export class CustomVpc extends Construct {
  readonly vpc: Vpc;
  readonly publicSubnets: Subnet[];
  readonly privateSubnets: Subnet[];
  constructor(scope: Construct, id: string, props: CustomVpcProps) {
    super(scope, id);

    const stack = Stack.of(this);
    const vpcCidr = props.vpcCidr ?? "10.20.0.0/16";
    const azs = props.azs.slice(0, 2); // Limit to 2 AZs for simplicity

    // vpc no default subnets

    const vpc = new Vpc(this, "VPC", {
      ipAddresses: IpAddresses.cidr(vpcCidr),
      subnetConfiguration: [],
    });

    this.vpc = vpc;
  }
}
