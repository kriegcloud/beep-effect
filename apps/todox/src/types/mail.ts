/**
 * Mail types for todox UI - bridges @beep/comms-domain schemas to UI-friendly types.
 *
 * These types adapt the more complex comms-domain schemas for use in UI components
 * where Options need to be resolved and structures simplified.
 */
import {
  type Attachment as CommsAttachment,
  type Label as CommsLabel,
  LabelColor,
  MailUser,
  Sender,
} from "@beep/comms-domain/value-objects/mail.values";
import * as O from "effect/Option";
import * as S from "effect/Schema";

// Re-export core types from comms-domain for direct usage
export { LabelColor, MailUser, Sender };

// ----------------------------------------------------------------------
// UI Label - simplified version of comms-domain Label for UI rendering
// ----------------------------------------------------------------------

/**
 * Simplified label type for UI components.
 * Resolves Options to nullable values for easier UI consumption.
 */
export class MailLabel extends S.Class<MailLabel>("MailLabel")({
  id: S.String,
  type: S.String,
  name: S.String,
  color: S.NullOr(S.String),
  unreadCount: S.optional(S.Number),
}) {}

/**
 * Convert a comms-domain Label to a UI MailLabel
 */
export const fromCommsLabel = (label: typeof CommsLabel.Type): typeof MailLabel.Type => ({
  id: label.id,
  type: label.type,
  name: label.name,
  color: O.match(label.color, {
    onNone: () => null,
    onSome: (c) => c.backgroundColor,
  }),
  unreadCount: O.getOrUndefined(label.count),
});

// ----------------------------------------------------------------------
// UI Mail Sender - uses MailUser structure with nullable avatar
// ----------------------------------------------------------------------

/**
 * Sender type for mail UI components with nullable avatar.
 */
export class MailSender extends S.Class<MailSender>("MailSender")({
  name: S.String,
  email: S.String,
  avatarUrl: S.NullOr(S.String),
}) {}

/**
 * Convert a comms-domain MailUser to a UI MailSender
 */
export const fromCommsMailUser = (user: typeof MailUser.Type): typeof MailSender.Type => ({
  name: user.name as string,
  email: user.email as unknown as string,
  avatarUrl: user.avatar as string,
});

/**
 * Convert a comms-domain Sender to a UI MailSender
 */
export const fromCommsSender = (sender: typeof Sender.Type, avatarUrl?: null | string): typeof MailSender.Type => ({
  name: O.getOrElse(sender.name, () => "Unknown") as string,
  email: sender.email as unknown as string,
  avatarUrl: avatarUrl ?? null,
});

// ----------------------------------------------------------------------
// UI Mail Attachment - simplified attachment for UI display
// ----------------------------------------------------------------------

/**
 * Simplified attachment type for mail UI components.
 * Different from comms-domain Attachment which is more API-focused.
 */
export class MailAttachment extends S.Class<MailAttachment>("MailAttachment")({
  id: S.String,
  name: S.String,
  size: S.Number,
  type: S.String,
  path: S.String,
  preview: S.String,
  createdAt: S.Union(S.String, S.Number, S.Null),
  modifiedAt: S.Union(S.String, S.Number, S.Null),
}) {}

/**
 * Convert a comms-domain Attachment to a UI MailAttachment
 */
export const fromCommsAttachment = (attachment: typeof CommsAttachment.Type): typeof MailAttachment.Type => ({
  id: attachment.attachmentId,
  name: attachment.filename,
  size: attachment.size,
  type: attachment.mimeType,
  path: `/attachments/${attachment.filename}`,
  preview: `/attachments/preview-${attachment.attachmentId}.png`,
  createdAt: null,
  modifiedAt: null,
});

// ----------------------------------------------------------------------
// UI Mail - complete mail item for list and detail views
// ----------------------------------------------------------------------

/**
 * Complete mail type for UI components.
 * Combines sender, attachments, and metadata in a UI-friendly structure.
 */
export class Mail extends S.Class<Mail>("Mail")({
  id: S.String,
  folder: S.String,
  subject: S.String,
  message: S.String,
  isUnread: S.Boolean,
  from: MailSender,
  to: S.Array(MailSender),
  labelIds: S.Array(S.String),
  isStarred: S.Boolean,
  isImportant: S.Boolean,
  createdAt: S.Union(S.String, S.Number, S.Null),
  attachments: S.Array(MailAttachment),
}) {}

// ----------------------------------------------------------------------
// Mails Collection - normalized mail storage for efficient lookups
// ----------------------------------------------------------------------

/**
 * Normalized mail collection with allIds for ordering and byId for lookups.
 */
export class Mails extends S.Class<Mails>("Mails")({
  allIds: S.Array(S.String),
  byId: S.Record({ key: S.String, value: Mail }),
}) {}

// ----------------------------------------------------------------------
// Type aliases for backwards compatibility
// ----------------------------------------------------------------------

export type IMailLabel = typeof MailLabel.Type;
export type IMailSender = typeof MailSender.Type;
export type IMailAttachment = typeof MailAttachment.Type;
export type IMail = typeof Mail.Type;
export type IMails = typeof Mails.Type;
