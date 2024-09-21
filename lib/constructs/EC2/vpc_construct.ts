import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Fn, StackProps } from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { getString } from '../../../utils';

class CustomVpc  extends Construct {
     public vpc: ec2.IVpc;
     constructor(scope: Construct, id: string, projectProps: StackProps) {
     super(scope, id);
     this.vpc = new ec2.Vpc(this, 
        `${id}/${getString(projectProps, 'environment')}/private_vpc`,
        {
            cidr: '10.0.0.0/16',
            maxAzs: 2,
            natGateways: 1,
            subnetConfiguration: [
                {
                    name: `${id}/${getString(projectProps, 'environment')}/public-subnet01`,
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 24,
                },
                {
                    name: `${id}/${getString(projectProps, 'environment')}/private-subnet01`,
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidrMask: 24,
                },
            ],
        }
        )
    }


}

export  { CustomVpc }