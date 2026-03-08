const rdf = require('@rdfjs/data-model')
const TermMap = require('..')

const terms = new TermMap([
  [rdf.namedNode('http://example.org/'), { data: 1 }],
  [rdf.literal('test'), { data: 2 }]
])

// The rdf factory will return a new instance of the literal,
// but the TermMap will check for the N-Triple representation.
// That's why the output will be: "true"
console.log(terms.has(rdf.literal('test')))
