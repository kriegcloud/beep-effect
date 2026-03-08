import cf, { GraphPointer } from 'clownface'
import $rdf from '@zazuko/env'
import { schema } from '@tpluscode/rdf-ns-builders'
import type { DatasetCore, Literal, NamedNode } from '@rdfjs/types'
import chai, { expect } from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import toCanonical from 'rdf-dataset-ext/toCanonical.js'
import { createProxy } from '../lib/proxy.js'
import RdfResourceImpl, { RdfResource } from '../RdfResource.js'
import { property, ResourceIndexer } from '../index.js'
import type { AnyFactory } from '../factory.js'
import { ex } from './_helpers/index.js'
import environment from './_helpers/environment.js'

describe('proxy', () => {
  let node: GraphPointer<NamedNode, DatasetCore>
  chai.use(jestSnapshotPlugin())
  before(() => import('../../../__tests__/helpers/matchers.js'))

  beforeEach(() => {
    node = cf({ dataset: $rdf.dataset() })
      .namedNode(ex.Proxied)

    node.addOut(ex.Prop1, ex.Proxied2, p => {
      p.addOut(ex.Prop2, node.literal('foo', 'bar'))
    })

    node.addOut(ex.multi, ['a', 'z'])
  })

  describe('get', () => {
    it('proxies direct index access', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)

      // when
      const value = proxy['http://example.com/Prop1'] as RdfResource

      // then
      expect(value.id.value).to.eq('http://example.com/Proxied2')
    })

    it('works with arbitrary symbol properties', () => {
      // given
      const Foo: unique symbol = Symbol('Foo')
      const proxy = createProxy(new RdfResourceImpl(node, environment)) as any

      // when
      proxy[Foo] = 'bar'

      // then
      expect(proxy[Foo]).to.eq('bar')
    })

    it('returns raw literals', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)

      // when
      const value = (proxy['http://example.com/Prop1'] as ResourceIndexer)['http://example.com/Prop2']

      // then
      expect(value).to.deep.eq(node.literal('foo', 'bar').term)
    })

    it('returns array from multiple values', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)

      // when
      const value = proxy['http://example.com/multi'] as Literal[]

      // then
      expect(value.map(l => l.value)).to.deep.eq(['a', 'z'])
    })

    it('does not proxy built-in properties', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)

      // then
      expect(proxy.id.value).to.eq('http://example.com/Proxied')
    })

    it('does not proxy declared properties', () => {
      // given
      class Specialized extends RdfResourceImpl {
        @property.literal({ type: Number, path: 'http://example.com/number', initial: 5 })
          foo!: number
      }
      const proxy = createProxy(new Specialized(node, environment))

      // then
      expect(proxy.foo).to.deep.eq(5)
    })

    it('returns undefined for missing property', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)

      // when
      const value = proxy['http://example.com/foo']

      // then
      expect(value).to.be.undefined
    })

    it('returns enumerated RDF list of literals', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)
      node.addList(ex.listOfLiterals, ['a', 'B', 'cc'])

      // when
      const listItems = proxy['http://example.com/listOfLiterals'] as Literal[]

      // then
      expect(listItems.map(l => l.value)).to.deep.eq(
        ['a', 'B', 'cc'],
      )
    })

    it('returns enumerated RDF list of resources', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)
      node.addList(ex.listOfUris, [
        ex.jane,
        ex.jane,
        ex.john,
      ])

      // when
      const listItems = proxy['http://example.com/listOfUris'] as RdfResource[]

      // then
      expect(listItems.map(l => l.id.value)).to.deep.eq(
        [ex.jane.value, ex.jane.value, ex.john.value],
      )
    })

    it('attaches proxied resource as parent of objects', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)
      node.addOut(ex.foo, ex.bar)

      // when
      const child = proxy[ex.foo.value] as RdfResource

      // then
      expect(child._parent).to.eq(resource)
    })
  })

  describe('set', () => {
    it('single literal', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)

      // when
      proxy[ex.set.value] = $rdf.literal('foo')

      // then
      expect(toCanonical(node.dataset)).toMatchSnapshot()
    })

    it('single resource', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)

      // when
      proxy[ex.set.value] = new RdfResourceImpl(node.namedNode(ex.other), environment)

      // then
      expect(toCanonical(node.dataset)).toMatchSnapshot()
    })

    it('single factory', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)
      const child: AnyFactory<RdfResourceImpl> = (pointer) => {
        return new RdfResourceImpl(pointer.blankNode(), environment, {
          [schema.name.value]: 'Child',
        })
      }

      // when
      proxy[ex.set.value] = <any>child

      // then
      expect(node.out(ex.set).out(schema.name).value).to.eq('Child')
    })

    it('multiple literals', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)

      // when
      proxy[ex.set.value] = [$rdf.literal('foo'), $rdf.literal('bar')]

      // then
      expect(toCanonical(node.dataset)).toMatchSnapshot()
    })

    it('multiple resources', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)

      // when
      proxy[ex.set.value] = [
        new RdfResourceImpl(node.node(ex.one), environment),
        new RdfResourceImpl(node.node(ex.two), environment),
      ]

      // then
      expect(toCanonical(node.dataset)).toMatchSnapshot()
    })

    it('multiple factories and values', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const Baz = node.addOut(schema.name, 'Baz')
      const proxy = createProxy(resource)
      const child = (name: string): AnyFactory<RdfResourceImpl> => (pointer) => {
        return new RdfResourceImpl(pointer.blankNode(), environment, {
          [schema.name.value]: name,
        })
      }

      // when
      proxy[ex.set.value] = <any>[child('Foo'), child('Bar'), Baz]

      // then
      expect(node.out(ex.set).out(schema.name).values).to.deep.contain.all.members(
        ['Foo', 'Bar', 'Baz'],
      )
    })

    it('null removes triples', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)

      // when
      proxy[ex.multi.value] = null

      // then
      expect(toCanonical(node.dataset)).toMatchSnapshot()
    })

    it('empty array removes triples', () => {
      // given
      const resource = new RdfResourceImpl(node, environment)
      const proxy = createProxy(resource)

      // when
      proxy[ex.multi.value] = []

      // then
      expect(toCanonical(node.dataset)).toMatchSnapshot()
    })

    it('does not proxy declared properties', () => {
      // given
      class Specialized extends RdfResourceImpl {
        @property.literal({ type: Number, path: 'http://example.com/number', initial: 5 })
          foo!: number
      }
      const proxy = createProxy(new Specialized(node, environment))

      // when
      proxy.foo = 10

      // then
      expect(toCanonical(node.dataset)).toMatchSnapshot()
    })
  })
})
