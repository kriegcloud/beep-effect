/**
 * This file is the main entry point into calling an extension. 
 * It determines which extension is requested, and then, assuming
 * the extension is valid, it forwards the request on
 */
const Extensions = (function () {

// Known extensions
const hashmap_extension = require('./hashmap_extension');
const regex_extension = require('./regex_extension');

const utils = require('./extension-utils');

/**
 * Given a map directive that contains an extension of format 
 *          extensionName(args) 
 * split it up for easy access to extenion name and arguments separately 
 * 
 * @param a map directive with an extension call embedded
 *
 * @return an object with members:  extension name and the arguments.
 */
function extensionDef(mapDirective) { 
    if (mapDirective === undefined)
        throw Error("Invalid extension function: " + mapDirective + "!");

    // Get the extension name and argument(s)  
    mapDirective = mapDirective.trim(); // Strip any leading or trailing white space
    const startArgs = mapDirective.indexOf('(', 0);
    const endArgs = mapDirective.lastIndexOf(')');
    if (startArgs < 2 || endArgs < 4 || endArgs <= startArgs+1 || endArgs != mapDirective.length-1) 
        throw Error("Invalid extension function: " + mapDirective + "!");

    return { name:  mapDirective.substring(0, startArgs),
             args:  mapDirective.substring(startArgs+1, endArgs) }; 
}

function lift(mapDirective, input, prefixes) {
    const extDef = extensionDef(mapDirective);
    switch (extDef.name) {
        case 'hashmap': 
          return hashmap_extension.lift(mapDirective, input, prefixes, extDef.args);

        case 'regex': 
          return regex_extension.lift(mapDirective, input, prefixes, extDef.args);

        case 'test': 
          return mapDirective;

        default: 
          throw Error('Unknown extension: '+ mapDirective+'!');
    }
}

function lower(mapDirective, bindings, prefixes) {
    const extDef = extensionDef(mapDirective);
    switch (extDef.name) {
        case 'hashmap': 
          return hashmap_extension.lower(mapDirective, bindings, prefixes, extDef.args);

        case 'regex': 
          return regex_extension.lower(mapDirective, bindings, prefixes, extDef.args);

        case 'test': 
          return mapDirective;
      
        default: 
          throw Error('Unknown extension: ' + mapDirective+'!');
    }
}

return {
    lift: lift,
    lower: lower,
};
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = Extensions;
