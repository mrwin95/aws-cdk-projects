import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import { KubectlV31Layer } from "@aws-cdk/lambda-layer-kubectl-v31";
import { KubectlV32Layer } from "@aws-cdk/lambda-layer-kubectl-v32";
import { KubectlV33Layer } from "@aws-cdk/lambda-layer-kubectl-v33";

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

    const version = props.version ?? eks.KubernetesVersion.V1_31;

    this.cluster = new eks.Cluster(this, "EKSCluster", {
      vpc: props.vpc,
      clusterName: props.clusterName,
      version: props.version ?? eks.KubernetesVersion.V1_30,
      defaultCapacity: 2,
      defaultCapacityInstance: new ec2.InstanceType("t3.medium"),
      kubectlLayer: this.resolveKubectlLayer(version),
    });
  }

  private resolveKubectlLayer(version: eks.KubernetesVersion) {
    switch (version.version) {
      case "1.31":
        return new KubectlV31Layer(this, "KubectlV31Layer");
      case "1.32":
        return new KubectlV32Layer(this, "KubectlV32Layer");
      case "1.33":
        return new KubectlV33Layer(this, "KubectlV33Layer");
      default:
        return new KubectlV31Layer(this, "KubectlV31Layer");
    }
  }
}
