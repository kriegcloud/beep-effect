import { createColors } from "@beep/colors";
import {
  extractPostgresDiagnostics,
  formatPostgresError,
  formatSql,
  getPgErrorAliases,
  getPgErrorName,
  PgErrorCanonicalNameByCode,
  PostgresError,
} from "@beep/postgres";
import { loadNativePgDrizzle, loadNativePgDrizzleMigrator, NativePgClient } from "@beep/postgres/interop";
import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as O from "effect/Option";

describe("PostgresError", () => {
  it("extracts SQLSTATE diagnostics from pg-like failures", () => {
    const cause = {
      code: "23505",
      constraint: "users_email_key",
      detail: "Key (email) already exists.",
      message: "duplicate key value violates unique constraint",
      severity: "ERROR",
      table: "users",
    };
    const error = PostgresError.fromUnknown("query", cause, {
      query: "select * from users where email = $1",
      params: ["a@example.com"],
    });

    expect(error._tag).toBe("PostgresError");
    expect(error.operation).toBe("query");
    expect(O.getOrThrow(error.sqlState)).toBe("23505");
    expect(O.getOrThrow(error.sqlStateName)).toBe("UNIQUE_VIOLATION");
    expect(O.getOrThrow(error.constraintName)).toBe("users_email_key");
    expect(O.getOrThrow(error.query)).toBe("select * from users where email = $1");
    expect(O.getOrThrow(error.params)).toEqual(["a@example.com"]);
  });

  it("keeps duplicate SQLSTATE aliases without losing the canonical name", () => {
    const aliases = O.getOrThrow(getPgErrorAliases("22008"));

    expect(PgErrorCanonicalNameByCode["22008"]).toBe("DATETIME_FIELD_OVERFLOW");
    expect(A.contains(aliases, "DATETIME_FIELD_OVERFLOW")).toBe(true);
    expect(A.contains(aliases, "DATETIME_VALUE_OUT_OF_RANGE")).toBe(true);
    expect(O.getOrThrow(getPgErrorName("23505"))).toBe("UNIQUE_VIOLATION");
  });

  it("extracts Drizzle failed query messages", () => {
    const cause = new Error("Failed query: select 1 where id = $1\nparams: 1");
    const diagnostics = extractPostgresDiagnostics(cause);

    expect(O.getOrThrow(diagnostics.query)).toBe("select 1 where id = $1");
    expect(O.getOrThrow(diagnostics.params)).toEqual(["1"]);
  });
});

describe("Postgres formatting", () => {
  it("formats SQL and parameters with a disabled color palette", () => {
    const rendered = formatSql("select * from users where id = $1", [1], createColors(false));

    expect(rendered).toContain("select");
    expect(rendered).toContain("from");
    expect(rendered).toContain("$1=1");
  });

  it("formats Postgres errors", () => {
    const rendered = formatPostgresError(
      PostgresError.fromUnknown("query", {
        code: "23505",
        message: "duplicate key",
      }),
      createColors(false)
    );

    expect(rendered).toContain("POSTGRES ERROR");
    expect(rendered).toContain("23505");
    expect(rendered).toContain("UNIQUE_VIOLATION");
  });
});

describe("Postgres interop", () => {
  it("keeps native Drizzle imports lazy at module load", () => {
    expect(NativePgClient.PgClient).toBeDefined();
    expect(loadNativePgDrizzle).toBeDefined();
    expect(loadNativePgDrizzleMigrator).toBeDefined();
  });
});
