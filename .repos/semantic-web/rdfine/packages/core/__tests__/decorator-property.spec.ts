import prefixes from '@zazuko/prefixes'
import cf from 'clownface'
import type { DatasetCore, DefaultGraph, Literal, NamedNode, Term } from '@rdfjs/types'
import RDF from '@zazuko/env'
import { foaf, schema, rdf } from '@tpluscode/rdf-ns-builders/loose'
import { turtle } from '@tpluscode/rdf-string'
import chai, { expect } from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import toCanonical from 'rdf-dataset-ext/toCanonical.js'
import RdfResource from '../RdfResource.js'
import { namespace, property, crossBoundaries, Constructor } from '../index.js'
import type { AnyFactory } from '../factory.js'
import { RdfineEnvironment } from '../environment.js'
import { parse, ex } from './_helpers/index.js'
import { createEnv } from './_helpers/environment.js'

describe('decorator', () => {
  chai.use(jestSnapshotPlugin())
  before(() => import('../../../__tests__/helpers/matchers.js'))

  let environment: RdfineEnvironment
  beforeEach(() => {
    environment = createEnv()
  })

  describe('term', () => {
    describe('getter', () => {
      it('returns raw named node from property', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .

          ex:res foaf:friend ex:friend .`)
        class Resource extends RdfResource {
          @property({ path: foaf.friend })
            friend?: NamedNode
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)
        const friend = instance.friend

        // then
        expect(friend!.value).to.eq(ex.friend.value)
      })

      it('returns raw blank node from property', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res ex:likes [
            a ex:Blank
          ] .
        `)
        class Resource extends RdfResource {
          @property({ path: ex.likes })
            likes?: Term
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.likes!.termType).to.eq('BlankNode')
      })

      it('returns raw literal node from property', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res foaf:name "John Doe"@en-us .
        `)
        class Resource extends RdfResource {
          @property({ path: foaf.name })
            name?: Literal
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)
        const name = instance.name

        // then
        expect(name!.value).to.eq('John Doe')
        expect(name!.language).to.eq('en-us')
      })

      it('throws for multiple values', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res schema:children ex:Hansel, ex:Gretel .
        `)
        class Resource extends RdfResource {
          @property({ path: schema.children })
            children?: Literal
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(() => instance.children).to.throw()
      })

      it('does not throw for multiple values when allowed', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res schema:children ex:Hansel, ex:Gretel .
        `)
        class Resource extends RdfResource {
          @property({ path: schema.children, values: ['single', 'array'] })
            children?: Literal | Literal[]
        }

        // when
        const { children } = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(children).to.be.instanceOf(Array)
      })

      it('return array when annotated', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res schema:children ex:Hansel, ex:Gretel .
        `)
        class Resource extends RdfResource {
          @property({ path: schema.children, values: 'array' })
            children?: Term[]
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.children).to.have.length(2)
        expect(instance.children!.map(c => c.value)).to.contain(ex.Hansel.value)
        expect(instance.children!.map(c => c.value)).to.contain(ex.Gretel.value)
      })

      it('return correct node when annotated with namespace, using prop name', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .

          ex:res foaf:friend ex:friend .`)

        @namespace(foaf)
        class Resource extends RdfResource {
          @property()
            friend?: NamedNode
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)
        const friend = instance.friend

        // then
        expect(friend!.value).to.eq(ex.friend.value)
      })

      it('get resource by paths of arbitrary length', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .

          ex:res foaf:friend ex:friend .
          ex:friend ex:worksAt ex:factory .
          ex:factory foaf:name "RDF Software House" .`)

        @namespace(foaf)
        class Resource extends RdfResource {
          @property({
            path: [
              'friend',
              'http://example.com/worksAt',
              foaf.name,
            ],
          })
            friendsWorkplaceName?: Literal
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.friendsWorkplaceName!.value).to.eq('RDF Software House')
      })

      it('return correct node when annotated with namespace', async () => {
      // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .

          ex:res foaf:friend ex:friend .`)

        @namespace(foaf)
        class Resource extends RdfResource {
          @property({ path: 'friend' })
            colleague?: NamedNode
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)
        const friend = instance.colleague

        // then
        expect(friend!.value).to.eq(ex.friend.value)
      })

      it('strict throws when object not found', async () => {
        // given
        const dataset = RDF.dataset()
        class Resource extends RdfResource {
          @property({ path: foaf.name, strict: true })
            name!: Literal
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)
        const getName = () => instance.name

        // then
        expect(getName).to.throw()
      })

      it('strict can be initialized', async () => {
        // given
        const dataset = RDF.dataset()
        class Resource extends RdfResource {
          @property.literal({ path: foaf.name, strict: true, initial: 'bar' })
            foo!: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.foo).to.eq('bar')
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('array can be initialized', async () => {
        // given
        const dataset = RDF.dataset()
        class Resource extends RdfResource {
          @property.literal({ path: foaf.name, values: 'array', initial: 'bar' })
            foo!: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.foo).to.contain.members(['bar'])
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('array can be initialized with multiple values', async () => {
        // given
        const dataset = RDF.dataset()
        class Resource extends RdfResource {
          @property.literal({ path: foaf.name, values: 'array', initial: ['foo', 'bar'] })
            foo!: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.foo).to.deep.eq(['foo', 'bar'])
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('rdf list can be initialized', async () => {
        // given
        const dataset = RDF.dataset()
        class Resource extends RdfResource {
          @property.literal({ path: foaf.name, values: 'list', initial: 'bar' })
            foo!: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.foo).to.deep.eq(['bar'])
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('rdf list can be initialized with multiple values', async () => {
        // given
        const dataset = RDF.dataset()
        class Resource extends RdfResource {
          @property.literal({ path: foaf.name, values: 'list', initial: ['foo', 'bar'] })
            foo!: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.foo).to.deep.eq(['foo', 'bar'])
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('returns rdf list array', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res ex:letters ( "a" "b" "c" ) .
        `)
        class Resource extends RdfResource {
          @property({ path: ex.letters, values: 'list' })
            letters!: Literal[]
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.letters.map(l => l.value)).to.contain.all.members(['a', 'b', 'c'])
      })

      it('returns empty rdf list array', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res ex:letters ( ) .
        `)
        class Resource extends RdfResource {
          @property({ path: ex.letters, values: 'list' })
            letters!: Literal[]
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.letters).to.deep.eq([])
      })

      it('throws when rdf list is the object but not annotated', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          
          ex:res foaf:knows ( ex:Will ex:Joe ex:Sindy ) .
        `)
        class Resource extends RdfResource {
          @property({ path: foaf.knows })
            friend!: Term
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(() => instance.friend).to.throw()
      })

      it('does not throw when rdf list is allowed', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          
          ex:res foaf:knows ( ex:Will ex:Joe ex:Sindy ) .
        `)
        class Resource extends RdfResource {
          @property({ path: foaf.knows, values: ['single', 'list'] })
            friends!: Term | Term[]
        }

        // when
        const { friends } = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(friends).to.be.instanceOf(Array)
      })

      it('returns list elements when allowed values are array or list', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          
          ex:res foaf:knows ( ex:Will ex:Joe ex:Sindy ) .
        `)
        class Resource extends RdfResource {
          @property({ path: foaf.knows, values: ['list', 'array'] })
            friends!: Term[]
        }

        // when
        const { friends } = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(friends.length).to.eq(3)
      })

      describe('filtered', () => {
        it('returns only value which satisfy filter', async () => {
          // given
          const dataset = await parse(turtle`
            ${ex.res} ${foaf.knows} ${ex.Will} , "Foo" .
          `)
          class Resource extends RdfResource {
            @property({
              path: foaf.knows,
              values: 'array',
              filter: term => term.termType === 'NamedNode',
            })
              friends!: Term[]
          }

          // when
          const [friend, ...rest] = new Resource(cf({
            dataset,
            term: ex.res,
          }), environment).friends

          // then
          expect(friend).to.deep.eq(ex.Will)
          expect(rest).to.have.length(0)
        })
      })
    })

    describe('setter', () => {
      it('can replace literal with blank', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res foaf:name "John Doe"@en-us .
          [
            a ex:BlankNodeName ;
            ex:first "John" ;
            ex:last "Doe"
          ] .
        `)
        class Resource extends RdfResource {
          @property({ path: foaf.name })
            name?: Term | null
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.name = cf({ dataset }).has(rdf.type, ex.BlankNodeName).term

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('can set empty array, removing objects', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res foaf:name "John"@en-us, "Johann"@de, "Jan"@pl, "Jean"@fr .
        `)
        class Resource extends RdfResource {
          @property({ path: foaf.name, values: 'array' })
            name?: Term[]
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.name = []

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('can set array', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res foaf:name "John"@en-us, "Johann"@de .
        `)
        class Resource extends RdfResource {
          @property({ path: foaf.name, values: 'array' })
            name?: Term[]
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.name = [
          RDF.literal('Jan', 'pl'),
          RDF.literal('Jean', 'fr'),
        ]

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('throws when setting array to non-array getter', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res foaf:name "John"@en-us, "Johann"@de, "Jan"@pl, "Jean"@fr .
        `)
        class Resource extends RdfResource {
          @property({ path: foaf.name })
            name?: any
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        const setArray = () => { instance.name = [] }

        // then
        expect(setArray).to.throw()
      })

      it('sets value at paths of arbitrary length', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .

          ex:res foaf:friend ex:friend .
          ex:friend ex:worksAt ex:factory .
          ex:factory foaf:name "RDF Software House" .`)

        @namespace(foaf)
        class Resource extends RdfResource {
          @property({
            path: [
              'friend',
              'http://example.com/worksAt',
              foaf.name,
            ],
          })
            friendsWorkplaceName?: Literal
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)
        instance.friendsWorkplaceName = RDF.literal('Google')

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets nil for empty rdf list', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          
          ex:res foaf:knows ( ex:Will ex:Joe ex:Sindy ) .
        `)
        class Resource extends RdfResource {
          @property({ path: foaf.knows, values: 'list' })
            friend!: Term[]
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)
        instance.friend = []

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets list when property allows list or single and setting array with multiple items', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          
          ex:res foaf:knows ( ) .
        `)
        class Resource extends RdfResource {
          @property({ path: ex.foo, values: ['list', 'single'] })
            friend!: Term[]
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)
        instance.friend = [RDF.literal('bar'), RDF.literal('baz')]

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('setting null to rdf list removes triple', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix foaf: <${prefixes.foaf}> .
          
          ex:res foaf:knows ( ex:Will ex:Joe ex:Sindy ) .
        `)
        class Resource extends RdfResource {
          @property({ path: foaf.knows, values: 'array' })
            friend!: Term[] | null
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)
        instance.friend = null

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('can set an rdf resource', async () => {
        // given
        const ptr = cf({ dataset: RDF.dataset() }).node(ex.res)
        class Resource extends RdfResource {
          @property({ path: foaf.knows })
            friend!: any
        }

        // when
        const instance = new Resource(ptr, environment)
        instance.friend = new Resource(cf({ dataset: RDF.dataset() }).node(ex.friend), environment)

        // then
        expect(ptr.out(foaf.knows).term).to.deep.eq(ex.friend)
      })

      it('can set a pointer', async () => {
        // given
        const ptr = cf({ dataset: RDF.dataset() }).node(ex.res)
        class Resource extends RdfResource {
          @property({ path: foaf.knows })
            friend!: any
        }

        // when
        const instance = new Resource(ptr, environment)
        instance.friend = cf({ dataset: RDF.dataset() }).node(ex.friend)

        // then
        expect(ptr.out(foaf.knows).term).to.deep.eq(ex.friend)
      })

      it('can set from factory', async () => {
        // given
        const ptr = cf({ dataset: RDF.dataset() }).node(ex.res)
        class Resource extends RdfResource {
          @property({ path: foaf.knows })
            friend!: any
        }

        // when
        const instance = new Resource(ptr, environment)
        const createFriend: AnyFactory<Resource> = graph => graph.node(ex.friend).addOut(schema.name, 'Friend')
        instance.friend = createFriend

        // then
        expect(ptr.out(foaf.knows).term).to.deep.eq(ex.friend)
      })

      describe('filtered', () => {
        it('sets only values matching filter', () => {
          // given
          const ptr = cf({ dataset: RDF.dataset() }).node(ex.res)
          class Resource extends RdfResource {
            @property({
              path: foaf.knows,
              values: 'array',
              filter: (term) => term.termType === 'NamedNode',
            })
              friends!: any[]
          }

          // when
          const instance = new Resource(ptr, environment)
          instance.friends = [
            ex.friend,
            RDF.blankNode(),
            RDF.literal('foo'),
          ]

          // then
          expect(ptr.out(foaf.knows).term).to.deep.eq(ex.friend)
        })
      })
    })

    describe('initial', () => {
      it('sets initial value from node', async () => {
        // given
        const dataset = RDF.dataset()
        class Resource extends RdfResource {
          @property({
            path: schema.name,
            initial: RDF.literal('foo'),
          })
            name!: Literal
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.name.value).to.eq('foo')
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets initial value from clownface object', async () => {
        // given
        const dataset = RDF.dataset()
        class Resource extends RdfResource {
          @property({
            path: schema.name,
            initial: (self: Resource) => self.pointer.blankNode('foo'),
          })
            name!: Literal
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.name.value).to.eq('foo')
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets initial value from function', async () => {
        // given
        const dataset = RDF.dataset()
        class Resource extends RdfResource {
          @property({
            path: schema.name,
            initial: (self: Resource) => RDF.namedNode(`${self.id.value}/child`),
          })
            child!: NamedNode
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.child.value).to.eq('http://example.com/res/child')
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets all initial values from all mixins', async () => {
        // given
        const dataset = RDF.dataset()
        function NameMixin<Base extends Constructor>(Resource: Base) {
          class Name extends Resource {
            @property.literal({
              path: schema.name,
              initial: () => RDF.literal('name'),
            })
              name!: string
          }
          return Name
        }
        function AgeMixin<Base extends Constructor>(Resource: Base) {
          class Age extends Resource {
            @property.literal({
              path: schema.age,
              initial: () => RDF.literal('21'),
            })
              age!: string
          }
          return Age
        }

        // when
        const instance = environment.rdfine().factory.createEntity(cf({
          dataset,
          term: ex.res,
        }), [NameMixin, AgeMixin])

        // then
        expect(instance.pointer.out(schema.name).value).to.eq('name')
        expect(instance.pointer.out(schema.age).value).to.eq('21')
      })
    })

    describe('over multiple graphs', () => {
      class Resource<D extends DatasetCore> extends RdfResource<D> {
        @property({ path: foaf.knows })
          friend!: Term

        @property({
          path: crossBoundaries(foaf.knows),
        })
          allFriendsAcross!: Term[]

        @property(({
          path: foaf.knows,
          subjectFromAllGraphs: true,
        }))
          allKnownFriends!: Term[]
      }

      function namedGraphTests(newResource: (dataset: DatasetCore, term: NamedNode, graph?: NamedNode | DefaultGraph) => Resource<DatasetCore>) {
        describe('getter', () => {
          it('returns value from same graph', async () => {
            // given
            const dataset = await parse(`
              @prefix ex: <${prefixes.ex}> .
              @prefix foaf: <${prefixes.foaf}> .
              
              ex:John foaf:knows ex:Will ex:John .
              ex:John foaf:knows ex:Sindy ex:Sindy .
              ex:John foaf:knows ex:Brad .
            `)

            // when
            const instance = newResource(dataset, ex.John, ex.John)

            // then
            expect(instance.allKnownFriends).to.deep.eq(
              [ex.Will, ex.Sindy, ex.Brad],
            )
          })

          it('returns self when dataset is empty', async () => {
            // given
            const dataset = RDF.dataset()

            // when
            const instance = newResource(dataset, ex.John)

            // then
            expect(instance.allKnownFriends).to.deep.eq([])
          })

          it('returns value from default graph if unspecified', async () => {
            // given
            const dataset = await parse(`
              @prefix ex: <${prefixes.ex}> .
              @prefix foaf: <${prefixes.foaf}> .
              
              ex:John foaf:knows ex:Will ex:John .
              ex:John foaf:knows ex:Sindy ex:Sindy .
              ex:John foaf:knows ex:Brad .
            `)

            // when
            const instance = newResource(dataset, ex.John)

            // then
            expect(instance.friend.value).to.eq(ex.Brad.value)
          })

          it('ignores crossingBoundaries option', async () => {
            // given
            const dataset = await parse(`
              @prefix ex: <${prefixes.ex}> .
              @prefix foaf: <${prefixes.foaf}> .
              
              ex:John foaf:knows ex:Will ex:John .
              ex:John foaf:knows ex:Will ex:Sindy .
              ex:John foaf:knows ex:Will .
            `)

            // when
            const instance = newResource(dataset, ex.John, ex.John)

            // then
            expect(instance.allFriendsAcross).to.have.length(1)
          })

          it('de-duplicates terms', async () => {
            // given
            const dataset = await parse(`
              @prefix ex: <${prefixes.ex}> .
              @prefix foaf: <${prefixes.foaf}> .
              
              ex:John foaf:knows ex:Will ex:John .
              ex:John foaf:knows ex:Will ex:Sindy .
              ex:John foaf:knows ex:Will .
            `)

            // when
            const instance = newResource(dataset, ex.John, ex.John)

            // then
            expect(instance.allKnownFriends).to.have.length(1)
          })
        })

        describe('setter', () => {
          it('sets value to same graph', async () => {
            // given
            const dataset = await parse(`
              @prefix ex: <${prefixes.ex}> .
              @prefix foaf: <${prefixes.foaf}> .
              
              ex:John foaf:knows ex:Will ex:John .
              ex:John foaf:knows ex:Sindy ex:Sindy .
              ex:John foaf:knows ex:Brad .
            `)
            const instance = newResource(dataset, ex.John, ex.John)

            // when
            instance.friend = ex.Holly

            // then
            expect(toCanonical(instance.unionGraphPointer.dataset)).toMatchSnapshot()
          })

          it('sets value to default graph if unspecified', async () => {
            // given
            const dataset = await parse(`
              @prefix ex: <${prefixes.ex}> .
              @prefix foaf: <${prefixes.foaf}> .
              
              ex:John foaf:knows ex:Will ex:John .
              ex:John foaf:knows ex:Sindy ex:Sindy .
              ex:John foaf:knows ex:Brad .
            `)
            const instance = newResource(dataset, ex.John)

            // when
            instance.friend = ex.Holly

            // then
            expect(toCanonical(instance.unionGraphPointer.dataset)).toMatchSnapshot()
          })
        })

        describe('initial', () => {
          it('sets initial values in self graph', () => {
            // given
            const dataset = RDF.dataset()
            const instance = newResource(dataset, ex.John, ex.John)

            // when
            instance.friend = ex.Holly

            // then
            expect(toCanonical(instance.unionGraphPointer.dataset)).toMatchSnapshot()
          })
        })
      }

      describe('constructed from clownface graph', () => {
        namedGraphTests((dataset, term, graph) => {
          return new Resource(cf({ dataset, term, graph }), environment)
        })
      })
    })
  })
})
