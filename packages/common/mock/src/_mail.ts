import * as S from "effect/Schema";

// ----------------------------------------------------------------------
// Shared Schema for date values (string | number | null)
// ----------------------------------------------------------------------

export const DateValue = S.Union(S.String, S.Number, S.Null);
export type IDateValue = S.Schema.Type<typeof DateValue>;

// ----------------------------------------------------------------------
// Mail Label
// ----------------------------------------------------------------------

export const MailLabel = S.Struct({
  id: S.String,
  type: S.String,
  name: S.String,
  color: S.String,
  unreadCount: S.optional(S.Number),
});
export type IMailLabel = S.Schema.Type<typeof MailLabel>;

// ----------------------------------------------------------------------
// Mail Sender
// ----------------------------------------------------------------------

export const MailSender = S.Struct({
  name: S.String,
  email: S.String,
  avatarUrl: S.NullOr(S.String),
});
export type IMailSender = S.Schema.Type<typeof MailSender>;

// ----------------------------------------------------------------------
// Mail Attachment
// ----------------------------------------------------------------------

export const MailAttachment = S.Struct({
  id: S.String,
  name: S.String,
  size: S.Number,
  type: S.String,
  path: S.String,
  preview: S.String,
  createdAt: DateValue,
  modifiedAt: DateValue,
});
export type IMailAttachment = S.Schema.Type<typeof MailAttachment>;

// ----------------------------------------------------------------------
// Mail
// ----------------------------------------------------------------------

export const Mail = S.Struct({
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
});
export type IMail = typeof Mail.Type;

// ----------------------------------------------------------------------
// Mails (collection with allIds and byId)
// ----------------------------------------------------------------------

export const Mails = S.Struct({
  allIds: S.Array(S.String),
  byId: S.Record({ key: S.String, value: Mail }),
});
export type IMails = S.Schema.Type<typeof Mails>;
