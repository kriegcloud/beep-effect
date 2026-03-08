// Test shex.js command line scripts.

"use strict";
const DEBUG = "DEBUG" in process.env;
const TEST_server = "TEST_server" in process.env ? JSON.parse(process.env["TEST_server"]) : false;
const TIME = "TIME" in process.env;
const TESTS = "TESTS" in process.env ?
    process.env.TESTS.split(/,/) :
    null;
const HTTPTEST = "HTTPTEST" in process.env ?
    process.env.HTTPTEST :
    "http://raw.githubusercontent.com/shexSpec/shex.js/main/test/"

const ShExUtil = require("@shexjs/util");
const N3 = require("n3");
const ShExNode = require("@shexjs/node")({
  rdfjs: N3,
  // cwd: __dirname, // screws up absolutizeResults
});
const child_process = require('child_process');
const chai = require("chai");
const expect = chai.expect;
const assert = chai.assert;
const Queue = require("timeout-promise-queue").PromiseQueue(25);

const Fs = require("fs");
const Path = require("path");
const Fetch = require("node-fetch");

const manifestFile = "cli/manifest.json";

const RestTests = {
  "no-defaults": {
    args: [],
    posts: [
      { curl: [], errors: ["No schema specified."], status: 400 },
      { curl: ["-F", "data=@./packages/shex-cli/test/cli/p2p3.ttl", "-F", "node=x"], errors: ["No schema specified."], status: 400 },
      { curl: ["-F", "schema=@./packages/shex-cli/test/cli/1dotOr2dot.shex", "-F", "shape=http://a.example/S1"], errors: ["No data specified."], status: 400 },
      { curl: ["-F", "schema=@./packages/shex-cli/test/cli/1dotOr2dot.shex", "-F", "shape=http://a.example/S1", "-F", "data=@./packages/shex-cli/test/cli/p2p3.ttl", "-F", "node=x"], result: "cli/1dotOr2dot_pass_p2p3.val", resultBaseIsEndpoint: true , status: 200 },
    ]
  },
  "default-schema-and-data": {
    args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>"],
    posts: [
      { curl: [], result: "cli/1dotOr2dot_pass_p1.val", status: 200 },
      { curl: ["-F", "schema=@./packages/shex-cli/test/cli/1dotOr2dot.shex", "-F", "shape=http://a.example/S1"], result: "cli/1dotOr2dot_pass_p1.val", status: 200 },
      { curl: ["-F", "data=@./packages/shex-cli/test/cli/p2p3.ttl", "-F", "node=x"], result: "cli/1dotOr2dot_pass_p2p3.val", resultBaseIsEndpoint: true, status: 200 },
      { curl: ["-F", "data=@./packages/shex-cli/test/cli/p2p3.ttl", "-F", "queryMap= <x>@<http://a.example/S1>"], result: "cli/1dotOr2dot_pass_p2p3.val", resultBaseIsEndpoint: true, status: 200 },
      { curl: ["-F", "data=@./packages/shex-cli/test/cli/p2p3.ttl", "-F", "queryMap= {FOCUS :p2 _}@<http://a.example/S1>"], result: "cli/1dotOr2dot_pass_p2p3.val", resultBaseIsEndpoint: true, status: 200 },
      { curl: ["-F", "schema=@./packages/shex-cli/test/cli/1dotOr2dot.shex", "-F", "shape=http://a.example/S1", "-F", "data=@./packages/shex-cli/test/cli/p2p3.ttl", "-F", "node=x"], result: "cli/1dotOr2dot_pass_p2p3.val", resultBaseIsEndpoint: true, status: 200 },
    ]
  },
}

