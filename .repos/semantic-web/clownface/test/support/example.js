import fs from 'fs'
import path from 'path'
import module from 'module'
import N3Parser from '@rdfjs/parser-n3'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import rdf from './factory.js'

const require = module.createRequire(import.meta.url)

export default function init() {
  const filename = path.join(path.dirname(require.resolve('tbbt-ld')), 'dist/tbbt.nq')
  const input = fs.createReadStream(filename)
  const parser = new N3Parser()

  return fromStream(rdf.dataset(), parser.import(input))
}
