#!/usr/bin/env node

const program = require('commander')

const defaults = {
  dimension: 64,
  prefix: 'http://example.org/#',
  test: ['N3Store-Triples', 'N3Store-Quads']
}

function memoryUsage (label) {
  console.log(`* ${label}: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`)
}

function runTest (label, test) {
  const id = `- ${label}`

  console.time(id)
  test()
  console.timeEnd(id)
}

program
  .option('-r, --rdf <package>', 'package to test', '..')
  .option('-t, --test <test>', 'tests to run', (test, tests) => {
    tests.push(test)

    return tests
  }, [])
  .option('-d, --dimension <dimension>', 'term dimension size', parseInt, defaults.dimension)
  .option('-p, --prefix <prefix>', 'prefix for Named Nodes', defaults.prefix)
  .parse(process.argv)

console.log('DatasetCore performance tests')

if (program.test.length === 0) {
  program.test = defaults.test
}

program.test.forEach(test => {
  require(`./tests/${test}`)({
    dimension: program.dimension,
    prefix: program.prefix,
    rdf: require(program.rdf),
    memoryUsage,
    runTest
  })
})
