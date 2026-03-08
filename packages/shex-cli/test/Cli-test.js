/* Test shex.js command line scripts.
 * can be used with a provided HTTP server à la:
 *   HTTPTEST="http://raw.githubusercontent-local.com/shexSpec/shex.js/main/packages/shex-cli/test/" mocha ...
 */

"use strict";
const TEST_cli = "TEST_cli" in process.env ? JSON.parse(process.env["TEST_cli"]) : false;
const TIME = "TIME" in process.env;
const TestUtils = require("@shexjs/util/tools/common-test-infrastructure.js");
const X = require('../lib/ExitCode'); // short name for brevity in tests

const HTTPTEST = "HTTPTEST" in process.env ?
      process.env.HTTPTEST :
      TestUtils.startLocalServer(
        "localhost", // some loopback address or local IP address
        "/shexSpec/shex.js/main/packages/shex-cli/test/", // use the same path as rawgit, in case it's ever helpful
        __dirname, // server root
      );

const AllTests = {
  "validate": [
    // pleas for help
    { name: "help" , args: ["--help"], resultMatch: "example", status: X.help },
    { name: "help-simple" , args: ["--help", "-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>"], resultMatch: "example", status: X.help },
    { name: "help-simple-json" , args: ["--help", "--json-manifest", "cli/manifest-simple.json"], resultMatch: "example", status: X.help },
    { name: "help-simple-jsonld" , args: ["--help", "--json-manifest", "cli/manifest-simple.jsonld"], resultMatch: "example", status: X.help },
    { name: "help-simple-as-jsonld" , args: ["--help", "--jsonld-manifest", "cli/manifest-simple.jsonld"], resultMatch: "example", status: X.help },
    { name: "help-simple-as-turtle" , args: ["--help", "--turtle-manifest", "cli/manifest-simple.ttl"], resultMatch: "example", status: X.help },
    { name: "help-results", args: ["--help", "--json-manifest", "cli/manifest-results.json"], resultMatch: "example", status: X.help },

    // bogus command line
    { name: "garbage" , args: ["--garbage"], errorMatch: "(Invalid|Unknown) option", status: X.bad_argument },
    { name: "garbage-simple" , args: ["--garbage", "-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>"], errorMatch: "(Invalid|Unknown) option", status: X.bad_argument },
    { name: "garbage-simple-json" , args: ["--garbage", "--json-manifest", "cli/manifest-simple.json"], errorMatch: "(Invalid|Unknown) option", status: X.bad_argument },
    { name: "garbage-simple-jsonld" , args: ["--garbage", "--json-manifest", "cli/manifest-simple.jsonld"], errorMatch: "(Invalid|Unknown) option", status: X.bad_argument },
    { name: "garbage-simple-as-jsonld" , args: ["--garbage", "--jsonld-manifest", "cli/manifest-simple.jsonld"], errorMatch: "(Invalid|Unknown) option", status: X.bad_argument },
    { name: "garbage-simple-as-turtle" , args: ["--garbage", "--turtle-manifest", "cli/manifest-simple.ttl"], errorMatch: "(Invalid|Unknown) option", status: X.bad_argument },
    { name: "garbage-results", args: ["--garbage", "--json-manifest", "cli/manifest-results.json"], errorMatch: "(Invalid|Unknown) option", status: X.bad_argument },

    // missing file resources
    { name: "simple-bad-shex-file" , args: ["-x", "cli/1dotOr2dot.shex999", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>"], errorMatch: "ENOENT", status: X.file_not_found},
    { name: "simple-bad-data-file" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl999", "-n", "<x>"], errorMatch: "ENOENT", status: X.file_not_found },
    { name: "simple-missing-json-file" , args: ["--json-manifest", "cli/manifest-simple.json999"], errorMatch: "ENOENT", status: X.manifest_not_found },
    { name: "results-missing-file", args: ["--json-manifest", "cli/manifest-results-missing.json"], errorMatch: "ENOENT", status: X.file_not_found },
    //  --dry-run
    { name: "simple-bad-shex-file-dry" , args: ["-x", "cli/1dotOr2dot.shex999", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>", "--dry-run"], errorMatch: "ENOENT", status: X.file_not_found },
    { name: "results-missing-file-dry", args: ["--json-manifest", "cli/manifest-results-missing.json", "--dry-run"], errorMatch: "ENOENT", status: X.file_not_found },

    // missing web resources
    { name: "simple-bad-shex-http" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex999", "-s", "<http://a.example/S1>", "-d", HTTPTEST + "cli/p1.ttl", "-n", "<x>"], errorMatch: "Not Found", status: X.resource_not_found },
    { name: "simple-bad-data-http" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", HTTPTEST + "cli/p1.ttl999", "-n", "<x>"], errorMatch: "Not Found", status: X.resource_not_found },
    { name: "simple-bad-json-http" , args: ["--json-manifest", HTTPTEST + "cli/manifest-simple.json999"], errorMatch: "Not Found", status: X.manifest_not_found },
    { name: "simple-bad-shex-mixed", args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex999", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>"], errorMatch: "Not Found", status: X.resource_not_found },
    { name: "simple-bad-data-missed", args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", HTTPTEST + "cli/p1.ttl999", "-n", "<x>"], errorMatch: "Not Found", status: X.resource_not_found },
    { name: "results-missing-http", args: ["--json-manifest", HTTPTEST + "cli/manifest-results-missing.json"], errorMatch: "Not Found", status: X.resource_not_found },
    //  --dry-run
    { name: "simple-bad-shex-http-dry" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex999", "-s", "<http://a.example/S1>", "-d", HTTPTEST + "cli/p1.ttl", "-n", "<x>", "--dry-run"], errorMatch: "Not Found", status: X.resource_not_found },
    { name: "results-missing-http-dry", args: ["--json-manifest", HTTPTEST + "cli/manifest-results-missing.json", "--dry-run"], errorMatch: "Not Found", status: X.resource_not_found },

    // local file access
    { name: "simple-local" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>"], result: "cli/1dotOr2dot_pass_p1.val", status: X.shape_test_pass },
    { name: "simple-local-map" , args: ["-x", "cli/1dotOr2dot.shex", "-d", "cli/p1.ttl", "-m", "<x>@<http://a.example/S1>"], result: "cli/1dotOr2dot_pass_p1.val", status: X.shape_test_pass },
    { name: "closed-local" , args: ["-x", "cli/1dotOr2dotCLOSED.shex", "-s", "<http://a.example/S1>", "-d", "cli/p2p3.ttl", "-n", "<x>"], result: "cli/1dotOr2dot_pass_p2p3.val", status: X.shape_test_pass },
    { name: "closed-fail" , args: ["-x", "cli/1dotOr2dotCLOSED.shex", "-s", "<http://a.example/S1>", "-d", "cli/p2p3p4.ttl", "-n", "<x>"], result: "cli/1dotOr2dotCLOSED_fail_p4.val", status: X.shape_test_fail },
    { name: "missing-node" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x999>"], result: "cli/1dotOr2dot_fail_p1_p2_p3.val", status: X.shape_test_fail },
    { name: "missing-shape" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1999>", "-d", "cli/p1.ttl", "-n", "<x>"], errorMatch: "example/S1\n", status: X.term_not_found },
    { name: "slurp" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p2p3p5.ttl", "-n", "<x>", "--slurp"], resultMatch: "PREFIX : <http://a.example/>", status: X.shape_test_pass },
    { name: "slurp-all" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p2p3p5.ttl", "-n", "<x>", "--slurp-all"], resultMatch: "\"p5-0\"", status: X.shape_test_pass },

    // START
    { name: "simple-local-start" , args: ["-x", "cli/1dotOr2dot.shex", "-d", "cli/p1.ttl", "-n", "<x>"], result: "cli/1dotOr2dot_pass_p1.val", status: X.shape_test_pass },
    { name: "simple-local-start-map" , args: ["-x", "cli/1dotOr2dot.shex", "-d", "cli/p1.ttl", "-m", "<x>@START"], result: "cli/1dotOr2dot_pass_p1.val", status: X.shape_test_pass },

    // IMPORT
    { name: "3circRef-local" , args: ["-x", "cli/3circRefS1-IS2-IS3-IS3.shex", "-s", "<http://a.example/S1>", "-d", "cli/3circRefPlus1_pass-open.ttl", "-n", "<http://a.example/n1>"], result: "cli/3circRefPlus1_pass-open.val", status: X.shape_test_pass },

    // manifest
    { name: "simple-json" , args: ["--json-manifest", "cli/manifest-simple.json"], result: "cli/1dotOr2dot_pass_p1.val", status: X.val_match_pass },
    { name: "simple-jsonld" , args: ["--json-manifest", "cli/manifest-simple.jsonld"], result: "cli/1dotOr2dot_pass_p1.val", status: X.val_match_pass },
    { name: "simple-as-jsonld" , args: ["--jsonld-manifest", "cli/manifest-simple.jsonld"], result: "cli/1dotOr2dot_pass_p1.val", status: X.val_match_pass },
    { name: "simple-as-turtle" , args: ["--turtle-manifest", "cli/manifest-simple.ttl"], result: "cli/1dotOr2dot_pass_p1.val", status: X.val_match_pass },
    { name: "json-override" , args: ["--json-manifest", "cli/manifest-simple.json", "-n", "<x>", "-s", "<http://a.example/S1>"], result: "cli/1dotOr2dot_pass_p1.val", status: X.val_match_pass },
    { name: "json-override-fail" , args: ["--json-manifest", "cli/manifest-simple.json", "-n", "<x999>", "-s", "<http://a.example/S1>"], result: "cli/1dotOr2dot_fail_p1_p2_p3.val", status: X.shape_test_fail },
    { name: "turtle-override" , args: ["--turtle-manifest", "cli/manifest-simple.ttl", "-n", "<x>", "-s", "<http://a.example/S1>"], result: "cli/1dotOr2dot_pass_p1.val", status: X.val_match_pass },
    { name: "turtle-override-fail" , args: ["--turtle-manifest", "cli/manifest-simple.ttl", "-n", "<x999>", "-s", "<http://a.example/S1>"], result: "cli/1dotOr2dot_fail_p1_p2_p3.val", status: X.shape_test_fail },
    { name: "results", args: ["--json-manifest", "cli/manifest-results.json"], resultText: "true\ntrue\ntrue\ntrue\ntrue\ntrue\ntrue\n", status: X.val_match_pass },
    { name: "test-name", args: ["--json-manifest", "cli/manifest-results.json", "--test-name", "1dotOr2dot-someOf_pass_p1-p2p3"], resultText: "true\n", status: X.val_match_pass },
    { name: "shape-map", args: ["--json-manifest", "cli/manifest-results.json", "--queryMap", '[{"node":"x", "shape":"http://a.example/S1"}]'], resultText: "true\ntrue\ntrue\ntrue\ntrue\ntrue\ntrue\n", status: X.val_match_pass },
    { name: "shape-map-fail", args: ["--json-manifest", "cli/manifest-results.json", "--queryMap", '[{"node":"y", "shape":"http://a.example/S1"}]'], resultMatch: "false", status: X.val_match_fail },
    //  --dry-run
    { name: "simple-dry" , args: ["-x", "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", "cli/p1.ttl", "-n", "<x>", "--dry-run"], resultText: "", status: X.dry_run },
    { name: "simple-as-jsonld-dry" , args: ["--jsonld-manifest", "cli/manifest-simple.jsonld", "--dry-run"], resultText: "", status: X.dry_run },
    { name: "simple-as-jsonld-dry-inv" , args: ["--jsonld-manifest", "cli/manifest-simple.jsonld", "--dry-run", "--invocation"], resultMatch: "../bin/validate", status: X.dry_run },

    // HTTP access via raw.githubusercontent.com
    { name: "simple-http" , args: ["-x", HTTPTEST + "cli/1dotOr2dot.shex", "-s", "<http://a.example/S1>", "-d", HTTPTEST + "cli/p1.ttl", "-n", "<x>"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: X.val_match_pass },
    { name: "simple-json-http" , args: ["--json-manifest", HTTPTEST + "cli/manifest-simple.json"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: X.val_match_pass },
    { name: "simple-jsonld-http" , args: ["--json-manifest", HTTPTEST + "cli/manifest-simple.jsonld"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: X.val_match_pass },
    { name: "simple-as-jsonld-http" , args: ["--jsonld-manifest", HTTPTEST + "cli/manifest-simple.jsonld"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: X.val_match_pass },
    { name: "simple-as-turtle-http" , args: ["--turtle-manifest", HTTPTEST + "cli/manifest-simple.ttl"], result: HTTPTEST + "cli/1dotOr2dot_pass_p1.val", status: X.val_match_pass },
    { name: "results-http", args: ["--json-manifest", HTTPTEST + "cli/manifest-results.json"], resultText: "true\ntrue\ntrue\ntrue\ntrue\ntrue\ntrue\n", status: X.val_match_pass }
  ],

  "shex-to-json": [
    { name: "help" , args: ["--help"], resultMatch: "example", status: X.help },
    { name: "garbage" , args: ["--garbage"], errorMatch: "(Invalid|Unknown) option", status: X.bad_argument },
    { name: "simple" , args: ["cli/1dotOr2dot.shex"], result: "cli/1dotOr2dot.json", status: X.json_pass },
    { name: "simple-http" , args: [HTTPTEST + "cli/1dotOr2dot.shex"], result: "cli/1dotOr2dot.json", status: X.json_pass },
    { name: "simple-bad-file" , args: ["cli/1dotOr2dot.shex999"], errorMatch: "ENOENT", status:  X.file_not_found },
    { name: "simple-bad-http" , args: [HTTPTEST + "cli/1dotOr2dot.shex999"], errorMatch: "Not Found", status: X.resource_not_found },
  ],

  "json-to-shex": [
    { name: "help" , args: ["--help"], resultMatch: "example", status: X.help },
    { name: "garbage" , args: ["--garbage"], errorMatch: "(Invalid|Unknown) option", status: X.bad_argument },
    { name: "simple" , args: ["cli/1dotOr2dot.json", "--prefixes", '{ "": "http://a.example/" }'], resultNoSpace: "cli/1dotOr2dot.shex", status: X.shexc_pass },
    { name: "simple-http" , args: [HTTPTEST + "cli/1dotOr2dot.json", "--prefixes", '{ "": "http://a.example/" }'], resultNoSpace: "cli/1dotOr2dot.shex", status: X.shexc_pass },
    { name: "simple-bad-file" , args: ["cli/1dotOr2dot.json999"], errorMatch: "ENOENT", status: X.file_not_found },
    { name: "simple-bad-http" , args: [HTTPTEST + "cli/1dotOr2dot.json999"], errorMatch: "Not Found", status:  X.resource_not_found },
  ],
};

if (process.env.SPARQL_SERVER) { //  set up server, e.g. using SWObjects: sparql -d test/sparqlDb/wd-3_of_4.ttl --serve http://localhost:8088/sparql --server-no-description
  AllTests["shex-validate"].push( // TEST_cli=true SPARQL_SERVER=http://localhost:8088/sparql npx mocha cli-test.js
    { name: "sparqlDb-bnodes-wd-3_of_4", args: ["-x", "sparqlDb/citing_work.shex", "-d", "sparqlDb/wikidata-prefixes.ttl", "--track", "--slurp", "--endpoint", process.env.SPARQL_SERVER, "-m", "SPARQL 'SELECT ?s { ?s wdt:P999 ?o }'@:middle" ], resultMatch: "P735 \"abc\"", status: 0 }
  )
}


if (!TEST_cli) {
  console.warn("Skipping cli-tests; to activate these tests, set environment variable TEST_cli=true");
} else {
  // console.log(`Testing CLI programs against HTTP server ${HTTPTEST}`);
  TestUtils.runCliTests(AllTests, __dirname, TIME);
}

