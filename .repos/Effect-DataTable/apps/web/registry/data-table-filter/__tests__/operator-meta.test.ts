/**
 * Tests for Operator Metadata
 *
 * String literal operators with Record<Op, OperatorMeta> for metadata
 */

import { describe, it, expect } from 'vitest'
import {
  TextOperatorMeta,
  NumberOperatorMeta,
  OptionOperatorMeta,
  MultiOptionOperatorMeta,
  DateOperatorMeta,
  getOperatorMeta,
  getNegation,
  getSingularOf,
  getPluralOf,
} from '../core/Operators'

describe('Operator Metadata', () => {
  describe('TextOperator', () => {
    it('Contains has correct metadata', () => {
      const meta = TextOperatorMeta.Contains
      expect(meta.i18nKey).toBe('filters.text.contains')
      expect(meta.target).toBe('single')
      expect(meta.negation).toBe('DoesNotContain')
    })

    it('DoesNotContain has correct metadata', () => {
      const meta = TextOperatorMeta.DoesNotContain
      expect(meta.i18nKey).toBe('filters.text.doesNotContain')
      expect(meta.target).toBe('single')
      expect(meta.negation).toBe('Contains')
    })

    it('Contains negation is DoesNotContain', () => {
      expect(TextOperatorMeta.Contains.negation).toBe('DoesNotContain')
    })

    it('DoesNotContain negation is Contains', () => {
      expect(TextOperatorMeta.DoesNotContain.negation).toBe('Contains')
    })
  })

  describe('NumberOperator', () => {
    it('Is has correct metadata', () => {
      const meta = NumberOperatorMeta.Is
      expect(meta.i18nKey).toBe('filters.number.is')
      expect(meta.target).toBe('single')
      expect(meta.negation).toBe('IsNot')
      expect(meta.pluralOf).toBe('IsBetween')
    })

    it('IsNot has correct metadata', () => {
      const meta = NumberOperatorMeta.IsNot
      expect(meta.i18nKey).toBe('filters.number.isNot')
      expect(meta.target).toBe('single')
      expect(meta.negation).toBe('Is')
      expect(meta.pluralOf).toBe('IsNotBetween')
    })

    it('IsGreaterThan has correct metadata', () => {
      const meta = NumberOperatorMeta.IsGreaterThan
      expect(meta.i18nKey).toBe('filters.number.greaterThan')
      expect(meta.target).toBe('single')
      expect(meta.negation).toBe('IsLessThanOrEqualTo')
      expect(meta.pluralOf).toBe('IsBetween')
    })

    it('IsGreaterThanOrEqualTo has correct metadata', () => {
      const meta = NumberOperatorMeta.IsGreaterThanOrEqualTo
      expect(meta.i18nKey).toBe('filters.number.greaterThanOrEqual')
      expect(meta.target).toBe('single')
      expect(meta.negation).toBe('IsLessThan')
      expect(meta.pluralOf).toBe('IsBetween')
    })

    it('IsLessThan has correct metadata', () => {
      const meta = NumberOperatorMeta.IsLessThan
      expect(meta.i18nKey).toBe('filters.number.lessThan')
      expect(meta.target).toBe('single')
      expect(meta.negation).toBe('IsGreaterThanOrEqualTo')
      expect(meta.pluralOf).toBe('IsBetween')
    })

    it('IsLessThanOrEqualTo has correct metadata', () => {
      const meta = NumberOperatorMeta.IsLessThanOrEqualTo
      expect(meta.i18nKey).toBe('filters.number.lessThanOrEqual')
      expect(meta.target).toBe('single')
      expect(meta.negation).toBe('IsGreaterThan')
      expect(meta.pluralOf).toBe('IsBetween')
    })

    it('IsBetween has correct metadata', () => {
      const meta = NumberOperatorMeta.IsBetween
      expect(meta.i18nKey).toBe('filters.number.isBetween')
      expect(meta.target).toBe('multiple')
      expect(meta.negation).toBe('IsNotBetween')
      expect(meta.singularOf).toBe('Is')
    })

    it('IsNotBetween has correct metadata', () => {
      const meta = NumberOperatorMeta.IsNotBetween
      expect(meta.i18nKey).toBe('filters.number.isNotBetween')
      expect(meta.target).toBe('multiple')
      expect(meta.negation).toBe('IsBetween')
      expect(meta.singularOf).toBe('IsNot')
    })
  })

  describe('OptionOperator', () => {
    it('Is has correct metadata', () => {
      const meta = OptionOperatorMeta.Is
      expect(meta.i18nKey).toBe('filters.option.is')
      expect(meta.target).toBe('single')
      expect(meta.negation).toBe('IsNot')
    })

    it('IsAnyOf has target multiple', () => {
      expect(OptionOperatorMeta.IsAnyOf.target).toBe('multiple')
    })

    it('Is singularOf IsAnyOf', () => {
      expect(OptionOperatorMeta.IsAnyOf.singularOf).toBe('Is')
    })

    it('IsNot singularOf IsNoneOf', () => {
      expect(OptionOperatorMeta.IsNoneOf.singularOf).toBe('IsNot')
    })
  })

  describe('MultiOptionOperator', () => {
    it('Include has correct metadata', () => {
      const meta = MultiOptionOperatorMeta.Include
      expect(meta.i18nKey).toBe('filters.multiOption.include')
      expect(meta.target).toBe('single')
      expect(meta.negation).toBe('Exclude')
    })

    it('IncludeAnyOf has target multiple', () => {
      expect(MultiOptionOperatorMeta.IncludeAnyOf.target).toBe('multiple')
    })

    it('Exclude is negation of Include', () => {
      expect(MultiOptionOperatorMeta.Include.negation).toBe('Exclude')
      expect(MultiOptionOperatorMeta.Exclude.negation).toBe('Include')
    })
  })

  describe('DateOperator', () => {
    it('Is has correct metadata', () => {
      const meta = DateOperatorMeta.Is
      expect(meta.i18nKey).toBe('filters.date.is')
      expect(meta.target).toBe('single')
      expect(meta.negation).toBe('IsNot')
    })

    it('IsBetween has target multiple', () => {
      expect(DateOperatorMeta.IsBetween.target).toBe('multiple')
    })

    it('IsBefore has target single', () => {
      expect(DateOperatorMeta.IsBefore.target).toBe('single')
    })
  })

  describe('Operator Utilities', () => {
    it('getOperatorMeta returns correct metadata for type', () => {
      const textMeta = getOperatorMeta('Contains')
      expect(textMeta.i18nKey).toBe('filters.text.contains')
      expect(textMeta.target).toBe('single')

      const numberMeta = getOperatorMeta('Is')
      expect(numberMeta.i18nKey).toBe('filters.number.is')
      expect(numberMeta.target).toBe('single')

      const optionMeta = getOperatorMeta('IsAnyOf')
      expect(optionMeta.i18nKey).toBe('filters.option.isAnyOf')
      expect(optionMeta.target).toBe('multiple')
    })

    it('getNegation returns opposite operator', () => {
      expect(getNegation('Contains')).toBe('DoesNotContain')
      expect(getNegation('DoesNotContain')).toBe('Contains')

      expect(getNegation('Is')).toBe('IsNot')
      expect(getNegation('IsNot')).toBe('Is')

      expect(getNegation('Include')).toBe('Exclude')
    })

    it('getSingularOf returns singular form', () => {
      expect(getSingularOf('IsBetween')).toBe('Is')
      expect(getSingularOf('IsNotBetween')).toBe('IsNot')

      expect(getSingularOf('IsAnyOf')).toBe('Is')
      expect(getSingularOf('IsNoneOf')).toBe('IsNot')

      // Operators without singular form return undefined
      expect(getSingularOf('Is')).toBeUndefined()
      expect(getSingularOf('Contains')).toBeUndefined()
    })

    it('getPluralOf returns plural form', () => {
      expect(getPluralOf('Is')).toBe('IsBetween')
      expect(getPluralOf('IsNot')).toBe('IsNotBetween')

      expect(getPluralOf('IsBefore')).toBe('IsBetween')

      // Operators without plural form return undefined
      expect(getPluralOf('IsBetween')).toBeUndefined()
      expect(getPluralOf('Contains')).toBeUndefined()
    })
  })
})
