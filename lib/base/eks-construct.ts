import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as iam from "aws-cdk-lib/aws-iam";

import { Construct } from "constructs";
import { parserEksVersion, resolveKubectlLayer } from "../helpers/helper.common";

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
      kubectlLayer: resolveKubectlLayer(this, version),
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

    frontendNodes.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonEC2ContainerRegistryReadOnly"
        //     "ecr:GetAuthorizationToken",
        //   "ecr:BatchCheckLayerAvailability",
        //   "ecr:GetDownloadUrlForLayer",
        //   "ecr:BatchGetImage",
      )
    );
  }
}
