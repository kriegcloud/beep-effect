export default (factory) => {
  const xsd = factory.namespace('http://www.w3.org/2001/XMLSchema#')
  const rdf = factory.namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')

  return {
    first: rdf.first,
    nil: rdf.nil,
    rest: rdf.rest,
    langString: rdf.langString,
    xsd,
  }
}
