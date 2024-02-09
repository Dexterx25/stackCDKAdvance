import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Fn, StackProps } from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { getString } from '../../utils';

/** Class representing a vpc import from parameter stores
 * with a predefine sysntax name
 *  */
class CustomVpc  extends Construct {
     public vpc: ec2.IVpc;
     public subn: Array<ec2.ISubnet>;
     constructor(scope: Construct, id: string, projectProps: StackProps ) {
     super(scope, id);
     this.vpc = new ec2.Vpc(this, 
        `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/private_vpc`,
        {
            //cidr: "10.0.0.0/16",
            subnetConfiguration: [
                {
                    name: `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/public-subnet01`,
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 24,
                },
                {
                    name: `${getString(projectProps, 'project_name')}/${getString(projectProps, 'environment')}/isolated-subnet01`,
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidrMask: 24,
                },
            ],
           // maxAzs: 3,
        }
        )
        
        this.subn = [ ...this.vpc.privateSubnets]
    }


}

export  { CustomVpc }