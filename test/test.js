import { strictEqual } from 'node:assert'
import { describe, it, run } from 'mocha'
import normalize from '../index.js'
import rdf from './support/factory.js'
import { listToArray, readFileContent, readFileDataset } from './support/utils.js'

const ns = {
  action: rdf.namedNode('http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#action'),
  entries: rdf.namedNode('http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#entries'),
  result: rdf.namedNode('http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#result'),
  complexity: rdf.namedNode('https://w3c.github.io/rdf-canon/tests/vocab#computationalComplexity')
}

const exclude = new Set([
  'manifest#test075c' // ignore SHA384
])

async function loadTest (dataset, term) {
  if (exclude.has(term.value)) {
    return null
  }

  const action = [...dataset.match(term, ns.action)][0]?.object.value
  const result = [...dataset.match(term, ns.result)][0]?.object.value

  if (!action || !result) {
    return null
  }

  // ignore all map tests
  if (term.value.endsWith('m')) {
    return null
  }

  const input = await readFileDataset(action)
  const expected = await readFileContent(result)

  return () => {
    it('should pass test ' + term.value, () => {
      const actual = normalize(input)

      strictEqual(actual, expected)
    })
  }
}

async function loadTests (filename) {
  const dataset = await readFileDataset(filename)

  const entryTerm = [...dataset.match(null, ns.entries)][0].object
  const testTerms = listToArray(dataset, entryTerm)
  const tests = []

  for (const testTerm of testTerms) {
    tests.push(await loadTest(dataset, testTerm))
  }

  return tests.filter(Boolean)
}

loadTests('manifest.ttl').then(tests => {
  describe('@rdfjs/normalize', () => {
    describe('RDF Dataset Normalization (RDFC-1.0)', () => {
      for (const test of tests) {
        test()
      }
    })
  })

  run()
})
