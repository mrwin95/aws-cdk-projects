import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CustomVpc } from "./base/vpc-construct";

export class VpcStack extends Stack {
  readonly vpcId: string;
  readonly publicSubnetIds: string[];
  readonly privateSubnetIds: string[];

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new CustomVpc(this, "SharedVpc", {
      vpcCidr: "10.30.0.0/16",
      maxAzs: 3,
      natGateways: 1,
      enableEndpoint: true,
      enableFlowLogs: true,
      //   azs: this.availabilityZones,
      //   azs: this.availabilityZones.slice(0, 2),
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

    // this.privateSubnetIds = vpc.privateSubnets.map((s) => s.subnetId);

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

  private importValue(name: string): string {
    return Stack.of(this).resolve({ "Fn::ImportValue": name }) as string;
  }
}
