import type * as VariantSchema from "@effect/experimental/VariantSchema";
import * as M from "@effect/sql/Model";
import type * as DateTime from "effect/DateTime";
import type * as S from "effect/Schema";

/**
 * Optimal DateTime schemas for PostgresSQL with timezone support
 */
const dateTimeJsonSchemaAnnotations = (description?: string) =>
  ({
    jsonSchema: {
      type: "string",
      format: "datetime-utc",
    },
    description,
  }) as const;

export const DateTimeFromDate = (params?: { description?: string }) =>
  M.DateTimeFromDate.pipe(
    M.fieldEvolve({
      select: (variant: M.DateTimeFromDate) => variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      insert: (variant: M.DateTimeFromDate) => variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      update: (variant: M.DateTimeFromDate) => variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      json: (variant: M.DateTimeFromDate) => variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      jsonCreate: (variant: M.DateTimeFromDate) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      jsonUpdate: (variant: M.DateTimeFromDate) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
    })
  );
export const DateTimeInsertFromDate = (params?: { description?: string }) =>
  M.DateTimeInsertFromDate.pipe(
    M.fieldEvolve({
      select: (variant: M.DateTimeFromDate) => variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      insert: (variant: VariantSchema.Overrideable<DateTime.Utc, globalThis.Date, never>) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      json: (variant: S.transformOrFail<S.SchemaClass<string, string, never>, typeof S.DateTimeUtcFromSelf, never>) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
    })
  );

export const DateTimeUpdateFromDate = (params?: { description?: string }) =>
  M.DateTimeUpdateFromDate.pipe(
    M.fieldEvolve({
      select: (variant: M.DateTimeFromDate) => variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      insert: (variant: VariantSchema.Overrideable<DateTime.Utc, globalThis.Date, never>) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      update: (variant: VariantSchema.Overrideable<DateTime.Utc, globalThis.Date, never>) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      json: (variant: S.transformOrFail<S.SchemaClass<string, string, never>, typeof S.DateTimeUtcFromSelf, never>) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
    })
  );

export const OptionFromDateTime = (params?: { description?: string }) => M.FieldOption(DateTimeFromDate(params));
