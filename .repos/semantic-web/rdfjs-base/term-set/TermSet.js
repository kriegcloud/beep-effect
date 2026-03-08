import toNT from '@rdfjs/to-ntriples'

function quietToNT (term) {
  try {
    return toNT(term)
  } catch (err) {
    return null
  }
}

class TermSet {
  constructor (terms) {
    this.index = new Map()

    if (terms) {
      for (const term of terms) {
        this.add(term)
      }
    }
  }

  get size () {
    return this.index.size
  }

  add (term) {
    const key = toNT(term)

    if (!this.index.has(key)) {
      this.index.set(key, term)
    }

    return this
  }

  clear () {
    this.index.clear()
  }

  delete (term) {
    if (!term) {
      return false
    }

    return this.index.delete(quietToNT(term))
  }

  entries () {
    return this.values().entries()
  }

  forEach (callbackfn, thisArg) {
    return this.values().forEach(callbackfn, thisArg)
  }

  has (term) {
    if (!term) {
      return false
    }

    return this.index.has(quietToNT(term))
  }

  values () {
    return new Set(this.index.values())
  }

  keys () {
    return this.values()
  }

  [Symbol.iterator] () {
    return this.index.values()
  }
}

export default TermSet
