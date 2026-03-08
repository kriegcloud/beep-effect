function isString (s) {
  return typeof s === 'string' || s instanceof String
}

const xsdString = 'http://www.w3.org/2001/XMLSchema#string'

function termToId (term) {
  if (typeof term === 'string') {
    return term
  }

  if (!term) {
    return ''
  }

  if (typeof term.id !== 'undefined' && term.termType !== 'Quad') {
    return term.id
  }

  let subject, predicate, object, graph

  // Term instantiated with another library
  switch (term.termType) {
    case 'NamedNode':
      return term.value

    case 'BlankNode':
      return `_:${term.value}`

    case 'Variable':
      return `?${term.value}`

    case 'DefaultGraph':
      return ''

    case 'Literal':
      if (term.language) {
        return `"${term.value}"@${term.language}`
      }

      return `"${term.value}"${term.datatype && term.datatype.value !== xsdString ? `^^${term.datatype.value}` : ''}`

    case 'Quad':
      // To identify RDF* quad components, we escape quotes by doubling them.
      // This avoids the overhead of backslash parsing of Turtle-like syntaxes.
      subject = escapeQuotes(termToId(term.subject))
      predicate = escapeQuotes(termToId(term.predicate))
      object = escapeQuotes(termToId(term.object))
      graph = term.graph.termType === 'DefaultGraph' ? '' : ` ${termToId(term.graph)}`

      return `<<${subject} ${predicate} ${object}${graph}>>`

    default:
      throw new Error(`Unexpected termType: ${term.termType}`)
  }
}

const escapedLiteral = /^"(.*".*)(?="[^"]*$)/

function escapeQuotes (id) {
  return id.replace(escapedLiteral, (_, quoted) => `"${quoted.replace(/"/g, '""')}`)
}

class DatasetCore {
  constructor (quads) {
    // The number of quads is initially zero
    this._size = 0
    // `_graphs` contains subject, predicate, and object indexes per graph
    this._graphs = Object.create(null)
    // `_ids` maps entities such as `http://xmlns.com/foaf/0.1/name` to numbers,
    // saving memory by using only numbers as keys in `_graphs`
    this._id = 0
    this._ids = Object.create(null)
    this._ids['><'] = 0 // dummy entry, so the first actual key is non-zero
    this._entities = Object.create(null) // inverse of `_ids`

    this._quads = new Map()

    // Add quads if passed
    if (quads) {
      for (const quad of quads) {
        this.add(quad)
      }
    }
  }

  get size () {
    // Return the quad count if if was cached
    let size = this._size

    if (size !== null) {
      return size
    }

    // Calculate the number of quads by counting to the deepest level
    size = 0
    const graphs = this._graphs
    let subjects, subject

    for (const graphKey in graphs) {
      for (const subjectKey in (subjects = graphs[graphKey].subjects)) {
        for (const predicateKey in (subject = subjects[subjectKey])) {
          size += Object.keys(subject[predicateKey]).length
        }
      }
    }

    this._size = size

    return this._size
  }

  add (quad) {
    // Convert terms to internal string representation
    let subject = termToId(quad.subject)
    let predicate = termToId(quad.predicate)
    let object = termToId(quad.object)
    const graph = termToId(quad.graph)

    // Find the graph that will contain the triple
    let graphItem = this._graphs[graph]
    // Create the graph if it doesn't exist yet
    if (!graphItem) {
      graphItem = this._graphs[graph] = { subjects: {}, predicates: {}, objects: {} }
      // Freezing a graph helps subsequent `add` performance,
      // and properties will never be modified anyway
      Object.freeze(graphItem)
    }

    // Since entities can often be long IRIs, we avoid storing them in every index.
    // Instead, we have a separate index that maps entities to numbers,
    // which are then used as keys in the other indexes.
    const ids = this._ids
    const entities = this._entities
    subject = ids[subject] || (ids[entities[++this._id] = subject] = this._id)
    predicate = ids[predicate] || (ids[entities[++this._id] = predicate] = this._id)
    object = ids[object] || (ids[entities[++this._id] = object] = this._id)

    this._addToIndex(graphItem.subjects, subject, predicate, object)
    this._addToIndex(graphItem.predicates, predicate, object, subject)
    this._addToIndex(graphItem.objects, object, subject, predicate)

    this._setQuad(subject, predicate, object, graph, quad)

    // The cached quad count is now invalid
    this._size = null

    return this
  }

