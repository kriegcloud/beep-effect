import { LiteralKit } from "@beep/schema";
import { Str as CommonStr, Text, thunk0, thunkEmptyStr, thunkNull, thunkUndefined } from "@beep/utils";
import { flow, Match, pipe } from "effect";
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

/**
 * Unicode box-drawing characters used by the database error formatter.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const BOX = {
  topLeft: "╭",
  topRight: "╮",
  bottomLeft: "╰",
  bottomRight: "╯",
  horizontal: "─",
  vertical: "│",
  teeRight: "├",
  teeLeft: "┤",
};

/**
 * SQL keywords highlighted in formatted query output.
 *
 * @since 0.0.0
 * @category Validation
 */
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

const isSqlKeyword = S.is(SqlKeyword);
const isSqlFunction = S.is(SqlFunction);
const encodeJson = S.encodeUnknownOption(S.UnknownFromJsonString);
const RawDate = S.instanceOf(Date);
const RawError = S.instanceOf(Error);
const RawSqlError = S.instanceOf(SqlError.SqlError);
const stringTokenPrefix = "__BEEP_SQL_STR_";
const quotedIdentifierTokenPrefix = "__BEEP_SQL_QID_";
const stringTokenRegex = /__BEEP_SQL_STR_(\d+)__/g;
const quotedIdentifierTokenRegex = /__BEEP_SQL_QID_(\d+)__/g;
const ansiEscapeRegex = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

const makeStringToken = (index: number): string => `${stringTokenPrefix}${String(index)}__`;
const makeQuotedIdentifierToken = (index: number): string => `${quotedIdentifierTokenPrefix}${String(index)}__`;

/**
 * Supported query categories for styled SQL error output.
 *
 * @since 0.0.0
 * @category Validation
 */
export const QueryType = LiteralKit(["SELECT", "INSERT", "UPDATE", "DELETE", "BEGIN", "COMMIT", "ROLLBACK", "OTHER"]);

/**
 * Pattern matcher that derives a query category from a lower-cased SQL prefix.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
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

/**
 * Classifies an arbitrary SQL statement into a known query category.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const getQueryType = (query: string) => pipe(query, Str.trim, Str.toLowerCase, matchQueryType);

/**
 * Maps a query category to terminal styling tokens used by the formatter.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
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
    const matches = pipe(state.result, Str.match(/'[^']*'/g), O.getOrElse(A.empty<string>));
    const highlighted = pipe(matches, A.map(pc.green));
    const replaced = pipe(
      highlighted,
      A.reduce({ result: state.result, index: 0 }, (acc, _, i) => ({
        result: acc.result.replace(/'[^']*'/, makeStringToken(i)),
        index: i + 1,
      }))
    );
    return { ...state, result: replaced.result, strings: highlighted };
  });

  // 2. Protect and highlight quoted identifiers
  const afterQuotedIds = pipe(afterStrings, (state) => {
    const matches = pipe(state.result, Str.match(/"[^"]+"/g), O.getOrElse(A.empty<string>));
    const highlighted = pipe(matches, A.map(pc.white));
    const replaced = pipe(
      highlighted,
      A.reduce({ result: state.result, index: 0 }, (acc, _, i) => ({
        result: acc.result.replace(/"[^"]+"/, makeQuotedIdentifierToken(i)),
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
      return pipe(
        lower,
        Match.value,
        Match.when(isSqlKeyword, () => pc.magenta(pc.bold(match))),
        Match.when(isSqlFunction, () => pc.blue(match)),
        Match.orElse(() => match)
      );
    })
  );

  // 5. Highlight operators
  const afterOperators = pipe(afterKeywords, (s) => s.replace(/([=<>!]+|::|->|@>|<@|\?\||\?&)/g, pc.cyan));

  // 6. Restore protected strings and quoted identifiers
  return pipe(
    afterOperators,
    (s) =>
      s.replace(stringTokenRegex, (_, i) =>
        pipe(afterQuotedIds.strings, A.get(Number.parseInt(i, 10)), O.getOrElse(thunkEmptyStr))
      ),
    (s) =>
      s.replace(quotedIdentifierTokenRegex, (_, i) =>
        pipe(afterQuotedIds.quotedIds, A.get(Number.parseInt(i, 10)), O.getOrElse(thunkEmptyStr))
      )
  );
};

const truncateForPreview = (value: string, maxLength: number): string =>
  Str.length(value) > maxLength ? `${pipe(value, Str.slice(0, maxLength - 3))}...` : value;

/**
 * Formats and colorizes SQL for terminal-friendly diagnostics.
 *
 * @since 0.0.0
 * @category Utility
 *
 * @example
 * ```ts-morph
 * import { highlightSql } from "@beep/shared-domain/errors/DbError/utils";
 *
 * highlightSql("select * from users where id = $1");
 * ```
 */
