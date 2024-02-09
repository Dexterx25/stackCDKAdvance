import { StackProps } from "aws-cdk-lib";
const helper = require('js-yaml');
import * as path from 'path';
import * as fs from 'fs'

const props: { [name: string]: any } = helper.load(fs.readFileSync(path.resolve('./project_configs/environment_options.yaml'), 'utf8'))

export default props;

