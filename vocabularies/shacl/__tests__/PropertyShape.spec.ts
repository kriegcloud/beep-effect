import { rdfs, skos } from '@tpluscode/rdf-ns-builders'
import toCanonical from 'rdf-dataset-ext/toCanonical.js'
import { PropertyShape } from '../lib/PropertyShape.js';
import chai, { expect } from 'chai';
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot';
import environment from './environment.js';

describe('PropertyShape', () => {
  chai.use(jestSnapshotPlugin())

  describe('initializer', () => {
    it('lets initializing path with named node', () => {
      const graph = environment.clownface().namedNode('http://example.com/shape')

      // when
      environment.rdfine.sh.PropertyShape(graph, {
        path: rdfs.label,
      })

      // then
      expect(toCanonical(graph.dataset)).toMatchSnapshot()
    })

    it('lets initializing path with named node array', () => {
      // given
      const graph = environment.clownface().namedNode('http://example.com/shape')

      // when
      environment.rdfine.sh.PropertyShape(graph, {
        path: [skos.broader, rdfs.label],
      })

      // then
      expect(toCanonical(graph.dataset)).toMatchSnapshot()
    })

    it('initializes a single path property without an RDF List', () => {
      // given
      const graph = environment.clownface().namedNode('http://example.com/shape')

      // when
      const shape = environment.rdfine.sh.PropertyShape(graph, {
        path: rdfs.label,
      })

      // then
      expect(shape).toMatchSnapshot()
    })

    it('initializes a single element array as an RDF List', () => {
      // given
      const graph = environment.clownface().namedNode('http://example.com/shape')

      // when
      const shape = environment.rdfine.sh.PropertyShape(graph, {
        path: [rdfs.label],
      })

      // then
      expect(shape).toMatchSnapshot()
    })
  })
})
