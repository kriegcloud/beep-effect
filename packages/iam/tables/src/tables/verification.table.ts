import { IamEntityIds } from "@beep/shared-domain";
import { datetime, Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
export const verification = Table.make(IamEntityIds.VerificationId)(
  {
    identifier: pg.text("identifier").notNull(),
    value: pg.text("value").notNull(),
    expiresAt: datetime("expires_at").notNull(),
  },
  (t) => [
    // Index for verification lookups (email verification, password reset)
    pg.index("verification_identifier_idx").on(t.identifier),

    // Composite index for identifier-value verification (most common query)
    pg.index("verification_identifier_value_idx").on(t.identifier, t.value),

    // Index for cleanup of expired verifications
    pg.index("verification_expires_at_idx").on(t.expiresAt),

    // Index for active verifications (removed NOW() predicate - filter at query time instead)
    pg.index("verification_active_idx").on(t.identifier, t.expiresAt),
  ]
);
