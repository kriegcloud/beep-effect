import { rdfs } from '@tpluscode/rdf-ns-builders'
import prefixes, { shrink } from '@zazuko/prefixes'
import TermMap from '@rdfjs/term-map'
import { NamedNode } from '@rdfjs/types'
import { GraphPointer } from 'clownface'
import { Context, GeneratedModule } from '../index.js'
import { TypeMetaCollection } from '../types/index.js'
import { toJavascriptProperties } from '../property/JsProperties.js'
import { findRanges } from '../property/index.js'
import { ExtensionModule } from './ExtensionModule.js'
import { ExtensionIndexModule } from './ExtensionIndexModule.js'

interface AddToMapParams {
  property: GraphPointer
  domain: GraphPointer
  types: TypeMetaCollection
  context: Pick<Context, 'properties' | 'log'>
}

function addExtension(extensions: Map<NamedNode, ExtensionModule>, { property, domain, types, context }: AddToMapParams) {
  const type = types.get(domain)

  if (!(domain.term.termType === 'NamedNode' && type?.type === 'ExternalResource')) {
    return false
  }

  let module = extensions.get(domain.term)
  if (!module) {
    module = new ExtensionModule({ domain, type })
    extensions.set(domain.term, module)
  }
  const sortedProperties = [...toJavascriptProperties(property, findRanges(property), types, context)]
    .sort((left, right) => left.name.localeCompare(right.name))
  module.addProperties(...sortedProperties)

  return true
}

export function findTermsToGenerate(types: TypeMetaCollection, context: Pick<Context, 'vocabulary' | 'log' | 'properties' | 'prefix'>): GeneratedModule[] {
  const extensions = new TermMap<NamedNode, ExtensionModule>()
  const extendedTerms = new Map<string, Set<string>>()

  const extendingProperties = context.vocabulary.has(rdfs.domain)
  for (const property of extendingProperties.toArray()) {
    for (const domain of property.out(rdfs.domain).toArray()) {
      const [prefix, term] = shrink(domain.value).split(':')
      if (domain.value.startsWith(prefixes[context.prefix])) {
        continue
      }

      if (!types.get(domain)) {
        context.log.debug(`Skipping extensions of ignored type ${domain.value}`)
        continue
      }

      if (!(prefix in prefixes)) {
        context.log.warn(`Extended term from unknown vocabulary: ${domain.value}`)
        continue
      }

      const added = addExtension(extensions, {
        property,
        domain,
        types,
        context,
      })

      if (added) {
        const extendedTermFromPrefix = extendedTerms.get(prefix) || new Set()
        extendedTermFromPrefix.add(term)
        extendedTerms.set(prefix, extendedTermFromPrefix)
      }
    }
  }

  const indexModules = [...extendedTerms].map(([prefix, terms]) => new ExtensionIndexModule(prefix, [...terms]))

  return [
    ...extensions.values(),
    ...indexModules,
  ]
}
