import { Construct } from "constructs";
import * as ec2 from 'aws-cdk-lib/aws-ec2'



class SecurityGroupConstruct extends Construct {
    public basicSecurityGroup: ec2.SecurityGroup
    constructor(scope: Construct, id: string, props: any) {
        super(scope, id);
        this.basicSecurityGroup = new ec2.SecurityGroup(
            this, 
            `${id}`, 
            {
             ...props,
              vpc: props.vpc,
              allowAllOutbound: true,
              securityGroupName: id
            }
         );
         this.basicSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP access');
         this.basicSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS access');
         this.basicSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080), 'Allow HTTP on port 8080');
         this.basicSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(1), 'Allow all TCP traffic'); // Rango desde 1 hasta 65535
         this.basicSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.icmpPing(), 'Allow ICMP (ping)');  
         
         this.basicSecurityGroup.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP access');
         this.basicSecurityGroup.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS access');
         this.basicSecurityGroup.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(1), 'Allow all TCP traffic'); // Rango desde 1 hasta 65535
         this.basicSecurityGroup.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080), 'Allow HTTP on port 8080');
         this.basicSecurityGroup.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.icmpPing(), 'Allow ICMP (ping)');  
    }
}
export default SecurityGroupConstruct;