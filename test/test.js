import { strictEqual } from 'assert'
import { readFile } from 'fs/promises'
import rdf from '@rdfjs/data-model'
import { describe, it } from 'mocha'
import fromFile from 'rdf-utils-fs/fromFile.js'
import chunks from 'stream-chunks/chunks.js'
import decode from 'stream-chunks/decode.js'
import Serializer from '../index.js'

const tests = [
  'base',
  'base-legacy',
  'base-string',
  'base-url',
  'blank-node',
  'blank-node-empty',
  'blank-node-root',
  'blank-nodes-multi-ref',
  'blank-nodes-nested',
  'example',
  'list',
  'list-blank-node',
  'list-empty',
  'list-multi-ref',
  'literal',
  'literal-boolean',
  'literal-datatype',
  'literal-decimal',
  'literal-double',
  'literal-integer',
  'literal-languages',
  'named-nodes',
  'object-multi-type',
  'prefix',
  'type'
]

const options = {
  base: {
    baseIRI: rdf.namedNode('http://example.com/')
  },
  'base-legacy': {
    filename: 'base',
    base: rdf.namedNode('http://example.com/')
  },
  'base-string': {
    filename: 'base',
    baseIRI: 'http://example.com/'
  },
  'base-url': {
    filename: 'base',
    baseIRI: new URL('http://example.com/')
  },
  'literal-datatype': {
    prefixes: [
      ['ex', rdf.namedNode('http://example.org/')]
    ]
  },
  prefix: {
    prefixes: [
      ['xsd', rdf.namedNode('http://www.w3.org/2001/XMLSchema#')],
      ['schema', rdf.namedNode('http://schema.org/')]
    ]
  }
}

async function compareStreamNtToTtl (basename) {
  const filename = (options[basename] && options[basename].filename) || basename
  const expected = (await readFile(new URL(`assets/${filename}.ttl`, import.meta.url))).toString()
  const input = fromFile((new URL(`assets/${filename}.nt`, import.meta.url)).pathname)
  const parser = new Serializer(options[basename])
  const output = parser.import(input)
  const result = await decode(output)

  strictEqual(result, expected)
}

async function compareTransformNtToTtl (basename) {
  const filename = (options[basename] && options[basename].filename) || basename
  const expected = (await readFile(new URL(`assets/${filename}.ttl`, import.meta.url))).toString()
  const input = fromFile((new URL(`assets/${filename}.nt`, import.meta.url)).pathname)
  const quads = await chunks(input)
  const parser = new Serializer(options[basename])
  const result = parser.transform(quads)

  strictEqual(result, expected)
}

describe('@rdfjs/serializer-turtle', () => {
  describe('stream', () => {
    for (const test of tests) {
      it(`should serialize the ${test} data`, async () => {
        await compareStreamNtToTtl(test)
      })
    }
  })

  describe('transform', () => {
    for (const test of tests) {
      it(`should serialize the ${test} data`, async () => {
        await compareTransformNtToTtl(test)
      })
    }
  })
})
