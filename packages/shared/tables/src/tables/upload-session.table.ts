import type { Entities } from "@beep/shared-domain";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as pg from "drizzle-orm/pg-core";
import { OrgTable } from "../OrgTable";

/**
 * Drizzle schema definition for the `upload_session` table.
 *
 * @since 1.0.0
 * @category Tables
 *
 * @remarks
 * This table stores temporary upload session data for HMAC signature verification.
 * Sessions are created during upload initiation and deleted after successful
 * verification or by the cleanup job when expired.
 *
 * ## Table Design
 * - **Primary Key**: `_rowId` (auto-generated internal ID from OrgTable)
 * - **Public ID**: `id` (UploadSessionId for external reference)
 * - **TTL Pattern**: `expiresAt` column with cleanup job running every 5 minutes
 * - **Multi-tenancy**: `organizationId` for tenant isolation (from OrgTable)
 * - **Metadata Storage**: JSONB column for flexible metadata storage
 *
 * ## Cleanup Requirements
 * A scheduled job must run periodically to delete expired sessions:
 * - Frequency: Every 5 minutes (configurable)
 * - Query: `DELETE FROM upload_session WHERE expires_at < NOW()`
 *
 * @see Upload.Service for session storage/retrieval operations
 */
export const uploadSession = OrgTable.make(SharedEntityIds.UploadSessionId)(
  {
    /**
     * S3 object key - unique identifier for the upload target.
     *
     * @remarks
     * The fileKey is unique to ensure at most one active session per upload target.
     * Natural deduplication occurs if client retries initiation.
     */
    fileKey: pg.text("file_key").notNull().unique().$type<typeof Entities.UploadSession.Model.fields.fileKey.Encoded>(),

    /**
     * HMAC-SHA256 signature for verification.
     *
     * @remarks
     * Format: `hmac-sha256=<64-hex-characters>`
     * Total length: 12 (prefix) + 64 (hex) = 76 characters
     */
    signature: pg.text("signature").notNull(),

    /**
     * Signed metadata payload as JSONB.
     *
     * @remarks
     * Stored as JSONB for:
     * 1. Efficient querying if needed
     * 2. Schema flexibility for different upload types
     * 3. PostgreSQL native JSON validation
     */
    metadata: pg.text("metadata").notNull().$type<typeof Entities.UploadSession.Model.fields.metadata.Encoded>(),

    /**
     * Expiration timestamp for TTL enforcement.
     *
     * @remarks
     * Stored with timezone for correct UTC handling.
     * Indexed for efficient cleanup queries.
     */
    expiresAt: pg.timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    /**
     * Index for efficient cleanup queries.
     *
     * @remarks
     * Supports: `DELETE FROM upload_session WHERE expires_at < NOW()`
     * Cleanup runs every 5 minutes.
     */
    pg
      .index("upload_session_expires_at_idx")
      .on(t.expiresAt),

    /**
     * Index for fileKey lookups during verification.
     *
     * @remarks
     * Supports efficient lookups by fileKey during upload completion.
     */
    pg
      .index("upload_session_file_key_idx")
      .on(t.fileKey),
  ]
);
