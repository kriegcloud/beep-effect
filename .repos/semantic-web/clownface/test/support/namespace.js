import rdf from 'rdf-ext'

export const first = rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first')
export const list = rdf.namedNode('http://example.org/list')
export const nil = rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')
export const rest = rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest')
export const ex = rdf.namespace('http://example.org/')
export const rdfs = rdf.namespace('http://www.w3.org/2000/01/rdf-schema#')
export const schema = rdf.namespace('http://schema.org/')
export const xsd = rdf.namespace('http://www.w3.org/2001/XMLSchema#')
export const tbbtp = rdf.namespace('http://localhost:8080/data/person/')
