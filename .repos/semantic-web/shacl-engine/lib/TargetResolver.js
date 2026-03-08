import TermSet from '@rdfjs/term-set'
import * as ns from './namespaces.js'
import resolveClasses from './resolveClasses.js'

class TargetResolver {
  constructor (ptr, { registry }) {
    this.registry = registry
    this.targetClass = new TermSet([
      ...resolveClasses(ptr.hasOut([ns.rdf.type], [ns.sh.NodeShape])),
      ...resolveClasses(ptr.out([ns.sh.targetClass]))
    ])
    this.targetNode = ptr.out([ns.sh.targetNode]).terms
    this.targetObjectsOf = ptr.out([ns.sh.targetObjectsOf]).terms
    this.targetSubjectsOf = ptr.out([ns.sh.targetSubjectsOf]).terms
    this.targets = [...ptr.out([ns.sh.target])]
  }

  async resolve (context) {
    const any = context.focusNode.node([null])

    const ptrs = [
      ...context.focusNode.hasOut([ns.rdf.type], this.targetClass).ptrs,
      ...context.focusNode.node(this.targetNode).ptrs,
      ...any.execute({ start: 'object', end: 'object', predicates: this.targetObjectsOf }).ptrs,
      ...any.execute({ start: 'subject', end: 'subject', predicates: this.targetSubjectsOf }).ptrs
    ]

    // resolve targets from registry (e.g., SPARQL targets)
    for (const targetPtr of this.targets) {
      for (const [, resolver] of this.registry.targetResolvers) {
        const terms = await resolver(targetPtr, context)
        ptrs.push(...context.focusNode.node(terms).ptrs)
      }
    }

    const resolved = context.focusNode.clone({ ptrs })

    return resolved.node([...new TermSet(resolved.terms)])
  }
}

export default TargetResolver
