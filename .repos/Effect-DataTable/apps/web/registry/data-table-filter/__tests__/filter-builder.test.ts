import { describe, it, expect } from 'vitest'
import * as DateTime from 'effect/DateTime'
import * as Filter from '../core/Filter'


describe('Filter Builder API', () => {
  describe('Text filters', () => {
    it('Contains creates text filter with single value', () => {
      const filter = Filter.Text('name').Contains(['foo'])

      expect(filter._tag).toBe('Text')
      expect(filter.columnId).toBe('name')
      expect(filter.operator).toBe('Contains')
      expect(filter.values).toEqual(['foo'])
    })

    it('DoesNotContain creates text filter with single value', () => {
      const filter = Filter.Text('name').DoesNotContain(['bar'])

      expect(filter._tag).toBe('Text')
      expect(filter.columnId).toBe('name')
      expect(filter.operator).toBe('DoesNotContain')
      expect(filter.values).toEqual(['bar'])
    })
  })

  describe('Number filters', () => {
    describe('Single value operators', () => {
      it('Is creates number filter with single value', () => {
        const filter = Filter.Number('age').Is([25])

        expect(filter._tag).toBe('Number')
        expect(filter.columnId).toBe('age')
        expect(filter.operator).toBe('Is')
        expect(filter.values).toEqual([25])
      })

      it('IsNot creates number filter with single value', () => {
        const filter = Filter.Number('age').IsNot([30])

        expect(filter._tag).toBe('Number')
        expect(filter.columnId).toBe('age')
        expect(filter.operator).toBe('IsNot')
        expect(filter.values).toEqual([30])
      })

      it('IsLessThan creates number filter with single value', () => {
        const filter = Filter.Number('age').IsLessThan([100])

        expect(filter._tag).toBe('Number')
        expect(filter.columnId).toBe('age')
        expect(filter.operator).toBe('IsLessThan')
        expect(filter.values).toEqual([100])
      })

      it('IsGreaterThan creates number filter with single value', () => {
        const filter = Filter.Number('age').IsGreaterThan([0])

        expect(filter._tag).toBe('Number')
        expect(filter.columnId).toBe('age')
        expect(filter.operator).toBe('IsGreaterThan')
        expect(filter.values).toEqual([0])
      })

      it('IsLessThanOrEqualTo creates number filter with single value', () => {
        const filter = Filter.Number('age').IsLessThanOrEqualTo([100])

        expect(filter._tag).toBe('Number')
        expect(filter.columnId).toBe('age')
        expect(filter.operator).toBe('IsLessThanOrEqualTo')
        expect(filter.values).toEqual([100])
      })

      it('IsGreaterThanOrEqualTo creates number filter with single value', () => {
        const filter = Filter.Number('age').IsGreaterThanOrEqualTo([0])

        expect(filter._tag).toBe('Number')
        expect(filter.columnId).toBe('age')
        expect(filter.operator).toBe('IsGreaterThanOrEqualTo')
        expect(filter.values).toEqual([0])
      })
    })

    describe('Multiple value operators', () => {
      it('IsBetween creates number filter with value range', () => {
        const filter = Filter.Number('age').IsBetween([18, 65])

        expect(filter._tag).toBe('Number')
        expect(filter.columnId).toBe('age')
        expect(filter.operator).toBe('IsBetween')
        expect(filter.values).toEqual([18, 65])
      })

      it('IsNotBetween creates number filter with value range', () => {
        const filter = Filter.Number('age').IsNotBetween([10, 20])

        expect(filter._tag).toBe('Number')
        expect(filter.columnId).toBe('age')
        expect(filter.operator).toBe('IsNotBetween')
        expect(filter.values).toEqual([10, 20])
      })
    })

    describe('Edge cases', () => {
      it('handles negative numbers', () => {
        const filter = Filter.Number('temperature').Is([-5])

        expect(filter.values).toEqual([-5])
      })

      it('handles zero', () => {
        const filter = Filter.Number('count').Is([0])

        expect(filter.values).toEqual([0])
      })

      it('handles decimal numbers', () => {
        const filter = Filter.Number('price').Is([19.99])

        expect(filter.values).toEqual([19.99])
      })

      it('handles large numbers', () => {
        const filter = Filter.Number('population').IsGreaterThan([1000000])

        expect(filter.values).toEqual([1000000])
      })
    })
  })

  describe('Date filters', () => {
    const testDate = DateTime.unsafeMake(new Date('2024-01-01'))
    const startDate = DateTime.unsafeMake(new Date('2024-01-01'))
    const endDate = DateTime.unsafeMake(new Date('2024-12-31'))

    describe('Single value operators', () => {
      it('Is creates date filter with DateTime value', () => {
        const filter = Filter.Date('createdAt').Is([testDate])

        expect(filter._tag).toBe('Date')
        expect(filter.columnId).toBe('createdAt')
        expect(filter.operator).toBe('Is')
        expect(filter.values).toEqual([testDate])
      })

      it('IsNot creates date filter with DateTime value', () => {
        const filter = Filter.Date('createdAt').IsNot([testDate])

        expect(filter._tag).toBe('Date')
        expect(filter.columnId).toBe('createdAt')
        expect(filter.operator).toBe('IsNot')
        expect(filter.values).toEqual([testDate])
      })

      it('IsBefore creates date filter with DateTime value', () => {
        const filter = Filter.Date('createdAt').IsBefore([testDate])

        expect(filter._tag).toBe('Date')
        expect(filter.columnId).toBe('createdAt')
        expect(filter.operator).toBe('IsBefore')
        expect(filter.values).toEqual([testDate])
      })

      it('IsAfter creates date filter with DateTime value', () => {
        const filter = Filter.Date('createdAt').IsAfter([testDate])

        expect(filter._tag).toBe('Date')
        expect(filter.columnId).toBe('createdAt')
        expect(filter.operator).toBe('IsAfter')
        expect(filter.values).toEqual([testDate])
      })

      it('IsOnOrBefore creates date filter with DateTime value', () => {
        const filter = Filter.Date('createdAt').IsOnOrBefore([testDate])

        expect(filter._tag).toBe('Date')
        expect(filter.columnId).toBe('createdAt')
        expect(filter.operator).toBe('IsOnOrBefore')
        expect(filter.values).toEqual([testDate])
      })

      it('IsOnOrAfter creates date filter with DateTime value', () => {
        const filter = Filter.Date('createdAt').IsOnOrAfter([testDate])

        expect(filter._tag).toBe('Date')
        expect(filter.columnId).toBe('createdAt')
        expect(filter.operator).toBe('IsOnOrAfter')
        expect(filter.values).toEqual([testDate])
      })
    })

    describe('Multiple value operators', () => {
      it('IsBetween creates date filter with date range', () => {
        const filter = Filter.Date('createdAt').IsBetween([startDate, endDate])

        expect(filter._tag).toBe('Date')
        expect(filter.columnId).toBe('createdAt')
        expect(filter.operator).toBe('IsBetween')
        expect(filter.values).toEqual([startDate, endDate])
      })

      it('IsNotBetween creates date filter with date range', () => {
        const filter = Filter.Date('createdAt').IsNotBetween([startDate, endDate])

        expect(filter._tag).toBe('Date')
        expect(filter.columnId).toBe('createdAt')
        expect(filter.operator).toBe('IsNotBetween')
        expect(filter.values).toEqual([startDate, endDate])
      })
    })
  })

  describe('Option filters', () => {
    describe('Single value operators', () => {
      it('Is creates option filter with single value', () => {
        const filter = Filter.Option('status').Is(['active'])

        expect(filter._tag).toBe('Option')
        expect(filter.columnId).toBe('status')
        expect(filter.operator).toBe('Is')
        expect(filter.values).toEqual(['active'])
      })

      it('IsNot creates option filter with single value', () => {
        const filter = Filter.Option('status').IsNot(['inactive'])

        expect(filter._tag).toBe('Option')
        expect(filter.columnId).toBe('status')
        expect(filter.operator).toBe('IsNot')
        expect(filter.values).toEqual(['inactive'])
      })
    })

    describe('Multiple value operators', () => {
      it('IsAnyOf creates option filter with multiple values', () => {
        const filter = Filter.Option('status').IsAnyOf(['active', 'pending'])

        expect(filter._tag).toBe('Option')
        expect(filter.columnId).toBe('status')
        expect(filter.operator).toBe('IsAnyOf')
        expect(filter.values).toEqual(['active', 'pending'])
      })

      it('IsNoneOf creates option filter with multiple values', () => {
        const filter = Filter.Option('status').IsNoneOf(['deleted', 'archived'])

        expect(filter._tag).toBe('Option')
        expect(filter.columnId).toBe('status')
        expect(filter.operator).toBe('IsNoneOf')
        expect(filter.values).toEqual(['deleted', 'archived'])
      })
    })

    describe('Edge cases', () => {
      it('handles empty string value', () => {
        const filter = Filter.Option('status').Is([''])

        expect(filter.values).toEqual([''])
      })

      it('handles special characters in value', () => {
        const filter = Filter.Option('category').Is(['foo/bar-baz_123'])

        expect(filter.values).toEqual(['foo/bar-baz_123'])
      })
    })
  })

  describe('MultiOption filters', () => {
    describe('Single value operators', () => {
      it('Include creates multi-option filter with single value', () => {
        const filter = Filter.MultiOption('tags').Include(['important'])

        expect(filter._tag).toBe('MultiOption')
        expect(filter.columnId).toBe('tags')
        expect(filter.operator).toBe('Include')
        expect(filter.values).toEqual(['important'])
      })

      it('Exclude creates multi-option filter with single value', () => {
        const filter = Filter.MultiOption('tags').Exclude(['spam'])

        expect(filter._tag).toBe('MultiOption')
        expect(filter.columnId).toBe('tags')
        expect(filter.operator).toBe('Exclude')
        expect(filter.values).toEqual(['spam'])
      })
    })

    describe('Multiple value operators', () => {
      it('IncludeAnyOf creates multi-option filter with multiple values', () => {
        const filter = Filter.MultiOption('tags').IncludeAnyOf(['work', 'personal'])

        expect(filter._tag).toBe('MultiOption')
        expect(filter.columnId).toBe('tags')
        expect(filter.operator).toBe('IncludeAnyOf')
        expect(filter.values).toEqual(['work', 'personal'])
      })

      it('IncludeAllOf creates multi-option filter with multiple values', () => {
        const filter = Filter.MultiOption('tags').IncludeAllOf(['urgent', 'important'])

        expect(filter._tag).toBe('MultiOption')
        expect(filter.columnId).toBe('tags')
        expect(filter.operator).toBe('IncludeAllOf')
        expect(filter.values).toEqual(['urgent', 'important'])
      })

      it('ExcludeIfAnyOf creates multi-option filter with multiple values', () => {
        const filter = Filter.MultiOption('tags').ExcludeIfAnyOf(['spam', 'junk'])

        expect(filter._tag).toBe('MultiOption')
        expect(filter.columnId).toBe('tags')
        expect(filter.operator).toBe('ExcludeIfAnyOf')
        expect(filter.values).toEqual(['spam', 'junk'])
      })

      it('ExcludeIfAll creates multi-option filter with multiple values', () => {
        const filter = Filter.MultiOption('tags').ExcludeIfAll(['archived', 'deleted'])

        expect(filter._tag).toBe('MultiOption')
        expect(filter.columnId).toBe('tags')
        expect(filter.operator).toBe('ExcludeIfAll')
        expect(filter.values).toEqual(['archived', 'deleted'])
      })
    })

    describe('Edge cases', () => {
      it('handles single value in array for multiple value operators', () => {
        const filter = Filter.MultiOption('tags').IncludeAnyOf(['single'])

        expect(filter.values).toEqual(['single'])
      })

      it('handles empty array for multiple value operators', () => {
        const filter = Filter.MultiOption('tags').IncludeAnyOf([])

        expect(filter.values).toEqual([])
      })
    })
  })

  describe('Type safety', () => {
    it('Text filter has correct _tag', () => {
      const filter = Filter.Text('name').Contains(['test'])
      expect(filter._tag).toBe('Text')
    })

    it('Number filter has correct _tag', () => {
      const filter = Filter.Number('age').Is([25])
      expect(filter._tag).toBe('Number')
    })

    it('Date filter has correct _tag', () => {
      const date = DateTime.unsafeMake(new Date())
      const filter = Filter.Date('createdAt').Is([date])
      expect(filter._tag).toBe('Date')
    })

    it('Option filter has correct _tag', () => {
      const filter = Filter.Option('status').Is(['active'])
      expect(filter._tag).toBe('Option')
    })

    it('MultiOption filter has correct _tag', () => {
      const filter = Filter.MultiOption('tags').Include(['work'])
      expect(filter._tag).toBe('MultiOption')
    })
  })

  describe('Values storage consistency', () => {
    it('single values are stored as arrays internally for Text', () => {
      const filter = Filter.Text('name').Contains(['foo'])
      expect(Array.isArray(filter.values)).toBe(true)
      expect(filter.values).toHaveLength(1)
    })

    it('single values are stored as arrays internally for Number', () => {
      const filter = Filter.Number('age').Is([25])
      expect(Array.isArray(filter.values)).toBe(true)
      expect(filter.values).toHaveLength(1)
    })

    it('single values are stored as arrays internally for Date', () => {
      const date = DateTime.unsafeMake(new Date())
      const filter = Filter.Date('createdAt').Is([date])
      expect(Array.isArray(filter.values)).toBe(true)
      expect(filter.values).toHaveLength(1)
    })

    it('single values are stored as arrays internally for Option', () => {
      const filter = Filter.Option('status').Is(['active'])
      expect(Array.isArray(filter.values)).toBe(true)
      expect(filter.values).toHaveLength(1)
    })

    it('single values are stored as arrays internally for MultiOption', () => {
      const filter = Filter.MultiOption('tags').Include(['work'])
      expect(Array.isArray(filter.values)).toBe(true)
      expect(filter.values).toHaveLength(1)
    })

    it('multiple values are stored as arrays for Number.IsBetween', () => {
      const filter = Filter.Number('age').IsBetween([18, 65])
      expect(Array.isArray(filter.values)).toBe(true)
      expect(filter.values).toHaveLength(2)
    })

    it('multiple values are stored as arrays for Date.IsBetween', () => {
      const start = DateTime.unsafeMake(new Date('2024-01-01'))
      const end = DateTime.unsafeMake(new Date('2024-12-31'))
      const filter = Filter.Date('createdAt').IsBetween([start, end])
      expect(Array.isArray(filter.values)).toBe(true)
      expect(filter.values).toHaveLength(2)
    })

    it('multiple values are stored as arrays for Option.IsAnyOf', () => {
      const filter = Filter.Option('status').IsAnyOf(['active', 'pending'])
      expect(Array.isArray(filter.values)).toBe(true)
      expect(filter.values).toHaveLength(2)
    })

    it('multiple values are stored as arrays for MultiOption.IncludeAllOf', () => {
      const filter = Filter.MultiOption('tags').IncludeAllOf(['work', 'urgent'])
      expect(Array.isArray(filter.values)).toBe(true)
      expect(filter.values).toHaveLength(2)
    })
  })

  describe('Complex scenarios', () => {
    it('creates filters with different column IDs', () => {
      const filter1 = Filter.Number('age').Is([25])
      const filter2 = Filter.Number('salary').Is([50000])

      expect(filter1.columnId).toBe('age')
      expect(filter2.columnId).toBe('salary')
    })

    it('creates multiple filters of same type with different operators', () => {
      const filter1 = Filter.Number('age').Is([25])
      const filter2 = Filter.Number('age').IsGreaterThan([18])

      expect(filter1.operator).toBe('Is')
      expect(filter2.operator).toBe('IsGreaterThan')
    })

    it('handles Unicode characters in text values', () => {
      const filter = Filter.Text('name').Contains(['こんにちは'])
      expect(filter.values).toEqual(['こんにちは'])
    })

    it('handles very long text values', () => {
      const longText = 'a'.repeat(1000)
      const filter = Filter.Text('description').Contains([longText])
      expect(filter.values[0]).toBe(longText)
    })
  })
})
