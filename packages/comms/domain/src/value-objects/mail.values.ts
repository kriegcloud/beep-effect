import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("value-objects/mail.values");

export class LabelColor extends S.Class<LabelColor>($I`LabelColor`)(
  {
    backgroundColor: BS.HexColor,
    textColor: BS.HexColor,
  },
  $I.annotations("LabelColor", {
    description: "The values for an emails label color.",
  })
) {}

const labelFields = {
  type: S.NonEmptyString,
  id: S.UUID,
  name: BS.NameAttribute,
  color: S.optionalWith(LabelColor, { as: "Option" }),
  count: S.optionalWith(S.NonNegativeInt, { as: "Option" }),
};

interface LabelEncoded extends S.Struct.Encoded<typeof labelFields> {
  readonly labels?: undefined | ReadonlyArray<LabelEncoded>;
}

export class Label extends S.Class<Label>($I`Label`)(
  {
    ...labelFields,
    labels: S.optional(S.Array(S.suspend((): S.Schema<Label, LabelEncoded, never> => Label))),
  },
  $I.annotations("Label", {
    description: "The values for an emails label.",
  })
) {}

export class AttachmentHeader extends S.Class<AttachmentHeader>($I`AttachmentHeader`)(
  {
    name: S.optionalWith(BS.NameAttribute, { as: "Option", nullable: true }),
    value: S.optionalWith(S.String, { as: "Option", nullable: true }),
  },
  $I.annotations("AttachmentHeader", {
    description: "The values for an emails attachment header.",
  })
) {}

export class Attachment extends S.Class<Attachment>($I`Attachment`)(
  {
    attachmentId: S.UUID,
    filename: BS.NameAttribute,
    mimeType: BS.MimeType,
    size: S.NonNegativeInt,
    body: S.String,
    headers: S.Array(AttachmentHeader),
  },
  $I.annotations("Attachment", {
    description: "The values for an emails attachment.",
  })
) {}

export class MailListProps extends S.Class<MailListProps>($I`MailListProps`)({
  isCompact: S.optionalWith(S.Boolean, { as: "Option" }),
}) {}

export class MailSelectMode extends BS.StringLiteralKit("mass", "range", "single", "selectAllBelow").annotations(
  $I.annotations("MailSelectMode", {
    description: "The values for an emails select mode.",
  })
) {}
export class ThreadPropsMessage extends S.Class<ThreadPropsMessage>($I`ThreadPropsMessage`)(
  {
    id: S.UUID,
  },
  $I.annotations("ThreadPropsMessage", {
    description: "The values for an emails thread props message.",
  })
) {}

export declare namespace MailSelectMode {
  export type Type = typeof MailSelectMode.Type;
}

export class MailUser extends S.Class<MailUser>($I`MailUser`)(
  {
    name: BS.NameAttribute,
    email: BS.Email,
    avatar: BS.URLString,
  },
  $I.annotations("MailUser", {
    description: "The values for an emails user.",
  })
) {}

export class Sender extends S.Class<Sender>($I`Sender`)(
  {
    name: S.optionalWith(BS.NameAttribute, { as: "Option" }),
    email: BS.Email,
  },
  $I.annotations("Sender", {
    description: "The values for an emails sender.",
  })
) {}

export class EmailProvider extends BS.StringLiteralKit("google", "microsoft").annotations(
  $I.annotations("EmailProvider", {
    description: "The value for an email provider.",
  })
) {}

export declare namespace EmailProvider {
  export type Type = typeof EmailProvider.Type;
}

export class SubscribeBatch extends S.Class<SubscribeBatch>($I`SubscribeBatch`)(
  {
    connectionId: S.NonEmptyTrimmedString,
    providerId: EmailProvider,
  },
  $I.annotations("SubscribeBatch", {
    description: "The values for an emails subscribe batch.",
  })
) {}

export class ThreadBatch extends S.Class<ThreadBatch>($I`ThreadBatch`)(
  {
    providerId: EmailProvider,
    historyId: S.NonEmptyTrimmedString,
    subscriptionName: S.String,
  },
  $I.annotations("ThreadBatch", {
    description: "The values for an emails thread batch.",
  })
) {}

export class SnoozeBatch extends S.Class<SnoozeBatch>($I`SnoozeBatch`)(
  {
    connectionId: S.String,
    threadIds: S.Array(S.String),
    keyNames: S.Array(S.String),
  },
  $I.annotations("SnoozeBatch", {
    description: "The values for an emails snooze batch.",
  })
) {}

