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
      mastersRole: role,
      vpc: props.vpc,
      securityGroup: props.securityGroup,
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
      defaultCapacity: 0,
    });

    this.basicCluster.addHelmChart('EfsCsiDriver', {
      repository: 'https://kubernetes-sigs.github.io/aws-efs-csi-driver',
      chart: 'aws-efs-csi-driver',
      namespace: 'kube-system',
      values: {
        // Configuraciones adicionales si son necesarias
      },
    });

    const dexRole: cdk.aws_iam.Role = role
    
    this.basicCluster.awsAuth.addMastersRole(dexRole, 'master');
  
    const dexUser = iam.User.fromUserName(this, 'DexUser', props.adminUsername);
  
    this.basicCluster.awsAuth.addUserMapping(dexUser, { groups: ['system:masters'] });
    this.basicCluster.addAutoScalingGroupCapacity(`${id}/asg`, {
      instanceType: new cdk.aws_ec2.InstanceType('t2.medium'),
      minCapacity: 1,
      maxCapacity: 3,
     })

   this.basicCluster.addNodegroupCapacity(`${id}/MyNodeGroup`, {
        desiredSize: 2,
        minSize: 1,
        maxSize: 3,
      });

  }
}
export default EKSClusterConstruct;
