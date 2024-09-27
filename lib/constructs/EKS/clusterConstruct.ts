import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
import { KubectlV30Layer } from "@aws-cdk/lambda-layer-kubectl-v30";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { PoliciesAllDeploy } from "../IAM";
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';

interface EKSClusterProps {
  role: iam.Role;
  vpc: cdk.aws_ec2.Vpc;
  securityGroup: cdk.aws_ec2.SecurityGroup;
  efsId: string;
  adminUsername: string;
  autoScallingEC2: autoscaling.AutoScalingGroup;
}

class EKSClusterConstruct extends Construct {
  public basicCluster: eks.Cluster;
  constructor(scope: Construct, id: string, props: EKSClusterProps) {
    super(scope, id);
    const role: cdk.aws_iam.Role = props.role;
    const layyer = new KubectlV30Layer(this, "KubectlLayer");
    this.basicCluster = new eks.Cluster(this, id, {
      version: eks.KubernetesVersion.V1_30,
      kubectlLayer: layyer,
      mastersRole: role,
      vpc: props.vpc,
      securityGroup: props.securityGroup,
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
      defaultCapacity: 0,
    });
    const dexRole: cdk.aws_iam.Role = role;

    this.basicCluster.awsAuth.addMastersRole(dexRole, "master");

    const dexUser = iam.User.fromUserName(this, "DexUser", props.adminUsername);

    this.basicCluster.awsAuth.addUserMapping(dexUser, {
      groups: ["system:masters"],
    });
  
    this.basicCluster.connectAutoScalingGroupCapacity(props.autoScallingEC2, {
      mapRole: true
    })
/*     this.basicCluster.addAutoScalingGroupCapacity(`${id}/asg`, {
      instanceType: new cdk.aws_ec2.InstanceType("t2.medium"),
      minCapacity: 1,
      maxCapacity: 3,
    }); */
    const clusterCreationRole = this.basicCluster.adminRole;

    clusterCreationRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSClusterPolicy")
    );
    clusterCreationRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonEKSVPCResourceController"
      )
    );

    const policy = new iam.Policy(this, "policyAll", {
      document: PoliciesAllDeploy,
    });
    this.basicCluster.kubectlLambdaRole?.attachInlinePolicy(policy);
    this.basicCluster.kubectlRole?.attachInlinePolicy(policy);
    this.basicCluster.addNodegroupCapacity(`${id}/MyNodeGroup`, {
      desiredSize: 2,
      minSize: 1,
      maxSize: 3,
      nodeRole: role,
    });
  }
}
export default EKSClusterConstruct;
