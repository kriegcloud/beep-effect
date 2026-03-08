import { GraphPointer } from 'clownface'
import { shrink } from '@zazuko/prefixes'
import { owl } from '@tpluscode/rdf-ns-builders'
import { Term } from '@rdfjs/types'
import { TypeMeta, TypeMetaCollection } from '../types/index.js'
import { Context } from '../index.js'
import { nameOf } from '../util/nameOf.js'
import { Range } from './index.js'

type PropertyReturnKind = 'array' | 'list' | 'single'

export interface JavascriptProperty {
  semantics: 'strict' | 'loose' | undefined
  name: string
  range: TypeMeta[]
  term: Term
  termName: string
  prefixedTerm: string
  type: 'resource' | 'term' | 'literal'
  values?: PropertyReturnKind[]
}

function * fromOwlConstruct(range: Range, types: TypeMetaCollection, log: Context['log']): Generator<TypeMeta> {
  const oneOf = range.term.out(owl.oneOf).list()
  if (oneOf) {
    for (const element of oneOf) {
      const meta = types.get(element)
      if (meta) {
        yield meta
      } else {
        log.warn('Unrecognized property range %s', element.value)
      }
    }
    return
  }

  log.warn('Unrecognized property range %s', range.term.value)
}

function groupRangeTypes(range: Range[], types: TypeMetaCollection, { log }: Pick<Context, 'log'>) {
  const grouped = {
    resource: [] as TypeMeta[],
    literal: [] as TypeMeta[],
    term: [] as TypeMeta[],
  }

  for (const rangeType of range) {
    let metas: TypeMeta[]

    if (rangeType.term.term.termType === 'BlankNode') {
      metas = [...fromOwlConstruct(rangeType, types, log)]
    } else {
      const meta = types.get(rangeType.term)

      if (!meta) {
        log.warn(`Skipping unrecognized property type ${rangeType.term.value}`)
        continue
      }
      metas = [meta]
    }

    for (const meta of metas) {
      switch (meta.type) {
        case 'Constant':
          if (!grouped.literal.some(range => range.type === 'Constant' && range.value === meta.value)) {
            grouped.literal.push(meta)
          }
          continue
        case 'Literal':
          grouped.literal.push(meta)
          continue
        case 'Resource':
        case 'ExternalResource':
          grouped.resource.push(meta)
          continue
        default:
          grouped.term.push(meta)
      }
    }
  }

  return grouped
}

function getPrefixedTerm(prop: GraphPointer) {
  const shrunk = shrink(prop.value) || nameOf(prop)
  const [prefix, term] = shrunk.split(':')
  if (/^[a-zA-Z]+$/.test(term)) {
    return `${prefix}.${term}`
  }

  return `${prefix}['${term}']`
}

export function * toJavascriptProperties(prop: GraphPointer, range: Range[], types: TypeMetaCollection, context: Pick<Context, 'log' | 'properties'>): Iterable<JavascriptProperty> {
  const ranges = groupRangeTypes(range, types, context)
  const baseProperty: Omit<JavascriptProperty, 'type' | 'range'> = {
    semantics: undefined,
    term: prop.term,
    name: nameOf(prop, true),
    termName: nameOf(prop),
    prefixedTerm: getPrefixedTerm(prop),
  }
  let resourceProperty: JavascriptProperty | null = null
  let literalProperty: JavascriptProperty | null = null
  let termProperty: JavascriptProperty | null = null

  const override = context.properties[prop.term.value]
  if (override && override.values) {
    baseProperty.values = Array.isArray(override.values) ? override.values : [override.values]
  }

  if (ranges.resource.length) {
    const semantics = range.every(r => r.strictSemantics) ? 'strict' : 'loose'

    resourceProperty = {
      ...baseProperty,
      range: ranges.resource,
      type: 'resource',
      semantics,
    }
  }

  if (ranges.literal.length) {
    const name = ranges.resource.length ? `${baseProperty.name}Literal` : baseProperty.name
    literalProperty = {
      ...baseProperty,
      name,
      range: ranges.literal,
      type: 'literal',
    }
  }

  if ((ranges.term.length && !ranges.resource.length) || (!ranges.literal.length && !ranges.resource.length)) {
    const name = ranges.literal.length ? `${baseProperty.name}Term` : baseProperty.name
    termProperty = {
      ...baseProperty,
      name,
      range: ranges.term,
      type: 'term',
    }
  }

  if (resourceProperty) yield resourceProperty
  if (literalProperty) yield literalProperty
  if (termProperty) yield termProperty
}
