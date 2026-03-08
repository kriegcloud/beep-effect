import * as ns from '../namespaces.js'

function compileMaxCount (shape) {
  const maxCount = parseInt(shape.ptr.out([ns.sh.maxCount]).value)

  return {
    property: validateMaxCountProperty(maxCount)
  }
}

function validateMaxCountProperty (maxCount) {
  return context => {
    context.test(context.values.terms.length <= maxCount, ns.sh.MaxCountConstraintComponent, {
      args: { maxCount },
      message: [context.factory.literal('More than {$maxCount} values')]
    })
  }
}

function compileMinCount (shape) {
  const minCount = parseInt(shape.ptr.out([ns.sh.minCount]).value)

  return {
    property: validateMinCountProperty(minCount)
  }
}

function validateMinCountProperty (minCount) {
  return context => {
    context.test(context.values.terms.length >= minCount, ns.sh.MinCountConstraintComponent, {
      args: { minCount },
      message: [context.factory.literal('Less than {$minCount} values')]
    })
  }
}

export {
  compileMaxCount,
  compileMinCount
}
