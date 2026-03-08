import DataModelFactory from '@rdfjs/data-model/Factory.js'
import DatasetFactory from '@rdfjs/dataset/Factory.js'
import Environment from '@rdfjs/environment'

const rdf = new Environment([DataModelFactory, DatasetFactory])

export default rdf
