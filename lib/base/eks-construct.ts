import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as iam from "aws-cdk-lib/aws-iam";
import { KubectlV31Layer } from "@aws-cdk/lambda-layer-kubectl-v31";
import { KubectlV32Layer } from "@aws-cdk/lambda-layer-kubectl-v32";
import { KubectlV33Layer } from "@aws-cdk/lambda-layer-kubectl-v33";

import { Construct } from "constructs";
import { parserEksVersion } from "../helpers/helper.common";
import { Role } from "aws-cdk-lib/aws-iam";

export interface EksConstructProps {
  vpc: ec2.IVpc;
  clusterName: string;
  version?: eks.KubernetesVersion;
}

export class EksConstruct extends Construct {
  readonly cluster: eks.Cluster;

  constructor(scope: Construct, id: string, props: EksConstructProps) {
    super(scope, id);

    const version = props.version ?? parserEksVersion(process.env.EKS_VERSION);

    console.log(`EKS Version: ${version.version}`);

    this.cluster = new eks.Cluster(this, "EKSCluster", {
      vpc: props.vpc,
      clusterName: props.clusterName,
      version: version,
      defaultCapacity: 0, // don't create default worker nodes
      defaultCapacityInstance: new ec2.InstanceType(
        process.env.EKS_NODE_TYPE ?? "t3.medium"
      ),
      kubectlLayer: this.resolveKubectlLayer(version),
    });

    // Node group 1

    const backendNodes = this.cluster.addNodegroupCapacity("WorkerNode1", {
      nodegroupName: process.env.EKS_NODEGROUP1_NAME ?? "eks-nodegroup-1",
      desiredSize: parseInt(process.env.EKS_NODEGROUP1_DESIRED_SIZE ?? "1"),
      minSize: parseInt(process.env.EKS_NODEGROUP1_MIN_SIZE ?? "1"),
      maxSize: parseInt(process.env.EKS_NODEGROUP1_MAX_SIZE ?? "2"),
      labels: {
        role: "backend",
      },
      tags: {
        Name: process.env.EC2_NODE1_NAME ?? "eks-nodegroup-1",
        Role: "Backend",
      },
    });

    // add ecr role

    backendNodes.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonEC2ContainerRegistryReadOnly"
        //     "ecr:GetAuthorizationToken",
        //   "ecr:BatchCheckLayerAvailability",
        //   "ecr:GetDownloadUrlForLayer",
        //   "ecr:BatchGetImage",
      )
    );
    // Node group 1

    const frontendNodes = this.cluster.addNodegroupCapacity("WorkerNode2", {
      nodegroupName: process.env.EKS_NODEGROUP2_NAME ?? "eks-nodegroup-2",
      desiredSize: parseInt(process.env.EKS_NODEGROUP2_DESIRED_SIZE ?? "1"),
      minSize: parseInt(process.env.EKS_NODEGROUP2_MIN_SIZE ?? "1"),
      maxSize: parseInt(process.env.EKS_NODEGROUP2_MAX_SIZE ?? "2"),
      labels: {
        role: "frontend",
      },
      tags: {
        Name: process.env.EC2_NODE2_NAME ?? "eks-nodegroup-2",
        Role: "Frontend",
      },
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
        return new KubectlV32Layer(this, "KubectlV32Layer");
    }
  }
}
