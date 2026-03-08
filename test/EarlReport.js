/**
 * EARL Report.
 *
 * Copyright (c) 2016-2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

/* eslint-disable quote-props */
const _benchmarkContext = {
  'jldb': 'http://json-ld.org/benchmarks/vocab#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
  'xsd': 'http://www.w3.org/2001/XMLSchema#',

  // environment description
  'jldb:Environment': {'@type': '@id'},

  // per environment
  // label
  // ex: 'Setup 1' (for reports)
  'jldb:label': {'@type': 'xsd:string'},
  // architecture type
  // ex: x86
  'jldb:arch': {'@type': 'xsd:string'},
  // cpu model description (may show multiple cpus)
  // ex: 'Intel(R) Core(TM) i7-4790K CPU @ 4.00GHz'
  'jldb:cpu': {'@type': 'xsd:string'},
  // count of cpus, may not be uniform, just informative
  'jldb:cpuCount': {'@type': 'xsd:integer'},
  // platform name
  // ex: linux
  'jldb:platform': {'@type': 'xsd:string'},
  // runtime name
  // ex: Node.js, Chromium, Ruby
  'jldb:runtime': {'@type': 'xsd:string'},
  // runtime version
  // ex: v14.19.0
  'jldb:runtimeVersion': {'@type': 'xsd:string'},
  // arbitrary comment
  'jldb:comment': 'rdfs:comment',

  // benchmark result
  'jldb:BenchmarkResult': {'@type': '@id'},

  // use in earl:Assertion, type jldb:BenchmarkResult
  'jldb:result': {'@type': '@id'},

  // per BenchmarkResult
  'jldb:environment': {'@type': '@id'},
  'jldb:hz': {'@type': 'xsd:float'},
  'jldb:rme': {'@type': 'xsd:float'}
};
/* eslint-enable quote-props */

/**
 * EARL Reporter.
 */
class EarlReport {
  /**
   * Create an EARL Reporter.
   *
   * @param {object} options - Reporter options.
   *   {object} env - Environment description.
   */
  constructor(options) {
    let today = new Date();
    today = today.getFullYear() + '-' +
      (today.getMonth() < 9 ?
        '0' + (today.getMonth() + 1) : today.getMonth() + 1) + '-' +
      (today.getDate() < 10 ? '0' + today.getDate() : today.getDate());
    // one date for tests with no subsecond resolution
    this.now = new Date();
    this.now.setMilliseconds(0);
    this.env = options.env;
    this.format = options.format;
    this.version = options.version;
    // test environment
    this._environment = null;
    /* eslint-disable quote-props */
    this._report = {
      '@context': {
        'doap': 'http://usefulinc.com/ns/doap#',
        'foaf': 'http://xmlns.com/foaf/0.1/',
        'dc': 'http://purl.org/dc/terms/',
        'earl': 'http://www.w3.org/ns/earl#',
        'xsd': 'http://www.w3.org/2001/XMLSchema#',
        'doap:homepage': {'@type': '@id'},
        'doap:license': {'@type': '@id'},
        'dc:creator': {'@type': '@id'},
        'foaf:homepage': {'@type': '@id'},
        'subjectOf': {'@reverse': 'earl:subject'},
        'earl:assertedBy': {'@type': '@id'},
        'earl:mode': {'@type': '@id'},
        'earl:test': {'@type': '@id'},
        'earl:outcome': {'@type': '@id'},
        'dc:date': {'@type': 'xsd:date'},
        'doap:created': {'@type': 'xsd:date'}
      },
      '@id': 'https://github.com/digitalbazaar/rdf-canonize',
      '@type': [
        'doap:Project',
        'earl:TestSubject',
        'earl:Software'
      ],
      'doap:name': 'rdf-canonize',
      'dc:title': 'rdf-canonize',
      'doap:homepage': 'https://github.com/digitalbazaar/rdf-canonize',
      'doap:license':
        'https://github.com/digitalbazaar/rdf-canonize/blob/master/LICENSE',
      'doap:description':
        'A RDF Dataset Canonicalization processor for JavaScript',
      'doap:programming-language': 'JavaScript',
      'dc:creator': 'https://digitalbazaar.com/',
      'doap:developer': {
        '@id': 'https://digitalbazaar.com/',
        '@type': [
          'foaf:Organization',
          'earl:Assertor'
        ],
        'foaf:name': 'Digital Bazaar, Inc.',
        'foaf:homepage': 'https://digitalbazaar.com/'
      },
      'doap:release': {
        'doap:revision': `${this.version}`,
        'doap:created': today
      },
      'subjectOf': []
    }; /* eslint-enable quote-props */
    if(this.env && this.env.version) {
      this._report['doap:release']['doap:revision'] = this.env.version;
    }
  }

