import compareTerms from '../compareTerms.js'
import * as ns from '../namespaces.js'

function compileMaxExclusive (shape) {
  const maxExclusive = shape.ptr.out([ns.sh.maxExclusive]).term

  return {
    generic: validateMaxExclusive(maxExclusive)
  }
}

function validateMaxExclusive (maxExclusive) {
  return context => {
    const comparison = compareTerms(context.valueOrNode.term, maxExclusive)

    context.test(comparison !== null && comparison < 0, ns.sh.MaxExclusiveConstraintComponent, {
      args: { maxExclusive },
      message: [context.factory.literal('Value is not less than {$maxExclusive}')],
      value: context.valueOrNode
    })
  }
}

function compileMaxInclusive (shape) {
  const maxInclusive = shape.ptr.out([ns.sh.maxInclusive]).term

  return {
    generic: validateMaxInclusive(maxInclusive)
  }
}

function validateMaxInclusive (maxInclusive) {
  return context => {
    const comparison = compareTerms(context.valueOrNode.term, maxInclusive)

    context.test(comparison !== null && comparison <= 0, ns.sh.MaxInclusiveConstraintComponent, {
      args: { maxInclusive },
      message: [context.factory.literal('Value is not less than or equal to {$maxInclusive}')],
      value: context.valueOrNode
    })
  }
}

function compileMinExclusive (shape) {
  const minExclusive = shape.ptr.out([ns.sh.minExclusive]).term

  return {
    generic: validateMinExclusive(minExclusive)
  }
}

function validateMinExclusive (minExclusive) {
  return context => {
    const comparison = compareTerms(context.valueOrNode.term, minExclusive)

    context.test(comparison !== null && comparison > 0, ns.sh.MinExclusiveConstraintComponent, {
      args: { minExclusive },
      message: [context.factory.literal('Value is not greater than {$minExclusive}')],
      value: context.valueOrNode
    })
  }
}

function compileMinInclusive (shape) {
  const minInclusive = shape.ptr.out([ns.sh.minInclusive]).term

  return {
    generic: validateMinInclusive(minInclusive)
  }
}

function validateMinInclusive (minInclusive) {
  return context => {
    const comparison = compareTerms(context.valueOrNode.term, minInclusive)

    context.test(comparison !== null && comparison >= 0, ns.sh.MinInclusiveConstraintComponent, {
      args: { minInclusive },
      message: [context.factory.literal('Value is not greater than or equal to {$minInclusive}')],
      value: context.valueOrNode
    })
  }
}

export {
  compileMaxExclusive,
  compileMaxInclusive,
  compileMinExclusive,
  compileMinInclusive
}
