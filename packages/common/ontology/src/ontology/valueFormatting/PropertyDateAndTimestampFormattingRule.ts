/**
 * Formatting rules for date and timestamp ontology properties.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/valueFormatting/PropertyDateAndTimestampFormattingRule
 */
import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { PropertyTypeReferenceOrStringConstant } from "./PropertyValueFormattingUtils.js";

const $I = $OntologyId.create("ontology/valueFormatting/PropertyDateAndTimestampFormattingRule");

/**
 * Built-in localized date/time format identifiers.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DatetimeLocalizedFormatType = LiteralKit([
  "DATE_FORMAT_RELATIVE_TO_NOW",
  "DATE_FORMAT_DATE",
  "DATE_FORMAT_YEAR_AND_MONTH",
  "DATE_FORMAT_DATE_TIME",
  "DATE_FORMAT_DATE_TIME_SHORT",
  "DATE_FORMAT_TIME",
  "DATE_FORMAT_ISO_INSTANT",
]).annotate(
  $I.annote("DatetimeLocalizedFormatType", {
    description: "Supported localized date and time format presets for ontology date and timestamp properties.",
  })
);

/**
 * Type for {@link DatetimeLocalizedFormatType}.
 *
 * @since 0.0.0
 * @category models
 */
export type DatetimeLocalizedFormatType = typeof DatetimeLocalizedFormatType.Type;

/**
 * Fixed timezone display configuration.
 *
 * @since 0.0.0
 * @category models
 */
export class DatetimeTimezoneStatic extends S.Class<DatetimeTimezoneStatic>($I`DatetimeTimezoneStatic`)(
  {
    type: S.tag("static"),
    zoneId: PropertyTypeReferenceOrStringConstant,
  },
  $I.annote("DatetimeTimezoneStatic", {
    description: "Uses a fixed timezone identifier or property reference when formatting timestamp values.",
  })
) {}

/**
 * Use the user's local timezone.
 *
 * @since 0.0.0
 * @category models
 */
export class DatetimeTimezoneUser extends S.Class<DatetimeTimezoneUser>($I`DatetimeTimezoneUser`)(
  {
    type: S.tag("user"),
  },
  $I.annote("DatetimeTimezoneUser", {
    description: "Uses the viewing user's local timezone when formatting timestamp values.",
  })
) {}

/**
 * Timezone selection strategy for timestamp formatting.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DatetimeTimezone = S.Union([DatetimeTimezoneStatic, DatetimeTimezoneUser]).pipe(
  S.toTaggedUnion("type"),
  S.annotate(
    $I.annote("DatetimeTimezone", {
      description:
        "Tagged union describing whether timestamps are formatted with a static timezone or the user's timezone.",
    })
  )
);

/**
 * Type for {@link DatetimeTimezone}.
 *
 * @since 0.0.0
 * @category models
 */
export type DatetimeTimezone = typeof DatetimeTimezone.Type;

/**
 * Predefined localized date/time formats.
 *
 * @since 0.0.0
 * @category models
 */
export class DatetimeLocalizedFormat extends S.Class<DatetimeLocalizedFormat>($I`DatetimeLocalizedFormat`)(
  {
    type: S.tag("localizedFormat"),
    format: DatetimeLocalizedFormatType,
  },
  $I.annote("DatetimeLocalizedFormat", {
    description: "Date/time formatting rule that uses one of the supported localized format presets.",
  })
) {}

/**
 * A custom date format pattern.
 *
 * @since 0.0.0
 * @category models
 */
export class DatetimeStringFormat extends S.Class<DatetimeStringFormat>($I`DatetimeStringFormat`)(
  {
    type: S.tag("stringFormat"),
    pattern: S.String,
  },
  $I.annote("DatetimeStringFormat", {
    description: "Date/time formatting rule that uses a custom formatting pattern string.",
  })
) {}

/**
 * Supported date/time format strategies.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DatetimeFormat = S.Union([DatetimeLocalizedFormat, DatetimeStringFormat]).pipe(
  S.toTaggedUnion("type"),
  S.annotate(
    $I.annote("DatetimeFormat", {
      description:
        "Tagged union describing whether a date/time value is formatted with a localized preset or a custom string pattern.",
    })
  )
);

/**
 * Type for {@link DatetimeFormat}.
 *
 * @since 0.0.0
 * @category models
 */
export type DatetimeFormat = typeof DatetimeFormat.Type;

/**
 * Formatting rule for properties with wire type `date`.
 *
 * @since 0.0.0
 * @category models
 */
export class PropertyDateFormattingRule extends S.Class<PropertyDateFormattingRule>($I`PropertyDateFormattingRule`)(
  {
    type: S.tag("date"),
    format: DatetimeFormat,
  },
  $I.annote("PropertyDateFormattingRule", {
    description: "Formatting configuration for ontology properties with wire type date.",
  })
) {}

/**
 * Formatting rule for properties with wire type `timestamp`.
 *
 * @since 0.0.0
 * @category models
 */
export class PropertyTimestampFormattingRule extends S.Class<PropertyTimestampFormattingRule>(
  $I`PropertyTimestampFormattingRule`
)(
  {
    type: S.tag("timestamp"),
    format: DatetimeFormat,
    displayTimezone: DatetimeTimezone,
  },
  $I.annote("PropertyTimestampFormattingRule", {
    description:
      "Formatting configuration for ontology properties with wire type timestamp, including timezone display strategy.",
  })
) {}
