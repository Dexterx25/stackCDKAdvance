#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStackProyectStack } from '../lib/cdk_stack_proyect-stack';
import { getString } from '../utils';
import props from '../project_configs/project_config'

const app = new cdk.App();
new CdkStackProyectStack(app, getString(props, 'project_name').concat('stack1'), props,  {
  env: { 
    account: getString(props, 'account'), 
    region: getString(props, 'region'), 
    InstancePort: "80",
    HealthCheckPath: "/",
    HealthCheckPort: "80",
    HealthCheckHttpCodes: "200",
  },
});