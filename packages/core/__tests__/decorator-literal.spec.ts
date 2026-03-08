/* global BigInt */
import prefixes from '@zazuko/prefixes'
import chai, { expect } from 'chai'
import type { BlankNode, Literal, NamedNode } from '@rdfjs/types'
import RDF from '@rdfjs/data-model'
import rdfExt from '@zazuko/env'
import { schema, xsd } from '@tpluscode/rdf-ns-builders'
import { turtle } from '@tpluscode/rdf-string'
import cf, { GraphPointer } from 'clownface'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import toCanonical from 'rdf-dataset-ext/toCanonical.js'
import RdfResource from '../RdfResource.js'
import { property } from '../index.js'
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

  describe('literal', () => {
    describe('getter', () => {
      it('returns string value of literal', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res schema:name "John Doe" .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: schema.name })
            name?: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.name).to.eq('John Doe')
      })

      it('returns boolean when type is set', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res ex:isMarried true .
          ex:res ex:isSingle "false"^^xsd:boolean .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: ex.isMarried, type: Boolean })
            married?: boolean

          @property.literal({ path: ex.isSingle, type: Boolean })
            single?: boolean
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.single).to.deep.eq(false)
        expect(instance.married).to.deep.eq(true)
      })

      it('returns integer when type is set', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res ex:age "30" .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: ex.age, type: Number })
            age!: number
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.age).to.deep.eq(30)
      })

      it('returns date when type is set', async () => {
        // given
        const dataset = await parse(turtle`
          ${ex.res} ${schema.birthDate} "1965-09-11" .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: schema.birthDate, type: Date })
            birthDay!: Date
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.birthDay).to.deep.eq(new Date(-135907200000))
      })

      it('returns date/time when type is set and node is datetime', async () => {
        // given
        const dataset = await parse(turtle`
          ${ex.res} ${schema.birthDate} "1965-09-11T19:56:09"^^${xsd.dateTime} .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: schema.birthDate, type: Date })
            birthDay!: Date
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.birthDay).to.deep.eq(new Date(1965, 8, 11, 19, 56, 9))
      })

      it('returns actual date/time despite xsd:date datatype', async () => {
        // given
        const dataset = await parse(turtle`
          ${ex.res} ${schema.birthDate} "1965-09-11T19:56:09"^^${xsd.dateTime} .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: schema.birthDate, type: Date, datatype: xsd.date })
            birthDay!: Date
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.birthDay).to.deep.eq(new Date(1965, 8, 11, 19, 56, 9))
      })

      it('returns float when type is set and node is floating point', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res ex:age 30.6 .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: ex.age, type: Number })
            age!: number
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.age).to.deep.eq(30.6)
      })

      it('returns rdf list array', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res ex:letters ( "a" "b" "c" ) .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: ex.letters, values: 'list' })
            letters?: string[]
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.letters).to.contain.all.members(['a', 'b', 'c'])
      })

      it('returns string value of typed literal', async () => {
        // given
        const dataset = await parse(turtle`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res ex:age "30.3"^^${xsd.double} .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: ex.age, datatype: xsd.double })
            age!: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.age).to.deep.eq('30.3')
      })

      it('returns string value of typed literal with different datatype', async () => {
        // given
        const dataset = await parse(turtle`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res ex:age "30.3"^^${xsd.float} .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: ex.age, datatype: xsd.double })
            age!: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.age).to.deep.eq('30.3')
      })
    })

    describe('setter', () => {
      it('accepts raw term', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res schema:name "Johann"@de .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: schema.name })
            name?: string | Literal
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.name = RDF.literal('John', 'en-gb')

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('replaces boolean object value', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res ex:isMarried true .
        `)

        class Resource extends RdfResource {
          @property.literal({ path: ex.isMarried, type: Boolean })
            married?: boolean
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.married = false

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets xsd:integer literal for int number', async () => {
        // given
        const dataset = rdfExt.dataset()

        class Resource extends RdfResource {
          @property.literal({ path: ex.age, type: Number })
            age!: number
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.age = 30

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets xsd:float literal for float number', async () => {
        // given
        const dataset = rdfExt.dataset()

        class Resource extends RdfResource {
          @property.literal({ path: ex.age, type: Number })
            age!: number
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.age = 30.4

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets xsd:long literal for bigint', async () => {
        // given
        const dataset = rdfExt.dataset()

        class Resource extends RdfResource {
          @property.literal({ path: ex.age, type: Number })
            age!: bigint
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.age = BigInt(9007199254740991)

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets xsd:dateTime literal for Date', async () => {
        // given
        const dataset = rdfExt.dataset()

        class Resource extends RdfResource {
          @property.literal({ path: schema.birthDate, type: Date })
            birthDate!: Date
        }

        const pointer = cf({
          dataset,
          term: ex.res,
        })
        const instance = new Resource(pointer, environment)

        // when
        instance.birthDate = new Date(Date.parse('1987-10-09'))

        // then
        expect(pointer.out(schema.birthDate).term)
          .to.deep.eq(RDF.literal('1987-10-09T00:00:00.000Z', xsd.dateTime))
      })

      it('sets xsd:date literal for Date with forced xsd type', async () => {
        // given
        const dataset = rdfExt.dataset()

        class Resource extends RdfResource {
          @property.literal({ path: schema.birthDate, type: Date, datatype: xsd.date })
            birthDate!: Date
        }

        const pointer = cf({
          dataset,
          term: ex.res,
        })
        const instance = new Resource(pointer, environment)

        // when
        instance.birthDate = new Date(Date.parse('1987-10-09'))

        // then
        expect(pointer.out(schema.birthDate).term)
          .to.deep.eq(RDF.literal('1987-10-09', xsd.date))
      })

      it('replaces string object value', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res schema:name "John" .
        `)

        class Resource extends RdfResource {
          @property.literal({ path: schema.name })
            name?: string
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.name = 'Jane'

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('replaces string literal node value', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res schema:name "John" .
        `)

        class Resource extends RdfResource {
          @property.literal({ path: schema.name })
            name?: string | Literal
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.name = RDF.literal('Jane', ex.Name)

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('replaces string literal node value', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res schema:name "John" .
        `)

        class Resource extends RdfResource {
          @property.literal({ path: schema.name })
            name?: string | GraphPointer<Literal>
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.name = instance.pointer.literal('Jane', ex.Name)

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('unsets string object when null is set', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res schema:name "John" .
        `)

        class Resource extends RdfResource {
          @property.literal({ path: schema.name })
            name: string | null = null
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // when
        instance.name = null

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('throws when trying to set a named node', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res schema:name "John" .
        `)

        class Resource extends RdfResource {
          @property.literal({ path: schema.name })
            name?: string | NamedNode
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // the
        expect(() => {
          instance.name = RDF.namedNode('foo')
        }).to.throw()
      })

      it('throws when trying to set a blank node', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res schema:name "John" .
        `)

        class Resource extends RdfResource {
          @property.literal({ path: schema.name })
            name?: string | BlankNode
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // the
        expect(() => {
          instance.name = RDF.blankNode('foo')
        }).to.throw()
      })

      it('throws when trying to set a resource', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res schema:name "John" .
        `)

        class Resource extends RdfResource {
          @property.literal({ path: schema.name })
            name?: string
        }

        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // the
        expect(() => {
          instance.name = instance as any
        }).to.throw()
      })

      it('sets a literal with the annotated type', async () => {
        // given
        const dataset = await parse(turtle`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res ex:age "30.3"^^${xsd.float} .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: ex.age, datatype: xsd.double })
            age!: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)
        instance.age = '20'

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets a numeric literal with the annotated type', async () => {
        // given
        const dataset = await parse(turtle`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          
          ex:res ex:age "30.3"^^${xsd.float} .
        `)
        class Resource extends RdfResource {
          @property.literal({ path: ex.age, type: Number, datatype: xsd.double })
            age!: number
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)
        instance.age = 20

        // then
        expect(toCanonical(dataset)).toMatchSnapshot()
      })
    })

    describe('initial', () => {
      it('sets default value when not present in dataset', async () => {
        // given
        const dataset = rdfExt.dataset()
        class Resource extends RdfResource {
          @property.literal({
            path: schema.name,
            initial: 'foo',
          })
            name = 'foo'
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.name).to.eq('foo')
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('does not set initialized value when present in initial dataset', async () => {
        // given
        const dataset = await parse(`
          @prefix ex: <${prefixes.ex}> .
          @prefix schema: <${prefixes.schema}> .
          @prefix xsd: <${prefixes.xsd}> .
          
          ex:res schema:name "bar" .
        `)
        class Resource extends RdfResource {
          @property.literal({
            path: schema.name,
            initial: 'foo',
          })
            name!: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.name).to.eq('bar')
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets initial value from node', async () => {
        // given
        const dataset = rdfExt.dataset()
        class Resource extends RdfResource {
          @property.literal({
            path: schema.name,
            initial: RDF.literal('foo'),
          })
            name!: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.name).to.eq('foo')
        expect(toCanonical(dataset)).toMatchSnapshot()
      })

      it('sets initial value from function', async () => {
        // given
        const dataset = rdfExt.dataset()
        class Resource extends RdfResource {
          @property.literal({
            path: schema.name,
            initial: (self: Resource) => self.id.value,
          })
            name!: string
        }

        // when
        const instance = new Resource(cf({
          dataset,
          term: ex.res,
        }), environment)

        // then
        expect(instance.name).to.eq(instance.id.value)
        expect(toCanonical(dataset)).toMatchSnapshot()
      })
    })
  })
})
