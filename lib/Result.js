import toNT from '@rdfjs/to-ntriples'
import once from 'lodash/once.js'
import * as ns from './namespaces.js'

function resolveVariables (message, args) {
  return Object.entries(args).reduce((message, [name, value]) => {
    if (value && value.termType) {
      value = toNT(value)
    }

    return message
      .replace(`{$${name}}`, value)
      .replace(`{?${name}}`, value)
  }, message)
}

class Result {
  constructor ({
    args = {},
    constraintComponent,
    factory,
    focusNode,
    message = [],
    path,
    results = [],
    severity,
    shape,
    source = [],
    value,
    valuePaths = []
  } = {}) {
    this.args = args
    this.constraintComponent = constraintComponent
    this.factory = factory
    this.focusNode = focusNode
    this.path = path || shape.path
    this.results = results
    this.severity = severity
    this.shape = shape
    this.source = source
    this.value = value
    this.valuePaths = valuePaths

    this._message = once(() => {
      // shape message has higher prio than validation message
      if (this.shape.message.length > 0) {
        message = this.shape.message
      }

      // last the constraint component message
      if (message.length === 0) {
        message = this.shape.ptr.node([this.constraintComponent]).out([ns.sh.message]).terms
      }

      // create message literal with resolved variables
      return message.map(message => {
        return factory.literal(resolveVariables(message.value, args, factory), message.language || null)
      })
    })
  }

  get message () {
    return this._message()
  }

  build (resultPtr, { details } = {}) {
    resultPtr
      .addOut([ns.rdf.type], [ns.sh.ValidationResult])
      .addOut([ns.sh.focusNode], this.focusNode.terms)
      .addOut([ns.sh.resultSeverity], [this.severity])
      .addOut([ns.sh.sourceConstraint], this.source)
      .addOut([ns.sh.sourceConstraintComponent], [this.constraintComponent])
      .addOut([ns.sh.sourceShape], this.shape.ptr.terms)

    if (this.message) {
      resultPtr.addOut([ns.sh.resultMessage], this.message)
    }

    const buildResultStep = step => {
      if (step.quantifier === 'one') {
        if (step.predicates.length > 1) {
          return resultPtr.node([this.factory.blankNode()]).addList([ns.sh.alternativePath], step.predicates)
        }

        if (step.start === 'object') {
          return resultPtr.node([this.factory.blankNode()]).addOut([ns.sh.inversePath], [step.predicates[0]])
        }

        return resultPtr.node([step.predicates[0]])
      }

      if (step.quantifier === 'oneOrMore') {
        return resultPtr.node([this.factory.blankNode()]).addOut([ns.sh.oneOrMorePath], [step.predicates[0]])
      }

      if (step.quantifier === 'zeroOrMore') {
        return resultPtr.node([this.factory.blankNode()]).addOut([ns.sh.zeroOrMorePath], [step.predicates[0]])
      }

      if (step.quantifier === 'zeroOrOne') {
        return resultPtr.node([this.factory.blankNode()]).addOut([ns.sh.zeroOrOnePath], [step.predicates[0]])
      }
    }

    if (this.path) {
      if (this.path.length === 1) {
        resultPtr.addOut([ns.sh.resultPath], buildResultStep(this.path[0]).terms)
      } else {
        resultPtr.addList([ns.sh.resultPath], this.path.map(step => buildResultStep(step).term))
      }
    }

    if (typeof this.value !== 'undefined') {
      resultPtr.addOut([ns.sh.value], this.value.terms)
    }

    if (details) {
      for (const result of this.results) {
        resultPtr.addOut([ns.sh.detail], [this.factory.blankNode()], detailPtr => {
          result.build(detailPtr, { details })
        })
      }
    }
  }

  coverage () {
    return [
      ...this.valuePaths.flatMap(valuePath => [...valuePath.quads()]),
      ...this.results.flatMap(result => result.coverage())
    ]
  }
}

export default Result