export const DEFAULT_LABELS = [
  {
    name: "to respond",
    usecase: "emails you need to respond to. NOT sales, marketing, or promotions.",
  },
  {
    name: "FYI",
    usecase: "emails that are not important, but you should know about. NOT sales, marketing, or promotions.",
  },
  {
    name: "comment",
    usecase: "Team chats in tools like Google Docs, Slack, etc. NOT marketing, sales, or promotions.",
  },
  {
    name: "notification",
    usecase: "Automated updates from services you use. NOT sales, marketing, or promotions.",
  },
  {
    name: "promotion",
    usecase: "Sales, marketing, cold emails, special offers or promotions. NOT to respond to.",
  },
  {
    name: "meeting",
    usecase: "Calendar events, invites, etc. NOT sales, marketing, or promotions.",
  },
  {
    name: "billing",
    usecase: "Billing notifications. NOT sales, marketing, or promotions.",
  },
];

export class SendMailInput extends S.Class<SendMailInput>($I`SendMailInput`)(
  {
    to: S.Array(Sender),
    subject: S.String,
    message: S.String,
    attachments: S.optionalWith(S.Array(BS.FileFromSelf), { as: "Option" }),
    headers: S.optionalWith(S.Record({ key: S.String, value: S.String }), { as: "Option" }),
    cc: S.optionalWith(S.Array(Sender), { as: "Option" }),
    bcc: S.optionalWith(S.Array(Sender), { as: "Option" }),
    threadId: S.optionalWith(S.String, { as: "Option" }),
    fromEmail: S.optionalWith(BS.Email, { as: "Option" }),
  },
  $I.annotations("SendMailInput", {
    description: "The values for an emails send mail input.",
  })
) {}

export class MailAccount extends S.Class<MailAccount>($I`MailAccount`)(
  {
    name: BS.NameAttribute,
    email: BS.Email,
  },
  $I.annotations("MailAccount", {
    description: "The values for an emails mail account.",
  })
) {}

export class MailTag extends S.Class<MailTag>($I`MailTag`)(
  {
    id: S.UUID,
    name: BS.NameAttribute,
    type: S.String,
  },
  $I.annotations("MailTag", {
    description: "The values for an emails mail tag.",
  })
) {}

export class ParsedMessage extends S.Class<ParsedMessage>($I`ParsedMessage`)(
  {
    id: S.UUID,
    connectionId: S.optionalWith(S.String, { as: "Option" }),
    title: BS.NameAttribute,
    subject: S.String,
    tags: S.Array(MailTag),
    sender: Sender,
    to: S.Array(Sender),
    cc: S.optionalWith(S.Array(Sender), { as: "Option", nullable: true }),
    bcc: S.optionalWith(S.Array(Sender), { as: "Option", nullable: true }),
    tls: S.Boolean,
    listUnsubscribe: S.optionalWith(S.String, { as: "Option", nullable: true }),
    listUnsubscribeHeader: S.optionalWith(S.String, { as: "Option", nullable: true }),
    receivedOn: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { as: "Option" }),
    unread: S.Boolean,
    body: S.String,
    processedHtml: S.String,
    blobUrl: S.String,
    decodedBody: S.optionalWith(S.String, { as: "Option" }),
    references: S.optionalWith(S.String, { as: "Option" }),
    inReplyTo: S.optionalWith(S.String, { as: "Option" }),
    replyTo: S.optionalWith(S.String, { as: "Option" }),
    messageId: S.optionalWith(S.String, { as: "Option" }),
    threadId: S.optionalWith(S.String, { as: "Option" }),
    attachments: S.optionalWith(Attachment, { as: "Option" }),
    isDraft: S.optionalWith(S.Boolean, {
      as: "Option",
    }),
  },
  $I.annotations("ParsedMessage", {
    description: "The values for an emails parsed message.",
  })
) {}

export class Tools extends BS.StringLiteralKit(
  "getThreadSummary",
  "getThread",
  "composeEmail",
  "deleteEmail",
  "markThreadsRead",
  "markThreadsUnread",
  "modifyLabels",
  "getUserLabels",
  "sendEmail",
  "createLabel",
  "bulkDelete",
  "bulkArchive",
  "deleteLabel",
  "askZeroMailbox",
  "askZeroThread",
  "webSearch",
  "inboxRag",
  "buildGmailSearchQuery",
  "getCurrentDate"
).annotations(
  $I.annotations("Tools", {
    description: "The values for an emails tools.",
  })
) {}

