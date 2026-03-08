import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import * as score from '../index.js'

describe('@rdfjs/score', () => {
  it('should export all functions', () => {
    strictEqual(typeof score.combine, 'function')
    strictEqual(typeof score.concat, 'function')
    strictEqual(typeof score.count, 'function')
    strictEqual(typeof score.distinct, 'function')
    strictEqual(typeof score.exists, 'function')
    strictEqual(typeof score.fallback, 'function')
    strictEqual(typeof score.fixed, 'function')
    strictEqual(typeof score.language, 'function')
    strictEqual(typeof score.pageRank, 'function')
    strictEqual(typeof score.pathDepth, 'function')
    strictEqual(typeof score.prioritized, 'function')
    strictEqual(typeof score.product, 'function')
    strictEqual(typeof score.scale, 'function')
    strictEqual(typeof score.sort, 'function')
    strictEqual(typeof score.sortObjects, 'function')
    strictEqual(typeof score.sum, 'function')
    strictEqual(typeof score.type, 'function')
  })
})
