import * as S from "effect/Schema";

// ----------------------------------------------------------------------
// Shared Schema for date values (string | number | null)
// ----------------------------------------------------------------------

export const DateValue = S.Union(S.String, S.Number, S.Null);
export type IDateValue = S.Schema.Type<typeof DateValue>;

// ----------------------------------------------------------------------
// Mail Label
// ----------------------------------------------------------------------

export class MailLabel extends S.Class<MailLabel>("MailLabel")({
  id: S.String,
  type: S.String,
  name: S.String,
  color: S.String,
  unreadCount: S.optional(S.Number),
}) {}

// ----------------------------------------------------------------------
// Mail Sender
// ----------------------------------------------------------------------

export class MailSender extends S.Class<MailSender>("MailSender")({
  name: S.String,
  email: S.String,
  avatarUrl: S.NullOr(S.String),
}) {}

// ----------------------------------------------------------------------
// Mail Attachment
// ----------------------------------------------------------------------

export class MailAttachment extends S.Class<MailAttachment>("MailAttachment")({
  id: S.String,
  name: S.String,
  size: S.Number,
  type: S.String,
  path: S.String,
  preview: S.String,
  createdAt: DateValue,
  modifiedAt: DateValue,
}) {}

// ----------------------------------------------------------------------
// Mail
// ----------------------------------------------------------------------

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
  createdAt: DateValue,
  attachments: S.Array(MailAttachment),
}) {}

// ----------------------------------------------------------------------
// Mails (collection with allIds and byId)
// ----------------------------------------------------------------------

export class Mails extends S.Class<Mails>("Mails")({
  allIds: S.Array(S.String),
  byId: S.Record({ key: S.String, value: Mail }),
}) {}
