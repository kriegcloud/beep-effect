const assert = require('assert')

function addingQuads ({ dataset, dimension, prefix, rdf }) {
  for (let i = 0; i < dimension; i++) {
    for (let j = 0; j < dimension; j++) {
      for (let k = 0; k < dimension; k++) {
        for (let l = 0; l < dimension; l++) {
          dataset.add(rdf.quad(
            rdf.namedNode(prefix + i),
            rdf.namedNode(prefix + j),
            rdf.namedNode(prefix + k),
            rdf.namedNode(prefix + l)
          ))
        }
      }
    }
  }
}

function findQuads ({ dataset, dimension, dimCubed, prefix, rdf }) {
  for (let i = 0; i < dimension; i++) {
    assert.strictEqual(dataset.match(rdf.namedNode(prefix + i), null, null, null).size, dimCubed)
  }

  for (let j = 0; j < dimension; j++) {
    assert.strictEqual(dataset.match(null, rdf.namedNode(prefix + j), null, null).size, dimCubed)
  }

  for (let k = 0; k < dimension; k++) {
    assert.strictEqual(dataset.match(null, null, rdf.namedNode(prefix + k), null).size, dimCubed)
  }

  for (let l = 0; l < dimension; l++) {
    assert.strictEqual(dataset.match(null, null, null, rdf.namedNode(prefix + l)).size, dimCubed)
  }
}

function test ({ dimension, prefix, rdf, memoryUsage, runTest }) {
  dimension /= 4

  const dimSquared = dimension * dimension
  const dimCubed = dimSquared * dimension
  const dimQuads = dimCubed * dimension
  const dataset = rdf.dataset()

  runTest(`Adding ${dimQuads} quads`, () => {
    addingQuads({ dataset, dimension, prefix, rdf })
  })

  memoryUsage('Memory usage for quads')

  runTest(`Finding all ${dimQuads} quads ${dimCubed * 4} times (3 variables)`, () => {
    findQuads({ dataset, dimension, dimCubed, prefix, rdf })
  })
}

module.exports = test
