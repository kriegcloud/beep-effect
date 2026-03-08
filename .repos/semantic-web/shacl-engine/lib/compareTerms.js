import { fromRdf } from 'rdf-literal'
import * as ns from './namespaces.js'

function compareTerms (termA, termB) {
  if (!termA || termA.termType !== 'Literal') {
    return null
  }

  if (!termB || termB.termType !== 'Literal') {
    return null
  }

  if (hasTimezone(termA) !== hasTimezone(termB)) {
    return null
  }

  const valueA = fromRdf(termA)
  const valueB = fromRdf(termB)

  if (typeof valueA !== typeof valueB) {
    return null
  }

  if (typeof valueA === 'string') {
    return valueA.localeCompare(valueB)
  }

  return valueA - valueB
}

function hasTimezone (term) {
  const pattern = /^.*(((\+|-)\d{2}:\d{2})|Z)$/

  return ns.xsd.dateTime.equals(term.datatype) && pattern.test(term.value)
}

export default compareTerms
