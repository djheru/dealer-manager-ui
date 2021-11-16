#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PipelineStack } from '../lib/stacks/pipeline';

const { CDK_ENV: environmentName = 'dev' } = process.env;

const app = new cdk.App();

new PipelineStack(app, 'InfrastructureStack', {
  env: {
    account:
      process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_DEFAULT_ACCOUNT_ID,
    region: process.env.CDK_DEFAULT_REGION || process.env.AWS_DEFAULT_REGION,
  },
});

// const hostedZoneName = `${environmentName}.di-shared-core.net`;
// const websiteSubdomainName = 'dealers';
// const serviceName = 'dealer-manager-ui';
// const stackId = pascalCase(`${serviceName}-${environmentName}`);
