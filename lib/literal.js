import namedNode from './namedNode.js'

const echarRegEx = /["\\\\\n\r]/
const echarRegExAll = /["\\\\\n\r]/g

const echarReplacement = {
  '"': '\\"',
  '\\': '\\\\',
  '\n': '\\n',
  '\r': '\\r'
}

function echarReplacer (char) {
  return echarReplacement[char]
}

function escapeValue (value) {
  if (echarRegEx.test(value)) {
    return value.replace(echarRegExAll, echarReplacer)
  }

  return value
}

function literal (literal) {
  const escapedValue = escapeValue(literal.value)

  if (literal.datatype.value === 'http://www.w3.org/2001/XMLSchema#string') {
    return '"' + escapedValue + '"'
  }

  if (literal.datatype.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString') {
    return '"' + escapedValue + '"@' + literal.language
  }

  if (literal.datatype.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#dirLangString') {
    return '"' + escapedValue + '"@' + literal.language + '--' + literal.direction
  }

  return '"' + escapedValue + '"^^' + namedNode(literal.datatype)
}

export default literal
