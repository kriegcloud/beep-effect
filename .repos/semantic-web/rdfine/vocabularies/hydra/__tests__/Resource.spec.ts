import cf, { GraphPointer } from 'clownface'
import $rdf from '@zazuko/env'
import type { DatasetCore, NamedNode } from '@rdfjs/types'
import { hydra } from '@tpluscode/rdf-ns-builders'
import { expect } from 'chai';
import environment from './support/environment.js';

describe('Resource', () => {
  let hydraResourceNode: GraphPointer<NamedNode>
  let dataset: DatasetCore

  beforeEach(() => {
    dataset = $rdf.dataset()
    hydraResourceNode = cf({ dataset })
      .namedNode('http://example.com/vocab#SomeClass')
  })

  describe('collection', () => {
    it('should return its objects', async () => {
      // then
      hydraResourceNode.addOut(hydra.collection, hydraResourceNode.namedNode('http://example.com/c'))

      // when
      const resource = environment.rdfine.hydra.Resource(hydraResourceNode)

      // then
      expect(resource.collection.length).to.eq(1)
      expect(resource.collection[0].id.value).to.eq('http://example.com/c')
    })
  })
})
