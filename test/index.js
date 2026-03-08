import blankNodeTest from './blank-node.test.js'
import defaultGraphTest from './default-graph.test.js'
import fromQuadTest from './fromQuad.test.js'
import fromTermTest from './fromTerm.test.js'
import literalTest from './literal.test.js'
import namedNodeTest from './named-node.test.js'
import quadTest from './quad.test.js'
import variableTest from './variable.test.js'

function runTests ({ factory, mocha }) {
  if (!mocha) {
    mocha = { describe: global.describe, it: global.it }
  }

  const tests = [
    blankNodeTest,
    defaultGraphTest,
    fromQuadTest,
    fromTermTest,
    literalTest,
    namedNodeTest,
    quadTest,
    variableTest
  ]

  for (const test of tests) {
    test({ factory, mocha })
  }
}

if (global.rdf) {
  runTests({ factory: global.rdf })
}

export default runTests
