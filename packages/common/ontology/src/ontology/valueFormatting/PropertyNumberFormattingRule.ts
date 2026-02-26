/**
 * Formatting rules for numeric ontology properties.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/valueFormatting/PropertyNumberFormattingRule
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { PropertyTypeReferenceOrStringConstant } from "./PropertyValueFormattingUtils.js";

const $I = $OntologyId.create("ontology/valueFormatting/PropertyNumberFormattingRule");

/**
 * Numeric notation strategies.
 *
 * @since 0.0.0
 * @category schemas
 */
export const NumberFormatNotation = S.Union([
  S.Literal("STANDARD"),
  S.Literal("SCIENTIFIC"),
  S.Literal("ENGINEERING"),
  S.Literal("COMPACT"),
]).pipe(
  S.annotate(
    $I.annote("NumberFormatNotation", {
      description:
        "Supported notation strategies for number rendering, including standard, scientific, engineering, and compact output.",
    })
  )
);

/**
 * Type for {@link NumberFormatNotation}.
 *
 * @since 0.0.0
 * @category models
 */
export type NumberFormatNotation = typeof NumberFormatNotation.Type;

/**
 * Currency style options derived from notation strategies.
 *
 * @since 0.0.0
 * @category schemas
 */
export const NumberFormatCurrencyStyle = S.Union([S.Literal("STANDARD"), S.Literal("COMPACT")]).pipe(
  S.annotate(
    $I.annote("NumberFormatCurrencyStyle", {
      description: "Currency-specific notation styles supported by number formatting rules.",
    })
  )
);

/**
 * Type for {@link NumberFormatCurrencyStyle}.
 *
 * @since 0.0.0
 * @category models
 */
export type NumberFormatCurrencyStyle = typeof NumberFormatCurrencyStyle.Type;

/**
 * Supported numeric rounding modes.
 *
 * @since 0.0.0
 * @category schemas
 */
export const NumberRoundingMode = S.Union([S.Literal("CEIL"), S.Literal("FLOOR"), S.Literal("ROUND_CLOSEST")]).pipe(
  S.annotate(
    $I.annote("NumberRoundingMode", {
      description: "Rounding behavior used when formatting numeric values.",
    })
  )
);

/**
 * Type for {@link NumberRoundingMode}.
 *
 * @since 0.0.0
 * @category models
 */
export type NumberRoundingMode = typeof NumberRoundingMode.Type;

/**
 * Precision strategies for duration formatting.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DurationPrecision = S.Union([
  S.Literal("DAYS"),
  S.Literal("HOURS"),
  S.Literal("MINUTES"),
  S.Literal("SECONDS"),
  S.Literal("AUTO"),
]).pipe(
  S.annotate(
    $I.annote("DurationPrecision", {
      description: "Duration precision controls used when formatting time duration values.",
    })
  )
);

/**
 * Type for {@link DurationPrecision}.
 *
 * @since 0.0.0
 * @category models
 */
export type DurationPrecision = typeof DurationPrecision.Type;

/**
 * Base input unit for duration values.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DurationBaseValue = S.Union([S.Literal("SECONDS"), S.Literal("MILLISECONDS")]).pipe(
  S.annotate(
    $I.annote("DurationBaseValue", {
      description: "Unit of the raw numeric duration input before formatting.",
    })
  )
);

/**
 * Type for {@link DurationBaseValue}.
 *
 * @since 0.0.0
 * @category models
 */
export type DurationBaseValue = typeof DurationBaseValue.Type;

/**
 * Numeric scaling presets.
 *
 * @since 0.0.0
 * @category schemas
 */
export const NumberScaleType = S.Union([S.Literal("THOUSANDS"), S.Literal("MILLIONS"), S.Literal("BILLIONS")]).pipe(
  S.annotate(
    $I.annote("NumberScaleType", {
      description: "Scale factors used to normalize large numeric values for display.",
    })
  )
);

/**
 * Type for {@link NumberScaleType}.
 *
 * @since 0.0.0
 * @category models
 */
export type NumberScaleType = typeof NumberScaleType.Type;

/**
 * Ratio display variants.
 *
 * @since 0.0.0
 * @category schemas
 */
export const NumberRatioType = S.Union([
  S.Literal("PERCENTAGE"),
  S.Literal("PER_MILLE"),
  S.Literal("BASIS_POINTS"),
]).pipe(
  S.annotate(
    $I.annote("NumberRatioType", {
      description: "Ratio display formats including percentage, per-mille, and basis points.",
    })
  )
);

/**
 * Type for {@link NumberRatioType}.
 *
 * @since 0.0.0
 * @category models
 */
export type NumberRatioType = typeof NumberRatioType.Type;

