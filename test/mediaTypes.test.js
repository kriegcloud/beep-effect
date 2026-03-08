import { strictEqual } from 'node:assert'
import { describe, it } from 'mocha'
import mediaTypes from '../mediaTypes.js'

describe('mediaTypes', () => {
  it('should be a Map', () => {
    strictEqual(mediaTypes instanceof Map, true)
  })

  it('should contain an entry for json -> application/ld+json', () => {
    strictEqual(mediaTypes.get('json'), 'application/ld+json')
  })

  it('should contain an entry for n3 -> text/n3', () => {
    strictEqual(mediaTypes.get('n3'), 'text/n3')
  })

  it('should contain an entry for nq -> application/n-quads', () => {
    strictEqual(mediaTypes.get('nq'), 'application/n-quads')
  })

  it('should contain an entry for nt -> application/n-triples', () => {
    strictEqual(mediaTypes.get('nt'), 'application/n-triples')
  })

  it('should contain an entry for rdf -> application/rdf+xml', () => {
    strictEqual(mediaTypes.get('rdf'), 'application/rdf+xml')
  })

  it('should contain an entry for trig -> application/trig', () => {
    strictEqual(mediaTypes.get('trig'), 'application/trig')
  })

  it('should contain an entry for ttl -> text/turtle', () => {
    strictEqual(mediaTypes.get('ttl'), 'text/turtle')
  })
})
