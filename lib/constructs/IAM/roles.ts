import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { PoliciesAllDeploy } from "./policies";
class RoleConstruct extends Construct {
   public masterRole

   constructor(scope: Construct, id: string, props: any) {
    super(scope, id);
    this.masterRole = new iam.Role(this, "MasterRole", {
      inlinePolicies: { "basicPolicyDeploy": PoliciesAllDeploy },
      roleName: 'MasterRole',
      assumedBy: new iam.CompositePrincipal(
        new iam.ArnPrincipal(props.adminArn),
        new iam.ArnPrincipal(props.lead1Arn),
        new iam.ServicePrincipal('ec2.amazonaws.com'),
        new iam.ServicePrincipal('eks.amazonaws.com')
      )
    });
  }
}
export default RoleConstruct;