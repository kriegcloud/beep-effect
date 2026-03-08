import DataModelFactory from '@rdfjs/data-model/Factory.js'
import DatasetFactory from '@rdfjs/dataset/Factory.js'
import Environment from '@rdfjs/environment'
import TraverserFactory from '@rdfjs/traverser/Factory.js'

const factory = new Environment([
  DataModelFactory,
  DatasetFactory,
  TraverserFactory
])

export default factory
