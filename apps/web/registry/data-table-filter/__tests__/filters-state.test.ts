import { describe, it, expect } from 'vitest'
import { pipe } from 'effect/Function'
import * as Option from 'effect/Option'
import * as Filter from "../core/Filter"
import * as FiltersState from "../core/FiltersState"
describe('FiltersState', () => {
  describe('empty', () => {
    it('returns empty array', () => {
      const state = FiltersState.empty()
      expect(state).toEqual([])
      expect(state.length).toBe(0)
    })
  })

  describe('add', () => {
    it('adds filter to empty state (data-first)', () => {
      const filter = Filter.Text('name').Contains('test')
      const state = FiltersState.add(FiltersState.empty(), filter)

      expect(state.length).toBe(1)
      expect(state[0]).toEqual(filter)
    })

    it('adds filter to empty state (data-last/pipe)', () => {
      const filter = Filter.Text('name').Contains('test')
      const state = pipe(
        FiltersState.empty(),
        FiltersState.add(filter)
      )

      expect(state.length).toBe(1)
    })

    it('appends filter at end', () => {
      const f1 = Filter.Text('name').Contains('a')
      const f2 = Filter.Number('age').Is(25)
      const f3 = Filter.Option('status').Is('active')

      const state = pipe(
        FiltersState.empty(),
        FiltersState.add(f1),
        FiltersState.add(f2),
        FiltersState.add(f3)
      )

      expect(state.length).toBe(3)
      expect(state[0].columnId).toBe('name')
      expect(state[1].columnId).toBe('age')
      expect(state[2].columnId).toBe('status')
    })

    it('preserves immutability', () => {
      const f1 = Filter.Text('name').Contains('a')
      const f2 = Filter.Number('age').Is(25)

      const state1 = FiltersState.add(FiltersState.empty(), f1)
      const state2 = FiltersState.add(state1, f2)

      expect(state1.length).toBe(1)
      expect(state2.length).toBe(2)
      expect(state1).not.toBe(state2)
    })
  })

  describe('remove', () => {
    it('removes filter by columnId', () => {
      const f1 = Filter.Text('name').Contains('a')
      const f2 = Filter.Number('age').Is(25)

      const state = pipe(
        FiltersState.empty(),
        FiltersState.add(f1),
        FiltersState.add(f2),
        FiltersState.remove('name')
      )

      expect(state.length).toBe(1)
      expect(state[0].columnId).toBe('age')
    })

    it('returns same state if columnId not found', () => {
      const filter = Filter.Text('name').Contains('a')
      const state1 = FiltersState.add(FiltersState.empty(), filter)
      const state2 = FiltersState.remove(state1, 'nonexistent')

      expect(state2).toEqual(state1)
    })

    it('removes ALL filters with matching columnId', () => {
      const f1 = Filter.Text('name').Contains('a')
      const f2 = Filter.Text('name').DoesNotContain('b')
      const f3 = Filter.Number('age').Is(25)

      const state = pipe(
        FiltersState.empty(),
        FiltersState.add(f1),
        FiltersState.add(f2),
        FiltersState.add(f3),
        FiltersState.remove('name')
      )

      expect(state.length).toBe(1)
      expect(state[0].columnId).toBe('age')
    })
  })

  describe('findByColumnId', () => {
    it('returns Some when found', () => {
      const filter = Filter.Text('name').Contains('test')
      const state = FiltersState.add(FiltersState.empty(), filter)

      const result = FiltersState.findByColumnId(state, 'name')

      expect(Option.isSome(result)).toBe(true)
      expect(Option.getOrNull(result)).toEqual(filter)
    })

    it('returns None when not found', () => {
      const state = FiltersState.empty()
      const result = FiltersState.findByColumnId(state, 'name')

      expect(Option.isNone(result)).toBe(true)
    })

    it('returns first match if multiple exist', () => {
      const f1 = Filter.Text('name').Contains('first')
      const f2 = Filter.Text('name').DoesNotContain('second')

      const state = pipe(
        FiltersState.empty(),
        FiltersState.add(f1),
        FiltersState.add(f2)
      )

      const result = FiltersState.findByColumnId(state, 'name')
      expect(Option.getOrNull(result)?.values).toEqual(['first'])
    })
  })

  describe('updateByColumnId', () => {
    it('updates filter using setValues', () => {
      const filter = Filter.Text('name').Contains('old')
      const state1 = FiltersState.add(FiltersState.empty(), filter)

      const state2 = FiltersState.updateByColumnId(
        state1,
        'name',
        (f) => pipe(f, Filter.setValues(['new']))
      )

      expect(state2[0].values).toEqual(['new'])
    })

    it('updates filter using setOperator', () => {
      const filter = Filter.Text('name').Contains('test')
      const state1 = FiltersState.add(FiltersState.empty(), filter)

      const state2 = FiltersState.updateByColumnId(
        state1,
        'name',
        (f) => pipe(f, Filter.setOperator('DoesNotContain'))
      )

      expect(state2[0].operator).toBe('DoesNotContain')
    })

    it('updates ALL filters with matching columnId', () => {
      const f1 = Filter.Text('name').Contains('a')
      const f2 = Filter.Text('name').DoesNotContain('b')
      const f3 = Filter.Number('age').Is(25)

      const state1 = pipe(
        FiltersState.empty(),
        FiltersState.add(f1),
        FiltersState.add(f2),
        FiltersState.add(f3)
      )

      const state2 = FiltersState.updateByColumnId(
        state1,
        'name',
        (f) => pipe(f, Filter.setValues(['updated']))
      )

      expect(state2[0].values).toEqual(['updated'])
      expect(state2[1].values).toEqual(['updated'])
      expect(state2[2].values).toEqual([25])
    })

    it('returns same state if columnId not found', () => {
      const filter = Filter.Text('name').Contains('test')
      const state1 = FiltersState.add(FiltersState.empty(), filter)

      const state2 = FiltersState.updateByColumnId(
        state1,
        'nonexistent',
        (f) => pipe(f, Filter.setValues(['updated']))
      )

      expect(state2).toEqual(state1)
    })
  })

  describe('Composition', () => {
    it('complex workflow: add, update, remove', () => {
      const f1 = Filter.Text('name').Contains('test')
      const f2 = Filter.Number('age').Is(25)
      const f3 = Filter.Option('status').Is('active')

      const state = pipe(
        FiltersState.empty(),
        FiltersState.add(f1),
        FiltersState.add(f2),
        FiltersState.add(f3),
        FiltersState.updateByColumnId('age', (f) => pipe(f, Filter.setValues([30]))),
        FiltersState.remove('status')
      )

      expect(state.length).toBe(2)
      expect(state[0].columnId).toBe('name')
      expect(state[1].columnId).toBe('age')
      expect(state[1].values).toEqual([30])
    })
  })
})
