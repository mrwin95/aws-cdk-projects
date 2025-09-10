import { CfnOutput, Stack, StackProps, Tag } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CustomVpc } from "./base/vpc-construct";

export class VpcStack extends Stack {
  readonly vpcId: string;
  readonly publicSubnetIds: string[];
  readonly privateSubnetIds: string[];

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new CustomVpc(this, "SharedVpc", {
      vpcCidr: process.env.VPC_CIDR ?? "10.30.0.0/16",
      maxAzs: process.env.VPC_MAX_AZS ? parseInt(process.env.VPC_MAX_AZS) : 2,
      natGateways: process.env.VPC_NAT_GATEWAY
        ? parseInt(process.env.VPC_NAT_GATEWAY)
        : 1,
      enableEndpoint: process.env.ENABLE_VPC_ENDPOINT === "true",
      enableFlowLogs: process.env.ENABLE_VPC_FLOW_LOGS === "true",
    }).vpc;

    this.vpcId = vpc.vpcId;

    // this.publicSubnetIds = vpc.publicSubnets.map((s) => s.subnetId);
    // this.privateSubnetIds = vpc.privateSubnets.map((s) => s.subnetId);
    vpc.publicSubnets.forEach((subnet, index) => {
      new CfnOutput(this, `SharedPublicSubnet${index}`, {
        value: subnet.subnetId,
        exportName: `SharedPublicSubnet${index}`,
      });
    });

    vpc.privateSubnets.forEach((subnet, index) => {
      new CfnOutput(this, `SharedPrivateSubnet${index}`, {
        value: subnet.subnetId,
        exportName: `SharedPrivateSubnet${index}`,
      });
    });

    vpc.publicSubnets.forEach((subnet, index) => {
      new CfnOutput(this, `SharedPublicSubnetRouteTable${index}`, {
        value: subnet.routeTable.routeTableId,
        exportName: `SharedPublicSubnetRouteTable${index}`,
      });
    });

    vpc.privateSubnets.forEach((subnet, index) => {
      new CfnOutput(this, `SharedPrivateSubnetRouteTable${index}`, {
        value: subnet.routeTable.routeTableId,
        exportName: `SharedPrivateSubnetRouteTable${index}`,
      });
    });

    new CfnOutput(this, "SharedVpcId", {
      value: this.vpcId,
      exportName: "SharedVpcId",
    });

    new CfnOutput(this, "SharedPublicSubnetCount", {
      value: vpc.publicSubnets.length.toString(),
      exportName: "SharedPublicSubnetCount",
    });

    new CfnOutput(this, "SharedPrivateSubnetCount", {
      value: vpc.privateSubnets.length.toString(),
      exportName: "SharedPrivateSubnetCount",
    });
  }
}
