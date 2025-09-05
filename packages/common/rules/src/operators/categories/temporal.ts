import { CategoryFactory } from "@beep/rules/internal/OperatorFactory";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export const Factory = new CategoryFactory({
  category: "temporal",
  description: "temporal operators",
  fields: {
    field: BS.JsonPath,
  },
});

const commonNoValue = {
  isNegatable: true,
  requiresValue: false,
  fields: {},
};

const commonDateValue = {
  isNegatable: true,
  requiresValue: true,
};

const commonDurationValue = {
  isNegatable: true,
  requiresValue: true,
};

/** Same-period operators (no value required) */
export const IsSameHour = Factory.createKind({
  operator: "is_same_hour",
  description: "Checks if the field value is in the same hour",
  symbol: "≡ hour",
  ...commonNoValue,
});

export const IsSameDay = Factory.createKind({
  operator: "is_same_day",
  description: "Checks if the field value is on the same day",
  symbol: "≡ day",
  ...commonNoValue,
});

export const IsSameWeek = Factory.createKind({
  operator: "is_same_week",
  description: "Checks if the field value is in the same week",
  symbol: "≡ week",
  ...commonNoValue,
});

export const IsSameMonth = Factory.createKind({
  operator: "is_same_month",
  description: "Checks if the field value is in the same month",
  symbol: "≡ month",
  ...commonNoValue,
});

export const IsSameYear = Factory.createKind({
  operator: "is_same_year",
  description: "Checks if the field value is in the same year",
  symbol: "≡ year",
  ...commonNoValue,
});

/** Boundary comparison operators (require a date/time value) */
export const Before = Factory.createKind({
  operator: "before",
  description: "Checks if the field value is before the constraint value",
  symbol: "<t",
  ...commonDateValue,
  fields: {
    value: BS.DateTimeUtcFromAllAcceptable,
  },
});

export const OnOrBefore = Factory.createKind({
  operator: "on_or_before",
  description: "Checks if the field value is on or before the constraint value",
  symbol: "≤t",
  ...commonDateValue,
  fields: {
    value: BS.DateTimeUtcFromAllAcceptable,
  },
});

export const After = Factory.createKind({
  operator: "after",
  description: "Checks if the field value is after the constraint value",
  symbol: ">t",
  ...commonDateValue,
  fields: {
    value: BS.DateTimeUtcFromAllAcceptable,
  },
});

export const OnOrAfter = Factory.createKind({
  operator: "on_or_after",
  description: "Checks if the field value is on or after the constraint value",
  symbol: "≥t",
  ...commonDateValue,
  fields: {
    value: BS.DateTimeUtcFromAllAcceptable,
  },
});

/** Window operators (require a duration) */
export const WithinLast = Factory.createKind({
  operator: "within_last",
  description: "Checks if the field value is within the last duration",
  symbol: "∈ (now−Δ, now]",
  ...commonDurationValue,
  fields: {
    duration: S.DurationFromSelf,
  },
});

export const WithinNext = Factory.createKind({
  operator: "within_next",
  description: "Checks if the field value is within the next duration",
  symbol: "∈ [now, now+Δ)",
  ...commonDurationValue,
  fields: {
    duration: S.DurationFromSelf,
  },
});

/** Weekday/weekend and quarter (no value required) */
export const IsWeekday = Factory.createKind({
  operator: "is_weekday",
  description: "Checks if the field value is on a weekday",
  symbol: "Mon–Fri",
  ...commonNoValue,
});

export const IsWeekend = Factory.createKind({
  operator: "is_weekend",
  description: "Checks if the field value is on a weekend",
  symbol: "Sat/Sun",
  ...commonNoValue,
});

export const IsSameQuarter = Factory.createKind({
  operator: "is_same_quarter",
  description: "Checks if the field value is in the same quarter",
  symbol: "≡ quarter",
  ...commonNoValue,
});
