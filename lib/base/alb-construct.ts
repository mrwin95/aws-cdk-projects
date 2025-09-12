import { CfnOutput } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

export interface AlbConstructProps {
  readonly vpcId: ec2.IVpc;
  readonly albName: string;
  readonly certificateArn: string;
  readonly domainName: string;
  readonly domainZoneId: string;
  readonly internetFacing?: boolean;
}

export class AlbConstruct extends Construct {
  readonly alb: elbv2.ApplicationLoadBalancer;
  constructor(scope: Construct, id: string, props: AlbConstructProps) {
    super(scope, id);

    this.alb = new elbv2.ApplicationLoadBalancer(this, "ALB", {
      vpc: props.vpcId,
      internetFacing: props.internetFacing ?? true,
      loadBalancerName: props.albName,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // Default listener on port 443 with certificate
    const listener = this.alb.addListener("Listener", {
      port: 443,
      certificates: [{ certificateArn: props.certificateArn }],
      sslPolicy: elbv2.SslPolicy.RECOMMENDED,
      open: true,
    });

    // Default listener on port 80 to redirect to 443
    this.alb.addListener("ListenerHTTP", {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: "HTTPS",
        port: "443",
        permanent: true,
      }),
    });

    listener.addTargets("DefaultTarget", {
      port: 80,
      targets: [], // add EKS targets via Kubernetes ALB Ingress Controller
    });

    new CfnOutput(this, "AlbDnsName", {
      value: this.alb.loadBalancerDnsName,
      exportName: `${props.albName}-dns`,
    });
  }
}
