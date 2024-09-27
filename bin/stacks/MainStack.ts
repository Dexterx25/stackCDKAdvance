import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import RoleConstruct from "../../lib/constructs/IAM/roles";
import { CustomVpc } from "../../lib/constructs/EC2/vpc_construct";
import * as efs from "aws-cdk-lib/aws-efs";
import EKSClusterConstruct from "../../lib/constructs/EKS/clusterConstruct";
import SecurityGroupConstruct from "../../lib/constructs/EC2/security_group_construct";
import JenkinsManager from "../../lib/constructs/EKS/jenkins";
import SonarqubeManager from "../../lib/constructs/EKS/sonnarqube";
import IngressManager from "../../lib/constructs/EKS/ingressManager";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { ECRConstruct } from "../../lib/constructs/ECR/ECR_construct";

export class MainStack2 extends cdk.Stack {
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id, props);
    const { masterRole: role } = new RoleConstruct(this, `${id}/role`, props);

    const { vpc } = new CustomVpc(this, `${id}/vpc`, props);

    const { basicSecurityGroup: securityGroup } = new SecurityGroupConstruct(
      this,
      `${id}/sec_grp`,
      {
        ...props,
        vpc,
      }
    );

    const fileSystem = new efs.FileSystem(this, "efs", {
      vpc: vpc,
      securityGroup,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.BURSTING,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    fileSystem.connections.allowFrom(
      securityGroup,
      ec2.Port.tcp(2049),
      "Allow NFS access"
    );

    const { basicCluster } = new EKSClusterConstruct(
      this,
      `${id}/eks_cluster`,
      {
        ...props,
        securityGroup,
        adminUsername: props.env.adminUsername,
        adminArn: props.env.adminArn,
        role,
        vpc,
        efsId: fileSystem.fileSystemId,
      }
    );
    
    new ECRConstruct(this, id, {
      ...props,
      repoName: 'repotest',
    });

    basicCluster.addHelmChart("IstioChart", {
      chart: "istiod",
      repository: "https://istio-release.storage.googleapis.com/charts",
      namespace: "istio-system",
      createNamespace: true,
    });

    basicCluster.addHelmChart("KialiChart", {
      chart: "kiali-server",
      repository: "https://kiali.org/helm-charts",
      namespace: "istio-system",
      createNamespace: false,
      values: {
        auth: {
          strategy: "anonymous",
        },
        external_services: {
          grafana: {
            enabled: true,
            url: "http://a03951f4e16f943d1a457758b543f7c7-474119699.us-east-2.elb.amazonaws.com:3000",
          },
          prometheus: {
            enabled: true,
            url: "http://ab11144bdb5244b29ad19677772d191a-1678984514.us-east-2.elb.amazonaws.com:9090",
          },
        },
        secretName: "kiali-login",
      },
    });
    basicCluster.addHelmChart("EfsCsiDriver", {
      repository: "https://kubernetes-sigs.github.io/aws-efs-csi-driver/",
      chart: "aws-efs-csi-driver",
      release: "efs-csi-driver",
      namespace: "kube-system",
    });

    const efsStorageClass = {
      apiVersion: "storage.k8s.io/v1",
      kind: "StorageClass",
      metadata: { name: "efs-sc" },
      provisioner: "efs.csi.aws.com",
      volumeBindingMode: "Immediate",
    };

    const persistentVolume = {
      apiVersion: "v1",
      kind: "PersistentVolume",
      metadata: { name: "efs-pv" },
      spec: {
        capacity: {
          storage: "10Gi",
        },
        accessModes: ["ReadWriteMany"],
        persistentVolumeReclaimPolicy: "Retain",
        storageClassName: "efs-sc",
        csi: {
          driver: "efs.csi.aws.com",
          volumeHandle: fileSystem.fileSystemId,
        },
      },
    };
    basicCluster.addManifest("EfsStorageClass", efsStorageClass);

    basicCluster.addManifest("EfsPersistentVolume", persistentVolume).node.addDependency(fileSystem);

    const persistentVolume2 = {
      apiVersion: "v1",
      kind: "PersistentVolume",
      metadata: { name: "efs-pv2" },
      spec: {
        capacity: {
          storage: "10Gi",
        },
        accessModes: ["ReadWriteMany"],
        persistentVolumeReclaimPolicy: "Retain",
        storageClassName: "efs-sc",
        csi: {
          driver: "efs.csi.aws.com",
          volumeHandle: fileSystem.fileSystemId,
        },
      },
    };
    basicCluster.addManifest("EfsPersistentVolume2", persistentVolume2);

    basicCluster.addManifest("IngressNamespace", {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: {
        name: "ingress",
      },
    });

    basicCluster.addHelmChart("NginxIngress", {
      repository: "https://kubernetes.github.io/ingress-nginx",
      chart: "ingress-nginx",
      release: "nginx-ingress",
      namespace: "ingress",
      values: {
        controller: {
          service: {
            annotations: {
              "service.beta.kubernetes.io/aws-load-balancer-type": "elb",
            },
          },
        },
      },
    });
    const jenkinsInst = new JenkinsManager(basicCluster);
    jenkinsInst.installJenkins();

    const sonarqubeInst = new SonarqubeManager(basicCluster);
    sonarqubeInst.installSonarqube();
    const ingressInst = new IngressManager(basicCluster);
    ingressInst.installIngress();
    /** */
  }
}
