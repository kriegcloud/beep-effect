import { LiteralKit } from "@beep/schema";
import { identity, Match, pipe, Result } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { SqlError } from "effect/unstable/sql";
import { DatabaseError as PgDatabaseError } from "pg-protocol";
import pc from "picocolors";
import { format } from "sql-formatter";
import { ErrorCodeFromKey } from "./ErrorEnum.js";

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

export const SqlKeyword = LiteralKit([
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
  "cast",
]);

const SqlFunction = LiteralKit([
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
  "substring",
]);

export const QueryType = LiteralKit(["SELECT", "INSERT", "UPDATE", "DELETE", "BEGIN", "COMMIT", "ROLLBACK", "OTHER"]);

export const matchQueryType = Match.type<string>().pipe(
  Match.when(Str.startsWith("select"), () => QueryType.Enum.SELECT),
  Match.when(Str.startsWith("insert"), () => QueryType.Enum.INSERT),
  Match.when(Str.startsWith("update"), () => QueryType.Enum.UPDATE),
  Match.when(Str.startsWith("delete"), () => QueryType.Enum.DELETE),
  Match.when(Str.startsWith("begin"), () => QueryType.Enum.BEGIN),
  Match.when(Str.startsWith("commit"), () => QueryType.Enum.COMMIT),
  Match.when(Str.startsWith("rollback"), () => QueryType.Enum.ROLLBACK),
  Match.orElse(() => QueryType.Enum.OTHER)
);

export const getQueryType = (query: string) => pipe(query, Str.trim, Str.toLowerCase, matchQueryType);

export const getQueryTypeStyle = QueryType.$match({
  SELECT: (t) => ({ badge: pc.bgBlue(pc.white(pc.bold(` ${t} `))), color: pc.blue }),
  INSERT: (t) => ({ badge: pc.bgGreen(pc.white(pc.bold(` ${t} `))), color: pc.green }),
  UPDATE: (t) => ({ badge: pc.bgYellow(pc.black(pc.bold(` ${t} `))), color: pc.yellow }),
  DELETE: (t) => ({ badge: pc.bgRed(pc.white(pc.bold(` ${t} `))), color: pc.red }),
  BEGIN: (t) => ({ badge: pc.bgMagenta(pc.white(pc.bold(` ${t} `))), color: pc.magenta }),
  COMMIT: (t) => ({ badge: pc.bgCyan(pc.white(pc.bold(` ${t} `))), color: pc.cyan }),
  ROLLBACK: (t) => ({ badge: pc.bgRed(pc.white(pc.bold(` ${t} `))), color: pc.red }),
  OTHER: (t) => ({ badge: pc.bgWhite(pc.black(pc.bold(` ${t} `))), color: pc.white }),
});

