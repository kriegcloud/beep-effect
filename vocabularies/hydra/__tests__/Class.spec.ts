import cf, { GraphPointer } from 'clownface'
import $rdf from '@zazuko/env'
import type { DatasetCore, NamedNode } from '@rdfjs/types'
import { hydra } from '@tpluscode/rdf-ns-builders'
import { expect } from 'chai';
import environment from './support/environment.js';

describe('Class', () => {
  let hydraClassNode: GraphPointer<NamedNode>
  let dataset: DatasetCore

  beforeEach(() => {
    dataset = $rdf.dataset()
    hydraClassNode = cf({ dataset })
      .namedNode('http://example.com/vocab#SomeClass')
  })

  describe('getting operations', () => {
    it('should return operations', () => {
      // then
      hydraClassNode.addOut(hydra.supportedOperation, hydraClassNode.blankNode())

      // when
      const clas = environment.rdfine.hydra.Class(hydraClassNode)

      // then
      expect(clas.supportedOperation.length).to.eq(1)
    })

    it('should return empty array if property is missing', () => {
      // when
      const clas = environment.rdfine.hydra.Class(hydraClassNode)

      // then
      expect(clas.supportedOperation.length).to.eq(0)
    })
  })

  describe('getting properties', () => {
    it('should return properties', () => {
      // given
      hydraClassNode.addOut(hydra.supportedProperty, hydraClassNode.blankNode())

      // when
      const clas = environment.rdfine.hydra.Class(hydraClassNode)

      // then
      expect(clas.supportedProperty.length).to.eq(1)
    })

    it('should return empty array if property is missing', () => {
      const clas = environment.rdfine.hydra.Class(hydraClassNode)

      expect(clas.supportedProperty.length).to.eq(0)
    })
  })
})
