import { Duration } from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

interface IenvProp {
    account: string;
    region: string;
    adminArn: string;
    adminUsername: string;
    InstancePort: string;
    HealthCheckPath: string;
    HealthCheckPort: string;
    HealthCheckHttpCodes: string;
}
interface PropsConstruct {
    repoName: string;
    env: IenvProp;
}
export class ECRConstruct extends Construct {
    public repository;
    constructor(scope: Construct, id: string, {repoName}: PropsConstruct) {
        super(scope, id)
        const repoFound = ecr.Repository.fromRepositoryName(this, id, repoName)
        if(repoFound) return
        this.repository = new ecr.Repository(this, 'repo', {
            repositoryName: `repoName`,
        })
        this.repository.addLifecycleRule({ tagPrefixList: ['prod'], maxImageCount: 9999 });
        this.repository.addLifecycleRule({ maxImageAge: Duration.days(30) });
    }
}