const NonNegativeInt = S.Int.pipe(
  S.check(S.isGreaterThanOrEqualTo(0)),
  S.annotate(
    $I.annote("NonNegativeInt", {
      description: "Non-negative integer constraint used in number-format precision options.",
    })
  )
);

const OptionalNonNegativeInt = S.optionalKey(NonNegativeInt).annotate(
  $I.annote("OptionalNonNegativeInt", {
    description: "Optional non-negative integer wrapper used for numeric formatting precision and digit constraints.",
  })
);

/**
 * Base numeric formatting options shared across numeric style variants.
 *
 * @since 0.0.0
 * @category models
 */
export class NumberFormatOptions extends S.Class<NumberFormatOptions>($I`NumberFormatOptions`)(
  {
    useGrouping: S.optionalKey(S.Boolean),
    convertNegativeToParenthesis: S.optionalKey(S.Boolean),
    minimumIntegerDigits: OptionalNonNegativeInt,
    minimumFractionDigits: OptionalNonNegativeInt,
    maximumFractionDigits: OptionalNonNegativeInt,
    minimumSignificantDigits: OptionalNonNegativeInt,
    maximumSignificantDigits: OptionalNonNegativeInt,
    notation: S.optionalKey(NumberFormatNotation),
    roundingMode: S.optionalKey(NumberRoundingMode),
  },
  $I.annote("NumberFormatOptions", {
    description:
      "Base options controlling grouping, precision, significant digits, notation, and rounding for number formatting.",
  })
) {}

/**
 * Standard number formatting with configurable options.
 *
 * @since 0.0.0
 * @category models
 */
export class NumberFormatStandard extends S.Class<NumberFormatStandard>($I`NumberFormatStandard`)(
  {
    type: S.Literal("standard"),
    baseFormatOptions: NumberFormatOptions,
  },
  $I.annote("NumberFormatStandard", {
    description: "Default numeric formatting rule using the shared number format options.",
  })
) {}

/**
 * Map integer values to custom strings.
 *
 * @since 0.0.0
 * @category models
 */
export class NumberFormatFixedValues extends S.Class<NumberFormatFixedValues>($I`NumberFormatFixedValues`)(
  {
    type: S.Literal("fixedValues"),
    values: S.Record(S.Number, S.String),
  },
  $I.annote("NumberFormatFixedValues", {
    description: "Formatting rule that maps specific numeric values to predefined display strings.",
  })
) {}

/**
 * Format numbers as currency values.
 *
 * @since 0.0.0
 * @category models
 */
export class NumberFormatCurrency extends S.Class<NumberFormatCurrency>($I`NumberFormatCurrency`)(
  {
    type: S.Literal("currency"),
    baseFormatOptions: NumberFormatOptions,
    style: NumberFormatCurrencyStyle,
    currencyCode: PropertyTypeReferenceOrStringConstant,
  },
  $I.annote("NumberFormatCurrency", {
    description: "Currency formatting rule including style and currency code source configuration.",
  })
) {}

/**
 * Format numbers with standard units supported by Intl.NumberFormat.
 *
 * @since 0.0.0
 * @category models
 */
export class NumberFormatStandardUnit extends S.Class<NumberFormatStandardUnit>($I`NumberFormatStandardUnit`)(
  {
    type: S.Literal("standardUnit"),
    baseFormatOptions: NumberFormatOptions,
    unit: PropertyTypeReferenceOrStringConstant,
  },
  $I.annote("NumberFormatStandardUnit", {
    description: "Formatting rule that renders numeric values with a standard unit identifier.",
  })
) {}

/**
 * Format numbers with custom units.
 *
 * @since 0.0.0
 * @category models
 */
export class NumberFormatCustomUnit extends S.Class<NumberFormatCustomUnit>($I`NumberFormatCustomUnit`)(
  {
    type: S.Literal("customUnit"),
    baseFormatOptions: NumberFormatOptions,
    unit: PropertyTypeReferenceOrStringConstant,
  },
  $I.annote("NumberFormatCustomUnit", {
    description: "Formatting rule that renders numeric values with custom unit text or property-based unit references.",
  })
) {}

/**
 * Prefix and postfix values attached around formatted numbers.
 *
 * @since 0.0.0
 * @category models
 */
export class Affix extends S.Class<Affix>($I`Affix`)(
  {
    prefix: S.optionalKey(PropertyTypeReferenceOrStringConstant),
    postfix: S.optionalKey(PropertyTypeReferenceOrStringConstant),
  },
  $I.annote("Affix", {
    description: "Prefix and postfix text configuration applied around a formatted numeric value.",
  })
) {}

/**
 * Attach text before and/or after the formatted number.
 *
 * @since 0.0.0
 * @category models
 */
