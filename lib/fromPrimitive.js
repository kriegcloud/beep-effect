import rdf from './environment.js'
import namespace from './namespace.js'

const { xsd } = namespace(rdf)

export function booleanToLiteral(value, factory = rdf) {
  if (typeof value !== 'boolean') {
    return null
  }

  return factory.literal(value.toString(), xsd('boolean'))
}

export function numberToLiteral(value, factory = rdf) {
  if (typeof value !== 'number') {
    return null
  }

  if (Number.isInteger(value)) {
    return factory.literal(value.toString(10), xsd('integer'))
  }

  return factory.literal(value.toString(10), xsd('double'))
}

export function stringToLiteral(value, factory = rdf) {
  if (typeof value !== 'string') {
    return null
  }

  return factory.literal(value)
}

export function toLiteral(value, factory = rdf) {
  return booleanToLiteral(value, factory) ||
    numberToLiteral(value, factory) ||
    stringToLiteral(value, factory)
}
