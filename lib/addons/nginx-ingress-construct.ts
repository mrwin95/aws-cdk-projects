import * as eks from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";
export interface NginxIngressConstructProps {
  cluster: eks.Cluster;
  namespace?: string;
  internetFacing?: boolean;
  sslCertificateArn?: string;
  release?: string;
  version?: string;
}

export class NginxIngressConstruct extends Construct {
  constructor(scope: Construct, id: string, props: NginxIngressConstructProps) {
    super(scope, id);

    const namespace = props.namespace ?? "nginx-ingress";

    props.cluster.addManifest("NginxIngressNamespace", {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: { name: namespace },
    });

    // annotation for service

    const serviceAnnotations: Record<string, string> = {
      "service.beta.kubernetes.io/aws-load-balancer-schema": props.internetFacing
        ? "internet-facing"
        : "internal",
      "service.beta.kubernetes.io/aws-load-balancer-type": "alb",
    };

    // add TLS if provided

    if (props.sslCertificateArn) {
      serviceAnnotations[
        "service.beta.kubernetes.io/aws-load-balancer-ssl-cert"
      ] = props.sslCertificateArn;
      serviceAnnotations[
        "service.beta.kubernetes.io/aws-load-balancer-backend-protocol"
      ] = "http";
      serviceAnnotations[
        "service.beta.kubernetes.io/aws-load-balancer-ssl-ports"
      ] = "443";
    }

    // Helm chart for NGINX Ingress Controller

    props.cluster.addHelmChart("NginxIngressHelmChart", {
      repository: "https://kubernetes.github.io/ingress-nginx",
      chart: "ingress-nginx",
      release: props.release ?? "nginx-ingress",
      namespace: namespace,
      version: props.version ?? "4.10.0",
      values: {
        controller: {
          service: {
            type: "LoadBalancer",
            annotations: serviceAnnotations,
          },
        },
      },
    });
  }
}
