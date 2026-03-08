import { GraphPointer } from 'clownface'
import { rdf, rdfs, schema } from '@tpluscode/rdf-ns-builders'
import { TypeMap } from '../types/index.js'

export function isDatatype(term: GraphPointer, typeMappings: TypeMap): boolean {
  if (term.has(rdf.type, rdfs.Datatype).values.length) {
    return true
  }

  const result = term.has(rdf.type, [schema.DataType, rdfs.Datatype]).values.length > 0
  if (result) {
    return true
  }

  const superClasses = term.out(rdfs.subClassOf).toArray()
  for (const superClass of superClasses) {
    if (isDatatype(superClass, typeMappings)) {
      return true
    }
  }

  return false
}

export function isEnumerationType(term: GraphPointer) {
  if (term.has(rdfs.subClassOf, schema.Enumeration).values.length > 0) {
    return true
  }

  const superClasses = term.out(rdfs.subClassOf).toArray()
  for (const superClass of superClasses) {
    if (isEnumerationType(superClass)) {
      return true
    }
  }

  return false
}
