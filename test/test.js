/**
 * Test and benchmark runner for rdf-canonize.
 *
 * Use environment vars to control:
 *
 * General:
 *   Boolean env options enabled with case insensitve values:
 *     'true', 't', 'yes', 'y', 'on', '1', similar for false
 * Set dirs, manifests, or js to run:
 *   TESTS="r1 r2 ..."
 * Output an EARL report:
 *   EARL=filename (default: none)
 *   JSON or Turtle type determined by extension.
 * Test environment details for EARL report:
 *   This is useful for benchmark comparison.
 *   By default no details are added for privacy reasons.
 *   Automatic details can be added for all fields with '1', 'true', or 'auto':
 *   TEST_ENV=1
 *   To include only certain fields, set them, or use 'auto':
 *   TEST_ENV=cpu='Intel i7-4790K @ 4.00GHz',runtime='Node.js',...
 *   TEST_ENV=cpu=auto # only cpu
 *   TEST_ENV=cpu,runtime # only cpu and runtime
 *   TEST_ENV=auto,comment='special test' # all auto with override
 *   Available fields:
 *   - label - ex: 'Setup 1' (short label for reports)
 *   - arch - ex: 'x64'
 *   - cpu - ex: 'Intel(R) Core(TM) i7-4790K CPU @ 4.00GHz'
 *   - cpuCount - ex: 8
 *   - platform - ex: 'linux'
 *   - runtime - ex: 'Node.js'
 *   - runtimeVersion - ex: 'v14.19.0'
 *   - comment: any text
 *   - version: rdf-canonize version
 * Bail with tests fail:
 *   BAIL=<boolean> (default: false)
 * Verbose skip reasons:
 *   VERBOSE_SKIP=<boolean> (default: false)
 * Enable async tests:
 *   ASYNC=<boolean> (default: true)
 * Enable sync tests:
 *   SYNC=<boolean> (default: true)
 * Enable node webcrypto tests:
 *   WEBCRYPTO=<boolean> (default: true)
 * Benchmark mode:
 *   Basic:
 *   BENCHMARK=1
 *   With options:
 *   BENCHMARK=key1=value1,key2=value2,...
 * Benchmark options:
 *   jobs=N1[+N2[...]] (default: 1)
 *     Run each test with jobs size of N1, N2, ...
 *     Recommend 1+10 to get simple and parallel data.
 *     Note the N>1 tests use custom reporter to show time per job.
 *   fast1=<boolean> (default: false)
 *     Run single job faster by omitting Promise.all wrapper.
 *
 * @author Dave Longley
 * @author David I. Lehn
 *
 * Copyright (c) 2016-2023 Digital Bazaar, Inc. All rights reserved.
 */
/* eslint-disable indent */
const EarlReport = require('./EarlReport.js');
const NQuads = require('../lib/NQuads');
const WebCryptoMessageDigest = require('../lib/MessageDigest-webcrypto');
const {klona} = require('klona');
const join = require('join-path-js');
const rdfCanonize = require('..');

// helper functions, inspired by 'boolean' package
function isTrue(value) {
  return value && [
    'true', 't', 'yes', 'y', 'on', '1'
  ].includes(value.trim().toLowerCase());
}

function isFalse(value) {
  return !value || [
    'false', 'f', 'no', 'n', 'off', '0'
  ].includes(value.trim().toLowerCase());
}