export declare namespace Tools {
  export type Type = typeof Tools.Type;
}

export class EmailPrompts extends BS.StringLiteralKit(
  "SummarizeMessage",
  "ReSummarizeThread",
  "SummarizeThread",
  "Chat",
  "Compose"
).annotations(
  $I.annotations("EmailPrompts", {
    description: "The values for an emails prompts.",
  })
) {}

export declare namespace EmailPrompts {
  export type Type = typeof EmailPrompts.Type;
}

export class OutgoingMessage extends S.Class<OutgoingMessage>($I`OutgoingMessage`)(
  {
    to: S.Array(Sender),
    cc: S.optionalWith(S.Array(Sender), { as: "Option" }),
    bcc: S.optionalWith(S.Array(Sender), { as: "Option" }),
    subject: S.String,
    message: S.String,
    attachments: S.Array(BS.FileFromSelf),
    headers: S.Record({ key: S.String, value: S.String }),
    threadId: S.optionalWith(S.String, { as: "Option" }),
    fromEmail: S.optionalWith(BS.Email, { as: "Option" }),
    isForward: S.optionalWith(S.Boolean, { as: "Option" }),
    originalMessage: S.optionalWith(ParsedMessage, { as: "Option", nullable: true }),
  },
  $I.annotations("OutgoingMessage", {
    description: "The values for an emails outgoing message.",
  })
) {}

export class DeleteAllSpamResponse extends S.Class<DeleteAllSpamResponse>($I`DeleteAllSpamResponse`)(
  {
    success: S.Boolean,
    message: S.String,
    count: S.optionalWith(S.NonNegativeInt, { as: "Option" }),
    error: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("DeleteAllSpamResponse", {
    description: "The values for an emails delete all spam response.",
  })
) {}

export class EmailSendBatchMail extends OutgoingMessage.extend<EmailSendBatchMail>($I`EmailSendBatchMail`)(
  {
    draftId: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("EmailSendBatchMail", {
    description: "The values for an emails send batch mail.",
  })
) {}

export class EmailSendBatch extends S.Class<EmailSendBatch>($I`EmailSendBatch`)(
  {
    messageId: S.String,
    connectionId: S.String,
    mail: S.optionalWith(EmailSendBatchMail, { as: "Option" }),
    sendAt: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { as: "Option" }),
  },
  $I.annotations("EmailSendBatch", {
    description: "The values for an emails send batch.",
  })
) {}

export class ThreadProps extends S.Class<ThreadProps>($I`ThreadProps`)(
  {
    message: ThreadPropsMessage,
    selectMode: MailSelectMode,
    onClick: S.optionalWith(
      BS.Fn({
        input: ParsedMessage,
        output: S.Void,
      }),
      { as: "Option" }
    ),
    isCompact: S.optionalWith(S.Boolean, { as: "Option" }),
    folder: S.optionalWith(S.String, { as: "Option" }),
    isKeyboardFocused: S.optionalWith(S.Boolean, { as: "Option" }),
    isInQuickActionMode: S.optionalWith(S.Boolean, { as: "Option" }),
    selectedQuickActionIndex: S.optionalWith(S.NonNegativeInt, { as: "Option" }),
    resetNavigation: S.optionalWith(
      BS.Fn({
        input: S.Undefined,
        output: S.Void,
      }),
      { as: "Option" }
    ),
    demoMessage: S.optionalWith(ParsedMessage, { as: "Option" }),
  },
  $I.annotations("ThreadProps", {
    description: "The values for an emails thread props.",
  })
) {}

export class ThreadPropsSessionData extends S.Class<ThreadPropsSessionData>($I`ThreadPropsSessionData`)(
  {
    userId: SharedEntityIds.UserId,
    connectionId: S.OptionFromNullOr(S.String),
  },
  $I.annotations("ThreadPropsSessionData", {
    description: "The values for an emails thread props session data.",
  })
) {}

export class ConditionalThreadProps extends S.Union(
  S.Struct({
    demo: BS.LiteralWithDefault(true),
    sessionData: S.optionalWith(ThreadPropsSessionData, { as: "Option" }),
  }),
  S.Struct({ demo: BS.LiteralWithDefault(false), sessionData: ThreadPropsSessionData })
) {}
