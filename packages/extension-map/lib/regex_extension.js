/**
 * The regex extension expects a map directive like: 
 *    regex(/<regex>/) 
 * where the regex should specify one or more target variables, e.g.,
 *    regex(/"(?<dem:family>[a-zA-Z'\\-]+),\\s*(?<dem:given>[a-zA-Z'\\-\\s]+)"/)
 * The expression will be applied and the results returned as a hash.
 */

const RegexExtension = (function () {
const extUtils = require('./extension-utils');

const captureGroupName = "(\\?<(?:[a-zA-Z:]+|<[^>]+>)>)";

/**
 * Given a variable name, looks up its prefix, and  replacing the shorthand
 * prefix name in the variable with l name.
 *
 * @param shortPrefixedVar a short prefixed variable name to expand e.g., dem:id
 * @param prefixes a list of the prefix short name/full name mappings
 *
 * @return the fully expanded name
 */
function applyPrefix(varName, prefixes) {

  // Figure out what variable syntax we have.  It could be <varname> or <prefix:varname>
  const matches = varName.match(/^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/);
  if (matches === null)
    throw Error("variable \"" + varName + "\" did not match expected pattern!");

  let expandedVarName;
  if (matches[1]) {
    // Got <varname>
    expandedVarName = matches[1];

  } else if (matches[2] in prefixes) {
    // prefixed const e.g., dem:id
    expandedVarName = prefixes[matches[2]] + matches[3];

  } else
    // unknown prefix
    throw Error("Unknown prefix " + matches[2] + " in \"" + varName + "\"!");

  return expandedVarName;
}

/**
 * Expand the variable passed in shortPrefixedVar, and add it to a list of the known
 * fully expanded variables.
 *
 * @param shortPrefixedVar a short prefixed variable name e.g., ?<dem:id>
 * @param expandedVars the list of known variables
 * @param prefixes the prefix hash that maps short prefix name to the full URI prefix
 *
 * @return the fully expanded variable name
 */
function buildExpandedVars(shortPrefixedVar, expandedVars, prefixes) {

    // shortPrefixedVar will look like this: ?<test:string> - strip off the ?< and > chars
    const v = extUtils.unescapeMetaChars( shortPrefixedVar.substr(2, shortPrefixedVar.length - 3) );
    const expandedVarName = applyPrefix(v, prefixes);

  if (expandedVarName in expandedVars)
        throw Error("unable to process prefixes in " + expandedVarName);

    // Add this new const to the list and return the expanded const name
    expandedVars.push(expandedVarName);

    return expandedVarName;
}

/**
 * Strip any starting and trailing / char, ignoring leading & trailing whitespace
 */
function trimPattern(args) { 
    if (/^\s*\/.*\/\s*$/.test(args)) {   
        args = /^\s*\/(.*)\/\s*$/.exec(args)[1];
        if (args.length < 1) throw Error(mapDirective + ' is missing the required regex pattern');
    }

    return args;
}

function lift(mapDirective, input, prefixes, args) {
    args = trimPattern(args);

    const expandedVars = [];
    const pattern = args.replace(RegExp(captureGroupName, "g"), 
        function (m, varName, offset, regexStr) {
            buildExpandedVars(varName, expandedVars, prefixes);
            return "";
    });

    if (expandedVars.length === 0) {
        throw Error('Found no capture variable in ' + mapDirective + '!');
    }
    
    let matches;
    try {
        matches = input.match(RegExp(pattern));
    } catch (e) {
        throw Error('Error pattern matching '+mapDirective + " with " + input + ": " + e.message);
    }

    if (!matches) throw Error(mapDirective + ' found no match for input "' + input + '"!');

    // Build a hash of the regex variable name/value pairs
    const result = {};
    for (let i = 1; i < matches.length; ++i) {
      result[expandedVars[i-1]] = matches[i];
    }
  
    return result;
}

function lower(mapDirective, bindings, prefixes, args) {
    args = trimPattern(args);

    // Replace mapDirective named capture groups into bindings for those names.
    const expandedVars = [];
    let matched = false;
    let string = args.replace(RegExp("\\("+captureGroupName+"[^)]+\\)", "g"),
        function (m, varName, offset, str) {
            matched = true;
            const expVarName = buildExpandedVars(varName, expandedVars, prefixes);
            const val = bindings.get(expVarName);
            if (val === undefined) {
                throw Error("Unable to process " + mapDirective + 
                            " because variable \"" + expVarName + "\" was not found!");
      
            } else {
                return val.value || val;
            }
    });

    if (!matched) {
        throw Error('Found no capture variable in ' + mapDirective + '!');
    }

    string = extUtils.collapseSpaces(string); // replaces white space with a single space 
    return '"' + extUtils.unescapeMetaChars(string) + '"';
}

return {
  lift: lift,
  lower: lower
};
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = RegexExtension;
