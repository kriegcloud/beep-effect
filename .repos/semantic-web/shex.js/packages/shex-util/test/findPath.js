
var TESTSDIR = "TESTSDIR" in process.env ? process.env.TESTSDIR : "../../../../shexTest";
var fs = require("fs");
var path = require("path");
module.exports = function (dirName) {

  // try relative path to package.json
  var packageName = path.resolve(__dirname, TESTSDIR, "package.json");
  if (fs.existsSync(packageName)) {
    try {
      var pkg = require(path.resolve(__dirname, TESTSDIR, JSON.parse(fs.readFileSync(packageName, "utf8")).main))[dirName];
      if (pkg !== undefined) {
        return pkg;
      }
    } catch (e) {
      // fall through
    }
  }

  // try relative path directly to test directories
  var fromPath = path.resolve(__dirname, TESTSDIR, dirName) + "/";
  if (fs.existsSync(fromPath)) {
    return fromPath;
  }

  try {
    // try npm-installed module
    var fromPackage = require("shex-test")[dirName];
    if (fromPackage !== undefined) {
      return fromPackage;
    }
  } catch (e) {
    throw new Error(fromPath + " not found and shex-test not installed. Either 'npm install shex-test' or '(cd .. && git clone git@github.com:shexSpec/shex-test.git)' .");
  }
  throw new Error(fromPath + " not found and " + dirName + " not in shexTest repo.");
};

