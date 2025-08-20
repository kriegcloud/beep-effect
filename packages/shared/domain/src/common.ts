import type * as VariantSchema from "@effect/experimental/VariantSchema";
import * as M from "@effect/sql/Model";
import type * as DateTime from "effect/DateTime";
import * as S from "effect/Schema";
import {SharedEntityIds} from "./EntityIds";

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
      select: (variant: M.DateTimeFromDate) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      insert: (variant: M.DateTimeFromDate) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      update: (variant: M.DateTimeFromDate) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      json: (variant: M.DateTimeFromDate) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      jsonCreate: (variant: M.DateTimeFromDate) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      jsonUpdate: (variant: M.DateTimeFromDate) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
    }),
  );

export const DateTimeInsertFromDate = (params?: { description?: string }) =>
  M.DateTimeInsertFromDate.pipe(
    M.fieldEvolve({
      select: (variant: M.DateTimeFromDate) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      insert: (
        variant: VariantSchema.Overrideable<
          DateTime.Utc,
          globalThis.Date,
          never
        >,
      ) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      json: (
        variant: S.transformOrFail<
          S.SchemaClass<string, string, never>,
          typeof S.DateTimeUtcFromSelf,
          never
        >,
      ) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
    }),
  );

export const DateTimeUpdateFromDate = (params?: { description?: string }) =>
  M.DateTimeUpdateFromDate.pipe(
    M.fieldEvolve({
      select: (variant: M.DateTimeFromDate) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      insert: (
        variant: VariantSchema.Overrideable<
          DateTime.Utc,
          globalThis.Date,
          never
        >,
      ) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      update: (
        variant: VariantSchema.Overrideable<
          DateTime.Utc,
          globalThis.Date,
          never
        >,
      ) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
      json: (
        variant: S.transformOrFail<
          S.SchemaClass<string, string, never>,
          typeof S.DateTimeUtcFromSelf,
          never
        >,
      ) =>
        variant.annotations(dateTimeJsonSchemaAnnotations(params?.description)),
    }),
  );

const OptionFromDateTime = (params?: { description?: string }) =>
  M.FieldOption(DateTimeFromDate(params));

/**
 * Audit columns optimized for PostgreSQL timestamp with timezone:
 * - createdAt: Auto-set on insert, omitted from updates
 * - updatedAt: Auto-set on both insert and update operations
 * - deletedAt: Optional field for soft delete functionality
 */
export const auditColumns = {
  createdAt: DateTimeInsertFromDate(),
  updatedAt: DateTimeUpdateFromDate(),
  deletedAt: OptionFromDateTime(),
} as const;

export const userTrackingColumns = {
  createdBy: S.String,
  updatedBy: S.String,
  deletedBy: S.String,
} as const;

export const globalColumns = {
  ...auditColumns,
  ...userTrackingColumns,
  // Optimistic locking
  version: S.Int.pipe(S.greaterThanOrEqualTo(1)),
  // Optional: Enhanced traceability
  source: S.String,
} as const;

export const defaultColumns = {
  ...globalColumns,
  organizationId: SharedEntityIds.OrganizationId,
} as const;
