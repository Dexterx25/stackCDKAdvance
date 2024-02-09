import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { CustomVpc } from '../constructs/vpc_construct';
import { StackProps } from 'aws-cdk-lib';
import { Role, ManagedPolicy, IUser, PolicyDocument} from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
type listOfRules = {
    name: string;
    priority: number;
    overrideAction: string;
    excludedRules: string[];
  };

  interface propsCustomEKS extends StackProps {
     vpc: CustomVpc;
     bastionHostRole: Role
     securityGroup: ec2.SecurityGroup
     region: string
     asg: cdk.aws_autoscaling.AutoScalingGroup,
     bastionHostPolicies: PolicyDocument,
     eksInlinePolicy: { [name: string]: PolicyDocument },
     user: IUser;
 }
export {listOfRules, propsCustomEKS};