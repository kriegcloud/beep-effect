import { MemberAssertion } from '../../extensions/MemberAssertion.js';
import $rdf from '@zazuko/env';
import { Initializer } from '@tpluscode/rdfine/RdfResource';
import { schema, hydra } from '@tpluscode/rdf-ns-builders';
import { expect } from 'chai';
import environment from '../support/environment.js';

describe('@rdfine/hydra/extensions/MemberAssertion', () => {
  describe('factory', () => {
    it('creates from initializer', () => {
      // given
      const pointer = environment.clownface().blankNode()
      const init: Initializer<MemberAssertion> = {
        subject: $rdf.namedNode('foo'),
        property: schema.knows,
        object: $rdf.namedNode('bar'),
      }

      // when
      environment.rdfine.hydra.MemberAssertion(pointer, init)

      // then
      expect(pointer.out(hydra.subject).term).to.deep.eq($rdf.namedNode('foo'))
      expect(pointer.out(hydra.property).term).to.deep.eq(schema.knows)
      expect(pointer.out(hydra.object).term).to.deep.eq($rdf.namedNode('bar'))
    })
  })
})
