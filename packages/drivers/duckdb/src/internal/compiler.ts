/**
 * Statement compiler and null-safe result-name transform for the DuckDB
 * `effect/sql` client.
 *
 * **Details**
 *
 * DuckDB accepts SQLite-style `?` placeholders and double-quoted identifiers,
 * so the compiler uses the `"sqlite"` dialect, with a Postgres-style
 * `onRecordUpdate` (`(values ...) AS alias(cols)`), which DuckDB supports.
 * The row transform replaces `Statement.defaultTransforms(...).array`, which
 * throws on DuckDB LIST/ARRAY/MAP values that contain `null`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Statement from "effect/sql/Statement";

const escape = Statement.defaultEscape('"');

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!P.isObject(value)) {
    return false;
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/**
 * Build the DuckDB `Statement.Compiler`, optionally renaming identifiers.
 *
 * **Details**
 *
 * Uses the `"sqlite"` dialect with `?` placeholders and `"`-escaped
 * identifiers. `transform` is applied to identifiers unless the fragment asks
 * for the untransformed name. Record updates render as
 * `(values ...) AS alias(cols)` with an optional `RETURNING` clause; custom
 * fragments render as empty SQL.
 *
 * **Example** (Compile a statement with renamed identifiers)
 *
 * ```ts
 * import { makeCompiler } from "./compiler.ts"
 *
 * const compiler = makeCompiler((name) => name.toLowerCase())
 * console.log(compiler.dialect) // "sqlite"
 * ```
 *
 * @internal
 * @category constructors
 * @since 0.0.0
 */
export const makeCompiler = (transform?: ((name: string) => string) | undefined): Statement.Compiler =>
  Statement.makeCompiler({
    dialect: "sqlite",
    placeholder: () => "?",
    onIdentifier:
      transform === undefined
        ? escape
        : (value, withoutTransform) => (withoutTransform ? escape(value) : escape(transform(value))),
    onRecordUpdate: (placeholders, valueAlias, valueColumns, values, returning) => [
      `(values ${placeholders}) AS ${valueAlias}${valueColumns}${returning === undefined ? "" : ` RETURNING ${returning[0]}`}`,
      returning === undefined ? A.flatten(values) : A.appendAll(A.flatten(values), returning[1]),
    ],
    onCustom: () => ["", []],
  });

/**
 * Build a null-safe row transform that renames every object key with `f`.
 *
 * **Details**
 *
 * Renames top-level column names, nested STRUCT fields and objects inside
 * LIST/ARRAY values. Only plain objects (prototype `Object.prototype` or
 * `null`) are rewritten; `null`, `Date`, `Uint8Array`, `bigint` and other
 * values pass through unchanged, so `null` may appear anywhere in a nested
 * value. MAP values (`Array<{ key, value }>`) are renamed like any other
 * array of objects.
 *
 * **Example** (Camel-case result names)
 *
 * ```ts
 * import { makeRowTransform } from "./compiler.ts"
 *
 * const transform = makeRowTransform((name) => name.replace(/_(\w)/g, (_, c: string) => c.toUpperCase()))
 * console.log(transform([{ some_list: [null, { inner_key: 1 }] }]))
 * // [{ someList: [null, { innerKey: 1 }] }]
 * ```
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const makeRowTransform = (
  f: (name: string) => string
): ((rows: ReadonlyArray<object>) => ReadonlyArray<object>) => {
  const value = (v: unknown): unknown => (A.isArray(v) ? A.map(v, value) : isPlainObject(v) ? object(v) : v);
  const object = (o: Record<string, unknown>): Record<string, unknown> =>
    R.fromEntries(A.map(R.toEntries(o), ([k, v]) => [f(k), value(v)] as const));
  return (rows) => A.map(rows, value) as ReadonlyArray<object>;
};
