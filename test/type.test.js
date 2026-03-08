import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import sort from '../sort.js'
import type from '../type.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('type', () => {
  it('should be a function', () => {
    strictEqual(typeof type, 'function')
  })

  it('should return a score function', () => {
    const score = type({})

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = type({})

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should score subjects with a matching type with 1', () => {
    const score = type(ns.ex.Type1)
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.rdf.type, ns.ex.Type1),
      rdf.quad(ns.ex.subject2, ns.rdf.type, ns.ex.Type2),
      rdf.quad(ns.ex.subject3, ns.rdf.type, ns.ex.Type1)
    ])

    const result = sort(score({ dataset, terms: [ns.ex.subject1, ns.ex.subject2, ns.ex.subject3] }))

    strictEqual(result.length, 2)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].score, 1)
    strictEqual(result[0].term.equals(ns.ex.subject1), true)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].score, 1)
    strictEqual(result[1].term.equals(ns.ex.subject3), true)
  })

  it('should score subjects over multiple graphs if no graph is given', () => {
    const score = type(ns.ex.Type1)
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.rdf.type, ns.ex.Type1, ns.ex.graph1),
      rdf.quad(ns.ex.subject1, ns.rdf.type, ns.ex.Type1, ns.ex.graph2),
      rdf.quad(ns.ex.subject2, ns.rdf.type, ns.ex.Type2, ns.ex.graph2),
      rdf.quad(ns.ex.subject3, ns.rdf.type, ns.ex.Type1, ns.ex.graph3)
    ])

    const result = sort(score({ dataset, terms: [ns.ex.subject1, ns.ex.subject2, ns.ex.subject3] }))

    strictEqual(result.length, 3)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].score, 1)
    strictEqual(result[0].term.equals(ns.ex.subject1), true)
    strictEqual(result[0].graph.equals(ns.ex.graph1), true)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].score, 1)
    strictEqual(result[1].term.equals(ns.ex.subject1), true)
    strictEqual(result[1].graph.equals(ns.ex.graph2), true)
    strictEqual(result[2].dataset, dataset)
    strictEqual(result[2].score, 1)
    strictEqual(result[2].term.equals(ns.ex.subject3), true)
    strictEqual(result[2].graph.equals(ns.ex.graph3), true)
  })

  it('should return an empty scoring of the type doesn\'t match', () => {
    const score = type(ns.ex.Type4)
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.rdf.type, ns.ex.Type1),
      rdf.quad(ns.ex.subject2, ns.rdf.type, ns.ex.Type2),
      rdf.quad(ns.ex.subject3, ns.rdf.type, ns.ex.Type3)
    ])

    const result = score({ dataset, terms: [ns.ex.subject1, ns.ex.subject2, ns.ex.subject3] })

    strictEqual(result.length, 0)
  })

  it('should return an empty scoring if the dataset is empty', () => {
    const score = type(ns.ex.Type)

    const result = score({ dataset: rdf.dataset(), terms: [ns.ex.subject1] })

    strictEqual(result.length, 0)
  })

  it('should return an empty scoring if the terms argument is empty', () => {
    const score = type(ns.ex.Type)
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.subject1, ns.ex.predicate, ns.ex.object),
      rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object)
    ])

    const result = score({ dataset, terms: [] })

    strictEqual(result.length, 0)
  })
})
