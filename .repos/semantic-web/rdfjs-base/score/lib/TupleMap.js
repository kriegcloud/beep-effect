import toNT from '@rdfjs/to-ntriples'
import TupleSet from './TupleSet.js'

class TupleMap extends Map {
  constructor (entries = []) {
    super()

    this._keys = new Map()

    for (const [terms, value] of entries) {
      this.set(terms, value)
    }
  }

  delete (terms) {
    const key = TupleMap.key(terms)

    this._keys.delete(key)

    return super.delete(key)
  }

  get (terms) {
    return super.get(TupleMap.key(terms))
  }

  has (terms) {
    return super.has(TupleMap.key(terms))
  }

  keys () {
    return new TupleSet(this._keys.values())
  }

  set (terms, value) {
    const key = TupleMap.key(terms)

    this._keys.set(key, terms)

    return super.set(key, value)
  }

  static key (terms) {
    return terms.map(term => (term && toNT(term)) || 'undefined').join(' ')
  }
}

export default TupleMap
