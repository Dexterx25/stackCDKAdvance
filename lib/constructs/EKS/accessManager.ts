import * as eks from "aws-cdk-lib/aws-eks";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

export class EKSAccessManager {
  public static addUserToEksCluster(cluster: eks.Cluster, userArn: string, username: string) {
    const awsAuth = cluster.awsAuth;
    const user = iam.User.fromUserArn(cluster, "DexUser", userArn);

    awsAuth.addUserMapping(user, {
      username: username,
      groups: ["system:masters"],
    });
  }
}
