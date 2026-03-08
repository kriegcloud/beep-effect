import { fromRdf } from 'rdf-literal'
import { every, filter, map } from '../async.js'
import * as ns from '../namespaces.js'

function compileNode (shape) {
  const node = [...shape.ptr.out([ns.sh.node])].map(ptr => shape.validator.shape(ptr))

  return {
    generic: validateNode(node)
  }
}

function validateNode (node) {
  return async context => {
    for (const shape of node) {
      const nodeContext = await shape.validate(context.create({ child: true, focusNode: context.valueOrNode }))

      context.test(nodeContext.report.conforms, ns.sh.NodeConstraintComponent, {
        args: { node: shape.ptr.term },
        message: [context.factory.literal('Value does not have shape {$node}')],
        results: nodeContext.report.results,
        value: context.valueOrNode
      })
    }
  }
}

function compileProperty (shape) {
  const property = [...shape.ptr.out([ns.sh.property])].map(ptr => shape.validator.shape(ptr))

  return {
    generic: validateProperty(property)
  }
}

function validateProperty (property) {
  return async context => {
    const propertyContext = context.create({ focusNode: context.valueOrNode })

    for (const shape of property) {
      await shape.validate(propertyContext)
    }
  }
}

function compileQualifiedShape (shape) {
  const valueShape = shape.validator.shape(shape.ptr.out([ns.sh.qualifiedValueShape]))

  const valueShapesDisjointTerm = shape.ptr.out([ns.sh.qualifiedValueShapesDisjoint]).term
  const valueShapesDisjoint = valueShapesDisjointTerm ? fromRdf(valueShapesDisjointTerm) : false

  const maxCountTerm = shape.ptr.out([ns.sh.qualifiedMaxCount]).term
  const maxCount = maxCountTerm ? parseInt(maxCountTerm.value) : null

  const minCountTerm = shape.ptr.out([ns.sh.qualifiedMinCount]).term
  const minCount = minCountTerm ? parseInt(minCountTerm.value) : null

  return {
    property: validateQualifiedShapeProperty(valueShape, valueShapesDisjoint, maxCount, minCount)
  }
}

function validateQualifiedShapeProperty (valueShape, valueShapesDisjoint, maxCount, minCount) {
  return async context => {
    const resultsDeep = []
    let siblingShapes = []

    if (valueShapesDisjoint) {
      siblingShapes = new Set(
        context.shape.ptr
          .in([ns.sh.property])
          .out([ns.sh.property])
          .out([ns.sh.qualifiedValueShape])
          .filter(ptr => !ptr.term.equals(valueShape.ptr.term))
          .map(ptr => context.shape.validator.shape(ptr))
      )
    }

    const count = (await filter(context.values, async value => {
      const valueShapeReport = (await valueShape.validate(context.create({ child: true, focusNode: value }))).report

      resultsDeep.push(valueShapeReport.results)

      if (!valueShapeReport.conforms) {
        return false
      }

      if (siblingShapes.length === 0) {
        return true
      }

      if (context.options.debug || context.options.details) {
        // all shapes are processed if debug info or details are requested
        const siblingReports = await map([...siblingShapes], async siblingShape => {
          return (await siblingShape.validate(context.create({ child: true, focusNode: value }))).report
        })

        resultsDeep.push(siblingReports.flatMap(report => report.results))

        return !siblingReports.every(report => report.conforms)
      } else {
        // otherwise, we stop after the first shape does not conform
        return !await every([...siblingShapes], async siblingShape => {
          return (await siblingShape.validate(context.create({ child: true, focusNode: value }))).report.conforms
        })
      }
    })).length

    if (maxCount !== null) {
      context.test(count <= maxCount, ns.sh.QualifiedMaxCountConstraintComponent, {
        args: {
          qualifiedMaxCount: maxCount,
          qualifiedValueShape: valueShape.ptr.term,
          qualifiedValueShapesDisjoint: valueShapesDisjoint
        },
        message: [context.factory.literal('More than {$qualifiedMaxCount} values have shape {$qualifiedValueShape}')],
        results: resultsDeep.flat()
      })
    }

    if (minCount !== null) {
      context.test(count >= minCount, ns.sh.QualifiedMinCountConstraintComponent, {
        args: {
          qualifiedMinCount: minCount,
          qualifiedValueShape: valueShape.ptr.term,
          qualifiedValueShapesDisjoint: valueShapesDisjoint
        },
        message: [context.factory.literal('Less than {$qualifiedMinCount} values have shape {$qualifiedValueShape}')],
        results: resultsDeep.flat()
      })
    }
  }
}

export {
  compileNode,
  compileProperty,
  compileQualifiedShape
}
