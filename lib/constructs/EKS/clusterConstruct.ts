import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
import { KubectlV30Layer } from '@aws-cdk/lambda-layer-kubectl-v30';
import * as iam from "aws-cdk-lib/aws-iam";
import { PoliciesAllDeploy } from "../IAM";

class EKSClusterConstruct extends Construct {
  public basicCluster: eks.Cluster;
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);
    this.basicCluster = new eks.Cluster(this, id, {
      version: eks.KubernetesVersion.V1_30,
      kubectlLayer: new KubectlV30Layer(this, 'KubectlLayer'),
      defaultCapacity: 3,
      role: props.role,
      securityGroup: props.securityGroup,
      clusterName: id,
      vpc: props.vpc,
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
    });
    const policy = new iam.Policy(this, 'KubectlPolicy', {
      policyName: 'KubectlPolicy',
      document: PoliciesAllDeploy,
    });
    this.basicCluster.kubectlLambdaRole?.attachInlinePolicy(policy)

  }
}
export default EKSClusterConstruct;
