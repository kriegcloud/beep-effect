/**
 * DbRepo runtime factory.
 *
 * This module provides the *implementation* for creating base SQL-backed repositories.
 *
 * Type contracts live in `@beep/shared-domain/factories` so domain packages can reference
 * repo shapes without importing server implementations.
 *
 * @module shared-server/factories/db-repo
 * @since 0.1.0
 * @category Repo
 */

import type { EntityId } from "@beep/schema/identity";
import { DatabaseError } from "@beep/shared-domain/errors";
import type { DbRepo as DbRepoTypes } from "@beep/shared-domain/factories";
import type { UnsafeTypes } from "@beep/types";
import type * as M from "@effect/sql/Model";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

/**
 * Type-level repo surface derived from an `@effect/sql/Model`.
 *
 * Re-exported from `@beep/shared-domain` to keep a single source of truth for signatures,
 * while allowing consumers to import types from `@beep/shared-server/factories` alongside `make`.
 *
 * @since 0.1.0
 * @category Repo
 */
export type BaseRepo<
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
> = DbRepoTypes.BaseRepo<Model, Id>;

/**
 * Combined repository type including base operations and optional extensions.
 *
 * @since 0.1.0
 * @category Repo
 */
export type DbRepoSuccess<
  Model extends M.Any,
  TExtra extends Record<string, UnsafeTypes.UnsafeAny> = NonNullable<unknown>,
> = DbRepoTypes.DbRepoSuccess<Model, TExtra>;

/**
 * Effect type for creating a repository with standard CRUD operations and optional extensions.
 *
 * @since 0.1.0
 * @category Repo
 */
export type DbRepo<
  Model extends M.Any,
  SE,
  SR,
  TExtra extends Record<string, UnsafeTypes.UnsafeAny> = NonNullable<unknown>,
> = DbRepoTypes.DbRepo<Model, SE, SR, TExtra>;

/**
 * Specification object for deriving a repository method signature from schemas.
 *
 * Re-exported from `@beep/shared-domain` so consumers can import types from
 * `@beep/shared-server/factories` alongside `make`.
 *
 * @since 0.1.0
 * @category Repo
 */
export type MethodSpec = DbRepoTypes.MethodSpec;

/**
 * Error channel for `Method<...>`.
 *
 * @since 0.1.0
 * @category Repo
 */
export type MethodError<Spec extends MethodSpec> = DbRepoTypes.MethodError<Spec>;

/**
 * Environment requirements for `Method<...>`.
 *
 * @since 0.1.0
 * @category Repo
 */
export type MethodContext<Spec extends MethodSpec> = DbRepoTypes.MethodContext<Spec>;

/**
 * Derives a less-verbose repo method signature from schemas.
 *
 * @since 0.1.0
 * @category Repo
 */
export type Method<Spec extends MethodSpec> = DbRepoTypes.Method<Spec>;

const tableNameToSpanPrefix = <TableName extends string>(tableName: TableName): string => {
  const name = A.join("")(A.map(Str.split("_")(tableName), Str.capitalize));
  return `${name}Repo`;
};

const isRecord = (u: unknown): u is Record<string, unknown> => typeof u === "object" && u !== null && !Array.isArray(u);

const toSpanScalar = (u: unknown): string | number | boolean | undefined => {
  if (typeof u === "string" || typeof u === "number" || typeof u === "boolean") return u;
  if (typeof u === "bigint") return String(u);
  return undefined;
};

/**
 * Summarize a write payload for span attributes without recording raw values.
 *
 * IDs are safe to record (per repo guardrails), but other field values may contain PII
 * (e.g. comment/document content) and must not be attached to spans.
 */
const summarizeWritePayload = (
  prefix: string,
  payload: unknown
): Record<string, string | number | boolean | undefined> => {
  if (Array.isArray(payload)) {
    const first = payload[0];
    const firstKeys = isRecord(first) ? Object.keys(first).sort() : [];
    return {
      [`${prefix}.rows`]: payload.length,
      [`${prefix}.firstKeyCount`]: firstKeys.length,
      [`${prefix}.firstKeys`]: firstKeys.join(","),
    };
  }

  if (isRecord(payload)) {
    const keys = Object.keys(payload).sort();
    return {
      [`${prefix}.keyCount`]: keys.length,
      [`${prefix}.keys`]: keys.join(","),
      [`${prefix}.id`]: toSpanScalar(payload.id),
    };
  }

  return {
    [`${prefix}.type`]: typeof payload,
  };
};

type MakeBaseRepoEffect<
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
> = Effect.Effect<DbRepoTypes.BaseRepo<Model, Id>, never, SqlClient.SqlClient>;

