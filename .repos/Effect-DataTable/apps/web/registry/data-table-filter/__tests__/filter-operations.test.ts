import { describe, it, expect } from 'vitest'
import { pipe } from 'effect/Function'
import * as DateTime from 'effect/DateTime'
import * as Equal from 'effect/Equal'
import * as Filter from '../core/Filter'

describe('Filter Operations', () => {
  describe('addValue', () => {
    describe('Text filters', () => {
      it('adds string value to Text filter', () => {
        const filter = Filter.Text('name').Contains(['John'])
        const updated = pipe(filter, Filter.addValue('Jane'))

        expect(updated.values).toEqual(['Jane', 'John']) // sorted
        expect(updated.columnId).toBe('name')
        expect(updated.operator).toBe('Contains')
      })

      it('adds multiple values sequentially', () => {
        const filter = Filter.Text('name').Contains(['John'])
        const updated = pipe(
          filter,
          Filter.addValue('Jane'),
          Filter.addValue('Bob')
        )

        expect(updated.values).toEqual(['Bob', 'Jane', 'John']) // sorted
      })

      it('works with DoesNotContain operator', () => {
        const filter = Filter.Text('description').DoesNotContain(['spam'])
        const updated = pipe(filter, Filter.addValue('scam'))

        expect(updated.values).toEqual(['scam', 'spam']) // sorted
        expect(updated.operator).toBe('DoesNotContain')
      })

      it('preserves immutability', () => {
        const original = Filter.Text('name').Contains(['John'])
        const updated = pipe(original, Filter.addValue('Jane'))

        expect(original.values).toEqual(['John'])
        expect(updated.values).toEqual(['Jane', 'John']) // sorted
        expect(Equal.equals(original, updated)).toBe(false)
      })
    })

    describe('Number filters', () => {
      it('adds number value to Number filter', () => {
        const filter = Filter.Number('age').Is([25])
        const updated = pipe(filter, Filter.addValue(30))

        expect(updated.values).toEqual([25, 30])
      })

      it('works with IsLessThan operator', () => {
        const filter = Filter.Number('age').IsLessThan([50])
        const updated = pipe(filter, Filter.addValue(40))

        expect(updated.values).toEqual([40, 50]) // sorted
        expect(updated.operator).toBe('IsLessThan')
      })

      it('works with IsBetween operator', () => {
        const filter = Filter.Number('price').IsBetween([10, 20])
        const updated = pipe(filter, Filter.addValue(30))

        expect(updated.values).toEqual([10, 20, 30])
        expect(updated.operator).toBe('IsBetween')
      })

      it('preserves immutability', () => {
        const original = Filter.Number('age').Is([25])
        const updated = pipe(original, Filter.addValue(30))

        expect(original.values).toEqual([25])
        expect(updated.values).toEqual([25, 30])
        expect(Equal.equals(original, updated)).toBe(false)
      })
    })

    describe('Date filters', () => {
      it('adds DateTime value to Date filter', () => {
        const dt1 = DateTime.unsafeMake(new Date('2024-01-01'))
        const dt2 = DateTime.unsafeMake(new Date('2024-02-01'))
        const filter = Filter.Date('createdAt').Is([dt1])
        const updated = pipe(filter, Filter.addValue(dt2))

        expect(updated.values).toEqual([dt1, dt2])
      })

      it('works with IsBefore operator', () => {
        const dt1 = DateTime.unsafeMake(new Date('2024-01-01'))
        const dt2 = DateTime.unsafeMake(new Date('2024-02-01'))
        const filter = Filter.Date('createdAt').IsBefore([dt1])
        const updated = pipe(filter, Filter.addValue(dt2))

        expect(updated.values).toEqual([dt1, dt2])
        expect(updated.operator).toBe('IsBefore')
      })

      it('works with IsBetween operator', () => {
        const dt1 = DateTime.unsafeMake(new Date('2024-01-01'))
        const dt2 = DateTime.unsafeMake(new Date('2024-02-01'))
        const dt3 = DateTime.unsafeMake(new Date('2024-03-01'))
        const filter = Filter.Date('createdAt').IsBetween([dt1, dt2])
        const updated = pipe(filter, Filter.addValue(dt3))

        expect(updated.values).toEqual([dt1, dt2, dt3])
      })

      it('preserves immutability', () => {
        const dt1 = DateTime.unsafeMake(new Date('2024-01-01'))
        const dt2 = DateTime.unsafeMake(new Date('2024-02-01'))
        const original = Filter.Date('createdAt').Is([dt1])
        const updated = pipe(original, Filter.addValue(dt2))

        expect(original.values).toEqual([dt1])
        expect(updated.values).toEqual([dt1, dt2])
        expect(Equal.equals(original, updated)).toBe(false)
      })
    })

    describe('Option filters', () => {
      it('adds string value to Option filter', () => {
        const filter = Filter.Option('status').Is(['active'])
        const updated = pipe(filter, Filter.addValue('inactive'))

        expect(updated.values).toEqual(['active', 'inactive'])
      })

      it('works with IsAnyOf operator', () => {
        const filter = Filter.Option('status').IsAnyOf(['active', 'pending'])
        const updated = pipe(filter, Filter.addValue('completed'))

        expect(updated.values).toEqual(['active', 'completed', 'pending']) // sorted
        expect(updated.operator).toBe('IsAnyOf')
      })

      it('preserves immutability', () => {
        const original = Filter.Option('status').Is(['active'])
        const updated = pipe(original, Filter.addValue('inactive'))

        expect(original.values).toEqual(['active'])
        expect(updated.values).toEqual(['active', 'inactive'])
        expect(Equal.equals(original, updated)).toBe(false)
      })
    })

    describe('MultiOption filters', () => {
      it('adds string value to MultiOption filter', () => {
        const filter = Filter.MultiOption('tags').Include(['urgent'])
        const updated = pipe(filter, Filter.addValue('important'))

        expect(updated.values).toEqual(['important', 'urgent']) // sorted
      })

      it('works with IncludeAllOf operator', () => {
        const filter = Filter.MultiOption('tags').IncludeAllOf(['urgent', 'bug'])
        const updated = pipe(filter, Filter.addValue('critical'))

        expect(updated.values).toEqual(['bug', 'critical', 'urgent']) // sorted
        expect(updated.operator).toBe('IncludeAllOf')
      })

      it('preserves immutability', () => {
        const original = Filter.MultiOption('tags').Include(['urgent'])
        const updated = pipe(original, Filter.addValue('important'))

        expect(original.values).toEqual(['urgent'])
        expect(updated.values).toEqual(['important', 'urgent']) // sorted
        expect(Equal.equals(original, updated)).toBe(false)
      })
    })
  })

  describe('removeValue', () => {
    describe('Text filters', () => {
      it('removes string value from Text filter', () => {
        const filter = Filter.Text('name').Contains(['John'])
        const withJane = pipe(filter, Filter.addValue('Jane'))
        const removed = pipe(withJane, Filter.removeValue('John'))

        expect(removed.values).toEqual(['Jane'])
      })

      it('removes from middle of multiple values', () => {
        const filter = Filter.Text('name').Contains(['John', 'Jane', 'Bob'])
        const removed = pipe(filter, Filter.removeValue('Jane'))

        expect(removed.values).toEqual(['Bob', 'John']) // sorted
      })

      it('returns filter with same values if value not found', () => {
        const filter = Filter.Text('name').Contains(['John'])
        const result = pipe(filter, Filter.removeValue('NotThere'))

        expect(result.values).toEqual(['John'])
      })

      it('preserves immutability when value not found', () => {
        const filter = Filter.Text('name').Contains(['John'])
        const result = pipe(filter, Filter.removeValue('NotThere'))

        expect(Equal.equals(filter, result)).toBe(false)
      })

      it('removes all occurrences of a value', () => {
        const filter = Filter.Text('name').Contains(['John', 'Jane', 'John'])
        const removed = pipe(filter, Filter.removeValue('John'))

        expect(removed.values).toEqual(['Jane'])
      })
    })

    describe('Number filters', () => {
      it('removes number value from Number filter', () => {
        const filter = Filter.Number('age').Is([25, 30, 35])
        const removed = pipe(filter, Filter.removeValue(30))

        expect(removed.values).toEqual([25, 35])
      })

      it('returns filter with same values if value not found', () => {
        const filter = Filter.Number('age').Is([25, 30])
        const result = pipe(filter, Filter.removeValue(40))

        expect(result.values).toEqual([25, 30])
      })
    })

    describe('Date filters', () => {
      it('removes DateTime value from Date filter', () => {
        const dt1 = DateTime.unsafeMake(new Date('2024-01-01'))
        const dt2 = DateTime.unsafeMake(new Date('2024-02-01'))
        const dt3 = DateTime.unsafeMake(new Date('2024-03-01'))
        const filter = Filter.Date('createdAt').Is([dt1, dt2, dt3])
        const removed = pipe(filter, Filter.removeValue(dt2))

        expect(removed.values).toEqual([dt1, dt3])
      })

      it('uses Equal.equals for DateTime comparison', () => {
        const dt1 = DateTime.unsafeMake(new Date('2024-01-01'))
        const dt2 = DateTime.unsafeMake(new Date('2024-02-01'))
        const dt1Duplicate = DateTime.unsafeMake(new Date('2024-01-01'))
        const filter = Filter.Date('createdAt').Is([dt1, dt2])
        const removed = pipe(filter, Filter.removeValue(dt1Duplicate))

        expect(removed.values).toEqual([dt2])
      })
    })

    describe('Option filters', () => {
      it('removes string value from Option filter', () => {
        const filter = Filter.Option('status').IsAnyOf(['active', 'pending', 'completed'])
        const removed = pipe(filter, Filter.removeValue('pending'))

        expect(removed.values).toEqual(['active', 'completed'])
      })
    })

    describe('MultiOption filters', () => {
      it('removes string value from MultiOption filter', () => {
        const filter = Filter.MultiOption('tags').Include(['urgent', 'important', 'bug'])
        const removed = pipe(filter, Filter.removeValue('important'))

        expect(removed.values).toEqual(['bug', 'urgent']) // sorted
      })
    })
  })

  describe('setOperator', () => {
    describe('Text filters', () => {
      it('changes operator on Text filter', () => {
        const filter = Filter.Text('name').Contains(['foo'])
        const updated = pipe(filter, Filter.setOperator('DoesNotContain'))

        expect(updated.operator).toBe('DoesNotContain')
        expect(updated.values).toEqual(['foo'])
        expect(updated.columnId).toBe('name')
      })

      it('changes from DoesNotContain to Contains', () => {
        const filter = Filter.Text('description').DoesNotContain(['spam', 'scam'])
        const updated = pipe(filter, Filter.setOperator('Contains'))

        expect(updated.operator).toBe('Contains')
        expect(updated.values).toEqual(['spam', 'scam'])
      })

      it('preserves immutability', () => {
        const original = Filter.Text('name').Contains(['foo'])
        const updated = pipe(original, Filter.setOperator('DoesNotContain'))

        expect(original.operator).toBe('Contains')
        expect(updated.operator).toBe('DoesNotContain')
        expect(Equal.equals(original, updated)).toBe(false)
      })
    })

    describe('Number filters', () => {
      it('changes operator from Is to IsNot', () => {
        const filter = Filter.Number('age').Is([25])
        const updated = pipe(filter, Filter.setOperator('IsNot'))

        expect(updated.operator).toBe('IsNot')
        expect(updated.values).toEqual([25])
      })

      it('changes to comparison operators', () => {
        const filter = Filter.Number('age').Is([25])
        const updated = pipe(filter, Filter.setOperator('IsGreaterThan'))

        expect(updated.operator).toBe('IsGreaterThan')
        expect(updated.values).toEqual([25])
      })

      it('changes to IsBetween operator', () => {
        const filter = Filter.Number('price').Is([10, 20])
        const updated = pipe(filter, Filter.setOperator('IsBetween'))

        expect(updated.operator).toBe('IsBetween')
        expect(updated.values).toEqual([10, 20])
      })
    })

    describe('Date filters', () => {
      it('changes operator from Is to IsNot', () => {
        const dt = DateTime.unsafeMake(new Date('2024-01-01'))
        const filter = Filter.Date('createdAt').Is([dt])
        const updated = pipe(filter, Filter.setOperator('IsNot'))

        expect(updated.operator).toBe('IsNot')
        expect(updated.values).toEqual([dt])
      })

      it('changes to IsBefore operator', () => {
        const dt = DateTime.unsafeMake(new Date('2024-01-01'))
        const filter = Filter.Date('createdAt').Is([dt])
        const updated = pipe(filter, Filter.setOperator('IsBefore'))

        expect(updated.operator).toBe('IsBefore')
        expect(updated.values).toEqual([dt])
      })

      it('changes to IsBetween operator', () => {
        const dt1 = DateTime.unsafeMake(new Date('2024-01-01'))
        const dt2 = DateTime.unsafeMake(new Date('2024-02-01'))
        const filter = Filter.Date('createdAt').Is([dt1, dt2])
        const updated = pipe(filter, Filter.setOperator('IsBetween'))

        expect(updated.operator).toBe('IsBetween')
        expect(updated.values).toEqual([dt1, dt2])
      })
    })

    describe('Option filters', () => {
      it('changes operator from single to multiple', () => {
        const filter = Filter.Option('status').Is(['active'])
        const updated = pipe(filter, Filter.setOperator('IsAnyOf'))

        expect(updated.operator).toBe('IsAnyOf')
        expect(updated.values).toEqual(['active'])
      })

      it('changes from IsAnyOf to IsNoneOf', () => {
        const filter = Filter.Option('status').IsAnyOf(['active', 'pending'])
        const updated = pipe(filter, Filter.setOperator('IsNoneOf'))

        expect(updated.operator).toBe('IsNoneOf')
        expect(updated.values).toEqual(['active', 'pending'])
      })
    })

    describe('MultiOption filters', () => {
      it('changes operator from Include to Exclude', () => {
        const filter = Filter.MultiOption('tags').Include(['urgent'])
        const updated = pipe(filter, Filter.setOperator('Exclude'))

        expect(updated.operator).toBe('Exclude')
        expect(updated.values).toEqual(['urgent'])
      })

      it('changes from IncludeAnyOf to IncludeAllOf', () => {
        const filter = Filter.MultiOption('tags').IncludeAnyOf(['urgent', 'bug'])
        const updated = pipe(filter, Filter.setOperator('IncludeAllOf'))

        expect(updated.operator).toBe('IncludeAllOf')
        expect(updated.values).toEqual(['urgent', 'bug'])
      })

      it('changes to ExcludeIfAnyOf operator', () => {
        const filter = Filter.MultiOption('tags').Include(['spam'])
        const updated = pipe(filter, Filter.setOperator('ExcludeIfAnyOf'))

        expect(updated.operator).toBe('ExcludeIfAnyOf')
        expect(updated.values).toEqual(['spam'])
      })
    })
  })

  describe('setValues', () => {
    describe('Text filters', () => {
      it('replaces all values on Text filter', () => {
        const filter = Filter.Text('name').Contains(['old'])
        const updated = pipe(filter, Filter.setValues(['new1', 'new2']))

        expect(updated.values).toEqual(['new1', 'new2'])
        expect(updated.operator).toBe('Contains')
        expect(updated.columnId).toBe('name')
      })

      it('replaces multiple values with single value', () => {
        const filter = Filter.Text('name').Contains(['old1', 'old2', 'old3'])
        const updated = pipe(filter, Filter.setValues(['newSingle']))

        expect(updated.values).toEqual(['newSingle'])
      })

      it('replaces with empty array', () => {
        const filter = Filter.Text('name').Contains(['old'])
        const updated = pipe(filter, Filter.setValues([]))

        expect(updated.values).toEqual([])
      })

      it('preserves immutability', () => {
        const original = Filter.Text('name').Contains(['old'])
        const updated = pipe(original, Filter.setValues(['new']))

        expect(original.values).toEqual(['old'])
        expect(updated.values).toEqual(['new'])
        expect(Equal.equals(original, updated)).toBe(false)
      })
    })

    describe('Number filters', () => {
      it('replaces all values on Number filter', () => {
        const filter = Filter.Number('age').Is([20])
        const updated = pipe(filter, Filter.setValues([30, 40, 50]))

        expect(updated.values).toEqual([30, 40, 50])
      })

      it('replaces for IsBetween operator', () => {
        const filter = Filter.Number('price').IsBetween([10, 20])
        const updated = pipe(filter, Filter.setValues([50, 100]))

        expect(updated.values).toEqual([50, 100])
        expect(updated.operator).toBe('IsBetween')
      })
    })

    describe('Date filters', () => {
      it('replaces all values on Date filter', () => {
        const dt1 = DateTime.unsafeMake(new Date('2024-01-01'))
        const dt2 = DateTime.unsafeMake(new Date('2024-02-01'))
        const dt3 = DateTime.unsafeMake(new Date('2024-03-01'))
        const filter = Filter.Date('createdAt').Is([dt1])
        const updated = pipe(filter, Filter.setValues([dt2, dt3]))

        expect(updated.values).toEqual([dt2, dt3])
      })
    })

    describe('Option filters', () => {
      it('replaces all values on Option filter', () => {
        const filter = Filter.Option('status').IsAnyOf(['active'])
        const updated = pipe(filter, Filter.setValues(['pending', 'completed']))

        expect(updated.values).toEqual(['completed', 'pending']) // sorted
      })
    })

    describe('MultiOption filters', () => {
      it('replaces all values on MultiOption filter', () => {
        const filter = Filter.MultiOption('tags').Include(['old'])
        const updated = pipe(filter, Filter.setValues(['new1', 'new2', 'new3']))

        expect(updated.values).toEqual(['new1', 'new2', 'new3'])
      })
    })
  })

  describe('Composition', () => {
    it('chains multiple operations on Text filter', () => {
      const filter = Filter.Text('description').Contains(['spam'])

      const updated = pipe(
        filter,
        Filter.addValue('scam'),
        Filter.addValue('phishing'),
        Filter.setOperator('DoesNotContain'),
        Filter.removeValue('scam')
      )

      expect(updated.values).toEqual(['phishing', 'spam']) // sorted
      expect(updated.operator).toBe('DoesNotContain')
      expect(updated.columnId).toBe('description')
    })

    it('chains multiple operations on Number filter', () => {
      const filter = Filter.Number('age').Is([20])

      const updated = pipe(
        filter,
        Filter.addValue(25),
        Filter.addValue(30),
        Filter.setOperator('IsBetween'),
        Filter.removeValue(25)
      )

      expect(updated.values).toEqual([20, 30])
      expect(updated.operator).toBe('IsBetween')
    })

    it('chains addValue and setValues', () => {
      const filter = Filter.Text('name').Contains(['John'])

      const updated = pipe(
        filter,
        Filter.addValue('Jane'),
        Filter.addValue('Bob'),
        Filter.setValues(['Alice', 'Charlie'])
      )

      expect(updated.values).toEqual(['Alice', 'Charlie'])
    })

    it('chains setOperator and setValues', () => {
      const filter = Filter.Option('status').Is(['active'])

      const updated = pipe(
        filter,
        Filter.setOperator('IsAnyOf'),
        Filter.setValues(['pending', 'completed', 'archived'])
      )

      expect(updated.operator).toBe('IsAnyOf')
      expect(updated.values).toEqual(['archived', 'completed', 'pending']) // sorted
    })

    it('complex composition with Date filter', () => {
      const dt1 = DateTime.unsafeMake(new Date('2024-01-01'))
      const dt2 = DateTime.unsafeMake(new Date('2024-02-01'))
      const dt3 = DateTime.unsafeMake(new Date('2024-03-01'))
      const dt4 = DateTime.unsafeMake(new Date('2024-04-01'))

      const filter = Filter.Date('createdAt').Is([dt1])

      const updated = pipe(
        filter,
        Filter.addValue(dt2),
        Filter.addValue(dt3),
        Filter.setOperator('IsBetween'),
        Filter.removeValue(dt2),
        Filter.addValue(dt4)
      )

      expect(updated.values).toEqual([dt1, dt3, dt4])
      expect(updated.operator).toBe('IsBetween')
    })

    it('maintains immutability through chain', () => {
      const original = Filter.Number('price').Is([100])

      const step1 = pipe(original, Filter.addValue(200))
      const step2 = pipe(step1, Filter.setOperator('IsBetween'))
      const final = pipe(step2, Filter.addValue(300))

      expect(original.values).toEqual([100])
      expect(original.operator).toBe('Is')

      expect(step1.values).toEqual([100, 200])
      expect(step1.operator).toBe('Is')

      expect(step2.values).toEqual([100, 200])
      expect(step2.operator).toBe('IsBetween')

      expect(final.values).toEqual([100, 200, 300])
      expect(final.operator).toBe('IsBetween')
    })
  })

  describe('Direct call API (non-piped)', () => {
    it('supports direct call for addValue', () => {
      const filter = Filter.Text('name').Contains(['John'])
      const updated = Filter.addValue(filter, 'Jane')

      expect(updated.values).toEqual(['Jane', 'John']) // sorted
    })

    it('supports direct call for removeValue', () => {
      const filter = Filter.Text('name').Contains(['John', 'Jane'])
      const updated = Filter.removeValue(filter, 'John')

      expect(updated.values).toEqual(['Jane'])
    })

    it('supports direct call for setOperator', () => {
      const filter = Filter.Text('name').Contains(['foo'])
      const updated = Filter.setOperator(filter, 'DoesNotContain')

      expect(updated.operator).toBe('DoesNotContain')
    })

    it('supports direct call for setValues', () => {
      const filter = Filter.Text('name').Contains(['old'])
      const updated = Filter.setValues(filter, ['new1', 'new2'])

      expect(updated.values).toEqual(['new1', 'new2'])
    })
  })
})
