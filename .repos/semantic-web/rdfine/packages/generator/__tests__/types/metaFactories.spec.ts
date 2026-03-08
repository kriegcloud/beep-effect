import cf, { AnyPointer } from 'clownface'
import $rdf from '@zazuko/env'
import { owl, rdf, rdfs, xsd } from '@tpluscode/rdf-ns-builders'
import { schema } from '@tpluscode/rdf-ns-builders/loose'
import { expect } from 'chai'
import { ex } from '../_helpers/prefix.js'
import {
  EnumerationMember,
  EnumerationType,
  ExternalResourceType,
  LiteralType,
  ResourceType,
  TermType,
} from '../../lib/types/index.js'
import * as factories from '../../lib/types/metaFactories.js'
import { coreTerms } from '../../lib/types/metaFactories.js'

describe('meta factory', () => {
  let graph: AnyPointer

  beforeEach(() => {
    graph = cf({ dataset: $rdf.dataset() })
  })

  describe('resourceTypes', () => {
    it('returns null for non-class', () => {
      // given
      const node = graph.node(ex.Type)

      // when
      const meta = factories.resourceTypes(node, {
        prefix: 'ex',
      })

      // then
      expect(meta).to.be.null
    })

    it('returns null for type which is not from a known namespace', () => {
      // given
      const node = graph.namedNode('http://foo/bar')

      // when
      const meta = factories.resourceTypes(node, {
        prefix: 'ex',
      })

      // then
      expect(meta).to.be.null
    })

    it('returns meta of term from same namespace', () => {
      // given
      const node = graph.node(ex.Hello).addOut(rdf.type, rdfs.Class)

      // when
      const meta = factories.resourceTypes(node, {
        prefix: 'ex',
      })

      // then
      expect(meta).to.deep.eq({
        type: 'Resource',
        mixinName: 'HelloMixin',
        module: './lib/Hello',
        qualifiedName: 'Ex.Hello',
        localName: 'Hello',
        term: 'Hello',
      } as ResourceType)
    })

    it('returns meta of term which is not a safe JS identifier', () => {
      // given
      const node = graph.node(ex['3DModel']).addOut(rdf.type, rdfs.Class)

      // when
      const meta = factories.resourceTypes(node, {
        prefix: 'ex',
      })

      // then
      expect(meta).to.deep.eq({
        type: 'Resource',
        mixinName: '_3DModelMixin',
        module: './lib/3DModel',
        qualifiedName: 'Ex._3DModel',
        localName: '_3DModel',
        term: '3DModel',
      } as ResourceType)
    })

    it('returns meta of term from external vocabulary', () => {
      // given
      const node = graph.node(schema.Person).addOut(rdf.type, rdfs.Class)

      // when
      const meta = factories.resourceTypes(node, {
        prefix: 'ex',
      })

      // then
      expect(meta).to.deep.eq({
        type: 'ExternalResource',
        localName: 'Person',
        mixinName: 'SchemaPersonMixin',
        exportName: 'PersonMixin',
        package: '@rdfine/schema',
        module: '@rdfine/schema/lib/Person',
        qualifiedName: 'Schema.Person',
        qualifier: 'Schema',
        qualifiedMixinName: 'Schema.PersonMixin',
      } as ExternalResourceType)
    })

    it('returns meta of term from external vocabulary where term name is not safe JS idnetifier', () => {
      // given
      const node = graph.node(schema['3DModel']).addOut(rdf.type, rdfs.Class)

      // when
      const meta = factories.resourceTypes(node, {
        prefix: 'ex',
      })

      // then
      expect(meta).to.deep.eq({
        type: 'ExternalResource',
        localName: '_3DModel',
        mixinName: 'Schema3DModelMixin',
        exportName: '_3DModelMixin',
        package: '@rdfine/schema',
        module: '@rdfine/schema/lib/3DModel',
        qualifiedName: 'Schema._3DModel',
        qualifier: 'Schema',
        qualifiedMixinName: 'Schema._3DModelMixin',
      } as ExternalResourceType)
    })
  })

  describe('overrides', () => {
    it('assumes unprefixed name to be from current namespace', () => {
      // given
      const overrides = factories.overrides({
        [ex.Type.value]: 'string',
      })

      // when
      const meta = overrides(graph.node(ex.Type))

      // then
      expect(meta).to.deep.contain({
        type: 'Literal',
        nativeName: 'string',
        nativeType: String,
      } as LiteralType)
    })

    it('creates a NamedNode term type', () => {
      // given
      const overrides = factories.overrides({
        [ex.Type.value]: 'NamedNode',
      })

      // when
      const meta = overrides(graph.node(ex.Type))

      // then
      expect(meta).to.deep.eq({
        type: 'Term',
        termType: 'NamedNode',
      } as TermType)
    })

    it('creates a string literal with self as datatype when overridden', () => {
      // given
      const overrides = factories.overrides({
        [ex.Type.value]: 'Datatype',
      })

      // when
      const meta = overrides(graph.node(ex.Type))

      // then
      expect(meta).to.deep.eq({
        type: 'Literal',
        nativeType: String,
        datatype: ex.Type,
        nativeName: 'string',
      } as LiteralType)
    })

    it('expands prefixed type name', () => {
      // given
      const overrides = factories.overrides({
        [schema.foo.value]: 'NamedNode',
      })

      // when
      const meta = overrides(graph.node(schema.foo))

      // then
      expect(meta).to.deep.eq({
        type: 'Term',
        termType: 'NamedNode',
      } as TermType)
    })
  })

  describe('datatypes', () => {
    it('returns null for something unexpected', () => {
      // when
      const meta = factories.datatypes(graph.node(ex.foo))

      // then
      expect(meta).to.be.null
    })

    it('returns an object for xsd:int', () => {
      // when
      const meta = factories.datatypes(graph.node(xsd.int))

      // then
      expect(meta).to.deep.contain({
        nativeType: Number,
        type: 'Literal',
        nativeName: 'number',
      } as LiteralType)
    })

    it('returns an object for xsd:date', () => {
      // when
      const meta = factories.datatypes(graph.node(xsd.date))

      // then
      expect(meta).to.deep.eq({
        nativeType: Date,
        type: 'Literal',
        nativeName: 'Date',
        datatype: xsd.date,
      } as LiteralType)
    })

    it('returns an object for xsd:time', () => {
      // when
      const meta = factories.datatypes(graph.node(xsd.time))

      // then
      expect(meta).to.deep.contain({
        nativeType: Date,
        type: 'Literal',
        nativeName: 'Date',
        datatype: xsd.time,
      } as LiteralType)
    })

    it('returns an object for xsd:dateTime', () => {
      // when
      const meta = factories.datatypes(graph.node(xsd.dateTime))

      // then
      expect(meta).to.deep.contain({
        nativeType: Date,
        type: 'Literal',
        nativeName: 'Date',
      } as LiteralType)
    })

    it('returns an object for xsd:boolean', () => {
      // when
      const meta = factories.datatypes(graph.node(xsd.boolean))

      // then
      expect(meta).to.contain({
        nativeType: Boolean,
        type: 'Literal',
        nativeName: 'boolean',
      } as LiteralType)
    })

    it('returns an object for typed datatype', () => {
      // when
      const meta = factories.datatypes(graph.node(ex.Foo).addOut(rdf.type, rdfs.Datatype))

      // then
      expect(meta).to.deep.eq({
        nativeType: String,
        type: 'Literal',
        nativeName: 'string',
        datatype: ex.Foo,
      } as LiteralType)
    })
  })

  describe('enumerationTypes', () => {
    it('returns null for non-class', () => {
      // given
      const node = graph.node(ex.Type)

      // when
      const meta = factories.enumerationTypes(node, {
        prefix: 'ex',
      })

      // then
      expect(meta).to.be.null
    })

    it('returns EnumerationTypes for enumeration directly declared', () => {
      // given
      const node = graph.node(ex.Enumeration)
      node.addOut(rdf.type, [schema.Enumeration, rdfs.Class])
        .addOut(rdfs.subClassOf, [schema.Enumeration])

      // when
      const meta = factories.enumerationTypes(node, {
        prefix: 'ex',
      })

      // then
      expect(meta).to.deep.eq({
        type: 'Enumeration',
        qualifiedName: 'Ex.Enumeration',
        module: './Enumeration',
        name: 'Enumeration',
      } as EnumerationType)
    })
  })

  describe('enumerationMembers', () => {
    it('returns term type when node has schema:Enumeration type', () => {
      // given
      const node = graph.node(ex.EnumerationMember)
      node.addOut(rdf.type, ex.Enumeration, enumeration => {
        enumeration.addOut(rdfs.subClassOf, schema.Enumeration)
      })

      // when
      const meta = factories.enumerationMembers(node)

      // then
      expect(meta).to.deep.eq({
        type: 'EnumerationMember',
        prefixedName: 'ex.EnumerationMember',
        termName: 'EnumerationMember',
      } as EnumerationMember)
    })
  })

  describe('coreTerms', () => {
    [
      [rdfs.Literal, 'Literal'],
      [owl.Thing, 'NamedNode'],
    ].forEach(([term, termType]) => {
      it(`generates ${termType} property for ${term}`, () => {
        // given
        const pointer = graph.namedNode(term)

        // when
        const propType = coreTerms(pointer)

        // then
        expect(propType?.termType).to.eq(termType)
      })
    })
  })
})
