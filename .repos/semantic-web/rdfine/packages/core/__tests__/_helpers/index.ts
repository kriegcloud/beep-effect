import stringToStream from 'string-to-stream'
import rdf from '@zazuko/env'
import Parser from '@rdfjs/parser-n3'
import ns from '@rdfjs/namespace'
import prefixes from '@zazuko/prefixes'
import { TurtleTemplateResult } from '@tpluscode/rdf-string'
import { DatasetCore } from '@rdfjs/types'
import fromStream from 'rdf-dataset-ext/fromStream.js'

const parser = new Parser()

export function parse(quads: string | TurtleTemplateResult): Promise<DatasetCore> {
  const stream = stringToStream(quads.toString())

  return fromStream(rdf.dataset(), parser.import(stream))
}

prefixes.ex = 'http://example.com/'
export const ex = ns(prefixes.ex)
