import rdf from '@rdfjs/data-model'
import PrefixMap from '@rdfjs/prefix-map'
import Tree from '@rdfjs/tree'
import termCompare from './termCompare.js'
import TermSerializer from './TermSerializer.js'
import { activeNamespaces } from './utils.js'

function loop ({ each, filter, items, join }) {
  let first = true

  for (const item of items) {
    if (filter && !filter(item)) {
      continue
    }

    if (!first) {
      join()
    }

    each(item)

    first = false
  }
}

class TurtleSerializer {
  constructor (quads, { baseIRI, output = [], prefixes } = {}) {
    this.baseIRI = baseIRI
    this.output = output
    this.prefixes = new PrefixMap(prefixes, { factory: rdf })
    this.tree = new Tree(quads)

    this.termSerializer = new TermSerializer({
      baseIRI: this.baseIRI,
      prefixes: this.prefixes
    })
  }

  serialize () {
    this.state = {}

    this.serializeBase()
    this.serializePrefixes()

    if (this.state.serializedBase || this.state.serializedPrefixes) {
      this.output.push('\n')
    }

    loop({
      items: [...this.tree.subjects.values()].sort((a, b) => termCompare(a, b)),
      each: subject => this.serializeSubject(subject),
      filter: subject => subject.term.termType !== 'BlankNode' || subject.isListValue || subject.refs.length !== 1,
      join: () => this.output.push('\n')
    })

    return this.output
  }

  serializeBase () {
    if (!this.baseIRI) {
      return
    }

    this.state.serializedBase = true

    this.output.push(`@base <${this.termSerializer.baseIRI}>.\n`)
  }

  serializeList (objectNode) {
    if (!objectNode.items) {
      return this.output.push('()')
    }

    this.output.push('(')

    loop({
      items: objectNode.items,
      each: node => this.output.push(this.toNT(node.item.term)),
      join: () => this.output.push(' ')
    })

    this.output.push(')')
  }

  serializeObject (objectNode, { isList, level, multiple }) {
    if (isList && objectNode.refs.length === 1) {
      return this.serializeList(objectNode, { level })
    }

    if (objectNode.term.termType === 'BlankNode' && objectNode.refs.length === 1) {
      if (objectNode.quads.length === 0) {
        return this.output.push('[]')
      }

      if (multiple) {
        this.output.push(' ')
      }

      this.output.push('[')

      this.serializeTypes(objectNode)

      this.output.push('\n')

      this.serializePredicates([...objectNode.predicates.values()], { level: level + 2 })

      return this.output.push(`\n${this.spaces(level + 1)}]`)
    }

    if (multiple) {
      this.output.push(`\n${this.spaces(level + 1)}`)
    }

    this.output.push(`${this.toNT(objectNode.term)}`)
  }

  serializeObjects (predicate, { level }) {
    if (predicate.objects.size === 1) {
      this.output.push(' ')

      const objectNode = [...predicate.objects.values()][0]
      const isList = predicate.lists.has(objectNode.term)

      this.serializeObject(objectNode, { isList, level })
    } else {
      loop({
        items: [...predicate.objects.values()].sort((a, b) => termCompare(a, b)),
        each: objectNode => {
          const isList = predicate.lists.has(objectNode.term)

          this.serializeObject(objectNode, { isList, level, multiple: true })
        },
        join: () => this.output.push(',')
      })
    }
  }

  serializePredicate (predicate, { level }) {
    this.output.push(this.spaces(level, 1) + this.toNT(predicate.term))

    this.serializeObjects(predicate, { level })
  }

  serializePredicates (predicates, { level }) {
    loop({
      items: predicates.filter(predicate => !predicate.isType).sort((a, b) => termCompare(a, b)),
      each: predicate => this.serializePredicate(predicate, { level }),
      join: () => this.output.push(';\n')
    })
  }

  serializePrefixes () {
    const active = activeNamespaces(this.tree, this.prefixes)

    if (active.size === 0) {
      return
    }

    this.state.serializedPrefixes = true

    for (const prefix of [...active].sort()) {
      this.output.push(`@prefix ${prefix}: <${this.prefixes.get(prefix).value}>.\n`)
    }
  }

  serializeSubject (node, { level = 0 } = {}) {
    const unlabeledBlankNode = node.term.termType === 'BlankNode' && node.refs.length <= 1 && !node.isListValue

    if (unlabeledBlankNode) {
      this.output.push('[')
    } else {
      this.output.push(this.toNT(node.term))
    }

    this.serializeTypes(node)

    this.output.push('\n')

    this.serializePredicates([...node.predicates.values()], { level: level + 1 })

    if (unlabeledBlankNode) {
      this.output.push('\n]')
    }

    this.output.push('.\n')
  }

  serializeTypes (node) {
    if (!node.type) {
      return
    }

    this.output.push(' a ')

    loop({
      items: [...node.type.objects.values()].sort((a, b) => termCompare(a, b)),
      each: type => this.output.push((this.toNT(type.term))),
      join: () => this.output.push(', ')
    })

    this.output.push(';')
  }

  spaces (level) {
    return ' '.repeat(level * 2)
  }

  toNT (term) {
    return this.termSerializer.serialize(term)
  }

  static serialize (quads, { baseIRI, output, prefixes } = {}) {
    return new TurtleSerializer(quads, { baseIRI, output, prefixes }).serialize()
  }
}

export default TurtleSerializer