export const highlightSql = (sql: string): string => {
  const formatted = format(sql, {
    language: "postgresql",
    tabWidth: 2,
    keywordCase: "lower",
    linesBetweenQueries: 1,
  });

  return pipe(formatted, Str.split("\n"), A.map(processLineHighlight), Text.joinLines);
};

/**
 * Renders a single SQL parameter preview for error output.
 *
 * @since 0.0.0
 * @category Utility
 */
export const formatParam = (value: unknown, index: number): string => {
  const paramLabel = pc.yellow(pc.bold(`$${index + 1}`));
  const sep = pc.dim("=");
  return pipe(
    value,
    Match.value,
    Match.when(P.isNull, () => `${paramLabel}${sep}${pc.dim("null")}`),
    Match.when(P.isUndefined, () => `${paramLabel}${sep}${pc.dim("undefined")}`),
    Match.when(
      P.isString,
      (stringValue) => `${paramLabel}${sep}${pc.green(`"${truncateForPreview(stringValue, 40)}"`)}`
    ),
    Match.when(P.isNumber, (numberValue) => `${paramLabel}${sep}${pc.cyan(String(numberValue))}`),
    Match.when(P.isBoolean, (booleanValue) => `${paramLabel}${sep}${pc.blue(String(booleanValue))}`),
    Match.when(S.is(RawDate), (dateValue) => `${paramLabel}${sep}${pc.magenta(dateValue.toISOString())}`),
    Match.when(A.isArray, (arrayValue) => {
      const preview = pipe(
        A.length(arrayValue) > 3 ? A.take(arrayValue, 3) : arrayValue,
        encodeJson,
        O.map((encoded) => (A.length(arrayValue) > 3 ? `${encoded} ...` : encoded)),
        O.getOrElse(() => "[Array]")
      );
      return `${paramLabel}${sep}${pc.cyan(preview)}`;
    }),
    Match.when(P.isObject, (objectValue) =>
      pipe(
        encodeJson(objectValue),
        O.map((encoded) => truncateForPreview(encoded, 50)),
        O.map((encoded) => `${paramLabel}${sep}${pc.gray(encoded)}`),
        O.getOrElse(() => `${paramLabel}${sep}${pc.gray("[Object]")}`)
      )
    ),
    Match.orElse((unknownValue) => `${paramLabel}${sep}${pc.gray(String(unknownValue))}`)
  );
};

/**
 * Removes terminal ANSI color sequences from a string.
 *
 * @since 0.0.0
 * @category Utility
 */
export const stripAnsi = (str: string): string => pipe(str, Str.replace(ansiEscapeRegex, Str.empty));

/**
 * Computes display width by stripping ANSI escapes before measuring length.
 *
 * @since 0.0.0
 * @category Utility
 */
export const visualLength = (str: string): number => pipe(str, stripAnsi, Str.length);

/**
 * Pads a string to a target visual width while preserving ANSI styling.
 *
 * @since 0.0.0
 * @category Utility
 */
export const padEnd = (str: string, targetLen: number): string => {
  const currentLen = visualLength(str);
  return pipe(
    currentLen >= targetLen,
    Match.value,
    Match.when(true, () => str),
    Match.orElse(() => `${str}${CommonStr.repeat(" ", targetLen - currentLen)}`)
  );
};

/**
 * Formats query parameters as either a compact inline block or a 3-column grid.
 *
 * @since 0.0.0
 * @category Utility
 */
