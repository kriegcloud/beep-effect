import { BS } from "@beep/schema";
import { thunk } from "@beep/utils/thunk";
import { pipe } from "effect";
import * as Arr from "effect/Array";
import * as Match from "effect/Match";
import * as Option from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import pc from "picocolors";
import { format } from "sql-formatter";

export const BOX = {
  topLeft: "╭",
  topRight: "╮",
  bottomLeft: "╰",
  bottomRight: "╯",
  horizontal: "─",
  vertical: "│",
  teeRight: "├",
  teeLeft: "┤",
} as const;

export class SqlKeyword extends BS.StringLiteralKit(
  "select",
  "from",
  "where",
  "insert",
  "into",
  "values",
  "update",
  "set",
  "delete",
  "create",
  "drop",
  "alter",
  "table",
  "index",
  "join",
  "left",
  "right",
  "inner",
  "outer",
  "on",
  "and",
  "or",
  "not",
  "in",
  "is",
  "null",
  "like",
  "between",
  "exists",
  "case",
  "when",
  "then",
  "else",
  "end",
  "order",
  "by",
  "group",
  "having",
  "limit",
  "offset",
  "as",
  "distinct",
  "union",
  "all",
  "returning",
  "default",
  "cascade",
  "constraint",
  "primary",
  "key",
  "foreign",
  "references",
  "unique",
  "check",
  "begin",
  "commit",
  "rollback",
  "transaction",
  "with",
  "recursive",
  "asc",
  "desc",
  "nulls",
  "first",
  "last",
  "true",
  "false",
  "coalesce",
  "cast"
) {
  static readonly Set = new Set(SqlKeyword.Options);
}

export class SqlFunction extends BS.StringLiteralKit(
  "count",
  "sum",
  "avg",
  "min",
  "max",
  "now",
  "current_timestamp",
  "coalesce",
  "nullif",
  "array_agg",
  "json_agg",
  "jsonb_agg",
  "row_number",
  "rank",
  "dense_rank",
  "lead",
  "lag",
  "first_value",
  "last_value",
  "string_agg",
  "concat",
  "lower",
  "upper",
  "trim",
  "length",
  "substring"
) {
  static readonly Set = new Set(SqlFunction.Options);
}

export class QueryType extends BS.StringLiteralKit(
  "SELECT",
  "INSERT",
  "UPDATE",
  "DELETE",
  "BEGIN",
  "COMMIT",
  "ROLLBACK",
  "OTHER"
) {
  static readonly Set = new Set(QueryType.Options);
  static readonly $match = Match.type<string>().pipe(
    Match.when(Str.startsWith("select"), thunk(QueryType.Enum.SELECT)),
    Match.when(Str.startsWith("insert"), thunk(QueryType.Enum.INSERT)),
    Match.when(Str.startsWith("update"), thunk(QueryType.Enum.UPDATE)),
    Match.when(Str.startsWith("delete"), thunk(QueryType.Enum.DELETE)),
    Match.when(Str.startsWith("begin"), thunk(QueryType.Enum.BEGIN)),
    Match.when(Str.startsWith("commit"), thunk(QueryType.Enum.COMMIT)),
    Match.when(Str.startsWith("rollback"), thunk(QueryType.Enum.ROLLBACK)),
    Match.orElse(thunk(QueryType.Enum.OTHER))
  );
  static readonly getQueryType = (query: string): QueryType.Type =>
    pipe(query, Str.trim, Str.toLowerCase, QueryType.$match);

  static readonly getQueryTypeStyle = (
    type: QueryType.Type
  ): {
    readonly badge: string;
    readonly color: (s: string) => string;
  } =>
    pipe(
      Match.value(type),
      Match.when("SELECT", (t) => ({ badge: pc.bgBlue(pc.white(pc.bold(` ${t} `))), color: pc.blue })),
      Match.when("INSERT", (t) => ({ badge: pc.bgGreen(pc.white(pc.bold(` ${t} `))), color: pc.green })),
      Match.when("UPDATE", (t) => ({ badge: pc.bgYellow(pc.black(pc.bold(` ${t} `))), color: pc.yellow })),
      Match.when("DELETE", (t) => ({ badge: pc.bgRed(pc.white(pc.bold(` ${t} `))), color: pc.red })),
      Match.when("BEGIN", (t) => ({ badge: pc.bgMagenta(pc.white(pc.bold(` ${t} `))), color: pc.magenta })),
      Match.when("COMMIT", (t) => ({ badge: pc.bgGreen(pc.white(pc.bold(` ${t} `))), color: pc.green })),
      Match.when("ROLLBACK", (t) => ({ badge: pc.bgRed(pc.white(pc.bold(` ${t} `))), color: pc.red })),
      Match.when("OTHER", (t) => ({ badge: pc.bgBlack(pc.white(pc.bold(` ${t} `))), color: pc.white })),
      Match.exhaustive
    );
}

