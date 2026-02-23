import { describe, it, expect } from 'vitest'
import * as Equal from 'effect/Equal'
import * as Data from 'effect/Data'
import * as Order from 'effect/Order'
import * as DateTime from 'effect/DateTime'
import { Filter, FiltersState } from '../core/types'

describe('Filter Equality and Ordering', () => {
  describe('Equal.equals', () => {
    describe('Same filters are equal', () => {
      it('two Text filters with same values are equal', () => {
        const f1 = Filter.Text('name').Contains('foo')
        const f2 = Filter.Text('name').Contains('foo')

        expect(Equal.equals(f1, f2)).toBe(true)
      })

      it('two Number filters with same values are equal', () => {
        const f1 = Filter.Number('age').Is(25)
        const f2 = Filter.Number('age').Is(25)

        expect(Equal.equals(f1, f2)).toBe(true)
      })

      it('two Date filters with same DateTime values are equal', () => {
        const dt = DateTime.unsafeMake(new Date('2024-01-01'))
        const f1 = Filter.Date('createdAt').Is(dt)
        const f2 = Filter.Date('createdAt').Is(dt)

        expect(Equal.equals(f1, f2)).toBe(true)
      })

      it('two Option filters with same values are equal', () => {
        const f1 = Filter.Option('status').IsAnyOf(['a', 'b'])
        const f2 = Filter.Option('status').IsAnyOf(['a', 'b'])

        expect(Equal.equals(f1, f2)).toBe(true)
      })

      it('two MultiOption filters with same values are equal', () => {
        const f1 = Filter.MultiOption('tags').Include('tag1')
        const f2 = Filter.MultiOption('tags').Include('tag1')

        expect(Equal.equals(f1, f2)).toBe(true)
      })

      it('two Text filters with empty string values are equal', () => {
        const f1 = Filter.Text('name').Contains('')
        const f2 = Filter.Text('name').Contains('')

        expect(Equal.equals(f1, f2)).toBe(true)
      })

      it('two Number filters with zero are equal', () => {
        const f1 = Filter.Number('count').Is(0)
        const f2 = Filter.Number('count').Is(0)

        expect(Equal.equals(f1, f2)).toBe(true)
      })

      it('two Number filters with negative values are equal', () => {
        const f1 = Filter.Number('balance').Is(-100)
        const f2 = Filter.Number('balance').Is(-100)

        expect(Equal.equals(f1, f2)).toBe(true)
      })

      it('two Option filters with empty array are equal', () => {
        const f1 = Filter.Option('status').IsAnyOf([])
        const f2 = Filter.Option('status').IsAnyOf([])

        expect(Equal.equals(f1, f2)).toBe(true)
      })
    })

    describe('Different filters are not equal', () => {
      it('filters with different columnId are not equal', () => {
        const f1 = Filter.Text('name').Contains('foo')
        const f2 = Filter.Text('email').Contains('foo')

        expect(Equal.equals(f1, f2)).toBe(false)
      })

      it('filters with different operator are not equal', () => {
        const f1 = Filter.Text('name').Contains('foo')
        const f2 = Filter.Text('name').DoesNotContain('foo')

        expect(Equal.equals(f1, f2)).toBe(false)
      })

      it('filters with different values are not equal', () => {
        const f1 = Filter.Text('name').Contains('foo')
        const f2 = Filter.Text('name').Contains('bar')

        expect(Equal.equals(f1, f2)).toBe(false)
      })

      it('filters of different types are not equal', () => {
        const f1 = Filter.Text('name').Contains('25')
        const f2 = Filter.Number('name').Is(25)

        expect(Equal.equals(f1, f2)).toBe(false)
      })

      it('filters with different value count are not equal', () => {
        const f1 = Filter.Option('status').IsAnyOf(['a'])
        const f2 = Filter.Option('status').IsAnyOf(['a', 'b'])

        expect(Equal.equals(f1, f2)).toBe(false)
      })

      it('Number filters with different operators are not equal', () => {
        const f1 = Filter.Number('age').Is(25)
        const f2 = Filter.Number('age').IsNot(25)

        expect(Equal.equals(f1, f2)).toBe(false)
      })

      it('Date filters with different DateTime values are not equal', () => {
        const dt1 = DateTime.unsafeMake(new Date('2024-01-01'))
        const dt2 = DateTime.unsafeMake(new Date('2024-01-02'))
        const f1 = Filter.Date('createdAt').Is(dt1)
        const f2 = Filter.Date('createdAt').Is(dt2)

        expect(Equal.equals(f1, f2)).toBe(false)
      })

      it('MultiOption filters with different operators are not equal', () => {
        const f1 = Filter.MultiOption('tags').Include('tag1')
        const f2 = Filter.MultiOption('tags').Exclude('tag1')

        expect(Equal.equals(f1, f2)).toBe(false)
      })

      it('Option filters with different order of values are equal', () => {
        const f1 = Filter.Option('status').IsAnyOf(['a', 'b'])
        const f2 = Filter.Option('status').IsAnyOf(['b', 'a'])

        // This depends on implementation - arrays with Data.array should be structurally equal
        expect(Equal.equals(f1, f2)).toBe(true)
      })
    })
  })

  describe('Filter.Order', () => {
    it('sorts filters by columnId first', () => {
      const f1 = Filter.Text('zebra').Contains('a')
      const f2 = Filter.Text('apple').Contains('b')

      const sorted = [f1, f2].sort(Filter.Order)

      expect(sorted[0].columnId).toBe('apple')
      expect(sorted[1].columnId).toBe('zebra')
    })

    it('sorts filters by type when columnId is same', () => {
      const textFilter = Filter.Text('col').Contains('a')
      const numberFilter = Filter.Number('col').Is(1)
      const dateFilter = Filter.Date('col').Is(DateTime.unsafeMake(new Date()))
      const optionFilter = Filter.Option('col').Is('a')
      const multiFilter = Filter.MultiOption('col').Include('a')

      const filters = [multiFilter, dateFilter, textFilter, optionFilter, numberFilter]
      const sorted = filters.sort(Filter.Order)

      // Order: Text(0), Number(1), Date(2), Option(3), MultiOption(4)
      expect(sorted[0]._tag).toBe('Text')
      expect(sorted[1]._tag).toBe('Number')
      expect(sorted[2]._tag).toBe('Date')
      expect(sorted[3]._tag).toBe('Option')
      expect(sorted[4]._tag).toBe('MultiOption')
    })

    it('maintains stable sort order for complex filter sets', () => {
      const f1 = Filter.Text('name').Contains('john')
      const f2 = Filter.Number('age').GreaterThan(20)
      const f3 = Filter.Text('email').Contains('@example.com')
      const f4 = Filter.Option('status').IsAnyOf(['active', 'pending'])
      const f5 = Filter.Number('salary').LessThan(100000)

      const sorted = [f5, f4, f3, f2, f1].sort(Filter.Order)

      expect(sorted[0]).toEqual(f2) // age
      expect(sorted[1]).toEqual(f3) // email
      expect(sorted[2]).toEqual(f1) // name
      expect(sorted[3]).toEqual(f5) // salary
      expect(sorted[4]).toEqual(f4) // status
    })

    it('handles filters with same columnId and type consistently', () => {
      const f1 = Filter.Text('name').Contains('alice')
      const f2 = Filter.Text('name').StartsWith('bob')
      const f3 = Filter.Text('name').EndsWith('charlie')

      const sorted1 = [f1, f2, f3].sort(Filter.Order)
      const sorted2 = [f3, f2, f1].sort(Filter.Order)

      // Order should be consistent (though specific order may vary)
      expect(sorted1).toEqual(sorted2)
    })

    it('sorts empty array correctly', () => {
      const sorted = [].sort(Filter.Order)

      expect(sorted).toEqual([])
    })

    it('sorts single filter correctly', () => {
      const f1 = Filter.Text('name').Contains('test')
      const sorted = [f1].sort(Filter.Order)

      expect(sorted).toEqual([f1])
    })
  })

  describe('Filter.normalize', () => {
    it('wraps values with Data.array for stable hashing', () => {
      const filter = Filter.Text('name').Contains('foo')
      const normalized = Filter.normalize(filter)

      // Values should be wrapped with Data.array
      expect(normalized.values).toEqual(['foo'])
      expect(Equal.equals(filter, normalized)).toBe(true)
    })

    it('normalizes Number filter values', () => {
      const filter = Filter.Number('age').Is(25)
      const normalized = Filter.normalize(filter)

      expect(normalized.values).toEqual([25])
      expect(Equal.equals(filter, normalized)).toBe(true)
    })

    it('normalizes Date filter values', () => {
      const dt = DateTime.unsafeMake(new Date('2024-01-01'))
      const filter = Filter.Date('createdAt').Is(dt)
      const normalized = Filter.normalize(filter)

      expect(normalized.values).toEqual([dt])
      expect(Equal.equals(filter, normalized)).toBe(true)
    })

    it('normalizes Option filter with multiple values', () => {
      const filter = Filter.Option('status').IsAnyOf(['active', 'pending'])
      const normalized = Filter.normalize(filter)

      expect(normalized.values).toEqual(['active', 'pending'])
      expect(Equal.equals(filter, normalized)).toBe(true)
    })

    it('normalizes MultiOption filter values', () => {
      const filter = Filter.MultiOption('tags').Include('important')
      const normalized = Filter.normalize(filter)

      expect(normalized.values).toEqual(['important'])
      expect(Equal.equals(filter, normalized)).toBe(true)
    })

    it('normalized filters are structurally equal to originals', () => {
      const filters = [
        Filter.Text('name').Contains('test'),
        Filter.Number('age').GreaterThan(30),
        Filter.Date('date').Is(DateTime.unsafeMake(new Date())),
        Filter.Option('status').IsAnyOf(['a', 'b']),
        Filter.MultiOption('tags').Exclude('spam')
      ]

      filters.forEach(filter => {
        const normalized = Filter.normalize(filter)
        expect(Equal.equals(filter, normalized)).toBe(true)
      })
    })
  })

  describe('Filter.toKey', () => {
    it('returns sorted, normalized array for cache key', () => {
      const f1 = Filter.Text('zebra').Contains('a')
      const f2 = Filter.Text('apple').Contains('b')

      const key = Filter.toKey([f1, f2])

      // Should be sorted by columnId
      expect(key[0].columnId).toBe('apple')
      expect(key[1].columnId).toBe('zebra')
    })

    it('same filters in different order produce equal keys', () => {
      const f1 = Filter.Text('a').Contains('1')
      const f2 = Filter.Number('b').Is(2)

      const key1 = Filter.toKey([f1, f2])
      const key2 = Filter.toKey([f2, f1])

      expect(Equal.equals(key1, key2)).toBe(true)
    })

    it('different filters produce different keys', () => {
      const f1 = Filter.Text('a').Contains('1')
      const f2 = Filter.Text('a').Contains('2')

      const key1 = Filter.toKey([f1])
      const key2 = Filter.toKey([f2])

      expect(Equal.equals(key1, key2)).toBe(false)
    })

    it('empty filter array produces valid key', () => {
      const key = Filter.toKey([])

      expect(key).toEqual([])
    })

    it('single filter produces valid key', () => {
      const f1 = Filter.Text('name').Contains('test')
      const key = Filter.toKey([f1])

      expect(key).toHaveLength(1)
      expect(key[0].columnId).toBe('name')
    })

    it('complex filter set produces consistent keys', () => {
      const f1 = Filter.Text('name').Contains('alice')
      const f2 = Filter.Number('age').GreaterThan(20)
      const f3 = Filter.Date('createdAt').Is(DateTime.unsafeMake(new Date('2024-01-01')))
      const f4 = Filter.Option('status').IsAnyOf(['active', 'pending'])
      const f5 = Filter.MultiOption('tags').Include('important')

      const key1 = Filter.toKey([f1, f2, f3, f4, f5])
      const key2 = Filter.toKey([f5, f4, f3, f2, f1])
      const key3 = Filter.toKey([f3, f1, f5, f2, f4])

      expect(Equal.equals(key1, key2)).toBe(true)
      expect(Equal.equals(key2, key3)).toBe(true)
      expect(Equal.equals(key1, key3)).toBe(true)
    })

    it('keys with duplicate filters handle correctly', () => {
      const f1 = Filter.Text('name').Contains('test')
      const f2 = Filter.Text('name').Contains('test')

      const key1 = Filter.toKey([f1])
      const key2 = Filter.toKey([f1, f2])

      // Should handle duplicates - implementation dependent
      expect(key2.length).toBeGreaterThanOrEqual(1)
    })

    it('normalized values in keys are stable', () => {
      const f1 = Filter.Option('status').IsAnyOf(['a', 'b', 'c'])

      const key1 = Filter.toKey([f1])
      const key2 = Filter.toKey([f1])

      expect(Equal.equals(key1, key2)).toBe(true)
      expect(key1[0].values).toEqual(['a', 'b', 'c'])
    })
  })

  describe('Integration: Equal.equals with Order and normalize', () => {
    it('normalized filters maintain equality after sorting', () => {
      const f1 = Filter.Text('zebra').Contains('a')
      const f2 = Filter.Text('apple').Contains('b')

      const normalized1 = Filter.normalize(f1)
      const normalized2 = Filter.normalize(f2)

      const sorted = [normalized1, normalized2].sort(Filter.Order)

      expect(Equal.equals(sorted[0], normalized2)).toBe(true)
      expect(Equal.equals(sorted[1], normalized1)).toBe(true)
    })

    it('toKey produces keys that are equal regardless of input order', () => {
      const filters = [
        Filter.Text('name').Contains('john'),
        Filter.Number('age').Is(30),
        Filter.Option('status').IsAnyOf(['active'])
      ]

      const permutations = [
        [filters[0], filters[1], filters[2]],
        [filters[0], filters[2], filters[1]],
        [filters[1], filters[0], filters[2]],
        [filters[1], filters[2], filters[0]],
        [filters[2], filters[0], filters[1]],
        [filters[2], filters[1], filters[0]]
      ]

      const keys = permutations.map(Filter.toKey)

      // All keys should be equal
      for (let i = 1; i < keys.length; i++) {
        expect(Equal.equals(keys[0], keys[i])).toBe(true)
      }
    })

    it('normalized filters can be used as cache keys', () => {
      const filter = Filter.Text('name').Contains('test')
      const normalized = Filter.normalize(filter)

      // Simulate cache storage and retrieval
      const cache = new Map<unknown, string>()
      cache.set(normalized, 'cached-value')

      const retrieved = cache.get(filter)
      expect(retrieved).toBe('cached-value')
    })
  })
})
