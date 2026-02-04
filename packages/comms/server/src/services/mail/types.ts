/**
 * MailDriver Response Types
 *
 * Schemas for unified email driver responses across Google and Microsoft providers.
 * These types normalize provider-specific API responses into a common format.
 *
 * @module comms-server/services/mail/types
 * @since 0.1.0
 */
import { $CommsServerId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $CommsServerId.create("services/mail/types");

// ---------------------------------------------------------------------------
// Thread Types
// ---------------------------------------------------------------------------

/**
 * Summary of a thread for list operations
 *
 * @since 0.1.0
 * @category threads
 */
export class ThreadSummary extends S.Class<ThreadSummary>($I`ThreadSummary`)(
  {
    id: S.String,
    snippet: S.optionalWith(S.String, { as: "Option" }),
    historyId: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("ThreadSummary", {
    description: "Summary of an email thread for list operations",
  })
) {}

/**
 * Response from listing threads
 *
 * @since 0.1.0
 * @category threads
 */
export class ThreadsResponse extends S.Class<ThreadsResponse>($I`ThreadsResponse`)(
  {
    threads: S.Array(ThreadSummary),
    nextPageToken: S.optionalWith(S.String, { as: "Option" }),
    resultSizeEstimate: S.optionalWith(S.Number, { as: "Option" }),
  },
  $I.annotations("ThreadsResponse", {
    description: "Response from listing email threads",
  })
) {}

/**
 * Label info attached to a thread
 *
 * @since 0.1.0
 * @category threads
 */
export class ThreadLabel extends S.Class<ThreadLabel>($I`ThreadLabel`)(
  {
    id: S.String,
    name: S.String,
  },
  $I.annotations("ThreadLabel", {
    description: "Label information attached to a thread",
  })
) {}

/**
 * Message within a thread (driver-level representation)
 *
 * @since 0.1.0
 * @category messages
 */
export class DriverParsedMessage extends S.Class<DriverParsedMessage>($I`DriverParsedMessage`)(
  {
    id: S.String,
    threadId: S.String,
    subject: S.String,
    from: S.String,
    to: S.Array(S.String),
    cc: S.optionalWith(S.Array(S.String), { as: "Option" }),
    bcc: S.optionalWith(S.Array(S.String), { as: "Option" }),
    date: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { as: "Option" }),
    snippet: S.String,
    body: S.optionalWith(S.String, { as: "Option" }),
    labels: S.optionalWith(S.Array(S.String), { as: "Option" }),
    unread: S.Boolean,
  },
  $I.annotations("DriverParsedMessage", {
    description: "Parsed message within a thread at the driver level",
  })
) {}

/**
 * Full thread response with all messages
 *
 * @since 0.1.0
 * @category threads
 */
export class ThreadResponse extends S.Class<ThreadResponse>($I`ThreadResponse`)(
  {
    id: S.String,
    messages: S.Array(DriverParsedMessage),
    latest: S.optionalWith(DriverParsedMessage, { as: "Option" }),
    hasUnread: S.Boolean,
    totalReplies: S.Number,
    labels: S.Array(ThreadLabel),
  },
  $I.annotations("ThreadResponse", {
    description: "Full thread response with all messages",
  })
) {}

// ---------------------------------------------------------------------------
// Draft Types
// ---------------------------------------------------------------------------

/**
 * Recipient for draft/send operations
 *
 * @since 0.1.0
 * @category drafts
 */
export class Recipient extends S.Class<Recipient>($I`Recipient`)(
  {
    email: S.String,
    name: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("Recipient", {
    description: "Email recipient with optional name",
  })
) {}

/**
 * Data for creating or representing a draft
 *
 * @since 0.1.0
 * @category drafts
 */
export class DraftData extends S.Class<DraftData>($I`DraftData`)(
  {
    to: S.Array(Recipient),
    cc: S.optionalWith(S.Array(Recipient), { as: "Option" }),
    bcc: S.optionalWith(S.Array(Recipient), { as: "Option" }),
    subject: S.optionalWith(S.String, { as: "Option" }),
    body: S.optionalWith(S.String, { as: "Option" }),
    threadId: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("DraftData", {
    description: "Data for creating or representing an email draft",
  })
) {}

/**
 * Summary of a draft for list operations
 *
 * @since 0.1.0
 * @category drafts
 */
export class DraftSummary extends S.Class<DraftSummary>($I`DraftSummary`)(
  {
    id: S.String,
    message: S.optionalWith(DriverParsedMessage, { as: "Option" }),
  },
  $I.annotations("DraftSummary", {
    description: "Summary of an email draft for list operations",
  })
) {}

/**
 * Response from listing drafts
 *
 * @since 0.1.0
 * @category drafts
 */
export class DraftsResponse extends S.Class<DraftsResponse>($I`DraftsResponse`)(
  {
    drafts: S.Array(DraftSummary),
    nextPageToken: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("DraftsResponse", {
    description: "Response from listing email drafts",
  })
) {}

// ---------------------------------------------------------------------------
// Send Types
// ---------------------------------------------------------------------------

/**
 * Result of sending an email or draft
 *
 * @since 0.1.0
 * @category send
 */
export class SendResult extends S.Class<SendResult>($I`SendResult`)(
  {
    id: S.optionalWith(S.String, { as: "Option" }),
    threadId: S.optionalWith(S.String, { as: "Option" }),
    success: S.Boolean,
  },
  $I.annotations("SendResult", {
    description: "Result of sending an email or draft",
  })
) {}

// ---------------------------------------------------------------------------
// Label Types
// ---------------------------------------------------------------------------

/**
 * Color configuration for a label
 *
 * @since 0.1.0
 * @category labels
 */
export class DriverLabelColor extends S.Class<DriverLabelColor>($I`DriverLabelColor`)(
  {
    backgroundColor: S.String,
    textColor: S.String,
  },
  $I.annotations("DriverLabelColor", {
    description: "Color configuration for an email label",
  })
) {}

/**
 * Label type indicator
 *
 * @since 0.1.0
 * @category labels
 */
export const LabelType = S.Literal("system", "user");
export type LabelType = S.Schema.Type<typeof LabelType>;

/**
 * Email label (driver-level representation)
 *
 * @since 0.1.0
 * @category labels
 */
export class DriverLabel extends S.Class<DriverLabel>($I`DriverLabel`)(
  {
    id: S.String,
    name: S.String,
    type: S.optionalWith(LabelType, { as: "Option" }),
    color: S.optionalWith(DriverLabelColor, { as: "Option" }),
  },
  $I.annotations("DriverLabel", {
    description: "Email label at the driver level",
  })
) {}

// ---------------------------------------------------------------------------
// Input Types
// ---------------------------------------------------------------------------

/**
 * Parameters for listing threads
 *
 * @since 0.1.0
 * @category inputs
 */
export class ListThreadsParams extends S.Class<ListThreadsParams>($I`ListThreadsParams`)(
  {
    folder: S.optionalWith(S.String, { as: "Option" }),
    query: S.optionalWith(S.String, { as: "Option" }),
    maxResults: S.optionalWith(S.Number, { as: "Option" }),
    labelIds: S.optionalWith(S.Array(S.String), { as: "Option" }),
    pageToken: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("ListThreadsParams", {
    description: "Parameters for listing email threads",
  })
) {}

/**
 * Parameters for sending an email
 *
 * @since 0.1.0
 * @category inputs
 */
export class SendMailParams extends S.Class<SendMailParams>($I`SendMailParams`)(
  {
    to: S.Array(S.String),
    cc: S.optionalWith(S.Array(S.String), { as: "Option" }),
    bcc: S.optionalWith(S.Array(S.String), { as: "Option" }),
    subject: S.String,
    body: S.String,
    threadId: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("SendMailParams", {
    description: "Parameters for sending an email",
  })
) {}

/**
 * Parameters for listing drafts
 *
 * @since 0.1.0
 * @category inputs
 */
export class ListDraftsParams extends S.Class<ListDraftsParams>($I`ListDraftsParams`)(
  {
    q: S.optionalWith(S.String, { as: "Option" }),
    maxResults: S.optionalWith(S.Number, { as: "Option" }),
    pageToken: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("ListDraftsParams", {
    description: "Parameters for listing email drafts",
  })
) {}

/**
 * Parameters for creating a label
 *
 * @since 0.1.0
 * @category inputs
 */
export class CreateLabelParams extends S.Class<CreateLabelParams>($I`CreateLabelParams`)(
  {
    name: S.String,
    color: S.optionalWith(DriverLabelColor, { as: "Option" }),
  },
  $I.annotations("CreateLabelParams", {
    description: "Parameters for creating an email label",
  })
) {}

/**
 * Parameters for modifying labels on messages
 *
 * @since 0.1.0
 * @category inputs
 */
export class ModifyLabelsParams extends S.Class<ModifyLabelsParams>($I`ModifyLabelsParams`)(
  {
    addLabels: S.optionalWith(S.Array(S.String), { as: "Option" }),
    removeLabels: S.optionalWith(S.Array(S.String), { as: "Option" }),
  },
  $I.annotations("ModifyLabelsParams", {
    description: "Parameters for modifying labels on email messages",
  })
) {}

// ---------------------------------------------------------------------------
// Type Exports
// ---------------------------------------------------------------------------

export declare namespace ThreadSummary {
  export type Type = typeof ThreadSummary.Type;
  export type Encoded = typeof ThreadSummary.Encoded;
}

export declare namespace ThreadsResponse {
  export type Type = typeof ThreadsResponse.Type;
  export type Encoded = typeof ThreadsResponse.Encoded;
}

export declare namespace ThreadResponse {
  export type Type = typeof ThreadResponse.Type;
  export type Encoded = typeof ThreadResponse.Encoded;
}

export declare namespace DriverParsedMessage {
  export type Type = typeof DriverParsedMessage.Type;
  export type Encoded = typeof DriverParsedMessage.Encoded;
}

export declare namespace Recipient {
  export type Type = typeof Recipient.Type;
  export type Encoded = typeof Recipient.Encoded;
}

export declare namespace DraftData {
  export type Type = typeof DraftData.Type;
  export type Encoded = typeof DraftData.Encoded;
}

export declare namespace DraftSummary {
  export type Type = typeof DraftSummary.Type;
  export type Encoded = typeof DraftSummary.Encoded;
}

export declare namespace DraftsResponse {
  export type Type = typeof DraftsResponse.Type;
  export type Encoded = typeof DraftsResponse.Encoded;
}

export declare namespace SendResult {
  export type Type = typeof SendResult.Type;
  export type Encoded = typeof SendResult.Encoded;
}

export declare namespace DriverLabel {
  export type Type = typeof DriverLabel.Type;
  export type Encoded = typeof DriverLabel.Encoded;
}

export declare namespace DriverLabelColor {
  export type Type = typeof DriverLabelColor.Type;
  export type Encoded = typeof DriverLabelColor.Encoded;
}
