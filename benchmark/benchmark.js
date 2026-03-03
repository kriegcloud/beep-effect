import Benchmark from 'benchmark'
import catharsisParse from 'catharsis'
import { parse as jtppParse } from '../dist/esm/index.js'
import jtpParse from 'jsdoctypeparser'

Benchmark.options.minSamples = 1000

const testCases = [
  'Name',
  'Array<number>',
  '{ keyA: Type<A | "string val" >, keyB: function(string, B): A }'
  // '{ keyA: Type<(typeof A) | "string val" | X<function(F, L): (X | D)>>, keyB: function(string, B): A<B, C> }'
]

for (const testCase of testCases) {
  console.log(`Testing expression: ${testCase}`)
  const suite = new Benchmark.Suite(testCase)
  suite
    .add('catharsis', function () {
      catharsisParse(testCase, {
        jsdoc: true,
        useCache: false
      })
    })
    .add('jsdoc-type-pratt-parser', function () {
      jtppParse(testCase, 'jsdoc')
    })
    .add('jsdoctypeparser', function () {
      jtpParse(testCase, {
        mode: 'jsdoc'
      })
    })
    .on('cycle', function (event) {
      console.log(event.target.toString())
    })
    .on('complete', function () {
      console.log(`The fastest was ${this.filter('fastest').map('name')}\n`)
    })
    .run()
}
