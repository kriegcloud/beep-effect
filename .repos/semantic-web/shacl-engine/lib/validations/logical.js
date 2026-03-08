import { map, some } from '../async.js'
import * as ns from '../namespaces.js'

function compileAnd (shape) {
  const and = [...shape.ptr.out([ns.sh.and])]
    .flatMap(ptr => [...ptr.list()])
    .map(ptr => shape.validator.shape(ptr))

  return {
    generic: validateAnd(and)
  }
}

function validateAnd (and) {
  return async context => {
    const andReports = await map(and, async shape => {
      return (await shape.validate(context.create({ child: true, focusNode: context.valueOrNode }))).report
    })

    const result = andReports.every(report => report.conforms)

    context.test(result, ns.sh.AndConstraintComponent, {
      results: andReports.flatMap(report => report.results),
      value: context.valueOrNode
    })
  }
}

function compileNot (shape) {
  const not = shape.validator.shape(shape.ptr.out([ns.sh.not]))

  return {
    generic: validateNot(not)
  }
}

function validateNot (not) {
  return async context => {
    const notReport = (await not.validate(context.create({ child: true, focusNode: context.valueOrNode }))).report

    const result = !notReport.conforms

    context.test(result, ns.sh.NotConstraintComponent, {
      args: { not: not.ptr.term },
      message: [context.factory.literal('Value does have shape {$not}')],
      results: notReport.results,
      value: context.valueOrNode
    })
  }
}

function compileOr (shape) {
  const or = [...shape.ptr.out([ns.sh.or])]
    .flatMap(ptr => [...ptr.list()])
    .map(ptr => shape.validator.shape(ptr))

  return {
    generic: validateOr(or)
  }
}

function validateOr (or) {
  return async context => {
    let results = []
    let result

    if (context.options.debug || context.options.details) {
      // all shapes are processed if debug info or details are requested
      const orReports = await map(or, async shape => {
        return (await shape.validate(context.create({ child: true, focusNode: context.valueOrNode }))).report
      })

      results = orReports.flatMap(report => report.results)
      result = orReports.some(report => report.conforms)
    } else {
      // otherwise, we stop after the first shape conforms
      result = await some(or, async shape => {
        return (await shape.validate(context.create({ child: true, focusNode: context.valueOrNode }))).report.conforms
      })
    }

    context.test(result, ns.sh.OrConstraintComponent, {
      results,
      value: context.valueOrNode
    })
  }
}

function compileXone (shape) {
  const xone = [...shape.ptr.out([ns.sh.xone])]
    .flatMap(ptr => [...ptr.list()])
    .map(ptr => shape.validator.shape(ptr))

  return {
    generic: validateXone(xone)
  }
}

function validateXone (xone) {
  return async context => {
    const xoneReports = await map(xone, async shape => {
      return (await shape.validate(context.create({ child: true, focusNode: context.valueOrNode }))).report
    })

    const result = xoneReports.filter(report => report.conforms).length === 1

    context.test(result, ns.sh.XoneConstraintComponent, {
      results: xoneReports.flatMap(report => report.results),
      value: context.valueOrNode
    })
  }
}

export {
  compileAnd,
  compileNot,
  compileOr,
  compileXone
}
