import rdf from '@rdfjs/data-model'
import toReadable from 'duplex-to/readable.js'
import { StreamParser } from 'n3'

class ParserStream {
  constructor (input, { baseIRI = '', factory = rdf, ...rest } = {}) {
    const boundFactory = {
      blankNode: factory.blankNode.bind(factory),
      defaultGraph: factory.defaultGraph.bind(factory),
      literal: factory.literal.bind(factory),
      namedNode: factory.namedNode.bind(factory),
      quad: factory.quad.bind(factory),
      variable: factory.variable.bind(factory)
    }

    const parser = new StreamParser({ baseIRI, factory: boundFactory, ...rest })

    input.pipe(parser)

    return toReadable(parser)
  }
}

export default ParserStream
