import Environment from '@rdfjs/environment'
import NamespaceFactory from '@rdfjs/namespace/Factory.js'
import DataFactory from '@rdfjs/data-model/Factory.js'

export default new Environment([
  NamespaceFactory,
  DataFactory,
])
