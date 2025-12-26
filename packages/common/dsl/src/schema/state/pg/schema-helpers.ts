// import { pipe, R., Schema } from 'effect'
import * as F from "effect/Function";
import * as R from "effect/Record";
import * as S from "effect/Schema";

import { PgDSL } from "./db-schema/mod.ts";
import type { TableDefBase } from "./table-def.ts";

export const getDefaultValuesEncoded = <TTableDef extends TableDefBase>(
  tableDef: TTableDef,
  fallbackValues?: Record<string, any>
) =>
  F.pipe(
    tableDef.pgDef.columns,
    R.filter((col, key) => {
      if (fallbackValues?.[key] !== undefined) return true;
      if (key === "id") return false;
      return col!.default._tag === "None" || PgDSL.isSqlDefaultValue(col!.default.value) === false;
    }),
    R.map((column, columnName) => {
      if (fallbackValues?.[columnName] !== undefined) return fallbackValues[columnName];
      if (column!.default._tag === "None") {
        if (column!.nullable === true) return null;
        throw new Error(`Column ${columnName} has no default value and is not nullable`);
      }

      const defaultValue = column!.default.value;
      const resolvedDefault = PgDSL.resolveColumnDefault(defaultValue);

      return S.encodeSync(column!.schema)(resolvedDefault);
    })
  );

export const getDefaultValuesDecoded = <TTableDef extends TableDefBase>(
  tableDef: TTableDef,
  fallbackValues?: Record<string, any>
) =>
  F.pipe(
    tableDef.pgDef.columns,
    R.filter((col, key) => {
      if (fallbackValues?.[key] !== undefined) return true;
      if (key === "id") return false;
      return col!.default._tag === "None" || PgDSL.isSqlDefaultValue(col!.default.value) === false;
    }),
    R.map((column, columnName) => {
      if (fallbackValues?.[columnName] !== undefined) return fallbackValues[columnName];
      if (column!.default._tag === "None") {
        if (column!.nullable === true) return null;
        throw new Error(`Column ${columnName} has no default value and is not nullable`);
      }

      const defaultValue = column!.default.value;
      const resolvedDefault = PgDSL.resolveColumnDefault(defaultValue);

      return S.validateSync(column!.schema)(resolvedDefault);
    })
  );
