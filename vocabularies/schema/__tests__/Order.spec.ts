import { expect } from 'chai'
import clownface from 'clownface'
import RDF from '@zazuko/env'
import { schema } from '@tpluscode/rdf-ns-builders';
import environment from './environment.js';

describe('Order', () => {
  describe('status', () => {
    it('should return a namedNode', () => {
      // given
      const dataset = RDF.dataset()
      const graph = clownface({ dataset, term: RDF.namedNode('http://example.com/order') })
        .addOut(schema.orderStatus, schema.OrderCancelled)

      // when
      const order = environment.rdfine.schema.Order(graph)

      // then
      expect(order.orderStatus?.termType).to.eq('NamedNode')
    })
  })
})
