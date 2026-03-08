import ns from './namespace.js'
import toArray from './toArray.js'
import toTermArray from './toTermArray.js'
import Context from './Context.js'

/**
 * A graph pointer object, which points at 0..N nodes within a dataset
 */
export default class Clownface {
  constructor({ dataset, graph, term, value, factory, _context }) {
    this.factory = factory
    this.namespace = ns(factory)

    if (_context) {
      this._context = _context

      return
    }

    const terms = (term && toArray(term)) || (value && toArray(value)) || [null]

    /**
     * The underlying context which references actual node being pointed
     *
     * @type {Context[]}
     * @private
     */
    this._context = terms.map(term => {
      return new Context({ dataset, graph, value: term, factory: this.factory, namespace: this.namespace })
    })
  }

  /**
   * Gets the current RDF/JS term or undefined if pointer has no context
   *
   * @returns {undefined|Term}
   */
  get term() {
    const terms = this.terms

    if (terms.length !== 1) {
      return undefined
    }

    return terms[0]
  }

  /**
   * Gets the current terms or an empty array if the pointer has no context
   *
   * @returns {Term[]}
   */
  get terms() {
    return this._context.map(node => node.term).filter(Boolean)
  }

  /**
   * Gets the string representation of term
   *
   * @returns {undefined|string}
   */
  get value() {
    const term = this.term

    return term && term.value
  }

  /**
   * Gets the string representation of terms
   *
   * @returns {string[]}
   */
  get values() {
    return this.terms.map(term => term.value)
  }

  /**
   * Gets the current context's dataset, or undefined if there are multiple
   *
   * @returns {undefined|DatasetCore}
   */
  get dataset() {
    const datasets = this.datasets

    if (datasets.length !== 1) {
      return undefined
    }

    return datasets[0]
  }

  /**
   * Gets the current context's datasets
   *
   * @returns {DatasetCore[]}
   */
  get datasets() {
    return this._context.map(node => node.dataset).filter(Boolean)
  }

  /**
   * Removes current pointers from the context and return an "any pointer".
   * The returned object can be used to find any nodes in the dataset
   *
   * @returns {Clownface}
   */
  any() {
    return Clownface.fromContext(this._context.map(current => current.clone({ })), this)
  }

  /**
   * Returns true if the current term is a rdf:List
   *
   * @returns {boolean}
   */
  isList() {
    if (!this.term) {
      return false
    }

    // empty list
    if (this.term.equals(this.namespace.nil)) {
      return true
    }

    // list element
    if (this.out(this.namespace.first).term) {
      return true
    }

    return false
  }

  /**
   * Creates an iterator which iterates and rdf:List of the current term
   *
   * @returns {Iterable | null}
   */
  list() {
    if (this.terms.length > 1) {
      throw new Error('iterator over multiple terms is not supported')
    }

    if (this.term) {
      if (this.term.termType !== 'NamedNode' && this.term.termType !== 'BlankNode') {
        return null
      }

      if (!this.term.equals(this.namespace.nil) && !this.out(this.namespace.first).term) {
        return null
      }
    }

    let item = this

    return {
      [Symbol.iterator]: () => {
        return {
          next: () => {
            if (!item.term || item.term.equals(this.namespace.nil)) {
              return { done: true }
            }

            const value = item.out(this.namespace.first)
            if (value.terms.length > 1) {
              throw new Error(`Invalid list: multiple values for rdf:first on ${item.value}`)
            }

            const rest = item.out(this.namespace.rest)
            if (rest.terms.length > 1) {
              throw new Error(`Invalid list: multiple values for rdf:rest on ${item.value}`)
            }

            item = rest

            return { done: false, value }
          },
        }
      },
    }
  }

  /**
   * Returns an array of graph pointers where each one has a single _context
   *
   * @returns {Clownface[]}
   */
  toArray() {
    return this._context
      .map(context => Clownface.fromContext(context, this))
      .filter(context => context.terms.some(Boolean))
  }

  /**
   * Returns graph pointers which meet the condition specified in a callback function
   * @param {FilterCallback} callback
   * @returns {Clownface}
   */
  filter(callback) {
    const pointers = this._context.map(context => Clownface.fromContext(context, this))

    return Clownface.fromContext(this._context.filter((context, index) => callback(Clownface.fromContext(context, this), index, pointers)), this)
  }

