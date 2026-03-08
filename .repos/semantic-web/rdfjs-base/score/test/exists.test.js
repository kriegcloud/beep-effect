import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import exists from '../exists.js'
import sort from '../sort.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('exists', () => {
  it('should be a function', () => {
    strictEqual(typeof exists, 'function')
  })

  it('should return a score function', () => {
    const score = exists({})

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = exists({})

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should score the given subject with 1', () => {
    const score = exists({ subject: ns.ex.subject3 })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate3, ns.ex.object3)
    ])
    const terms = [ns.ex.subject1, ns.ex.subject2, ns.ex.subject3]

    const result = sort(score({ dataset, terms }))

    strictEqual(result.length, 1)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.subject3), true)
    strictEqual(result[0].score, 1)
  })

  it('should return an empty result if there is no matching subject', () => {
    const score = exists({ subject: ns.ex.subject4 })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate3, ns.ex.object3)
    ])
    const terms = [ns.ex.subject1, ns.ex.subject2, ns.ex.subject3]

    const result = score({ dataset, terms })

    strictEqual(result.length, 0)
  })

  it('should score the given predicate with 1', () => {
    const score = exists({ predicate: ns.ex.predicate3 })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate3, ns.ex.object3)
    ])
    const terms = [ns.ex.predicate1, ns.ex.predicate2, ns.ex.predicate3]

    const result = sort(score({ dataset, terms }))

    strictEqual(result.length, 1)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.predicate3), true)
    strictEqual(result[0].score, 1)
  })

  it('should return an empty result if there is no matching predicate', () => {
    const score = exists({ predicate: ns.ex.predicate4 })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate3, ns.ex.object3)
    ])
    const terms = [ns.ex.predicate1, ns.ex.predicate2, ns.ex.predicate3]

    const result = score({ dataset, terms })

    strictEqual(result.length, 0)
  })

  it('should score the given object with 1', () => {
    const score = exists({ object: ns.ex.object3 })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate3, ns.ex.object3)
    ])
    const terms = [ns.ex.object1, ns.ex.object2, ns.ex.object3]

    const result = sort(score({ dataset, terms }))

    strictEqual(result.length, 1)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.object3), true)
    strictEqual(result[0].score, 1)
  })

  it('should return an empty result if there is no matching object', () => {
    const score = exists({ object: ns.ex.object4 })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate3, ns.ex.object3)
    ])
    const terms = [ns.ex.object1, ns.ex.object2, ns.ex.object3]

    const result = score({ dataset, terms })

    strictEqual(result.length, 0)
  })

  it('should score the given graph with 1', () => {
    const score = exists({ graph: ns.ex.graph3 })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2, ns.ex.graph2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate3, ns.ex.object3, ns.ex.graph3)
    ])
    const terms = [ns.ex.graph1, ns.ex.graph2, ns.ex.graph3]

    const result = sort(score({ dataset, terms }))

    strictEqual(result.length, 1)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.graph3), true)
    strictEqual(result[0].score, 1)
  })

  it('should return an empty result if there is no matching graph', () => {
    const score = exists({ graph: ns.ex.graph4 })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2, ns.ex.graph2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate3, ns.ex.object3, ns.ex.graph3)
    ])
    const terms = [ns.ex.graph1, ns.ex.graph2, ns.ex.graph3]

    const result = score({ dataset, terms })

    strictEqual(result.length, 0)
  })

  it('should return an empty result if the search graph and the named graph don\'t match', () => {
    const score = exists({ graph: ns.ex.graph3 })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2, ns.ex.graph2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate3, ns.ex.object3, ns.ex.graph3)
    ])
    const terms = [ns.ex.graph1, ns.ex.graph2, ns.ex.graph3]

    const result = score({ dataset, terms, graph: ns.ex.graph1 })

    strictEqual(result.length, 0)
  })
})
