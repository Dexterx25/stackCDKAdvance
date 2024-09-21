import * as iam from 'aws-cdk-lib/aws-iam';
import {statementsAll} from './permisions_statements';

const PoliciesAllDeploy = new iam.PolicyDocument({
  statements: statementsAll,
});

export {PoliciesAllDeploy}

