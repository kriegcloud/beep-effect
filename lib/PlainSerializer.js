import stringEscape from 'js-string-escape'
import CommonJsWriter from './writer/CommonJsWriter.js'
import ECMAScriptModuleWriter from './writer/ECMAScriptModuleWriter.js'
import TypeScriptWriter from './writer/TypeScriptWriter.js'

const namespaceRegex = /((?:.*)(?:[/#]))([^/#]*)$/

class PlainSerializer {
  constructor ({ module } = {}) {
    switch (module) {
      case 'commonjs':
        this.writer = new CommonJsWriter()
        break
      case 'ts':
        this.writer = new TypeScriptWriter()
        break
      default:
        this.writer = new ECMAScriptModuleWriter()
        break
    }
  }

  transform (quads) {
    const blankNodes = new Map()
    const namespaces = new Map()

    const quadStrings = [...quads].map(quad => this.serializeQuad(quad, blankNodes, namespaces))
    const prefixesStrings = [...namespaces.entries()].map(([namespace, prefix]) => `  const ${prefix} = '${namespace}'`)

    let lines = [
      '/* This file was automatically generated. Do not edit by hand. */',
      '',
      ...this.writer.leadingLines()
    ]

    if (quadStrings.length > 0) {
      lines = lines.concat([
        '  const f = factory',
        prefixesStrings.join('\n'),
        this.writer.blankNodesLines(blankNodes.size),
        `  return [\n${quadStrings.join(',\n')}\n  ]`
      ])
    } else {
      lines.push('  return []')
    }

    lines.push('}\n')

    return lines.filter(part => part !== null).join('\n')
  }

  serializerTerm (term, blankNodes, namespaces) {
    if (term.termType === 'BlankNode') {
      return this.serializeBlankNode(term, blankNodes)
    }

    if (term.termType === 'Literal') {
      return this.serializeLiteral(term, namespaces)
    }

    if (term.termType === 'NamedNode') {
      return `${this.serializeNamedNode(term, namespaces)}`
    }

    throw new Error(`unknown term type: ${term.termType}`)
  }

  serializeBlankNode (blankNode, blankNodes) {
    if (!blankNodes.has(blankNode.value)) {
      blankNodes.set(blankNode.value, blankNodes.size)
    }

    return `blankNodes[${blankNodes.get(blankNode.value)}]`
  }

  serializeLiteral (literal, namespaces) {
    const value = stringEscape(literal.value)

    if (literal.language) {
      return `f.literal('${value}', '${literal.language}')`
    }

    if (literal.datatype.value === 'http://www.w3.org/2001/XMLSchema#string') {
      return `f.literal('${value}')`
    }

    return `f.literal('${value}', ${this.serializeNamedNode(literal.datatype, namespaces)})`
  }

  serializeNamedNode (namedNode, namespaces) {
    const result = namedNode.value.match(namespaceRegex)

    if (!result) {
      return `f.namedNode('${namedNode.value}')`
    }

    const [, namespace, term] = result
    const prefix = namespaces.get(namespace) || `ns${namespaces.size + 1}`

    namespaces.set(namespace, prefix)

    if (!term) {
      return `f.namedNode(${prefix})`
    }

    return 'f.namedNode(`${' + prefix + '}' + term + '`)'
  }

  serializeQuad (quad, blankNodes, namespaces) {
    const parts = [quad.subject, quad.predicate, quad.object, quad.graph]
      .filter(part => part.termType !== 'DefaultGraph')
      .map(part => `      ${this.serializerTerm(part, blankNodes, namespaces)}`)
      .join(',\n')

    return `    f.quad(\n${parts}\n    )`
  }
}

export default PlainSerializer