module.exports = async function(options) {

'use strict';

const assert = options.assert;
const benchmark = options.benchmark;

const bailOnError = isTrue(options.env.BAIL || 'false');
const verboseSkip = isTrue(options.env.VERBOSE_SKIP || 'false');

const doAsync = isTrue(options.env.ASYNC || 'true');
const doSync = isTrue(options.env.SYNC || 'true') &&
  !isTrue(options.env.EARL_OFFICIAL || 'false');
const doWebCrypto = isTrue(options.env.WEBCRYPTO || 'true') &&
  !isTrue(options.env.EARL_OFFICIAL || 'false') &&
  options.nodejs;

const benchmarkOptions = {
  enabled: false,
  jobs: [1],
  fast1: false
};

if(options.env.BENCHMARK) {
  if(!isFalse(options.env.BENCHMARK)) {
    benchmarkOptions.enabled = true;
    if(!isTrue(options.env.BENCHMARK)) {
      options.env.BENCHMARK.split(',').forEach(pair => {
        const kv = pair.split('=');
        switch(kv[0]) {
          case 'jobs':
            benchmarkOptions.jobs = kv[1].split('+').map(n => parseInt(n, 10));
            break;
          case 'fast1':
            benchmarkOptions.fast1 = isTrue(kv[1]);
            break;
          default:
            throw new Error(`Unknown benchmark option: "${pair}"`);
        }
      });
    }
  }
}

// Only support one job size for EARL output to simplify reporting and avoid
// multi-variable issues. Can compare multiple runs with different job sizes.
if(options.earl.filename && benchmarkOptions.jobs.length > 1) {
  throw new Error('Only one job size allowed when outputting EARL.');
}

const manifest = options.manifest || {
  '@context': {
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    mf: 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#',
    id: '@id',
    type: '@type',
    comment: 'rdfs:comment',
    include: {'@id': 'mf:include', '@type': '@id', '@container': '@list'},
    label: 'rdfs:label'
    // FIXME: add missing terms and/or move to tests context file
  },
  id: '',
  type: 'mf:Manifest',
  description: 'Top level rdf-canonize manifest',
  name: 'rdf-canonize',
  // allow for async generated entries
  // used for karma tests to allow async server exist check
  sequence: (await Promise.all(options.entries || [])).flat().filter(e => e),
  filename: '/'
};

const TEST_TYPES = {
  'rdfc:RDFC10EvalTest': {
    params: [
      parseNQuads(readTestNQuads('action')),
      createTestOptions({
        algorithm: 'RDFC-1.0',
        format: 'application/n-quads'
      })
    ],
    compare: compareExpectedNQuads
  },
  'rdfc:RDFC10NegativeEvalTest': {
    params: [
      parseNQuads(readTestNQuads('action')),
      createTestOptions({
        algorithm: 'RDFC-1.0',
        format: 'application/n-quads'
      })
    ]
  },
  'rdfc:RDFC10MapTest': {
    params: [
      parseNQuads(readTestNQuads('action')),
      createTestOptions({
        algorithm: 'RDFC-1.0',
        format: 'application/n-quads'
      })
    ],
    preRunAdjustParams: ({params, extra}) => {
      // add canonicalIdMap
      const m = new Map();
      extra.canonicalIdMap = m;
      params[1].canonicalIdMap = m;
      return params;
    },
    postRunAdjustParams: ({params}) => {
      // restore output param to empty map
      const m = new Map();
      params[1].canonicalIdMap = m;
    },
    compare: compareExpectedCanonicalIdMap
  }
};

const SKIP_TESTS = [];

// build test env from defaults
const testEnvFields = [
  'label', 'arch', 'cpu', 'cpuCount', 'platform', 'runtime', 'runtimeVersion',
  'comment', 'version'
];
let testEnv = null;
if(options.env.TEST_ENV) {
  let _test_env = options.env.TEST_ENV;
  if(!isFalse(_test_env)) {
    testEnv = {};
    if(isTrue(_test_env)) {
      _test_env = 'auto';
    }
    _test_env.split(',').forEach(pair => {
      if(pair === 'auto') {
        testEnvFields.forEach(f => testEnv[f] = 'auto');
      } else {
        const kv = pair.split('=');
        if(kv.length === 1) {
          testEnv[kv[0]] = 'auto';
        } else {
          testEnv[kv[0]] = kv.slice(1).join('=');
        }
      }
    });
    testEnvFields.forEach(f => {
      if(testEnv[f] === 'auto') {
        testEnv[f] = options.testEnvDefaults[f];
      }
    });
  }
}

// create earl report
if(options.earl && options.earl.filename) {
  options.earl.report = new EarlReport({
    env: testEnv,
    format: options.earl.filename.endsWith('.ttl') ? 'ttl' : 'json',
    // FIXME: enable easier override
    version: options.testEnvDefaults.version
  });
  if(benchmarkOptions.enabled) {
    options.earl.report.setupForBenchmarks({testEnv});
  }
}

// async generated tests
// _tests => [{suite}, ...]
// suite => {
//   title: ...,
//   tests: [test, ...],
//   suites: [suite, ...]
// }
const _tests = [];

await addManifest(manifest, _tests);
const result = _testsToMocha(_tests);
if(options.earl.report) {
  describe('Writing EARL report to: ' + options.earl.filename, function() {
    // print out EARL even if .only was used
    const _it = result.hadOnly ? it.only : it;
    _it('should print the earl report', function() {
      return options.writeFile(
        options.earl.filename, options.earl.report.report());
    });
  });
}

return;

// build mocha tests from local test structure
function _testsToMocha(tests) {
  let hadOnly = false;
  tests.forEach(suite => {
    if(suite.skip) {
      describe.skip(suite.title);
      return;
    }
    describe(suite.title, () => {
      suite.tests.forEach(test => {
        if(test.only) {
          hadOnly = true;
          it.only(test.title, test.f);
          return;
        }
        it(test.title, test.f);
      });
      const {hadOnly: _hadOnly} = _testsToMocha(suite.suites);
      hadOnly = hadOnly || _hadOnly;
    });
    suite.imports.forEach(f => {
      options.import(f);
    });
  });
  return {
    hadOnly
  };
}

/**
 * Adds the tests for all entries in the given manifest.
 *
 * @param {object} manifest - The manifest.
 * @param {object} parent - The parent test structure.
 * @returns {Promise} - A promise with no value.
 */
async function addManifest(manifest, parent) {
  // create test structure
  const suite = {
    title: manifest.name || manifest.label,
    tests: [],
    suites: [],
    imports: []
  };
  parent.push(suite);

  // get entries and sequence (alias for entries)
  const entries = [].concat(
    getJsonLdValues(manifest, 'entries'),
    getJsonLdValues(manifest, 'sequence')
  );

  const includes = getJsonLdValues(manifest, 'include');
  // add includes to sequence as jsonld files
  for(let i = 0; i < includes.length; ++i) {
    entries.push(includes[i] + '.jsonld');
  }

  // resolve all entry promises and process
  for await (const entry of await Promise.all(entries)) {
    if(typeof entry === 'string' && entry.endsWith('js')) {
      // process later as a plain JavaScript file
      suite.imports.push(entry);
      continue;
    } else if(typeof entry === 'function') {
      // process as a function that returns a promise
      const childSuite = await entry(options);
      if(suite) {
        suite.suites.push(childSuite);
      }
      continue;
    }
    const manifestEntry = await readManifestEntry(manifest, entry);
    if(isJsonLdType(manifestEntry, '__SKIP__')) {
      // special local skip logic
      suite.tests.push(manifestEntry);
    } else if(isJsonLdType(manifestEntry, 'mf:Manifest')) {
      // entry is another manifest
      await addManifest(manifestEntry, suite.suites);
    } else {
      // assume entry is a test
      await addTest(manifest, manifestEntry, suite.tests);
    }
  }
}

/**
 * Common adjust params helper.
 *
 * @param {object} params - The param to adjust.
 * @param {object} test - The test.
 */
function _commonAdjustParams(params, test) {
  if(test.hashAlgorithm) {
    params.messageDigestAlgorithm = test.hashAlgorithm;
  }
  if(test.computationalComplexity === 'low') {
    // simple test cases
    params.maxWorkFactor = 0;
  }
  if(test.computationalComplexity === 'medium') {
    // tests between O(n) and O(n^2)
    params.maxWorkFactor = 2;
  }
  if(test.computationalComplexity === 'high') {
    // poison tests between O(n^2) and O(n^3)
    params.maxWorkFactor = 3;
  }
}

/**
 * Adds a test.
 *
 * @param {object} manifest - The manifest.
 * @param {object} test - The test.
 * @param {Array} tests - The list of tests to add to.
 * @returns {Promise} - A promise with no value.
 */
async function addTest(manifest, test, tests) {
  // expand @id and input base
  const test_id = test['@id'] || test.id;
  test['@id'] =
    (manifest.baseIri || '') +
    basename(manifest.filename).replace('.jsonld', '') +
    test_id;
  test.base = manifest.baseIri + test.input;
  test.manifest = manifest;
  const description = test_id + ' ' + (test.purpose || test.name);

  // build test options for omit checks
  const testType = getJsonLdTestType(test);
  const testInfo = TEST_TYPES[testType];
  if(!testInfo) {
    const types = getJsonLdType(test);
    throw new Error(`Unknown test type: "${JSON.stringify(types)}"`);
  }
  // number of parallel jobs for benchmarks
  const jobTests = benchmarkOptions.enabled ? benchmarkOptions.jobs : [1];
  const fast1 = benchmarkOptions.enabled ? benchmarkOptions.fast1 : true;

  // async js
  if(doAsync) {
    jobTests.forEach(jobs => {
      const _aj_test = {
        title: description + ` (asynchronous, js, jobs=${jobs})`,
        f: makeFn({
          test,
          adjustParams: params => {
            _commonAdjustParams(params[1], test);
            return params;
          },
          run: ({/*test, testInfo,*/ params}) => {
            // skip Promise.all
            if(jobs === 1 && fast1) {
              return rdfCanonize.canonize(...params);
            }
            const all = [];
            for(let j = 0; j < jobs; j++) {
              all.push(rdfCanonize.canonize(...params));
            }
            return Promise.all(all);
          },
          jobs,
          isBenchmark: benchmarkOptions.enabled
        })
      };
      // 'only' based on test manifest
      // 'skip' handled via skip()
      if('only' in test) {
        _aj_test.only = test.only;
      }
      tests.push(_aj_test);
    });
  }

  // async js using webcrypto
  if(doWebCrypto) {
    jobTests.forEach(jobs => {
      const _aj_test = {
        title: description + ` (asynchronous, js, webcrypto, jobs=${jobs})`,
        f: makeFn({
          test,
          adjustParams: params => {
            _commonAdjustParams(params[1], test);
            params[1].createMessageDigest =
              () => new WebCryptoMessageDigest(test.hashAlgorithm || 'sha256');
            return params;
          },
          run: ({/*test, testInfo,*/ params}) => {
            // skip Promise.all
            if(jobs === 1 && fast1) {
              return rdfCanonize.canonize(...params);
            }
            const all = [];
            for(let j = 0; j < jobs; j++) {
              all.push(rdfCanonize.canonize(...params));
            }
            return Promise.all(all);
          },
          jobs,
          isBenchmark: benchmarkOptions.enabled
        })
      };
      // 'only' based on test manifest
      // 'skip' handled via skip()
      if('only' in test) {
        _aj_test.only = test.only;
      }
      tests.push(_aj_test);
    });
  }

  // sync js
  if(doSync) {
    jobTests.forEach(jobs => {
      const _sj_test = {
        title: description + ` (synchronous, js, jobs=${jobs})`,
        f: makeFn({
          test,
          adjustParams: params => {
            _commonAdjustParams(params[1], test);
            return params;
          },
          run: ({/*test, testInfo,*/ params}) => {
            // skip Promise.all
            if(jobs === 1 && fast1) {
              return rdfCanonize._canonizeSync(...params);
            }
            const all = [];
            for(let j = 0; j < jobs; j++) {
              all.push(rdfCanonize._canonizeSync(...params));
            }
            return Promise.all(all);
          },
          jobs,
          isBenchmark: benchmarkOptions.enabled,
          unsupportedInBrowser: !options.nodejs
        })
      };
      // 'only' based on test manifest
      // 'skip' handled via skip()
      if('only' in test) {
        _sj_test.only = test.only;
      }
      tests.push(_sj_test);
    });
  }

}

function makeFn({
  test,
  adjustParams = p => p,
  run,
  jobs,
  isBenchmark = false,
  unsupportedInBrowser = false
}) {
  return async function() {
    const self = this;
    self.timeout(10000);
    const testInfo = TEST_TYPES[getJsonLdTestType(test)];

    // skip if unsupported in browser
    if(unsupportedInBrowser) {
      if(verboseSkip) {
        console.log('Skipping test due no browser support:',
          {id: test['@id'], name: test.name});
      }
      self.skip();
    }

    // skip based on test manifest
    if('skip' in test && test.skip) {
      if(verboseSkip) {
        console.log('Skipping test due to manifest:',
          {id: test['@id'], name: test.name});
      }
      self.skip();
    }

    // skip based on unknown test type
    const testTypes = Object.keys(TEST_TYPES);
    if(!isJsonLdType(test, testTypes)) {
      if(verboseSkip) {
        const type = [].concat(
          getJsonLdValues(test, '@type'),
          getJsonLdValues(test, 'type')
        );
        console.log('Skipping test due to unknown type:',
          {id: test['@id'], name: test.name, type});
      }
      self.skip();
    }

    // skip based on test type
    if(isJsonLdType(test, SKIP_TESTS)) {
      if(verboseSkip) {
        const type = [].concat(
          getJsonLdValues(test, '@type'),
          getJsonLdValues(test, 'type')
        );
        console.log('Skipping test due to test type:',
          {id: test['@id'], name: test.name, type});
      }
      self.skip();
    }

    // skip based on type info
    if(testInfo.skip && testInfo.skip.type) {
      if(verboseSkip) {
        console.log('Skipping test due to type info:',
          {id: test['@id'], name: test.name});
      }
      self.skip();
    }

    // skip based on id regex
    if(testInfo.skip && testInfo.skip.idRegex) {
      testInfo.skip.idRegex.forEach(function(re) {
        if(re.test(test['@id'])) {
          if(verboseSkip) {
            console.log('Skipping test due to id:',
              {id: test['@id']});
          }
          self.skip();
        }
      });
    }

    // skip based on description regex
    // fuzzy use of test.title which is created from description
    if(testInfo.skip && testInfo.skip.descriptionRegex) {
      testInfo.skip.descriptionRegex.forEach(function(re) {
        if(re.test(test.description)) {
          if(verboseSkip) {
            console.log('Skipping test due to description:', {
              id: test['@id'],
              name: test.name,
              description: test.description
            });
          }
          self.skip();
        }
      });
    }

    let params = testInfo.params.map(param => param(test));
    const extra = {};
    // type specific pre run adjustments
    if(testInfo.preRunAdjustParams) {
      params = testInfo.preRunAdjustParams({params, extra});
    }
    // general adjustments
    params = adjustParams(params);
    // resolve test data
    const values = await Promise.all(params);
    // copy used to check inputs do not change
    const valuesOrig = klona(values);
    let err;
    let result;
    // run and capture errors and results
    try {
      result = await run({test, testInfo, params: values});
      // type specific post run adjustments
      if(testInfo.postRunAdjustParams) {
        testInfo.postRunAdjustParams({params: values, extra});
      }
      // check input not changed
      assert.deepStrictEqual(valuesOrig, values);
    } catch(e) {
      err = e;
    }

    try {
      if(isJsonLdType(test, 'rdfc:RDFC10NegativeEvalTest')) {
        if(!isBenchmark) {
          await checkError({test, err});
        }
      } else if(isJsonLdType(test, 'rdfc:RDFC10EvalTest') ||
        isJsonLdType(test, 'rdfc:RDFC10MapTest')) {
        if(err) {
          throw err;
        }
        if(!isBenchmark) {
          await testInfo.compare({test, result, extra});
        }
      } else if(isJsonLdType(test, 'XXX:PositiveSyntaxTest')) {
        // no checks
      } else {
        throw new Error(`Unknown test type: "${test.type}"`);
      }

      let benchmarkResult = null;
      if(benchmarkOptions.enabled) {
        const bparams = adjustParams(testInfo.params.map(param => param(test, {
          // pre-load params to avoid doc loader and parser timing
          load: true
        })));
        // resolve test data
        const bvalues = await Promise.all(bparams);

        const result = await runBenchmark({
          test,
          testInfo,
          jobs,
          run,
          params: bvalues,
          mochaTest: self
        });
        benchmarkResult = {
          // FIXME use generic prefix
          '@type': 'jldb:BenchmarkResult',
          // normalize to jobs/sec from overall ops/sec
          'jldb:hz': result.target.hz * jobs,
          'jldb:rme': result.target.stats.rme
        };
      }

      if(options.earl.report) {
        options.earl.report.addAssertion(test, true, {
          benchmarkResult
        });
      }
    } catch(err) {
      // FIXME: improve handling of non-normative errors
      // FIXME: for now, explicitly disabling tests.
      //if(!normativeTest) {
      //  // failure ok
      //  if(verboseSkip) {
      //    console.log('Skipping non-normative test due to failure:',
      //      {id: test['@id'], name: test.name});
      //  }
      //  self.skip();
      //}
      if(bailOnError) {
        if(err.name !== 'AssertionError') {
          console.error('\nError: ', JSON.stringify(err, null, 2));
        }
        options.exit();
      }
      if(options.earl.report) {
        options.earl.report.addAssertion(test, false);
      }
      console.error('Error: ', JSON.stringify(err, null, 2));
      throw err;
    }
  };
}

async function runBenchmark({test, testInfo, jobs, params, run, mochaTest}) {
  return new Promise((resolve, reject) => {
    const suite = new benchmark.Suite();
    suite.add({
      name: test.name,
      defer: true,
      fn: deferred => {
        run({test, testInfo, params}).then(() => {
          deferred.resolve();
        });
      }
    });
    suite
      .on('start', e => {
        // set timeout to a bit more than max benchmark time
        mochaTest.timeout((e.target.maxTime + 10) * 1000 * jobs);
      })
      .on('cycle', e => {
        const jobsHz = e.target.hz * jobs;
        const jobsPerSec = jobsHz.toFixed(jobsHz < 100 ? 2 : 0);
        const msg = `${String(e.target)} (${jobsPerSec} jobs/sec)`;
        console.log(msg);
      })
      .on('error', err => {
        reject(new Error(err));
      })
      .on('complete', e => {
        resolve(e);
      })
      .run({async: true});
  });
}

function getJsonLdTestType(test) {
  const types = Object.keys(TEST_TYPES);
  for(let i = 0; i < types.length; ++i) {
    if(isJsonLdType(test, types[i])) {
      return types[i];
    }
  }
  return null;
}

function readManifestEntry(manifest, entry) {
  let p = Promise.resolve();
  let _entry = entry;
  if(typeof entry === 'string') {
    let _filename;
    p = p.then(() => {
      if(entry.endsWith('json') || entry.endsWith('jsonld')) {
        // load as file
        return entry;
      }
      // load as dir with manifest.jsonld
      return joinPath(entry, 'manifest.jsonld');
    }).then(entry => {
      const dir = dirname(manifest.filename);
      return joinPath(dir, entry);
    }).then(filename => {
      _filename = filename;
      return readJson(filename);
    }).then(entry => {
      _entry = entry;
      _entry.filename = _filename;
      return _entry;
    }).catch(err => {
      if(err.code === 'ENOENT') {
        //console.log('File does not exist, skipping: ' + _filename);
        // return a "skip" entry
        _entry = {
          type: '__SKIP__',
          title: 'Not found, skipping: ' + _filename,
          filename: _filename,
          skip: true
        };
        return;
      }
      throw err;
    });
  }
  return p.then(() => {
    _entry.dirname = dirname(_entry.filename || manifest.filename);
    return _entry;
  });
}

function readTestJson(property) {
  return async function(test) {
    if(!test[property]) {
      return null;
    }
    const filename = await joinPath(test.dirname, test[property]);
    return readJson(filename);
  };
}

function readTestNQuads(property) {
  return async function(test) {
    if(!test[property]) {
      return null;
    }
    const filename = await joinPath(test.dirname, test[property]);
    return readFile(filename);
  };
}

function parseNQuads(fn) {
  return async test => NQuads.parse(await fn(test));
}

function createTestOptions(opts) {
  return function(test) {
    const testOptions = test.option || {};
    const options = Object.assign({}, testOptions);
    if(opts) {
      // extend options
      Object.assign(options, opts);
    }
    return options;
  };
}

// find the expected output property or throw error
function _getExpectProperty(test) {
  if('expectErrorCode' in test) {
    return 'expectErrorCode';
  } else if('expect' in test) {
    return 'expect';
  } else if('result' in test) {
    return 'result';
  } else {
    throw new Error('No expected output property found');
  }
}

async function compareExpectedNQuads({test, result}) {
  let expect;
  try {
    expect = await readTestNQuads(_getExpectProperty(test))(test);
    assert.strictEqual(result, expect);
  } catch(ex) {
    if(bailOnError) {
      console.log('\nTEST FAILED\n');
      console.log('EXPECTED:\n' + expect);
      console.log('ACTUAL:\n' + result);
    }
    throw ex;
  }
}

async function compareExpectedCanonicalIdMap({test, result, extra}) {
  let expect;
  try {
    expect = await readTestJson(_getExpectProperty(test))(test);
    const expectMap = new Map(Object.entries(expect));
    assert.deepStrictEqual(extra.canonicalIdMap, expectMap);
  } catch(err) {
    if(options.bailOnError) {
      console.log('\nTEST FAILED\n');
      console.log('EXPECTED:\n ' + JSON.stringify(expect, null, 2));
      console.log('ACTUAL:\n' + JSON.stringify(result, null, 2));
    }
    throw err;
  }
}

async function checkError({/*test, */err}) {
  try {
    assert.ok(err, 'no error present');
  } catch(_err) {
    if(options.bailOnError) {
      console.log('\nTEST FAILED\n');
      console.log('EXPECTED ERROR');
    }
    throw _err;
  }
}

function isJsonLdType(node, type) {
  const nodeType = getJsonLdType(node);
  type = Array.isArray(type) ? type : [type];
  for(let i = 0; i < type.length; ++i) {
    if(nodeType.indexOf(type[i]) !== -1) {
      return true;
    }
  }
  return false;
}

function getJsonLdType(node) {
  return [].concat(
    getJsonLdValues(node, '@type'),
    getJsonLdValues(node, 'type')
  );
}

function getJsonLdValues(node, property) {
  let rval = [];
  if(property in node) {
    rval = [].concat(node[property]);
  }
  return rval;
}

async function readJson(filename) {
  const data = await readFile(filename);
  return JSON.parse(data);
}

async function readFile(filename) {
  return options.readFile(filename);
}

async function joinPath() {
  return join.apply(null, Array.prototype.slice.call(arguments));
}

function dirname(filename) {
  if(options.nodejs) {
    return options.nodejs.path.dirname(filename);
  }
  const idx = filename.lastIndexOf('/');
  if(idx === -1) {
    return filename;
  }
  return filename.substr(0, idx);
}

function basename(filename) {
  if(options.nodejs) {
    return options.nodejs.path.basename(filename);
  }
  const idx = filename.lastIndexOf('/');
  if(idx === -1) {
    return filename;
  }
  return filename.substr(idx + 1);
}

};
