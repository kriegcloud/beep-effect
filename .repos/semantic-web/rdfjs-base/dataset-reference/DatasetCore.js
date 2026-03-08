const isMatch = require('./isMatch')

class DatasetCore {
  constructor (quads) {
    this.quads = new Set()

    if (quads) {
      for (const quad of quads) {
        this.quads.add(quad)
      }
    }
  }

  get size () {
    return this.quads.size
  }

  add (quad) {
    if (!this.has(quad)) {
      this.quads.add(quad)
    }

    return this
  }

  delete (quad) {
    for (const localQuad of this) {
      if (isMatch(quad, localQuad.subject, localQuad.predicate, localQuad.object, localQuad.graph)) {
        this.quads.delete(localQuad)

        return this
      }
    }

    return this
  }

  has (quad) {
    for (const other of this) {
      if (isMatch(other, quad.subject, quad.predicate, quad.object, quad.graph)) {
        return true
      }
    }

    return false
  }

  match (subject, predicate, object, graph) {
    const matches = new Set()

    for (const quad of this) {
      if (isMatch(quad, subject, predicate, object, graph)) {
        matches.add(quad)
      }
    }

    return new this.constructor(matches)
  }

  [Symbol.iterator] () {
    return this.quads[Symbol.iterator]()
  }
}

module.exports = DatasetCore
