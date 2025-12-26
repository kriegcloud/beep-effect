// import type {TableDefBase} from "@beep/dsl/schema/state/pg/table-def.ts";
// import type {QueryBuilder, QueryBuilderAst} from "@beep/dsl/schema/state/pg/query-builder/api.ts";
// import {invalidQueryBuilder} from "@beep/dsl/schema/state/pg/query-builder/impl.ts";
import type { Brand } from "effect";
import { Schema } from "effect";
export const isDevEnv = () => {
  if (typeof process !== "undefined" && process.env !== undefined) {
    return process.env.NODE_ENV !== "production";
  }

  // TODO re-enable the full guard code once `import.meta` is supported in Expo
  // if (import.meta !== undefined && import.meta.env !== undefined) {
  if (import.meta.env !== undefined) {
    return import.meta.env.DEV;
  }

  // @ts-expect-error Only exists in Expo / RN
  if (globalThis?.__DEV__) {
    return true;
  }

  return false;
};
export const shouldNeverHappen = (msg?: string, ...args: any[]): never => {
  console.error(msg, ...args);
  if (isDevEnv()) {
    // biome-ignore lint/suspicious/noDebugger: debugging
    debugger;
  }

  throw new Error(`This should never happen: ${msg}`);
};
export const objectToString = (error: any): string => {
  const str = error?.toString();
  if (str !== "[object Object]") return str;

  try {
    return JSON.stringify(error, null, 2);
  } catch (e: any) {
    console.log(error);

    return `Error while printing error: ${e}`;
  }
};
const truncate = (str: string, length: number): string => {
  if (str.length > length) {
    return `${str.slice(0, length)}...`;
  }
  return str;
};
export function casesHandled(unexpectedCase: never): never {
  // biome-ignore lint/suspicious/noDebugger: debugging
  debugger;
  throw new Error(`A case was not handled for value: ${truncate(objectToString(unexpectedCase), 1000)}`);
}

/// <reference lib="es2022" />

export type ParamsObject = Record<string, SqlValue>;
export type SqlValue = string | number | Uint8Array<ArrayBuffer> | null;

export type Bindable = ReadonlyArray<SqlValue> | ParamsObject;

export const SqlValueSchema = Schema.Union(
  Schema.String,
  Schema.Number,
  Schema.Uint8Array as any as Schema.Schema<Uint8Array<ArrayBuffer>>,
  Schema.Null
);

export const PreparedBindValues = Schema.Union(
  Schema.Array(SqlValueSchema),
  Schema.Record({ key: Schema.String, value: SqlValueSchema })
).pipe(Schema.brand("PreparedBindValues"));

export type PreparedBindValues = Brand.Branded<Bindable, "PreparedBindValues">;

/**
 * This is a tag function for tagged literals.
 * it lets us get syntax highlighting on SQL queries in VSCode, but
 * doesn't do anything at runtime.
 * Code copied from: https://esdiscuss.org/topic/string-identity-template-tag
 */
export const sql = (template: TemplateStringsArray, ...args: unknown[]): string => {
  let str = "";

  for (const [i, arg] of args.entries()) {
    str += template[i] + String(arg);
  }

  return str + template[template.length - 1];
};

/**
 * Prepare bind values to send to SQLite
 * Add $ to the beginning of keys; which we use as our interpolation syntax
 * We also strip out any params that aren't used in the statement,
 * because rupg doesn't allow unused named params
 * TODO: Search for unused params via proper parsing, not string search
 * TODO: Also make sure that the SQLite binding limit of 1000 is respected
 */
export const prepareBindValues = (values: Bindable, statement: string): PreparedBindValues => {
  if (Array.isArray(values)) return values as any as PreparedBindValues;

  const result: ParamsObject = {};
  for (const [key, value] of Object.entries(values)) {
    if (statement.includes(key)) {
      result[`$${key}`] = value;
    }
  }

  return result as PreparedBindValues;
};

/**
 * Memoizes a single-argument function using reference equality for cache lookup.
 * Suitable for functions where arguments are objects that should be compared by reference.
 *
 * @example
 * ```ts
 * const processUser = memoizeByRef((user: User) => expensiveTransform(user))
 * processUser(userA) // Computes
 * processUser(userA) // Returns cached (same reference)
 * processUser(userB) // Computes (different reference)
 * ```
 */
export const memoizeByRef = <T extends (arg: any) => any>(fn: T): T => {
  const cache = new Map<Parameters<T>[0], ReturnType<T>>();

  return ((arg: any) => {
    if (cache.has(arg)) {
      return cache.get(arg);
    }

    const result = fn(arg);
    cache.set(arg, result);
    return result;
  }) as any;
};

/**
 * Placeholder for unimplemented code paths. Triggers debugger and throws.
 *
 * @example
 * ```ts
 * const parseFormat = (format: Format) => {
 *   switch (format) {
 *     case 'json': return parseJson
 *     case 'xml': return notYetImplemented('XML parsing')
 *   }
 * }
 * ```
 */
export const notYetImplemented = (msg?: string): never => {
  // biome-ignore lint/suspicious/noDebugger: debugging
  debugger;
  throw new Error(`Not yet implemented: ${msg}`);
};
