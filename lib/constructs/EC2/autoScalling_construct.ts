import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';


class AutoScallingEC2Construct extends Construct {
    public autoScallingEC2
    constructor(scope: Construct, id: string, props: any) {
        super(scope, id)
        this.autoScallingEC2 = new autoscaling.AutoScalingGroup(this, id, {
            vpc: props.vpc,
            role: props.role,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MEDIUM),
            machineImage: new ec2.AmazonLinuxImage({
                 generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
                }),
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
            securityGroup: props.securityGroup,
            minCapacity: 2,
            maxCapacity: 5,
        })
        if(props.userData) this.autoScallingEC2.addUserData(props.userData)
    }
}

export default AutoScallingEC2Construct