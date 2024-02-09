import { Stack, Fn, StackProps } from "aws-cdk-lib";
//import { LambdaService } from "./constructs/lambda-service";
import { ImportVpc } from "./constructs/import_vpc";
import { Construct } from "constructs";

/** Class representing a Stack for serverless lambda. */
class Cdkv2JavascriptTemplateStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {projectProps=} projectProps
   * @param {StackProps=} props
   */
  constructor(scope: Construct, id: string, projectProps: StackProps | any, props: StackProps | any) {
    super(scope, id, props);

    // Import VPC
    const vpc = new ImportVpc(
      this,
      projectProps["project_name"].concat("VPC"),
      projectProps
    );
  
  }
}

export { Cdkv2JavascriptTemplateStack };
