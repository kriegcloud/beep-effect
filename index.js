import rdf from '@rdfjs/data-model'

const handler = {
  apply: (target, thisArg, args) => target(args[0]),
  get: (target, property) => target(property)
}

function namespace (baseIRI, { factory = rdf } = {}) {
  const builder = (term = '') => factory.namedNode(`${baseIRI}${term.raw || term}`)

  return typeof Proxy === 'undefined' ? builder : new Proxy(builder, handler)
}

export default namespace
