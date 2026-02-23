import * as Data from "effect/Data"

// =============================================================================
// Operator Type Definitions (PascalCase)
// =============================================================================

export type TextOperator = 'Contains' | 'DoesNotContain'

export type NumberOperator =
  | 'Is'
  | 'IsNot'
  | 'IsLessThan'
  | 'IsGreaterThan'
  | 'IsLessThanOrEqualTo'
  | 'IsGreaterThanOrEqualTo'
  | 'IsBetween'
  | 'IsNotBetween'

export type DateOperator =
  | 'Is'
  | 'IsNot'
  | 'IsBefore'
  | 'IsAfter'
  | 'IsOnOrBefore'
  | 'IsOnOrAfter'
  | 'IsBetween'
  | 'IsNotBetween'

export type OptionOperator = 'Is' | 'IsNot' | 'IsAnyOf' | 'IsNoneOf'

export type MultiOptionOperator =
  | 'Include'
  | 'Exclude'
  | 'IncludeAnyOf'
  | 'IncludeAllOf'
  | 'ExcludeIfAnyOf'
  | 'ExcludeIfAll'

export type Operator =
  | TextOperator
  | NumberOperator
  | DateOperator
  | OptionOperator
  | MultiOptionOperator

// =============================================================================
// Operator Metadata - TaggedEnum with Single/Multiple variants
// =============================================================================

export type OperatorMeta<Op> = Data.TaggedEnum<{
  readonly Single: {
    readonly i18nKey: string
    readonly negation: Op
    readonly pluralOf: Op
  }
  readonly Multiple: {
    readonly i18nKey: string
    readonly negation: Op
    readonly singularOf: Op
  }
}>

interface OperatorMetaDef extends Data.TaggedEnum.WithGenerics<1> {
  readonly taggedEnum: OperatorMeta<this["A"]>
}

export const OperatorMeta = Data.taggedEnum<OperatorMetaDef>()

// Record types for metadata lookup
export type TextOperatorMeta = Record<TextOperator, OperatorMeta<TextOperator>>
export type NumberOperatorMeta = Record<NumberOperator, OperatorMeta<NumberOperator>>
export type DateOperatorMeta = Record<DateOperator, OperatorMeta<DateOperator>>
export type OptionOperatorMeta = Record<OptionOperator, OperatorMeta<OptionOperator>>
export type MultiOptionOperatorMeta = Record<MultiOptionOperator, OperatorMeta<MultiOptionOperator>>
