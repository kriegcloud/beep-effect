import type { Term } from '@rdfjs/types'
import type { RdfResource } from '../RdfResource.js'

export function terms(left: Term, right: Term): boolean {
  return left && left.equals(right)
}

export function resources(compareGraph: boolean) {
  return (left: RdfResource, right: RdfResource): boolean => {
    if (!left || !right) {
      return false
    }

    const idsEqual = left.id.equals(right.id)
    if (!compareGraph) {
      return idsEqual
    }

    return idsEqual && left._graphId.equals(right._graphId)
  }
}