const makeBaseRepo = <
  TableName extends string,
  Brand extends string,
  const LinkedActions extends A.NonEmptyReadonlyArray<string>,
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
>(
  model: Model,
  options: {
    idSchema: EntityId.EntityId<TableName, Brand, LinkedActions>;
    idColumn: Id;
  }
): MakeBaseRepoEffect<Model, Id> =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    const tableName = options.idSchema.tableName;
    const spanPrefix = tableNameToSpanPrefix(tableName);
    const idColumn = options.idColumn as string;

    const insertSchema = SqlSchema.single({
      Request: model.insert,
      Result: model,
      execute: (request) => sql`insert into ${sql(tableName)} ${sql.insert(request).returning("*")}`,
    });

    const insert = (
      insert: Model["insert"]["Type"]
    ): Effect.Effect<Model["Type"], DatabaseError, Model["Context"] | Model["insert"]["Context"]> =>
      insertSchema(insert).pipe(
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.insert`, {
          captureStackTrace: false,
          attributes: summarizeWritePayload("insert", insert),
        })
      );

    const insertManyRequestSchema = S.NonEmptyArray(model.insert);

    const insertManyVoidSchema = SqlSchema.void({
      Request: insertManyRequestSchema,
      execute: (request) => sql`
          insert into ${sql(tableName)} ${sql.insert(request)}
      `,
    });

    const insertManyVoid = (
      insert: A.NonEmptyReadonlyArray<Model["insert"]["Type"]>
    ): Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]> =>
      insertManyVoidSchema(insert).pipe(
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.insertManyVoid`, {
          captureStackTrace: false,
          attributes: summarizeWritePayload("insertMany", insert),
        })
      );

    const insertVoidSchema = SqlSchema.void({
      Request: model.insert,
      execute: (request) => sql`insert into ${sql(tableName)} ${sql.insert(request)}`,
    });

    const insertVoid = (
      insert: Model["insert"]["Type"]
    ): Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]> =>
      insertVoidSchema(insert).pipe(
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.insertVoid`, {
          captureStackTrace: false,
          attributes: summarizeWritePayload("insertVoid", insert),
        })
      );

    const updateSchema = SqlSchema.single({
      Request: model.update,
      Result: model,
      execute: (request) =>
        sql`
            update ${sql(tableName)}
            set ${sql.update(request, [idColumn])}
            where ${sql(idColumn)} = ${request[idColumn]} returning *
        `,
    });

    const update = (
      update: Model["update"]["Type"]
    ): Effect.Effect<Model["Type"], DatabaseError, Model["Context"] | Model["update"]["Context"]> =>
      updateSchema(update).pipe(
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.update`, {
          captureStackTrace: false,
          attributes: {
            id: isRecord(update) ? toSpanScalar(update[idColumn]) : undefined,
            ...summarizeWritePayload("update", update),
          },
        })
      );

    const updateVoidSchema = SqlSchema.void({
      Request: model.update,
      execute: (request) =>
        sql`
            update ${sql(tableName)}
            set ${sql.update(request, [idColumn])}
            where ${sql(idColumn)} = ${request[idColumn]}
        `,
    });

    const updateVoid = (
      update: Model["update"]["Type"]
    ): Effect.Effect<void, DatabaseError, Model["Context"] | Model["update"]["Context"]> =>
      updateVoidSchema(update).pipe(
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.updateVoid`, {
          captureStackTrace: false,
          attributes: {
            id: isRecord(update) ? toSpanScalar(update[idColumn]) : undefined,
            ...summarizeWritePayload("updateVoid", update),
          },
        })
      );

    const findByIdSchema = SqlSchema.findOne({
      Request: options.idSchema,
      Result: model,
      execute: (id) => sql`
          select *
          from ${sql(tableName)}
          where ${sql(idColumn)} = ${id}
      `,
    });

    const findById = (
      id: S.Schema.Type<Model["fields"][Id]>
    ): Effect.Effect<
      O.Option<Model["Type"]>,
      DatabaseError,
      Model["Context"] | S.Schema.Context<Model["fields"][Id]>
    > =>
      findByIdSchema(id).pipe(
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.findById`, {
          captureStackTrace: false,
          attributes: { id },
        })
      );

    const deleteSchema = SqlSchema.void({
      Request: options.idSchema,
      execute: (id) => sql`
          delete
          from ${sql(tableName)}
          where ${sql(idColumn)} = ${id}
      `,
    });

    const delete_ = (
      id: S.Schema.Type<Model["fields"][Id]>
    ): Effect.Effect<void, DatabaseError, S.Schema.Context<Model["fields"][Id]>> =>
      deleteSchema(id).pipe(
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.delete`, {
          captureStackTrace: false,
          attributes: { id },
        })
      );
    return {
      insertManyVoid,
      insert,
      insertVoid,
      update,
      updateVoid,
      findById,
      delete: delete_,
    };
  });
/**
 * Creates a repository with standard CRUD operations and optional extensions.
 *
 * @category Repo
 * @since 0.1.0
 */
export const make = <
  TableName extends string,
  Brand extends string,
  const LinkedActions extends A.NonEmptyReadonlyArray<string>,
  Model extends M.Any,
  SE,
  SR,
  TExtra extends Record<string, UnsafeTypes.UnsafeAny> = NonNullable<unknown>,
>(
  idSchema: EntityId.EntityId<TableName, Brand, LinkedActions>,
  model: Model,
  maker?: Effect.Effect<TExtra, SE, SR> | undefined
): DbRepoTypes.DbRepo<Model, SE, SR, TExtra> =>
  Effect.flatMap(
    Effect.all([
      O.fromNullable(maker).pipe(O.getOrElse(() => Effect.succeed({} as TExtra))),
      makeBaseRepo(model, { idColumn: "id" as const, idSchema: idSchema }),
    ]),
    ([extra, baseRepo]) =>
      Effect.succeed({
        ...baseRepo,
        ...extra,
      })
  );