const processLineHighlight = (line: string) => {
  // 1. Protect and highlight strings first (highest priority, don't touch contents)
  const afterStrings = pipe({ result: line, strings: A.empty<string>(), quotedIds: A.empty<string>() }, (state) => {
    const matches = state.result.match(/'[^']*'/g) ?? [];
    const highlighted = pipe(matches, A.map(pc.green));
    const replaced = pipe(
      highlighted,
      A.reduce({ result: state.result, index: 0 }, (acc, _, i) => ({
        result: acc.result.replace(/'[^']*'/, `\x00STR${i}\x00`),
        index: i + 1,
      }))
    );
    return { ...state, result: replaced.result, strings: highlighted };
  });

  // 2. Protect and highlight quoted identifiers
  const afterQuotedIds = pipe(afterStrings, (state) => {
    const matches = state.result.match(/"[^"]+"/g) ?? A.empty();
    const highlighted = pipe(matches, A.map(pc.white));
    const replaced = pipe(
      highlighted,
      A.reduce({ result: state.result, index: 0 }, (acc, _, i) => ({
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
      if (
        (Object.values(SqlKeyword) as Array<string>).includes(lower) &&
        new Set(SqlKeyword.Options as ReadonlyArray<string>).has(lower)
      ) {
        return pc.magenta(pc.bold(match));
      }
      if (S.is(SqlFunction)(lower) && new Set(SqlFunction.Options).has(lower)) {
        return pc.blue(match);
      }
      return match;
    })
  );

  // 5. Highlight operators
  const afterOperators = pipe(afterKeywords, (s) => s.replace(/([=<>!]+|::|->|@>|<@|\?\||\?&)/g, pc.cyan));

  // 6. Restore protected strings and quoted identifiers
  return pipe(
    afterOperators,
    (s) =>
      s.replace(/\x00STR(\d+)\x00/g, (_, i) =>
        pipe(
          afterQuotedIds.strings,
          A.get(Number.parseInt(i, 10)),
          O.getOrElse(() => "")
        )
      ),
    (s) =>
      s.replace(/\x00QID(\d+)\x00/g, (_, i) =>
        pipe(
          afterQuotedIds.quotedIds,
          A.get(Number.parseInt(i, 10)),
          O.getOrElse(() => "")
        )
      )
  );
};

export const highlightSql = (sql: string): string => {
  const formatted = format(sql, {
    language: "postgresql",
    tabWidth: 2,
    keywordCase: "lower",
    linesBetweenQueries: 1,
  });

  return pipe(formatted, Str.split("\n"), A.map(processLineHighlight), A.join("\n"));
};

export const formatParam = (value: unknown, index: number): string => {
  const paramLabel = pc.yellow(pc.bold(`$${index + 1}`));
  const sep = pc.dim("=");

  if (P.isNull(value)) {
    return `${paramLabel}${sep}${pc.dim("null")}`;
  }
  if (P.isUndefined(value)) {
    return `${paramLabel}${sep}${pc.dim("undefined")}`;
  }
  if (P.isString(value)) {
    const truncated = Str.length(value) > 40 ? `${pipe(value, Str.slice(0, 37))}…` : value;
    return `${paramLabel}${sep}${pc.green(`"${truncated}"`)}`;
  }
  if (P.isNumber(value)) {
    return `${paramLabel}${sep}${pc.cyan(String(value))}`;
  }
  if (P.isBoolean(value)) {
    return `${paramLabel}${sep}${pc.blue(String(value))}`;
  }
  if (S.is(S.instanceOf(Date))(value)) {
    return `${paramLabel}${sep}${pc.magenta(value.toISOString())}`;
  }
  if (A.isArray(value)) {
    const preview =
      A.length(value) > 3
        ? `[${pipe(
            value,
            A.take(3),
            A.map((v) => JSON.stringify(v)),
            A.join(", ")
          )}, …]`
        : JSON.stringify(value);
    return `${paramLabel}${sep}${pc.cyan(preview)}`;
  }
  if (P.isObject(value)) {
    return Result.try({
      try: () => {
        const str = JSON.stringify(value);
        const truncated = Str.length(str) > 50 ? `${pipe(str, Str.slice(0, 47))}…` : str;
        return `${paramLabel}${sep}${pc.gray(truncated)}`;
      },
      catch: () => `${paramLabel}${sep}${pc.gray("[Object]")}`,
    }).pipe(
      Result.match({
        onFailure: identity,
        onSuccess: identity,
      })
    );
  }
  return `${paramLabel}${sep}${pc.gray(String(value))}`;
};

export const stripAnsi = (str: string): string => pipe(str, Str.replace(/\x1b\[[0-9;]*m/g, Str.empty));

export const visualLength = (str: string): number => pipe(str, stripAnsi, Str.length);

export const padEnd = (str: string, targetLen: number): string => {
  const currentLen = visualLength(str);
  if (currentLen >= targetLen) return str;
  const padding = pipe(A.replicate(" ", targetLen - currentLen), A.join(Str.empty));
  return `${str}${padding}`;
};

export const formatParamsBlock = (params: ReadonlyArray<unknown>, boxColor: (s: string) => string): string => {
  if (A.length(params) === 0) return Str.empty;

  const formattedParams = pipe(
    params,
    A.map((p, i) => formatParam(p, i))
  );
  const prefix = boxColor(BOX.teeRight);

  if (A.length(params) <= 3) {
    return `${prefix} ${pc.dim("params")} ${pipe(formattedParams, A.join(pc.dim("  ")))}`;
  }

  // Calculate max width for each column using reduce
  const colWidths = pipe(
    formattedParams,
    A.map((param, i): readonly [number, number] => [i % 3, visualLength(param)]),
    A.reduce({ col0: 0, col1: 0, col2: 0 }, (widths, [col, len]) => {
      if (col === 0) return { ...widths, col0: Math.max(widths.col0, len) };
      if (col === 1) return { ...widths, col1: Math.max(widths.col1, len) };
      return { ...widths, col2: Math.max(widths.col2, len) };
    }),
    (w) => [w.col0, w.col1, w.col2] as const
  );

  // Grid layout for many params (3 per row)
  const rows = pipe(
    formattedParams,
    A.chunksOf(3),
    A.map((chunk, rowIndex) => {
      const rowItems = pipe(
        chunk,
        A.map((item, col) =>
          padEnd(
            item,
            pipe(
              colWidths,
              A.get(col),
              O.getOrElse(() => 0)
            )
          )
        )
      );
      const linePrefix = rowIndex === 0 ? `${prefix} ${pc.dim("params")} ` : `${boxColor(BOX.vertical)}        `;
      return `${linePrefix}${pipe(rowItems, A.join(pc.dim("  ")))}`;
    })
  );

  return pipe(rows, A.join("\n"));
};
export const RawPgError = S.declare((error: unknown): error is PgDatabaseError => error instanceof PgDatabaseError);

export const extractPgError = (error: unknown): PgDatabaseError | null => {
  // Direct pg.DatabaseError
  if (S.is(RawPgError)(error)) {
    return error;
  }

  // SqlError
  if (error instanceof SqlError.SqlError && error.cause) {
    return extractPgError(error.cause);
  }

  // Drizzle wraps errors - check the cause chain
  if (error instanceof Error && error.cause) {
    return extractPgError(error.cause);
  }
  return null;
};

export const extractSourceLocation = (error: unknown): string | null => {
  if (!(error instanceof Error) || !error.stack) return null;

  const stackLines = pipe(error.stack, Str.split("\n"));
  // Skip the error message line(s) and find actual stack frames
  for (const line of stackLines) {
    // Match stack frame patterns: "at ... (path:line:col)" or "at path:line:col"
    const match = line.match(/at\s+(?:.*?\s+)?\(?([^()]+):(\d+):(\d+)\)?/);
    if (match) {
      const [, filePath, lineNum, colNum] = match;
      // Skip internal paths, node_modules, and non-file paths (native, etc.)
      if (
        filePath?.startsWith("/") && // Must be an absolute file path
        !Str.includes("node_modules")(filePath) &&
        !Str.includes("shared/server/src/internal")(filePath) // Skip our internal db code
      ) {
        return `${filePath}:${lineNum}:${colNum}`;
      }
    }
  }
  return null;
};

export const extractQueryFromDrizzleError = (
  error: unknown
): { readonly query: string | null; readonly params: string[] } => {
  if (!(error instanceof Error)) return { query: null, params: [] };

  const message = error.message;
  const failedQueryMatch = message.match(/^Failed query:\s*(.+?)(?:\nparams:\s*(.*))?$/s);

  if (failedQueryMatch) {
    const query = failedQueryMatch[1] ? Str.trim(failedQueryMatch[1]) : null;
    const paramsStr = failedQueryMatch[2] ? Str.trim(failedQueryMatch[2]) : "";
    // Parse comma-separated params (basic parsing, values may contain commas in strings)
    const params = paramsStr ? pipe(paramsStr, Str.split(","), A.map(Str.trim)) : [];
    return { query, params };
  }

  return { query: null, params: [] };
};

export const formatDbError = (error: unknown, query?: string, params?: unknown[]): string => {
  const lines: string[] = [];
  const boxColor = pc.red;

  // Extract the underlying pg error if wrapped by Drizzle
  const pgError = extractPgError(error);
  const displayError = pgError ?? error;

  // Try to extract query from Drizzle wrapper if not provided
  let displayQuery = query;
  let displayParams = params;
  if (!displayQuery && error instanceof Error) {
    const extracted = extractQueryFromDrizzleError(error);
    displayQuery = extracted.query ?? undefined;
    if (!displayParams && extracted.params.length > 0) {
      displayParams = extracted.params;
    }
  }

  // Extract source location - try the error first, then use current stack as fallback
  // (the current stack will point to where format() was called, which is usually in the error handler)
  let sourceLocation = extractSourceLocation(error);
  if (!sourceLocation) {
    // Capture current stack trace to find the call site
    const currentStack = new Error();
    sourceLocation = extractSourceLocation(currentStack);
  }

  // Header with clickable source location
  if (sourceLocation) {
    lines.push(
      `${boxColor(BOX.topLeft + BOX.horizontal)} ${pc.bgRed(pc.white(pc.bold(" DATABASE ERROR ")))} ${pc.dim("at")} ${pc.underline(pc.cyan(sourceLocation))}`
    );
  } else {
    lines.push(`${boxColor(BOX.topLeft + BOX.horizontal)} ${pc.bgRed(pc.white(pc.bold(" DATABASE ERROR ")))}`);
  }

  // Error type and message
  if (displayError instanceof Error) {
    lines.push(`${boxColor(BOX.vertical)}`);
    lines.push(`${boxColor(BOX.vertical)} ${pc.red(pc.bold(displayError.name))}: ${pc.white(displayError.message)}`);

    // PostgreSQL specific error details (from pg.DatabaseError)
    const pgDetails = displayError as {
      readonly code?: undefined | string;
      readonly detail?: undefined | string;
      readonly hint?: undefined | string;
      readonly where?: undefined | string;
      readonly table?: undefined | string;
      readonly column?: undefined | string;
      readonly constraint?: undefined | string;
      readonly schema?: undefined | string;
      readonly severity?: undefined | string;
    };

    if (pgDetails.code || pgDetails.severity) {
      lines.push(`${boxColor(BOX.vertical)}`);
    }
    if (pgDetails.severity) {
      lines.push(
        `${boxColor(BOX.teeRight)}${boxColor(BOX.horizontal)} ${pc.dim("severity")}   ${pc.red(pc.bold(pgDetails.severity))}`
      );
    }
    if (S.is(ErrorCodeFromKey)(pgDetails.code)) {
      const codeLabel = ErrorCodeFromKey.To.Enum[pgDetails.code];
      lines.push(
        `${boxColor(BOX.vertical)}  ${pc.dim("code")}       ${pc.yellow(pgDetails.code)}${codeLabel ? pc.dim(` (${codeLabel})`) : ""}`
      );
    }
    if (pgDetails.schema) {
      lines.push(`${boxColor(BOX.vertical)}  ${pc.dim("schema")}     ${pc.cyan(pgDetails.schema)}`);
    }
    if (pgDetails.table) {
      lines.push(`${boxColor(BOX.vertical)}  ${pc.dim("table")}      ${pc.cyan(pgDetails.table)}`);
    }
    if (pgDetails.column) {
      lines.push(`${boxColor(BOX.vertical)}  ${pc.dim("column")}     ${pc.cyan(pgDetails.column)}`);
    }
    if (pgDetails.constraint) {
      lines.push(`${boxColor(BOX.vertical)}  ${pc.dim("constraint")}  ${pc.magenta(pgDetails.constraint)}`);
    }
    if (pgDetails.detail) {
      lines.push(`${boxColor(BOX.vertical)}  ${pc.dim("detail")}     ${pc.white(pgDetails.detail)}`);
    }
    if (pgDetails.hint) {
      lines.push(`${boxColor(BOX.vertical)}  ${pc.dim("hint")}       ${pc.green(pgDetails.hint)}`);
    }
    if (pgDetails.where) {
      lines.push(`${boxColor(BOX.vertical)}  ${pc.dim("where")}      ${pc.gray(pgDetails.where)}`);
    }
  } else {
    lines.push(`${boxColor(BOX.vertical)} ${pc.white(String(displayError))}`);
  }

  // Show the query that caused the error
  if (displayQuery) {
    lines.push(`${boxColor(BOX.vertical)}`);
    lines.push(`${boxColor(BOX.teeRight)}${boxColor(BOX.horizontal)} ${pc.dim("query")}`);

    const queryType = getQueryType(displayQuery);
    const { badge } = getQueryTypeStyle(queryType);

    // Format and highlight the query
    const formattedQuery = format(displayQuery, {
      language: "postgresql",
      tabWidth: 2,
      keywordCase: "lower",
    });
    const highlightedQuery = highlightSql(displayQuery);

    lines.push(`${boxColor(BOX.vertical)}  ${badge}`);
    pipe(
      highlightedQuery,
      Str.split("\n"),
      A.take(15),
      A.forEach((line) => {
        lines.push(`${boxColor(BOX.vertical)}  ${line}`);
      })
    );

    if (pipe(formattedQuery, Str.split("\n"), A.length) > 15) {
      lines.push(`${boxColor(BOX.vertical)}  ${pc.dim("… (truncated)")}`);
    }
  }

  // Show params if present
  if (displayParams && displayParams.length > 0) {
    lines.push(formatParamsBlock(displayParams, boxColor));
  }

  // Footer
  lines.push(`${boxColor(BOX.bottomLeft + BOX.horizontal)}`);

  return pipe(lines, A.join("\n"));
};
