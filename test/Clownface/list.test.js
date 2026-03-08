/* global describe, it */

import assert from 'assert'
import { addAll } from 'rdf-dataset-ext'
import clownface from '../../index.js'
import rdf from '../support/factory.js'
import * as ns from '../support/namespace.js'

function listDataset() {
  const start = rdf.blankNode()
  const item = [rdf.blankNode(), rdf.blankNode(), rdf.blankNode()]

  return rdf.dataset([
    rdf.quad(start, ns.list, item[0]),
    rdf.quad(item[0], ns.first, rdf.literal('1')),
    rdf.quad(item[0], ns.rest, item[1]),
    rdf.quad(item[1], ns.first, rdf.literal('2')),
    rdf.quad(item[1], ns.rest, item[2]),
    rdf.quad(item[2], ns.first, rdf.literal('3')),
    rdf.quad(item[2], ns.rest, ns.nil),
  ])
}

describe('.list', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: listDataset() })

    assert.strictEqual(typeof cf.list, 'function')
  })

  it('should return an iterator', () => {
    const cf = clownface({ dataset: listDataset() })

    assert.strictEqual(typeof cf.out(ns.list).list()[Symbol.iterator], 'function')
  })

  it('should iterate over a single term context', () => {
    const cf = clownface({ dataset: listDataset() })

    const result = []

    for (const item of cf.out(ns.list).list()) {
      result.push(item.value)
    }

    assert.deepStrictEqual(result, ['1', '2', '3'])
  })

  it('should not iterate over a multiple term context', () => {
    const cf = clownface({ dataset: addAll(listDataset(), listDataset()) })

    let list
    let touched = false

    try {
      list = cf.out(ns.list).list()[Symbol.iterator]
    } catch (e) {
      touched = true
    }

    assert(touched)
    assert(!list)
  })

  it('should return empty iterator when no list exists', () => {
    const cf = clownface({ dataset: listDataset() })

    const list = cf.out(rdf.namedNode('http://example.com/not-list')).list()[Symbol.iterator]()
    const first = list.next()

    assert.strictEqual(first.done, true)
  })

  it('should return empty iterator when list is rdf:nil', () => {
    const start = rdf.blankNode()
    const dataset = rdf.dataset([
      rdf.quad(start, ns.list, ns.nil),
    ])
    const cf = clownface({ dataset })

    const list = cf.out(ns.list).list()[Symbol.iterator]()
    const first = list.next()

    assert.strictEqual(first.done, true)
  })

  it('should return null when node is literal', () => {
    const start = rdf.blankNode()
    const dataset = rdf.dataset([
      rdf.quad(start, ns.list, rdf.literal('not list')),
    ])
    const cf = clownface({ dataset })

    const list = cf.out(ns.list).list()

    assert.strictEqual(list, null)
  })

  it('should return null when node is not a list', () => {
    const start = rdf.blankNode()
    const dataset = rdf.dataset([
      rdf.quad(start, ns.list, rdf.namedNode('not list')),
    ])
    const cf = clownface({ dataset })

    const list = cf.out(ns.list).list()

    assert.strictEqual(list, null)
  })

  it('should throw when a list node has multiple rdf:first', () => {
    const start = rdf.blankNode()
    const listNode = rdf.blankNode()
    const dataset = rdf.dataset([
      rdf.quad(start, ns.list, listNode),
      rdf.quad(listNode, ns.first, rdf.literal('1')),
      rdf.quad(listNode, ns.first, rdf.literal('3')),
      rdf.quad(listNode, ns.rest, ns.nil),
    ])
    const cf = clownface({ dataset })

    assert.throws(() => {
      [...cf.out(ns.list).list()] // eslint-disable-line no-unused-expressions
    })
  })

  it('should throw when a list node has multiple rdf:rest', () => {
    const start = rdf.blankNode()
    const listNode = rdf.blankNode()

    const dataset = rdf.dataset([
      rdf.quad(start, ns.list, listNode),
      rdf.quad(listNode, ns.first, rdf.literal('1')),
      rdf.quad(listNode, ns.rest, rdf.blankNode()),
      rdf.quad(listNode, ns.rest, ns.nil),
    ])
    const cf = clownface({ dataset })

    assert.throws(() => {
      [...cf.out(ns.list).list()] // eslint-disable-line no-unused-expressions
    })
  })
})
