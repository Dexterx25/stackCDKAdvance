import * as eks from "aws-cdk-lib/aws-eks";
import * as fs from 'fs';
import * as YAML from 'yaml';

export default class IngressManager {
  public cluster: eks.Cluster;

  constructor(cluster: eks.Cluster) {
    this.cluster = cluster;
  }

  installIngress() {
    const ingressYAML = fs.readFileSync('./lib/scripts/ingress.yaml', 'utf8');
    let ingressManifests = YAML.parseAllDocuments(ingressYAML);

    ingressManifests = ingressManifests.map((doc) => doc.toJSON());

    this.cluster.addManifest("Ingress", ...ingressManifests);
  }
}
