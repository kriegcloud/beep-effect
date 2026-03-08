function runTests (rdf) {
  require('./DatasetCore')(rdf)
}

if (global.rdf) {
  runTests(global.rdf)
}

module.exports = runTests