if (!TEST_server) {
  console.warn("Skipping server-tests; to activate these tests, set environment variable TEST_server=true");

} else {

  const ServeArgs = ["-S", "http://localhost:8088/validate", "--serve-n", "1", "-Q"];
  const ServerEndpoint = "http://localhost:8088/validate";
  const ValidateScript = "../bin/validate";

  async function tryPostToServer (serverName, serverTest, postTest) {
    let server = null;
    try {
      server = await startServer(serverTest.args);
    } catch (e) {
      throw makeError(`Error in ${serverName} starting server with ${serverTest.args.join(' ')}`, e);
    }
    try {
      return await executePost(server, postTest);
    } catch (e) {
      server.kill();
      throw makeError(`Error calling server ${serverName} with ${postTest.curl}`, e);
    }
  }

  function makeError (msg, caughtError) {
    const throwMe = new Error(msg + ": " + caughtError);
    if (caughtError.stack)
      throwMe.stack = msg + ": " + caughtError.stack;
    return throwMe;
  }

  async function startServer (serverArgs) {
    const allArgs = ServeArgs.concat(serverArgs);
    const server = DEBUG
          ? child_process.spawn("/usr/local/bin/node", ["--inspect-brk", ValidateScript].concat(allArgs), {cwd: __dirname})
          : child_process.spawn(ValidateScript, allArgs, {cwd: __dirname});
    const [host, port] = await new Promise((resolve, reject) => {
      server.stdout.on("data", expectHostPort);
      server.stderr.on("data", DEBUG ? ignoreData : expectNothing);

      function expectHostPort (data) {
        const text = data.toString('utf8');
        const m = text.match(/^host:\s*([^ ]+)\s+port:\s*([0-9]+)\n$/);
        if (m) {
          server.stdout.removeListener("data", expectHostPort);
          server.stderr.removeListener("data", expectNothing);
          resolve([m[1], m[2]]);
        } else {
          server.kill();
          reject(Error(`Server start failure, saw "${text}"`));
        }
      }

      function expectNothing (data) {
        server.kill();
        reject(Error(`unexpected stderr starting server: ${data.toString('utf8')}`));
      }

      function ignoreData (data) { }
    })
    return server;
  }

  async function executePost (server, postTest) {
    const parms = [];
    for (let i = 0; i < postTest.curl.length; ++i) {
      const arg = postTest.curl[i];
      switch (arg) {
      case '-F':
        const next = postTest.curl[++i];
        const equals = next.indexOf('=');
        let [attr, value] = [next.substr(0, equals), next.substr(equals + 1)];
        if (value.startsWith('@'))
          value = Fs.readFileSync(value.substr(1), "utf8");
        parms.push({attr, value});
        break;
      default:
        throw Error(`unhandled curl argument at: ${postTest.curl.slice(i).join(' ')}`)
      }
    }
    const postBody = parms.map(
      pair =>
        ['attr', 'value'].map(s => encodeURIComponent(pair[s])).join("=")
    ).join("&");

    const serverOutput = new Promise((resolve, reject) => {
      let stdout = "", stderr = ""

      server.stdout.on("data", function (data) { stdout += data; });
      server.stderr.on("data", function (data) { stderr += data; });
      server.on("close", function (exitCode) {
        resolve({stdout:stdout, stderr:stderr, exitCode:exitCode, respBody, status: resp.status})
      });
      server.on("error", function(err) { reject(err); });
    });
    const resp = await Fetch(ServerEndpoint, {
      method: "POST",
      headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
      body: postBody
    });
    const respBody = await resp.text();

    // if (resp.status !== postTest.status)
    //   throw Error(`POST ${ServerEndpoint} ${postBody}\n${respBody}`);
    return await serverOutput;
  };

  /* test results
   */
  Object.keys(RestTests).forEach(function (serverName) {
    let serverTest = RestTests[serverName];

    describe(`The ${serverName} server`, function () {
      "use strict";

      const setSlow = process.env["CLI_TIMEOUT"]; // CLI_TIMEOUT=4000 will run tests with timout of 4s
      this.timeout(setSlow && setSlow !== "1" ? parseInt(setSlow) : 6000);
      if (TESTS)
        serverTest = serverTest.filter(function (t) {
          return TESTS.indexOf(t.name) !== -1;
        });
      serverTest.posts.forEach(function (postTest) {
        it("should execute $(" + postTest.curl.join(" ") + ")"+
           ( "resultMatch" in postTest ?
             (" and match /" + postTest.resultMatch) + "/" :
             (" and curl " +
              ("resultText" in postTest ? JSON.stringify(postTest.resultText) :
               "resultNoSpace" in postTest ? JSON.stringify(postTest.resultNoSpace) : postTest.result))
           ) +
           " in postTest '" + postTest.curl.join(' ') + "'.",
           async function () {
             // stamp(serverName+"/"+postTest.name);
             const ref = "result" in postTest
                   ? { result: await ShExNode.GET(fromHere(postTest.result)) }
                   : null
             const exec = await tryPostToServer(serverName, serverTest, postTest);

             if (postTest.status === 0) {      // Keep this test before exitCode in order to
               expect(exec.stderr).to.be.empty; // print errors from spawn.
             }

             if ("errors" in postTest) // .errors preempts .results*
               expect(JSON.parse(exec.respBody).errors).to.deep.equal(postTest.errors);
             else if ("resultMatch" in ref)
               expect(exec.stdout).to.match(ref.resultMatch);
             else if ("resultText" in ref)
               expect(exec.stdout).to.equal(ref.resultText);
             else if ("resultNoSpace" in ref)
               expect(exec.stdout.replace(/[ \n]/g, "")).to.equal(ref.resultNoSpace.text.replace(/[ \n]/g, ""));
             else if ("result" in ref)// {console.warn('got:', exec.respBody); console.warn('exp:', JSON.stringify(ShExUtil.absolutizeResults(JSON.parse(ref.result.text), ref.result.url), null, 2));}
               expect(JSON.parse(exec.respBody)).to.deep.equal(ShExUtil.absolutizeResults(JSON.parse(ref.result.text), postTest.resultBaseIsEndpoint ? ServerEndpoint : ref.result.url));
             else if (!("errorMatch" in ref))
               throw Error("unknown test criteria in " + JSON.stringify(ref));
             const serverLogRe = /^([a-f0-9:.]+): (GET|POST) ([^ ]+) ([0-9]+) ([a-z]+)\/([a-z]+) ([0-9]+)\n$/;
             expect(exec.stdout).to.match(serverLogRe);
             const m = exec.stdout.match(serverLogRe);
             const [undefined, myIp, method, path, status, tree, subtype, size] = m;
             expect(parseInt(status)).to.equal(postTest.status);
             // console.warn([myIp, method, path, status, tree, subtype, size])
             expect(exec.status).to.equal(postTest.status);
           }).timeout(2 * 60 * 1000); // 2 mins for the whole test suite
      });
    });
  });

  function fromHere (urlish) {
    if (!urlish.match(/^[a-z]+:\/\//))
      return Path.join(__dirname, urlish);
    return urlish;
  }
}
