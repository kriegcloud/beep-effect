import assert from 'assert'
import { describe, it } from 'mocha'
import clownface from '../../index.js'
import rdf from '../support/factory.js'

describe('.any', () => {
  it('should be a function', () => {
    const cf = clownface({ dataset: rdf.dataset() })

    assert.strictEqual(typeof cf.any, 'function')
  })

  it('should return any pointer object', () => {
    const pointer = clownface({ dataset: rdf.dataset() })

    const any = pointer.any()

    assert.strictEqual(typeof any.term, 'undefined')
    assert.deepStrictEqual(any.terms, [])
  })

  it('should remove current pointer', () => {
    const pointer = clownface({ dataset: rdf.dataset(), term: [rdf.blankNode(), rdf.blankNode()] })

    const any = pointer.any()

    assert.strictEqual(typeof any.term, 'undefined')
    assert.deepStrictEqual(any.terms, [])
  })

  it('should remove current pointers', () => {
    const pointer = clownface({ dataset: rdf.dataset(), term: [rdf.blankNode()] })

    const any = pointer.any()

    assert.strictEqual(typeof any.term, 'undefined')
    assert.deepStrictEqual(any.terms, [])
  })

  it('should keep same graph pointer in the result', () => {
    const cf = clownface({ dataset: rdf.dataset(), graph: rdf.namedNode('foo'), term: rdf.blankNode() })

    const anyPointer = cf.any()

    assert.strictEqual(anyPointer._context[0].graph.value, 'foo')
  })
})