  /**
   * Performs the specified action on every graph pointer
   * @param {ForEachCallback} callback
   * @returns {Clownface}
   */
  forEach(callback) {
    this.toArray().forEach(callback)
    return this
  }

  /**
   * Calls a defined callback function on each graph pointer, and returns an array that contains the results.
   * @template T
   * @param {MapCallback<T>} callback
   * @returns {T[]}
   */
  map(callback) {
    return this.toArray().map(callback)
  }

  toString() {
    return this.values.join()
  }

  /**
   * Creates graph pointer to one or more node(s)
   *
   * Depending on the value creates pointers to:
   *
   * - blank node context for null `values`
   * - literal for string `values` and no `options` paramter
   * - matching RDF/JS term
   * - term created according to `options.type` parameter
   *
   * @param {null|string|string[]|Term|Term[]|Clownface|Clownface[]} values
   * @param {Object} [options]
   * @param {"NamedNode"|"BlankNode"|"Literal"} [options.type] explicit type for nodes
   * @param {string} [options.language] language tag of literals
   * @param {string} [options.datatype] datatype of literals
   * @returns {Clownface}
   */
  node(values, { type, datatype, language } = {}) {
    values = this._toTermArray(values, type, datatype || language) || [null]

    const context = values.reduce((context, value) => {
      return context.concat(this._context.reduce((all, current) => {
        return all.concat([current.clone({ value })])
      }, []))
    }, [])

    return Clownface.fromContext(context, { factory: this.factory })
  }

  /**
   * Creates graph pointer to one or more blank nodes
   * @param {null|string|string[]|BlankNode|BlankNode[]|Clownface|Clownface[]} [values] blank node identifiers (generates it when falsy) or existing RDF/JS blank node(s)
   * @returns {Clownface}
   */
  blankNode(values) {
    return this.node(values, { type: 'BlankNode' })
  }

  /**
   * Creates graph pointer to one or more literal nodes
   * @param {string|string[]|boolean|boolean[]|number|number[]|Literal|Literal[]|Clownface|Clownface[]} values literal values as JS objects or RDF/JS Literal(s)
   * @param {string|Term} [languageOrDatatype] a language tag string or datatype term
   * @returns {Clownface}
   */
  literal(values, languageOrDatatype) {
    return this.node(values, { type: 'Literal', datatype: languageOrDatatype })
  }

  /**
   * Creates graph pointer to one or more named nodes
   * @param {string|string[]|NamedNode|NamedNode[]|Clownface|Clownface[]} values URI(s) or RDF/JS NamedNode(s)
   * @returns {Clownface}
   */
  namedNode(values) {
    return this.node(values, { type: 'NamedNode' })
  }

  /**
   * Creates a graph pointer to nodes which are linked to the current pointer by `predicates`
   * @param {Term|Term[]|Clownface|Clownface[]} [predicates] one or more RDF/JS term identifying a property
   * @returns {Clownface}
   */
  in(predicates) {
    predicates = this._toTermArray(predicates)

    const context = this._context.reduce((all, current) => all.concat(current.in(predicates)), [])

    return Clownface.fromContext(context, this)
  }

  /**
   * Creates a graph pointer to the result nodes after following a predicate, or after
   * following any predicates in an array, starting from the subject(s) (current graph pointer) to the objects.
   * @param {Term|Term[]|Clownface|Clownface[]} [predicates] any predicates to follow
   * @param {object} [options]
   * @param {string | string[] | undefined} [options.language]
   * @returns {Clownface}
   */
  out(predicates, options = {}) {
    predicates = this._toTermArray(predicates)

    const context = this._context.reduce((all, current) => all.concat(current.out(predicates, options)), [])

    return Clownface.fromContext(context, this)
  }

  /**
   * Creates a graph pointer to nodes which are subjects of predicates, optionally also with specific objects
   *
   * If the current context is empty, will check all potential subjects
   *
   * @param {Term|Term[]|Clownface|Clownface[]} predicates RDF property identifiers
   * @param {*} [objects] object values to match
   * @returns {Clownface}
   */
  has(predicates, objects) {
    predicates = this._toTermArray(predicates)
    objects = this._toTermArray(objects)

    const context = this._context.reduce((all, current) => all.concat(current.has(predicates, objects)), [])

    return Clownface.fromContext(context, this)
  }

