import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';


class EC2InstanceConstruct extends Construct {
    public ec2_instance
    constructor(scope: Construct, id: string, props: any){
        super(scope, id)
        this.ec2_instance = new ec2.Instance(this, id, {
            vpc: props.vpc,
            role: props.role,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MEDIUM),
            machineImage: new ec2.AmazonLinuxImage({
                 generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
                }),
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
            securityGroup: props.securityGroup
        })
        if(props.userData) this.ec2_instance.addUserData(props.userData)
    }
}

export default EC2InstanceConstruct