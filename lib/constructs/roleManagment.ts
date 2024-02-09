import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { StackProps } from "aws-cdk-lib";
import * as iam from 'aws-cdk-lib/aws-iam'
class RoleManagment  extends Construct {
    public bastionHostPolicy: ManagedPolicy;
    public bastionHostRole: Role;
    constructor(scope: Construct, id: string, projectProps: StackProps ) {
        super(scope, id);
      
          const user = iam.User.fromUserArn(this, 'userARN', 'arn:aws:iam::666196153281:user/dexterx25')

            this.bastionHostPolicy = new iam.ManagedPolicy(this, 'bastionHostManagedPolicy', {
              description: 'Allows ec2 describe action',
             // users: [user],
              statements: [
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
                  actions: ['ec2:Describe'],
                  resources: ['*'],
                  sid: 'EC2Readonly',
                }),
                // new PolicyStatement({
                //   resources: ['*'],
                //   actions: [
                //       'eks:DescribeNodegroup',
                //       'eks:ListNodegroups',
                //       'eks:DescribeCluster',
                //       'eks:ListClusters',
                //       'eks:AccessKubernetesApi',
                //       'eks:ListUpdates',
                //       'eks:ListFargateProfiles',
                //   ],
                //   effect: Effect.ALLOW,
                //   sid: 'EKSReadonly',
                // }),
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: [
                      'ecr:GetAuthorizationToken',
                      'ecr:BatchCheckLayerAvailability',
                      'ecr:GetDownloadUrlForLayer',
                      'ecr:GetRepositoryPolicy',
                      'ecr:DescribeRepositories',
                      'ecr:ListImages',
                      'ecr:DescribeImages',
                      'ecr:BatchGetImage',
                      'ecr:ListTagsForResource',
                      'ecr:DescribeImageScanFindings',
                      'ecr:InitiateLayerUpload',
                      'ecr:UploadLayerPart',
                      'ecr:CompleteLayerUpload',
                      'ecr:PutImage',
                      'ecr:CreateRepository',
                    ],
                    resources: ['*'],
                    sid: 'ECRReadonly',
                }),
                new PolicyStatement({
                  effect: Effect.ALLOW,
                  actions: [
                    "s3:CreateBucket",  
                    "s3:ListAllMyBuckets",  
                    "s3:GetBucketLocation"
                  ],
                  resources: [
                    '*',
                    "arn:aws:s3:::*"
                  ],
                  sid: 'S3Readonly',
                }),
                new PolicyStatement({
                    resources: ['*'],
                    actions: ['*'],
                    sid: 'adminReadonly'
                  })

              ],
              //roles: [this.bastionHostRole],
            });
            
            this.bastionHostPolicy.attachToUser(user)
            this.bastionHostRole = new iam.Role(this, 'roleBastionCDKDeploy', {
              assumedBy: new iam.AccountRootPrincipal(),
              description: 'An example IAM role in AWS CDK',
              roleName: `roleBastionCDKDeploy`,
              managedPolicies: [
                // SSM Manager Permissions
                ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
                // Read only EKS Permissions
                this.bastionHostPolicy,
              ],
            });                        
    }
}

export {RoleManagment}