/**
 * Node.js test runner for rdf-canonize.
 *
 * See ./test.js for environment vars options.
 *
 * @author Dave Longley
 * @author David I. Lehn
 *
 * Copyright (c) 2011-2023 Digital Bazaar, Inc. All rights reserved.
 */
const assert = require('chai').assert;
const benchmark = require('benchmark');
const common = require('./test.js');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const entries = [];

if(process.env.TESTS) {
  entries.push(...process.env.TESTS.split(' '));
} else {
  const _top = path.resolve(__dirname, '..');

  // W3C RDF Dataset Canonicalization "rdf-canon" test suite
  const testPath = path.resolve(
    _top, 'test-suites/rdf-canon/tests');
  if(fs.existsSync(testPath)) {
    entries.push(testPath);
  } else {
    // default to sibling dir
    entries.push(path.resolve(_top, '../rdf-canon/tests'));
  }

  // other tests
  entries.push(path.resolve(_top, 'test/misc.js'));
}

// test environment defaults
const testEnvDefaults = {
  label: '',
  arch: process.arch,
  cpu: os.cpus()[0].model,
  cpuCount: os.cpus().length,
  platform: process.platform,
  runtime: 'Node.js',
  runtimeVersion: process.version,
  comment: '',
  version: require('../package.json').version
};

const env = {
  ASYNC: process.env.ASYNC,
  BAIL: process.env.BAIL,
  BENCHMARK: process.env.BENCHMARK,
  EARL_OFFICIAL: process.env.EARL_OFFICIAL,
  SYNC: process.env.SYNC,
  TEST_ENV: process.env.TEST_ENV,
  VERBOSE_SKIP: process.env.VERBOSE_SKIP,
  WEBCRYPTO: process.env.WEBCRYPTO
};

const options = {
  env,
  nodejs: {
    path
  },
  assert,
  benchmark,
  exit: code => process.exit(code),
  earl: {
    filename: process.env.EARL
  },
  entries,
  testEnvDefaults,
  readFile: filename => {
    return fs.readFile(filename, 'utf8');
  },
  writeFile: (filename, data) => {
    return fs.outputFile(filename, data);
  },
  import: f => require(f)
};

// wait for setup of all tests then run mocha
common(options).then(() => {
  run();
}).catch(err => {
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
