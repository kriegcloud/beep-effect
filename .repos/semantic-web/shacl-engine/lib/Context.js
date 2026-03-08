import toNT from '@rdfjs/to-ntriples'
import * as ns from './namespaces.js'
import pathsToString from './pathsToString.js'
import Report from './Report.js'
import Result from './Result.js'

class Context {
  constructor ({
    factory,
    focusNode,
    options = { debug: false, details: false },
    processed = new Set(),
    report = new Report({ factory, options }),
    results = new Map(),
    shape,
    value,
    valueOrNode,
    valuePaths,
    values
  } = {}) {
    this.factory = factory
    this.focusNode = focusNode
    this.options = options
    this.processed = processed
    this.report = report
    this.results = results
    this.shape = shape
    this.value = value
    this.valuePaths = valuePaths
    this.valueOrNode = valueOrNode
    this.values = values
  }

  create ({
    child,
    focusNode = this.focusNode,
    shape = this.shape,
    value = this.value,
    valueOrNode = this.valueOrNode,
    valuePaths = this.valuePaths,
    values = this.values
  } = {}) {
    return new Context({
      factory: this.factory,
      focusNode,
      options: this.options,
      processed: this.processed,
      report: child ? new Report({ factory: this.factory, options: this.options }) : this.report,
      results: this.results,
      shape,
      value,
      valueOrNode,
      valuePaths,
      values
    })
  }

  id ({ shape = this.shape } = {}) {
    return `${toNT(shape.ptr.term)} - ${toNT(this.focusNode.term)} - ${pathsToString(this.valuePaths)}`
  }

  result (args) {
    const result = new Result({
      factory: this.factory,
      focusNode: this.focusNode,
      shape: this.shape,
      value: this.value,
      valuePaths: this.valuePaths,
      ...args
    })

    const id = this.id()

    if (!this.results.has(id)) {
      this.results.set(id, new Set([result]))
    } else {
      this.results.get(id).add(result)
    }

    this.report.results.push(result)
  }

  debug (constraintComponent, args) {
    if (this.options.debug) {
      this.result({ severity: ns.shn.Debug, constraintComponent, ...args })
    }
  }

  trace (constraintComponent, args) {
    if (this.options.trace) {
      this.result({ severity: ns.shn.Trace, constraintComponent, ...args })
    }
  }

  test (success, constraintComponent, args) {
    if (success) {
      this.debug(constraintComponent, args)
    } else {
      this.violation(constraintComponent, args)
    }
  }

  violation (constraintComponent, args) {
    this.result({
      constraintComponent,
      severity: this.shape.severity || ns.sh.Violation,
      ...args
    })
  }
}

export default Context
