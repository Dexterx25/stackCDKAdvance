function getString(object: { [name: string]: any }, propertyName: string ): string
{    
    if(!object[propertyName] || object[propertyName].trim().length === 0)
        throw new Error('property '+propertyName +' does not exist or is empty');

    return object[propertyName];
}


export {getString}