import { deepStrictEqual, notStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import sortObjects from '../sortObjects.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('sortObjects', () => {
  it('should be a function', () => {
    strictEqual(typeof sortObjects, 'function')
  })

  it('should return an array', () => {
    const dataset = rdf.dataset()
    const objects = []
    const score = ({ dataset, graph, terms }) => {
      return terms.map(term => {
        return { dataset, graph, term }
      })
    }
    const result = sortObjects({ dataset, objects, score })

    strictEqual(Array.isArray(result), true)
  })

  it('should return an array with the same length as the given array', () => {
    const dataset = rdf.dataset()
    const objects = [{
      term: ns.rdf.resource1
    }, {
      term: ns.rdf.resource2
    }]
    const score = ({ dataset, graph, terms }) => {
      return terms.map(term => {
        return { dataset, graph, term }
      })
    }
    const result = sortObjects({ dataset, objects, score })

    strictEqual(result.length, objects.length)
  })

  it('should return a new array', () => {
    const dataset = rdf.dataset()
    const objects = [{
      term: ns.rdf.resource1
    }, {
      term: ns.rdf.resource2
    }]
    const score = ({ dataset, graph, terms }) => {
      return terms.map(term => {
        return { dataset, graph, term }
      })
    }
    const result = sortObjects({ dataset, objects, score })

    notStrictEqual(result, objects)
  })

  it('should not touch the original array', () => {
    const dataset = rdf.dataset()
    const objects = [{
      term: ns.rdf.resource1
    }, {
      term: ns.rdf.resource2
    }]
    const score = ({ dataset, graph, terms }) => {
      return terms.map((term, index) => {
        return { dataset, graph, score: 1 / index, term }
      })
    }
    const original = objects.slice()

    sortObjects({ dataset, objects, score })

    deepStrictEqual(objects, original)
  })

  it('should sort the given objects', () => {
    const dataset = rdf.dataset()
    const objects = [{
      term: ns.rdf.resource1
    }, {
      term: ns.rdf.resource2
    }]
    const score = ({ dataset, graph, terms }) => {
      return terms.map((term, index) => {
        return { dataset, graph, score: 1 - 1 / index, term }
      })
    }
    const expected = [
      objects[1],
      objects[0]
    ]

    const result = sortObjects({ dataset, objects, score })

    deepStrictEqual(result, expected)
  })

  it('should use the given termCallback function to read the term of the object', () => {
    const dataset = rdf.dataset()
    const objects = [{
      customTerm: ns.rdf.resource1
    }, {
      customTerm: ns.rdf.resource2
    }]
    const score = ({ dataset, graph, terms }) => {
      return terms.map((term, index) => {
        return { dataset, graph, score: 1 - 1 / index, term }
      })
    }
    const termCallback = object => object.customTerm
    const expected = [
      objects[1],
      objects[0]
    ]

    const result = sortObjects({ dataset, objects, score, termCallback })

    deepStrictEqual(result, expected)
  })
})