  /**
   * Creates a new quad(s) in the dataset where the current context is the object
   *
   * @param {Term|Term[]|Clownface|Clownface[]} predicates
   * @param {NamedNode|NamedNode[]|Clownface|Clownface[]} subjects one or more nodes to use as subjects
   * @param {GraphPointerCallback} [callback] called for each object, with subject pointer as parameter
   * @returns {Clownface} current graph pointer
   */
  addIn(predicates, subjects, callback) {
    if (!predicates) {
      throw new Error('predicate parameter is required')
    }

    if (typeof subjects === 'function') {
      callback = subjects
      subjects = null
    }

    predicates = this._toTermArray(predicates)
    subjects = this._toTermArray(subjects) || [this.factory.blankNode()]

    const context = this._context.map(context => context.addIn(predicates, subjects))

    if (callback) {
      Clownface.fromContext(context, this).forEach(callback)
    }

    return this
  }

  /**
   * Creates a new quad(s) in the dataset where the current context is the subject
   *
   * @param {Term|Term[]|Clownface|Clownface[]} predicates
   * @param {*} objects one or more values to use for objects
   * @param {GraphPointerCallback} [callback] called for each subject, with object pointer as parameter
   * @returns {Clownface} current graph pointer
   */
  addOut(predicates, objects, callback) {
    if (!predicates) {
      throw new Error('predicate parameter is required')
    }

    if (typeof objects === 'function') {
      callback = objects
      objects = null
    }

    predicates = this._toTermArray(predicates)
    objects = this._toTermArray(objects) || [this.factory.blankNode()]

    const context = this._context.map(context => context.addOut(predicates, objects))

    if (callback) {
      Clownface.fromContext(context, this).forEach(callback)
    }

    return this
  }

  /**
   * Creates a new RDF list or lists containing the given items
   *
   * @param {Term|Term[]|Clownface|Clownface[]} predicates
   * @param {*} items one or more values to use for subjects
   * @returns {Clownface} current graph pointer
   */
  addList(predicates, items) {
    if (!predicates || !items) {
      throw new Error('predicate and items parameter is required')
    }

    predicates = this._toTermArray(predicates)
    items = this._toTermArray(items)

    this._context.forEach(context => context.addList(predicates, items))

    return this
  }

  /**
   * Deletes all quads where the current graph pointer contexts are the objects
   *
   * @param {Term|Term[]|Clownface|Clownface[]} [predicates]
   * @param {Term|Term[]|Clownface|Clownface[]} [subjects]
   * @returns {Clownface} current graph pointer
   */
  deleteIn(predicates, subjects) {
    predicates = this._toTermArray(predicates)
    subjects = this._toTermArray(subjects)

    this._context.forEach(context => context.deleteIn(predicates, subjects))

    return this
  }

  /**
   * Deletes all quads where the current graph pointer contexts are the subjects
   *
   * @param {Term|Term[]|Clownface|Clownface[]} [predicates]
   * @param {Term|Term[]|Clownface|Clownface[]} [objects]
   * @returns {Clownface} current graph pointer
   */
  deleteOut(predicates, objects) {
    predicates = this._toTermArray(predicates)
    objects = this._toTermArray(objects)

    this._context.forEach(context => context.deleteOut(predicates, objects))

    return this
  }

  /**
   * Deletes entire RDF lists where the current graph pointer is the subject
   *
   * @param {Term|Term[]|Clownface|Clownface[]} predicates
   * @returns {Clownface} current graph pointer
   */
  deleteList(predicates) {
    if (!predicates) {
      throw new Error('predicate parameter is required')
    }

    predicates = this._toTermArray(predicates)

    this._context.forEach(context => context.deleteList(predicates))

    return this
  }

  _toTermArray(predicates, type, languageOrDatatype) {
    return toTermArray(predicates, type, languageOrDatatype, this.factory)
  }

  static fromContext(context, { factory }) {
    return new Clownface({ _context: toArray(context), factory })
  }
}

/**
 * @callback GraphPointerCallback
 * @param {Clownface} pointer graph pointer to the new or existing node
 */

/**
 * @callback FilterCallback
 * @param {Clownface} pointer
 * @param {number} index
 * @param {Clownface[]} pointers
 * @return {boolean}
 */

/**
 * @callback ForEachCallback
 * @param {Clownface} pointer
 */

/**
 * @callback MapCallback
 * @template T
 * @param {Clownface} pointer
 * @return {T}
 */
