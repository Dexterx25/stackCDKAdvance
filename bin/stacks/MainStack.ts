import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import RoleConstruct from '../../lib/constructs/IAM/roles';
import { CustomVpc } from '../../lib/constructs/EC2/vpc_construct';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import EKSClusterConstruct from '../../lib/constructs/EKS/clusterConstruct';
import SecurityGroupConstruct from '../../lib/constructs/EC2/security_group_construct';
import JenkinsManager from '../../lib/constructs/EKS/jenkins';
import { EKSAccessManager } from '../../lib/constructs/EKS/accessManager';

export class MainStack2 extends cdk.Stack {
    constructor(scope: Construct, id:string, props: any){
        super(scope, id, props)
        const {
            masterRole: role
        } = new RoleConstruct(this, `${id}/role`, props)
       
        const {
            vpc
        } = new CustomVpc(this, `${id}/vpc`, props)

        const { 
            basicSecurityGroup: securityGroup,
        } = new SecurityGroupConstruct(this, `${id}/sec_grp`, {
            ...props,
            vpc,
        })

        const volume = new ec2.CfnVolume(this, 'MyEBSVolume', {
            availabilityZone: `${props.env.region}a`, // Ajusta según la AZ de tu VPC
            size: 10,
            volumeType: 'gp2',
          });

        const {basicCluster} = new EKSClusterConstruct(this, `${id}/eks_cluster`, {
            ...props,
            securityGroup,
            vpc
        })
        EKSAccessManager.addUserToEksCluster(basicCluster, props.env.adminArn, "dex");

        basicCluster.addAutoScalingGroupCapacity(`${id}/asg`, {
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MEDIUM),
            minCapacity: 2,
            maxCapacity: 5,
        })
        const jenkinsInst = new JenkinsManager(basicCluster, volume);

        jenkinsInst.installJenkins()
    }
}