import datasetCoreTest from './DatasetCore.test.js'

function runTests ({ factory, mocha }) {
  if (!mocha) {
    mocha = { describe: global.describe, it: global.it }
  }

  datasetCoreTest({ factory, mocha })
}

if (global.rdf) {
  runTests({ factory: global.rdf })
}

export default runTests
