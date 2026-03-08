import DataFactory from '@rdfjs/data-model/Factory.js'
import DatasetFactory from '@rdfjs/dataset/Factory.js'
import Environment from '@rdfjs/environment'
import NamespaceFactory from '@rdfjs/namespace/Factory.js'

const factory = new Environment([DataFactory, DatasetFactory, NamespaceFactory])

export default factory
