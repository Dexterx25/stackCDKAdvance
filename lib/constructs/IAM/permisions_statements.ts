import * as iam from "aws-cdk-lib/aws-iam";
const statementsAll: iam.PolicyStatement[] = [
  new iam.PolicyStatement({
    actions: ["ec2:*"], 
    effect: iam.Effect.ALLOW, 
    resources: ["*"],
  }),
  new iam.PolicyStatement({
    actions: ['eks:*'],
    effect: iam.Effect.ALLOW,
    resources: ['*'],
  }),
  new iam.PolicyStatement({
    actions: [
      'elasticloadbalancing:*'
    ],
    effect: iam.Effect.ALLOW,
    resources: ['*'],
  }),
  new iam.PolicyStatement({
    resources: ['*'],
    actions: ['ssm:*'],
    effect: iam.Effect.ALLOW,
  }),
  new iam.PolicyStatement({
    actions: [
    "xray:*",
    ],
    resources: ["*"],
    effect: iam.Effect.ALLOW
  }),
  new iam.PolicyStatement({
    actions: [
    "iam:*",
    ],
    resources: ["*"],
    effect: iam.Effect.ALLOW
  }),
  new iam.PolicyStatement({
    actions: [
    "fsx:*"
    ],
    resources: ["*"],
    effect: iam.Effect.ALLOW
  }),
  new iam.PolicyStatement({
    actions: [
    "route53:*",
    ],
    resources: ["*"],
    effect: iam.Effect.ALLOW
  }),
  new iam.PolicyStatement({
    actions: [
    "appmesh:*",
    "servicediscovery:*",
    ],
    resources: ["*"],
    effect: iam.Effect.ALLOW
  }),
  new iam.PolicyStatement({
    actions: [
    "elasticfilesystem:*"
    ],
    resources: ["*"],
    effect: iam.Effect.ALLOW
  }),
  new iam.PolicyStatement({
    resources: ['*'],
    actions: [
      "s3:*"
    ],
    effect: iam.Effect.ALLOW,
  }),
  new iam.PolicyStatement({
    actions: ['ecr:*'],
    effect: iam.Effect.ALLOW,
    resources: ['*'],
  }),
  new iam.PolicyStatement({
    actions: ['waf:*', 'wafv2:*', 'waf-regional:*', 'tag:*', 'shield:*', 'acm:*'],
    effect: iam.Effect.ALLOW,
    resources: ['*'],
  }),
];

export { statementsAll };
