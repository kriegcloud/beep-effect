import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import Factory from '../Factory.js'

describe('Factory', () => {
  it('should be a class', () => {
    strictEqual(typeof Factory, 'function')
  })

  it('should add a .score object on init', () => {
    const factory = new Factory()

    factory.init()

    strictEqual(typeof factory.score, 'object')
  })

  it('should add the score factory interface to .score on init', () => {
    const factory = new Factory()

    factory.init()

    strictEqual(typeof factory.score.combine, 'function')
    strictEqual(typeof factory.score.concat, 'function')
    strictEqual(typeof factory.score.count, 'function')
    strictEqual(typeof factory.score.distinct, 'function')
    strictEqual(typeof factory.score.exists, 'function')
    strictEqual(typeof factory.score.fallback, 'function')
    strictEqual(typeof factory.score.fixed, 'function')
    strictEqual(typeof factory.score.language, 'function')
    strictEqual(typeof factory.score.pageRank, 'function')
    strictEqual(typeof factory.score.pathDepth, 'function')
    strictEqual(typeof factory.score.prioritized, 'function')
    strictEqual(typeof factory.score.product, 'function')
    strictEqual(typeof factory.score.scale, 'function')
    strictEqual(typeof factory.score.sort, 'function')
    strictEqual(typeof factory.score.sortObjects, 'function')
    strictEqual(typeof factory.score.sum, 'function')
    strictEqual(typeof factory.score.type, 'function')
  })
})