  addAssertion(test, pass, options) {
    options = options || {};
    const assertion = {
      '@type': 'earl:Assertion',
      'earl:assertedBy': this._report['doap:developer']['@id'],
      'earl:mode': 'earl:automatic',
      'earl:test': test['@id'],
      'earl:result': {
        '@type': 'earl:TestResult',
        'dc:date': this.now.toISOString(),
        'earl:outcome': pass ? 'earl:passed' : 'earl:failed'
      }
    };
    if(options.benchmarkResult) {
      const result = {
        ...options.benchmarkResult
      };
      if(this._environment) {
        result['jldb:environment'] = this._environment['@id'];
      }
      assertion['jldb:result'] = result;
    }
    this._report.subjectOf.push(assertion);
    return this;
  }

  report() {
    if(this.format === 'json') {
      return JSON.stringify(this._report, null, 2);
    } else if(this.format === 'ttl') {
      return this.asTurtle(this._report);
    } else {
      throw new Error(`Unknown report format: "${this.format}".`);
    }
  }

  asTurtle() {
    const r = this._report;
    let report = '';
    // add prefixes
    report += `\
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dc:   <http://purl.org/dc/terms/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix doap: <http://usefulinc.com/ns/doap#> .
@prefix earl: <http://www.w3.org/ns/earl#> .
@prefix ex:   <http://example.org/> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .

`;

    // add test subject
    report += `\
<> foaf:primaryTopic <${r['@id']}> ;
  dc:issued "${r['doap:release']['doap:created']}"^^xsd:dateTime ;
  foaf:maker <${r['doap:developer']['@id']}> .

<${r['@id']}> a doap:Project, earl:TestSubject, earl:Software ;
  doap:name "${r['doap:name']}" ;
  doap:release [
    doap:name "${r['doap:name']}@${r['doap:release']['doap:revision']}";
    doap:revision "${r['doap:release']['doap:revision']}" ;
    doap:created "${r['doap:release']['doap:created']}" ;
  ] ;
  doap:developer <${r['doap:developer']['@id']}> ;
  doap:homepage <${r['doap:homepage']}> ;
  doap:description "${r['doap:description']}"@en ;
  doap:programming-language "${r['doap:programming-language']}" .

`;

    // add software developer
    report += `\
<${r['doap:developer']['@id']}> a foaf:Organization, earl:Assertor;
  foaf:name "${r['doap:developer']['foaf:name']}";
  foaf:homepage <${r['doap:developer']['foaf:homepage']}> .

`;

    // add assertions
    for(const a of r.subjectOf) {
      report += `\
[ a earl:Assertion;
  earl:assertedBy <${r['doap:developer']['@id']}>;
  earl:subject <${r['@id']}>;
  earl:test <https://w3c.github.io/rdf-canon/tests/${a['earl:test']}>;
  earl:result [
    a earl:TestResult;
    earl:outcome ${a['earl:result']['earl:outcome']};
    dc:date "${a['earl:result']['dc:date']}"^^xsd:dateTime];
  earl:mode ${a['earl:mode']} ] .

`;
    }

    return report;
  }

  // setup @context and environment to handle benchmark data
  setupForBenchmarks(options) {
    // add context if needed
    if(!Array.isArray(this._report['@context'])) {
      this._report['@context'] = [this._report['@context']];
    }
    if(!this._report['@context'].some(c => c === _benchmarkContext)) {
      this._report['@context'].push(_benchmarkContext);
    }
    if(options.testEnv) {
      // add report environment
      const fields = [
        ['label', 'jldb:label'],
        ['arch', 'jldb:arch'],
        ['cpu', 'jldb:cpu'],
        ['cpuCount', 'jldb:cpuCount'],
        ['platform', 'jldb:platform'],
        ['runtime', 'jldb:runtime'],
        ['runtimeVersion', 'jldb:runtimeVersion'],
        ['comment', 'jldb:comment']
      ];
      const _env = {
        '@id': '_:environment:0'
      };
      for(const [field, property] of fields) {
        if(options.testEnv[field]) {
          _env[property] = options.testEnv[field];
        }
      }
      this._environment = _env;
      this._report['@included'] = this._report['@included'] || [];
      this._report['@included'].push(_env);
    }
  }
}

module.exports = EarlReport;
