import * as eks from "aws-cdk-lib/aws-eks";
import * as cdk from "aws-cdk-lib";
import * as fs from 'fs';
import * as YAML from 'yaml';

export default class JenkinsManager {
  public cluster: eks.Cluster;
  public fileSystem: cdk.aws_efs.FileSystem

  constructor(cluster: eks.Cluster, fileSystem: cdk.aws_efs.FileSystem) {
    this.cluster = cluster;
    this.fileSystem = fileSystem
  }

  installJenkins() {
    const jenkinsYAML = fs.readFileSync('./lib/scripts/jenkins.efs.install.yaml', 'utf8');
    let jenkinsManifests = YAML.parseAllDocuments(jenkinsYAML);

    jenkinsManifests = jenkinsManifests.map((doc) => doc.toJSON());

    jenkinsManifests = jenkinsManifests.map((resource:any) => {
      if (resource.kind === 'PersistentVolume') {
        resource.spec.csi.volumeHandle = `${this.fileSystem.fileSystemId}`;
      }
      return resource;
    });

    this.cluster.addManifest("Jenkins", ...jenkinsManifests);
  }
}