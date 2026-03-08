const DatasetCore = require('../DatasetCore')
const rdf = require('@rdfjs/data-model')

describe('DatasetCore', () => {
  describe('The DatasetCore module', () => {
    test('should be a function', () => {
      expect(typeof DatasetCore).toBe('function')
    })

    test('should be an DatasetCore constructor', () => {
      expect(new DatasetCore()).toBeInstanceOf(DatasetCore)
    })
  })

  describe('An empty DatasetCore', () => {
    const store = new DatasetCore()

    test('should have size 0', () => {
      expect(store.size).toEqual(0)
    })

    test('should be empty', () => {
      expect(store._getQuads()).toHaveLength(0)
    })

    describe('every', () => {
      describe('with no parameters and a callback always returning true', () => {
        test('should return false', () => {
          expect(store._every(alwaysTrue, null, null, null, null)).toBe(false)
        })
      })
      describe('with no parameters and a callback always returning false', () => {
        test('should return false', () => {
          expect(store._every(alwaysFalse, null, null, null, null)).toBe(false)
        })
      })
    })

    describe('some', () => {
      describe('with no parameters and a callback always returning true', () => {
        test('should return false', () => {
          expect(store._some(alwaysTrue, null, null, null, null)).toBe(false)
        })
      })
      describe('with no parameters and a callback always returning false', () => {
        test('should return false', () => {
          expect(store._some(alwaysFalse, null, null, null, null)).toBe(false)
        })
      })
    })

    test('should still have size 0 (instead of null) after adding and removing a triple', () => {
      expect(store.size).toEqual(0)
      store.add(quadify('a', 'b', 'c'))
      store.delete(quadify('a', 'b', 'c'))
      expect(store.size).toEqual(0)
    })
  })

  describe('An DatasetCore with initialized with 3 elements', () => {
    const store = new DatasetCore([
      rdf.quad(rdf.namedNode('s1'), rdf.namedNode('p1'), rdf.namedNode('o1')),
      rdf.quad(rdf.namedNode('s1'), rdf.namedNode('p1'), rdf.namedNode('o2')),
      rdf.quad(rdf.namedNode('s1'), rdf.namedNode('p1'), rdf.namedNode('o3'))
    ])

    test('should have size 3', () => {
      expect(store.size).toEqual(3)
    })

    describe('adding a triple that already exists', () => {
      test('should not increase the size', () => {
        store.add(quadify('s1', 'p1', 'o1'))
        expect(store.size).toEqual(3)
      })
    })

    describe('adding a triple that did not exist yet', () => {
      test('should increase the size', () => {
        store.add(quadify('s1', 'p1', 'o4'))
        expect(store.size).toEqual(4)
      })
    })

    describe('removing an existing triple', () => {
      test('should decrease the size', () => {
        store.delete(quadify('s1', 'p1', 'o4'))
        expect(store.size).toEqual(3)
      })
    })

    describe('removing a non-existing triple', () => {
      test('should not decrease the size', () => {
        store.delete(quadify('s1', 'p1', 'o5'))
        expect(store.size).toEqual(3)
      })
    })
  })

  describe('An DatasetCore with 5 elements', () => {
    const store = new DatasetCore()
    store.add(quadify('s1', 'p1', 'o1'))
    store.add(quadify({ subject: 's1', predicate: 'p1', object: 'o2' }))
    store.add(quadify({ subject: 's1', predicate: 'p2', object: 'o2' }))
    store.add(quadify({ subject: 's2', predicate: 'p1', object: 'o1' }))
    store.add(quadify('s1', 'p1', 'o1', 'c4'))

    test('should have size 5', () => {
      expect(store.size).toEqual(5)
    })

    describe('when searched without parameters', () => {
      test('should return all items', shouldIncludeAll(
        store._getQuads(),
        ['s1', 'p1', 'o1'],
        ['s1', 'p1', 'o2'],
        ['s1', 'p2', 'o2'],
        ['s2', 'p1', 'o1'],
        ['s1', 'p1', 'o1', 'c4']
      ))
    })

    describe('when searched with an existing subject parameter', () => {
      test('should return all items with this subject in all graphs',
        shouldIncludeAll(store._getQuads(rdf.namedNode('s1'), null, null),
          ['s1', 'p1', 'o1'],
          ['s1', 'p1', 'o2'],
          ['s1', 'p2', 'o2'],
          ['s1', 'p1', 'o1', 'c4']
        )
      )
    })

    describe('when searched with a non-existing subject parameter', () => {
      itShouldBeEmpty(store._getQuads(rdf.namedNode('s3'), null, null))
    })

    describe('when searched with a non-existing subject parameter that exists elsewhere', () => {
      itShouldBeEmpty(store._getQuads(rdf.namedNode('p1'), null, null))
    })

    describe('when searched with an existing predicate parameter', () => {
      test('should return all items with this predicate in all graphs',
        shouldIncludeAll(store._getQuads(null, rdf.namedNode('p1'), null),
          ['s1', 'p1', 'o1'],
          ['s1', 'p1', 'o2'],
          ['s2', 'p1', 'o1'],
          ['s1', 'p1', 'o1', 'c4']
        )
      )
    })

    describe('when searched with a non-existing predicate parameter', () => {
      itShouldBeEmpty(store._getQuads(null, rdf.namedNode('p3'), null))
    })

    describe('when searched with an existing object parameter', () => {
      test('should return all items with this object in all graphs',
        shouldIncludeAll(store._getQuads(null, null, rdf.namedNode('o1')),
          ['s1', 'p1', 'o1'],
          ['s2', 'p1', 'o1'],
          ['s1', 'p1', 'o1', 'c4']
        )
      )
    })

    describe('when searched with a non-existing object parameter', () => {
      itShouldBeEmpty(store._getQuads(null, null, rdf.namedNode('o4')))
    })

    describe('when searched with existing subject and predicate parameters', () => {
      test('should return all items with this subject and predicate in all graphs',
        shouldIncludeAll(store._getQuads(rdf.namedNode('s1'), rdf.namedNode('p1'), null),
          ['s1', 'p1', 'o1'],
          ['s1', 'p1', 'o2'],
          ['s1', 'p1', 'o1', 'c4']
        )
      )
    })

    describe('when searched with non-existing subject and predicate parameters', () => {
      itShouldBeEmpty(store._getQuads(rdf.namedNode('s2'), rdf.namedNode('p2'), null))
    })

    describe('when searched with existing subject and object parameters', () => {
      test('should return all items with this subject and object in all graphs',
        shouldIncludeAll(store._getQuads(rdf.namedNode('s1'), null, rdf.namedNode('o1')),
          ['s1', 'p1', 'o1'],
          ['s1', 'p1', 'o1', 'c4']
        )
      )
    })

    describe('when searched with non-existing subject and object parameters', () => {
      itShouldBeEmpty(store._getQuads(rdf.namedNode('s2'), rdf.namedNode('p2'), null))
    })

    describe('when searched with existing predicate and object parameters', () => {
      test('should return all items with this predicate and object in all graphs',
        shouldIncludeAll(store._getQuads(null, rdf.namedNode('p1'), rdf.namedNode('o1')),
          ['s1', 'p1', 'o1'],
          ['s2', 'p1', 'o1'],
          ['s1', 'p1', 'o1', 'c4']
        )
      )
    })

    describe('when searched with non-existing predicate and object parameters in the default graph', () => {
      itShouldBeEmpty(store._getQuads(null, rdf.namedNode('p2'), rdf.namedNode('o3'), rdf.defaultGraph()))
    })

    describe('when searched with existing subject, predicate, and object parameters', () => {
      test('should return all items with this subject, predicate, and object in all graphs',
        shouldIncludeAll(store._getQuads(rdf.namedNode('s1'), rdf.namedNode('p1'), rdf.namedNode('o1')),
          ['s1', 'p1', 'o1'],
          ['s1', 'p1', 'o1', 'c4']
        )
      )
    })

    describe('when searched with a non-existing triple', () => {
      itShouldBeEmpty(store._getQuads(rdf.namedNode('s2'), rdf.namedNode('p2'), rdf.namedNode('o1')))
    })

    describe('when searched with the default graph parameter', () => {
      test('should return all items in the default graph',
        shouldIncludeAll(store._getQuads(null, null, null, rdf.defaultGraph()),
          ['s1', 'p1', 'o1'],
          ['s1', 'p1', 'o2'],
          ['s1', 'p2', 'o2'],
          ['s2', 'p1', 'o1']
        )
      )
    })

    describe('when searched with an existing named graph parameter', () => {
      test('should return all items in that graph',
        shouldIncludeAll(store._getQuads(null, null, null, rdf.namedNode('c4')),
          ['s1', 'p1', 'o1', 'c4']
        )
      )
    })

    describe('when searched with a non-existing named graph parameter', () => {
      itShouldBeEmpty(store._getQuads(null, null, null, rdf.namedNode('c5')))
    })

    describe('forEach', () => {
      describe('with existing subject, predicate, object and graph parameters', () => {
        test('should have iterated all items with this subject, predicate, object and graph',
          shouldIncludeAll(
            collect(store, '_forEach', 's1', 'p1', 'o2', ''),
            ['s1', 'p1', 'o2', ''])
        )
      })

      describe('with existing subject, predicate and object parameters', () => {
        test('should have iterated all items with this subject, predicate and object',
          shouldIncludeAll(
            collect(store, '_forEach', 's1', 'p2', 'o2', null),
            ['s1', 'p2', 'o2', ''])
        )
      })

      describe('with existing subject, predicate and graph parameters', () => {
        test('should have iterated all items with this subject, predicate and graph',
          shouldIncludeAll(
            collect(store, '_forEach', 's1', 'p1', null, ''),
            ['s1', 'p1', 'o1', ''],
            ['s1', 'p1', 'o2', ''])
        )
      })

      describe('with existing subject, object and graph parameters', () => {
        test('should have iterated all items with this subject, object and graph',
          shouldIncludeAll(
            collect(store, '_forEach', 's1', null, 'o2', ''),
            ['s1', 'p1', 'o2', ''],
            ['s1', 'p2', 'o2', ''])
        )
      })

      describe('with existing predicate, object and graph parameters', () => {
        test('should have iterated all items with this predicate, object and graph',
          shouldIncludeAll(
            collect(store, '_forEach', null, 'p1', 'o1', ''),
            ['s1', 'p1', 'o1', ''],
            ['s2', 'p1', 'o1', ''])
        )
      })

      describe('with existing subject and predicate parameters', () => {
        test('should iterate all items with this subject and predicate',
          shouldIncludeAll(
            collect(store, '_forEach', 's1', 'p1', null, null),
            ['s1', 'p1', 'o1', ''],
            ['s1', 'p1', 'o2', ''],
            ['s1', 'p1', 'o1', 'c4'])
        )
      })

      describe('with existing subject and object parameters', () => {
        test('should iterate all items with this subject and predicate',
          shouldIncludeAll(
            collect(store, '_forEach', 's1', null, 'o2', null),
            ['s1', 'p1', 'o2', ''],
            ['s1', 'p2', 'o2', ''])
        )
      })

      describe('with existing subject and graph parameters', () => {
        test('should iterate all items with this subject and graph',
          shouldIncludeAll(
            collect(store, '_forEach', 's1', null, null, 'c4'),
            ['s1', 'p1', 'o1', 'c4'])
        )
      })

      describe('with existing predicate and object parameters', () => {
        test('should iterate all items with this predicate and object',
          shouldIncludeAll(
            collect(store, '_forEach', null, 'p1', 'o1', null),
            ['s1', 'p1', 'o1', ''],
            ['s2', 'p1', 'o1', ''],
            ['s1', 'p1', 'o1', 'c4'])
        )
      })

      describe('with existing predicate and graph parameters', () => {
        test('should iterate all items with this predicate and graph',
          shouldIncludeAll(
            collect(store, '_forEach', null, 'p1', null, ''),
            ['s1', 'p1', 'o1', ''],
            ['s1', 'p1', 'o2', ''],
            ['s2', 'p1', 'o1', ''])
        )
      })

      describe('with existing object and graph parameters', () => {
        test('should iterate all items with this object and graph',
          shouldIncludeAll(
            collect(store, '_forEach', null, null, 'o1', ''),
            ['s1', 'p1', 'o1', ''],
            ['s2', 'p1', 'o1', ''])
        )
      })

      describe('with an existing subject parameter', () => {
        test('should iterate all items with this subject',
          shouldIncludeAll(
            collect(store, '_forEach', 's2', null, null, null),
            ['s2', 'p1', 'o1', ''])
        )
      })

      describe('with an existing predicate parameter', () => {
        test('should iterate all items with this predicate',
          shouldIncludeAll(
            collect(store, '_forEach', null, 'p1', null, null),
            ['s1', 'p1', 'o1', ''],
            ['s1', 'p1', 'o2', ''],
            ['s2', 'p1', 'o1', ''],
            ['s1', 'p1', 'o1', 'c4'])
        )
      })

      describe('with an existing object parameter', () => {
        test('should iterate all items with this object',
          shouldIncludeAll(
            collect(store, '_forEach', null, null, 'o1', null),
            ['s1', 'p1', 'o1', ''],
            ['s2', 'p1', 'o1', ''],
            ['s1', 'p1', 'o1', 'c4'])
        )
      })

      describe('with an existing graph parameter', () => {
        test('should iterate all items with this graph',
          shouldIncludeAll(
            collect(store, '_forEach', null, null, null, ''),
            ['s1', 'p1', 'o1'],
            ['s1', 'p1', 'o2'],
            ['s1', 'p2', 'o2'],
            ['s2', 'p1', 'o1'])
        )
      })

      describe('with no parameters', () => {
        test('should iterate all items',
          shouldIncludeAll(
            collect(store, '_forEach', null, null, null, null),
            ['s1', 'p1', 'o1'],
            ['s1', 'p1', 'o2'],
            ['s1', 'p2', 'o2'],
            ['s2', 'p1', 'o1'],
            ['s1', 'p1', 'o1', 'c4'])
        )
      })
    })

    describe('every', () => {
      let count = 3
      function thirdTimeFalse () { return count-- === 0 }

      describe('with no parameters and a callback always returning true', () => {
        test('should return true', () => {
          expect(store._every(alwaysTrue, null, null, null, null)).toBe(true)
        })
      })
      describe('with no parameters and a callback always returning false', () => {
        test('should return false', () => {
          expect(store._every(alwaysFalse, null, null, null, null)).toBe(false)
        })
      })
      describe('with no parameters and a callback that returns false after 3 calls', () => {
        test('should return false', () => {
          expect(store._every(thirdTimeFalse, null, null, null, null)).toBe(false)
        })
      })
    })

    describe('some', () => {
      let count = 3
      function thirdTimeFalse () { return count-- !== 0 }

      describe('with no parameters and a callback always returning true', () => {
        test('should return true', () => {
          expect(store._some(alwaysTrue, null, null, null, null)).toBe(true)
        })
      })
      describe('with no parameters and a callback always returning false', () => {
        test('should return false', () => {
          expect(store._some(alwaysFalse, null, null, null, null)).toBe(false)
        })
      })
      describe('with no parameters and a callback that returns true after 3 calls', () => {
        test('should return false', () => {
          expect(store._some(thirdTimeFalse, null, null, null, null)).toBe(true)
        })
      })
      describe('with a non-existing subject', () => {
        test('should return true', () => {
          expect(store._some(null, rdf.namedNode('s3'), null, null, null)).toBe(false)
        })
      })
      describe('with a non-existing predicate', () => {
        test('should return false', () => {
          expect(store._some(null, null, rdf.namedNode('p3'), null, null)).toBe(false)
        })
      })
      describe('with a non-existing object', () => {
        test('should return false', () => {
          expect(store._some(null, null, null, rdf.namedNode('o4'), null)).toBe(false)
        })
      })
      describe('with a non-existing graph', () => {
        test('should return false', () => {
          expect(store._some(null, null, null, null, rdf.namedNode('g2'))).toBe(false)
        })
      })
    })

    describe('when trying to remove a triple with a non-existing subject', () => {
      beforeAll(function () {
        store.delete(rdf.quad(rdf.namedNode('s0'), rdf.namedNode('p1'), rdf.namedNode('o1')))
      })
      test('should still have size 5', () => { expect(store.size).toEqual(5) })
    })

    describe('when trying to remove a triple with a non-existing predicate', () => {
      beforeAll(function () {
        store.delete(rdf.quad(rdf.namedNode('s1'), rdf.namedNode('p0'), rdf.namedNode('o1')))
      })
      test('should still have size 5', () => { expect(store.size).toEqual(5) })
    })

    describe('when trying to remove a triple with a non-existing object', () => {
      beforeAll(function () {
        store.delete(rdf.quad(rdf.namedNode('s1'), rdf.namedNode('p1'), rdf.namedNode('o0')))
      })
      test('should still have size 5', () => { expect(store.size).toEqual(5) })
    })

    describe('when trying to remove a triple for which no subjects exist', () => {
      beforeAll(function () {
        store.delete(rdf.quad(rdf.namedNode('o1'), rdf.namedNode('p1'), rdf.namedNode('o1')))
      })
      test('should still have size 5', () => { expect(store.size).toEqual(5) })
    })

    describe('when trying to remove a triple for which no predicates exist', () => {
      beforeAll(function () {
        store.delete(rdf.quad(rdf.namedNode('s1'), rdf.namedNode('s1'), rdf.namedNode('o1')))
      })
      test('should still have size 5', () => { expect(store.size).toEqual(5) })
    })

    describe('when trying to remove a triple for which no objects exist', () => {
      beforeAll(function () {
        store.delete(rdf.quad(rdf.namedNode('s1'), rdf.namedNode('p1'), rdf.namedNode('s1')))
      })
      test('should still have size 5', () => { expect(store.size).toEqual(5) })
    })

    describe('when trying to remove a triple that does not exist', () => {
      beforeAll(function () {
        store.delete(rdf.quad(rdf.namedNode('s1'), rdf.namedNode('p2'), rdf.namedNode('o1')))
      })
      test('should still have size 5', () => { expect(store.size).toEqual(5) })
    })

    describe('when trying to remove an incomplete triple', () => {
      beforeAll(function () {
        store.delete(rdf.quad(rdf.namedNode('s1'), null, null))
      })
      test('should still have size 5', () => { expect(store.size).toEqual(5) })
    })

    describe('when trying to remove a triple with a non-existing graph', () => {
      beforeAll(function () {
        store.delete(rdf.quad(rdf.namedNode('s1'), rdf.namedNode('p1'), rdf.namedNode('o1'), rdf.namedNode('c0')))
      })
      test('should still have size 5', () => { expect(store.size).toEqual(5) })
    })

    describe('when removing an existing triple', () => {
      beforeAll(function () {
        store.delete(rdf.quad(rdf.namedNode('s1'), rdf.namedNode('p1'), rdf.namedNode('o1')))
      })

      test('should have size 4', () => { expect(store.size).toEqual(4) })

      test('should not contain that triple anymore',
        shouldIncludeAll(
          () => store._getQuads(),
          ['s1', 'p1', 'o2'],
          ['s1', 'p2', 'o2'],
          ['s2', 'p1', 'o1'],
          ['s1', 'p1', 'o1', 'c4']
        )
      )
    })

    describe('when removing an existing triple from a named graph', () => {
      beforeAll(function () {
        store.delete(rdf.quad(rdf.namedNode('s1'), rdf.namedNode('p1'), rdf.namedNode('o1'), rdf.namedNode('c4')))
      })

      test('should have size 3', () => { expect(store.size).toEqual(3) })

      itShouldBeEmpty(function () { return store._getQuads(null, null, null, rdf.namedNode('c4')) })
    })

    describe('when adding and removing a triple', () => {
      beforeAll(function () {
        store.add(quadify('a', 'b', 'c'))
        store.delete(quadify('a', 'b', 'c'))
      })

      test('should have an unchanged size', () => { expect(store.size).toEqual(3) })
    })
  })

  describe('An DatasetCore', () => {
    const store = new DatasetCore()

    // Test inspired by http://www.devthought.com/2012/01/18/an-object-is-not-a-hash/.
    // The value `__proto__` is not supported however – fixing it introduces too much overhead.
    test('should be able to contain entities with JavaScript object property names', () => {
      store.add(quadify('toString', 'valueOf', 'toLocaleString', 'hasOwnProperty'))
      shouldIncludeAll(store._getQuads(null, null, null, rdf.namedNode('hasOwnProperty')),
        ['toString', 'valueOf', 'toLocaleString', 'hasOwnProperty'])()
    })

    test('should be able to contain entities named "null"', () => {
      store.add(quadify('null', 'null', 'null', 'null'))
      shouldIncludeAll(store._getQuads(null, null, null, rdf.namedNode('null')), ['null', 'null', 'null', 'null'])()
    })
  })
})

