import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
import { KubectlV30Layer } from '@aws-cdk/lambda-layer-kubectl-v30';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

class EKSClusterConstruct extends Construct {
  public basicCluster: eks.Cluster;
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);
    const role: cdk.aws_iam.Role = props.role
    const layyer = new KubectlV30Layer(this, 'KubectlLayer')
    this.basicCluster = new eks.Cluster(this, id, {
      version: eks.KubernetesVersion.V1_30,
      kubectlLayer: layyer,
      vpc: props.vpc,
      securityGroup: props.securityGroup,
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
      defaultCapacity: 0,
    });
    const adminUser =  iam.User.fromUserArn(this, 'dex', props.adminArn)

    this.basicCluster.awsAuth.addUserMapping(adminUser, {groups: ["system:masters"]})

    this.basicCluster.addAutoScalingGroupCapacity(`${id}/asg`, {
      instanceType: new cdk.aws_ec2.InstanceType('t2.medium'), // Cambia según tus necesidades
      minCapacity: 1,
      maxCapacity: 3,
     })
    // Configuración de límites de recursos para el grupo de nodos
    this.basicCluster.addNodegroupCapacity('MyNodeGroup', {
        desiredSize: 2,
        minSize: 1,
        maxSize: 3,
      });

  }
}
export default EKSClusterConstruct;
