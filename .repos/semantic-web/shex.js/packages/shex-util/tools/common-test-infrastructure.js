const TESTS = "TESTS" in process.env ?
      process.env.TESTS.split(/,/) :
      null;

const ShExUtil = require("..");
const Fs = require("fs");
const Path = require("path");

/* devDependency on @shexjs/node makes lerna whine:
   > WARN ECYCLE @shexjs/loader -> @shexjs/util -> @shexjs/node -> @shexjs/loader
   so we can't use:
   > const ShExNode = require("@shexjs/node")({
   >   rdfjs: N3,
   >   // cwd: fromDir, // screws up absolutizeResults
   > });
   but instead wrap node-fetch and readFileSyn here: */
const NodeFetch = require('node-fetch');
const ShExNode = {
  GET: function () {
    const [urlP, ...args] = arguments;
    const [url, f] = urlP.match(/^https?:/)
          ? [urlP, function (u, args) {
            return NodeFetch(u, args).then(resp => resp.text());
          }]
          : ["file://" + urlP, function (p) {
            return Promise.resolve(Fs.readFileSync(urlP, "utf-8"))
          }]
    return f(urlP, args).then(text => ({ text, url }))
  }
}

const child_process = require('child_process');
const chai = require("chai");
const expect = chai.expect;
const assert = chai.assert;
const Queue = require("timeout-promise-queue").PromiseQueue(25);

