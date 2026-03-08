const assert = require('assert')

function addingTriples ({ dataset, dimension, prefix, rdf }) {
  for (let i = 0; i < dimension; i++) {
    for (let j = 0; j < dimension; j++) {
      for (let k = 0; k < dimension; k++) {
        dataset.add(rdf.quad(rdf.namedNode(prefix + i), rdf.namedNode(prefix + j), rdf.namedNode(prefix + k)))
      }
    }
  }
}

function findTriples0 ({ dataset, dimension, prefix, rdf }) {
  for (let i = 0; i < dimension; i++) {
    for (let j = 0; j < dimension; j++) {
      for (let k = 0; k < dimension; k++) {
        assert.strictEqual(dataset.match(
          rdf.namedNode(prefix + i),
          rdf.namedNode(prefix + j),
          rdf.namedNode(prefix + k),
          rdf.defaultGraph()
        ).size, 1)
      }
    }
  }
}

function findTriples1 ({ dataset, dimension, prefix, rdf }) {
  for (let i = 0; i < dimension; i++) {
    for (let j = 0; j < dimension; j++) {
      assert.strictEqual(dataset.match(
        rdf.namedNode(prefix + i),
        rdf.namedNode(prefix + j),
        null,
        rdf.defaultGraph()
      ).size, dimension)
    }
  }

  for (let i = 0; i < dimension; i++) {
    for (let j = 0; j < dimension; j++) {
      assert.strictEqual(dataset.match(
        rdf.namedNode(prefix + i),
        null,
        rdf.namedNode(prefix + j),
        rdf.defaultGraph()
      ).size, dimension)
    }
  }

  for (let i = 0; i < dimension; i++) {
    for (let j = 0; j < dimension; j++) {
      assert.strictEqual(dataset.match(
        null,
        rdf.namedNode(prefix + i),
        rdf.namedNode(prefix + j),
        rdf.defaultGraph()
      ).size, dimension)
    }
  }
}

function findTriples2 ({ dataset, dimension, dimSquared, prefix, rdf }) {
  for (let i = 0; i < dimension; i++) {
    assert.strictEqual(dataset.match(rdf.namedNode(prefix + i), null, null, rdf.defaultGraph()).size, dimSquared)
  }

  for (let j = 0; j < dimension; j++) {
    assert.strictEqual(dataset.match(null, rdf.namedNode(prefix + j), null, rdf.defaultGraph()).size, dimSquared)
  }

  for (let k = 0; k < dimension; k++) {
    assert.strictEqual(dataset.match(null, null, rdf.namedNode(prefix + k), rdf.defaultGraph()).size, dimSquared)
  }
}

function test ({ dimension, prefix, rdf, memoryUsage, runTest }) {
  const dimSquared = dimension * dimension
  const dimCubed = dimSquared * dimension
  const dataset = rdf.dataset()

  runTest(`Adding ${dimCubed} triples to the default graph`, () => {
    addingTriples({ dataset, dimension, prefix, rdf })
  })

  memoryUsage('Memory usage for triples')

  runTest(`Finding all ${dimCubed} triples in the default graph ${dimSquared * 1} times (0 variables)`, () => {
    findTriples0({ dataset, dimension, prefix, rdf })
  })

  runTest(`Finding all ${dimCubed} triples in the default graph ${dimSquared * 2} times (1 variable)`, () => {
    findTriples1({ dataset, dimension, prefix, rdf })
  })

  runTest(`Finding all ${dimCubed} triples in the default graph ${dimSquared * 3} times (2 variables)`, () => {
    findTriples2({ dataset, dimension, dimSquared, prefix, rdf })
  })
}

module.exports = test
