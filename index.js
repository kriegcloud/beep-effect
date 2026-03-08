import Clownface from './lib/Clownface.js'
import environment from './lib/environment.js'

/**
 * Factory to create graph pointer objects
 *
 * @param {Object} init
 * @param {DatasetCore} init.dataset an RDF/JS dataset
 * @param {string|Term} [init.graph] graph URI
 * @param {Term|Term[]} [init.term] one or more RDF/JS term(s) which will be the pointer's context
 * @param {string} [init.value] one or more raw values which will create literal node as the pointer's context
 * @param {DataFactory} [init.factory=@rdfjs/environment] an RDF/JS factory which will be used to create nodes
 * @param {Context} [init._context] an existing clownface context. takes precedence before other params
 * @returns {Clownface}
 */
export default function factory({ dataset, graph, term, value, factory = environment, _context }) {
  return new Clownface({ dataset, graph, term, value, factory, _context })
}
