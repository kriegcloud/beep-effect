const rdf = require('@rdfjs/data-model')
const DatasetCore = require('./DatasetCore')

function dataset (quads) {
  return new DatasetCore(quads)
}

module.exports = Object.assign({ dataset }, rdf)
