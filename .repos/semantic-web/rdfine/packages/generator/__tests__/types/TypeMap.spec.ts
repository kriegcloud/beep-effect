import $rdf from '@zazuko/env'
import { rdf, rdfs } from '@tpluscode/rdf-ns-builders'
import cf, { AnyPointer } from 'clownface'
import { expect } from 'chai'
import sinon from 'sinon'
import { TypeMap } from '../../lib/types/TypeMap.js'
import { Context } from '../../lib/index.js'
import { fakeLog } from '../_helpers/util.js'
import { TermType } from '../../lib/types/index.js'
import { ex } from '../_helpers/prefix.js'

describe('TypeMap', () => {
  let context: Context
  let vocabulary: AnyPointer

  beforeEach(() => {
    const dataset = $rdf.dataset()
    vocabulary = cf({ dataset })
    context = {
      log: fakeLog(),
      prefix: 'ex',
      vocabulary,
      defaultExport: 'Example',
      properties: {},
    }
  })

  describe('get', () => {
    it('returns a meta object for class', () => {
      // given
      vocabulary.node(ex.Type)
        .addOut(rdf.type, rdfs.Class)
      const expected = {}
      const typeMap = new TypeMap({
        context,
        factories: [
          sinon.stub().returns(expected),
        ],
        excluded: [],
      })

      // when
      const meta = typeMap.get(vocabulary.node(ex.Type))

      // then
      expect(meta).to.eq(expected)
    })

    it('returns a TermType when not found', () => {
      // given
      const typeMap = new TypeMap({
        context,
        factories: [
        ],
        excluded: [],
      })

      // when
      const meta = typeMap.get(vocabulary.node(ex.Type))

      // then
      expect(meta).to.deep.eq({
        termType: 'Term',
        type: 'Term',
      } as TermType)
    })

    it('returns undefined when excluded', () => {
      // given
      vocabulary.node(ex.Type)
        .addOut(rdf.type, rdfs.Class)
      const typeMap = new TypeMap({
        context,
        factories: [],
        excluded: [ex.Type],
      })

      // when
      const meta = typeMap.get(vocabulary.node(ex.Type))

      // then
      expect(meta).to.be.undefined
    })

    it('returns value verbatim when it is a literal', () => {
      const typeMap = new TypeMap({
        context,
        factories: [],
        excluded: [ex.Type],
      })

      // when
      const meta = typeMap.get(vocabulary.node('foo'))

      // then
      expect(meta).to.deep.eq({
        type: 'Constant',
        value: 'foo',
      })
    })
  })

  describe('getOrThrow', () => {
    it('throws when not found', () => {
      // given
      const typeMap = new TypeMap({
        context,
        factories: [
        ],
        excluded: [],
      })

      // then
      expect(() => {
        // when
        typeMap.getOrThrow(vocabulary.node(ex.Type))
      }).to.throw()
    })

    it('returns a meta object for class', () => {
      // given
      vocabulary.node(ex.Type)
        .addOut(rdf.type, rdfs.Class)
      const expected = {}
      const typeMap = new TypeMap({
        context,
        factories: [
          sinon.stub().returns(expected),
        ],
        excluded: [],
      })

      // when
      const meta = typeMap.getOrThrow(vocabulary.node(ex.Type))

      // then
      expect(meta).to.eq(expected)
    })
  })
})
