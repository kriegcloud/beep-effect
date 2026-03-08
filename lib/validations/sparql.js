import * as ns from '../namespaces.js'
import parsePath from '../parsePath.js'
import { bindingsToObject, select, stringifyPath } from '../sparql.js'

function stringifyPrefixes (ptr, prefixes = []) {
  for (const imports of ptr.out([ns.owl.imports])) {
    stringifyPrefixes(imports, prefixes)
  }

  for (const declare of ptr.out([ns.sh.declare])) {
    const prefix = declare.out([ns.sh.prefix]).value
    const namespace = declare.out([ns.sh.namespace]).value

    prefixes.push(`PREFIX ${prefix}: <${namespace}>`)
  }

  return prefixes
}

function compileSparql (shape) {
  const select = shape.sparql.out([ns.sh.select]).value
  const prefixes = stringifyPrefixes(shape.sparql.out([ns.sh.prefixes]))
  const sparqlPath = stringifyPath(shape.path)
  const message = shape.sparql.out([ns.sh.message]).terms

  const query = [...prefixes, select]
    .filter(Boolean)
    .join('\n')
    .split('$PATH')
    .join(sparqlPath)

  return {
    generic: validateSparql({ message, query, source: shape.sparql.terms })
  }
}

function validateSparql ({ message, query, source }) {
  return async context => {
    const dataset = context.focusNode.dataset
    const factory = context.factory
    const bindings = [[factory.variable('this'), context.focusNode.term]]
    const rows = await select({ bindings, dataset, factory, query })

    for (const row of rows) {
      const args = bindingsToObject(row)
      const path = row.has('path') && parsePath(context.focusNode.node([row.get('path')]))
      const value = context.focusNode.node([row.get('value') || context.focusNode.term])

      context.violation(ns.sh.SPARQLConstraintComponent, { args, message, path, source, value })
    }

    if (rows.length === 0) {
      context.debug(ns.sh.SPARQLConstraintComponent, { source })
    }
  }
}

export {
  compileSparql
}
