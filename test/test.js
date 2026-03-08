import mocha from 'mocha'
import rdf from '../index.js'
import runTests from './index.js'

mocha.describe('@rdfjs/dataset', () => {
  runTests({ factory: rdf, mocha })
})
