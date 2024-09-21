import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import RoleConstruct from '../../lib/constructs/IAM/roles';
import { CustomVpc } from '../../lib/constructs/EC2/vpc_construct';
import EC2InstanceConstruct from '../../lib/constructs/EC2/ec2_instance_construct';
import { SecurityGroup, UserData } from 'aws-cdk-lib/aws-ec2';
import SecurityGroupConstruct from '../../lib/constructs/EC2/security_group_construct';
import LBContruct from '../../lib/constructs/EC2/loadBalancer';
import TargetGroupConstruct from '../../lib/constructs/EC2/targetGroupsConstruct';
import AutoScallingEC2Construct from '../../lib/constructs/EC2/autoScalling_construct';

export class MainStack extends cdk.Stack {
    constructor(scope: Construct, id:string, props: any){
        super(scope, id, props)
        const {
            masterRole
        } = new RoleConstruct(this, id, props)
        /**
         * WAF (needs)
         */
       
        const {
            vpc
        } = new CustomVpc(this, id, props)

        const { 
            basicSecurityGroup
        } = new SecurityGroupConstruct(this, id, {
            ...props,
            vpc,
        })

        const {
            elbLoadBalancerBasic
        } = new LBContruct(this, id, {
            ...props,
            vpc,
            securityGroup: basicSecurityGroup,
        })

        /* ec2 single const {
            ec2_instance
        } = new EC2InstanceConstruct(this, id, {
            ...props,
            vpc,
            role: masterRole,
            userData: null,
            securityGroup: basicSecurityGroup
        }) */

        const listenerELB = elbLoadBalancerBasic.addListener('publicListener', {
            port: 80,
            open: true,
        })

        const {
            targetGroup
        } = new TargetGroupConstruct(this, id, {
            ...props,
            vpc,
        })
        
        listenerELB.addTargetGroups(id, {
            targetGroups: [targetGroup],
        })

        const {
           autoScallingEC2
        } = new AutoScallingEC2Construct(this, id, {
            ...props, 
            vpc,
            role: masterRole,
            userData: null,
            securityGroup: basicSecurityGroup
        })

        targetGroup.addTarget(autoScallingEC2)
        /**
         * ECR
         */

        /**
         * sync JENKINS -> CI/CD
         */

        /**
         * EKS
         */


    }
}