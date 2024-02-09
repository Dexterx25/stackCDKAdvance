#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import {
  Cdkv2JavascriptTemplateStack,
} from "../lib/cdkv2_javascript_template-stack";
import * as props from "../project_configs/project_config";
import * as helper from "../project_configs/helper";

const app = new cdk.App();

const serviceStack = new Cdkv2JavascriptTemplateStack(
  app,
  props["project_name"].concat("Stack"),
  props,
  {
    env: { account: props["account"], region: props["region"] },
  }
);

helper.setTags(serviceStack, props["tags"]);
