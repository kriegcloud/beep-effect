import TermSet from '@rdfjs/term-set'
import compareTerms from '../compareTerms.js'
import * as ns from '../namespaces.js'

function compileDisjoint (shape) {
  const disjoint = shape.ptr.out([ns.sh.disjoint]).term

  return {
    generic: validateDisjoint(disjoint)
  }
}

function validateDisjoint (disjoint) {
  return context => {
    const matches = context.focusNode.dataset.match(context.focusNode.term, disjoint, context.valueOrNode.term)

    context.test(matches.size === 0, ns.sh.DisjointConstraintComponent, {
      args: { disjoint },
      message: [context.factory.literal('Value node must not also be one of the values of {$disjoint}')],
      value: context.valueOrNode
    })
  }
}

function compileEquals (shape) {
  const equals = shape.ptr.out([ns.sh.equals]).term

  return {
    node: validateEqualsNode(equals),
    property: validateEqualsProperty(equals)
  }
}

function validateEqualsNode (equals) {
  return context => {
    const reference = context.focusNode.out([equals])
    const notEquals = reference.filter(ptr => !ptr.term.equals(context.focusNode.term))

    const result = reference.terms.length !== 0 && notEquals.terms.length === 0

    context.test(result, ns.sh.EqualsConstraintComponent, {
      args: { equals },
      message: [context.factory.literal('Must have same values as {$equals}')],
      value: (notEquals.terms[0] && context.focusNode.node([notEquals.terms[0]])) || context.focusNode
    })
  }
}

function validateEqualsProperty (equals) {
  return context => {
    const references = new TermSet(context.focusNode.out([equals]).terms)
    const values = new TermSet(context.values.terms)
    const missingReferences = [...values].filter(term => !references.has(term))
    const missingValues = [...references].filter(term => !values.has(term))
    const differences = [...missingReferences, ...missingValues]

    for (const value of differences) {
      context.violation(ns.sh.EqualsConstraintComponent, {
        args: { equals },
        message: [context.factory.literal('Must have same values as {$equals}')],
        value: context.focusNode.node([value])
      })
    }

    if (differences.length === 0) {
      context.debug(ns.sh.EqualsConstraintComponent, {
        args: { equals },
        message: [context.factory.literal('Must have same values as {$equals}')]
      })
    }
  }
}

function compileLessThan (shape) {
  const lessThan = shape.ptr.out([ns.sh.lessThan]).term

  return {
    property: validateLessThanProperty(lessThan)
  }
}

function validateLessThanProperty (lessThan) {
  return context => {
    const references = context.focusNode.out([lessThan]).terms

    for (const value of context.values) {
      for (const reference of references) {
        const c = compareTerms(value.term, reference)

        if (c === null || c >= 0) {
          context.violation(ns.sh.LessThanConstraintComponent, {
            args: { lessThan },
            message: [context.factory.literal('Value is not less than value of {$lessThan}')],
            value
          })
        } else {
          context.debug(ns.sh.LessThanConstraintComponent, {
            args: { lessThan },
            message: [context.factory.literal('Value is not less than value of {$lessThan}')],
            value
          })
        }
      }
    }
  }
}

function compileLessThanOrEquals (shape) {
  const lessThanOrEquals = shape.ptr.out([ns.sh.lessThanOrEquals]).term

  return {
    property: validateLessThanOrEqualsProperty(lessThanOrEquals)
  }
}

function validateLessThanOrEqualsProperty (lessThanOrEquals) {
  return context => {
    const references = context.focusNode.out([lessThanOrEquals]).terms

    for (const value of context.values) {
      for (const reference of references) {
        const c = compareTerms(value.term, reference)

        if (c === null || c > 0) {
          context.violation(ns.sh.LessThanOrEqualsConstraintComponent, {
            args: { lessThanOrEquals },
            message: [context.factory.literal('Value is not less than or equal to value of {$lessThanOrEquals}')],
            value
          })
        } else {
          context.debug(ns.sh.LessThanOrEqualsConstraintComponent, {
            args: { lessThanOrEquals },
            message: [context.factory.literal('Value is not less than or equal to value of {$lessThanOrEquals}')],
            value
          })
        }
      }
    }
  }
}

export {
  compileDisjoint,
  compileEquals,
  compileLessThan,
  compileLessThanOrEquals
}
