import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';


class AutoScallingEC2Construct extends Construct {
    public autoScallingEC2
    constructor(scope: Construct, id: string, props: any) {
        super(scope, id)
        const ubuntuAmi = new ec2.GenericLinuxImage({
            'us-east-2': 'ami-003932de22c285676',
        });
          const userDataScript = `#!/bin/bash
          # Actualizar el sistema
          apt-get update -y
          # Instalar Docker
          apt-get install -y docker.io
          # Iniciar el servicio de Docker
          systemctl start docker
          # Habilitar el servicio de Docker para que inicie al arrancar
          systemctl enable docker
          # (Opcional) Agregar el usuario 'ubuntu' al grupo Docker
          usermod -aG docker ubuntu
          `;
        this.autoScallingEC2 = new autoscaling.AutoScalingGroup(this, id, {
            vpc: props.vpc,
            role: props.role,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MEDIUM),
            machineImage: ubuntuAmi,
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
            securityGroup: props.securityGroup,
            minCapacity: 2,
            maxCapacity: 5,
            keyName: 'master'
        })
       this.autoScallingEC2.addUserData(userDataScript)
    }
}

export default AutoScallingEC2Construct