import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import pageRank from '../pageRank.js'
import sort from '../sort.js'
import rdf from './support/factory.js'
import * as ns from './support/namespaces.js'

describe('pageRank', () => {
  it('should be a function', () => {
    strictEqual(typeof pageRank, 'function')
  })

  it('should return a score function', () => {
    const score = pageRank()

    strictEqual(typeof score, 'function')
    strictEqual(score.length, 1)
  })

  it('should return an array', () => {
    const score = pageRank()

    const result = score({ dataset: rdf.dataset(), terms: [] })

    strictEqual(Array.isArray(result), true)
  })

  it('should score the terms based on the pageRank algorithm', () => {
    const score = pageRank()
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.resource1, ns.ex.predicate, ns.ex.resource2),
      rdf.quad(ns.ex.resource1, ns.ex.predicate, ns.ex.resource4),
      rdf.quad(ns.ex.resource2, ns.ex.predicate, ns.ex.resource4),
      rdf.quad(ns.ex.resource2, ns.ex.predicate, ns.ex.resource3),
      rdf.quad(ns.ex.resource3, ns.ex.predicate, ns.ex.resource1)
    ])
    const terms = [ns.ex.resource1, ns.ex.resource2, ns.ex.resource3, ns.ex.resource4]

    const result = sort(score({ dataset, terms }))

    strictEqual(result.length, 4)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.resource1), true)
    strictEqual(Math.abs(result[0].score - 0.326) < 0.001, true)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].term.equals(ns.ex.resource2), true)
    strictEqual(Math.abs(result[1].score - 0.321) < 0.001, true)
    strictEqual(result[2].dataset, dataset)
    strictEqual(result[2].term.equals(ns.ex.resource3), true)
    strictEqual(Math.abs(result[2].score - 0.315) < 0.001, true)
    strictEqual(result[3].dataset, dataset)
    strictEqual(result[3].term.equals(ns.ex.resource4), true)
    strictEqual(Math.abs(result[3].score - 0.038) < 0.001, true)
  })

  it('should use the given alpha value', () => {
    const score = pageRank({ alpha: 0.95 })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.resource1, ns.ex.predicate, ns.ex.resource2),
      rdf.quad(ns.ex.resource1, ns.ex.predicate, ns.ex.resource4),
      rdf.quad(ns.ex.resource2, ns.ex.predicate, ns.ex.resource4),
      rdf.quad(ns.ex.resource2, ns.ex.predicate, ns.ex.resource3),
      rdf.quad(ns.ex.resource3, ns.ex.predicate, ns.ex.resource1)
    ])
    const terms = [ns.ex.resource1, ns.ex.resource2, ns.ex.resource3, ns.ex.resource4]

    const result = sort(score({ dataset, terms }))

    strictEqual(result.length, 4)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.resource1), true)
    strictEqual(Math.abs(result[0].score - 0.331) < 0.001, true)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].term.equals(ns.ex.resource2), true)
    strictEqual(Math.abs(result[1].score - 0.329) < 0.001, true)
    strictEqual(result[2].dataset, dataset)
    strictEqual(result[2].term.equals(ns.ex.resource3), true)
    strictEqual(Math.abs(result[2].score - 0.327) < 0.001, true)
    strictEqual(result[3].dataset, dataset)
    strictEqual(result[3].term.equals(ns.ex.resource4), true)
    strictEqual(Math.abs(result[3].score - 0.013) < 0.001, true)
  })

  it('should use the given epsilon value', () => {
    const score = pageRank({ epsilon: 0.1 })
    const dataset = rdf.dataset([
      rdf.quad(ns.ex.resource1, ns.ex.predicate, ns.ex.resource2),
      rdf.quad(ns.ex.resource1, ns.ex.predicate, ns.ex.resource4),
      rdf.quad(ns.ex.resource2, ns.ex.predicate, ns.ex.resource4),
      rdf.quad(ns.ex.resource2, ns.ex.predicate, ns.ex.resource3),
      rdf.quad(ns.ex.resource3, ns.ex.predicate, ns.ex.resource1)
    ])
    const terms = [ns.ex.resource1, ns.ex.resource2, ns.ex.resource3, ns.ex.resource4]

    const result = sort(score({ dataset, terms }))

    strictEqual(result.length, 4)
    strictEqual(result[0].dataset, dataset)
    strictEqual(result[0].term.equals(ns.ex.resource2), true)
    strictEqual(Math.abs(result[0].score - 0.334) < 0.001, true)
    strictEqual(result[1].dataset, dataset)
    strictEqual(result[1].term.equals(ns.ex.resource3), true)
    strictEqual(Math.abs(result[1].score - 0.331) < 0.001, true)
    strictEqual(result[2].dataset, dataset)
    strictEqual(result[2].term.equals(ns.ex.resource1), true)
    strictEqual(Math.abs(result[2].score - 0.298) < 0.001, true)
    strictEqual(result[3].dataset, dataset)
    strictEqual(result[3].term.equals(ns.ex.resource4), true)
    strictEqual(Math.abs(result[3].score - 0.038) < 0.001, true)
  })
})
