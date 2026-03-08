/* require.js - a collection of horrible hacks to enable loading
 * node.js libraries into a web browser environment.

 * The general usage is:
     <script src="require.js"></script>
     <script src="https://rawgit.com/RubenVerborgh/N3.js/main/lib/N3Util.js"></script>
     <script>modules["./N3Util"] = N3Util = module.exports;</script>
 * This idiom loads the module and assigns the current assignment of
 * module.exports to a global. Some libraries include an index library
 * which provides access to the individual libraries. This can be hacked
 * with:
     <script>modules["n3"]["Util"] = modules["./N3Util"];</script>
 */

function require (module) {
  return { inspect: JSON.stringify };
}
if (typeof Error.captureStackTrace === "undefined")
  Error.captureStackTrace = function (err, lookFor) {
    // do nothing
  }
process = { env: {} };
exports = {  };
module = { exports: exports };
modules = {
  // util: {
  //   inspect: function (o) { return "util.inspect(s):"+JSON.stringify(o); }
  // },
  // n3: { },
  // fs: { }, path: { }, jsonld: { },
  // promise: Promise
};
// modules["request-promise"] = function (url) {
//   return fetch(url).then(function (response) {
//     if (response.ok) {
//       return response.text();
//     }
//     throw Error("GET " + url + " failed: " + response.status + " " + response.statusText);
//   });
// };
__usage = {  };
var require = function (s) {
  if (s in modules) {
    __usage[s] = s in __usage ? __usage[s] + 1 : 1
    return modules[s];
  } else {
    console.trace(Error("no def for \"" + s + "\" in:" + JSON.stringify(Object.keys(modules))).stack);
  }
}
require.usage = function () { return Object.fromEntries(Object.keys(modules).map(s => [s, s in __usage ? __usage[s] : 0])); }
