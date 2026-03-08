import type { AnyPointer, GraphPointer } from 'clownface'
import type { BlankNode, NamedNode } from '@rdfjs/types'
import type { Initializer, RdfResourceCore, ResourceIdentifier } from '../RdfResource.js'

export function getPointer(graph: AnyPointer, id?: ResourceIdentifier | string): GraphPointer<BlankNode | NamedNode> {
  if (id && typeof id !== 'string') {
    return graph.node(id)
  }

  if (!id || id.startsWith('_:')) {
    return graph.blankNode()
  }

  return graph.namedNode(id)
}

export function fromInitializer(resource: RdfResourceCore, initializer: Initializer<RdfResourceCore>): RdfResourceCore {
  const term = getPointer(resource.pointer, initializer.id)
  return resource._create(term, [], { initializer })
}
