import { toLiteral } from './fromPrimitive.js'

function blankNode(value, factory) {
  if (value && typeof value !== 'string') {
    throw new Error('Blank node identifier must be a string')
  }

  return factory.blankNode(value)
}

function literal(value, languageOrDatatype, factory) {
  if (typeof value === 'string') {
    // check if it's given, if given try RDF/JS Term value otherwise convert it to a string
    languageOrDatatype = languageOrDatatype && (languageOrDatatype.value || languageOrDatatype.toString())

    if (languageOrDatatype && languageOrDatatype.indexOf(':') !== -1) {
      languageOrDatatype = factory.namedNode(languageOrDatatype)
    }

    return factory.literal(value.toString(), languageOrDatatype)
  }

  const term = toLiteral(value, factory)

  if (!term) {
    throw new Error('The value cannot be converted to a literal node')
  }

  return term
}

function namedNode(value, factory) {
  if (typeof value !== 'string') {
    throw new Error('Named node must be an IRI string')
  }

  return factory.namedNode(value)
}

export default function term(value, type = 'Literal', languageOrDatatype, factory) {
  // it's already a RDF/JS Term
  if (value && typeof value === 'object' && value.termType) {
    return value
  }

  // check if it's a URL object
  if (value && value.constructor.name === 'URL') {
    return namedNode(value.toString(), factory)
  }

  // check if it's a blank node...
  if (type === 'BlankNode') {
    return blankNode(value, factory)
  }

  // ...cause that's the only type that doesn't require a value
  if (value === null || typeof value === 'undefined') {
    return undefined
  }

  if (type === 'Literal') {
    return literal(value, languageOrDatatype, factory)
  }

  if (type === 'NamedNode') {
    return namedNode(value, factory)
  }

  throw new Error('unknown type')
}
