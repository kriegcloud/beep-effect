import rdf from './factory.js'

const ex = rdf.namespace('http://example.org/')
const rdfns = rdf.namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')

export {
  ex,
  rdfns as rdf
}
