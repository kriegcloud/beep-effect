import { readFile } from 'node:fs/promises'
import rdf from '@rdfjs/data-model'
import { Readable } from 'readable-stream'

async function build ({ name, quads }) {
  return {
    codeCommonJs: (await readFile(`test/support/example.${name}.cjs`)).toString(),
    codeEsm: (await readFile(`test/support/example.${name}.mjs`)).toString(),
    codeTs: (await readFile(`test/support/example.${name}.ts`)).toString(),
    quads,
    stream: Readable.from(quads)
  }
}

async function empty () {
  return build({ name: 'empty', quads: [] })
}

async function simple () {
  const blankNode0 = rdf.blankNode()
  const blankNode1 = rdf.blankNode()

  const quads = [
    rdf.quad(
      blankNode0,
      rdf.namedNode('http://example.org/predicate1'),
      rdf.literal('object')
    ),
    rdf.quad(
      blankNode0,
      rdf.namedNode('http://example.org/predicate2'),
      rdf.literal('text', 'en')
    ),
    rdf.quad(
      blankNode1,
      rdf.namedNode('http://example.org/predicate3'),
      rdf.literal('123.0', rdf.namedNode('http://www.w3.org/2001/XMLSchema#double')),
      rdf.namedNode('http://example.org/graph')
    )
  ]

  return build({ name: 'simple', quads })
}

export {
  empty,
  simple
}
