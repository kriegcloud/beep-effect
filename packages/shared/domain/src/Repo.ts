import type { EntityId } from "@beep/schema/EntityId";
import type { UnsafeTypes } from "@beep/types";
import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import * as Str from "effect/String";

export namespace Repo {
  const tableNameToSpanPrefix = <TableName extends string>(tableName: TableName) => {
    const name = Str.split("_")(tableName).map(Str.capitalize).join("");
    return `${name}Repo`;
  };

  const makeBaseRepo = <TableName extends string, Brand extends string, Model extends M.Any>(
    idSchema: EntityId.EntityIdSchemaInstance<TableName, Brand>,
    model: Model
  ) =>
    M.makeRepository(model, {
      tableName: idSchema.tableName,
      idColumn: "_rowId",
      spanPrefix: tableNameToSpanPrefix(idSchema.tableName),
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
    Effect.flatMap(maker, (extra) =>
      Effect.gen(function* () {
        const repoBase = yield* makeBaseRepo(idSchema, model);

        return {
          ...repoBase,
          ...extra,
        };
      })
    );
}
