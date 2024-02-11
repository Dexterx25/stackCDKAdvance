import { Fn, StackProps } from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { getString } from '../../utils';
import * as cdk from 'aws-cdk-lib';
import { Key } from 'aws-cdk-lib/aws-kms';
import * as eks from 'aws-cdk-lib/aws-eks';
import { propsCustomEKS } from '../interfaces';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
const helper = require('js-yaml');
import * as fs from 'fs'
import * as iam from 'aws-cdk-lib/aws-iam'
import { KubectlV27Layer } from '@aws-cdk/lambda-layer-kubectl-v27';
/** Class representing a vpc import from parameter stores
 * with a predefine sysntax name
 *  */
class CustomEKS  extends Construct {
    public readonly cluster: eks.Cluster
    public readonly awsauth: eks.AwsAuth
    public readonly asg: autoscaling.AutoScalingGroup
    public readonly clusterKmsKey: Key;
     constructor(scope: Construct, id: string, projectProps: propsCustomEKS ) {
     super(scope, id);
     const {vpc, securityGroup} = projectProps;
     
     const eksRole: iam.IRole = iam.Role.fromRoleArn(this, 'rolARN', getString(projectProps, 'role_arn_admin'))
   /*   const eksPolicy = new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['eks:*', 'sts:*'],
              resources: ['*', "arn:aws:eks:us-east-1:id:cluster/*"], // Adjust resource ARN as needed
            }),
          ],
        });
      const eksRole = new iam.Role(this, 'EksClusterRole', {
          assumedBy: new iam.AccountRootPrincipal(), // Assumed by the root account for simplicity
        });

      eksRole.attachInlinePolicy(new iam.Policy(this, 'EksCreateClusterPolicy', {
          document: eksPolicy,
        }));
        
      new cdk.CfnOutput(this, 'EksClusterRoleArn', {
          value: eksRole.roleArn,
        });

        this.clusterKmsKey = new Key(
        this, 
        `ekskmskey`, 
        {
        enableKeyRotation: true,
        alias: cdk.Fn.join('', ['alias/', 'eks/', `ekskmskey`]),
      }); */
      
      this.cluster = new eks.Cluster(this, `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/ClusterEKS`, {
        version: eks.KubernetesVersion.V1_27,
        defaultCapacity: 3,  // we want to manage capacity our selves
        endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
        vpc: vpc.vpc,
        role: eksRole,
       // mastersRole: eksRole,
       // secretsEncryptionKey: this.clusterKmsKey,
        securityGroup,
        clusterName: `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/ClusterEKS`,
        placeClusterHandlerInVpc: true,
        kubectlLayer: new KubectlV27Layer(this, 'kubectl'),
        vpcSubnets: [vpc.vpc.selectSubnets({
          subnets: vpc.subn,
          onePerAz: true,
        })],
      });
      this.cluster.awsAuth.addRoleMapping(eksRole, { groups: [ 'system:masters' ]});

      this.cluster.awsAuth.addMastersRole(eksRole);

      this.cluster.addNodegroupCapacity("managed-node", {
        instanceTypes: [ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO)],
        minSize: 1,
        maxSize: 2,
        nodeRole: eksRole
      });

      console.log('pasó eks clouster creation');
      
      this.asg = this.cluster.addAutoScalingGroupCapacity(
        `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/AutoScalingGroupEKS`, 
        {
        keyName: 'keypemToConnect',
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
        machineImageType: eks.MachineImageType.BOTTLEROCKET,
        autoScalingGroupName: `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/AutoScalingGroupEKS`,
        allowAllOutbound: false,
        healthCheck: autoscaling.HealthCheck.ec2(),
        minCapacity: 2,
        maxCapacity: 4,
        vpcSubnets: vpc.vpc.selectSubnets({
          subnets: vpc.subn,
          onePerAz: true,
        }),
      })
      console.log('autoScalling pass');

      this.asg.connections.allowTo(this.cluster, ec2.Port.tcp(443), 'Allow between BastionHost and EKS ');
     
      this.asg.userData.addCommands(
        `VERSION=$(aws --region ${projectProps.region} eks describe-cluster --name ${this.cluster.clusterName} --query 'cluster.version' --output text)`,
        'echo \'K8s version is $VERSION\'',
        'curl -LO https://dl.k8s.io/release/v$VERSION.0/bin/linux/amd64/kubectl',
        'install -o root -g root -m 0755 kubectl /bin/kubectl',
      );
         
      this.awsauth = new eks.AwsAuth(this, 'EKS_AWSAUTH', {
        cluster: this.cluster,
      });
    
    }
     

}

export  { CustomEKS }