import stringToStream from 'string-to-stream'
import rdf from '@zazuko/env'
import Parser from '@rdfjs/parser-n3'
import prefixes from '@zazuko/prefixes'
import fromStream from 'rdf-dataset-ext/fromStream.js';

const parser = new Parser()

export function createGraph(ntriples: string) {
  return async () => {
    const dataset = rdf.dataset()
    const stream = stringToStream(`
    BASE <http://example.com/>
    PREFIX rdf: <${prefixes.rdf}>
    PREFIX rdfs: <${prefixes.rdfs}>
    PREFIX foaf: <${prefixes.foaf}>
    PREFIX hydra: <${prefixes.hydra}>

    ${ntriples}`)
    return fromStream(dataset, parser.import(stream as any))
  }
}