type TokenState = {
  readonly result: string;
  readonly strings: ReadonlyArray<string>;
  readonly quotedIds: ReadonlyArray<string>;
};

const processLineHighlight = (line: string): string => {
  // 1. Protect and highlight strings first (highest priority, don't touch contents)
  const afterStrings = pipe(
    { result: line, strings: [] as ReadonlyArray<string>, quotedIds: [] as ReadonlyArray<string> } as TokenState,
    (state) => {
      const matches = state.result.match(/'[^']*'/g) ?? [];
      const highlighted = pipe(matches, Arr.map(pc.green));
      const replaced = pipe(
        highlighted,
        Arr.reduce({ result: state.result, index: 0 }, (acc, _, i) => ({
          result: acc.result.replace(/'[^']*'/, `\x00STR${i}\x00`),
          index: i + 1,
        }))
      );
      return { ...state, result: replaced.result, strings: highlighted };
    }
  );

  // 2. Protect and highlight quoted identifiers
  const afterQuotedIds = pipe(afterStrings, (state) => {
    const matches = state.result.match(/"[^"]+"/g) ?? [];
    const highlighted = pipe(matches, Arr.map(pc.white));
    const replaced = pipe(
      highlighted,
      Arr.reduce({ result: state.result, index: 0 }, (acc, _, i) => ({
        result: acc.result.replace(/"[^"]+"/, `\x00QID${i}\x00`),
        index: i + 1,
      }))
    );
    return { ...state, result: replaced.result, quotedIds: highlighted };
  });

  // 3. Highlight placeholders ($1, $2, etc.)
  const afterPlaceholders = pipe(afterQuotedIds.result, (s) =>
    s.replace(/\$\d+/g, (match) => pc.yellow(pc.bold(match)))
  );

  // 4. Highlight keywords and functions (word boundary based)
  const afterKeywords = pipe(afterPlaceholders, (s) =>
    s.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match) => {
      const lower = pipe(match, Str.toLowerCase);
      if (SqlKeyword.Set.has(lower as typeof SqlKeyword.Type)) {
        return pc.magenta(pc.bold(match));
      }
      if (SqlFunction.Set.has(lower as typeof SqlFunction.Type)) {
        return pc.blue(match);
      }
      return match;
    })
  );

  // 5. Highlight operators
  const afterOperators = pipe(afterKeywords, (s) =>
    s.replace(/([=<>!]+|::|->|@>|<@|\?\||\?&)/g, (match) => pc.cyan(match))
  );

  // 6. Restore protected strings and quoted identifiers
  return pipe(
    afterOperators,
    (s) =>
      s.replace(/\x00STR(\d+)\x00/g, (_, i) =>
        pipe(
          afterQuotedIds.strings,
          Arr.get(Number.parseInt(i, 10)),
          Option.getOrElse(() => "")
        )
      ),
    (s) =>
      s.replace(/\x00QID(\d+)\x00/g, (_, i) =>
        pipe(
          afterQuotedIds.quotedIds,
          Arr.get(Number.parseInt(i, 10)),
          Option.getOrElse(() => "")
        )
      )
  );
};

const highlightSqlImpl = (sql: string): string => {
  const formatted = format(sql, {
    language: "postgresql",
    tabWidth: 2,
    keywordCase: "lower",
    linesBetweenQueries: 1,
  });

  return pipe(formatted, Str.split("\n"), Arr.map(processLineHighlight), Arr.join("\n"));
};

