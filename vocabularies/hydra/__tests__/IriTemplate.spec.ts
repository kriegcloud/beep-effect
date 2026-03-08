import clownface from 'clownface'
import $rdf from '@zazuko/env'
import { IriTemplate } from '../lib/IriTemplate.js'
import { hydra } from '../lib/namespace.js';
import { expect } from 'chai';
import { testEach } from './support/testEach.js';
import rdf from './support/environment.js';
import { RdfResource } from '@tpluscode/rdfine';

const ex = rdf.namespace('http://example.com/')

describe('IriTemplate', () => {
  describe('expand', () => {
    const basic = hydra.BasicRepresentation.value
    const explicit = hydra.ExplicitRepresentation.value

    testEach`
     | type                   | representation | term                                          | expected                                                                                         |
     | ${'IRI'}               | ${basic}       | ${$rdf.namedNode('http://www.hydra-cg.com/')} | ${'http://example.com/find/http%3A%2F%2Fwww.hydra-cg.com%2F'}                                    |
     | ${'IRI'}               | ${explicit}    | ${$rdf.namedNode('http://www.hydra-cg.com/')} | ${'http://example.com/find/http%3A%2F%2Fwww.hydra-cg.com%2F'}                                    |
     | ${'string'}            | ${basic}       | ${$rdf.literal('A simple string')}            | ${'http://example.com/find/A%20simple%20string'}                                                 |
     | ${'string'}            | ${explicit}    | ${$rdf.literal('A simple string')}            | ${'http://example.com/find/%22A%20simple%20string%22'}                                           |
     | ${'string with quote'} | ${basic}       | ${$rdf.literal('A string " with a quote')}    | ${'http://example.com/find/A%20string%20%22%20with%20a%20quote'}                                 |
     | ${'string with quote'} | ${explicit}    | ${$rdf.literal('A string " with a quote')}    | ${'http://example.com/find/%22A%20string%20%22%20with%20a%20quote%22'}                           |
     | ${'tagged string'}     | ${basic}       | ${$rdf.literal('A simple string', 'en')}      | ${'http://example.com/find/A%20simple%20string'}                                                 |
     | ${'tagged string'}     | ${explicit}    | ${$rdf.literal('A simple string', 'en')}      | ${'http://example.com/find/%22A%20simple%20string%22%40en'}                                      |
     | ${'typed literal'}     | ${basic}       | ${$rdf.literal('5.5', rdf.ns.xsd.decimal)}           | ${'http://example.com/find/5.5'}                                                                 |
     | ${'typed literal'}     | ${explicit}    | ${$rdf.literal('5.5', rdf.ns.xsd.decimal)}           | ${'http://example.com/find/%225.5%22%5E%5Ehttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23decimal'} |
    `(({ type, representation, term, expected }: any) => {
      it(`should correctly represent ${type} with ${representation}`, () => {
        // given
        const dataset = $rdf.dataset()
        const pointer = clownface({ dataset }).blankNode()
        const iriTemplate = rdf.rdfine.hydra.IriTemplate(pointer, {
          template: 'http://example.com/find/{value}',
          variableRepresentation: $rdf.namedNode(representation),
          mapping: [
            {
              types: [hydra.IriTemplateMapping],
              variable: 'value',
              property: ex.value,
            },
          ],
        })

        // when
        const bindings = clownface({ dataset })
          .blankNode()
          .addOut(ex.value, term)
        const expanded = iriTemplate.expand(bindings)

        // then
        expect(expanded).to.eq(expected)
      })
    })

    it('lets variable override the expansion model', () => {
      // given
      const dataset = $rdf.dataset()
      const pointer = clownface({ dataset }).blankNode()
      const iriTemplate = rdf.rdfine.hydra.IriTemplate(pointer, {
        template: 'http://example.com/find/{value}',
        variableRepresentation: hydra.BasicRepresentation,
        mapping: [
          {
            types: [hydra.IriTemplateMapping],
            variable: 'value',
            property: ex.value,
            variableRepresentation: hydra.ExplicitRepresentation,
          },
        ],
      })

      // when
      const bindings = clownface({ dataset })
        .blankNode()
        .addOut(ex.value, $rdf.literal('5.5', rdf.ns.xsd.decimal))
      const expanded = iriTemplate.expand(bindings)

      // then
      expect(expanded).to.eq('http://example.com/find/%225.5%22%5E%5Ehttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23decimal')
    })

    it('does not expand variables with no values', () => {
      // given
      const dataset = $rdf.dataset()
      const pointer = clownface({ dataset }).blankNode()
      const iriTemplate = rdf.rdfine.hydra.IriTemplate(pointer, {
        template: 'http://example.com/find/{?foo,bar,baz}',
        mapping: [
          {
            types: [hydra.IriTemplateMapping],
            variable: 'foo',
            property: ex.foo,
          },
          {
            types: [hydra.IriTemplateMapping],
            variable: 'bar',
            property: ex.bar,
          },
          {
            types: [hydra.IriTemplateMapping],
            variable: 'baz',
            property: ex.baz,
          },
        ],
      })

      // when
      const bindings = clownface({ dataset })
        .blankNode()
        .addOut(ex.bar, $rdf.literal('bar'))
      const expanded = iriTemplate.expand(bindings)

      // then
      expect(expanded).to.eq('http://example.com/find/?bar=bar')
    })

    it('combines multiple models to expand template', () => {
      // given
      const dataset = $rdf.dataset()
      const pointer = clownface({ dataset }).blankNode()
      const iriTemplate = rdf.rdfine.hydra.IriTemplate(pointer, {
        template: 'http://example.com/find/{?foo,bar,baz}',
        mapping: [
          {
            types: [hydra.IriTemplateMapping],
            variable: 'foo',
            property: ex.foo,
          },
          {
            types: [hydra.IriTemplateMapping],
            variable: 'bar',
            property: ex.bar,
          },
          {
            types: [hydra.IriTemplateMapping],
            variable: 'baz',
            property: ex.baz,
          },
        ],
      })

      // when
      const foo = clownface({ dataset }).blankNode().addOut(ex.foo, $rdf.literal('foo'))
      const bar = clownface({ dataset }).blankNode().addOut(ex.bar, $rdf.literal('bar'))
      const baz = clownface({ dataset }).blankNode().addOut(ex.baz, $rdf.literal('baz'))
      const expanded = iriTemplate.expand(foo, bar, baz)

      // then
      expect(expanded).to.eq('http://example.com/find/?foo=foo&bar=bar&baz=baz')
    })

    it('uses latter models to override template bindings', () => {
      // given
      const dataset = $rdf.dataset()
      const pointer = clownface({ dataset }).blankNode()
      const iriTemplate = rdf.rdfine.hydra.IriTemplate(pointer, {
        template: 'http://example.com/find/{?foo}',
        mapping: [
          {
            types: [hydra.IriTemplateMapping],
            variable: 'foo',
            property: ex.foo,
          },
        ],
      })

      // when
      const foo = clownface({ dataset }).blankNode().addOut(ex.foo, $rdf.literal('foo'))
      const bar = clownface({ dataset }).blankNode().addOut(ex.foo, $rdf.literal('bar'))
      const expanded = iriTemplate.expand(foo, bar)

      // then
      expect(expanded).to.eq('http://example.com/find/?foo=bar')
    })

    it('expands against base if given as first argument', () => {
      // given
      const dataset = $rdf.dataset()
      const pointer = clownface({ dataset }).blankNode()
      const iriTemplate = rdf.rdfine.hydra.IriTemplate(pointer, {
        template: '{?foo}',
        mapping: [
          {
            types: [hydra.IriTemplateMapping],
            variable: 'foo',
            property: ex.foo,
          },
        ],
      })

      // when
      const foo = clownface({ dataset }).blankNode().addOut(ex.foo, $rdf.literal('foo'))
      const bar = clownface({ dataset }).blankNode().addOut(ex.foo, $rdf.literal('bar'))
      const expanded = iriTemplate.expand('http://example.com/find/', foo, bar)

      // then
      expect(expanded).to.eq('http://example.com/find/?foo=bar')
    })

    it("uses parent's URI as base", () => {
      // given
      const dataset = $rdf.dataset()
      const pointer = clownface({ dataset }).blankNode()
      const parent: RdfResource = rdf.rdfine().factory.createEntity(pointer.namedNode('http://example.com/find/'), [], {
        initializer: {
          [hydra.search.value]: rdf.rdfine.hydra.IriTemplate(pointer, {
            template: '{?foo}',
            mapping: [
              {
                types: [hydra.IriTemplateMapping],
                variable: 'foo',
                property: ex.foo,
              },
            ],
          }),
        },
      })
      const iriTemplate = parent.get<IriTemplate>(hydra.search)

      // when
      const foo = clownface({ dataset }).blankNode().addOut(ex.foo, $rdf.literal('foo'))
      const expanded = iriTemplate.expand(foo)

      // then
      expect(expanded).to.eq('http://example.com/find/?foo=foo')
    })

    it('walks up parents to find first NamedNode to use as base', () => {
      // given
      const graph = clownface({ dataset: $rdf.dataset() })
      const parentPtr = graph.namedNode('http://example.com/find/')
      const templatePtr = graph.blankNode()
      rdf.rdfine.hydra.IriTemplate(templatePtr, {
        template: '{?foo}',
        mapping: [
          {
            types: [hydra.IriTemplateMapping],
            variable: 'foo',
            property: ex.foo,
          },
        ],
      })
      const collection: RdfResource = rdf.rdfine().factory.createEntity(parentPtr, [], {
        initializer: {
          [hydra.collection.value]: {
            [hydra.search.value]: templatePtr,
          },
        },
      })
      const iriTemplate = collection.get(hydra.collection).get<IriTemplate>(hydra.search)

      // when
      const foo = clownface({ dataset: $rdf.dataset() }).blankNode().addOut(ex.foo, $rdf.literal('foo'))
      const expanded = iriTemplate.expand(foo)

      // then
      expect(expanded).to.eq('http://example.com/find/?foo=foo')
    })

    it('should ensure that mapValue method exists on VariableRepresentation', () => {
      const dataset = $rdf.dataset()
      const pointer = clownface({ dataset }).blankNode()
      const iriTemplate = rdf.rdfine.hydra.IriTemplate(pointer, {
        template: 'http://example.com/find/{value}',
        variableRepresentation: hydra.BasicRepresentation,
      })

      // then
      expect(iriTemplate.variableRepresentation?.mapValue).to.be.ok
    })
  })
})
