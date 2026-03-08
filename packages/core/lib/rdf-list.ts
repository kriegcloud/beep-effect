import type { AnyPointer, GraphPointer } from 'clownface'
import type * as ns from '@tpluscode/rdf-ns-builders'
import namespace from '@rdfjs/namespace'
import type { NamedNode, DatasetCore, Term } from '@rdfjs/types'
import type { RdfResource } from '../RdfResource.js'

const rdf: typeof ns.rdf = namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#') as any

function isLast(node: AnyPointer): boolean {
  return rdf.nil.equals(node.term)
}

export function isList(node: AnyPointer): boolean {
  const isLastListNode = isLast(node)
  const isListNode = node.out([rdf.first, rdf.rest]).values.length === 2
  return isLastListNode || isListNode
}

export function enumerateList<T, D extends DatasetCore = DatasetCore>(parent: RdfResource<D>, listNode: GraphPointer<Term, D>, fromTerm: (obj: GraphPointer<Term, D>) => T | T[]): T[] {
  const items: T[] = []

  let current = listNode
  while (!isLast(current)) {
    const firstItem = current.out(parent.env.ns.rdf.first).map((first, index) => {
      if (index > 0) {
        throw new Error('Malformed RDF List with multiple rdf:first objects')
      }

      return fromTerm.call(parent, first)
    })

    firstItem.forEach(item => {
      if (Array.isArray(item)) {
        throw new Error('Malformed RDF List had multiple rdf:first objects')
      }

      items.push(item)
    })

    current = current.out(parent.env.ns.rdf.rest).map((quad, index) => {
      if (index > 0) {
        throw new Error('Malformed RDF List with multiple rdf:rest objects')
      }

      return quad
    })[0]
  }

  return items
}

type Iri<N> = N extends NamedNode<infer I> ? I : never

type rdfFirst = Iri<typeof rdf.first>
type rdfRest = Iri<typeof rdf.rest>
type ListInit<T> = { [key in rdfFirst]: T} & { [key in rdfRest]: ListInit<T> | typeof rdf.nil }

export function initialize<T>(...items: T[]): ListInit<T> | typeof rdf.nil {
  return items.reduceRight((prev: ListInit<T> | null, item): ListInit<T> => {
    if (!prev) {
      return {
        [rdf.first.value]: item,
        [rdf.rest.value]: rdf.nil,
      }
    }

    return {
      [rdf.first.value]: item,
      [rdf.rest.value]: prev,
    }
  }, null) || rdf.nil
}
