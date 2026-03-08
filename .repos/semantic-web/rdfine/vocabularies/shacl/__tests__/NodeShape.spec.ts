import $rdf from '@zazuko/env';
import clownface from 'clownface';
import RDF from '@rdfjs/data-model';
import { rdfs } from '@tpluscode/rdf-ns-builders';
import chai, { expect } from 'chai';
import ns from '@rdfjs/namespace';
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot';
import environment from './environment.js';
import toCanonical from 'rdf-dataset-ext/toCanonical.js';

const ex = ns('http://example.com/')

describe('NodeShape', () => {
  chai.use(jestSnapshotPlugin())

  describe('initializer', () => {
    it('sets an array as list deep in the initialized graph', () => {
      // given
      const dataset = $rdf.dataset()
      const graph = clownface({ dataset, term: RDF.namedNode('http://example.com/shape') })

      // when
      environment.rdfine.sh.NodeShape(graph, {
        property: {
          node: {
            property: [{
              in: [{
                id: ex.foo,
                [rdfs.label.value]: 'Foo',
              }, {
                id: ex.bar,
                [rdfs.label.value]: 'Bar',
              }],
            }],
          },
        },
      })

      // then
      expect(toCanonical(dataset)).toMatchSnapshot()
    })
  })
})
