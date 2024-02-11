import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { getString } from '../utils';
import { CustomBastionPolicy, CustomEKS, CustomVpc } from './constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStackProyectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, projectProps: cdk.StackProps | any, props?: cdk.StackProps | any) {
    super(scope, id, props);

    /**
     * @Param {*} @CustomBastionPolicy is a class to create policies to a target role and user(s)
     * is needs in the infraestructure implementationss
     */
    // const { bastionHostRole, bastionHostPolicies, eksInlinePolicy, user} = new CustomBastionPolicy(
    //   this,
    //   `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/BastionPolicy`,
    //   projectProps
    //  )

    /**
     * @CustomVpc is a class to implement VPC and VPC subnets in avaliability zones
     * for a security groups EC2 or Fargate
     *  
     */
    const vpc: CustomVpc = new CustomVpc(
      this,
      `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/VPC`,
      projectProps,
  );
  console.log('pass vpc')
      /**
     * @securityGroup is a implmentation ec2.SecurityGroup 
     * for the instances or instance EC2
     */
      const securityGroup: ec2.SecurityGroup = new ec2.SecurityGroup(
        this, 
        `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/sg`, 
        {
         ...projectProps,
          vpc: vpc.vpc,
          allowAllOutbound: false,
        }
     );

   /**
    * @securityGroup.addIngressRule rulles for connectios peer points 
    */
   securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow public ssh access')
   securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080), 'Web from anywhere')
   securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(9090), 'Web from anywhere')

    console.log('pass securityGroup')


    /**
    * @CustomEKS is a class service to create and manage all about the EKS cluster or clusters
    * kubernets and autoScalling implementation in cluster EKS
    */
    const { asg, cluster, clusterKmsKey} = new CustomEKS(
      this,
      `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/ClusterEKS`,
      {
        securityGroup,
        vpc,
        ...projectProps,
        ...props,
      }
    );

    this.addUserData(asg);

     

  }
    public addUserData(asg: cdk.aws_autoscaling.AutoScalingGroup){
    asg.addUserData('yum update -y')
    asg.addUserData('yum install httpd -y')
    asg.addUserData('sudo service httpd start')
    asg.addUserData('sudo chkconfig httpd on')
    asg.addUserData('sudo cd /var/www/html')
    asg.addUserData('echo "<html><h1>Hello Wolrd</h1></html>" > /var/www/html/index.html')

  }
}
