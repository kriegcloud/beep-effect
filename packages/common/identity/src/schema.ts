import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
export const ModuleCharacters = S.String.pipe(
  S.pattern(/^[A-Za-z0-9_-]+$/, {
    message: () => "Module segments must contain only alphanumeric characters, hyphens, or underscores.",
  })
);
export const ModuleLeadingAlpha = S.String.pipe(
  S.pattern(/^[A-Za-z]/, {
    message: () => "Module segments must start with an alphabetic character to create valid accessors.",
  })
);

// Base schemas
export const Segment = S.String.pipe(
  S.filter((value) => F.pipe(value, Str.isNonEmpty), {
    message: () => "Identity segments cannot be empty.",
  }),
  S.filter((value) => !F.pipe(value, Str.startsWith("/")), {
    message: () => 'Identity segments cannot start with "/".',
  }),
  S.filter((value) => !F.pipe(value, Str.endsWith("/")), {
    message: () => 'Identity segments cannot end with "/".',
  })
);
export type SegmentType = S.Schema.Type<typeof Segment>;

export const ModuleSegment = Segment.pipe(
  S.pattern(/^[A-Za-z]/, {
    message: () => "Module segments must start with an alphabetic character to create valid accessors.",
  }),
  S.pattern(/^[A-Za-z0-9_-]+$/, {
    message: () => "Module segments must contain only alphanumeric characters, hyphens, or underscores.",
  }),
  S.brand("ModuleSegment")
);
export type ModuleSegmentType = S.Schema.Type<typeof ModuleSegment>;

export const BaseSegment = S.String.pipe(
  S.filter((value) => F.pipe(value, Str.isNonEmpty), {
    message: () => "Identity bases cannot be empty.",
  }),
  S.pattern(/^[A-Za-z0-9](?:[A-Za-z0-9_-]*[A-Za-z0-9])?$/, {
    message: () =>
      "Identity bases must use alphanumeric, hyphen, or underscore characters and start/end with alphanumeric.",
  }),
  S.brand("BaseSegment")
);
export type BaseSegmentType = S.Schema.Type<typeof BaseSegment>;

// Tagged errors
export class InvalidSegmentError extends S.TaggedError<InvalidSegmentError>("InvalidSegmentError")(
  "InvalidSegmentError",
  {
    value: S.String,
    reason: S.optional(S.String),
  }
) {
  override get message(): string {
    return this.reason ?? `Identity segments are invalid: ${this.value}`;
  }
}

export class InvalidModuleSegmentError extends S.TaggedError<InvalidModuleSegmentError>("InvalidModuleSegmentError")(
  "InvalidModuleSegmentError",
  {
    value: S.String,
    reason: S.optional(S.String),
  }
) {
  override get message(): string {
    return this.reason ?? `Module segments are invalid: ${this.value}`;
  }
}

export class InvalidBaseError extends S.TaggedError<InvalidBaseError>("InvalidBaseError")("InvalidBaseError", {
  value: S.String,
  reason: S.optional(S.String),
}) {
  override get message(): string {
    return this.reason ?? `Identity bases are invalid: ${this.value}`;
  }
}
