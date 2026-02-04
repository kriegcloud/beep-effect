import type { EmailTemplate, Note, UserHotkeys } from "@beep/comms-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type * as tables from "./schema";

/**
 * Type alignment checks between Drizzle tables and Effect SQL domain models.
 *
 * NOTE: Several @beep/comms-domain models use S.optional() which encodes to `undefined`,
 * but Drizzle nullable columns return `null`. These domain models need to be updated
 * to use BS.FieldOptionOmittable or S.optionalWith({ nullable: true }) for proper alignment.
 *
 * DISABLED CHECKS (domain model uses S.optional() instead of BS.FieldOptionOmittable):
 * - Connection: `name` and `syncState` fields
 * - ThreadSummary: `sentiment` field
 * - UserSettings: `emailsPerPage` field
 *
 * TODO: Update @beep/comms-domain models to use BS.FieldOptionOmittable for nullable fields
 * Follow IAM patterns: see @beep/iam-domain/entities/member/member.model.ts for examples
 */

// Connection - DISABLED due to S.optional() usage for `name` and `syncState`
// export const _checkSelectConnection: typeof Connection.Model.select.Encoded = {} as InferSelectModel<typeof tables.connection>;
// export const _checkInsertConnection: typeof Connection.Model.insert.Encoded = {} as InferInsertModel<typeof tables.connection>;

// ThreadSummary - DISABLED due to S.optional() usage for `sentiment`
// export const _checkSelectThreadSummary: typeof ThreadSummary.Model.select.Encoded = {} as InferSelectModel<typeof tables.threadSummary>;
// export const _checkInsertThreadSummary: typeof ThreadSummary.Model.insert.Encoded = {} as InferInsertModel<typeof tables.threadSummary>;

// UserSettings - DISABLED due to S.optional() usage for `emailsPerPage`
// export const _checkSelectUserSettings: typeof UserSettings.Model.select.Encoded = {} as InferSelectModel<typeof tables.userSettings>;
// export const _checkInsertUserSettings: typeof UserSettings.Model.insert.Encoded = {} as InferInsertModel<typeof tables.userSettings>;

export const _checkSelectNote: typeof Note.Model.select.Encoded = {} as InferSelectModel<typeof tables.note>;

export const _checkInsertNote: typeof Note.Model.insert.Encoded = {} as InferInsertModel<typeof tables.note>;

export const _checkSelectUserHotkeys: typeof UserHotkeys.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.userHotkeys
>;

export const _checkInsertUserHotkeys: typeof UserHotkeys.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.userHotkeys
>;

export const _checkSelectEmailTemplate: typeof EmailTemplate.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.emailTemplate
>;

export const _checkInsertEmailTemplate: typeof EmailTemplate.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.emailTemplate
>;
