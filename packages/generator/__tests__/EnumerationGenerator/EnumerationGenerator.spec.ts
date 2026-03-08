import cf, { AnyPointer } from 'clownface'
import $rdf from '@zazuko/env'
import { rdf, rdfs } from '@tpluscode/rdf-ns-builders'
import { expect } from 'chai'
import { findTermsToGenerate } from '../../lib/EnumerationGenerator/index.js'
import { FakeTypeCollection } from '../_helpers/FakeTypeCollection.js'
import { ex } from '../_helpers/prefix.js'

describe('EnumerationGenerator', () => {
  let vocabulary: AnyPointer

  beforeEach(() => {
    vocabulary = cf({ dataset: $rdf.dataset() })
  })

  it('creates a module for every enumeration type', () => {
    // given
    const types = new FakeTypeCollection([
      [ex.Enum1, { type: 'Enumeration' as const }],
      [ex.Enum2, { type: 'Enumeration' as const }],
    ])
    vocabulary
      .node(ex.Enum1).addOut(rdf.type, rdfs.Class)
      .node(ex.Enum2).addOut(rdf.type, rdfs.Class)

    // when
    const result = findTermsToGenerate(types, {
      vocabulary,
    })

    // then
    expect(result.map(m => m.node?.value)).to.deep.eq(
      [
        vocabulary.node(ex.Enum1).value,
        vocabulary.node(ex.Enum2).value,
      ],
    )
  })
})
