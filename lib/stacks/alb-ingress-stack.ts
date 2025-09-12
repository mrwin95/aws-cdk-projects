import { Fn, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
import { AlbIngressConstruct } from "../base/alb-ingress-construct";
import { parserEksVersion, resolveKubectlLayer } from "../helpers/helper.common";
export interface AlbIngressStackProps extends StackProps {
  clusterName?: string; // name of the EKS cluster
  name?: string;
  backendService?: string;
  backendHost?: string;
  frontendService?: string;
  frontendHost?: string;
  certificateArn?: string;
  albName?: string;
  version?: eks.KubernetesVersion;
}

export class AlbIngressStack extends Stack {
  constructor(scope: Construct, id: string, props: AlbIngressStackProps) {
    super(scope, id, props);
    const version = props.version ?? parserEksVersion(process.env.EKS_VERSION);
    const cluster = eks.Cluster.fromClusterAttributes(this, "ImportedCluster", {
      clusterName: process.env.EKS_CLUSTER_NAME ?? "",
      kubectlRoleArn: Fn.importValue("EksKubectlRoleArn"),
      openIdConnectProvider:
        eks.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
          this,
          "OidcProvider",
          Fn.importValue("EksOidcProviderArn")
        ),
      kubectlSecurityGroupId: Fn.importValue("EksClusterSecurityGroupId"),
      vpc: undefined, // not needed for Ingress
      kubectlLayer: resolveKubectlLayer(this, version),
    });

    new AlbIngressConstruct(this, "AppAlbIngress", {
      cluster,
      name: process.env.INGRESS_NAME ?? "",
      albName: process.env.ALB_NAME,
      backendService: process.env.BACKEND_SERVICE_NAME,
      backendHost: process.env.BACKEND_HOST,
      frontendService: process.env.FRONTEND_SERVICE_NAME,
      frontendHost: process.env.FRONTEND_HOST,
      sslCertificateArn: process.env.CERTIFICATE_ARN,
    });
  }
}
