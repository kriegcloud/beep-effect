import clownface from 'clownface'
import $rdf from '@rdfjs/dataset'
import RDF from '@rdfjs/data-model'
import { Constructor } from '@tpluscode/rdfine'
import { rdf, rdfs } from '@tpluscode/rdf-ns-builders'
import { ResourceMixin } from '@rdfine/rdfs/lib/Resource'
import { sh } from '../lib/namespace.js'
import { PropertyShapeMixin } from '../lib/PropertyShape.js'
import { expect } from 'chai';
import environment from './environment.js'

describe('Shape', () => {
  describe('property', () => {
    it('should return instances of shape', async () => {
      // given
      const dataset = $rdf.dataset()
      const graph = clownface({ dataset, term: RDF.namedNode('http://example.com/shape') })
        .addOut(sh.property, property => {
          property.addOut(sh.name, 'Foo')
        })

      // when
      const shape = environment.rdfine.sh.Shape(graph)

      // then
      expect(shape.property[0].name).to.eq('Foo')
    })
  })

  describe('__mixins', () => {
    it('does not contain duplicate mixins', () => {
      // given
      const dataset = $rdf.dataset()
      const graph = clownface({ dataset, term: RDF.namedNode('http://example.com/shape') })
        .addOut(rdf.type, [rdfs.Resource, sh.PropertyShape])

      // when
      const shape = environment.rdfine().factory.createEntity(graph)
      const propType = shape.constructor as Constructor

      // then
      expect(propType.__mixins).to.contain.all.members([PropertyShapeMixin])
    })
  })
})
