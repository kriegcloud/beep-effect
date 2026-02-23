import { describe, it, expect } from 'vitest'
import * as DateTime from 'effect/DateTime'
import { Filter } from '../core/types'

describe('Filter Type Guards and Pattern Matching', () => {
  describe('$is - Type Guards', () => {
    describe('Text filters', () => {
      it('$is("Text") returns true for Text filter', () => {
        const filter = Filter.Text('name').Contains('foo')
        expect(Filter.$is('Text')(filter)).toBe(true)
      })

      it('$is("Text") returns false for non-Text filter', () => {
        const filter = Filter.Number('age').Is(25)
        expect(Filter.$is('Text')(filter)).toBe(false)
      })

      it('$is("Text") returns true for all Text operators', () => {
        const filters = [
          Filter.Text('name').Contains('foo'),
          Filter.Text('name').DoesNotContain('bar'),
          Filter.Text('name').Is('exact'),
          Filter.Text('name').IsNot('other'),
          Filter.Text('name').StartsWith('prefix'),
          Filter.Text('name').EndsWith('suffix'),
          Filter.Text('name').IsEmpty(),
          Filter.Text('name').IsNotEmpty(),
        ]

        filters.forEach(filter => {
          expect(Filter.$is('Text')(filter)).toBe(true)
        })
      })
    })

    describe('Number filters', () => {
      it('$is("Number") returns true for Number filter', () => {
        const filter = Filter.Number('age').Is(25)
        expect(Filter.$is('Number')(filter)).toBe(true)
      })

      it('$is("Number") returns false for non-Number filter', () => {
        const filter = Filter.Text('name').Contains('foo')
        expect(Filter.$is('Number')(filter)).toBe(false)
      })

      it('$is("Number") returns true for all Number operators', () => {
        const filters = [
          Filter.Number('age').Is(25),
          Filter.Number('age').IsNot(30),
          Filter.Number('age').GreaterThan(18),
          Filter.Number('age').GreaterThanOrEqual(21),
          Filter.Number('age').LessThan(65),
          Filter.Number('age').LessThanOrEqual(100),
          Filter.Number('age').Between(18, 65),
          Filter.Number('age').IsEmpty(),
          Filter.Number('age').IsNotEmpty(),
        ]

        filters.forEach(filter => {
          expect(Filter.$is('Number')(filter)).toBe(true)
        })
      })
    })

    describe('Date filters', () => {
      it('$is("Date") returns true for Date filter', () => {
        const dt = DateTime.unsafeMake(new Date('2024-01-01'))
        const filter = Filter.Date('createdAt').Is(dt)
        expect(Filter.$is('Date')(filter)).toBe(true)
      })

      it('$is("Date") returns false for non-Date filter', () => {
        const filter = Filter.Number('age').Is(25)
        expect(Filter.$is('Date')(filter)).toBe(false)
      })

      it('$is("Date") returns true for all Date operators', () => {
        const dt = DateTime.unsafeMake(new Date('2024-01-01'))
        const filters = [
          Filter.Date('createdAt').Is(dt),
          Filter.Date('createdAt').IsNot(dt),
          Filter.Date('createdAt').Before(dt),
          Filter.Date('createdAt').After(dt),
          Filter.Date('createdAt').OnOrBefore(dt),
          Filter.Date('createdAt').OnOrAfter(dt),
          Filter.Date('createdAt').Between(dt, dt),
          Filter.Date('createdAt').IsEmpty(),
          Filter.Date('createdAt').IsNotEmpty(),
        ]

        filters.forEach(filter => {
          expect(Filter.$is('Date')(filter)).toBe(true)
        })
      })
    })

    describe('Option filters', () => {
      it('$is("Option") returns true for Option filter', () => {
        const filter = Filter.Option('status').Is('active')
        expect(Filter.$is('Option')(filter)).toBe(true)
      })

      it('$is("Option") returns false for non-Option filter', () => {
        const filter = Filter.Text('name').Contains('foo')
        expect(Filter.$is('Option')(filter)).toBe(false)
      })

      it('$is("Option") returns true for all Option operators', () => {
        const filters = [
          Filter.Option('status').Is('active'),
          Filter.Option('status').IsNot('inactive'),
          Filter.Option('status').IsEmpty(),
          Filter.Option('status').IsNotEmpty(),
        ]

        filters.forEach(filter => {
          expect(Filter.$is('Option')(filter)).toBe(true)
        })
      })
    })

    describe('MultiOption filters', () => {
      it('$is("MultiOption") returns true for MultiOption filter', () => {
        const filter = Filter.MultiOption('tags').Include('important')
        expect(Filter.$is('MultiOption')(filter)).toBe(true)
      })

      it('$is("MultiOption") returns false for non-MultiOption filter', () => {
        const filter = Filter.Option('status').Is('active')
        expect(Filter.$is('MultiOption')(filter)).toBe(false)
      })

      it('$is("MultiOption") returns true for all MultiOption operators', () => {
        const filters = [
          Filter.MultiOption('tags').Include('important'),
          Filter.MultiOption('tags').DoNotInclude('spam'),
          Filter.MultiOption('tags').IsEmpty(),
          Filter.MultiOption('tags').IsNotEmpty(),
        ]

        filters.forEach(filter => {
          expect(Filter.$is('MultiOption')(filter)).toBe(true)
        })
      })
    })

    describe('Cross-type exclusivity', () => {
      it('Text filter is not any other type', () => {
        const filter = Filter.Text('name').Contains('foo')
        expect(Filter.$is('Number')(filter)).toBe(false)
        expect(Filter.$is('Date')(filter)).toBe(false)
        expect(Filter.$is('Option')(filter)).toBe(false)
        expect(Filter.$is('MultiOption')(filter)).toBe(false)
      })

      it('Number filter is not any other type', () => {
        const filter = Filter.Number('age').Is(25)
        expect(Filter.$is('Text')(filter)).toBe(false)
        expect(Filter.$is('Date')(filter)).toBe(false)
        expect(Filter.$is('Option')(filter)).toBe(false)
        expect(Filter.$is('MultiOption')(filter)).toBe(false)
      })

      it('Date filter is not any other type', () => {
        const dt = DateTime.unsafeMake(new Date('2024-01-01'))
        const filter = Filter.Date('createdAt').Is(dt)
        expect(Filter.$is('Text')(filter)).toBe(false)
        expect(Filter.$is('Number')(filter)).toBe(false)
        expect(Filter.$is('Option')(filter)).toBe(false)
        expect(Filter.$is('MultiOption')(filter)).toBe(false)
      })

      it('Option filter is not any other type', () => {
        const filter = Filter.Option('status').Is('active')
        expect(Filter.$is('Text')(filter)).toBe(false)
        expect(Filter.$is('Number')(filter)).toBe(false)
        expect(Filter.$is('Date')(filter)).toBe(false)
        expect(Filter.$is('MultiOption')(filter)).toBe(false)
      })

      it('MultiOption filter is not any other type', () => {
        const filter = Filter.MultiOption('tags').Include('important')
        expect(Filter.$is('Text')(filter)).toBe(false)
        expect(Filter.$is('Number')(filter)).toBe(false)
        expect(Filter.$is('Date')(filter)).toBe(false)
        expect(Filter.$is('Option')(filter)).toBe(false)
      })
    })
  })

  describe('$match - Pattern Matching', () => {
    it('dispatches to Text handler for Text filter', () => {
      const filter = Filter.Text('name').Contains('foo')

      const result = Filter.$match({
        Text: (f) => `text:${f.columnId}`,
        Number: (f) => `number:${f.columnId}`,
        Date: (f) => `date:${f.columnId}`,
        Option: (f) => `option:${f.columnId}`,
        MultiOption: (f) => `multi:${f.columnId}`,
      })(filter)

      expect(result).toBe('text:name')
    })

    it('dispatches to Number handler for Number filter', () => {
      const filter = Filter.Number('age').Is(25)

      const result = Filter.$match({
        Text: () => 'text',
        Number: (f) => `number:${f.values[0]}`,
        Date: () => 'date',
        Option: () => 'option',
        MultiOption: () => 'multi',
      })(filter)

      expect(result).toBe('number:25')
    })

    it('dispatches to Date handler for Date filter', () => {
      const dt = DateTime.unsafeMake(new Date('2024-01-01'))
      const filter = Filter.Date('createdAt').Is(dt)

      let wasCalled = false
      Filter.$match({
        Text: () => {},
        Number: () => {},
        Date: () => { wasCalled = true },
        Option: () => {},
        MultiOption: () => {},
      })(filter)

      expect(wasCalled).toBe(true)
    })

    it('dispatches to Option handler for Option filter', () => {
      const filter = Filter.Option('status').Is('active')

      const result = Filter.$match({
        Text: () => 'text',
        Number: () => 'number',
        Date: () => 'date',
        Option: (f) => `option:${f.values[0]}`,
        MultiOption: () => 'multi',
      })(filter)

      expect(result).toBe('option:active')
    })

    it('dispatches to MultiOption handler for MultiOption filter', () => {
      const filter = Filter.MultiOption('tags').Include('important')

      const result = Filter.$match({
        Text: () => 'text',
        Number: () => 'number',
        Date: () => 'date',
        Option: () => 'option',
        MultiOption: (f) => `multi:${f.operator}`,
      })(filter)

      expect(result).toBe('multi:Include')
    })

    it('handlers receive properly typed filter', () => {
      const textFilter = Filter.Text('name').Contains('foo')
      const numberFilter = Filter.Number('age').Is(25)

      // Text handler receives TextFilter with string values
      Filter.$match({
        Text: (f) => {
          // f.values should be readonly string[]
          expect(typeof f.values[0]).toBe('string')
        },
        Number: () => {},
        Date: () => {},
        Option: () => {},
        MultiOption: () => {},
      })(textFilter)

      // Number handler receives NumberFilter with number values
      Filter.$match({
        Text: () => {},
        Number: (f) => {
          // f.values should be readonly number[]
          expect(typeof f.values[0]).toBe('number')
        },
        Date: () => {},
        Option: () => {},
        MultiOption: () => {},
      })(numberFilter)
    })

    it('dispatches correctly for all Text operators', () => {
      const filters = [
        Filter.Text('name').Contains('foo'),
        Filter.Text('name').DoesNotContain('bar'),
        Filter.Text('name').Is('exact'),
        Filter.Text('name').IsNot('other'),
        Filter.Text('name').StartsWith('prefix'),
        Filter.Text('name').EndsWith('suffix'),
        Filter.Text('name').IsEmpty(),
        Filter.Text('name').IsNotEmpty(),
      ]

      filters.forEach(filter => {
        const result = Filter.$match({
          Text: () => 'text-handler',
          Number: () => 'number-handler',
          Date: () => 'date-handler',
          Option: () => 'option-handler',
          MultiOption: () => 'multi-handler',
        })(filter)

        expect(result).toBe('text-handler')
      })
    })

    it('dispatches correctly for all Number operators', () => {
      const filters = [
        Filter.Number('age').Is(25),
        Filter.Number('age').IsNot(30),
        Filter.Number('age').GreaterThan(18),
        Filter.Number('age').GreaterThanOrEqual(21),
        Filter.Number('age').LessThan(65),
        Filter.Number('age').LessThanOrEqual(100),
        Filter.Number('age').Between(18, 65),
        Filter.Number('age').IsEmpty(),
        Filter.Number('age').IsNotEmpty(),
      ]

      filters.forEach(filter => {
        const result = Filter.$match({
          Text: () => 'text-handler',
          Number: () => 'number-handler',
          Date: () => 'date-handler',
          Option: () => 'option-handler',
          MultiOption: () => 'multi-handler',
        })(filter)

        expect(result).toBe('number-handler')
      })
    })

    it('dispatches correctly for all Date operators', () => {
      const dt = DateTime.unsafeMake(new Date('2024-01-01'))
      const filters = [
        Filter.Date('createdAt').Is(dt),
        Filter.Date('createdAt').IsNot(dt),
        Filter.Date('createdAt').Before(dt),
        Filter.Date('createdAt').After(dt),
        Filter.Date('createdAt').OnOrBefore(dt),
        Filter.Date('createdAt').OnOrAfter(dt),
        Filter.Date('createdAt').Between(dt, dt),
        Filter.Date('createdAt').IsEmpty(),
        Filter.Date('createdAt').IsNotEmpty(),
      ]

      filters.forEach(filter => {
        const result = Filter.$match({
          Text: () => 'text-handler',
          Number: () => 'number-handler',
          Date: () => 'date-handler',
          Option: () => 'option-handler',
          MultiOption: () => 'multi-handler',
        })(filter)

        expect(result).toBe('date-handler')
      })
    })

    it('dispatches correctly for all Option operators', () => {
      const filters = [
        Filter.Option('status').Is('active'),
        Filter.Option('status').IsNot('inactive'),
        Filter.Option('status').IsEmpty(),
        Filter.Option('status').IsNotEmpty(),
      ]

      filters.forEach(filter => {
        const result = Filter.$match({
          Text: () => 'text-handler',
          Number: () => 'number-handler',
          Date: () => 'date-handler',
          Option: () => 'option-handler',
          MultiOption: () => 'multi-handler',
        })(filter)

        expect(result).toBe('option-handler')
      })
    })

    it('dispatches correctly for all MultiOption operators', () => {
      const filters = [
        Filter.MultiOption('tags').Include('important'),
        Filter.MultiOption('tags').DoNotInclude('spam'),
        Filter.MultiOption('tags').IsEmpty(),
        Filter.MultiOption('tags').IsNotEmpty(),
      ]

      filters.forEach(filter => {
        const result = Filter.$match({
          Text: () => 'text-handler',
          Number: () => 'number-handler',
          Date: () => 'date-handler',
          Option: () => 'option-handler',
          MultiOption: () => 'multi-handler',
        })(filter)

        expect(result).toBe('multi-handler')
      })
    })

    it('handlers can access filter properties', () => {
      const textFilter = Filter.Text('name').Contains('foo')
      const numberFilter = Filter.Number('age').Between(18, 65)
      const dateFilter = Filter.Date('createdAt').After(DateTime.unsafeMake(new Date('2024-01-01')))

      Filter.$match({
        Text: (f) => {
          expect(f.columnId).toBe('name')
          expect(f.operator).toBe('Contains')
          expect(f.values).toEqual(['foo'])
        },
        Number: () => {},
        Date: () => {},
        Option: () => {},
        MultiOption: () => {},
      })(textFilter)

      Filter.$match({
        Text: () => {},
        Number: (f) => {
          expect(f.columnId).toBe('age')
          expect(f.operator).toBe('Between')
          expect(f.values).toEqual([18, 65])
        },
        Date: () => {},
        Option: () => {},
        MultiOption: () => {},
      })(numberFilter)

      Filter.$match({
        Text: () => {},
        Number: () => {},
        Date: (f) => {
          expect(f.columnId).toBe('createdAt')
          expect(f.operator).toBe('After')
          expect(f.values.length).toBe(1)
        },
        Option: () => {},
        MultiOption: () => {},
      })(dateFilter)
    })

    it('returns handler return value', () => {
      const filter = Filter.Number('age').Is(25)

      const result = Filter.$match({
        Text: () => ({ type: 'text' as const }),
        Number: (f) => ({ type: 'number' as const, value: f.values[0] }),
        Date: () => ({ type: 'date' as const }),
        Option: () => ({ type: 'option' as const }),
        MultiOption: () => ({ type: 'multi' as const }),
      })(filter)

      expect(result).toEqual({ type: 'number', value: 25 })
    })
  })

  describe('Combining $is and $match', () => {
    it('$is can be used before $match for early exit', () => {
      const filter = Filter.Text('name').Contains('foo')

      if (Filter.$is('Text')(filter)) {
        // TypeScript should narrow to TextFilter here
        expect(filter.operator).toBe('Contains')
      }
    })

    it('$is can filter arrays of filters', () => {
      const filters = [
        Filter.Text('name').Contains('foo'),
        Filter.Number('age').Is(25),
        Filter.Text('email').EndsWith('@example.com'),
        Filter.Date('createdAt').After(DateTime.unsafeMake(new Date('2024-01-01'))),
      ]

      const textFilters = filters.filter(Filter.$is('Text'))
      expect(textFilters).toHaveLength(2)

      const numberFilters = filters.filter(Filter.$is('Number'))
      expect(numberFilters).toHaveLength(1)

      const dateFilters = filters.filter(Filter.$is('Date'))
      expect(dateFilters).toHaveLength(1)
    })

    it('$match can be used after $is for type-safe operations', () => {
      const filters = [
        Filter.Text('name').Contains('John'),
        Filter.Number('age').Is(25),
        Filter.Option('status').Is('active'),
      ]

      const results = filters.map(filter => {
        if (Filter.$is('Text')(filter)) {
          return `text:${filter.values[0]}`
        }

        return Filter.$match({
          Text: () => 'unreachable',
          Number: (f) => `number:${f.values[0]}`,
          Date: () => 'date',
          Option: (f) => `option:${f.values[0]}`,
          MultiOption: () => 'multi',
        })(filter)
      })

      expect(results).toEqual([
        'text:John',
        'number:25',
        'option:active',
      ])
    })

    it('multiple $is checks can narrow type progressively', () => {
      const filter = Filter.Text('name').Contains('foo')

      let result = 'unknown'

      if (Filter.$is('Number')(filter)) {
        result = 'number'
      } else if (Filter.$is('Date')(filter)) {
        result = 'date'
      } else if (Filter.$is('Text')(filter)) {
        result = 'text'
      }

      expect(result).toBe('text')
    })
  })

  describe('Edge cases', () => {
    it('handles IsEmpty operators across all types', () => {
      const filters = [
        Filter.Text('name').IsEmpty(),
        Filter.Number('age').IsEmpty(),
        Filter.Date('createdAt').IsEmpty(),
        Filter.Option('status').IsEmpty(),
        Filter.MultiOption('tags').IsEmpty(),
      ]

      const results = filters.map(filter =>
        Filter.$match({
          Text: (f) => f.operator,
          Number: (f) => f.operator,
          Date: (f) => f.operator,
          Option: (f) => f.operator,
          MultiOption: (f) => f.operator,
        })(filter)
      )

      expect(results).toEqual([
        'IsEmpty',
        'IsEmpty',
        'IsEmpty',
        'IsEmpty',
        'IsEmpty',
      ])
    })

    it('handles IsNotEmpty operators across all types', () => {
      const filters = [
        Filter.Text('name').IsNotEmpty(),
        Filter.Number('age').IsNotEmpty(),
        Filter.Date('createdAt').IsNotEmpty(),
        Filter.Option('status').IsNotEmpty(),
        Filter.MultiOption('tags').IsNotEmpty(),
      ]

      const results = filters.map(filter =>
        Filter.$match({
          Text: (f) => f.operator,
          Number: (f) => f.operator,
          Date: (f) => f.operator,
          Option: (f) => f.operator,
          MultiOption: (f) => f.operator,
        })(filter)
      )

      expect(results).toEqual([
        'IsNotEmpty',
        'IsNotEmpty',
        'IsNotEmpty',
        'IsNotEmpty',
        'IsNotEmpty',
      ])
    })

    it('handles empty values array for IsEmpty/IsNotEmpty', () => {
      const emptyFilter = Filter.Text('name').IsEmpty()
      const notEmptyFilter = Filter.Text('name').IsNotEmpty()

      Filter.$match({
        Text: (f) => {
          expect(f.values).toEqual([])
        },
        Number: () => {},
        Date: () => {},
        Option: () => {},
        MultiOption: () => {},
      })(emptyFilter)

      Filter.$match({
        Text: (f) => {
          expect(f.values).toEqual([])
        },
        Number: () => {},
        Date: () => {},
        Option: () => {},
        MultiOption: () => {},
      })(notEmptyFilter)
    })
  })
})