export const formatParamsBlock = (params: ReadonlyArray<unknown>, boxColor: (s: string) => string): string => {
  const formattedParams = pipe(
    params,
    A.map((p, i) => formatParam(p, i))
  );
  const prefix = boxColor(BOX.teeRight);
  return pipe(
    A.length(params),
    Match.value,
    Match.when(0, thunkEmptyStr),
    Match.when(
      (count) => count <= 3,
      () => `${prefix} ${pc.dim("params")} ${pipe(formattedParams, A.join(pc.dim("  ")))}`
    ),
    Match.orElse(() => {
      // Calculate max width for each column using reduce.
      const colWidths = pipe(
        formattedParams,
        A.map((param, i): readonly [number, number] => [i % 3, visualLength(param)]),
        A.reduce({ col0: 0, col1: 0, col2: 0 }, (widths, [col, len]) =>
          pipe(
            col,
            Match.value,
            Match.when(0, () => ({ ...widths, col0: Math.max(widths.col0, len) })),
            Match.when(1, () => ({ ...widths, col1: Math.max(widths.col1, len) })),
            Match.orElse(() => ({ ...widths, col2: Math.max(widths.col2, len) }))
          )
        ),
        (w): readonly [number, number, number] => [w.col0, w.col1, w.col2]
      );

      // Grid layout for many params (3 per row).
      const rows = pipe(
        formattedParams,
        A.chunksOf(3),
        A.map((chunk, rowIndex) => {
          const rowItems = pipe(
            chunk,
            A.map((item, col) => padEnd(item, pipe(colWidths, A.get(col), O.getOrElse(thunk0))))
          );
          const linePrefix = rowIndex === 0 ? `${prefix} ${pc.dim("params")} ` : `${boxColor(BOX.vertical)}        `;
          return `${linePrefix}${pipe(rowItems, A.join(pc.dim("  ")))}`;
        })
      );

      return Text.joinLines(rows);
    })
  );
};

/**
 * Runtime schema for raw PostgreSQL protocol errors.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RawPgError = S.instanceOf(PgDatabaseError);

const stackFramePattern = /at\s+(?:.*?\s+)?\(?([^()]+):(\d+):(\d+)\)?/;

type DrizzleQueryExtraction = {
  readonly query: string | null;
  readonly params: ReadonlyArray<string>;
};

const emptyDrizzleQueryExtraction: DrizzleQueryExtraction = {
  query: null,
  params: A.empty<string>(),
};

const readStringProperty = (value: unknown, key: string): string | undefined => {
  const hasStringProperty = (input: unknown): input is Readonly<Record<string, string>> =>
    P.isObject(input) && P.hasProperty(input, key) && P.isString(input[key]);

  return pipe(
    value,
    Match.value,
    Match.when(hasStringProperty, (input) => input[key]),
    Match.orElse(thunkUndefined)
  );
};

const extractPgErrorOption = (error: unknown): O.Option<PgDatabaseError> =>
  pipe(
    error,
    Match.value,
    Match.when(
      S.is(RawPgError),
      flow((pgError: PgDatabaseError) => pgError, O.some)
    ),
    Match.when(
      S.is(RawSqlError),
      flow((sqlError: SqlError.SqlError) => sqlError.cause, O.fromNullishOr, O.flatMap(extractPgErrorOption))
    ),
    Match.when(
      S.is(RawError),
      flow((typedError: Error) => typedError.cause, O.fromNullishOr, O.flatMap(extractPgErrorOption))
    ),
    Match.orElse(O.none<PgDatabaseError>)
  );

const extractSourceLocationFromLine = (line: string): O.Option<string> =>
  pipe(
    line,
    Str.match(stackFramePattern),
    O.flatMap((match) => {
      const filePath = match[1];
      const lineNum = match[2];
      const colNum = match[3];
      const isValidPath = (path: string): boolean =>
        pipe(path, Str.startsWith("/")) &&
        !Str.includes("node_modules")(path) &&
        !Str.includes("shared/server/src/internal")(path);

      return pipe(
        O.all({
          filePath: pipe(filePath, O.liftPredicate(P.isString)),
          lineNum: pipe(lineNum, O.liftPredicate(P.isString)),
          colNum: pipe(colNum, O.liftPredicate(P.isString)),
        }),
        O.filter(({ filePath }) => isValidPath(filePath)),
        O.map(({ filePath, lineNum, colNum }) => `${filePath}:${lineNum}:${colNum}`)
      );
    })
  );

const findSourceLocationInStack = (stack: string): O.Option<string> =>
  pipe(
    stack,
    Str.split("\n"),
    A.reduce(O.none<string>(), (found, line) =>
      pipe(
        found,
        O.orElse(() => extractSourceLocationFromLine(line))
      )
    )
  );

const extractQueryFromMessage = (message: string): DrizzleQueryExtraction =>
  pipe(
    message,
    Str.match(/^Failed query:\s*(.+?)(?:\nparams:\s*(.*))?$/s),
    O.map((failedQueryMatch): DrizzleQueryExtraction => {
      const query = pipe(failedQueryMatch[1], O.fromNullishOr, O.map(Str.trim), O.getOrNull);
      const params = pipe(
        failedQueryMatch[2],
        O.fromNullishOr,
        O.map(Str.trim),
        O.filter((value) => Str.length(value) > 0),
        O.map(flow(Str.split(","), A.map(Str.trim))),
        O.getOrElse(A.empty<string>)
      );
      return { query, params };
    }),
    O.getOrElse(() => emptyDrizzleQueryExtraction)
  );

/**
 * Recursively unwraps wrapped errors to locate the originating `pg` protocol error.
 *
 * @since 0.0.0
 * @category Utility
 */