  delete (quad) {
    // Convert terms to internal string representation
    let subject = termToId(quad.subject)
    let predicate = termToId(quad.predicate)
    let object = termToId(quad.object)
    const graph = termToId(quad.graph)

    // Find internal identifiers for all components
    // and verify the quad exists.
    const ids = this._ids
    const graphs = this._graphs
    let graphItem, subjects, predicates

    if (!(subject = ids[subject]) || !(predicate = ids[predicate]) ||
      !(object = ids[object]) || !(graphItem = graphs[graph]) ||
      !(subjects = graphItem.subjects[subject]) ||
      !(predicates = subjects[predicate]) ||
      !(object in predicates)
    ) {
      return this
    }

    // Remove it from all indexes
    this._removeFromIndex(graphItem.subjects, subject, predicate, object)
    this._removeFromIndex(graphItem.predicates, predicate, object, subject)
    this._removeFromIndex(graphItem.objects, object, subject, predicate)

    if (this._size !== null) {
      this._size--
    }

    this._deleteQuad(subject, predicate, object, graph)

    // Remove the graph if it is empty
    for (subject in graphItem.subjects) { // eslint-disable-line no-unreachable-loop
      return this
    }

    delete graphs[graph]

    return this
  }

  has (quad) {
    // Convert terms to internal string representation
    const subject = termToId(quad.subject)
    const predicate = termToId(quad.predicate)
    const object = termToId(quad.object)
    const graph = termToId(quad.graph)

    const graphItem = this._graphs[graph]

    if (!graphItem) {
      return false
    }

    const ids = this._ids
    let subjectId, predicateId, objectId

    // Translate IRIs to internal index keys.
    if (
      (isString(subject) && !(subjectId = ids[subject])) ||
      (isString(predicate) && !(predicateId = ids[predicate])) ||
      (isString(object) && !(objectId = ids[object]))
    ) {
      return false
    }

    return this._countInIndex(graphItem.objects, objectId, subjectId, predicateId) === 1
  }

  match (subject, predicate, object, graph) {
    return this._createDataset(this._match(subject, predicate, object, graph))
  }

  [Symbol.iterator] () {
    return this._match()[Symbol.iterator]()
  }

  // ## Private methods

  // ### `_addToIndex` adds a quad to a three-layered index.
  // Returns if the index has changed, if the entry did not already exist.
  _addToIndex (index0, key0, key1, key2) {
    // Create layers as necessary
    const index1 = index0[key0] || (index0[key0] = {})
    const index2 = index1[key1] || (index1[key1] = {})
    // Setting the key to _any_ value signals the presence of the quad
    const existed = key2 in index2

    if (!existed) {
      index2[key2] = null
    }

    return !existed
  }

  // ### `_removeFromIndex` removes a quad from a three-layered index
  _removeFromIndex (index0, key0, key1, key2) {
    // Remove the quad from the index
    const index1 = index0[key0]
    const index2 = index1[key1]
    delete index2[key2]

    // Remove intermediary index layers if they are empty
    for (const key in index2) { // eslint-disable-line no-unreachable-loop
      return
    }

    delete index1[key1]

    for (const key in index1) { // eslint-disable-line no-unreachable-loop
      return
    }

    delete index0[key0]
  }

  // ### `_findInIndex` finds a set of quads in a three-layered index.
  // The index base is `index0` and the keys at each level are `key0`, `key1`, and `key2`.
  // Any of these keys can be undefined, which is interpreted as a wildcard.
  // `name0`, `name1`, and `name2` are the names of the keys at each level,
  // used when reconstructing the resulting quad
  // (for instance: _subject_, _predicate_, and _object_).
  // Finally, `graph` will be the graph of the created quads.
  // If `callback` is given, each result is passed through it
  // and iteration halts when it returns truthy for any quad.
  // If instead `array` is given, each result is added to the array.
  _findInIndex (index0, key0, key1, key2, name0, name1, name2, graph, callback, array) {
    let tmp, index1, index2

    // If a key is specified, use only that part of index 0.
    if (key0) {
      (tmp = index0, index0 = {})[key0] = tmp[key0]
    }

    for (const value0 in index0) {
      index1 = index0[value0]

      if (index1) {
        // If a key is specified, use only that part of index 1.
        if (key1) {
          (tmp = index1, index1 = {})[key1] = tmp[key1]
        }

        for (const value1 in index1) {
          index2 = index1[value1]

          if (index2) {
            // If a key is specified, use only that part of index 2, if it exists.
            const values = key2 ? (key2 in index2 ? [key2] : []) : Object.keys(index2)
            // Create quads for all items found in index 2.
            for (let l = 0; l < values.length; l++) {
              const parts = {
                [name0]: value0,
                [name1]: value1,
                [name2]: values[l]
              }

              const quad = this._getQuad(parts.subject, parts.predicate, parts.object, graph)

              if (array) {
                array.push(quad)
              } else if (callback(quad)) {
                return true
              }
            }
          }
        }
      }
    }

    return array
  }

