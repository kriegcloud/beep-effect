import { QueryEngine } from '@comunica/query-sparql-rdfjs-lite'
import { BindingsFactory } from '@comunica/utils-bindings-factory'
import { Readable } from 'readable-stream'

function bindingsToObject (row) {
  const args = {}

  for (const [key, value] of [...row]) {
    args[key.value] = value
  }

  return args
}

async function select ({ bindings, dataset, factory, query }) {
  const store = new DatasetSource(dataset)
  const engine = new QueryEngine()

  const bindingsFactory = new BindingsFactory(factory)
  const initialBindings = bindingsFactory.bindings(bindings)

  const stream = await engine.queryBindings(query, {
    sources: [store],
    initialBindings
  })

  return stream.toArray()
}

function stringifyPath (path) {
  if (!path) {
    return null
  }

  return path.map(pathStep => {
    let sparqlPath = ''

    if (pathStep.start === 'object' && pathStep.end === 'subject') {
      sparqlPath += '^'
    }

    sparqlPath += pathStep.predicates.map(p => `<${p.value}>`).join('|')

    if (pathStep.quantifier === 'oneOrMore') {
      sparqlPath += '+'
    } else if (pathStep.quantifier === 'zeroOrMore') {
      sparqlPath += '*'
    } else if (pathStep.quantifier === 'zeroOrOne') {
      sparqlPath += '?'
    }

    return sparqlPath
  }).join('/')
}

class DatasetSource {
  constructor (dataset) {
    this.dataset = dataset
  }

  match (subject, predicate, object, graph) {
    return Readable.from(this.dataset.match(subject, predicate, object, graph))
  }
}

export {
  bindingsToObject,
  select,
  stringifyPath
}
