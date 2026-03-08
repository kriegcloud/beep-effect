import { filterTaggedLiterals } from '../lib/languageTag.js'
import term from './term.js'
import toArray from './toArray.js'

export default class Context {
  constructor({ dataset, graph, value, factory, namespace }) {
    this.dataset = dataset
    this.graph = graph
    this.factory = factory
    this.namespace = namespace
    this.term = term(value, undefined, undefined, factory)
  }

  clone({ dataset = this.dataset, graph = this.graph, value, factory = this.factory, namespace = this.namespace }) {
    return new Context({ dataset, graph, value, factory, namespace })
  }

  has(predicate, object) {
    return this.matchProperty(toArray(this.term), predicate, object, toArray(this.graph), 'subject').map(subject => {
      return this.clone({ value: subject })
    })
  }

  in(predicate) {
    return this.matchProperty(null, predicate, toArray(this.term), toArray(this.graph), 'subject').map(subject => {
      return this.clone({ value: subject })
    })
  }

  out(predicate, { language } = {}) {
    let objects = this.matchProperty(toArray(this.term), predicate, null, toArray(this.graph), 'object')

    if (typeof language !== 'undefined') {
      objects = filterTaggedLiterals(objects, { language })
    }

    return objects.map(object => {
      return this.clone({ value: object })
    })
  }

  addIn(predicates, subjects) {
    const context = []

    if (this.term) {
      subjects.forEach(subject => {
        predicates.forEach(predicate => {
          this.dataset.add(this.factory.quad(subject, predicate, this.term, this.graph))
        })

        context.push(this.clone({ value: subject }))
      })
    }

    return context
  }

  addOut(predicates, objects) {
    const context = []

    if (this.term) {
      objects.forEach(object => {
        predicates.forEach(predicate => {
          this.dataset.add(this.factory.quad(this.term, predicate, object, this.graph))
        })

        context.push(this.clone({ value: object }))
      })
    }

    return context
  }

  addList(predicates, items) {
    if (!this.term) {
      return
    }

    predicates.forEach(predicate => {
      const nodes = items.map(() => this.factory.blankNode())

      this.dataset.add(this.factory.quad(this.term, predicate, nodes[0] || this.namespace.nil, this.graph))

      for (let index = 0; index < nodes.length; index++) {
        this.dataset.add(this.factory.quad(nodes[index], this.namespace.first, items[index], this.graph))
        this.dataset.add(this.factory.quad(nodes[index], this.namespace.rest, nodes[index + 1] || this.namespace.nil, this.graph))
      }
    })
  }

  deleteIn(predicate, subject) {
    this.deleteMatch(subject, predicate, toArray(this.term), toArray(this.graph))
  }

  deleteOut(predicate, objects) {
    this.deleteMatch(toArray(this.term), predicate, objects, toArray(this.graph))
  }

  deleteList(predicates) {
    predicates.forEach(predicate => {
      for (const quad of this.dataset.match(this.term, predicate)) {
        this.deleteItems(quad)
      }
    })
  }

  deleteItems(start) {
    let quads = [start]

    while (!quads[quads.length - 1].object.equals(this.namespace.nil)) {
      const node = quads[quads.length - 1].object

      quads = quads.concat([...this.dataset.match(node)])
    }

    quads.forEach(quad => {
      this.dataset.delete(quad)
    })
  }

  match(subject, predicate, object, graph) {
    // if no parts are given, there is nothing to filter
    if (!subject && !predicate && !object && !graph) {
      return [...this.dataset]
    }

    subject = subject || [null]
    predicate = predicate || [null]
    object = object || [null]
    graph = graph || [null]

    const matches = []

    // use all gspo permutations and combine matches in an array
    for (const g of graph) {
      for (const s of subject) {
        for (const p of predicate) {
          for (const o of object) {
            for (const quad of this.dataset.match(s, p, o, g)) {
              matches.push(quad)
            }
          }
        }
      }
    }

    return matches
  }

  matchProperty(subject, predicate, object, graph, property) {
    return this.match(subject, predicate, object, graph).map(quad => quad[property])
  }

  deleteMatch(subject, predicate, object, graph) {
    this.match(subject, predicate, object, graph).forEach(quad => {
      this.dataset.delete(quad)
    })
  }
}
