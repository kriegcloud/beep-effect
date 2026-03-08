/* eslint-disable no-use-before-define */
import cf, { AnyPointer, GraphPointer } from 'clownface'
import $rdf from '@zazuko/env'
import type { NamedNode, Term, Literal } from '@rdfjs/types'
import {
  skos,
  rdf,
  schema,
  foaf,
  xsd,
  dcterms,
  rdfs,
  sh,
} from '@tpluscode/rdf-ns-builders/loose'
import chai, { expect } from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import toCanonical from 'rdf-dataset-ext/toCanonical.js'
import RdfResource, { Initializer, RdfResourceCore, ResourceNode } from '../RdfResource.js'
import { Constructor, crossBoundaries, namespace, property } from '../index.js'
import * as initialize from '../initializer.js'
import { RdfineEnvironment } from '../environment.js'
import { parse, ex } from './_helpers/index.js'
import { createEnv } from './_helpers/environment.js'

describe('RdfResource', () => {
  chai.use(jestSnapshotPlugin())
  before(() => import('../../../__tests__/helpers/matchers.js'))

  let environment: RdfineEnvironment
  beforeEach(() => {
    environment = createEnv()
  })

  describe('constructor', () => {
    it('throws when node is literal', () => {
      expect(() => {
        const node: any = cf({ dataset: $rdf.dataset() }).literal('foo')

        return new RdfResource(node, environment)
      }).to.throw()
    })

    it('throws when context represents multiple nodes', () => {
      expect(() => {
        const node: any = cf({
          dataset: $rdf.dataset(),
          term: [$rdf.blankNode(), $rdf.blankNode()],
        })

        return new RdfResource(node, environment)
      }).to.throw()
    })
  })

  describe('equals', () => {
    it('compares id term', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).namedNode('urn:foo:bar')
      const left = new RdfResource(node, environment)
      const right = new RdfResource(node, environment)

      // when
      const areEqual = left.equals(right)

      // then
      expect(areEqual).to.eq(true)
    })

    it('compares id with term value', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).namedNode('urn:foo:bar')
      const left = new RdfResource(node, environment)
      const right = $rdf.namedNode('urn:foo:bar')

      // when
      const areEqual = left.equals(right)

      // then
      expect(areEqual).to.eq(true)
    })

    it('compares id with graph pointer value', () => {
      // given
      const graph = cf({ dataset: $rdf.dataset() })
      const node = graph.namedNode('urn:foo:bar')
      const left = new RdfResource(node, environment)
      const right = graph.namedNode('urn:foo:bar')

      // when
      const areEqual = left.equals(right)

      // then
      expect(areEqual).to.eq(true)
    })

    it('returns false if other resource is falsy', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).namedNode('urn:foo:bar')
      const left = new RdfResource(node, environment)

      // when
      const areEqual = left.equals(null)

      // then
      expect(areEqual).to.eq(false)
    })

    it('returns true if "same" blank node is from from same dataset', () => {
      // given
      const dataset = $rdf.dataset()
      const foo = cf({ dataset }).blankNode('foo')
      const bar = cf({ dataset }).blankNode('foo')
      const left = new RdfResource(foo, environment)
      const right = new RdfResource(bar, environment)

      // when
      const areEqual = left.equals(right)

      // then
      expect(areEqual).to.eq(true)
    })
  })

  describe('_graphId', () => {
    it('returns the clownface context graph', () => {
      // given
      const node = cf({ dataset: $rdf.dataset(), graph: ex.graph }).blankNode()

      // when
      const res = new RdfResource(node, environment)

      // then
      expect(res._graphId.equals(ex.graph))
    })

    it('is default graph when not initialized explicitly', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()

      // when
      const res = new RdfResource(node, environment)

      // then
      expect(res._graphId.equals($rdf.defaultGraph()))
    })
  })

  describe('types', () => {
    it("returns an iterable set of resource's types", async () => {
      // given
      const dataset = await parse(`
        @prefix ex: <${ex().value}> .
        
        ex:res a ex:Type1, ex:Type2, ex:Type3, ex:Type4 .
      `)
      const node = cf({
        dataset,
      }).namedNode(ex.res)

      // when
      const tc = new RdfResource(node, environment).types

      // then
      expect([...tc.values()].map(r => r.id)).to.deep.eq(
        [ex.Type1, ex.Type2, ex.Type3, ex.Type4],
      )
    })
  })

  describe('initializeProperties', () => {
    it('skips id', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Resource extends RdfResource {
        name: string
      }
      class ResourceImpl extends RdfResource implements Resource {
        @property.literal({ path: ex.name })
          name!: string
      }

      // when
      const resource = new ResourceImpl(node, environment, {
        id: ex.Foo,
        name: 'baz',
      })

      // then
      expect(resource.name).to.eq('baz')
      expect(resource.id.termType).to.eq('BlankNode')
      expect(resource.types.size).to.eq(0)
    })

    it('allows RDF/JS literal to initialize literal properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Resource extends RdfResource {
        name: string
      }
      class ResourceImpl extends RdfResource implements Resource {
        @property.literal({ path: ex.name })
          name!: string
      }
      const initializer: Initializer<Resource> = {
        name: $rdf.literal('baz'),
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.name).to.eq('baz')
    })

    it('allows RDF/JS literal to initialize optional literal properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Resource extends RdfResource {
        name: string | undefined
      }
      class ResourceImpl extends RdfResource implements Resource {
        @property.literal({ path: ex.name })
          name!: string
      }
      const initializer: Initializer<Resource> = {
        name: $rdf.literal('baz'),
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.name).to.eq('baz')
    })

    it('allows string to initialize raw literal properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()

      interface Resource extends RdfResource {
        name: Literal
      }

      class ResourceImpl extends RdfResource implements Resource {
        @property({ path: ex.name })
          name!: Literal
      }

      const initializer: Initializer<Resource> = {
        name: 'baz',
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.name).to.deep.equal($rdf.literal('baz'))
    })

    it('allows number to initialize raw literal properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()

      interface Resource extends RdfResource {
        age: Literal
      }

      class ResourceImpl extends RdfResource implements Resource {
        @property({ path: ex.name })
          age!: Literal
      }

      const initializer: Initializer<Resource> = {
        age: 10,
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.age).to.deep.equal($rdf.literal('10', xsd.integer))
    })

    it('allows number to initialize optional raw literal properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()

      interface Resource extends RdfResource {
        age: Literal | undefined
      }

      class ResourceImpl extends RdfResource implements Resource {
        @property({ path: ex.name })
          age!: Literal
      }

      const initializer: Initializer<Resource> = {
        age: 10,
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.age).to.deep.equal($rdf.literal('10', xsd.integer))
    })

    it('allows undefined to initialize optional raw literal properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()

      interface Resource extends RdfResource {
        age: Literal | undefined
      }

      class ResourceImpl extends RdfResource implements Resource {
        @property({ path: ex.name })
          age!: Literal
      }

      const initializer: Initializer<Resource> = {
        age: undefined,
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.age).to.be.undefined
    })

    it('allows literal to initialize optional raw literal properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()

      interface Resource extends RdfResource {
        age: Literal | undefined
      }

      class ResourceImpl extends RdfResource implements Resource {
        @property({ path: ex.name })
          age!: Literal
      }

      const initializer: Initializer<Resource> = {
        age: $rdf.literal('foo'),
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.age).to.deep.equal($rdf.literal('foo'))
    })

    it('allows RDF/JS literal to initialize literal array properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Resource extends RdfResource {
        names: string[]
      }
      class ResourceImpl extends RdfResource implements Resource {
        @property.literal({ path: ex.name, values: 'array' })
          names!: string[]
      }
      const initializer: Initializer<Resource> = {
        names: [$rdf.literal('bar'), node.literal('baz')],
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.names).to.deep.eq(['bar', 'baz'])
    })

    it('allows clownface literal to initialize literal properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Resource extends RdfResource {
        name: string
      }
      class ResourceImpl extends RdfResource implements Resource {
        @property.literal({ path: ex.name })
          name!: string
      }
      const initializer: Initializer<Resource> = {
        name: node.literal('baz'),
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.name).to.eq('baz')
    })

    it('allows RDF/JS named node to initialize resource properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Resource extends RdfResource {
        other: Resource
      }
      class ResourceImpl extends RdfResource implements Resource {
        @property.resource({ path: ex.other })
          other!: Resource
      }
      const initializer: Initializer<Resource> = {
        other: $rdf.namedNode('baz'),
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.other.id).to.deep.eq($rdf.namedNode('baz'))
    })

    it('allows clownface named node to initialize named node properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Resource extends RdfResource {
        other: NamedNode
        others: NamedNode[]
      }
      class ResourceImpl extends RdfResource implements Resource {
        @property({ path: ex.other })
          other!: NamedNode

        @property({ path: ex.others, values: 'array' })
          others!: NamedNode[]
      }
      const initializer: Initializer<Resource> = {
        other: node.namedNode('bar'),
        others: [node.namedNode('baz')],
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.other).to.deep.eq($rdf.namedNode('bar'))
      expect(resource.others).to.deep.eq(
        [$rdf.namedNode('baz')],
      )
    })

    it('allows clownface node to initialize term properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Resource extends RdfResource {
        other: Term
        others: Term[]
      }
      class ResourceImpl extends RdfResource implements Resource {
        @property({ path: ex.other, values: 'array' })
          other!: Term

        @property({ path: ex.others, values: 'array' })
          others!: Term[]
      }
      const initializer: Initializer<Resource> = {
        other: node.blankNode(),
        others: [
          node.blankNode(),
          $rdf.literal('foo'),
          $rdf.namedNode('bar'),
          node.namedNode('baz'),
        ],
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.others).to.containSubset(
        [
          { termType: 'BlankNode' },
          $rdf.literal('foo'),
          $rdf.namedNode('bar'),
          $rdf.namedNode('baz'),
        ],
      )
    })

    it('allows RDF/JS blank node to initialize resource properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Resource extends RdfResource {
        other: Resource
      }
      class ResourceImpl extends RdfResource implements Resource {
        @property.resource({ path: ex.other })
          other!: Resource
      }
      const initializer: Initializer<Resource> = {
        other: $rdf.blankNode(),
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.other.id.termType).to.eq('BlankNode')
    })

    it('allows RDF/JS nodes to initialize array resource properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Resource extends RdfResource {
        others: Resource[]
      }
      class ResourceImpl extends RdfResource implements Resource {
        @property.resource({ path: ex.other, values: 'array' })
          others!: Resource[]
      }
      const initializer: Initializer<Resource> = {
        others: [
          $rdf.blankNode(),
          $rdf.namedNode('bar'),
          node.blankNode(),
          node.namedNode('baz'),
        ],
      }

      // when
      const resource = new ResourceImpl(node, environment, initializer)

      // then
      expect(resource.others.map(o => o.id)).to.containSubset(
        [
          { termType: 'BlankNode' },
          $rdf.namedNode('bar'),
          { termType: 'BlankNode' },
          $rdf.namedNode('baz'),
        ],
      )
    })

    it('add additional types', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Resource extends RdfResource {
        name: string
      }
      class ResourceImpl extends RdfResource implements Resource {
        name!: string
      }

      // when
      const resource = new ResourceImpl(node, environment, {
        types: [ex.Bar],
      })

      // then
      expect(resource.types.size).to.eq(1)
      expect([...resource.types][0].id.value).to.eq(ex.Bar.value)
    })

    it('allows arbitrary string as RDF property', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()

      // when
      const resource = new RdfResource(node, environment, {
        [skos.prefLabel.value]: 'Foo',
        [skos.broader.value]: {
          [skos.prefLabel.value]: 'Bar',
        },
      })

      // then
      expect(resource.getString(skos.prefLabel)).to.eq('Foo')
      expect(resource.get(skos.broader)!.getString(skos.prefLabel)).to.eq(
        'Bar',
      )
    })

    it('allows arbitrary string as RDF property using typed initializer', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      class Concept extends RdfResource {
        @property.literal({ path: skos.prefLabel })
          prefLabel!: string

        // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
        constructor(pointer: ResourceNode, init: Initializer<Concept>) {
          super(pointer, environment, init)
        }
      }

      // when
      const resource = new Concept(node, {
        [skos.prefLabel.value]: 'Foo',
      })

      // then
      expect(resource.prefLabel).to.eq('Foo')
    })

    it('initializes annotated property with nested array of resources which use http properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      class SkosResource extends RdfResource {
        @property.resource({ path: skos.broader, values: 'array' })
          broader!: SkosResource[]
      }

      // when
      const resource = new SkosResource(node, environment, {
        broader: [
          {
            [skos.prefLabel.value]: 'Bar',
          },
        ],
      })

      // then
      expect(resource.broader[0].getString(skos.prefLabel)).to.eq('Bar')
    })

    it('initializes T|T[] property with IRI', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      class SkosResource extends RdfResource {
        @property.resource({ path: skos.broader, values: 'array' })
          broader!: SkosResource[] | SkosResource
      }

      // when
      const resource = new SkosResource(node, environment, {
        broader: ex.Foo,
      })

      // then
      expect(toCanonical(resource.pointer.dataset)).to.matchSnapshot()
    })

    it('initializes annotated property with a resource using http properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      class SkosResource extends RdfResource {
        @property.resource({ path: skos.broader })
          broader!: SkosResource
      }

      // when
      const resource = new SkosResource(node, environment, {
        broader: {
          [skos.prefLabel.value]: 'Bar',
        },
      })

      // then
      expect(resource.broader.getString(skos.prefLabel)).to.eq('Bar')
    })

    it('initializes nested array resources which use http properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()

      // when
      const resource = new RdfResource(node, environment, {
        [skos.broader.value]: [
          {
            [skos.prefLabel.value]: 'Bar',
          },
        ],
      })

      // then
      expect(resource.get(skos.broader)!.getString(skos.prefLabel)).to.eq(
        'Bar',
      )
    })

    it('assigns id to nested resource assigned to arbitrary URI', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()

      // when
      const resource = new RdfResource(node, environment, {
        [skos.prefLabel.value]: 'Foo',
        [skos.broader.value]: {
          id: ex.Bar,
        },
      })

      // then
      expect(resource.getString(skos.prefLabel)).to.eq('Foo')
      expect(resource.get(skos.broader)!.id.value).to.eq(ex.Bar.value)
    })

    it('assigns named node to arbitrary URI property', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()

      // when
      const resource = new RdfResource(node, environment, {
        [skos.broader.value]: ex.Bar,
      })

      // then
      expect(resource.get(skos.broader)!.id.value).to.eq(ex.Bar.value)
    })

    it('assigns literal node to arbitrary URI property', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()

      // when
      const resource = new RdfResource(node, environment, {
        [skos.prefLabel.value]: $rdf.literal('Foo', 'en'),
      })

      // then
      expect(toCanonical(resource.pointer.dataset)).toMatchSnapshot()
    })

    it('can initialize child resource with object decomposition', () => {
      // given
      class Child extends RdfResource {
        @property.literal({ path: ex.foo })
          foo?: string

        @property.literal({ path: ex.bar })
          bar?: string
      }
      class Decomposed extends RdfResource {
        @property.resource({ path: ex.child, as: [Child] })
          child?: Decomposed
      }
      const child = new Child(cf({ dataset: $rdf.dataset() }).blankNode(), environment, {
        foo: 'foo',
        bar: 'bar',
      })

      // when
      const resource = new Decomposed(
        cf({ dataset: $rdf.dataset() }).blankNode(),
        environment,
        {
          child: {
            ...child.toJSON(),
            types: [ex.Copy],
          },
        },
      )

      // then
      expect(toCanonical(resource.pointer.dataset)).toMatchSnapshot()
    })

    it('can initialize child resource with string blank node id', () => {
      // given
      class Resource extends RdfResource {
        @property.resource({ path: ex.foo })
          foo!: RdfResource
      }

      // when
      const resource = new Resource(
        cf({ dataset: $rdf.dataset() }).blankNode(),
        environment,
        {
          foo: {
            id: '_:blank-one',
          },
          [ex.bar.value]: {
            id: '_:blank-two',
          },
        },
      )

      // then
      expect(toCanonical(resource.pointer.dataset)).toMatchSnapshot()
    })

    it('can initialize child resource with string named node id', () => {
      // given
      class Resource extends RdfResource {
        @property.resource({ path: ex.foo })
          foo!: RdfResource
      }

      // when
      const resource = new Resource(
        cf({ dataset: $rdf.dataset() }).blankNode(),
        environment,
        {
          foo: {
            id: ex.Child.value,
          },
          [ex.bar.value]: {
            id: ex.Child.value,
          },
        },
      )

      // then
      expect(toCanonical(resource.pointer.dataset)).toMatchSnapshot()
    })

    it('uses implicitTypes of annotated properties to initialize child resources', () => {
      // given
      class Resource extends RdfResource {
        @property.resource({ path: ex.foo, implicitTypes: [ex.Foo, ex.Bar] })
          foo!: RdfResource
      }

      // when
      const resource = new Resource(
        cf({ dataset: $rdf.dataset() }).blankNode(),
        environment,
        {
          foo: {
            [rdfs.label.value]: 'foo',
          },
        },
      )

      // then
      expect(toCanonical(resource.pointer.dataset)).toMatchSnapshot()
    })

    const nativeSetters: [string, any, Literal][] = [
      ['Date', new Date(Date.UTC(2000, 5, 6, 10, 56, 40)), $rdf.literal('2000-06-06T10:56:40.000Z', xsd.dateTime)],
      ['integer', 5, $rdf.literal('5', xsd.integer)],
      ['decimal', 4.5, $rdf.literal('4.5', xsd.float)],
      ['boolean', true, $rdf.literal('true', xsd.boolean)],
    ]

    describe('setting built-in types', () => {
      for (const [name, value, term] of nativeSetters) {
        it(`initializes from native ${name} value`, () => {
        // when
          const resource = new RdfResource(cf({ dataset: $rdf.dataset() }).blankNode(), environment, {
            [ex.prop.value]: value,
          })

          // then
          expect(resource.pointer.out(ex.prop).term?.value).to.eq(term.value)
          expect(resource.pointer.out(ex.prop).term).to.have.property('datatype').deep.eq(term.datatype)
        })

        it(`initializes annotated term property from native ${name} value`, () => {
        // given
          interface Person extends RdfResourceCore {
            prop?: Literal
          }
          function PersonMixin<Base extends Constructor>(Resource: Base) {
            class PersonImpl extends Resource implements Person {
              @property({ path: ex.prop })
                prop?: Literal
            }

            return PersonImpl
          }
          PersonMixin.appliesTo = schema.Person
          environment.rdfine().factory.addMixin(PersonMixin)

          // when
          const node = cf({ dataset: $rdf.dataset() }).blankNode()
          const resource = environment.rdfine().factory.createEntity(node, [PersonMixin], {
            initializer: {
              prop: value,
            },
          })

          // then
          expect(resource.pointer.out(ex.prop).term?.value).to.eq(term.value)
          expect(resource.pointer.out(ex.prop).term).to.have.property('datatype').deep.eq(term.datatype)
        })
      }
    })

    it('initializes nested resources using mixin property names', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Concept extends RdfResourceCore {
        prefLabel: string
      }
      function ConceptMixin<Base extends Constructor>(Resource: Base) {
        class ConceptImpl extends Resource implements Concept {
          @property.literal({ path: skos.prefLabel })
            prefLabel!: string
        }

        return ConceptImpl
      }
      ConceptMixin.appliesTo = skos.Concept
      environment.rdfine().factory.addMixin(ConceptMixin)

      // when
      const resource = environment.rdfine().factory.createEntity(node, [], {
        initializer: {
          [skos.hasTopConcept.value]: {
            types: [skos.Concept],
            prefLabel: 'Foo',
          },
        },
      })

      // then
      expect(resource.get<Concept>(skos.hasTopConcept)?.prefLabel).to.eq('Foo')
    })

    it('initialized mixed property as list when given array', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Concept extends RdfResourceCore {
        prefLabel: string | string[]
      }
      function ConceptMixin<Base extends Constructor>(Resource: Base) {
        class ConceptImpl extends Resource implements Concept {
          @property.literal({ path: skos.prefLabel, values: ['list', 'single'] })
            prefLabel!: string | string[]
        }

        return ConceptImpl
      }
      ConceptMixin.appliesTo = skos.Concept
      environment.rdfine().factory.addMixin(ConceptMixin)

      // when
      const resource = environment.rdfine().factory.createEntity(node, [], {
        initializer: {
          prefLabel: ['Foo', 'Bar'],
        },
      })

      // then
      expect(resource.prefLabel).to.contain.all.members(['Foo', 'Bar'])
    })

    it('initialized list from resource initializers', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Shape extends RdfResourceCore {
        in: Term[]
      }
      function ShapeMixin<Base extends Constructor>(Resource: Base) {
        class ShapeImpl extends Resource implements Shape {
          @property({ path: sh.in, values: 'list' })
            in!: Term[]
        }

        return ShapeImpl
      }
      ShapeMixin.appliesTo = sh.Shape
      environment.rdfine().factory.addMixin(ShapeMixin)

      // when
      const resource = environment.rdfine().factory.createEntity<Shape>(node, [], {
        initializer: {
          types: [sh.Shape],
          in: [{
            id: ex.foo,
          }, {
            id: ex.bar,
          }],
        },
      })

      // then
      expect(resource.in).to.deep.eq(
        [ex.foo, ex.bar],
      )
    })

    it('initializes ad-hoc list using helper', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Shape extends RdfResourceCore {
        in: Term[]
      }
      function ShapeMixin<Base extends Constructor>(Resource: Base) {
        class ShapeImpl extends Resource implements Shape {
          @property({ path: sh.in, values: 'list' })
            in!: Term[]
        }

        return ShapeImpl
      }

      // when
      const resource = environment.rdfine().factory.createEntity(node, [ShapeMixin], {
        initializer: {
          [sh.in.value]: initialize.rdfList(ex.foo, ex.bar),
        },
      })

      // then
      expect(resource.in).to.deep.eq(
        [ex.foo, ex.bar],
      )
    })

    it('initializes empty ad-hoc list using helper', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode()
      interface Shape extends RdfResourceCore {
        in: Term[]
      }
      function ShapeMixin<Base extends Constructor>(Resource: Base) {
        class ShapeImpl extends Resource implements Shape {
          @property({ path: sh.in, values: 'list' })
            in!: Term[]
        }

        return ShapeImpl
      }

      // when
      const resource = environment.rdfine().factory.createEntity(node, [ShapeMixin], {
        initializer: {
          [sh.in.value]: initialize.rdfList(),
        },
      })

      // then
      expect(resource.in).to.deep.eq([])
    })

    describe('with curried factory', () => {
      it('blank node initializing Term property', () => {
        // given
        const node = cf({ dataset: $rdf.dataset() }).blankNode()
        interface TestResource extends RdfResourceCore {
          child?: Term
        }
        function TestMixin<Base extends Constructor>(Resource: Base) {
          class Impl extends Resource implements TestResource {
            @property({ path: ex.child })
              child!: Term
          }

          return Impl
        }
        TestMixin.shouldApply = true
        environment.rdfine().factory.addMixin(TestMixin)

        // when
        const resource = environment.rdfine().factory.createEntity<TestResource>(node, [TestMixin], {
          initializer: {
            child: (graph) => environment.rdfine().factory.createEntity(graph.blankNode('foo')),
          },
        })

        // then
        expect(resource.child).to.deep.eq($rdf.blankNode('foo'))
      })

      it('named node initializing URI property', () => {
        // given
        const node = cf({ dataset: $rdf.dataset() }).blankNode()

        // when
        const resource = environment.rdfine().factory.createEntity(node, [], {
          initializer: {
            [ex.foo.value]: (graph: AnyPointer) => graph.namedNode('foo'),
          },
        })

        // then
        expect(resource.pointer.out(ex.foo).term).to.deep.eq($rdf.namedNode('foo'))
      })
    })
  })

  describe('isAnonymous', () => {
    it('true for blank node', () => {
      // given
      const node = cf({ dataset: $rdf.dataset(), graph: ex.graph }).blankNode()

      // when
      const res = new RdfResource(node, environment)

      // then
      expect(res.isAnonymous).to.eq(true)
    })

    it('false for named node', () => {
      // given
      const node = cf({ dataset: $rdf.dataset(), graph: ex.graph }).namedNode(
        ex.foo,
      )

      // when
      const res = new RdfResource(node, environment)

      // then
      expect(res.isAnonymous).to.eq(false)
    })
  })

  describe('getters', () => {
    let graph: AnyPointer

    beforeEach(() => {
      graph = cf({ dataset: $rdf.dataset() })
    })

    describe('get', () => {
      it('returns object resource', () => {
        // given
        const node = graph.blankNode()
        node.addOut(ex.foo, ex.bar)
        const resource = new RdfResource(node, environment)

        // when
        const object = resource.get(ex.foo)

        // then
        expect(object).to.be.instanceOf(RdfResource)
        expect(object?.id.value).to.eq(ex.bar.value)
      })

      it('throws when property has no value and calling strict', () => {
        // given
        const node = graph.blankNode()
        const resource = new RdfResource(node, environment)

        // then
        expect(() => {
          // when
          return resource.get(ex.foo, { strict: true })
        }).to.throw()
      })

      it('returns null when property has no value and calling not strict', () => {
        // given
        const node = graph.blankNode()
        const resource = new RdfResource(node, environment)

        // when
        const object = resource.get(ex.foo, { strict: false })

        // then
        expect(object).to.be.null
      })
    })

    describe('getArray', () => {
      it('returns empty array when property has no value and calling not strict', () => {
        // given
        const node = graph.blankNode()
        const resource = new RdfResource(node, environment)

        // when
        const object = resource.getArray(ex.foo, { strict: false })

        // then
        expect(object.length).to.eq(0)
      })

      it('skips literals', () => {
        // given
        const node = graph.blankNode()
        node.addOut(ex.foo, graph.literal('bar'))
        const resource = new RdfResource(node, environment)

        // when
        const object = resource.getArray(ex.foo, { strict: false })

        // then
        expect(object.length).to.eq(0)
      })
    })

    describe('getBoolean', () => {
      it('throws when value is not boolean', () => {
        const node = graph.blankNode()
        node.addOut(ex.foo, ex.bar)
        const resource = new RdfResource(node, environment)

        // then
        expect(() => resource.getBoolean(ex.foo)).to.throw()
      })

      it('return false when value is undefined', () => {
        const node = graph.blankNode()
        const resource = new RdfResource(node, environment)

        // then
        expect(resource.getBoolean(ex.foo)).not.to.be.ok
      })

      it('return the value when it is set', () => {
        const node = graph.blankNode()
        node.addOut(ex.foo, true)
        const resource = new RdfResource(node, environment)

        // then
        expect(resource.getBoolean(ex.foo)).to.be.ok
      })
    })

    describe('getNumber', () => {
      it('throws when value is not number', () => {
        const node = graph.blankNode()
        node.addOut(ex.foo, ex.bar)
        const resource = new RdfResource(node, environment)

        // then
        expect(() => resource.getNumber(ex.foo)).to.throw()
      })

      it('return null when value is undefined', () => {
        const node = graph.blankNode()
        const resource = new RdfResource(node, environment)

        // then
        expect(resource.getNumber('foo')).to.be.null
      })

      it('parses the literal', () => {
        const node = graph.blankNode()
        node.addOut(ex.foo, node.literal(10.5))
        const resource = new RdfResource(node, environment)

        // then
        expect(resource.getNumber(ex.foo)).to.eq(10.5)
      })
    })

    describe('getString', () => {
      it('returns string value of literal', () => {
        const node = graph.blankNode()
        node.addOut(ex.foo, 123)
        const resource = new RdfResource(node, environment)

        // then
        expect(resource.getString(ex.foo)).to.eq('123')
      })

      it('return null when value is undefined', () => {
        const node = graph.blankNode()
        const resource = new RdfResource(node, environment)

        // then
        expect(resource.getString(ex.foo)).to.be.null
      })
    })
  })

  describe('toJSON', () => {
    it("sets blank node id property as '@id'", () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).blankNode('john')
      const resource = new RdfResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json.id).to.eq('_:john')
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "type": "@type",
          },
          "id": "_:john",
        }
      `)
    })

    it("sets named node id property as '@id'", () => {
      // given
      const node = cf({ dataset: $rdf.dataset() }).namedNode('foo')
      const resource = new RdfResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json.id).to.eq('foo')
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "type": "@type",
          },
          "id": "foo",
        }
      `)
    })

    it("sets types as '@type'", () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .blankNode('john')
        .addOut(rdf.type, schema.Person)
        .addOut(rdf.type, foaf.Person)
      const resource = new RdfResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json.type).to.deep.contain.all.members(
        [foaf.Person.value, schema.Person.value],
      )
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "type": "@type",
          },
          "id": "_:john",
          "type": Array [
            "http://schema.org/Person",
            "http://xmlns.com/foaf/0.1/Person",
          ],
        }
      `)
    })

    it("set known string properties as json keys and adds them to '@context'", () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addOut(schema.givenName, 'John')
        .addOut(schema.familyName, 'Doe')
      class TestResource extends RdfResource {
        @property.literal({ path: schema.givenName })
          name!: string

        @property.literal({ path: schema.familyName })
          lastName!: string
      }
      const resource = new TestResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json.name).to.eq('John')
      expect(json['@context'].name).to.eq(schema.givenName.value)
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "lastName": "http://schema.org/familyName",
            "name": "http://schema.org/givenName",
            "type": "@type",
          },
          "id": "john",
          "lastName": "Doe",
          "name": "John",
        }
      `)
    })

    it('serializes property correctly when @namespace decorator is used', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addOut(schema.givenName, 'John')
        .addOut(schema.familyName, 'Doe')
      @namespace(schema)
      class TestResource extends RdfResource {
        @property.literal()
          givenName!: string

        @property.literal()
          familyName!: string
      }
      const resource = new TestResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json.givenName).to.eq('John')
      expect(json['@context'].givenName).to.eq(schema.givenName.value)
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "familyName": "http://schema.org/familyName",
            "givenName": "http://schema.org/givenName",
            "id": "@id",
            "type": "@type",
          },
          "familyName": "Doe",
          "givenName": "John",
          "id": "john",
        }
      `)
    })

    it('set extra literal properties as json values with full property URL', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addOut(schema.givenName, 'John')
        .addOut(schema.familyName, 'Doe')
        .addOut(schema.age, 22)
        .addOut(schema.contentSize, 22.5)
        .addOut(
          schema.datePublished,
          $rdf.literal('2023-05-07T20:00:30', xsd.dateTime),
        )
        .addOut(schema.isLiveBroadcast, true)
        .addOut(schema.name, $rdf.literal('foo', 'en'))
      class TestResource extends RdfResource {
        @property.literal({ path: schema.givenName })
          name!: string
      }
      const resource = new TestResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(
        `
        Object {
          "@context": Object {
            "id": "@id",
            "name": "http://schema.org/givenName",
            "type": "@type",
          },
          "http://schema.org/age": 22,
          "http://schema.org/contentSize": 22.5,
          "http://schema.org/datePublished": Object {
            "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
            "@value": "2023-05-07T20:00:30",
          },
          "http://schema.org/familyName": "Doe",
          "http://schema.org/isLiveBroadcast": true,
          "http://schema.org/name": Object {
            "@language": "en",
            "@value": "foo",
          },
          "id": "john",
          "name": "John",
        }
      `,
      )
    })

    it('set extra literal properties with multiple values', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addOut(schema.name, $rdf.literal('foo', 'en'))
        .addOut(schema.name, $rdf.literal('bar', 'de'))
      const resource = new RdfResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "type": "@type",
          },
          "http://schema.org/name": Array [
            Object {
              "@language": "en",
              "@value": "foo",
            },
            Object {
              "@language": "de",
              "@value": "bar",
            },
          ],
          "id": "john",
        }
      `)
    })

    it('set extra named node properties', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addOut(schema.knows, $rdf.namedNode('jane'))
      node.namedNode('jane').addOut(schema.name, 'jane')
      const resource = new RdfResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "type": "@type",
          },
          "http://schema.org/knows": Object {
            "http://schema.org/name": "jane",
            "id": "jane",
          },
          "id": "john",
        }
      `)
    })

    it('set extra named node properties with multiple values', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addOut(schema.knows, $rdf.namedNode('jane'))
        .addOut(schema.knows, $rdf.namedNode('jenny'))
      node.namedNode('jane').addOut(schema.name, 'jane')
      node.namedNode('jenny').addOut(schema.name, 'jenny')
      const resource = new RdfResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "type": "@type",
          },
          "http://schema.org/knows": Array [
            Object {
              "http://schema.org/name": "jane",
              "id": "jane",
            },
            Object {
              "http://schema.org/name": "jenny",
              "id": "jenny",
            },
          ],
          "id": "john",
        }
      `)
    })

    it('maps various literals', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('test')
        .addOut(schema.age, 22)
        .addOut(schema.contentSize, 22.5)
        .addOut(
          schema.datePublished,
          $rdf.literal('2023-05-07T20:00:30', xsd.dateTime),
        )
        .addOut(schema.isLiveBroadcast, true)
        .addOut(schema.isAccessibleForFree, false)
        .addOut(schema.contentUrl, 'http://example.com/foo')
        .addOut(schema.name, $rdf.literal('foo', 'en'))
      class TestResource extends RdfResource {
        @property.literal({ path: schema.age, type: Number })
          age!: number

        @property.literal({ path: schema.contentSize, type: Number })
          contentSize!: number

        @property.literal({ path: schema.datePublished, type: Date })
          datePublished!: Date

        @property.literal({ path: schema.isLiveBroadcast, type: Boolean })
          isLiveBroadcast!: boolean

        @property.literal({ path: schema.isAccessibleForFree, type: Boolean })
          isAccessibleForFree!: boolean

        @property.literal({ path: schema.contentUrl, datatype: xsd.anyURI })
          contentUrl!: string

        @property.literal({ path: schema.name })
          name!: string
      }
      const resource = new TestResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json.age).to.eq(22)
      expect(json.contentSize).to.eq(22.5)
      expect(json.isLiveBroadcast).to.eq(true)
      expect(json.isAccessibleForFree).to.eq(false)
      expect(json.contentUrl).to.eq('http://example.com/foo')
      expect(json).toMatchInlineSnapshot(
        `
        Object {
          "@context": Object {
            "age": "http://schema.org/age",
            "contentSize": "http://schema.org/contentSize",
            "contentUrl": "http://schema.org/contentUrl",
            "datePublished": "http://schema.org/datePublished",
            "id": "@id",
            "isAccessibleForFree": "http://schema.org/isAccessibleForFree",
            "isLiveBroadcast": "http://schema.org/isLiveBroadcast",
            "name": "http://schema.org/name",
            "type": "@type",
          },
          "age": 22,
          "contentSize": 22.5,
          "contentUrl": "http://example.com/foo",
          "datePublished": Object {
            "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
            "@value": "2023-05-07T20:00:30",
          },
          "id": "test",
          "isAccessibleForFree": false,
          "isLiveBroadcast": true,
          "name": Object {
            "@language": "en",
            "@value": "foo",
          },
        }
      `,
      )
    })

    it('serializes literal without datatype as xsd:string', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('test')
        .addOut(schema.name, {
          value: 'John Doe',
          termType: 'Literal',
          equals(other: Literal) {
            return other.equals(this)
          },
        } as Literal)
      class TestResource extends RdfResource {
        @property.literal({ path: schema.name })
          name!: string
      }
      const resource = new TestResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json.name).to.eq('John Doe')
    })

    it('maps arrays of literals', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('test')
        .addOut(schema.alternateName, 'Foo')
        .addOut(schema.alternateName, $rdf.literal('Bar', 'de'))
        .addOut(schema.alternateName, $rdf.literal('Baz', 'fr'))
      class TestResource extends RdfResource {
        @property.literal({ path: schema.alternateName })
          alternateNames!: string[]
      }
      const resource = new TestResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json.alternateNames).to.have.length(3)
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "alternateNames": "http://schema.org/alternateName",
            "id": "@id",
            "type": "@type",
          },
          "alternateNames": Array [
            "Foo",
            Object {
              "@language": "de",
              "@value": "Bar",
            },
            Object {
              "@language": "fr",
              "@value": "Baz",
            },
          ],
          "id": "test",
        }
      `)
    })

    it('sets child resource as jsonified', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addOut(schema.knows, $rdf.namedNode('jane'), jane => {
          jane.addOut(schema.givenName, 'Jane')
        })
      function PersonMixin<Base extends Constructor>(base: Base) {
        class TestPerson extends base {
          @property.literal({ path: schema.givenName })
            name!: string

          @property.resource({ path: schema.knows, as: [PersonMixin] })
            knows!: TestPerson
        }
        return TestPerson
      }
      const resource = new (PersonMixin(RdfResource))(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json.knows?.name).to.eq('Jane')
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "knows": "http://schema.org/knows",
            "type": "@type",
          },
          "id": "john",
          "knows": Object {
            "@context": Object {
              "name": "http://schema.org/givenName",
            },
            "id": "jane",
            "name": "Jane",
          },
        }
      `)
    })

    it("only outputs '@id' of cycled resource", () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addOut(schema.givenName, 'John')
        .addOut(schema.knows, $rdf.namedNode('jane'), jane => {
          jane.addOut(schema.knows, $rdf.namedNode('john'))
        })
      function PersonMixin<Base extends Constructor>(base: Base) {
        class TestPerson extends base {
          @property.resource({ path: schema.givenName, as: [PersonMixin] })
            name!: TestPerson

          @property.resource({ path: schema.knows, as: [PersonMixin] })
            knows!: TestPerson
        }
        return TestPerson
      }
      const resource = new (PersonMixin(RdfResource))(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json.knows?.knows?.id).to.eq('john')
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "knows": "http://schema.org/knows",
            "name": "http://schema.org/givenName",
            "type": "@type",
          },
          "id": "john",
          "knows": Object {
            "id": "jane",
            "knows": Object {
              "id": "john",
            },
          },
          "name": "John",
        }
      `)
    })

    it('sets array of child resource as jsonified', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addOut(
          schema.knows,
          [$rdf.namedNode('jane'), $rdf.namedNode('jenny')],
          friends => {
            friends.forEach((friend: GraphPointer) =>
              friend.addOut(schema.givenName, friend.value),
            )
          },
        )
      function PersonMixin<Base extends Constructor>(base: Base) {
        class TestPerson extends base {
          @property.literal({ path: schema.givenName })
            name!: string

          @property.resource({
            path: schema.knows,
            as: [PersonMixin],
            values: 'array',
          })
            knows!: TestPerson[]
        }
        return TestPerson
      }
      const resource = new (PersonMixin(RdfResource))(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json.knows![0].name).to.eq('jane')
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "knows": "http://schema.org/knows",
            "type": "@type",
          },
          "id": "john",
          "knows": Array [
            Object {
              "@context": Object {
                "name": "http://schema.org/givenName",
              },
              "id": "jane",
              "name": "jane",
            },
            Object {
              "@context": Object {
                "name": "http://schema.org/givenName",
              },
              "id": "jenny",
              "name": "jenny",
            },
          ],
        }
      `)
    })

    it('sets RDF list of child resource as jsonified array and adds appropriate context', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addList(schema.knows, [$rdf.namedNode('jane'), $rdf.namedNode('jenny')])
      node.namedNode('jane').addOut(schema.givenName, 'jane')
      node.namedNode('jenny').addOut(schema.givenName, 'jenny')
      function PersonMixin<Base extends Constructor>(base: Base) {
        class TestPerson extends base {
          @property.literal({ path: schema.givenName })
            name!: string

          @property.resource({
            path: schema.knows,
            as: [PersonMixin],
            values: 'list',
          })
            knows!: TestPerson[]
        }
        return TestPerson
      }
      const resource = new (PersonMixin(RdfResource))(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json.knows![0].name).to.eq('jane')
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "knows": Object {
              "@container": "@list",
              "@id": "http://schema.org/knows",
            },
            "type": "@type",
          },
          "id": "john",
          "knows": Array [
            Object {
              "@context": Object {
                "name": "http://schema.org/givenName",
              },
              "id": "jane",
              "name": "jane",
            },
            Object {
              "@context": Object {
                "name": "http://schema.org/givenName",
              },
              "id": "jenny",
              "name": "jenny",
            },
          ],
        }
      `)
    })

    it('does not repeat same property in child resource context', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addOut(schema.givenName, 'John')
        .addOut(schema.knows, $rdf.namedNode('jane'), jane => {
          jane.addOut(schema.givenName, 'Jane')
        })
      function PersonMixin<Base extends Constructor>(base: Base) {
        class TestPerson extends base {
          @property.literal({ path: schema.givenName })
            name!: string

          @property.resource({ path: schema.knows, as: [PersonMixin] })
            knows!: TestPerson
        }
        return TestPerson
      }
      const resource = new (PersonMixin(RdfResource))(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "knows": "http://schema.org/knows",
            "name": "http://schema.org/givenName",
            "type": "@type",
          },
          "id": "john",
          "knows": Object {
            "id": "jane",
            "name": "Jane",
          },
          "name": "John",
        }
      `)
    })

    it('adds a child context property if it is mapped to a different predicate', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('article')
        .addOut(dcterms.title, 'Using alcaeus')
        .addOut(dcterms.creator, $rdf.namedNode('john'), john => {
          john.addOut(schema.givenName, 'John')
        })
      function PersonMixin<Base extends Constructor>(base: Base) {
        class TestPerson extends base {
          @property.literal({ path: schema.givenName })
            name!: string
        }
        return TestPerson
      }
      class TestResource extends RdfResource {
        @property({ path: dcterms.title })
          name!: string

        @property.resource({ path: dcterms.creator, as: [PersonMixin] })
          creator!: RdfResource
      }
      const resource = new TestResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "creator": "http://purl.org/dc/terms/creator",
            "id": "@id",
            "name": "http://purl.org/dc/terms/title",
            "type": "@type",
          },
          "creator": Object {
            "@context": Object {
              "name": "http://schema.org/givenName",
            },
            "id": "john",
            "name": "John",
          },
          "id": "article",
          "name": "Using alcaeus",
        }
      `)
    })

    it('ignore annotated properties with path not being a single predicate', () => {
      // given
      const node = cf({ dataset: $rdf.dataset() })
        .namedNode('john')
        .addOut(schema.knows, $rdf.namedNode('jane'), jane => {
          jane.addOut(schema.givenName, 'Jane')
        })
      class TestPerson extends RdfResource {
        @property.literal({ path: [schema.knows, schema.givenName] })
          friendsName!: string

        @property.resource({ path: schema.knows, subjectFromAllGraphs: true })
          allFriendsFromAnywhere!: RdfResource

        @property.resource({ path: crossBoundaries(schema.knows) })
          allFriends!: RdfResource
      }
      const resource = new TestPerson(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "type": "@type",
          },
          "http://schema.org/knows": Object {
            "http://schema.org/givenName": "Jane",
            "id": "jane",
          },
          "id": "john",
        }
      `)
    })

    it('only serializes properties from same graph', () => {
      // given
      const dataset = $rdf.dataset()
      const node = cf({ dataset, graph: $rdf.namedNode('john') })
        .namedNode('john')
        .addOut(schema.givenName, 'John')
      cf({ dataset, graph: $rdf.namedNode('also-john') })
        .namedNode('john')
        .addOut(schema.givenName, 'Other name')
      class TestPerson extends RdfResource {
        @property.literal({ path: schema.givenName })
          name!: string
      }
      const resource = new TestPerson(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "name": "http://schema.org/givenName",
            "type": "@type",
          },
          "id": "john",
          "name": "John",
        }
      `)
    })

    it('only serializes undecorated properties from same graph', () => {
      // given
      const dataset = $rdf.dataset()
      const node = cf({ dataset, graph: $rdf.namedNode('john') })
        .namedNode('john')
        .addOut(schema.givenName, 'John')
      cf({ dataset, graph: $rdf.namedNode('also-john') })
        .namedNode('john')
        .addOut(schema.givenName, 'Other name')
      const resource = new RdfResource(node, environment)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "type": "@type",
          },
          "http://schema.org/givenName": "John",
          "id": "john",
        }
      `)
    })

    it('uses property names for @namespace annotated mixin classes', () => {
      // given
      const dataset = $rdf.dataset()
      const node = cf({ dataset })
        .namedNode('john')
        .addOut(foaf.name, 'John')
        .addOut(schema.age, 48)
      function NameMixin<Base extends Constructor>(base: Base) {
        @namespace(foaf)
        class NameClass extends base {
          @property.literal()
            name!: string
        }

        return NameClass
      }
      function AgeMixin<Base extends Constructor>(base: Base) {
        @namespace(schema)
        class AgeClass extends base {
          @property.literal()
            age!: number
        }

        return AgeClass
      }
      const resource = environment.rdfine().factory.createEntity(node, [
        NameMixin,
        AgeMixin,
      ])

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "age": "http://schema.org/age",
            "id": "@id",
            "name": "http://xmlns.com/foaf/0.1/name",
            "type": "@type",
          },
          "age": 48,
          "id": "john",
          "name": "John",
        }
      `)
    })

    it('serialized resource term objects as child resources', () => {
      // given
      const dataset = $rdf.dataset()
      const node = cf({ dataset })
        .namedNode('john')
        .addOut(ex.foo, $rdf.blankNode('blank'))
        .addOut(ex.foo, $rdf.namedNode('bar'))
      function PersonMixin<Base extends Constructor>(base: Base) {
        @namespace(ex)
        class NameClass extends base {
          @property({ values: 'array' })
            foo!: Term[]
        }

        return NameClass
      }
      const resource = environment.rdfine().factory.createEntity(node, [PersonMixin])

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "foo": "http://example.com/foo",
            "id": "@id",
            "type": "@type",
          },
          "foo": Array [
            Object {
              "id": "_:blank",
            },
            Object {
              "id": "bar",
            },
          ],
          "id": "john",
        }
      `)
    })

    it('serializes RDF list of literals', () => {
      // given
      const dataset = $rdf.dataset()
      const node = cf({ dataset })
        .namedNode('john')
        .addList(ex.foo, [
          'foo',
          $rdf.literal('bar', 'en'),
          $rdf.literal('bar', xsd.anyType),
        ])

      function PersonMixin<Base extends Constructor>(base: Base) {
        @namespace(ex)
        class NameClass extends base {
          @property.literal({ values: 'list' })
            foo!: string[]
        }

        return NameClass
      }

      const resource = environment.rdfine().factory.createEntity(node, [PersonMixin])

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "foo": Object {
              "@container": "@list",
              "@id": "http://example.com/foo",
            },
            "id": "@id",
            "type": "@type",
          },
          "foo": Array [
            "foo",
            Object {
              "@language": "en",
              "@value": "bar",
            },
            Object {
              "@type": "http://www.w3.org/2001/XMLSchema#anyType",
              "@value": "bar",
            },
          ],
          "id": "john",
        }
      `)
    })

    it('serializes RDF list of literals (without mixin)', () => {
      // given
      const dataset = $rdf.dataset()
      const node = cf({ dataset })
        .namedNode('john')
        .addList(ex.foo, [
          'foo',
          $rdf.literal('bar', 'en'),
          $rdf.literal('bar', xsd.anyType),
        ])

      const resource = environment.rdfine().factory.createEntity(node)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "type": "@type",
          },
          "http://example.com/foo": Array [
            "foo",
            Object {
              "@language": "en",
              "@value": "bar",
            },
            Object {
              "@type": "http://www.w3.org/2001/XMLSchema#anyType",
              "@value": "bar",
            },
          ],
          "id": "john",
        }
      `)
    })

    it('serializes RDF list of Named Nodes', () => {
      // given
      const dataset = $rdf.dataset()
      const node = cf({ dataset })
        .namedNode('john')
        .addList(ex.foo, [
          ex.Foo,
          ex.Bar,
          ex.Baz,
        ])

      function PersonMixin<Base extends Constructor>(base: Base) {
        @namespace(ex)
        class NameClass extends base {
          @property({ values: 'list' })
            foo!: Term[]
        }

        return NameClass
      }

      const resource = environment.rdfine().factory.createEntity(node, [PersonMixin])

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "foo": Object {
              "@container": "@list",
              "@id": "http://example.com/foo",
            },
            "id": "@id",
            "type": "@type",
          },
          "foo": Array [
            Object {
              "id": "http://example.com/Foo",
            },
            Object {
              "id": "http://example.com/Bar",
            },
            Object {
              "id": "http://example.com/Baz",
            },
          ],
          "id": "john",
        }
      `)
    })

    it('serializes RDF list of resources which was not annotated', () => {
      // given
      const dataset = $rdf.dataset()
      const node = cf({ dataset })
        .namedNode('john')
        .addList(ex.foo, [
          ex.Foo,
          ex.Bar,
          ex.Baz,
        ])

      const resource = environment.rdfine().factory.createEntity(node)

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "id": "@id",
            "type": "@type",
          },
          "http://example.com/foo": Array [
            Object {
              "id": "http://example.com/Foo",
            },
            Object {
              "id": "http://example.com/Bar",
            },
            Object {
              "id": "http://example.com/Baz",
            },
          ],
          "id": "john",
        }
      `)
    })

    it('serializes RDF list of property which is not explicitly annotated as list', () => {
      // given
      const dataset = $rdf.dataset()
      const node = cf({ dataset })
        .namedNode('john')
        .addList(ex.foo, [
          ex.Foo,
          ex.Bar,
          ex.Baz,
        ])

      function PersonMixin<Base extends Constructor>(base: Base) {
        @namespace(ex)
        class NameClass extends base {
          @property.resource()
            foo!: RdfResourceCore
        }

        return NameClass
      }

      const resource = environment.rdfine().factory.createEntity(node, [PersonMixin])

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchSnapshot()
    })

    it('serializes literal property', () => {
      // given
      const dataset = $rdf.dataset()
      const node = cf({ dataset })
        .namedNode('john')
        .addList(ex.foo, [$rdf.literal('bar', 'en')])

      function PersonMixin<Base extends Constructor>(base: Base) {
        @namespace(ex)
        class NameClass extends base {
          @property.literal()
            foo!: string
        }

        return NameClass
      }

      const resource = environment.rdfine().factory.createEntity(node, [PersonMixin])

      // when
      const json = resource.toJSON()

      // then
      expect(json).to.be.validJsonLd()
      expect(json).toMatchInlineSnapshot(`
        Object {
          "@context": Object {
            "foo": Object {
              "@container": "@list",
              "@id": "http://example.com/foo",
            },
            "id": "@id",
            "type": "@type",
          },
          "foo": Array [
            Object {
              "@language": "en",
              "@value": "bar",
            },
          ],
          "id": "john",
        }
      `)
    });

    [
      $rdf.variable('foo'),
      // $rdf.quad(ex.foo, ex.bar, ex.baz), TODO: for when dataset indexed supports RDF*
      $rdf.defaultGraph(),
    ].forEach((node: Term) => {
      it(`serializes ${node.termType} value as 'null'`, () => {
        // given
        const dataset = $rdf.dataset()
        const person = cf({ dataset })
          .namedNode('john')
        function PersonMixin<Base extends Constructor>(base: Base) {
          @namespace(ex)
          class NameClass extends base {
            @property({ initial: node })
              foo!: Term
          }

          return NameClass
        }
        const resource = environment.rdfine().factory.createEntity(person, [PersonMixin])

        // when
        const json = resource.toJSON()

        // then
        expect(json).to.be.validJsonLd()
        expect(json.foo).to.be.null
      })
    })
  })
})
