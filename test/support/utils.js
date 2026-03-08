import { readFile } from 'node:fs/promises'
import fromFile from 'rdf-utils-fs/fromFile.js'
import chunks from 'stream-chunks/chunks.js'

import rdf from './factory.js'

const ns = {
  first: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
  nil: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
  rest: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest')
}

function listToArray (dataset, entry) {
  const items = []

  while (!entry.equals(ns.nil)) {
    items.push([...dataset.match(entry, ns.first)][0].object)
    entry = [...dataset.match(entry, ns.rest)][0].object
  }

  return items
}

async function readFileContent (filename) {
  const content = await readFile(new URL(`suite/tests/${filename}`, import.meta.url))

  return content.toString()
}

async function readFileDataset (filename) {
  const stream = fromFile((new URL(`suite/tests/${filename}`, import.meta.url)).pathname)
  const quads = await chunks(stream)

  return rdf.dataset(quads)
}

export {
  listToArray,
  readFileContent,
  readFileDataset
}
