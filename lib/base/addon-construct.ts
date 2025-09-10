import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
export class AddOnConstruct extends Construct {
  constructor(scope: Construct, id: string, cluster: eks.Cluster) {
    super(scope, id);

    cluster.addHelmChart("MetricsServer", {
      repository: "https://kubernetes-sigs.github.io/metrics-server/",
      chart: "metrics-server",
      namespace: "kube-system",
    });

    cluster.addHelmChart("AlbController", {
      repository: "https://aws.github.io/eks-charts",
      chart: "aws-load-balancer-controller",
      namespace: "kube-system",
    });
  }
}
