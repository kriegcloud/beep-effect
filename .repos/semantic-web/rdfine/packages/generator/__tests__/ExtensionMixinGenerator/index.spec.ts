import { expect } from 'chai'
import cf, { AnyPointer } from 'clownface'
import $rdf from '@zazuko/env'
import { dash, rdfs, sh } from '@tpluscode/rdf-ns-builders'
import { findTermsToGenerate } from '../../lib/ExtensionMixinGenerator/index.js'
import { FakeTypeCollection } from '../_helpers/FakeTypeCollection.js'
import { fakeLog } from '../_helpers/util.js'
import { Context } from '../../lib/index.js'
import { ExtensionIndexModule } from '../../lib/ExtensionMixinGenerator/ExtensionIndexModule.js'
import { ExtensionModule } from '../../lib/ExtensionMixinGenerator/ExtensionModule.js'

describe('ExtensionMixinGenerator', () => {
  let vocabulary: AnyPointer
  let log: Context['log']
  let properties: Context['properties']

  beforeEach(() => {
    vocabulary = cf({ dataset: $rdf.dataset() })
    log = fakeLog()
    properties = {}
  })

  it('generates a module for types from extended vocab which are property domain', () => {
    // const
    const types = new FakeTypeCollection([
      [sh.PropertyShape, { type: 'ExternalResource' }],
    ])
    vocabulary
      .namedNode(dash.hidden).addOut(rdfs.domain, sh.PropertyShape)
      .namedNode(dash.defaultViewForRole).addOut(rdfs.domain, sh.PropertyShape)

    // when
    const [extensionModule] = findTermsToGenerate(types, { vocabulary, log, properties, prefix: 'ex' }) as [ExtensionModule]

    // then
    expect(extensionModule.node?.term).to.deep.eq(sh.PropertyShape)
    expect(extensionModule.properties).to.containSubset(
      [{
        term: dash.hidden,
      }, {
        term: dash.defaultViewForRole,
      }],
    )
  })

  it('generates an index module for extended vocabs', () => {
    // const
    const types = new FakeTypeCollection([
      [sh.PropertyShape, { type: 'ExternalResource' }],
    ])
    vocabulary
      .namedNode(dash.hidden).addOut(rdfs.domain, sh.PropertyShape)
      .namedNode(dash.defaultViewForRole).addOut(rdfs.domain, sh.PropertyShape)

    // when
    const [, indexModule] = findTermsToGenerate(types, { vocabulary, log, properties, prefix: 'ex' }) as [any, ExtensionIndexModule]

    // then
    expect(indexModule.prefix).to.eq('sh')
    expect(indexModule.terms).to.contain.all.members(['PropertyShape'])
  })

  it('does not generate an index module for own types', () => {
    // const
    const types = new FakeTypeCollection([
      [sh.Shape, { type: 'Resource' }],
    ])
    vocabulary.namedNode(dash.hidden).addOut(rdfs.domain, sh.Shape)

    // when
    const modules = findTermsToGenerate(types, { vocabulary, log, properties, prefix: 'dash' })

    // then
    expect(modules).to.have.length(0)
  })
})
