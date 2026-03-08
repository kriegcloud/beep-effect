function quad (quad, { nested, toNT }) {
  const subjectString = toNT(quad.subject, { nested: true })
  const predicateString = toNT(quad.predicate, { nested: true })
  const objectString = toNT(quad.object, { nested: true })
  const graphString = toNT(quad.graph, { nested: true })

  const plain = `${subjectString} ${predicateString} ${objectString}${graphString ? ` ${graphString}` : ''}`

  if (nested) {
    return `<<( ${plain} )>>`
  }

  return `${plain} .`
}

export default quad
