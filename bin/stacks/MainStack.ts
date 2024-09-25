import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import RoleConstruct from '../../lib/constructs/IAM/roles';
import { CustomVpc } from '../../lib/constructs/EC2/vpc_construct';
import * as efs from "aws-cdk-lib/aws-efs";
import EKSClusterConstruct from '../../lib/constructs/EKS/clusterConstruct';
import SecurityGroupConstruct from '../../lib/constructs/EC2/security_group_construct';
import JenkinsManager from '../../lib/constructs/EKS/jenkins';
import { EKSAccessManager } from '../../lib/constructs/EKS/accessManager';
import SonarqubeManager from '../../lib/constructs/EKS/sonnarqube';
import IngressManager from '../../lib/constructs/EKS/ingressManager';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import SecurityGroupEFSConstruct from '../../lib/constructs/EC2/efs_security_group';

export class MainStack2 extends cdk.Stack {
    constructor(scope: Construct, id:string, props: any){
        super(scope, id, props)
        const {
            masterRole: role
        } = new RoleConstruct(this, `${id}/role`, props)
       
        const {
            vpc
        } = new CustomVpc(this, `${id}/vpc`, props)

        const { 
            basicSecurityGroup: securityGroup,
        } = new SecurityGroupConstruct(this, `${id}/sec_grp`, {
            ...props,
            vpc,
        })

        const fileSystem = new efs.FileSystem(this, 'efs', {
            vpc: vpc,
            securityGroup,
            lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
            performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
            throughputMode: efs.ThroughputMode.BURSTING,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
          });

         const {basicCluster} = new EKSClusterConstruct(this, `${id}/eks_cluster`, {
            ...props,
            securityGroup,
            adminUsername:props.env.adminUsername,
            adminArn:props.env.adminArn,
            role,
            vpc,
            efsId: fileSystem.fileSystemId
        })
        const efsStorageClass = {
            apiVersion: 'storage.k8s.io/v1',
            kind: 'StorageClass',
            metadata: { name: 'efs-sc' },
            provisioner: 'efs.csi.aws.com',
            volumeBindingMode: 'Immediate'
          };
          basicCluster.addManifest('EfsStorageClass', efsStorageClass);
      
          const persistentVolume = {
            apiVersion: 'v1',
            kind: 'PersistentVolume',
            metadata: { name: 'efs-pv' },
            spec: {
              capacity: {
                storage: '10Gi',
              },
              accessModes: ['ReadWriteMany'],
              persistentVolumeReclaimPolicy: 'Retain',
              storageClassName: 'efs-sc',
              csi: {
                driver: 'efs.csi.aws.com',
                volumeHandle: fileSystem.fileSystemId,
              },
            },
          };
          basicCluster.addManifest('EfsPersistentVolume', persistentVolume);

          const persistentVolume2 = {
            apiVersion: 'v1',
            kind: 'PersistentVolume',
            metadata: { name: 'efs-pv2' },
            spec: {
              capacity: {
                storage: '10Gi',
              },
              accessModes: ['ReadWriteMany'],
              persistentVolumeReclaimPolicy: 'Retain',
              storageClassName: 'efs-sc',
              csi: {
                driver: 'efs.csi.aws.com',
                volumeHandle: fileSystem.fileSystemId,
              },
            },
          };
          basicCluster.addManifest('EfsPersistentVolume2', persistentVolume2);
          
          basicCluster.addHelmChart('EfsCsiDriver', {
            repository: 'https://kubernetes-sigs.github.io/aws-efs-csi-driver/',
            chart: 'aws-efs-csi-driver',
            release: 'efs-csi-driver',
            namespace: 'kube-system',
          });
          basicCluster.addManifest('IngressNamespace', {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: {
              name: 'ingress',
            },
          });
      
          basicCluster.addHelmChart('NginxIngress', {
            repository: 'https://kubernetes.github.io/ingress-nginx',
            chart: 'ingress-nginx',
            release: 'nginx-ingress',
            namespace: 'ingress',
            values: {
              controller: {
                service: {
                  annotations: {
                    'service.beta.kubernetes.io/aws-load-balancer-type': 'nlb',
                  },
                },
              },
            },
          });
        const jenkinsInst = new JenkinsManager(basicCluster);
        jenkinsInst.installJenkins()
       /* const sonarqubeInst = new SonarqubeManager(basicCluster);
        sonarqubeInst.installSonarqube();
        const ingressInst = new IngressManager(basicCluster);
        ingressInst.installIngress();*/
    }
}