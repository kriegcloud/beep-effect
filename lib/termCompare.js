const termTypeOrder = ['Literal', 'NamedNode', 'BlankNode']

function literalId (term) {
  return `${term.language || ''}@${term.datatype.value || ''}@${term.value}`
}

function termCompare (a, b) {
  const indexTypeA = termTypeOrder.indexOf(a.term.termType)
  const indexTypeB = termTypeOrder.indexOf(b.term.termType)

  const typeCompare = indexTypeA - indexTypeB

  if (typeCompare !== 0) {
    return typeCompare
  }

  if (a.term.termType === 'Literal') {
    const isLangA = a.term.language ? 1 : 0
    const isLangB = b.term.language ? 1 : 0

    const isLangCompare = isLangB - isLangA

    if (isLangCompare !== 0) {
      return isLangCompare
    }

    return literalId(a.term).localeCompare(literalId(b.term))
  }

  return a.term.value.localeCompare(b.term.value)
}

export default termCompare