  // ### `_countInIndex` counts matching quads in a three-layered index.
  // The index base is `index0` and the keys at each level are `key0`, `key1`, and `key2`.
  // Any of these keys can be undefined, which is interpreted as a wildcard.
  _countInIndex (index0, key0, key1, key2) {
    let count = 0
    let tmp, index1, index2

    // If a key is specified, count only that part of index 0
    if (key0) {
      (tmp = index0, index0 = {})[key0] = tmp[key0]
    }

    for (const value0 in index0) {
      index1 = index0[value0]

      if (index1) {
        // If a key is specified, count only that part of index 1
        if (key1) {
          (tmp = index1, index1 = {})[key1] = tmp[key1]
        }

        for (const value1 in index1) {
          index2 = index1[value1]

          if (index2) {
            if (key2) {
              // If a key is specified, count the quad if it exists
              (key2 in index2) && count++
            } else {
              // Otherwise, count all quads
              count += Object.keys(index2).length
            }
          }
        }
      }
    }

    return count
  }

  // ### `_getGraphs` returns an array with the given graph,
  // or all graphs if the argument is null or undefined.
  _getGraphs (graph) {
    if (!isString(graph)) {
      return this._graphs
    }

    return {
      [graph]: this._graphs[graph]
    }
  }

  _match (subject, predicate, object, graph) {
    // Convert terms to internal string representation
    subject = subject && termToId(subject)
    predicate = predicate && termToId(predicate)
    object = object && termToId(object)
    graph = graph && termToId(graph)

    const quads = []
    const graphs = this._getGraphs(graph)
    const ids = this._ids
    let content, subjectId, predicateId, objectId

    // Translate IRIs to internal index keys.
    if (
      (isString(subject) && !(subjectId = ids[subject])) ||
      (isString(predicate) && !(predicateId = ids[predicate])) ||
      (isString(object) && !(objectId = ids[object]))
    ) {
      return quads
    }

    for (const graphId in graphs) {
      content = graphs[graphId]

      // Only if the specified graph contains triples, there can be results
      if (content) {
        // Choose the optimal index, based on what fields are present
        if (subjectId) {
          if (objectId) {
            // If subject and object are given, the object index will be the fastest
            this._findInIndex(content.objects, objectId, subjectId, predicateId, 'object', 'subject', 'predicate', graphId, null, quads)
          } else {
            // If only subject and possibly predicate are given, the subject index will be the fastest
            this._findInIndex(content.subjects, subjectId, predicateId, null, 'subject', 'predicate', 'object', graphId, null, quads)
          }
        } else if (predicateId) {
          // if only predicate and possibly object are given, the predicate index will be the fastest
          this._findInIndex(content.predicates, predicateId, objectId, null, 'predicate', 'object', 'subject', graphId, null, quads)
        } else if (objectId) {
          // If only object is given, the object index will be the fastest
          this._findInIndex(content.objects, objectId, null, null, 'object', 'subject', 'predicate', graphId, null, quads)
        } else {
          // If nothing is given, iterate subjects and predicates first
          this._findInIndex(content.subjects, null, null, null, 'subject', 'predicate', 'object', graphId, null, quads)
        }
      }
    }

    return quads
  }

  _getQuad (subjectId, predicateId, objectId, graphId) {
    return this._quads.get(this._toId(subjectId, predicateId, objectId, graphId))
  }

  _setQuad (subjectId, predicateId, objectId, graphId, quad) {
    this._quads.set(this._toId(subjectId, predicateId, objectId, graphId), quad)
  }

  _deleteQuad (subjectId, predicateId, objectId, graphId) {
    this._quads.delete(this._toId(subjectId, predicateId, objectId, graphId))
  }

  _createDataset (quads) {
    return new this.constructor(quads)
  }

  _toId (subjectId, predicateId, objectId, graphId) {
    return `${subjectId}:${predicateId}:${objectId}:${graphId}`
  }
}

export default DatasetCore
