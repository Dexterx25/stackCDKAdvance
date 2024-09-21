#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import props from './project_configs/project_config'
import { getString } from './utils';
import { MainStack } from './bin/stacks';
const app = new cdk.App();


new MainStack(app, getString(props, 'project_name').concat('stack1'),  {
    env: { 
      account: getString(props, 'account'), 
      region: getString(props, 'region'), 
      InstancePort: "80",
      HealthCheckPath: "/",
      HealthCheckPort: "80",
      HealthCheckHttpCodes: "200",
    },
  });



