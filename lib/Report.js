import { PathList } from 'grapoi'
import once from 'lodash/once.js'
import * as ns from './namespaces.js'

class Report {
  constructor ({ details, factory, options, results = [] } = {}) {
    this.details = details
    this.factory = factory
    this.options = options
    this.results = results

    this._conforms = once(() => !this.results.some(result => {
      return (
        result.severity.equals(ns.sh.Info) ||
        result.severity.equals(ns.sh.Violation) ||
        result.severity.equals(ns.sh.Warning)
      )
    }))

    this._ptr = once(() => this.build())
  }

  get conforms () {
    return this._conforms()
  }

  get dataset () {
    return this.ptr.dataset
  }

  get ptr () {
    return this._ptr()
  }

  get term () {
    return this.ptr.term
  }

  build () {
    const ptr = new PathList({
      dataset: this.factory.dataset(),
      factory: this.factory,
      terms: [this.factory.blankNode()]
    })

    ptr
      .addOut([ns.rdf.type], [ns.sh.ValidationReport])
      .addOut([ns.sh.conforms], [this.factory.literal(this.conforms.toString(), ns.xsd.boolean)])

    for (const result of this.results) {
      ptr.addOut([ns.sh.result], [this.factory.blankNode()], resultPtr => {
        result.build(resultPtr, this.options)
      })
    }

    return ptr
  }

  coverage () {
    return this.results.flatMap(result => result.coverage())
  }
}

export default Report
