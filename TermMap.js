import toNT from '@rdfjs/to-ntriples'

class TermMap {
  constructor (entries) {
    this.index = new Map()

    if (entries) {
      for (const [term, value] of entries) {
        this.set(term, value)
      }
    }
  }

  get size () {
    return this.index.size
  }

  clear () {
    this.index.clear()
  }

  delete (term) {
    return this.index.delete(toNT(term))
  }

  * entries () {
    for (const [, { term, value }] of this.index) {
      yield [term, value]
    }
  }

  forEach (callback, thisArg) {
    for (const entry of this.entries()) {
      callback.call(thisArg, entry[1], entry[0], this)
    }
  }

  get (term) {
    const item = this.index.get(toNT(term))

    return item && item.value
  }

  has (term) {
    return this.index.has(toNT(term))
  }

  * keys () {
    for (const [, { term }] of this.index) {
      yield term
    }
  }

  set (term, value) {
    const key = toNT(term)

    this.index.set(key, { term, value })

    return this
  }

  * values () {
    for (const [, { value }] of this.index) {
      yield value
    }
  }

  [Symbol.iterator] () {
    return this.entries()[Symbol.iterator]()
  }
}

export default TermMap
