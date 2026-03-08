import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'
import once from 'lodash/once.js'

class ShapeValidator {
  constructor (shape) {
    this.shape = shape

    this._compiled = once(() => this.shape.validator.registry.compile(shape))
  }

  get compiled () {
    return this._compiled()
  }

  async validate (context) {
    // ignore empty data graph
    if (context.focusNode.dataset.size === 0) {
      return context
    }

    if (this.shape.isPropertyShape) {
      await this.validateProperty(context)
    } else {
      await this.validateNode(context)
    }

    return context
  }

  async validateNode (context) {
    const shapeContext = context.create({ shape: this.shape, valueOrNode: context.value || context.focusNode })

    for (const validation of this.compiled) {
      if (validation.node) {
        await validation.node(shapeContext)
      }

      if (validation.generic) {
        await validation.generic(shapeContext)
      }
    }
  }

  async validateProperty (context) {
    let resolved

    if (this.shape.isSparqlShape) {
      // traversing happens in the SPARQL constraints
      resolved = context.focusNode
    } else {
      resolved = context.focusNode.executeAll(this.shape.path)
    }

    const values = resolved.node(new TermSet(resolved.terms))
    const valuesPaths = [...resolved].reduce((valuesPaths, valuePaths) => {
      const term = valuePaths.term
      const value = resolved.node([term])

      if (!valuesPaths.has(term)) {
        valuesPaths.set(term, { value, valuePaths: [] })
      }

      valuesPaths.get(term).valuePaths.push(valuePaths)

      return valuesPaths
    }, new TermMap()).values()

    const valuesContext = context.create({ shape: this.shape, values })

    for (const validation of this.compiled) {
      if (validation.property) {
        await validation.property(valuesContext)
      }
    }

    for (const { value, valuePaths } of valuesPaths) {
      const valueContext = context.create({ shape: this.shape, value, valueOrNode: value, valuePaths })

      for (const validation of this.compiled) {
        if (validation.generic) {
          await validation.generic(valueContext)
        }
      }
    }
  }
}

export default ShapeValidator
