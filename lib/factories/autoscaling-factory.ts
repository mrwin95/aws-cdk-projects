import * as eks from "aws-cdk-lib/aws-eks";
export class AutoScalingFactory {
  static enableAutoScaling(cluster: eks.Cluster) {
    // cluster.clusterAutoscaler = true; // flag for clarity
  }
}
