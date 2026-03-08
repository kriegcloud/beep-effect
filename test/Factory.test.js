import { expect } from 'chai'
import Environment from '@rdfjs/environment'
import DatasetFactory from '@rdfjs/dataset/Factory.js'
import $rdf from 'rdf-ext'
import NamespaceFactory from '@rdfjs/namespace/Factory.js'
import DataFactory from '@rdfjs/data-model/Factory.js'
import ClownfaceFactory from '../Factory.js'

describe('Factory', () => {
  const env = new Environment([
    ClownfaceFactory,
    NamespaceFactory,
    DatasetFactory,
    DataFactory,
  ])

  it('creates dataset using the available factory', () => {
    // when
    const ptr = env.clownface()

    // then
    expect(ptr.dataset).to.be.ok
  })

  it('uses provided dataset', () => {
    // when
    const dataset = $rdf.dataset()
    const ptr = env.clownface({ dataset })

    // then
    expect(ptr.dataset).to.eq(dataset)
  })

  it('forwards arguments', () => {
    // when
    const term = $rdf.namedNode('http://example.com')
    const ptr = env.clownface({ term })

    // then
    expect(ptr.term).to.deep.eq(term)
  })
})