function alwaysTrue () { return true }
function alwaysFalse () { return false }

function collect (store, method, arg1, arg2, arg3, arg4) {
  const results = []
  const cb = (r) => { results.push(r) }
  store[method](cb, arg1 && _termify(arg1), arg2 && _termify(arg2), arg3 && _termify(arg3), arg4 && _termify(arg4))
  return results
}

function itShouldBeEmpty (result) {
  test('should be empty', () => {
    if (typeof result === 'function') {
      result = result()
    }
    expect(Object.keys(result)).toHaveLength(0)
  })
}

function shouldIncludeAll (result, ...expectedQuads) {
  const items = expectedQuads
    .map(([subject, predicate, object, graph = '']) => _quadify([subject, predicate, object, graph]))

  return () => {
    if (typeof result === 'function') result = result()

    expect(result).toHaveLength(items.length)
    for (let i = 0; i < items.length; i++) {
      expect(result).toContainEqual(items[i])
    }
  }
}

function _termify (p) {
  if (!p) {
    return rdf.defaultGraph()
  }

  if (typeof p === 'string') {
    return rdf.namedNode(p)
  }

  return p
}

function _quadify (arg) {
  let subject, predicate, object, graph
  if (Array.isArray(arg)) {
    ([subject, predicate, object, graph] = arg)
  } else {
    ({ subject, predicate, object, graph } = arg)
  }
  return rdf.quad(...[subject, predicate, object, graph].map(p => _termify(p)))
}

function quadify (items, ...rest) {
  if (Array.isArray(items)) {
    return items.map(_quadify)
  }

  if (typeof items === 'string') {
    return _quadify([items, ...rest])
  }

  if (typeof items === 'object') {
    return _quadify(items)
  }
  throw new Error('not sure how to quadify', items)
}
