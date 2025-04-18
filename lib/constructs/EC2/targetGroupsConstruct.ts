import { Duration } from 'aws-cdk-lib';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';


class TargetGroupConstruct extends Construct {
    public targetGroup;
    constructor(scope: Construct, id: string, props: any) {
        super(scope, id)
        this.targetGroup = new elbv2.ApplicationTargetGroup(this, id, {
            vpc: props.vpc,
            targetGroupName: 'targetInstanceIC2',
            port: 80,
            healthCheck: {
                path: '/h',
                interval: Duration.minutes(1),
            }

        })
    }
}

export default TargetGroupConstruct