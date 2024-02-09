import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Fn, StackProps } from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { getString } from '../../utils';

/** Class representing a vpc import from parameter stores
 * with a predefine sysntax name
 *  */
class ImportVpc  extends Construct {
     public vpc: ec2.IVpc;
     public subn: Array<ec2.ISubnet>;
     constructor(scope: Construct, id: string, projectProps: StackProps ) {
     super(scope, id);
    const vpcID = ssm.StringParameter.valueForStringParameter(
        this, '/' + getString(projectProps.tags!, 'Project').toLowerCase() + '/' +
        getString(projectProps, 'environment') + '/vpc');
  
      // Import VPC such IVPC
      let subnetIds = Fn.split(",", ssm.StringParameter.valueForStringParameter(
        this, '/' + getString(projectProps.tags!, 'Project').toLowerCase() + '/' +
        getString(projectProps, 'environment') + '/vpc/private_subnets')
      );
      let azs = Fn.split(",", ssm.StringParameter.valueForStringParameter(
        this, '/' + getString(projectProps.tags!, 'Project').toLowerCase() + '/' +
        getString(projectProps, 'environment') + '/vpc/availability_zones')
      );
      this.subn = []
      for (let s in subnetIds) {
  
        this.subn.push(ec2.Subnet.fromSubnetAttributes(this, "sub"+s, {
                subnetId: subnetIds[s],
                availabilityZone: azs[s],
                //routeTableId: 'rt-145'
              })
              )
      }
      
      this.vpc = ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
        availabilityZones: azs,
        vpcId: vpcID,
      //privateSubnetIds:  subnetId2s ,
      });

      
    
    }


}

export  { ImportVpc }