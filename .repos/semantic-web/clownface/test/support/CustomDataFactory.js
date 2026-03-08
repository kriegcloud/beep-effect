import rdf from 'rdf-ext'

export default class {
  quad(s, p, o, g) {
    const quad = rdf.quad(s, p, o, g)
    quad.testProperty = 'test'
    return quad
  }

  literal(value, languageOrDatatype) {
    const node = rdf.literal(value, languageOrDatatype)
    node.testProperty = 'test'
    return node
  }

  blankNode(value) {
    const node = rdf.blankNode(value)
    node.testProperty = 'test'
    return node
  }

  namedNode(value) {
    const node = rdf.namedNode(value)
    node.testProperty = 'test'
    return node
  }

  static get exports() {
    return ['quad', 'literal', 'namedNode', 'blankNode']
  }
}
