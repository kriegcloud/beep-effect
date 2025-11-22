import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const { $SchemasTmpId: Id } = $CommsDomainId.compose("value-objects").$ValueObjectsId.compose("schemas-tmp");

export class MailLabel extends S.Class<MailLabel>(Id`MailLabel`)({
  id: S.String,
  type: S.String,
  name: S.String,
  color: S.String,
  unreadCount: S.optional(S.Number),
}) {}

export class MailSender extends S.Class<MailSender>(Id`MailSender`)({
  name: S.String,
  email: BS.EmailBase,
  avatarUrl: S.NullOr(BS.URLString),
}) {}

export class MailAttachment extends S.Class<MailAttachment>(Id`MailAttachment`)({
  id: S.String,
  name: S.String,
  size: S.Number,
  type: S.String,
  path: S.String,
  preview: S.String,
  createdAt: S.DateTimeUtc,
  updatedAt: S.DateTimeUtc,
}) {}

export class Mail extends S.Class<Mail>(Id`Mail`)({
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
  createdAt: S.DateTimeUtc,
  attachments: S.Array(MailAttachment),
}) {}

export class Mails extends S.Class<Mails>(Id`Mails`)({
  allIds: S.Array(S.String),
  byId: S.Record({
    key: S.String,
    value: Mail,
  }),
}) {}
