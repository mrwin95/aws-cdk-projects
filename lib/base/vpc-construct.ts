import { Stack } from "aws-cdk-lib";
// import { IpAddresses, Subnet, Vpc } from "aws-cdk-lib/aws-ec2";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface CustomVpcProps {
  vpcCidr?: string;
  azs: string[];
  maxAzs?: number;
  natGateways?: number;
  enableEndpoint?: boolean;
  enableFlowLogs?: boolean;
}

export class CustomVpc extends Construct {
  readonly vpc: ec2.Vpc;
  readonly publicSubnets: ec2.Subnet[];
  readonly privateSubnets: ec2.Subnet[];

  constructor(scope: Construct, id: string, props: CustomVpcProps) {
    super(scope, id);

    // const stack = Stack.of(this);
    // const vpcCidr = props.vpcCidr ?? "10.20.0.0/16";
    // const azs = props.azs.slice(0, 2); // Limit to 2 AZs for simplicity

    // // vpc no default subnets

    // const vpc = new ec2.Vpc(this, "VPC", {
    //   ipAddresses: ec2.IpAddresses.cidr(vpcCidr),
    //   subnetConfiguration: [],
    // });

    this.vpc = new ec2.Vpc(this, "CustomVPC", {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr ?? "10.30.0.0/16"),
      maxAzs: props.maxAzs ?? 2,
      natGateways: props.natGateways ?? 1,
      subnetConfiguration: [
        {
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 19,
        },
        {
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 20,
        },
      ],
    });

    if (props?.enableEndpoint) {
      // Add VPC endpoints for S3 and DynamoDB
      this.vpc.addGatewayEndpoint("S3Endpoint", {
        service: ec2.GatewayVpcEndpointAwsService.S3,
        subnets: [
          {
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          },
        ],
      });

      this.vpc.addInterfaceEndpoint("SecretsManagerEndpoint", {
        service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
        subnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      });
    }
  }
}
