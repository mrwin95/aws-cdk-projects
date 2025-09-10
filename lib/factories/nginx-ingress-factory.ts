import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";

export class NginxIngressFactory {
  static nginx(scope: Construct, cluster: eks.Cluster) {
    cluster.addHelmChart("NginxIngress", {
      repository: "https://kubernetes.github.io/ingress-nginx",
      chart: "ingress-nginx",
      namespace: "ingress-nginx",
      release: "nginx",
      createNamespace: true,
      values: {
        controller: {
          service: {
            type: "LoadBalancer", // expose with AWS ELB/ALB
            annotations: {
              "service.beta.kubernetes.io/aws-load-balancer-type": "nlb", // NLB for performance
            },
          },
        },
      },
    });
  }
}
