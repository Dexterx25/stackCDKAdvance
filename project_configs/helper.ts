import * as yaml from "js-yaml";
import * as fs from 'fs';
import {Tags} from 'aws-cdk-lib';

/* Create function for read props yaml file */
function readProps(file_path: string){
// Get document, or throw exception on error
        try {
        return yaml.load(fs.readFileSync(file_path, 'utf8'));
        } catch (e) {
         throw e
        }
}


/* Create function for setTags for all resources in a stack*/
function setTags(stack: any, tags: any){
    Object.entries(tags).forEach(([key,value])=> {
         Tags.of(stack).add(key, value);
    });
   
}

export {readProps, setTags};