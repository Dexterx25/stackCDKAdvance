import * as iam from "aws-cdk-lib/aws-iam";
const statementsAll: iam.PolicyStatement[] = [
  new iam.PolicyStatement({
    actions: ["ec2:*"], 
    effect: iam.Effect.ALLOW, 
    resources: ["*"],
  }),
  new iam.PolicyStatement({
    sid: "AllowDescribe",
    effect: iam.Effect.ALLOW,
    actions: [
      "elasticfilesystem:DescribeAccessPoints",
      "elasticfilesystem:DescribeFileSystems",
      "elasticfilesystem:DescribeMountTargets",
      "ec2:DescribeAvailabilityZones"
    ],
    resources: ["*"]
  }),
  new iam.PolicyStatement({
    sid: "AllowCreateAccessPoint",
    effect: iam.Effect.ALLOW,
    actions: [
      "elasticfilesystem:CreateAccessPoint"
    ],
    resources: ["*"],
    conditions: {
      "Null": {
        "aws:RequestTag/efs.csi.aws.com/cluster": "false"
      },
      "ForAllValues:StringEquals": {
        "aws:TagKeys": "efs.csi.aws.com/cluster"
      }
    }
  }),
  new iam.PolicyStatement({
    sid: "AllowTagNewAccessPoints",
    effect: iam.Effect.ALLOW,
    actions: [
      "elasticfilesystem:TagResource"
    ],
    resources: ["*"],
    conditions: {
      "StringEquals": {
        "elasticfilesystem:CreateAction": "CreateAccessPoint"
      },
      "Null": {
        "aws:RequestTag/efs.csi.aws.com/cluster": "false"
      },
      "ForAllValues:StringEquals": {
        "aws:TagKeys": "efs.csi.aws.com/cluster"
      }
    }
  }),
  new iam.PolicyStatement({
    sid: "AllowDeleteAccessPoint",
    effect: iam.Effect.ALLOW,
    actions: [
      "elasticfilesystem:DeleteAccessPoint"
    ],
    resources: ["*"],
    conditions: {
      "Null": {
        "aws:ResourceTag/efs.csi.aws.com/cluster": "false"
      }
    }
  }),
   new iam.PolicyStatement({
    actions: ['eks:*',
      "eks:CreateCluster",
      "autoscaling:DescribeAutoScalingGroups",
      "autoscaling:UpdateAutoScalingGroup",
      "ec2:AttachVolume",
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:CreateRoute",
      "ec2:CreateSecurityGroup",
      "ec2:CreateTags",
      "ec2:CreateVolume",
      "ec2:DeleteRoute",
      "ec2:DeleteSecurityGroup",
      "ec2:DeleteVolume",
      "ec2:DescribeInstances",
      "ec2:DescribeRouteTables",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeSubnets",
      "ec2:DescribeVolumes",
      "ec2:DescribeVolumesModifications",
      "ec2:DescribeVpcs",
      "ec2:DescribeDhcpOptions",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DescribeAvailabilityZones",
      "ec2:DetachVolume",
      "ec2:ModifyInstanceAttribute",
      "ec2:ModifyVolume",
      "ec2:RevokeSecurityGroupIngress",
      "ec2:DescribeAccountAttributes",
      "ec2:DescribeAddresses",
      "ec2:DescribeInternetGateways",
      "elasticloadbalancing:AddTags",
      "elasticloadbalancing:ApplySecurityGroupsToLoadBalancer",
      "elasticloadbalancing:AttachLoadBalancerToSubnets",
      "elasticloadbalancing:ConfigureHealthCheck",
      "elasticloadbalancing:CreateListener",
      "elasticloadbalancing:CreateLoadBalancer",
      "elasticloadbalancing:CreateLoadBalancerListeners",
      "elasticloadbalancing:CreateLoadBalancerPolicy",
      "elasticloadbalancing:CreateTargetGroup",
      "elasticloadbalancing:DeleteListener",
      "elasticloadbalancing:DeleteLoadBalancer",
      "elasticloadbalancing:DeleteLoadBalancerListeners",
      "elasticloadbalancing:DeleteTargetGroup",
      "elasticloadbalancing:DeregisterInstancesFromLoadBalancer",
      "elasticloadbalancing:DeregisterTargets",
      "elasticloadbalancing:DescribeListeners",
      "elasticloadbalancing:DescribeLoadBalancerAttributes",
      "elasticloadbalancing:DescribeLoadBalancerPolicies",
      "elasticloadbalancing:DescribeLoadBalancers",
      "elasticloadbalancing:DescribeTargetGroupAttributes",
      "elasticloadbalancing:DescribeTargetGroups",
      "elasticloadbalancing:DescribeTargetHealth",
      "elasticloadbalancing:DetachLoadBalancerFromSubnets",
      "elasticloadbalancing:ModifyListener",
      "elasticloadbalancing:ModifyLoadBalancerAttributes",
      "elasticloadbalancing:ModifyTargetGroup",
      "elasticloadbalancing:ModifyTargetGroupAttributes",
      "elasticloadbalancing:RegisterInstancesWithLoadBalancer",
      "elasticloadbalancing:RegisterTargets",
      "elasticloadbalancing:SetLoadBalancerPoliciesForBackendServer",
      "elasticloadbalancing:SetLoadBalancerPoliciesOfListener",
      "kms:DescribeKey"
    ],
    effect: iam.Effect.ALLOW,
    resources: ['*'],
  }),
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ["iam:CreateServiceLinkedRole"],
    resources: ["*"],
    conditions: {
      "StringEquals": {
        "iam:AWSServiceName": "elasticloadbalancing.amazonaws.com"
      }
    }
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
    "iam:PassRole"
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
