import { turtle } from '@tpluscode/rdf-string'
import namespace from '@rdfjs/namespace'
import $rdf from '@zazuko/env'
import { owl, rdfs, schema, xsd } from '@tpluscode/rdf-ns-builders'
import cf from 'clownface'
import Parser from '@rdfjs/parser-n3'
import stringToStream from 'string-to-stream'
import { expect } from 'chai'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import { findProperties } from '../../lib/property/index.js'

const parser = new Parser()

const ex = namespace('http://example.com/')

describe('findProperties', () => {
  it('returns strict properties defined with rdfs:range', async () => {
    // given
    const triples = turtle`
      ${ex.Type} a ${rdfs.Class} .
      
      ${ex.prop} ${rdfs.domain} ${ex.Type} ;
                 ${rdfs.range} ${xsd.string} .      
    `.toString()
    const vocabulary = cf({
      dataset: await fromStream($rdf.dataset(), parser.import(stringToStream(triples))),
    })

    // when
    const properties = findProperties(vocabulary.node(ex.Type), {
      vocabulary,
    })

    // then
    expect(properties[0].range[0].strictSemantics).to.eq(true)
  })

  it('returns loose properties defined with schema:rangeIncludes', async () => {
    // given
    const triples = turtle`
      ${ex.Type} a ${rdfs.Class} .
      
      ${ex.prop} ${rdfs.domain} ${ex.Type} ;
                 ${schema.rangeIncludes} ${ex.Range1}, ${ex.Range2} .      
    `.toString()
    const vocabulary = cf({
      dataset: await fromStream($rdf.dataset(), parser.import(stringToStream(triples))),
    })

    // when
    const properties = findProperties(vocabulary.node(ex.Type), {
      vocabulary,
    })

    // then
    expect(properties[0].range[0].strictSemantics).to.eq(false)
  })

  it('returns strict properties defined with owl:unionOf/rdfs:range', async () => {
    // given
    const triples = turtle`
      ${ex.Type} a ${rdfs.Class} .
      
      ${ex.prop} ${rdfs.domain} ${ex.Type} ;
                 ${rdfs.range}  [
                                  ${owl.unionOf} ( ${xsd.dateTime} ${xsd.date} )
                                ] .      
    `.toString()
    const vocabulary = cf({
      dataset: await fromStream($rdf.dataset(), parser.import(stringToStream(triples))),
    })

    // when
    const properties = findProperties(vocabulary.node(ex.Type), {
      vocabulary,
    })

    // then
    expect(properties[0].range[0].strictSemantics).to.eq(true)
    expect(properties[0].range[1].strictSemantics).to.eq(true)
  })

  it('returns strict properties defined with rdfs:domain/owl:unionOf rdfs:range/owl:unionOf', async () => {
    // given
    const triples = turtle`
      ${ex.Type} a ${rdfs.Class} .
      
      ${ex.prop} ${rdfs.domain} [ ${owl.unionOf} ( ${ex.Type} ) ]  ;
                 ${rdfs.range}  [
                                  ${owl.unionOf} ( ${xsd.dateTime} ${xsd.date} )
                                ] .      
    `.toString()
    const vocabulary = cf({
      dataset: await fromStream($rdf.dataset(), parser.import(stringToStream(triples))),
    })

    // when
    const properties = findProperties(vocabulary.node(ex.Type), {
      vocabulary,
    })

    // then
    expect(properties[0].range[0].strictSemantics).to.eq(true)
    expect(properties[0].range[1].strictSemantics).to.eq(true)
  })

  it('returns strict properties defined as derived datatype with owl:onDatatype', async () => {
    // given
    const triples = turtle`
      ${ex.Type} a ${rdfs.Class} .
      
      ${ex.prop} ${rdfs.domain} [ ${owl.unionOf} ( ${ex.Type} ) ]  ;
                 ${rdfs.range}  [
                                  ${owl.onDatatype} ${xsd.float}
                                ] .      
    `.toString()
    const vocabulary = cf({
      dataset: await fromStream($rdf.dataset(), parser.import(stringToStream(triples))),
    })

    // when
    const properties = findProperties(vocabulary.node(ex.Type), {
      vocabulary,
    })

    // then
    expect(properties[0].range[0].term.term).to.deep.eq(xsd.float)
    expect(properties[0].range[0].strictSemantics).to.eq(true)
  })
})
