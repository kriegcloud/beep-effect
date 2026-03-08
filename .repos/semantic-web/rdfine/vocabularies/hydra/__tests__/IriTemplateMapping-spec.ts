import cf, { GraphPointer } from 'clownface'
import $rdf from '@zazuko/env'
import type { NamedNode } from '@rdfjs/types'
import { hydra } from '@tpluscode/rdf-ns-builders'
import { expect } from 'chai';
import environment from './support/environment.js';

describe('IriTemplateMapping', () => {
  let node: GraphPointer<NamedNode>

  beforeEach(() => {
    node = cf({ dataset: $rdf.dataset() })
      .namedNode('http://example.com/vocab#TemplateMapping')
  })

  describe('required', () => {
    it.skip('should return false if missing', () => {
      // given
      const iriTemplate = environment.rdfine.hydra.IriTemplateMapping(node)

      // then
      expect(iriTemplate.required).to.eq(false)
    })
  })

  describe('variable', () => {
    it('returns the correct value of hydra term', () => {
      // given
      node.addOut(hydra.variable, 'test')

      const iriTemplate = environment.rdfine.hydra.IriTemplateMapping(node)

      // then
      expect(iriTemplate.variable).to.eq('test')
    })
  })

  describe('property', () => {
    it('returns the correct value of hydra term', () => {
      // given
      node.addOut(hydra.property, node.namedNode('http://example.com/test'))
      const iriTemplate = environment.rdfine.hydra.IriTemplateMapping(node)

      // then
      expect(iriTemplate.property?.id.value).to.eq('http://example.com/test')
    })
  })
})
