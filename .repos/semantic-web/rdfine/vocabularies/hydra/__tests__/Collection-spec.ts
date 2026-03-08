import cf, { GraphPointer } from 'clownface'
import $rdf from '@zazuko/env'
import type { NamedNode } from '@rdfjs/types'
import { hydra } from '@tpluscode/rdf-ns-builders'
import { expect } from 'chai';
import environment from './support/environment.js';

describe('Collection', () => {
  let collectionNode: GraphPointer<NamedNode>

  beforeEach(() => {
    collectionNode = cf({ dataset: $rdf.dataset() })
      .namedNode('http://example.com/vocab#Collection')
  })

  describe('members', () => {
    it('should return array even for one member', () => {
      // given
      collectionNode
        .addOut(hydra.member, m => {
          m.addOut(collectionNode.namedNode('http://example.com/text'), 'hello')
        })
      const collection = environment.rdfine.hydra.Collection(collectionNode)

      // then
      expect(Array.isArray(collection.member)).to.eq(true)
      const member: any = collection.member.shift()
      expect(member['http://example.com/text']).to.have.property('value', 'hello')
    })
  })

  describe('views', () => {
    it('should return empty array when views are missing', () => {
      // given
      const collection = environment.rdfine.hydra.Collection(collectionNode)

      // then
      expect(Array.isArray(collection.view)).to.eq(true)
      expect(collection.view.length).to.eq(0)
    })
  })

  describe('manages', () => {
    it('should return array', () => {
      // given
      collectionNode.addOut(hydra.manages, collectionNode.blankNode())
      const collection = environment.rdfine.hydra.Collection(collectionNode)

      // then
      expect(collection.manages).to.have.length(1)
    })
  })

  describe('memberAssertion', () => {
    it('should return array even for one element', () => {
      // given
      collectionNode.addOut(hydra.memberAssertion, collectionNode.blankNode())
      const collection = environment.rdfine.hydra.Collection(collectionNode)

      // then
      expect(Array.isArray(collection.memberAssertion)).to.eq(true)
    })
  })

  describe('totalItems', () => {
    it('returns the value of the hydra property', () => {
      // given
      collectionNode.addOut(hydra.totalItems, 167)
      const collection = environment.rdfine.hydra.Collection(collectionNode)

      // then
      expect(collection.totalItems).to.eq(167)
    })
  })
})
