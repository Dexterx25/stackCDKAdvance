import * as ec2 from 'aws-cdk-lib/aws-ec2';
import {Construct} from 'constructs';
import * as cdk from 'aws-cdk-lib';



class ImportEC2Instance  extends Construct {
    public ec2Instance;
    constructor(scope: Construct, id: string, vpc: ec2.IVpc, securityGroup: cdk.aws_ec2.SecurityGroup, subnetIds: Array<ec2.ISubnet>, userData?: string) {
    super(scope, id);

    this.ec2Instance = new ec2.Instance(this,'ec2Instance', {
        instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.BURSTABLE2,
            ec2.InstanceSize.MICRO,
          ),
        machineImage: new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
          }),
        keyName: 'ec2-key-pair',
        vpc: vpc,
        vpcSubnets: vpc.selectSubnets({
            subnets: subnetIds,
          }),        
        securityGroup: securityGroup,
       })
       if(userData) this.ec2Instance.addUserData(userData)
    }
}

export {ImportEC2Instance}