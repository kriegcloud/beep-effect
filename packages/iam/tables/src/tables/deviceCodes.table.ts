import { DeviceCode } from "@beep/iam-domain/entities";
import { IamEntityIds } from "@beep/shared-domain";
import { datetime, Table, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const deviceCodeStatusPgEnum = DeviceCode.makeDeviceCodeStatusPgEnum("device_code_status_enum");
/**
 * DeviceCodes table schema for storing OAuth 2.0 Device Authorization data.
 * Each record represents a device authorization request (device code flow).
 */
export const deviceCode = Table.make(IamEntityIds.DeviceCodeId)({
  /** Device verification code issued to the device (long random string, not shown to user). */
  deviceCode: pg.text("device_code").notNull(),
  /** User-friendly code for verification (short code the user enters on the auth page). */
  userCode: pg.text("user_code").notNull(),
  /** ID of the user who approved or denied the request (nullable until user acts). */
  userId: pg.text("user_id").references(() => user.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  /** Timestamp when the device code expires and becomes invalid. */
  expiresAt: datetime("expires_at").notNull(),
  /** Current status of the request (e.g., "pending", "approved", or "denied"). */
  status: deviceCodeStatusPgEnum("status").notNull().default(DeviceCode.DeviceCodeStatus.Enum.pending),
  /** Timestamp of the last time the device polled for authorization status (nullable). */
  lastPolledAt: datetime("last_polled_at"),
  /** Minimum interval in seconds the device should wait between polls (nullable). */
  pollingInterval: pg.integer("polling_interval"),
  /** OAuth client identifier for the application/device making the request (nullable). */
  clientId: pg.text("client_id"),
  /** Requested OAuth scopes for this authorization (nullable, space-separated string). */
  scope: pg.text("scope"),
});
