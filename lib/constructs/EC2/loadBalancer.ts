import { Duration } from 'aws-cdk-lib';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';


class LBContruct extends Construct {
    public elbLoadBalancerBasic;
    constructor(scope: Construct, id: string, props: any) {
        super(scope, id)
        this.elbLoadBalancerBasic = new elbv2.ApplicationLoadBalancer(this, id, {
            vpc: props.vpc,
            internetFacing: true,
            securityGroup: props.securityGroup,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
            idleTimeout: Duration.minutes(120),
            loadBalancerName: id,
        })
    }
}

export default LBContruct