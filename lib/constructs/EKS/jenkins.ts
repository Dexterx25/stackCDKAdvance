import * as eks from "aws-cdk-lib/aws-eks";
import * as fs from 'fs';
import * as YAML from 'yaml';

export default class JenkinsManager {
  public cluster: eks.Cluster;

  constructor(cluster: eks.Cluster) {
    this.cluster = cluster;
  }

  installJenkins() {
    const jenkinsYAML = fs.readFileSync('./lib/scripts/jenkins.install.yaml', 'utf8');
    let jenkinsManifests = YAML.parseAllDocuments(jenkinsYAML);

    jenkinsManifests = jenkinsManifests.map((doc) => doc.toJSON());

    this.cluster.addManifest("Jenkins", ...jenkinsManifests);
  }
}