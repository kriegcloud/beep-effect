import clownface from 'clownface'
import $rdf from '@zazuko/env'
import { expect } from 'chai'
import { createFactory } from '../factory.js'
import { Constructor } from '../lib/ResourceFactory.js'
import { RdfResource } from '../RdfResource.js'
import { property } from '../lib/decorators/index.js'
import { ex } from './_helpers/index.js'
import environment from './_helpers/environment.js'

interface TestResource extends RdfResource {
  foo?: string
  bar?: string
}

function TestMixin<Base extends Constructor>(Resource: Base) {
  class Impl extends Resource implements TestResource {
    @property.literal({ path: ex.foo })
      foo?: string

    @property.literal({ path: ex.bar })
      bar?: string
  }

  return Impl
}

function blankNode(id?: string) {
  return clownface({ dataset: $rdf.dataset() }).blankNode(id)
}

describe('@tpluscode/rdfine/factory', () => {
  describe('with pointer argument', () => {
    it('creates resource initialized with defaults', () => {
      // given
      const factory = createFactory<TestResource>([TestMixin], {
        foo: 'foo',
      }, environment)

      // when
      const res = factory(blankNode())

      // then
      expect(res.foo).to.eq('foo')
      expect(res.bar).to.be.undefined
    })

    it('creates resource initialized with overrides', () => {
      // given
      const factory = createFactory<TestResource>([TestMixin], {
        foo: 'foo',
      }, environment)

      // when
      const res = factory(blankNode(), {
        foo: 'bar',
        bar: 'foo',
      })

      // then
      expect(res.foo).to.eq('bar')
      expect(res.bar).to.eq('foo')
    })
  })

  describe('curried with named node', () => {
    it('creates resource with URI provided as string', () => {
      // given
      const factory = createFactory<TestResource>([TestMixin], {}, environment)
      const curriedFactory = factory('http://foo.bar/baz', { foo: 'bar' })

      // when
      const res = curriedFactory(blankNode())

      // then
      expect(res.id).to.deep.eq($rdf.namedNode('http://foo.bar/baz'))
    })

    it('creates resource with URI provided as Term', () => {
      // given
      const factory = createFactory<TestResource>([TestMixin], {}, environment)
      const curriedFactory = factory($rdf.namedNode('http://foo.bar/baz'), { foo: 'bar' })

      // when
      const res = curriedFactory(blankNode())

      // then
      expect(res.id).to.deep.eq($rdf.namedNode('http://foo.bar/baz'))
    })
  })

  describe('curried without node', () => {
    it('creates a blank node resource', () => {
      // given
      const factory = createFactory<TestResource>([TestMixin], {}, environment)
      const curriedFactory = factory({ foo: 'bar' })

      // when
      const res = curriedFactory(blankNode('foo'))

      // then
      expect(res.id.termType).to.eq('BlankNode')
      expect(res.id.value).not.to.eq('foo')
    })
  })
})
