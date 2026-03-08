import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'
import * as ns from './namespaces.js'
import Node from './Node.js'
import Predicate from './Predicate.js'

class Parser {
  constructor (tree) {
    this.tree = tree
    this.listItems = new TermMap()
    this.listItemsSeen = new TermSet()
    this.listValues = new TermSet()
  }

  _findListItems (node) {
    const list = []

    do {
      this.listItemsSeen.add(node.term)
      list.push(node)
      node = this._findNextItem(node)
    } while (node)

    return list
  }

  _findNextItem (node) {
    const rests = node.predicates.get(ns.rdf.rest)

    if (!rests || rests.objects.size !== 1) {
      return null
    }

    const rest = [...rests.objects.values()][0]

    if (!ns.rdf.nil.equals(rest.term)) {
      return rest
    }

    return null
  }

  _findPreviousItem (node) {
    const refs = node.refs.filter(ref => ref.quads.some(quad => quad.object.equals(node.term)))

    if (refs.length === 1 && refs[0].isListItem) {
      return this.tree.nodes.get(refs[0].term)
    }

    return null
  }

  _findRootItem (node) {
    while (node.isListItem) {
      this.listItemsSeen.add(node.term)

      const previous = this._findPreviousItem(node)

      if (!previous) {
        return node
      }

      node = previous
    }

    return null
  }

  _addQuadNode (node, quad) {
    node.isSubject = true
    node.quads.push(quad)

    let object

    if (!this.tree.nodes.has(quad.object)) {
      object = new Node({
        isObject: true,
        term: quad.object,
        tree: this.tree
      })

      this.tree.nodes.set(quad.object, object)
    } else {
      object = this.tree.nodes.get(quad.object)
    }

    object.refs.push(node)

    let predicate

    if (!node.predicates.has(quad.predicate)) {
      predicate = new Predicate({
        objects: [[quad.object, object]],
        quads: [quad],
        term: quad.predicate
      })

      node.predicates.set(quad.predicate, predicate)

      if (predicate.isType) {
        node.type = predicate
      }
    } else {
      predicate = node.predicates.get(quad.predicate)

      predicate.objects.set(quad.object, object)
      predicate.quads.push(quad)
    }

    if (quad.predicate.equals(ns.rdf.first) || quad.predicate.equals(ns.rdf.rest)) {
      node.isListItem = true

      if (quad.predicate.equals(ns.rdf.first)) {
        this.listValues.add(quad.object)
      }

      this.listItems.set(node.term, node)
    } else if (quad.object.equals(ns.rdf.nil)) {
      predicate.lists.add(quad.object)
    }
  }

  addQuad (quad) {
    let subject

    if (!this.tree.nodes.has(quad.subject)) {
      subject = new Node({
        isSubject: true,
        term: quad.subject,
        tree: this.tree
      })
    } else {
      subject = this.tree.nodes.get(quad.subject)
    }

    this._addQuadNode(subject, quad)
  }

  addQuads (quads) {
    for (const quad of quads) {
      this.addQuad(quad)
    }
  }

  flush () {
    for (const listItem of this.listItems.values()) {
      if (this.listItemsSeen.has(listItem.term)) {
        continue
      }

      const root = this._findRootItem(listItem)

      if (root) {
        for (const ref of root.refs) {
          for (const predicate of ref.predicates.values()) {
            if (predicate.objects.has(root.term)) {
              predicate.lists.add(root.term)
            }
          }
        }

        root.items = this._findListItems(root)
      }
    }

    for (const term of this.listValues.values()) {
      this.tree.nodes.get(term).isListValue = true
    }
  }

  parse (quads) {
    this.addQuads(quads)
    this.flush()

    return this.tree
  }

  static parse (tree, quads) {
    return (new Parser(tree)).parse(quads)
  }
}

export default Parser
