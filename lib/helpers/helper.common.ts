import * as eks from "aws-cdk-lib/aws-eks";
export const parserEksVersion = (version?: string): eks.KubernetesVersion => {
  switch (version) {
    case "1.31":
      return eks.KubernetesVersion.V1_31;
    // case "1.32":
    //   return eks.KubernetesVersion.V1_32;
    // case "1.33":
    //   return eks.KubernetesVersion.V1_33;
    default:
      return eks.KubernetesVersion.V1_31;
  }
};
