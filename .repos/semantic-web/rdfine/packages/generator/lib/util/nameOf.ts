import { shrink } from '@zazuko/prefixes'
import { GraphPointer } from 'clownface'

const rdfineBaseNames = ['equals', 'types', 'pointer', 'unionGraphPointer', '_graphId', '_parent', 'isAnonymous', 'hasType', 'get', 'getArray', 'getBoolean', 'getString', 'getNumber', 'toJSON', '_getObjects', '_create']

export function nameOf(term: GraphPointer, safeIdentifier = false): string {
  const shrunk = shrink(term.value)

  const name = shrunk.split(':')[1]
  if (rdfineBaseNames.includes(name) && safeIdentifier) {
    return `_${name}`
  }
  return name
}
