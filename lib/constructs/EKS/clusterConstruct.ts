import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
import { KubectlV30Layer } from '@aws-cdk/lambda-layer-kubectl-v30';
import * as iam from "aws-cdk-lib/aws-iam";
import { PoliciesAllDeploy } from "../IAM";

class EKSClusterConstruct extends Construct {
  public basicCluster: eks.Cluster;
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);
    const layyer = new KubectlV30Layer(this, 'KubectlLayer')
    this.basicCluster = new eks.Cluster(this, id, {
      version: eks.KubernetesVersion.V1_30,
      kubectlLayer: layyer,
      vpc: props.vpc,
      securityGroup: props.securityGroup,
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
    });
  }
}
export default EKSClusterConstruct;
