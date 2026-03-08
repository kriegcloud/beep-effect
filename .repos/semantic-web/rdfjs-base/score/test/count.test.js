import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import count from '../count.js'
import sort from '../sort.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('count', () => {
  it('should be a function', () => {
    strictEqual(typeof count, 'function')
  })

  it('should return a score function', () => {
    const score = count()

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = count()

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should score the terms based on the subject count', () => {
    const score = count()
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate, ns.ex.object1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object2),
      rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object3),
      rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object4)
    ])

    const result = sort(score({ dataset, terms: [ns.ex.subject1, ns.ex.subject2] }))

    strictEqual(result.length, 2)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.subject2), true)
    strictEqual(result[0].score, 0.75)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].term.equals(ns.ex.subject1), true)
    strictEqual(result[1].score, 0.25)
  })

  it('should score the terms based on the predicate count if predicate is true', () => {
    const score = count({ subject: false, predicate: true })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate2, ns.ex.object3),
      rdf.quad(ns.ex.subject4, ns.ex.predicate2, ns.ex.object4)
    ])

    const result = sort(score({ dataset, terms: [ns.ex.predicate1, ns.ex.predicate2] }))

    strictEqual(result.length, 2)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.predicate2), true)
    strictEqual(result[0].score, 0.75)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].term.equals(ns.ex.predicate1), true)
    strictEqual(result[1].score, 0.25)
  })

  it('should score the terms based on the object count if object is true', () => {
    const score = count({ subject: false, object: true })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate, ns.ex.object1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate, ns.ex.object2),
      rdf.quad(ns.ex.subject4, ns.ex.predicate, ns.ex.object2)
    ])

    const result = sort(score({ dataset, terms: [ns.ex.object1, ns.ex.object2] }))

    strictEqual(result.length, 2)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.object2), true)
    strictEqual(result[0].score, 0.75)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].term.equals(ns.ex.object1), true)
    strictEqual(result[1].score, 0.25)
  })

  it('should score the terms based on the graph count if graph is true', () => {
    const score = count({ subject: false, graph: true })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate, ns.ex.object, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object, ns.ex.graph2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate, ns.ex.object, ns.ex.graph2),
      rdf.quad(ns.ex.subject4, ns.ex.predicate, ns.ex.object, ns.ex.graph2)
    ])

    const result = sort(score({ dataset, terms: [ns.ex.graph1, ns.ex.graph2] }))

    strictEqual(result.length, 2)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.graph2), true)
    strictEqual(result[0].score, 0.75)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].term.equals(ns.ex.graph1), true)
    strictEqual(result[1].score, 0.25)
  })

  it('should search only in the given graph', () => {
    const score = count()
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate, ns.ex.object1, ns.ex.graph1),
      rdf.quad(ns.ex.subject1, ns.ex.predicate, ns.ex.object2, ns.ex.graph2),
      rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object3, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object4, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object5, ns.ex.graph1)
    ])

    const result = sort(score({ dataset, graph: ns.ex.graph1, terms: [ns.ex.subject1, ns.ex.subject2] }))

    strictEqual(result.length, 2)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.subject2), true)
    strictEqual(result[0].score, 0.75)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].term.equals(ns.ex.subject1), true)
    strictEqual(result[1].score, 0.25)
  })

  it('should return an empty scoring if the dataset is empty', () => {
    const score = count()

    const result = score({ dataset: rdf.dataset(), terms: [ns.ex.subject1] })

    strictEqual(result.length, 0)
  })

  it('should return an empty scoring if the terms is empty', () => {
    const score = count()
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate, ns.ex.object),
      rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object)
    ])

    const result = score({ dataset, terms: [] })

    strictEqual(result.length, 0)
  })
})
