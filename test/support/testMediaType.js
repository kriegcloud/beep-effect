import { strictEqual } from 'assert'
import { describe, it } from 'mocha'

function testMediaType (map, mediaType, name, implementation) {
  describe(mediaType, () => {
    it('should be supported', () => {
      strictEqual(map.has(mediaType), true)
    })

    it(`should use ${name}`, () => {
      strictEqual(map.get(mediaType) instanceof implementation, true)
    })
  })
}

export default testMediaType
