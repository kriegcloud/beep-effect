import * as A from "effect/Array";
import * as S from "effect/Schema";

export class EnronEmail extends S.Class<EnronEmail>("EnronEmail")({
  from: S.String,
  to: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
  cc: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
  bcc: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
  date: S.DateFromString,
  subject: S.String,
  messageId: S.String,
  inReplyTo: S.optional(S.String),
  references: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
  body: S.String,
  folder: S.String,
  user: S.String,
}) {}

export class EnronThreadDateRange extends S.Class<EnronThreadDateRange>("EnronThreadDateRange")({
  start: S.DateFromString,
  end: S.DateFromString,
}) {}

export class EnronThread extends S.Class<EnronThread>("EnronThread")({
  threadId: S.String,
  messages: S.Array(EnronEmail),
  participants: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
  depth: S.NonNegativeInt,
  dateRange: EnronThreadDateRange,
}) {}

export class EnronDocumentSpan extends S.Class<EnronDocumentSpan>("EnronDocumentSpan")({
  label: S.String,
  start: S.NonNegativeInt,
  end: S.NonNegativeInt,
}) {}

export class EnronDocumentMetadata extends S.Class<EnronDocumentMetadata>("EnronDocumentMetadata")({
  sender: S.String,
  recipients: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
  threadId: S.String,
  messageId: S.String,
  originalDate: S.DateFromString,
  folder: S.String,
  user: S.String,
  inReplyTo: S.optional(S.String),
  references: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
}) {}

export class EnronDocument extends S.Class<EnronDocument>("EnronDocument")({
  id: S.String,
  title: S.String,
  body: S.String,
  metadata: EnronDocumentMetadata,
  spans: S.optionalWith(S.Array(EnronDocumentSpan), { default: A.empty<EnronDocumentSpan> }),
}) {}
