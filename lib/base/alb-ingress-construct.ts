import * as cdk from "aws-cdk-lib";
import * as eks from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";

export interface AlbIngressConstructProps {
  cluster: eks.ICluster;
  name: string;
  namespace?: string;
  internetFacing?: boolean;
  sslCertificateArn?: string;
  ingressClassName?: string;
  groupName?: string;
  targetType?: "instance" | "ip";
  albName?: string;
  listenPorts?: Array<{ HTTP?: number; HTTPS?: number }>;
  backendHost?: string;
  backendService?: string;
  backendServicePort?: number;
  frontendService?: string;
  frontendHost?: string;
  frontendServicePort?: number;
}

export class AlbIngressConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AlbIngressConstructProps) {
    super(scope, id);

    const ns = props.namespace ?? "default";

    const annotations: Record<string, string> = {
      "alb.ingress.kubernetes.io/scheme": props.internetFacing
        ? "internet-facing"
        : "internal",
      "alb.ingress.kubernetes.io/target-type": props.targetType ?? "ip",
      "alb.ingress.kubernetes.io/listen-ports": props.listenPorts
        ? JSON.stringify(props.listenPorts)
        : '[{"HTTP": 80}, "{"HTTPS": 443}]',
      "alb.ingress.kubernetes.io/load-balancer-name":
        props.albName ?? "demo-shared-alb",
      type: "application",
    };

    if (props.sslCertificateArn) {
      annotations["alb.ingress.kubernetes.io/ssl-cert"] =
        props.sslCertificateArn;
      annotations["alb.ingress.kubernetes.io/ssl-redirect"] = "433";
    }

    props.cluster.addManifest("AlbIngressNamespace", {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: { name: ns },
    });

    // annotation for service

    const serviceAnnotations: Record<string, string> = {
      "service.beta.kubernetes.io/aws-load-balancer-schema": props.internetFacing
        ? "internet-facing"
        : "internal",
      "service.beta.kubernetes.io/aws-load-balancer-type": "alb",
      type: "application",
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

    const ingress = props.cluster.addManifest(`${props.name}AlbIngress`, {
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: {
        name: props.name,
        namespace: ns,
        annotations: annotations,
      },
      spec: {
        ingressClassName: props.ingressClassName ?? "alb",
        rules: [
          {
            host: props.backendHost ?? "api-property.zodiai.co",
            http: {
              paths: [
                {
                  path: "/",
                  pathType: "Prefix",
                  backend: {
                    service: {
                      name: props.backendService ?? "demo-backend-service",
                      port: {
                        number: props.backendServicePort ?? 3000,
                      },
                    },
                  },
                },
              ],
            },
          },
          ...(props.frontendService && props.frontendHost
            ? [
                {
                  host: props.frontendHost,
                  http: {
                    paths: [
                      {
                        path: "/",
                        pathType: "Prefix",
                        backend: {
                          service: {
                            name: props.frontendService,
                            port: {
                              number: props.frontendServicePort ?? 80,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              ]
            : []),
        ],
      },
    });

    // Ensure CDK cleans up ALB when stack is destroyed
    ingress.node.addDependency(props.cluster);
  }
}
