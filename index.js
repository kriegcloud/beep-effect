const rdf = require('@rdfjs/data-model')
const DatasetCore = require('./DatasetCore')

/* module.exports = function datasetFactory (quads = [], factory) {
  return new Dataset(quads, factory)
} */

function dataset (quads) {
  return new DatasetCore(quads)
}

module.exports = { dataset, ...rdf }
