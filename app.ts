#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import props from './project_configs/project_config'
import { getString } from './utils';
import { MainStack2 } from './bin/stacks';
const app = new cdk.App();

new MainStack2(app, `${getString(props, 'project_name').concat('stack15')}/${getString(props, 'environment')}`,  {
    env: { 
      account: getString(props, 'account'), 
      region: getString(props, 'region'), 
      adminArn: getString(props.infra_vars.environment_vars, 'adminArn'),
      adminUsername: getString(props.infra_vars.environment_vars, 'adminUsername'),
      InstancePort: "80",
      HealthCheckPath: "/",
      HealthCheckPort: "80",
      HealthCheckHttpCodes: "200",
    },
  });



