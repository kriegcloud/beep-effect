import type { PostgresErrorEnum } from "@beep/core-db/postgres/postgres-error.enum";
import type { DrizzleQueryError } from "drizzle-orm/errors";
import * as Data from "effect/Data";

export class DatabaseError<BaseError extends { message: string } = { message: string }> extends Data.TaggedError(
  "DatabaseError"
)<{
  readonly type: keyof typeof PostgresErrorEnum | "UNKNOWN";
  readonly cause: BaseError;
  readonly drizzleError: DrizzleQueryError | null;
}> {
  public override toString() {
    return `DatabaseError: ${this.message}`;
  }

  public override get message() {
    return `[${this.type}] ${this.cause.message} ${this.drizzleError ? `\n\t${this.drizzleError.message}` : ""}`;
  }
}
