import * as ns from './namespaces.js'

function activeNamespaces (tree, namespaces) {
  const active = new Set()

  const check = term => {
    const shrinked = namespaces.shrink(term)

    if (shrinked) {
      active.add(shrinked.value.split(':')[0])
    }

    if (term.datatype) {
      if (
        !isBoolean(term) &&
        !isDecimal(term) &&
        !isDouble(term) &&
        !isInteger(term) &&
        !isLangString(term) &&
        !isString(term)
      ) {
        check(term.datatype)
      }
    }
  }

  for (const node of tree.nodes.values()) {
    check(node.term)

    for (const predicate of node.predicates.keys()) {
      check(predicate)
    }
  }

  return active
}

function isBoolean (term) {
  return ns.xsd.boolean.equals(term.datatype)
}

function isDecimal (term) {
  return ns.xsd.decimal.equals(term.datatype)
}

function isDouble (term) {
  return ns.xsd.double.equals(term.datatype)
}

function isInteger (term) {
  return ns.xsd.integer.equals(term.datatype)
}

function isLangString (term) {
  return ns.rdf.langString.equals(term.datatype)
}

function isString (term) {
  return ns.xsd.string.equals(term.datatype)
}

export {
  activeNamespaces,
  isBoolean,
  isDecimal,
  isDouble,
  isLangString,
  isInteger,
  isString
}
