import TermMap from '@rdfjs/term-map'
import { PathList } from 'grapoi'
import Context from './lib/Context.js'
import * as ns from './lib/namespaces.js'
import Registry from './lib/Registry.js'
import Shape from './lib/Shape.js'
import TargetResolverRegistry from './lib/TargetResolverRegistry.js'
import validations from './lib/validations.js'

class Validator {
  constructor (dataset, { factory, ...options }) {
    this.factory = factory
    this.options = options
    this.registry = new Registry(validations)
    this.targetResolverRegistry = new TargetResolverRegistry(this.options.targetResolvers || [])
    this.shapesPtr = new PathList({ dataset, factory })
    this.shapes = new TermMap()

    if (this.options.coverage) {
      this.options.debug = true
      this.options.details = true
      this.options.trace = true
    }

    if (this.options.validations) {
      for (const [key, value] of this.options.validations) {
        this.registry.validations.set(key, value)
      }
    }

    const shapePtrs = [
      ...this.shapesPtr.hasOut([ns.sh.targetClass]),
      ...this.shapesPtr.hasOut([ns.sh.targetNode]),
      ...this.shapesPtr.hasOut([ns.sh.targetObjectsOf]),
      ...this.shapesPtr.hasOut([ns.sh.targetSubjectsOf]),
      ...this.shapesPtr.hasOut([ns.sh.target]),
      ...this.shapesPtr.hasOut([ns.rdf.type], [ns.sh.NodeShape]),
      ...this.shapesPtr.hasOut([ns.rdf.type], [ns.sh.PropertyShape])
    ]

    for (const shapePtr of shapePtrs) {
      this.shape(shapePtr)
    }
  }

  shape (ptr) {
    if (!ptr.term) {
      return null
    }

    let shape = this.shapes.get(ptr.term)

    if (!shape) {
      shape = new Shape(ptr, { validator: this })
      this.shapes.set(ptr.term, shape)
    }

    return shape
  }

  async validate (data, shapes) {
    const focusNode = new PathList({ ...data, factory: this.factory })
    const context = new Context({ factory: this.factory, focusNode, options: this.options, validator: this })

    if (shapes) {
      // if shapes are given, use only the term for the lookup in the ptr from the constructor
      shapes = shapes.map(shape => this.shape(this.shapesPtr.node(shape.terms)))
    } else {
      shapes = this.shapes.values()
    }

    for (const shape of shapes) {
      const shapeContext = context.create({ shape })

      let targets

      // if the focusNode has already terms (given as argument), there is no need to resolve the targets
      if (!focusNode.isAny()) {
        targets = focusNode
      } else {
        targets = await shape.resolveTargets(shapeContext)
      }

      for (const focusNode of targets) {
        await shape.validate(shapeContext.create({ focusNode }))
      }
    }

    return context.report
  }
}

export default Validator
