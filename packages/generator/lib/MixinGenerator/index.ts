import { GraphPointer } from 'clownface'
import { dash, rdf, rdfs, hydra, owl } from '@tpluscode/rdf-ns-builders'
import { NamedNode } from '@rdfjs/types'
import TermSet from '@rdfjs/term-set'
import TermMap from '@rdfjs/term-map'
import { toJavascriptProperties } from '../property/JsProperties.js'
import { findProperties } from '../property/index.js'
import { ExternalResourceType, ResourceType, TypeMetaCollection } from '../types/index.js'
import { Context, GeneratedModule } from '../index.js'
import { MixinModule } from './MixinModule.js'
import { FactoryModule } from './FactoryModule.js'

export function getSuperClasses(clas: GraphPointer, types: TypeMetaCollection) {
  return clas.out(rdfs.subClassOf)
    .toArray()
    .reduce<(ResourceType | ExternalResourceType)[]>((selected, candidate) => {
    const found = types.get(candidate)
    if (found && (found.type === 'Resource' || found.type === 'ExternalResource')) {
      selected.push(found)
    }

    return selected
  }, []).sort((l, r) => l.localName.localeCompare(r.localName))
}

function * getProperties(clas: GraphPointer, types: TypeMetaCollection, context: Context, excludedTerms: TermSet) {
  for (const { term, range } of findProperties(clas, context)) {
    if (excludedTerms.has(term.term)) continue

    for (const jsProperty of toJavascriptProperties(term, range, types, context)) {
      yield jsProperty
    }
  }
}

export function findTermsToGenerate(excludedTerms: NamedNode[]) {
  const excluded = new TermSet(excludedTerms)

  return function (types: TypeMetaCollection, context: Context) {
    const terms = new TermMap(context.vocabulary
      .has(rdf.type, [rdfs.Class, hydra.Class, owl.Class, dash.ShapeClass])
      .filter(term => types.get(term)?.type === 'Resource')
      .map(pointer => [pointer.term, pointer]))

    return [...terms]
      .reduce<GeneratedModule[]>((modules, [, term]) => {
      const meta = types.getOrThrow(term)
      if (meta.type !== 'Resource') {
        throw new Error(`Expected resource type but got ${meta.type}`)
      }

      const props = [...getProperties(term, types, context, excluded)]
      return [...modules, new MixinModule(
        term,
        meta,
        getSuperClasses(term, types),
        props)]
    }, [new FactoryModule({ terms })])
  }
}