export class SqlString extends S.String.pipe(
  S.brand("SqlString"),
  S.annotations({
    pretty:
      () =>
      (sql: string): string =>
        highlightSqlImpl(sql),
  })
) {
  static readonly highlightSql = highlightSqlImpl;

  static readonly formatParam = (value: unknown, index: number): string => {
    const paramLabel = pc.yellow(pc.bold(`$${index + 1}`));
    const sep = pc.dim("=");

    if (value === null) {
      return `${paramLabel}${sep}${pc.dim("null")}`;
    }
    if (value === undefined) {
      return `${paramLabel}${sep}${pc.dim("undefined")}`;
    }
    if (typeof value === "string") {
      const truncated = Str.length(value) > 40 ? `${pipe(value, Str.slice(0, 37))}…` : value;
      return `${paramLabel}${sep}${pc.green(`"${truncated}"`)}`;
    }
    if (typeof value === "number") {
      return `${paramLabel}${sep}${pc.cyan(String(value))}`;
    }
    if (typeof value === "boolean") {
      return `${paramLabel}${sep}${pc.blue(String(value))}`;
    }
    if (value instanceof Date) {
      return `${paramLabel}${sep}${pc.magenta(value.toISOString())}`;
    }
    if (Arr.isArray(value)) {
      const preview =
        Arr.length(value) > 3
          ? `[${pipe(
              value,
              Arr.take(3),
              Arr.map((v) => JSON.stringify(v)),
              Arr.join(", ")
            )}, …]`
          : JSON.stringify(value);
      return `${paramLabel}${sep}${pc.cyan(preview)}`;
    }
    if (typeof value === "object") {
      try {
        const str = JSON.stringify(value);
        const truncated = Str.length(str) > 50 ? `${pipe(str, Str.slice(0, 47))}…` : str;
        return `${paramLabel}${sep}${pc.gray(truncated)}`;
      } catch {
        return `${paramLabel}${sep}${pc.gray("[Object]")}`;
      }
    }
    return `${paramLabel}${sep}${pc.gray(String(value))}`;
  };

  private static readonly stripAnsi = (str: string): string => pipe(str, Str.replace(/\x1b\[[0-9;]*m/g, ""));

  private static readonly visualLength = (str: string): number => pipe(str, SqlString.stripAnsi, Str.length);

  private static readonly padEnd = (str: string, targetLen: number): string => {
    const currentLen = SqlString.visualLength(str);
    if (currentLen >= targetLen) return str;
    const padding = pipe(Arr.replicate(" ", targetLen - currentLen), Arr.join(""));
    return `${str}${padding}`;
  };

  static readonly formatParamsBlock = (params: ReadonlyArray<unknown>, boxColor: (s: string) => string): string => {
    if (Arr.length(params) === 0) return "";

    const formattedParams = pipe(
      params,
      Arr.map((p, i) => SqlString.formatParam(p, i))
    );
    const prefix = boxColor(BOX.teeRight);

    if (Arr.length(params) <= 3) {
      return `${prefix} ${pc.dim("params")} ${pipe(formattedParams, Arr.join(pc.dim("  ")))}`;
    }

    // Calculate max width for each column using reduce
    const colWidths = pipe(
      formattedParams,
      Arr.map((param, i): readonly [number, number] => [i % 3, SqlString.visualLength(param)]),
      Arr.reduce({ col0: 0, col1: 0, col2: 0 }, (widths, [col, len]) => {
        if (col === 0) return { ...widths, col0: Math.max(widths.col0, len) };
        if (col === 1) return { ...widths, col1: Math.max(widths.col1, len) };
        return { ...widths, col2: Math.max(widths.col2, len) };
      }),
      (w) => [w.col0, w.col1, w.col2] as const
    );

    // Grid layout for many params (3 per row)
    const rows = pipe(
      formattedParams,
      Arr.chunksOf(3),
      Arr.map((chunk, rowIndex) => {
        const rowItems = pipe(
          chunk,
          Arr.map((item, col) =>
            SqlString.padEnd(
              item,
              pipe(
                colWidths,
                Arr.get(col),
                Option.getOrElse(() => 0)
              )
            )
          )
        );
        const linePrefix = rowIndex === 0 ? `${prefix} ${pc.dim("params")} ` : `${boxColor(BOX.vertical)}        `;
        return `${linePrefix}${pipe(rowItems, Arr.join(pc.dim("  ")))}`;
      })
    );

    return pipe(rows, Arr.join("\n"));
  };
}

export declare namespace QueryType {
  export type Type = typeof QueryType.Type;
  export type Encoded = typeof QueryType.Encoded;
}
