import * as eks from "aws-cdk-lib/aws-eks";
import * as cdk from "aws-cdk-lib";
import * as fs from 'fs';
import * as YAML from 'yaml';

export default class JenkinsManager {
  public cluster: eks.Cluster;
  public volume: cdk.aws_ec2.CfnVolume;

  constructor(cluster: eks.Cluster, volume: cdk.aws_ec2.CfnVolume) {
    this.cluster = cluster;
    this.volume = volume;
  }

  installJenkins() {
    const jenkinsYAML = fs.readFileSync('./lib/scripts/jenkins.ebs.install.yaml', 'utf8');
    let jenkinsManifests = YAML.parseAllDocuments(jenkinsYAML);

    jenkinsManifests = jenkinsManifests.map((doc) => doc.toJSON());

    jenkinsManifests = jenkinsManifests.map((resource:any) => {
      if (resource.kind === 'PersistentVolume') {
        resource.spec.awsElasticBlockStore.volumeID = this.volume.attrVolumeId;
      }
      return resource;
    });

    this.cluster.addManifest("Jenkins", ...jenkinsManifests);
  }
}