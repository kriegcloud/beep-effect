import type { EntityId } from "@beep/schema/identity";
import type { UnsafeTypes } from "@beep/types";
import type * as M from "@effect/sql/Model";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { DatabaseError } from "./errors";

const tableNameToSpanPrefix = <TableName extends string>(tableName: TableName): string => {
  const name = A.join("")(A.map(Str.split("_")(tableName), Str.capitalize));
  return `${name}Repo`;
};

/**
 * Return type for the base repository operations.
 *
 * @category Repo
 * @since 0.1.0
 */
export interface BaseRepo<
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
> {
  readonly insert: (
    insert: Model["insert"]["Type"]
  ) => Effect.Effect<Model["Type"], DatabaseError, Model["Context"] | Model["insert"]["Context"]>;
  readonly insertVoid: (
    insert: Model["insert"]["Type"]
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]>;
  readonly update: (
    update: Model["update"]["Type"]
  ) => Effect.Effect<Model["Type"], DatabaseError, Model["Context"] | Model["update"]["Context"]>;
  readonly updateVoid: (
    update: Model["update"]["Type"]
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["update"]["Context"]>;
  readonly findById: (
    id: S.Schema.Type<Model["fields"][Id]>
  ) => Effect.Effect<O.Option<Model["Type"]>, DatabaseError, Model["Context"] | S.Schema.Context<Model["fields"][Id]>>;
  readonly delete: (
    id: S.Schema.Type<Model["fields"][Id]>
  ) => Effect.Effect<void, DatabaseError, S.Schema.Context<Model["fields"][Id]>>;
  readonly insertManyVoid: (
    insert: A.NonEmptyReadonlyArray<Model["insert"]["Type"]>
  ) => Effect.Effect<void, DatabaseError, Model["Context"] | Model["insert"]["Context"]>;
}

type MakeBaseRepoEffect<
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
> = Effect.Effect<BaseRepo<Model, Id>, never, SqlClient.SqlClient>;

const makeBaseRepo = <
  TableName extends string,
  Brand extends string,
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
>(
  model: Model,
  options: {
    idSchema: EntityId.EntityId.SchemaInstance<TableName, Brand>;
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
        Effect.catchTags({
          NoSuchElementException: (e) => Effect.die(e),
          ParseError: (e) => Effect.die(e),
        }),
        Effect.tapErrorCause((c) =>
          Effect.gen(function* () {
            yield* Effect.log("CAUSE: ", JSON.stringify(c, null, 2));
            const failure = yield* Cause.failureOption(c);
            yield* Effect.log("FAILURE: ", JSON.stringify(failure, null, 2));
          })
        ),
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.insert`, {
          captureStackTrace: false,
          attributes: { insert },
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
        Effect.catchTag("ParseError", (e) => Effect.die(e)),
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.insertManyVoid`, {
          captureStackTrace: false,
          attributes: { insert },
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
        Effect.catchTag("ParseError", (e) => Effect.die(e)),
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.insertVoid`, {
          captureStackTrace: false,
          attributes: { insert },
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
        Effect.catchTags({
          ParseError: (e) => Effect.die(e),
          NoSuchElementException: (e) => Effect.die(e),
        }),
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.update`, {
          captureStackTrace: false,
          attributes: { update },
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
        Effect.catchTag("ParseError", (e) => Effect.die(e)),
        Effect.mapError(DatabaseError.$match),
        Effect.withSpan(`${spanPrefix}.updateVoid`, {
          captureStackTrace: false,
          attributes: { update },
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
        Effect.catchTag("ParseError", (e) => Effect.die(e)),
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

    const del = (
      id: S.Schema.Type<Model["fields"][Id]>
    ): Effect.Effect<void, DatabaseError, S.Schema.Context<Model["fields"][Id]>> =>
      deleteSchema(id).pipe(
        Effect.catchTag("ParseError", (e) => Effect.die(e)),
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
      delete: del,
    };
  });

/**
 * Property signature for entity ID fields with a default value.
 * Matches the shape produced by `EntityId.modelIdSchema`.
 *
 * @category Repo
 * @since 0.1.0
 */
export type EntityIdPropertySignature = S.PropertySignature<":", string, never, "?:", string, true, unknown>;

/**
 * Model constraint requiring an `id` field in type, update, and fields.
 * Uses a loose constraint that preserves the actual model types.
 *
 * @category Repo
 * @since 0.1.0
 */
export type ModelWithId = M.Any & {
  readonly Type: { readonly id: string };
  readonly update: { readonly Type: { readonly id: string } };
  readonly fields: { readonly id: EntityIdPropertySignature };
};

/**
 * Combined repository type including base operations and optional extensions.
 * Uses `M.Any` constraint instead of `ModelWithId` to preserve variance and
 * avoid type erasure in function parameters.
 *
 * @category Repo
 * @since 0.1.0
 */
export type Repo<
  Model extends M.Any,
  TExtra extends Record<string, UnsafeTypes.UnsafeAny> = NonNullable<unknown>,
> = BaseRepo<Model, "id"> & TExtra;

/**
 * Effect type for creating a repository service with standard CRUD operations and optional extensions.
 * Uses `M.Any` constraint instead of `ModelWithId` to preserve variance and
 * avoid type erasure in function parameters.
 *
 * @category Repo
 * @since 0.1.0
 */
export type ServiceEffect<
  Model extends M.Any,
  SE,
  SR,
  TExtra extends Record<string, UnsafeTypes.UnsafeAny> = NonNullable<unknown>,
> = Effect.Effect<Repo<Model, TExtra>, SE, SqlClient.SqlClient | SR>;
/**
 * Creates a repository with standard CRUD operations and optional extensions.
 *
 * @category Repo
 * @since 0.1.0
 */
export const make = <
  TableName extends string,
  Brand extends string,
  Model extends ModelWithId,
  SE,
  SR,
  TExtra extends Record<string, UnsafeTypes.UnsafeAny> = NonNullable<unknown>,
>(
  idSchema: EntityId.EntityId.SchemaInstance<TableName, Brand>,
  model: Model,
  maker?: Effect.Effect<TExtra, SE, SR> | undefined
): ServiceEffect<Model, SE, SR, TExtra> =>
  Effect.flatMap(
    Effect.all([
      O.fromNullable(maker).pipe(O.getOrElse(() => Effect.succeed({} as TExtra))),
      makeBaseRepo(model, { idColumn: idSchema.publicIdColumnName, idSchema: idSchema }),
    ]),
    ([extra, baseRepo]) =>
      Effect.succeed({
        ...baseRepo,
        ...extra,
      })
  );
