/**
 * Tests for FilterModel TaggedEnum API
 *
 * FilterModel is a TaggedEnum with variants: Text, Number, Date, Option, MultiOption
 * Each variant has: columnId, operator, values
 */

import { describe, it, expect } from 'vitest'
import { Data, Equal } from 'effect'
import * as DateTime from 'effect/DateTime'
import { Filter } from '../core/types'

describe('FilterModel', () => {
  describe('Constructors', () => {
    it('Filter.Text creates a text filter with correct _tag', () => {
      const filter = Filter.Text('name').Contains('foo')

      expect(filter._tag).toBe('Text')
      expect(filter.columnId).toBe('name')
      expect(filter.operator).toBe('Contains')
      expect(filter.values).toEqual(['foo'])
    })

    it('Filter.Number creates a number filter with correct _tag', () => {
      const filter = Filter.Number('age').Is(25)

      expect(filter._tag).toBe('Number')
      expect(filter.columnId).toBe('age')
      expect(filter.operator).toBe('Is')
      expect(filter.values).toEqual([25])
    })

    it('Filter.Date creates a date filter with correct _tag', () => {
      const date = DateTime.unsafeMake(new Date('2024-01-01'))
      const filter = Filter.Date('createdAt').Is(date)

      expect(filter._tag).toBe('Date')
      expect(filter.columnId).toBe('createdAt')
      expect(filter.operator).toBe('Is')
      expect(filter.values).toEqual([date])
    })

    it('Filter.Option creates an option filter with correct _tag', () => {
      const filter = Filter.Option('status').Is('active')

      expect(filter._tag).toBe('Option')
      expect(filter.columnId).toBe('status')
      expect(filter.operator).toBe('Is')
      expect(filter.values).toEqual(['active'])
    })

    it('Filter.MultiOption creates a multiOption filter with correct _tag', () => {
      const filter = Filter.MultiOption('tags').Include('tag1')

      expect(filter._tag).toBe('MultiOption')
      expect(filter.columnId).toBe('tags')
      expect(filter.operator).toBe('Include')
      expect(filter.values).toEqual(['tag1'])
    })
  })

  describe('Type Guards - $is', () => {
    it('Filter.$is("Text") returns true for text filters', () => {
      const filter = Filter.Text('name').Contains('foo')

      expect(Filter.$is('Text')(filter)).toBe(true)
    })

    it('Filter.$is("Text") returns false for non-text filters', () => {
      const numberFilter = Filter.Number('age').Is(25)

      expect(Filter.$is('Text')(numberFilter)).toBe(false)
    })

    it('Filter.$is("Number") returns true for number filters', () => {
      const filter = Filter.Number('age').Is(25)

      expect(Filter.$is('Number')(filter)).toBe(true)
    })

    it('Filter.$is("Option") returns true for option filters', () => {
      const filter = Filter.Option('status').Is('active')

      expect(Filter.$is('Option')(filter)).toBe(true)
    })

    it('Filter.$is("MultiOption") returns true for multiOption filters', () => {
      const filter = Filter.MultiOption('tags').Include('tag1')

      expect(Filter.$is('MultiOption')(filter)).toBe(true)
    })
  })

  describe('Pattern Matching - $match', () => {
    it('$match dispatches to correct handler for Text filter', () => {
      const filter = Filter.Text('name').Contains('foo')

      let called = false
      Filter.$match({
        Text: () => { called = true; return 'text' },
        Number: () => 'number',
        Date: () => 'date',
        Option: () => 'option',
        MultiOption: () => 'multiOption'
      })(filter)

      expect(called).toBe(true)
    })

    it('$match dispatches to correct handler for Number filter', () => {
      const filter = Filter.Number('age').Is(25)

      let called = false
      Filter.$match({
        Text: () => 'text',
        Number: () => { called = true; return 'number' },
        Date: () => 'date',
        Option: () => 'option',
        MultiOption: () => 'multiOption'
      })(filter)

      expect(called).toBe(true)
    })

    it('$match dispatches to correct handler for Date filter', () => {
      const date = DateTime.unsafeMake(new Date())
      const filter = Filter.Date('createdAt').Is(date)

      let called = false
      Filter.$match({
        Text: () => 'text',
        Number: () => 'number',
        Date: () => { called = true; return 'date' },
        Option: () => 'option',
        MultiOption: () => 'multiOption'
      })(filter)

      expect(called).toBe(true)
    })

    it('$match dispatches to correct handler for Option filter', () => {
      const filter = Filter.Option('status').Is('active')

      let called = false
      Filter.$match({
        Text: () => 'text',
        Number: () => 'number',
        Date: () => 'date',
        Option: () => { called = true; return 'option' },
        MultiOption: () => 'multiOption'
      })(filter)

      expect(called).toBe(true)
    })

    it('$match dispatches to correct handler for MultiOption filter', () => {
      const filter = Filter.MultiOption('tags').Include('tag1')

      let called = false
      Filter.$match({
        Text: () => 'text',
        Number: () => 'number',
        Date: () => 'date',
        Option: () => 'option',
        MultiOption: () => { called = true; return 'multiOption' }
      })(filter)

      expect(called).toBe(true)
    })

    it('$match returns the handler result', () => {
      const filter = Filter.Text('name').Contains('foo')

      const result = Filter.$match({
        Text: (f) => `text:${f.columnId}`,
        Number: () => 'number',
        Date: () => 'date',
        Option: () => 'option',
        MultiOption: () => 'multiOption'
      })(filter)

      expect(result).toBe('text:name')
    })
  })

  describe('Equality - Equal.equals', () => {
    it('two filters with same values are equal', () => {
      const value = 'foo'
      const filter1 = Filter.Text('name').Contains(value)
      const filter2 = Filter.Text('name').Contains(value)

      expect(Equal.equals(filter1, filter2)).toBe(true)
    })

    it('two filters with different columnId are not equal', () => {
      const filter1 = Filter.Text('name').Contains('foo')
      const filter2 = Filter.Text('email').Contains('foo')

      expect(Equal.equals(filter1, filter2)).toBe(false)
    })

    it('two filters with different operator are not equal', () => {
      const filter1 = Filter.Text('name').Contains('foo')
      const filter2 = Filter.Text('name').DoesNotContain('foo')

      expect(Equal.equals(filter1, filter2)).toBe(false)
    })

    it('two filters with different values are not equal', () => {
      const filter1 = Filter.Text('name').Contains('foo')
      const filter2 = Filter.Text('name').Contains('bar')

      expect(Equal.equals(filter1, filter2)).toBe(false)
    })

    it('filters of different types are not equal', () => {
      const textFilter = Filter.Text('name').Contains('foo')
      const numberFilter = Filter.Number('name').Is(123)

      expect(Equal.equals(textFilter, numberFilter)).toBe(false)
    })
  })
})
