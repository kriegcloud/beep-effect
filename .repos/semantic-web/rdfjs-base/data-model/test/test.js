import mocha from 'mocha'
import rdf from '../index.js'
import runTests from './index.js'

mocha.describe('@rdfjs/data-model', () => {
  runTests({ factory: rdf, mocha })
})
