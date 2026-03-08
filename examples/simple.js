const rdf = require('@rdfjs/data-model')
const TermSet = require('..')

const terms = new TermSet([
  rdf.namedNode('http://example.org/'),
  rdf.literal('test')
])

// The rdf factory will return a new instance of the literal,
// but the Termset will check for the N-Triple representation.
// That's why the output will be: "true"
console.log(terms.has(rdf.literal('test')))
