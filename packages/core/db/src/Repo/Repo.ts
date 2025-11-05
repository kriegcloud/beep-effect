import type { EntityId } from "@beep/schema/EntityId";
import type { UnsafeTypes } from "@beep/types";
import type * as M from "@effect/sql/Model";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import type * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { DbError } from "../errors";

const tableNameToSpanPrefix = <TableName extends string>(tableName: TableName) => {
  const name = A.join("")(A.map(Str.split("_")(tableName), Str.capitalize));
  return `${name}Repo`;
};
const makeBaseRepo = <
  TableName extends string,
  Brand extends string,
  Model extends M.Any,
  Id extends keyof Model["Type"] & keyof Model["update"]["Type"] & keyof Model["fields"],
>(
  model: Model,
  options: {
    idSchema: EntityId.EntityIdSchemaInstance<TableName, Brand>;
    idColumn: Id;
  }
): Effect.Effect<
  {
    readonly insert: (
      insert: Model["insert"]["Type"]
    ) => Effect.Effect<Model["Type"], DbError, Model["Context"] | Model["insert"]["Context"]>;
    readonly insertVoid: (
      insert: Model["insert"]["Type"]
    ) => Effect.Effect<void, DbError, Model["Context"] | Model["insert"]["Context"]>;
    readonly update: (
      update: Model["update"]["Type"]
    ) => Effect.Effect<Model["Type"], DbError, Model["Context"] | Model["update"]["Context"]>;
    readonly updateVoid: (
      update: Model["update"]["Type"]
    ) => Effect.Effect<void, DbError, Model["Context"] | Model["update"]["Context"]>;
    readonly findById: (
      id: S.Schema.Type<Model["fields"][Id]>
    ) => Effect.Effect<O.Option<Model["Type"]>, DbError, Model["Context"] | S.Schema.Context<Model["fields"][Id]>>;
    readonly delete: (
      id: S.Schema.Type<Model["fields"][Id]>
    ) => Effect.Effect<void, DbError, S.Schema.Context<Model["fields"][Id]>>;
    readonly insertManyVoid: (
      insert: A.NonEmptyReadonlyArray<Model["insert"]["Type"]>
    ) => Effect.Effect<void, DbError, Model["Context"] | Model["insert"]["Context"]>;
  },
  never,
  SqlClient.SqlClient
> =>
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
    ): Effect.Effect<Model["Type"], DbError, Model["Context"] | Model["insert"]["Context"]> =>
      insertSchema(insert).pipe(
        Effect.catchTags({
          NoSuchElementException: (e) => Effect.die(e),
          ParseError: (e) => Effect.die(e),
        }),
        Effect.mapError(DbError.match),
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
    ): Effect.Effect<void, DbError, Model["Context"] | Model["insert"]["Context"]> =>
      insertManyVoidSchema(insert).pipe(
        Effect.catchTag("ParseError", (e) => Effect.die(e)),
        Effect.mapError(DbError.match),
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
    ): Effect.Effect<void, DbError, Model["Context"] | Model["insert"]["Context"]> =>
      insertVoidSchema(insert).pipe(
        Effect.catchTag("ParseError", (e) => Effect.die(e)),
        Effect.mapError(DbError.match),
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
    ): Effect.Effect<Model["Type"], DbError, Model["Context"] | Model["update"]["Context"]> =>
      updateSchema(update).pipe(
        Effect.catchTags({
          ParseError: (e) => Effect.die(e),
          NoSuchElementException: (e) => Effect.die(e),
        }),
        Effect.mapError(DbError.match),
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
    ): Effect.Effect<void, DbError, Model["Context"] | Model["update"]["Context"]> =>
      updateVoidSchema(update).pipe(
        Effect.catchTag("ParseError", (e) => Effect.die(e)),
        Effect.mapError(DbError.match),
        Effect.withSpan(`${spanPrefix}.updateVoid`, {
          captureStackTrace: false,
          attributes: { update },
        })
      );

    const findByIdSchema = SqlSchema.findOne({
      Request: options.idSchema.privateSchema,
      Result: model,
      execute: (id) => sql`
          select *
          from ${sql(tableName)}
          where ${sql(idColumn)} = ${id}
      `,
    });

    const findById = (
      id: S.Schema.Type<Model["fields"][Id]>
    ): Effect.Effect<O.Option<Model["Type"]>, DbError, Model["Context"] | S.Schema.Context<Model["fields"][Id]>> =>
      findByIdSchema(id).pipe(
        Effect.catchTag("ParseError", (e) => Effect.die(e)),
        Effect.mapError(DbError.match),
        Effect.withSpan(`${spanPrefix}.findById`, {
          captureStackTrace: false,
          attributes: { id },
        })
      );

    const deleteSchema = SqlSchema.void({
      Request: options.idSchema.privateSchema,
      execute: (id) => sql`
          delete
          from ${sql(tableName)}
          where ${sql(idColumn)} = ${id}
      `,
    });

    const del = (
      id: S.Schema.Type<Model["fields"][Id]>
    ): Effect.Effect<void, DbError, S.Schema.Context<Model["fields"][Id]>> =>
      deleteSchema(id).pipe(
        Effect.catchTag("ParseError", (e) => Effect.die(e)),
        Effect.mapError(DbError.match),
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

export const make = <
  TableName extends string,
  Brand extends string,
  Model extends M.Any,
  SE,
  SR,
  TExtra extends Record<string, UnsafeTypes.UnsafeAny> = NonNullable<unknown>,
>(
  idSchema: EntityId.EntityIdSchemaInstance<TableName, Brand>,
  model: Model,
  maker: Effect.Effect<TExtra, SE, SR>
) =>
  Effect.flatMap(
    Effect.all([maker, makeBaseRepo(model, { idColumn: idSchema.privateIdColumnName, idSchema: idSchema })]),
    ([extra, baseRepo]) =>
      Effect.succeed({
        ...extra,
        ...baseRepo,
      } as const)
  );
