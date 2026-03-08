import * as ns from './namespaces.js'

function parseStep (ptr) {
  if (ptr.term.termType !== 'BlankNode') {
    return {
      quantifier: 'one',
      start: 'subject',
      end: 'object',
      predicates: [ptr.term]
    }
  }

  const alternativePtr = ptr.out([ns.sh.alternativePath])

  if (alternativePtr.ptrs.length === 1 && alternativePtr.ptrs[0].isList()) {
    return {
      quantifier: 'one',
      start: 'subject',
      end: 'object',
      predicates: [...alternativePtr.list()].map(ptr => ptr.term)
    }
  }

  const inversePtr = ptr.out([ns.sh.inversePath])

  if (inversePtr.term) {
    return {
      quantifier: 'one',
      start: 'object',
      end: 'subject',
      predicates: [inversePtr.term]
    }
  }

  const oneOrMorePtr = ptr.out([ns.sh.oneOrMorePath])

  if (oneOrMorePtr.term) {
    return {
      quantifier: 'oneOrMore',
      start: 'subject',
      end: 'object',
      predicates: [oneOrMorePtr.term]
    }
  }

  const zeroOrMorePtr = ptr.out([ns.sh.zeroOrMorePath])

  if (zeroOrMorePtr.term) {
    return {
      quantifier: 'zeroOrMore',
      start: 'subject',
      end: 'object',
      predicates: [zeroOrMorePtr.term]
    }
  }

  const zeroOrOnePtr = ptr.out([ns.sh.zeroOrOnePath])

  if (zeroOrOnePtr.term) {
    return {
      quantifier: 'zeroOrOne',
      start: 'subject',
      end: 'object',
      predicates: [zeroOrOnePtr.term]
    }
  }
}

function parsePath (ptr) {
  if (ptr.terms.length === 0) {
    return null
  }

  if (!ptr.ptrs[0].isList()) {
    return [parseStep(ptr)]
  }

  return [...ptr.list()].map(stepPtr => parseStep(stepPtr))
}

export default parsePath
