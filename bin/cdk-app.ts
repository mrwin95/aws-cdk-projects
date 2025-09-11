#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { VpcStack } from "../lib/shared-vpc-stack";
import { DevEksStack } from "../lib/environments/dev-eks-stack";
import { IamAdminRoleStack } from "../lib/stacks/iam-admin-role-stack";
import "dotenv/config";
import { EksAdminUserStack } from "../lib/stacks/eks-admin-user-stack";
import { EcrStack } from "../lib/stacks/ecr-stack";

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

const devIamRoleStack = new IamAdminRoleStack(app, "IamAdminRoleStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const devEksAdminUserStack = new EksAdminUserStack(app, "EksAdminUserStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const ecrStack = new EcrStack(app, "EcrStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

devEksStack.addDependency(vpcStack);
devEksStack.addDependency(devIamRoleStack);
devEksStack.addDependency(devEksAdminUserStack);
devEksStack.addDependency(ecrStack);
