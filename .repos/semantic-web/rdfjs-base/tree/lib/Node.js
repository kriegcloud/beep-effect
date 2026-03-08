import TermMap from '@rdfjs/term-map'
import * as ns from './namespaces.js'

class Node {
  constructor ({ isObject = false, isSubject = false, term, tree } = {}) {
    this.items = null
    this.isListItem = false
    this.isListValue = false
    this.predicates = new TermMap()
    this.quads = []
    this.refs = []
    this.term = term
    this.tree = tree
    this.type = null

    if (this.tree && this.term) {
      if (this.term) {
        this.tree.nodes.set(this.term, this)
      }
    }

    this.isObject = isObject
    this.isSubject = isSubject
  }

  get isObject () {
    return this._isObject
  }

  set isObject (value) {
    if (value) {
      this._isObject = true

      if (this.tree) {
        this.tree.objects.set(this.term, this)
      }
    } else {
      this._isObject = false

      if (this.tree) {
        this.tree.objects.delete(this.term)
      }
    }
  }

  get isSubject () {
    return this._isSubject
  }

  set isSubject (value) {
    if (value) {
      this._isSubject = true

      if (this.tree) {
        this.tree.subjects.set(this.term, this)
      }
    } else {
      this._isSubject = false

      if (this.tree) {
        this.tree.subjects.delete(this.term)
      }
    }
  }

  get item () {
    const predicate = this.predicates.get(ns.rdf.first)

    if (!predicate || predicate.objects.size !== 1) {
      return undefined
    }

    return [...predicate.objects.values()][0]
  }
}

export default Node
