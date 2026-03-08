import cf from 'clownface'
import $rdf from '@zazuko/env'
import { foaf } from '@tpluscode/rdf-ns-builders'
import { rdfs, schema } from '@tpluscode/rdf-ns-builders/loose'
import builder, { NamespaceBuilder } from '@rdfjs/namespace'
import { expect } from 'chai'
import RdfResource from '../RdfResource.js'
import { Constructor, namespace, property } from '../index.js'
import environment from './_helpers/environment.js'

describe('decorator', () => {
  describe('namespace', () => {
    it('sets namespace property from builder', () => {
      // given
      @namespace(foaf)
      class WithNamespace extends RdfResource {
      }

      // when
      const ns = WithNamespace.__ns!()

      // then
      expect(ns.value).to.eq(foaf('').value)
    })

    it('works with typed namespace builder', () => {
      // given
      const foobar: NamespaceBuilder<'foo' | 'bar'> = builder('http://example.com/')
      @namespace(foobar)
      class WithNamespace extends RdfResource {
      }

      // when
      const ns = WithNamespace.__ns!()

      // then
      expect(ns.value).to.eq('http://example.com/')
    })

    describe('used on mixins', () => {
      function SchemaMixin<Base extends Constructor>(base: Base) {
        @namespace(schema)
        class Schema extends base {
          @property.literal()
          public name!: string
        }

        return Schema
      }

      function RdfsMixin<Base extends Constructor>(base: Base) {
        @namespace(rdfs)
        class Rdfs extends base {
          @property.literal()
          public label!: string
        }

        return Rdfs
      }

      it('applies only to owned properties', () => {
        // given
        class TwoNamespaces extends SchemaMixin(RdfsMixin(RdfResource)) {}
        const node = cf({
          dataset: $rdf.dataset(),
          term: $rdf.blankNode(),
        })
          .addOut(schema('name'), 'schema name')
          .addOut(schema('label'), 'schema label')
          .addOut(rdfs('name'), 'rdfs name')
          .addOut(rdfs('label'), 'rdfs label')

        // when
        const resource = new TwoNamespaces(node as any, environment)

        // then
        expect(resource.name).to.eq('schema name')
        expect(resource.label).to.eq('rdfs label')
      })
    })
  })
})