export const extractPgError = (error: unknown): PgDatabaseError | null =>
  pipe(error, extractPgErrorOption, O.getOrNull);

/**
 * Extracts the first non-internal filesystem location from an error stack.
 *
 * @since 0.0.0
 * @category Utility
 */
export const extractSourceLocation = (error: unknown): string | null =>
  pipe(
    error,
    Match.value,
    Match.when(S.is(RawError), (typedError) =>
      pipe(typedError.stack, O.fromNullishOr, O.flatMap(findSourceLocationInStack), O.getOrNull)
    ),
    Match.orElse(thunkNull)
  );

/**
 * Pulls query text and params from Drizzle's "Failed query" wrapper error message.
 *
 * @since 0.0.0
 * @category Utility
 */
export const extractQueryFromDrizzleError = (error: unknown): DrizzleQueryExtraction =>
  pipe(
    error,
    Match.value,
    Match.when(S.is(RawError), (typedError) => extractQueryFromMessage(typedError.message)),
    Match.orElse(() => emptyDrizzleQueryExtraction)
  );

/**
 * Builds a rich, terminal-friendly database error report.
 *
 * @since 0.0.0
 * @category Utility
 *
 * @example
 * ```ts-morph
 * import { formatDbError } from "@beep/shared-domain/errors/DbError/utils";
 *
 * const error = new Error("Query failed");
 *
 * formatDbError(error, "select * from users where id = $1", [42]);
 * ```
 */
