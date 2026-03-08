import $rdf from 'rdf-ext'
import toStream from 'string-to-stream'
import Parser from '@rdfjs/parser-n3'
import cf from '../..//index.js'

const parser = new Parser()

export default async function parse(string) {
  const dataset = await $rdf.dataset().import(parser.import(toStream(string)))

  return cf({ dataset })
}
