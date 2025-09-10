import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";

export interface EksConstructProps {
  vpc: ec2.IVpc;
  clusterName: string;
  version?: eks.KubernetesVersion;
}

export class EksConstruct extends Construct {
  readonly cluster: eks.Cluster;

  constructor(scope: Construct, id: string, props: EksConstructProps) {
    super(scope, id);

    this.cluster = new eks.Cluster(this, "EKSCluster", {
      vpc: props.vpc,
      clusterName: props.clusterName,
      version: props.version ?? eks.KubernetesVersion.V1_30,
      defaultCapacity: 2,
      defaultCapacityInstance: new ec2.InstanceType("t3.medium"),
    });
  }
}