export const formatDbError = (error: unknown, query?: string, params?: ReadonlyArray<unknown>): string => {
  let lines = A.empty<string>();
  const appendLine = (line: string): void => {
    lines = pipe(lines, A.append(line));
  };
  const appendLines = (nextLines: ReadonlyArray<string>): void => {
    lines = pipe(lines, A.appendAll(nextLines));
  };

  const boxColor = pc.red;

  // Extract the underlying pg error if wrapped by Drizzle.
  const pgError = extractPgError(error);
  const displayError = pgError ?? error;

  // Try to extract query from Drizzle wrapper if not provided.
  let displayQuery = query;
  let displayParams = params;
  if (P.isUndefined(displayQuery) && S.is(RawError)(error)) {
    const extracted = extractQueryFromDrizzleError(error);
    displayQuery = extracted.query ?? undefined;
    if (P.isUndefined(displayParams) && A.length(extracted.params) > 0) {
      displayParams = extracted.params;
    }
  }

  // Try the original error stack first, then fallback to formatter call-site stack.
  const sourceLocation = pipe(
    extractSourceLocation(error),
    O.fromNullishOr,
    O.orElse(() => O.fromNullishOr(extractSourceLocation(globalThis.Error()))),
    O.getOrNull
  );

  // Header with clickable source location.
  appendLine(
    sourceLocation
      ? `${boxColor(BOX.topLeft + BOX.horizontal)} ${pc.bgRed(pc.white(pc.bold(" DATABASE ERROR ")))} ${pc.dim("at")} ${pc.underline(pc.cyan(sourceLocation))}`
      : `${boxColor(BOX.topLeft + BOX.horizontal)} ${pc.bgRed(pc.white(pc.bold(" DATABASE ERROR ")))}`
  );

  // Error type and message.
  if (S.is(RawError)(displayError)) {
    appendLine(`${boxColor(BOX.vertical)}`);
    appendLine(`${boxColor(BOX.vertical)} ${pc.red(pc.bold(displayError.name))}: ${pc.white(displayError.message)}`);

    const code = readStringProperty(displayError, "code");
    const detail = readStringProperty(displayError, "detail");
    const hint = readStringProperty(displayError, "hint");
    const where = readStringProperty(displayError, "where");
    const table = readStringProperty(displayError, "table");
    const column = readStringProperty(displayError, "column");
    const constraint = readStringProperty(displayError, "constraint");
    const schema = readStringProperty(displayError, "schema");
    const severity = readStringProperty(displayError, "severity");

    if (P.isString(code) || P.isString(severity)) {
      appendLine(`${boxColor(BOX.vertical)}`);
    }
    if (P.isString(severity)) {
      appendLine(
        `${boxColor(BOX.teeRight)}${boxColor(BOX.horizontal)} ${pc.dim("severity")}   ${pc.red(pc.bold(severity))}`
      );
    }
    if (P.isString(code) && S.is(ErrorCodeFromKey)(code)) {
      const codeLabel = ErrorCodeFromKey.To.Enum[code];
      appendLine(
        `${boxColor(BOX.vertical)}  ${pc.dim("code")}       ${pc.yellow(code)}${codeLabel ? pc.dim(` (${codeLabel})`) : ""}`
      );
    }
    if (P.isString(schema)) {
      appendLine(`${boxColor(BOX.vertical)}  ${pc.dim("schema")}     ${pc.cyan(schema)}`);
    }
    if (P.isString(table)) {
      appendLine(`${boxColor(BOX.vertical)}  ${pc.dim("table")}      ${pc.cyan(table)}`);
    }
    if (P.isString(column)) {
      appendLine(`${boxColor(BOX.vertical)}  ${pc.dim("column")}     ${pc.cyan(column)}`);
    }
    if (P.isString(constraint)) {
      appendLine(`${boxColor(BOX.vertical)}  ${pc.dim("constraint")}  ${pc.magenta(constraint)}`);
    }
    if (P.isString(detail)) {
      appendLine(`${boxColor(BOX.vertical)}  ${pc.dim("detail")}     ${pc.white(detail)}`);
    }
    if (P.isString(hint)) {
      appendLine(`${boxColor(BOX.vertical)}  ${pc.dim("hint")}       ${pc.green(hint)}`);
    }
    if (P.isString(where)) {
      appendLine(`${boxColor(BOX.vertical)}  ${pc.dim("where")}      ${pc.gray(where)}`);
    }
  } else {
    appendLine(`${boxColor(BOX.vertical)} ${pc.white(String(displayError))}`);
  }

  // Show the query that caused the error.
  if (P.isString(displayQuery)) {
    appendLine(`${boxColor(BOX.vertical)}`);
    appendLine(`${boxColor(BOX.teeRight)}${boxColor(BOX.horizontal)} ${pc.dim("query")}`);

    const queryType = getQueryType(displayQuery);
    const { badge } = getQueryTypeStyle(queryType);

    // Format and highlight the query.
    const formattedQuery = format(displayQuery, {
      language: "postgresql",
      tabWidth: 2,
      keywordCase: "lower",
    });
    const highlightedQuery = highlightSql(displayQuery);

    appendLine(`${boxColor(BOX.vertical)}  ${badge}`);
    appendLines(
      pipe(
        highlightedQuery,
        Str.split("\n"),
        A.take(15),
        A.map((line) => `${boxColor(BOX.vertical)}  ${line}`)
      )
    );

    if (pipe(formattedQuery, Str.split("\n"), A.length) > 15) {
      appendLine(`${boxColor(BOX.vertical)}  ${pc.dim("… (truncated)")}`);
    }
  }

  // Show params if present.
  if (P.isNotUndefined(displayParams) && A.length(displayParams) > 0) {
    appendLine(formatParamsBlock(displayParams, boxColor));
  }

  // Footer.
  appendLine(`${boxColor(BOX.bottomLeft + BOX.horizontal)}`);

  return Text.joinLines(lines);
};
