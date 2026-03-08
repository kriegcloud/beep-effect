import rdf from '@rdfjs/data-model'
import toReadable from 'duplex-to/readable.js'
import { JsonLdParser } from 'jsonld-streaming-parser'
import { Transform } from 'readable-stream'

const relativeIriProtocol = 'null:'

function termCleanup (factory) {
  return term => {
    if (term.termType !== 'NamedNode') {
      return null
    }

    if (!term.value.startsWith(relativeIriProtocol)) {
      return null
    }

    // remove dummy protocol workaround for relative IRIs
    return factory.namedNode(term.value.slice(relativeIriProtocol.length))
  }
}

function quadCleanup (factory) {
  const cleanup = termCleanup(factory)

  return quad => {
    const subject = cleanup(quad.subject)
    const predicate = cleanup(quad.predicate)
    const object = cleanup(quad.object)
    const graph = cleanup(quad.graph)

    if (subject || predicate || object || graph) {
      return factory.quad(
        subject || quad.subject,
        predicate || quad.predicate,
        object || quad.object,
        graph || quad.graph
      )
    }

    return quad
  }
}

class ParserStream {
  constructor (input, { baseIRI = relativeIriProtocol, context = null, documentLoader, factory = rdf } = {}) {
    const parser = new JsonLdParser({
      baseIRI,
      context,
      dataFactory: factory,
      documentLoader,
      streamingProfile: false
    })

    input.pipe(parser)

    const cleanup = quadCleanup(factory)

    const transform = new Transform({
      objectMode: true,
      transform: (quad, encoding, callback) => {
        callback(null, cleanup(quad))
      }
    })

    parser.on('context', context => {
      Object.entries(context).forEach(([prefix, iri]) => {
        transform.emit('prefix', prefix, factory.namedNode(iri))
      })
    })
    parser.on('error', err => transform.destroy(err))
    parser.pipe(transform)

    return toReadable(transform)
  }
}

export default ParserStream
