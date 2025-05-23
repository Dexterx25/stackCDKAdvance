import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { StackProps } from 'aws-cdk-lib';
import {Construct} from 'constructs';

class CustomVpc  extends Construct {
     public vpc: ec2.IVpc;
     constructor(scope: Construct, id: string, _projectProps: StackProps) {
     super(scope, id);
     this.vpc = new ec2.Vpc(this, 
        `${id}`,
        {
            maxAzs: 2,
            natGateways: 1,
            subnetConfiguration: [
                {
                    name: `${id}/public-subnet01`,
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 24,
                },
                {
                    name: `${id}/private-subnet01`,
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidrMask: 24,
                },
            ],
        }
        )
    }


}

export  { CustomVpc }