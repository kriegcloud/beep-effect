import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("pg_serial");
/**
 * PostgreSQL SERIAL (auto-incrementing integer primary key).
 *
 * Equivalent to an INT with a sequence default (`nextval`).
 * Non-negative because it starts at 1.
 */
export class PgSerialSchema extends S.NonNegativeInt.annotations(
  Id.annotations("PgSerial", {
    description: "Auto-incrementing 32-bit integer primary key. Equivalent to PostgreSQL SERIAL.",
  })
) {}

export declare namespace PgSerialSchema {
  export type Type = S.Schema.Type<typeof PgSerialSchema>;
  export type Encoded = S.Schema.Encoded<typeof PgSerialSchema>;
}
