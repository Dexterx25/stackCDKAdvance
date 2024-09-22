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
    const namespaceManifest = this.cluster.addManifest("JenkinsNamespace", {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: { name: "jenkins" },
    });

    // Crear el PersistentVolume
    const pvManifest = this.cluster.addManifest("JenkinsPV", {
      apiVersion: "v1",
      kind: "PersistentVolume",
      metadata: { name: "jenkins-pv", namespace: "jenkins" },
      spec: {
        capacity: { storage: "10Gi" },
        accessModes: ["ReadWriteOnce"],
        persistentVolumeReclaimPolicy: "Retain",
        storageClassName: "gp2",  // Opcional
        awsElasticBlockStore: {   // Correcto
          volumeID: this.volume.ref,
          fsType: "ext4",
        },
      },
    });

    pvManifest.node.addDependency(namespaceManifest);

    // Crear el PersistentVolumeClaim
    const pvcManifest = this.cluster.addManifest("JenkinsPVC", {
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

    pvcManifest.node.addDependency(namespaceManifest);

    // Desplegar el Helm Chart
    const helmChart = this.cluster.addHelmChart("Jenkins", {
      chart: "jenkins",
      repository: "https://charts.jenkins.io",
      namespace: "jenkins",
      release: "jenkins",
      values: {
        serviceType: "LoadBalancer",
        persistence: {
          enabled: true,
          existingClaim: "jenkins-pvc",
        },
      },
    });

    helmChart.node.addDependency(pvcManifest);
  }
}