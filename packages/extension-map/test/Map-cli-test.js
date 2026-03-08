// Test extension-map command line scripts.

"use strict";
const TEST_cli = "TEST_cli" in process.env ? JSON.parse(process.env["TEST_cli"]) : false;
const TIME = "TIME" in process.env;

const TestUtils = require("@shexjs/util/tools/common-test-infrastructure.js");

const AllTests = {
  "materialize": [
    { name: "help", args: ["--help"], errorMatch: "Examples", status: 1 },
    { name: "garbage", args: ["--garbage"], errorMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "no-target-file-specified", args: ["--jsonvars vars.json"], errorMatch: "No ShEx target schema file specified.", status: 1 },
    { name: "no-target-file", args: ["--target", "cli/1dotOr2dot.json999"], errorMatch: "ENOENT", status: 1 },
    { name: "no-jsonvars-file", args: ["--target", "Map/vpr-FHIR/FHIRConditionCompact.shex", "--jsonvars", "cli/1dotOr2dot.json999"], errorMatch: "ENOENT", status: 1 },
    { name: "target-file", args: ["--target", "Map/vpr-FHIR/FHIRConditionCompact.shex", "--jsonvars", "Map/vpr-FHIR/vars.json" ], stdin: "Map/vpr-FHIR/vprPatient-vprSchema.val", resultMatch: "b15", status: 0 },
    { name: "target-file", args: ["--target", "Map/vpr-FHIR/FHIRConditionCompact.shex", "--jsonvars", "Map/vpr-FHIR/vars.json", "--root", "http://hl7.org/fhir/shape/Problem"], stdin: "Map/vpr-FHIR/vprPatient-vprSchema.val", resultMatch: "Problem", status: 0 }
  ]
};

if (!TEST_cli) {
  console.warn("Skipping cli-tests; to activate these tests, set environment variable TEST_cli=true");
} else {
  TestUtils.runCliTests(AllTests, __dirname, TIME);
}
