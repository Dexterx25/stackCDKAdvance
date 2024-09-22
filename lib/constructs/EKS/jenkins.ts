import * as eks from "aws-cdk-lib/aws-eks";
import * as cdk from "aws-cdk-lib";

export default class JenkinsManager {
  public cluster: eks.Cluster;
  public volume: cdk.aws_ec2.CfnVolume;
  constructor(cluster: eks.Cluster, volume: cdk.aws_ec2.CfnVolume) {
    this.cluster = cluster;
    this.volume = volume;
  }
  installJenkins() {
    this.cluster.addManifest("JenkinsNamespace", {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: { name: "jenkins" },
    });

    // Crear el PersistentVolume
    this.cluster.addManifest("JenkinsPV", {
      apiVersion: "v1",
      kind: "PersistentVolume",
      metadata: { name: "jenkins-pv", namespace: 'jenkins' },
      spec: {
        capacity: { storage: "10Gi" },
        accessModes: ["ReadWriteOnce"],
        persistentVolumeReclaimPolicy: "Retain",
        persistentVolumeSource: {
          awsElasticBlockStore: {
            volumeId: this.volume.ref,
            fsType: "ext4",
          },
        },
      },
    });

    // Crear el PersistentVolumeClaim
    this.cluster.addManifest("JenkinsPVC", {
      apiVersion: "v1",
      kind: "PersistentVolumeClaim",
      metadata: { name: "jenkins-pvc", namespace: "jenkins" },
      spec: {
        accessModes: ["ReadWriteOnce"],
        resources: {
          requests: {
            storage: "10Gi",
          },
        },
      },
    });

    this.cluster.addHelmChart("Jenkins", {
      chart: "jenkins",
      repository: "https://charts.jenkins.io",
      namespace: "jenkins",
      values: {
        serviceType: "LoadBalancer",
        persistence: {
          enabled: true,
          existingClaim: "jenkins-pvc",
        },
      },
    });
  }
}
