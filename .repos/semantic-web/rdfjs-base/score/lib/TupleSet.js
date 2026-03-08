import toNT from '@rdfjs/to-ntriples'

class TupleSet extends Set {
  constructor (entries = []) {
    super()

    this._index = new Map()

    for (const terms of entries) {
      this.add(terms)
    }
  }

  add (terms) {
    this._index.set(TupleSet.key(terms), terms)

    return super.add(terms)
  }

  delete (terms) {
    const item = this._index.get(TupleSet.key(terms))

    return super.delete(item)
  }

  has (terms) {
    return this._index.has(TupleSet.key(terms))
  }

  static key (terms) {
    return terms.map(term => (term && toNT(term)) || 'undefined').join(' ')
  }
}

export default TupleSet
