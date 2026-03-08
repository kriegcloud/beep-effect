import TermMap from '@rdfjs/term-map'
import * as ns from './namespaces.js'
import { compileTraversal } from './validations/traversal.js'

class Registry {
  constructor (validations) {
    this.validations = new TermMap(validations)
  }

  compile (shape) {
    const coverage = shape.validator.options.coverage

    // ignore deactivated shape
    if (shape.deactivated) {
      return []
    }

    let propertyValidation = false
    const selected = new Set()

    for (const property of shape.ptr.execute({ start: 'subject', end: 'predicate' })) {
      const result = this.validations.get(property.term)

      if (result) {
        selected.add(result)

        if (property.term.equals(ns.sh.property)) {
          propertyValidation = true
        }
      }
    }

    // for path coverage, add a dummy validation if there is no property validation
    if (coverage && shape.isPropertyShape && !propertyValidation) {
      selected.add(compileTraversal)
    }

    return [...selected].map(selected => selected(shape)).filter(Boolean)
  }
}

export default Registry
