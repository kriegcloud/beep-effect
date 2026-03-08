#!/usr/bin/env node

var AssertedBy = "http://www.w3.org/People/Eric/ericp-foaf#me";
var Subject = "https://www.npmjs.com/package/shex";
var Branch = "main";
var When = new Date().toISOString();

header();
var Mocha = require("mocha"),
    fs = require("fs"),
    path = require("path");
process.env["EARL"] = "true"; // inelegant way to signal EARL mode to tests

[
  { script: "Validation-test",
    patterns: [
      { pattern: "should use (?:[^ ]+) to validate data '(?:.*?).ttl' against schema '(?:.*?).shex' and get '(?:.*?).\(?:val|err)' in test '#(.*?)'.",
        type: "validation" },
      { pattern: "should use (?:[^ ]+) to validate data '(?:.*?).ttl' against schema '(?:.*?).shex' and get 'null' in test '#(.*?)'.",
        type: "validation" }
    ]
  },
  { script: "Parser-Writer-test",
    patterns: [
      { pattern: "^should correctly parse schema '.*?/schemas/(.*?).shex' as '.*?/schemas/(?:.*?).json'.$",
        type: "schemas" },
      { pattern: "^should not parse schema '.*?/negativeSyntax/(.*?).shex'$",
        type: "negativeSyntax" },
      { pattern: "^should not parse schema '.*?/negativeStructure/(.*?).shex'$",
        type: "negativeStructure" }
    ]
  },
].forEach(s => {
  new Mocha().addFile("./test/" + s.script + ".js").
    reporter(function (runner, options) {
      // options is p2 in options.reporterOptions
      var failures = [];
      var passes = [];
      function parse (test) {
        var title = test.title;
        var m;
        var res = s.patterns.reduce((matched, p) => {
          if (matched) return matched;
          var m = title.match(RegExp(p.pattern));
          return m ? {type: p.type, name: m[1], state: test.state } : null;
        }, null);
        if (res)
          report(res);
        else
          console.error(test);
      }
      runner.on('pass', function (test) { parse(test); passes.push(test); });
      runner.on('fail', function (test) { parse(test); failures.push(test); });
    }).run(function (failures) {
      process.on("exit", function () {
        process.exit(failures);  // exit with non-zero status if there were failures
      });
    });
}, []);

function report (res) {
  console.log(`[ a earl:Assertion;
  earl:assertedBy <${AssertedBy}>;
  earl:subject <${Subject}>;
  earl:test <https://raw.githubusercontent.com/shexSpec/shexTest/${Branch}/${res.type}/manifest#${res.name}>;
  earl:result [
    a earl:TestResult;
    earl:outcome earl:${res.state};
    dc:date "${When}"^^xsd:dateTime
  ];
  earl:mode earl:automatic
] .\n\n`);
}

function header () {
  console.log(`@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dc:   <http://purl.org/dc/terms/> .
@prefix earl: <http://www.w3.org/ns/earl#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix doap: <http://usefulinc.com/ns/doap#> .
@prefix ex:   <http://example.org/> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .

<https://www.npmjs.com/package/shex> a doap:Project, earl:TestSubject, earl:Software ;
  doap:name          "ShEx.js" ;
  doap:homepage      <https://github.com/shexSpec/shex.js> ;
  doap:license       <http://creativecommons.org/licenses/publicdomain/> ;
  doap:shortdesc     "ShEx is a Shape Expression engine for javascript."@en ;
  doap:description   "ShEx.js is an Shape Expression engine for N3.js."@en ;
  doap:created       "${When.substr(0, 10)}"^^xsd:date ;
  doap:programming-language "JavaScript" ;
  doap:implements    <https://shexspec.github.io/spec/> ;
  doap:category      <http://dbpedia.org/resource/Resource_Description_Framework> ;
  doap:download-page <https://www.npmjs.com/package/shex> ;
  doap:mailing-list  <http://lists.w3.org/Archives/Public/public-shex-dev/> ;
  doap:bug-database  <http://github.com/shexSpec/shex.js/issues> ;
  doap:developer     <${AssertedBy}> ;
  doap:maintainer    <${AssertedBy}> ;
  doap:documenter    <${AssertedBy}> ;
  foaf:maker         <${AssertedBy}> ;
  dc:title           "ShEx.js" ;
  dc:description     "ShEx.js is an Shape Expression engine for N3.js."@en ;
  dc:date            "${When.substr(0, 10)}"^^xsd:date ;
  dc:creator         <${AssertedBy}> ;
  dc:isPartOf        <https://github.com/RubenVerborgh/N3.js> .

<> foaf:primaryTopic <https://www.npmjs.com/package/shex> ;
  dc:issued "${When}"^^xsd:dateTime ;
  foaf:maker <${AssertedBy}> .

<${AssertedBy}> a foaf:Person, earl:Assertor;
  foaf:name "Eric Prud'hommeaux";
  foaf:title "Implementor";
  foaf:homepage <http://www.w3.org/People/Eric/> .

`
             );
}

// old junk from before the ${EARL} ENV var

      // else if ((m = title.match(RegExp("^should duplicate '.*?/schemas/(.*?).json' and produce the same structure.$"))))
      //   ; // console.log(m[1]);
      // else if ((m = title.match(RegExp("^should write '.*?/schemas/(.*?).json' and parse to the same structure.$"))))
      //   ; // console.log(m[1]);
      // else if ((m = title.match(RegExp("^should write '.*?/schemas/(.*?).json' with as few \\(\\)s as possible.$"))))
      //   ; // console.log(m[1]);