function runCliTests (scriptArgumentLists, fromDir, dumpTimeStamps) {
  const last = new Date();
  const stamp = dumpTimeStamps ? function (s) {
    const t = new Date();
    const delta = t - last;
    last = t;
    console.warn(delta, s);
  } : function () {};

  /* set up IO promises
   */
  Object.keys(scriptArgumentLists).forEach(function (script) {
    let tests = scriptArgumentLists[script];

    if (TESTS)
      tests = tests.filter(function (t) {
        return TESTS.indexOf(t.name) !== -1;
      });

    tests.forEach(function (test) {
      try {
        test.ref =
          "resultText" in test ? { resultText: test.resultText } :
        "resultNoSpace" in test ? ShExNode.GET(fromHere(test.resultNoSpace)).then(function (loaded) { return { resultNoSpace: loaded }; }) :
          "resultMatch" in test ? { resultMatch: RegExp(test.resultMatch) } :
        "errorMatch" in test ? { errorMatch: RegExp(test.errorMatch) } :
        ShExNode.GET(fromHere(test.result)).then(function (loaded) { return { result: loaded }; });

        test.exec = Queue.add(cancel => new Promise(function (resolve, reject) {

          const program = child_process.spawn("../bin/" + script, test.args, {cwd: fromDir});

          if (typeof test.stdin !== "undefined") {  
            // redirecting stdin for this test
            Fs.createReadStream(fromHere(test.stdin)).pipe(program.stdin)
          }

          let stdout = "", stderr = ""

          program.stdout.on("data", function (data) { stdout += data; });
          program.stderr.on("data", function (data) { stderr += data; });
          program.on("close", function (exitCode) {
            // stupid hack 'cause I can't pass node flags
            const SWALLOW_WARNINGS = /\(node\:[0-9]+\) ExperimentalWarning: The Fetch API.*?\n\(Use.*?created\)\n/g;
            if (stderr.length > 0) {
              stderr = stderr.replace(SWALLOW_WARNINGS, "");
            }
            resolve({stdout, stderr, exitCode})
          });
          program.on("error", function(err) { reject(err); });
          cancel.on('timeout', err => {
            program.kill()
            reject()
          })
        }), 60 * 1000); // 1 minute
      } catch (e) {
        const throwMe = new Error("Error setting up test " + test.name + " " + e);
        throwMe.stack = "Error setting up test " + test.name + " " + e.stack;
        throw throwMe;
      }
    });
  });
  stamp("setup");

  /* test results
   */
  Object.keys(scriptArgumentLists).forEach(function (script) {
    let tests = scriptArgumentLists[script];

    describe("The " + script + " script", function () {
      "use strict";

      const setSlow = process.env["CLI_TIMEOUT"]; // CLI_TIMEOUT=4000 will run tests with timout of 4s
      this.timeout(setSlow && setSlow !== "1" ? parseInt(setSlow) : 6000);
      if (TESTS)
        tests = tests.filter(function (t) {
          return TESTS.indexOf(t.name) !== -1;
        });

      tests.forEach(function (test) {
        it(test.name + " should execute $(" + test.args.join(" ") + ")"+
           ("stdin" in test ?
            " with stdin from " + test.stdin :
            "") +
           ( "resultMatch" in test ?
             (" and match /" + test.resultMatch) + "/" :
             (" and get " +
              ("resultText" in test ? JSON.stringify(test.resultText) :
               "resultNoSpace" in test ? JSON.stringify(test.resultNoSpace) : test.result))
           ) +
           " in test '" + test.name + "'.",
           function (done) {
             stamp(script+"/"+test.name);
             Promise.all([test.ref, test.exec]).then(function (both) {
               const ref = both[0];
               const exec = both[1];

               if (test.status === 0) {      // Keep this test before exitCode in order to
                 if (exec.stderr.length > 0)
                   console.error('stderr:', exec.stderr);
                 expect(exec.stderr).to.be.empty; // print errors from spawn.
               }

               if (!("errorMatch" in ref) && exec.stderr.length > 0)
                 throw Error("execution returned an error: " + exec.stderr);

               if ("errorMatch" in ref)
                 expect(exec.stderr).to.match(ref.errorMatch);
               if ("resultMatch" in ref)
                 expect(exec.stdout).to.match(ref.resultMatch);
               else if ("resultText" in ref)
                 expect(exec.stdout).to.equal(ref.resultText);
               else if ("resultNoSpace" in ref)
                 expect(exec.stdout.replace(/[ \n]/g, "")).to.equal(ref.resultNoSpace.text.replace(/[ \n]/g, ""));
               else if ("result" in ref) {
                 expect(JSON.parse(exec.stdout)).to.deep.equal(
                   ShExUtil.absolutizeResults(
                     JSON.parse(ref.result.text), ref.result.url));}
               else if (!("errorMatch" in ref))
                 throw Error("unknown test criteria in " + JSON.stringify(ref));

               expect(exec.exitCode).to.equal(test.status);
               done();
             }).catch(function (e) { done(e); });
           }).timeout(2 * 60 * 1000); // 2 mins for the whole test suite
      });
    });
  });

  function fromHere (urlish) {
    if (!urlish.match(/^[a-z]+:\/\//))
      return Path.join(fromDir, urlish);
    return urlish;
  }
}

/** create a server and return the URL the start of the tests hierarchy
 * @param hostname e.g. localhost, 127.0.0.1, ...
 * @param servedTestsPath URL path where serverRoot will be served from
 * @param path to test files in filesystem
 */
function startLocalServer (hostname, servedTestsPath, serverRoot) {
  const Fs = require('fs');
  const Path = require("path");

  var http = require('http')
  var server = http.createServer(function (request, response) {
    const { method, url: path, rawHeaders } = request;
    if (!path.startsWith(servedTestsPath)) throw Error(`${method} ${path} is outside of ${servedTestsPath}`);

    const filePath = Path.join(serverRoot, path.substr(servedTestsPath.length));
    if (!Fs.existsSync(filePath)) {
      response.writeHead(404, {"Content-Type" : "text/plain"});
      response.end(`${method} ${path} not found`);
    } else {
      const ext = Path.parse(path).ext;
      const mediaType = {
        ".val": "application/json+ld",
        ".ttl": "text/turtle",
        ".shex": "text/shex",
        ".json": "application/json",
        ".jsonld": "application/json+ld",
      }[ext] || "text/plain";
      response.writeHead(200, {"Content-Type" : mediaType});
      response.end(Fs.readFileSync(filePath, 'utf8'));
    }
  });
  server.listen(); // picks a free port
  const ret = "http://" + hostname + ':' + server.address().port + servedTestsPath;
  after(() => { server.close(); }); // shut down this server when mocha thinks it's done (otherwise process will wait).
  return ret;
}

module.exports = {
  runCliTests,
  startLocalServer,
};
