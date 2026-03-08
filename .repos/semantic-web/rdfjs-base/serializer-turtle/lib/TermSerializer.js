import TermMap from '@rdfjs/term-map'
import toNT from '@rdfjs/to-ntriples'
import * as ns from './namespaces.js'
import {
  isBoolean,
  isDecimal,
  isDouble,
  isInteger,
  isLangString,
  isString
} from './utils.js'

class TermSerializer {
  constructor ({ baseIRI, prefixes }) {
    this.baseIRI = baseIRI && (baseIRI.value || baseIRI.toString())
    this.prefixes = prefixes

    this.bnodeIds = new TermMap()
  }

  serialize (term) {
    if (term.termType === 'BlankNode') {
      if (!this.bnodeIds.has(term)) {
        this.bnodeIds.set(term, this.bnodeIds.size + 1)
      }

      return `_:b${this.bnodeIds.get(term)}`
    }

    if (term.termType === 'Literal') {
      if (isBoolean(term)) {
        if (term.value === 'true' || term.value === 'false') {
          return term.value
        }
      } else if (isDecimal(term)) {
        if (/^[+-]?[0-9]*\.[0-9]+$/.test(term.value)) {
          return term.value
        }
      } else if (isDouble(term)) {
        if (/^[+-]?(?:[0-9]+\.[0-9]*|\.?[0-9]+)[eE][+-]?[0-9]+$/.test(term.value)) {
          return term.value
        }
      } else if (isInteger(term)) {
        if (/^[+-]?[0-9]+$/.test(term.value)) {
          return term.value
        }
      } else if (!isLangString(term) && !isString(term)) {
        const escaped = toNT({
          datatype: ns.xsd.string,
          termType: 'Literal',
          value: term.value
        })
        const shrinked = this.prefixes.shrink(term.datatype)

        if (shrinked) {
          return `${escaped}^^${shrinked.value}`
        }
      }
    }

    if (term.termType === 'NamedNode') {
      if (this.baseIRI && term.value.startsWith(this.baseIRI)) {
        return `<${term.value.slice(this.baseIRI.length)}>`
      }

      const shrinked = this.prefixes.shrink(term)

      if (shrinked) {
        return shrinked.value
      }
    }

    return toNT(term)
  }
}

export default TermSerializer
