import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { PoliciesAllDeploy } from "./policies";
class RoleConstruct extends Construct {
   public masterRole

   constructor(scope: Construct, id: string, props: any) {
    super(scope, id);
    this.masterRole = new iam.Role(this, id, {
      inlinePolicies: { "basicPolicyDeploy": PoliciesAllDeploy },
      roleName: `master4`,
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('ec2.amazonaws.com'),
        new iam.ServicePrincipal('eks.amazonaws.com'),
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('sts.amazonaws.com'),
      ),
    });
    this.masterRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'))
    this.masterRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy'));
    this.masterRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSServicePolicy'));

  }
}
export default RoleConstruct;