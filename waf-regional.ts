
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ImportWaff } from './lib/constructs/import_waf';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import elbv2 = require('aws-cdk-lib/aws-elasticloadbalancingv2');
import { CustomVpc } from './lib/constructs/vpc_construct';
import { getString } from './utils';
import { CustomEKS } from './lib/constructs/eksConstruct';
import { CustomBastionPolicy } from './lib/constructs/bastionPolicyContruct';
import * as ECR from 'aws-cdk-lib/aws-ecr'
import * as codeCommit from 'aws-cdk-lib/aws-codecommit';
import * as codeBuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import path = require('path');
import * as iam from 'aws-cdk-lib/aws-iam'
export class MainStack extends cdk.Stack {

  constructor(scope: Construct, id: string, projectProps: cdk.StackProps | any, props?: cdk.StackProps | any) {
    super(scope, id, props);
   
    /**
     * @Param {*} @CustomBastionPolicy is a class to create policies to a target role and user(s)
     * is needs in the infraestructure implementationss
     */
    const { bastionHostRole, bastionHostPolicies, eksInlinePolicy, user} = new CustomBastionPolicy(
      this,
      `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/BastionPolicy`,
      projectProps
     )
     /**
     * @CustomVpc is a class to implement VPC and VPC subnets in avaliability zones
     * for a security groups EC2 or Fargate
     *  
     */
    const vpc: CustomVpc = new CustomVpc(
          this,
          `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/VPC`,
          projectProps,
      );
      console.log('pass vpc')
    /**
     * @securityGroup is a implmentation ec2.SecurityGroup 
     * for the instances or instance EC2
     */
    const securityGroup: ec2.SecurityGroup = new ec2.SecurityGroup(
       this, 
       `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/sg`, 
       {
        ...projectProps,
         vpc: vpc.vpc,
         allowAllOutbound: false,
       }
    );
   // securityGroup.addIngressRule();
   // securityGroup.addEgressRule();

   /**
    * @securityGroup.addIngressRule rulles for connectios peer points 
    */
   securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow public ssh access')
   securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080), 'Web from anywhere')
   securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(9090), 'Web from anywhere')

    console.log('pass securityGroup')
   /**
    * @CustomEKS is a class service to create and manage all about the EKS cluster or clusters
    * kubernets and autoScalling implementation in cluster EKS
    */
    const { asg, cluster, clusterKmsKey} = new CustomEKS(
      this,
      `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/ClusterEKS`,
      {
        bastionHostRole,
        securityGroup,
        bastionHostPolicies,
        eksInlinePolicy,
        user,
        vpc,
        ...projectProps,
        ...props,
      }
    );
  
    this.addUserData(asg);
  
    console.log('pass adduserData')
    
    const ecrRepo = new ECR.Repository(this, 'RepoECR', {
      encryption: ECR.RepositoryEncryption.KMS,
      encryptionKey: clusterKmsKey,
      imageScanOnPush: true,
    });
    
    const repository = new codeCommit.Repository(this, 'CodeCommitRepo', {
      repositoryName: `${this.stackName}-repo`,
      description: 'codeComitRepository',
      code: codeCommit.Code.fromDirectory(path.join(__dirname, 'resources/app')), // optional property, branch parameter can be omitted
    });
    console.log('pass repository')


    const sourceOutput = new codepipeline.Artifact();

    const project01 = 
     new codeBuild.Project(this, 'codeBuildProyect', {
      role: bastionHostRole,
      securityGroups: [securityGroup],
      source: getString(projectProps, 'environment') === 'dev' ?
       codeBuild.Source.codeCommit({ repository }) : 
       codeBuild.Source.gitHub({owner: 'Dexterx25', repo: 'stackCDKAdvance'}),
      vpc: vpc.vpc,
      subnetSelection: vpc.vpc.selectSubnets({
        subnets: vpc.subn,
        onePerAz: true,
      }),

      environment: {
        buildImage: codeBuild.LinuxBuildImage.AMAZON_LINUX_2
      },
      environmentVariables: {
        'CLUSTER_NAME': {
          value: `${cluster.clusterName}`
        },
        'ECR_REPO_URI': {
          value: `${ecrRepo.repositoryUri}`
        }
      },
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: {
            commands: [
              'env',
              'export TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION}',
              'export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output=text)',
              '/usr/local/bin/entrypoint.sh',
              'echo Logging in to Amazon ECR',
              'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com'
            ]
          },
          build: {
            commands: [
              'cd flask-docker-app',
              `docker build -t $ECR_REPO_URI:$TAG .`,
              'docker push $ECR_REPO_URI:$TAG'
            ]
          },
          post_build: {
            commands: [
              'kubectl get nodes -n flask-alb',
              'kubectl get deploy -n flask-alb',
              'kubectl get svc -n flask-alb',
              "isDeployed=$(kubectl get deploy -n flask-alb -o json | jq '.items[0]')",
              "deploy8080=$(kubectl get svc -n flask-alb -o wide | grep 8080: | tr ' ' '\n' | grep app= | sed 's/app=//g')",
              "echo $isDeployed $deploy8080",
              "if [[ \"$isDeployed\" == \"null\" ]]; then kubectl apply -f k8s/flaskALBBlue.yaml && kubectl apply -f k8s/flaskALBGreen.yaml; else kubectl set image deployment/$deploy8080 -n flask-alb flask=$ECR_REPO_URI:$TAG; fi",
              'kubectl get deploy -n flask-alb',
              'kubectl get svc -n flask-alb'
            ]
          }
        }
      }),
    })+
    project01.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['eks:*'],
        resources: [`*`],
        sid: 'EKSReadonly',
      })
    );
    project01.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        sid: 'stsReadonly',
        resources: [bastionHostRole.roleArn],
      })
    )
    repository.grantPullPush(project01.grantPrincipal);    
   // new cdk.CfnOutput(this, 'iamidentitymapping command', { value: `eksctl create iamidentitymapping --cluster ${  cluster.clusterName } --region ${ this.region  } --arn ${ bastionHostRole.roleArn } --group system:masters` });

    const sourceOuput = new codepipeline.Artifact();

    const repositorySource = getString(projectProps, 'environment') === 'dev' ?
      new codepipeline_actions.CodeCommitSourceAction({
      actionName: "CodeCommit_Source",
      repository: repository,
      output: sourceOuput,
      branch: "main",
      role: bastionHostRole,
    }) : 
      new codepipeline_actions.GitHubSourceAction({
      actionName: "CodeCommit_Source",
      repo: 'stackCDKAdvance',
      owner: 'Dexterx25',
      branch: 'Main',
      output: sourceOutput,
      oauthToken: cdk.SecretValue.secretsManager(getString(projectProps, 'secertTokenGitHub')),
    })
    ;

    new codepipeline.Pipeline(this, `containerPipeline`, {
      role: bastionHostRole,
      stages: [
        {
          stageName: "Source",
          actions: [
            repositorySource
          ],
        },
        // {
        //   stageName: "UnitTest",
        //   actions: [
        //     new codepipeline_actions.CodeBuildAction({
        //       actionName: "Test_Code",
        //       input: sourceOuput,
        //       project: unitTestProject,
        //     }),
        //   ],
        // },
        {
          stageName: "DockerBuild",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "Build_Code",
              input: sourceOuput,
              project: project01,
            }),
          ],
        },
        {
          stageName: "EKSDeployment",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "Deploy_Code",
              input: sourceOuput,
              project: project01,
            }),
          ],
        },
      ],
    });
    console.log('pipeline pass');
    
    repository.onCommit('OnCommit', {
      target: new targets.CodeBuildProject(project01)
    });
    ecrRepo.grantPullPush(project01.role!)
    cluster.awsAuth.addMastersRole(project01.role!)
    project01.addToRolePolicy(new iam.PolicyStatement({
      actions: ['eks:DescribeCluster'],
      resources: [`${cluster.clusterArn}`],
    }))
    console.log('oncommit and grant Pull Push pass');
    
    new cdk.CfnOutput(this, 'CodeCommitRepoName', { value: `${repository.repositoryName}` })
    new cdk.CfnOutput(this, 'CodeCommitRepoArn', { value: `${repository.repositoryArn}` })
    new cdk.CfnOutput(this, 'CodeCommitCloneUrlSsh', { value: `${repository.repositoryCloneUrlSsh}` })
    new cdk.CfnOutput(this, 'CodeCommitCloneUrlHttp', { value: `${repository.repositoryCloneUrlHttp}` })

    // const pipeline = new CodePipeline(this, "Pipeline", {
    //   synth: new ShellStep("Synth", {
    //     input: CodePipelineSource.gitHub(
    //       "aws-samples/aws-cdk-pipelines-eks-cluster",
    //       "main",
    //       {
    //         authentication:
    //           cdk.SecretValue.secretsManager("github-oauth-token"),
    //       }
    //     ),
    //     commands: ["npm ci", "npm run build", "npx cdk synth"],
    //   }),
    //   pipelineName: "EKSClusterBlueGreen",
    // });
  
    const lb = new elbv2.ApplicationLoadBalancer(
      this, 
      `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/ALB`, 
      {
      vpc: vpc.vpc,
      internetFacing: true,
      securityGroup: securityGroup,
      vpcSubnets: vpc.vpc.selectSubnets({
        subnets: vpc.subn,
        onePerAz: true,
      }),
    });
    console.log('pass LB')
    
    const listener = lb.addListener(
      `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/Listener`, 
    {
      port: props.InstancePort,
      protocol: elbv2.ApplicationProtocol.HTTP,
    });

    listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');
    listener.connections.allowDefaultPortFromAnyIpv4(`${ec2.Port.tcp(22)}`)
    console.log('pass listener')

    
    listener.addTargets(
      `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/TargetGroup`, 
      {
      port: props.InstancePort,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [asg], 
      healthCheck: {
        path: props.HealthCheckPath,
        port: props.HealthCheckPort,
        healthyHttpCodes: props.HealthCheckHttpCodes
      }
    })
    console.log('pass addTargets')

    asg.scaleOnRequestCount(
      `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/AModestLoad`, 
    {
      targetRequestsPerMinute: 60,
    });
    console.log('pass scaleOnRequestCount')

    new ImportWaff(
      this,
      `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/WAF`,
      projectProps,
      lb.loadBalancerArn
    );
    console.log('pass Waff')

  }

  public addUserData(asg: cdk.aws_autoscaling.AutoScalingGroup){
    asg.addUserData('yum update -y')
    asg.addUserData('yum install httpd -y')
    asg.addUserData('sudo service httpd start')
    asg.addUserData('sudo chkconfig httpd on')
    asg.addUserData('sudo cd /var/www/html')
    asg.addUserData('echo "<html><h1>Hello Wolrd</h1></html>" > /var/www/html/index.html')

  }

} 
