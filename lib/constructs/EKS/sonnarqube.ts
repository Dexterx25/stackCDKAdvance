import * as eks from "aws-cdk-lib/aws-eks";
import * as fs from 'fs';
import * as YAML from 'yaml';

export default class SonarqubeManager {
  public cluster: eks.Cluster;

  constructor(cluster: eks.Cluster) {
    this.cluster = cluster;
  }

  installSonarqube() {
    const sonarqubeYAML = fs.readFileSync('./lib/scripts/sonarqube.install.yaml', 'utf8');
    let sonarqubeManifests = YAML.parseAllDocuments(sonarqubeYAML);

    sonarqubeManifests = sonarqubeManifests.map((doc) => doc.toJSON());

    this.cluster.addManifest("Sonarqube", ...sonarqubeManifests);
  }
}
