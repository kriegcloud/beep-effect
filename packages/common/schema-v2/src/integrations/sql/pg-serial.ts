/**
 * SQL integration schemas for PostgreSQL serial identifiers.
 *
 * Mirrors Drizzle/Bun serial types so schema-v2 consumers can brand auto-incrementing IDs.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { PgSerialSchema } from "@beep/schema-v2/integrations/sql/pg-serial";
 *
 * S.decodeSync(PgSerialSchema)(42);
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
import { Id } from "@beep/schema-v2/integrations/sql/_id";
import * as S from "effect/Schema";

/**
 * PostgreSQL SERIAL (auto-incrementing integer primary key).
 *
 * Equivalent to an INT with a sequence default (`nextval`). Non-negative because it starts at 1.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { PgSerialSchema } from "@beep/schema-v2/integrations/sql/pg-serial";
 *
 * const value = S.decodeSync(PgSerialSchema)(1337);
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export class PgSerialSchema extends S.NonNegativeInt.annotations(
  Id.annotations("pg-serial/PgSerial", {
    description: "Auto-incrementing 32-bit integer primary key. Equivalent to PostgreSQL SERIAL.",
  })
) {}

/**
 * Namespace exposing helper types for the `PgSerialSchema`.
 *
 * @example
 * import type { PgSerialSchema } from "@beep/schema-v2/integrations/sql/pg-serial";
 *
 * type Serial = PgSerialSchema.Type;
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export declare namespace PgSerialSchema {
  /**
   * Runtime type of the PostgreSQL serial schema.
   *
   * @example
   * import type { PgSerialSchema } from "@beep/schema-v2/integrations/sql/pg-serial";
   *
   * let identifier: PgSerialSchema.Type;
   *
   * @category Integrations/Sql
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof PgSerialSchema>;
  /**
   * Encoded representation accepted by the serial schema.
   *
   * @example
   * import type { PgSerialSchema } from "@beep/schema-v2/integrations/sql/pg-serial";
   *
   * let encoded: PgSerialSchema.Encoded;
   *
   * @category Integrations/Sql
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof PgSerialSchema>;
}
