import clownface from 'clownface';
import $rdf from '@zazuko/env';
import { schema } from '@tpluscode/rdf-ns-builders';
import { expect } from 'chai';
import environment from './environment.js';

describe('curried initializers', () => {
  it('initializes blank', () => {
    // given
    const id = clownface({ dataset: $rdf.dataset() }).namedNode('foo')

    // when
    const person = environment.rdfine.schema.Person(id, {
      parent: environment.rdfine.schema.Person({
        name: 'John',
      }),
    })

    // then
    expect(person.parent?.name).to.eq('John')
    expect(person.parent?.id.termType).to.eq('BlankNode')
  })

  it('initializes named from string', () => {
    // given
    const id = clownface({ dataset: $rdf.dataset() }).namedNode('foo')

    // when
    const person = environment.rdfine.schema.Person(id, {
      parent: environment.rdfine.schema.Person('http://foo.bar/John', {
        name: 'John',
      }),
    })

    // then
    expect(person.parent?.name).to.eq('John')
    expect(person.parent?.id).to.deep.eq($rdf.namedNode('http://foo.bar/John'))
  })

  it('initializes named from term', () => {
    // given
    const id = clownface({ dataset: $rdf.dataset() }).namedNode('foo')

    // when
    const person = environment.rdfine.schema.Person(id, {
      parent: environment.rdfine.schema.Person($rdf.namedNode('http://foo.bar/John'), {
        name: 'John',
      }),
    })

    // then
    expect(person.parent?.name).to.eq('John')
    expect(person.parent?.id).to.deep.eq($rdf.namedNode('http://foo.bar/John'))
  })

  it('initializes URI property from existing resource', () => {
    // given
    const id = clownface({ dataset: $rdf.dataset() }).namedNode('foo')
    const john = environment.rdfine.schema.Person(clownface({ dataset: $rdf.dataset() }).namedNode('http://foo.bar/John'))

    // when
    const person = environment.rdfine.schema.Person(id, {
      [schema.parent.value]: john,
    })

    // then
    expect(person.parent?.id).to.deep.eq($rdf.namedNode('http://foo.bar/John'))
  })

  it('initializes URI property from term', () => {
    // given
    const id = clownface({ dataset: $rdf.dataset() }).namedNode('foo')

    // when
    const person = environment.rdfine.schema.Person(id, {
      [schema.parent.value]: environment.rdfine.schema.Person($rdf.namedNode('http://foo.bar/John'), {
        name: 'John',
      }),
    })

    // then
    expect(person.parent?.name).to.eq('John')
    expect(person.parent?.id).to.deep.eq($rdf.namedNode('http://foo.bar/John'))
  })
})