export class NumberFormatAffix extends S.Class<NumberFormatAffix>($I`NumberFormatAffix`)(
  {
    type: S.Literal("affix"),
    baseFormatOptions: NumberFormatOptions,
    affix: Affix,
  },
  $I.annote("NumberFormatAffix", {
    description: "Formatting rule that wraps numeric output with configured prefix and/or postfix affixes.",
  })
) {}

/**
 * Human-readable duration formatting style.
 *
 * @since 0.0.0
 * @category models
 */
export class HumanReadableFormat extends S.Class<HumanReadableFormat>($I`HumanReadableFormat`)(
  {
    type: S.Literal("humanReadable"),
    showFullUnits: S.optionalKey(S.Boolean),
  },
  $I.annote("HumanReadableFormat", {
    description: "Duration formatting style that renders human-readable unit text.",
  })
) {}

/**
 * Timecode duration formatting style.
 *
 * @since 0.0.0
 * @category models
 */
export class TimeCodeFormat extends S.Class<TimeCodeFormat>($I`TimeCodeFormat`)(
  {
    type: S.Literal("timecode"),
  },
  $I.annote("TimeCodeFormat", {
    description: "Duration formatting style that renders values as a timecode string.",
  })
) {}

/**
 * Supported duration output styles.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DurationFormatStyle = S.Union([TimeCodeFormat, HumanReadableFormat]).pipe(
  S.annotate(
    $I.annote("DurationFormatStyle", {
      description: "Tagged union defining whether durations are rendered as timecode or human-readable text.",
    })
  )
);

/**
 * Type for {@link DurationFormatStyle}.
 *
 * @since 0.0.0
 * @category models
 */
export type DurationFormatStyle = typeof DurationFormatStyle.Type;

/**
 * Format numeric values representing time durations.
 *
 * @since 0.0.0
 * @category models
 */
export class NumberFormatDuration extends S.Class<NumberFormatDuration>($I`NumberFormatDuration`)(
  {
    type: S.Literal("duration"),
    formatStyle: DurationFormatStyle,
    precision: S.optionalKey(DurationPrecision),
    baseValue: DurationBaseValue,
  },
  $I.annote("NumberFormatDuration", {
    description: "Formatting rule for numeric duration values, including style, precision, and base unit.",
  })
) {}

/**
 * Scale numeric values by the specified factor.
 *
 * @since 0.0.0
 * @category models
 */
export class NumberFormatScale extends S.Class<NumberFormatScale>($I`NumberFormatScale`)(
  {
    type: S.Literal("scale"),
    scaleType: NumberScaleType,
    baseFormatOptions: NumberFormatOptions,
  },
  $I.annote("NumberFormatScale", {
    description: "Formatting rule that scales numeric values (thousands, millions, billions) before display.",
  })
) {}

/**
 * Display values as ratios with different scaling factors.
 *
 * @since 0.0.0
 * @category models
 */
export class NumberFormatRatio extends S.Class<NumberFormatRatio>($I`NumberFormatRatio`)(
  {
    type: S.Literal("ratio"),
    ratioType: NumberRatioType,
    baseFormatOptions: NumberFormatOptions,
  },
  $I.annote("NumberFormatRatio", {
    description: "Formatting rule that renders numeric values as percentage, per-mille, or basis-point ratios.",
  })
) {}

/**
 * Union of all numeric formatting rule variants.
 *
 * @since 0.0.0
 * @category schemas
 */
export const PropertyNumberFormattingRuleType = S.Union([
  NumberFormatStandard,
  NumberFormatFixedValues,
  NumberFormatCurrency,
  NumberFormatStandardUnit,
  NumberFormatCustomUnit,
  NumberFormatAffix,
  NumberFormatDuration,
  NumberFormatScale,
  NumberFormatRatio,
]).pipe(
  S.annotate(
    $I.annote("PropertyNumberFormattingRuleType", {
      description: "Tagged union of all supported numeric value formatting variants for ontology properties.",
    })
  )
);

/**
 * Type for {@link PropertyNumberFormattingRuleType}.
 *
 * @since 0.0.0
 * @category models
 */
export type PropertyNumberFormattingRuleType = typeof PropertyNumberFormattingRuleType.Type;

/**
 * Top-level formatting rule for ontology properties with wire type `number`.
 *
 * @since 0.0.0
 * @category models
 */
export class PropertyNumberFormattingRule extends S.Class<PropertyNumberFormattingRule>(
  $I`PropertyNumberFormattingRule`
)(
  {
    type: S.Literal("number"),
    numberType: PropertyNumberFormattingRuleType,
  },
  $I.annote("PropertyNumberFormattingRule", {
    description: "Formatting configuration wrapper for number-typed ontology properties.",
  })
) {}
