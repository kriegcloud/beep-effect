import { rejects, strictEqual } from 'assert'
import sinkTest from '@rdfjs/sink/test/index.js'
import { isReadableStream, isWritableStream } from 'is-stream'
import { describe, it } from 'mocha'
import { Readable } from 'readable-stream'
import chunks from 'stream-chunks/chunks.js'
import FsDocumentLoader from '../FsDocumentLoader.js'
import JSONLDParser from '../index.js'

describe('@rdfjs/parser-jsond', () => {
  sinkTest(JSONLDParser, { readable: true })

  it('should return a readable stream', async () => {
    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from('{}'))

    strictEqual(isReadableStream(stream), true)
    strictEqual(isWritableStream(stream), false)

    await chunks(stream)
  })

  it('should support Named Node subjects', async () => {
    const example = JSON.stringify({
      '@id': 'http://example.org/subject',
      'http://example.org/predicate': 'object'
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'NamedNode')
    strictEqual(output[0].subject.value, 'http://example.org/subject')
  })

  it('should support empty Named Node subjects', async () => {
    const example = JSON.stringify({
      '@id': '',
      'http://example.org/predicate': 'object'
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'NamedNode')
    strictEqual(output[0].subject.value, '')
    strictEqual(output[0].predicate.termType, 'NamedNode')
    strictEqual(output[0].predicate.value, 'http://example.org/predicate')
    strictEqual(output[0].object.termType, 'Literal')
    strictEqual(output[0].object.value, 'object')
  })

  it('should support relative Named Node subjects', async () => {
    const example = JSON.stringify({
      '@id': 'relative',
      'http://example.org/predicate': 'object'
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'NamedNode')
    strictEqual(output[0].subject.value, 'relative')
  })

  it('should support Blank Node subjects', async () => {
    const example = JSON.stringify({
      'http://example.org/predicate': 'object'
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'BlankNode')
  })

  it('should parse the predicate', async () => {
    const example = JSON.stringify({
      'http://example.org/predicate': 'object'
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].predicate.termType, 'NamedNode')
    strictEqual(output[0].predicate.value, 'http://example.org/predicate')
  })

  it('should parse a Named Node object', async () => {
    const example = JSON.stringify({
      'http://example.org/predicate': {
        '@id': 'http://example.org/object'
      }
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].object.termType, 'NamedNode')
    strictEqual(output[0].object.value, 'http://example.org/object')
  })

  it('should parse a Blank Node object', async () => {
    const example = JSON.stringify({
      'http://example.org/predicate': {}
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].object.termType, 'BlankNode')
    strictEqual(output[0].object.value.startsWith('_:'), false)
  })

  it('should keep Blank Node object mapping', async () => {
    const example = JSON.stringify({
      'http://example.org/predicate1': { '@id': '_:b0' },
      'http://example.org/predicate2': { '@id': '_:b0' }
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 2)
    strictEqual(output[0].object.equals(output[1].object), true)
  })

  it('should parse a Literal object', async () => {
    const example = JSON.stringify({
      'http://example.org/predicate': {
        '@value': 'object'
      }
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].object.termType, 'Literal')
    strictEqual(output[0].object.value, 'object')
    strictEqual(output[0].object.language, '')
    strictEqual(output[0].object.datatype.value, 'http://www.w3.org/2001/XMLSchema#string')
  })

  it('should parse the language of a Literal object', async () => {
    const example = JSON.stringify({
      'http://example.org/predicate': {
        '@value': 'object',
        '@language': 'en'
      }
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].object.termType, 'Literal')
    strictEqual(output[0].object.value, 'object')
    strictEqual(output[0].object.language, 'en')
    strictEqual(output[0].object.datatype.value, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString')
  })

  it('should parse the datatype of a Literal object', async () => {
    const example = JSON.stringify({
      'http://example.org/predicate': {
        '@value': 'object',
        '@type': 'http://example.org/datatype'
      }
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].object.termType, 'Literal')
    strictEqual(output[0].object.value, 'object')
    strictEqual(output[0].object.language, '')
    strictEqual(output[0].object.datatype.value, 'http://example.org/datatype')
  })

  it('should parse the datatype of a Literal object into a full featured Literal', async () => {
    const example = JSON.stringify({
      'http://example.org/predicate': {
        '@value': 'object',
        '@type': 'http://example.org/datatype'
      }
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(typeof output[0].object.datatype.equals, 'function')
  })

  it('should use the default graph if none was given', async () => {
    const example = JSON.stringify({
      'http://example.org/predicate': 'object'
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].graph.termType, 'DefaultGraph')
  })

  it('should parse graph', async () => {
    const example = JSON.stringify({
      '@id': 'http://example.org/graph',
      '@graph': {
        'http://example.org/predicate': 'object'
      }
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].graph.termType, 'NamedNode')
    strictEqual(output[0].graph.value, 'http://example.org/graph')
  })

  it('should use baseIRI option', async () => {
    const example = JSON.stringify({
      '@id': 'subject',
      'http://example.org/predicate': 'object'
    })

    const parser = new JSONLDParser({ baseIRI: 'http://example.org/' })
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'NamedNode')
    strictEqual(output[0].subject.value, 'http://example.org/subject')
  })

  it('should use context option', async () => {
    const example = JSON.stringify({
      '@id': 'subject',
      predicate: 'object'
    })

    const context = {
      '@vocab': 'http://example.org/'
    }

    const parser = new JSONLDParser({
      baseIRI: 'http://example.org/',
      context
    })
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].subject.termType, 'NamedNode')
    strictEqual(output[0].subject.value, 'http://example.org/subject')
  })

  it('should forward errors from the input stream', async () => {
    const input = new Readable({
      read: () => {
        setTimeout(() => {
          input.destroy(new Error('test'))
        }, 0)
      }
    })
    const parser = new JSONLDParser()
    const stream = parser.import(input)

    await rejects(chunks(stream, true))
  })

  it('should throw an error if JSON is invalid', async () => {
    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from('{'))

    await rejects(chunks(stream, true))
  })

  it('should throw an error if JSON-LD is invalid', async () => {
    const example = JSON.stringify({
      '@context': 'object'
    })

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    await rejects(chunks(stream, true))
  })

  it('should emit a prefix event for each context entry', async () => {
    const example = JSON.stringify({
      '@context': {
        ex1: 'http://example.org/1',
        ex2: 'http://example.org/2'
      }
    })

    const prefixes = {}

    const parser = new JSONLDParser()
    const stream = parser.import(Readable.from(example))

    stream.on('prefix', (prefix, namespace) => {
      prefixes[prefix] = namespace
    })

    await chunks(stream, true)

    strictEqual(prefixes.ex1.value, 'http://example.org/1')
    strictEqual(prefixes.ex2.value, 'http://example.org/2')
  })

  it('should use a given documentLoader', async () => {
    const example = JSON.stringify({
      '@context': 'http://example.org/',
      '@id': 'subject',
      predicate: 'object'
    })

    const documentLoader = new FsDocumentLoader({
      'http://example.org/': 'test/support/example.org.json'
    })

    const parser = new JSONLDParser({ documentLoader })
    const stream = parser.import(Readable.from(example))

    const output = await chunks(stream)

    strictEqual(output.length, 1)
    strictEqual(output[0].predicate.termType, 'NamedNode')
    strictEqual(output[0].predicate.value, 'http://example.org/predicate')
  })
})
