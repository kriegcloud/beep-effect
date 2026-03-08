import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'
import { XsdValidation } from 'rdf-validation'
import * as ns from '../namespaces.js'
import resolveClasses from '../resolveClasses.js'

const toTermType = new TermMap([
  [ns.sh.BlankNode, new Set(['BlankNode'])],
  [ns.sh.BlankNodeOrIRI, new Set(['BlankNode', 'NamedNode'])],
  [ns.sh.BlankNodeOrLiteral, new Set(['BlankNode', 'Literal'])],
  [ns.sh.IRI, new Set(['NamedNode'])],
  [ns.sh.IRIOrLiteral, new Set(['NamedNode', 'Literal'])],
  [ns.sh.Literal, new Set(['Literal'])]
])

function compileClass (shape) {
  const classes = shape.ptr.out([ns.sh.class]).map(ptr => resolveClasses(ptr))

  return {
    generic: validateClass(classes)
  }
}

function validateClass (classes) {
  return context => {
    const types = new TermSet(context.valueOrNode.out([ns.rdf.type]).terms)

    for (const classSet of classes) {
      const result = [...types].some(type => classSet.has(type))

      context.test(result, ns.sh.ClassConstraintComponent, { value: context.valueOrNode })
    }
  }
}

function compileDatatype (shape) {
  const datatype = shape.ptr.out([ns.sh.datatype]).term
  const validation = new XsdValidation()

  return {
    generic: validateDatatype(datatype, validation)
  }
}

function validateDatatype (datatype, validation) {
  return context => {
    const result = datatype.equals(context.valueOrNode.term.datatype) &&
      validation.validateSimple(context.valueOrNode.term)

    context.test(result, ns.sh.DatatypeConstraintComponent, {
      args: { datatype },
      message: [context.factory.literal('Value does not have datatype {$datatype}')],
      value: context.valueOrNode
    })
  }
}

function compileNodeKind (shape) {
  const nodeKind = shape.ptr.out([ns.sh.nodeKind]).term
  const termTypes = toTermType.get(nodeKind)

  return {
    generic: validateNodeKind(nodeKind, termTypes)
  }
}

function validateNodeKind (nodeKind, termTypes) {
  return context => {
    context.test(termTypes.has(context.valueOrNode.term.termType), ns.sh.NodeKindConstraintComponent, {
      args: { nodeKind },
      message: [context.factory.literal('Value does not have node kind {$nodeKind}')],
      value: context.valueOrNode
    })
  }
}

export {
  compileClass,
  compileDatatype,
  compileNodeKind
}
