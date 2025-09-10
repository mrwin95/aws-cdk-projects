#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { VpcStack } from "../lib/shared-vpc-stack";
import { DevEksStack } from "../lib/environments/dev-eks-stack";

const app = new cdk.App();

const vpcStack = new VpcStack(app, "VpcStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
const devEksStack = new DevEksStack(app, "DevEksStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

devEksStack.addDependency(vpcStack);
