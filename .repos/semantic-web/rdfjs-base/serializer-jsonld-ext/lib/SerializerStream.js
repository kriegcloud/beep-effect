import jsonld from 'jsonld'
import { Readable } from 'readable-stream'
import chunks from 'stream-chunks/chunks.js'

class SerializerStream extends Readable {
  constructor (input, {
    baseIRI,
    compact,
    context = {},
    encoding = 'object',
    flatten,
    frame,
    prettyPrint,
    skipContext
  } = {}) {
    super({
      objectMode: true,
      read: () => {}
    })

    this.compact = compact
    this.context = context
    this.encoding = encoding
    this.flatten = flatten
    this.frame = frame
    this.prettyPrint = prettyPrint
    this.skipContext = skipContext

    if (baseIRI) {
      this.context['@base'] = baseIRI.value || baseIRI.toString()
    }

    input.on('prefix', (prefix, namespace) => {
      if (!this.context[prefix]) {
        this.context[prefix] = namespace.value
      }
    })

    this.handleData(input)
  }

  async handleData (input) {
    try {
      const quadArray = (await chunks(input)).map(SerializerStream.toJsonldQuad)
      const rawJsonld = await jsonld.fromRDF(quadArray)
      const transformedJsonld = await this.transform(rawJsonld, this.options)

      this.push(transformedJsonld)
      this.push(null)
    } catch (err) {
      this.emit('error', err)
    }
  }

  async transform (data) {
    if (this.compact) {
      data = await jsonld.compact(data, this.context)
    }

    if (this.flatten) {
      data = await jsonld.flatten(data, this.context)
    }

    if (this.frame) {
      data = await jsonld.frame(data, this.context)
    }

    if (this.skipContext && data['@context']) {
      delete data['@context']
    }

    if (this.encoding === 'string') {
      if (this.prettyPrint) {
        return JSON.stringify(data, null, 2)
      } else {
        return JSON.stringify(data)
      }
    }

    return data
  }

  static toJsonldQuad (quad) {
    return {
      subject: SerializerStream.toJsonldTerm(quad.subject),
      predicate: SerializerStream.toJsonldTerm(quad.predicate),
      object: SerializerStream.toJsonldTerm(quad.object),
      graph: SerializerStream.toJsonldTerm(quad.graph)
    }
  }

  static toJsonldTerm (term) {
    if (term.termType === 'BlankNode') {
      return {
        termType: 'BlankNode',
        value: `_:${term.value}`
      }
    }

    return term
  }
}

export default SerializerStream
