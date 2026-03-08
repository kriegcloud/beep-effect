import type { Literal, NamedNode } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'
import rdf from '@rdfjs/data-model'
import type { RdfineEnvironment } from '../environment.js'

export interface FromLiteral {
  (type: BooleanConstructor | StringConstructor | NumberConstructor | DateConstructor, obj: GraphPointer): boolean | string | number | Date
}

export function fromLiteral(env: RdfineEnvironment, type: BooleanConstructor | StringConstructor | NumberConstructor | DateConstructor, obj: GraphPointer) {
  if (type === Boolean) {
    return rdf.literal('true', env.ns.xsd.boolean).equals(obj.term)
  }

  if (type === Number) {
    return Number.parseFloat(obj.value)
  }

  if (type === Date) {
    return new Date(Date.parse(obj.value))
  }

  return obj.value
}

export interface ToLiteral {
  (value: boolean | string | number | Date | bigint | unknown, datatype?: NamedNode): Literal | undefined
}

export function toLiteral(env: RdfineEnvironment, value: boolean | string | number | Date | bigint | unknown, datatype?: NamedNode): Literal | undefined {
  switch (typeof value) {
    case 'boolean':
      return rdf.literal(value.toString(), datatype || env.ns.xsd.boolean)
    case 'number':
      return rdf.literal(value.toString(), datatype || (Number.isInteger(value) ? env.ns.xsd.integer : env.ns.xsd.float))
    case 'bigint':
      return rdf.literal(value.toString(), datatype || env.ns.xsd.long)
    case 'string':
      return rdf.literal(value, datatype)
    case 'object':
      if (value instanceof Date) {
        const literal = value.toISOString()
        if (env.ns.xsd.date.equals(datatype)) {
          return rdf.literal(literal.substr(0, 10), env.ns.xsd.date)
        }

        return rdf.literal(literal, datatype || env.ns.xsd.dateTime)
      }
      break
  }

  return undefined
}
