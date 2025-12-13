import { $SharedInfraId } from "@beep/identity/packages";
import * as SqlError from "@effect/sql/SqlError";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as S from "effect/Schema";
import * as pg from "pg";
import pc from "picocolors";
import { format } from "sql-formatter";
import { BOX, QueryType, SqlString } from "./formatter";
// import { DrizzleQueryError, DrizzleError, TransactionRollbackError } from "drizzle-orm/errors";
import { PgErrorCodeFromKey } from "./pg-error-enum";

const $I = $SharedInfraId.create("internal/pg/errors");

export class RawPgError extends S.declare(
  (error: unknown): error is pg.DatabaseError => error instanceof pg.DatabaseError
).annotations(
  $I.annotations("RawPgError", {
    description: "Raw pg.DatabaseError that occurs when a database operation fails.",
  })
) {
  static readonly is = S.is(RawPgError);
}

export class DatabaseError extends S.TaggedError<DatabaseError>($I`DatabaseError`)(
  "DatabaseError",
  {
    type: S.optional(PgErrorCodeFromKey.From),
    pgError: S.optional(S.NullOr(RawPgError)),
    cause: S.Defect,
  },
  $I.annotations("DatabaseError", {
    description: "Error that occurs when a database operation fails.",
  })
) {
  /**
   * Extracts the underlying pg.DatabaseError from a potentially wrapped error.
   * Drizzle wraps pg errors in its own Error with the original in the `cause` property.
   */
  static readonly extractPgError = (error: unknown): pg.DatabaseError | null => {
    // Direct pg.DatabaseError
    if (RawPgError.is(error)) {
      return error;
    }

    // SqlError
    if (error instanceof SqlError.SqlError && error.cause) {
      return DatabaseError.extractPgError(error.cause);
    }

    // Drizzle wraps errors - check the cause chain
    if (error instanceof Error && error.cause) {
      return DatabaseError.extractPgError(error.cause);
    }
    return null;
  };

  static readonly $match = (error: unknown) => {
    const pgError = DatabaseError.extractPgError(error);
    if (pgError !== null) {
      return Match.value(pgError).pipe(
        Match.when(
          { code: PgErrorCodeFromKey.Enum.UNIQUE_VIOLATION },
          (err) =>
            new DatabaseError({
              type: PgErrorCodeFromKey.EnumReverse[err.code],
              pgError: err,
              cause: error,
            })
        ),
        Match.when(
          { code: PgErrorCodeFromKey.Enum.FOREIGN_KEY_VIOLATION },
          (err) =>
            new DatabaseError({
              type: PgErrorCodeFromKey.EnumReverse[err.code],
              pgError: err,
              cause: error,
            })
        ),
        Match.when(
          { code: PgErrorCodeFromKey.Enum.CONNECTION_EXCEPTION },
          (err) =>
            new DatabaseError({
              type: PgErrorCodeFromKey.EnumReverse[err.code],
              pgError: err,
              cause: error,
            })
        ),
        Match.when(
          { code: PgErrorCodeFromKey.Enum.CHECK_VIOLATION },
          (err) =>
            new DatabaseError({
              type: PgErrorCodeFromKey.EnumReverse[err.code],
              pgError: err,
              cause: error,
            })
        ),
        Match.when(
          { code: PgErrorCodeFromKey.Enum.NOT_NULL_VIOLATION },
          (err) =>
            new DatabaseError({
              type: PgErrorCodeFromKey.EnumReverse[err.code],
              pgError: err,
              cause: error,
            })
        ),
        Match.orElse(
          () =>
            new DatabaseError({
              type: PgErrorCodeFromKey.EnumReverse[pgError.code as typeof PgErrorCodeFromKey.Type],
              pgError,
              cause: error,
            })
        )
      );
    }
    return new DatabaseError({
      pgError: null,
      cause: error,
    });
  };

  /**
   * Extracts the error source location from the stack trace.
   * Returns the first stack frame from user code (not node_modules or shared-infra internal paths).
   * Format: "file:line:column" for easy click-to-navigate in terminals/IDEs.
   */
  static readonly extractSourceLocation = (error: unknown): string | null => {
    if (!(error instanceof Error) || !error.stack) return null;

    const stackLines = error.stack.split("\n");
    // Skip the error message line(s) and find actual stack frames
    for (const line of stackLines) {
      // Match stack frame patterns: "at ... (path:line:col)" or "at path:line:col"
      const match = line.match(/at\s+(?:.*?\s+)?\(?([^()]+):(\d+):(\d+)\)?/);
      if (match) {
        const [, filePath, lineNum, colNum] = match;
        // Skip internal paths, node_modules, and non-file paths (native, etc.)
        if (
          filePath &&
          filePath.startsWith("/") && // Must be an absolute file path
          !filePath.includes("node_modules") &&
          !filePath.includes("shared/infra/src/internal") // Skip our internal db code
        ) {
          return `${filePath}:${lineNum}:${colNum}`;
        }
      }
    }
    return null;
  };

  /**
   * Extracts query and params from Drizzle's error message format:
   * "Failed query: <SQL>\nparams: <comma-separated values>"
   */
  static readonly extractQueryFromDrizzleError = (error: unknown): { query: string | null; params: string[] } => {
    if (!(error instanceof Error)) return { query: null, params: [] };

    const message = error.message;
    const failedQueryMatch = message.match(/^Failed query:\s*(.+?)(?:\nparams:\s*(.*))?$/s);

    if (failedQueryMatch) {
      const query = failedQueryMatch[1]?.trim() ?? null;
      const paramsStr = failedQueryMatch[2]?.trim() ?? "";
      // Parse comma-separated params (basic parsing, values may contain commas in strings)
      const params = paramsStr ? paramsStr.split(",").map((p) => p.trim()) : [];
      return { query, params };
    }

    return { query: null, params: [] };
  };

  static readonly format = (error: unknown, query?: string, params?: unknown[]): string => {
    const lines: string[] = [];
    const boxColor = pc.red;

    // Extract the underlying pg error if wrapped by Drizzle
    const pgError = DatabaseError.extractPgError(error);
    const displayError = pgError ?? error;

    // Try to extract query from Drizzle wrapper if not provided
    let displayQuery = query;
    let displayParams = params;
    if (!displayQuery && error instanceof Error) {
      const extracted = DatabaseError.extractQueryFromDrizzleError(error);
      displayQuery = extracted.query ?? undefined;
      if (!displayParams && extracted.params.length > 0) {
        displayParams = extracted.params;
      }
    }

    // Extract source location - try the error first, then use current stack as fallback
    // (the current stack will point to where format() was called, which is usually in the error handler)
    let sourceLocation = DatabaseError.extractSourceLocation(error);
    if (!sourceLocation) {
      // Capture current stack trace to find the call site
      const currentStack = new Error();
      sourceLocation = DatabaseError.extractSourceLocation(currentStack);
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
        code?: string;
        detail?: string;
        hint?: string;
        where?: string;
        table?: string;
        column?: string;
        constraint?: string;
        schema?: string;
        severity?: string;
      };

      if (pgDetails.code || pgDetails.severity) {
        lines.push(`${boxColor(BOX.vertical)}`);
      }
      if (pgDetails.severity) {
        lines.push(
          `${boxColor(BOX.teeRight)}${boxColor(BOX.horizontal)} ${pc.dim("severity")}   ${pc.red(pc.bold(pgDetails.severity))}`
        );
      }
      if (pgDetails.code) {
        const codeLabel = PgErrorCodeFromKey.EnumReverse[pgDetails.code as keyof typeof PgErrorCodeFromKey.EnumReverse];
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

      const queryType = QueryType.getQueryType(displayQuery);
      const { badge } = QueryType.getQueryTypeStyle(queryType);

      // Format and highlight the query
      const formattedQuery = format(displayQuery, {
        language: "postgresql",
        tabWidth: 2,
        keywordCase: "lower",
      });
      const highlightedQuery = SqlString.highlightSql(displayQuery);

      lines.push(`${boxColor(BOX.vertical)}  ${badge}`);
      highlightedQuery
        .split("\n")
        .slice(0, 15)
        .forEach((line) => {
          lines.push(`${boxColor(BOX.vertical)}  ${line}`);
        });

      if (formattedQuery.split("\n").length > 15) {
        lines.push(`${boxColor(BOX.vertical)}  ${pc.dim("… (truncated)")}`);
      }
    }

    // Show params if present
    if (displayParams && displayParams.length > 0) {
      lines.push(SqlString.formatParamsBlock(displayParams, boxColor));
    }

    // Footer
    lines.push(`${boxColor(BOX.bottomLeft + BOX.horizontal)}`);

    return lines.join("\n");
  };
}

export class DatabaseConnectionLostError extends S.TaggedError<DatabaseConnectionLostError>(
  $I`DatabaseConnectionLostError`
)(
  "DatabaseConnectionLostError",
  {
    cause: S.Defect,
    message: S.String,
  },
  $I.annotations("DatabaseConnectionLostError", {
    description: "Error that occurs when the database connection is lost.",
  })
) {
  static readonly constNew = (params: { cause: unknown; message: string }) =>
    F.constant(new DatabaseConnectionLostError(params));
}
