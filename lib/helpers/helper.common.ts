import { KubectlV31Layer } from "@aws-cdk/lambda-layer-kubectl-v31";
import { KubectlV32Layer } from "@aws-cdk/lambda-layer-kubectl-v32";
import { KubectlV33Layer } from "@aws-cdk/lambda-layer-kubectl-v33";

import * as eks from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";

export const parserEksVersion = (version?: string): eks.KubernetesVersion => {
  switch (version) {
    case "1.31":
      return eks.KubernetesVersion.V1_31;
    case "1.32":
      return eks.KubernetesVersion.V1_32;
    case "1.33":
      return eks.KubernetesVersion.V1_33;
    default:
      return eks.KubernetesVersion.V1_33;
  }
};

export const resolveKubectlLayer = (
  scope: Construct,
  version: eks.KubernetesVersion
): any => {
  switch (version.version) {
    case "1.31":
      return new KubectlV31Layer(scope, "KubectlV31Layer");
    case "1.32":
      return new KubectlV32Layer(scope, "KubectlV32Layer");
    case "1.33":
      return new KubectlV33Layer(scope, "KubectlV33Layer");
    default:
      return new KubectlV32Layer(scope, "KubectlV32Layer");
  }
};
