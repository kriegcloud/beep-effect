import rdfDataModel from '@rdfjs/data-model'
import rdfDataset from '@rdfjs/dataset'
import toNT from '@rdfjs/to-ntriples'
import fromFile from 'rdf-utils-fs/fromFile.js'
import Validator from '../Validator.js'

async function main () {
  // read the shape and data from the list coverage test
  const filename = new URL('../test/assets/coverage/list.ttl', import.meta.url)
  const dataset = rdfDataset.dataset()

  for await (const quad of fromFile(filename.pathname)) {
    dataset.add(quad)
  }

  // create a validator instance for the shapes in the given dataset
  const validator = new Validator(dataset, { coverage: true, factory: rdfDataModel })

  // run the validation process
  const report = await validator.validate({ dataset })

  // check if the data conforms to the given shape
  console.log(`conforms: ${report.conforms}`)

  // get the covered quads
  console.log('coverage:')

  // one quad may show up multiple times -> put it into a dataset
  const coverage = rdfDataset.dataset(report.coverage())

  // print the unique quads
  console.log(toNT(coverage))
}

main()
