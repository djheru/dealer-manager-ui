#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PipelineStack, PipelineStackProps } from '../lib/stacks/pipeline';
import { pascalCase } from 'pascal-case';

const app = new cdk.App();
const { CDK_ENV: environmentName = 'dev' } = process.env;

const hostedZoneName = `${environmentName}.di-shared-core.net`;
const websiteSubdomainName = 'dealers';
const serviceName = 'dealer-manager-ui';
const stackId = pascalCase(`${serviceName}-${environmentName}`);

const domainName =
  environmentName === 'prod'
    ? `${websiteSubdomainName}.${hostedZoneName}`
    : `${websiteSubdomainName}.${environmentName}.${hostedZoneName}`;

const pipelineStackProps: PipelineStackProps = {
  description: `Summary: This stack is responsible for handling the ${stackId} website infrastructure.

Deployment: This stack supports deployments to the standard environments (e.g. dev, prod, test, etc).
The stack can be deployed to a custom environment (e.g. a developer environment) by ensuring 
that the desired environment name (e.g. ${environmentName}) is set in the $CDK_ENV environment 
variable`,
  domainName,
  environmentName,
  hostedZoneName,
};

new PipelineStack(app, stackId, pipelineStackProps);
