import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $YjsId.create("protocol/Comments");

export class MetadataValue extends S.Union(S.String, S.Boolean, S.Number, S.Undefined).annotations(
  $I.annotations("MetadataValue", {
    description: "Metadata value for Yjs protocol",
  })
) {}

export declare namespace MetadataValue {
  export type Type = S.Schema.Type<typeof MetadataValue>;
  export type Encoded = S.Schema.Encoded<typeof MetadataValue>;
}

export class BaseMetadata extends S.Record({
  key: S.String,
  value: MetadataValue,
}).annotations(
  $I.annotations("BaseMetadata", {
    description: "Base metadata for Yjs protocol",
  })
) {}

export declare namespace BaseMetadata {
  export type Type = S.Schema.Type<typeof BaseMetadata>;
  export type Encoded = S.Schema.Encoded<typeof BaseMetadata>;
}

export class CommentReaction extends S.Class<CommentReaction>($I`CommentReaction`)(
  {
    emoji: S.String,
    createdAt: BS.DateTimeUtcFromAllAcceptable,
    users: S.Array(S.Struct({ id: S.String })),
  },
  $I.annotations("CommentReaction", {
    description: "Comment reaction for Yjs protocol",
  })
) {}

export class CommentAttachment extends S.Class<CommentAttachment>($I`CommentAttachment`)(
  {
    type: S.tag("attachment"),
    id: S.String,
    name: S.String,
    size: S.NonNegativeInt,
    mimeType: BS.MimeType,
  },
  $I.annotations("CommentAttachment", {
    description: "Comment attachment for Yjs protocol",
  })
) {}

export class CommentLocalAttachmentIdle extends S.Class<CommentLocalAttachmentIdle>($I`CommentLocalAttachmentIdle`)(
  {
    type: S.tag("localAttachment"),
    status: S.Literal("idle"),
    id: S.String,
    name: S.String,
    size: S.NonNegativeInt,
    mimeType: BS.MimeType,
    file: BS.FileFromSelf,
  },
  $I.annotations("CommentLocalAttachmentIdle", {
    description: "Comment local attachment idle for Yjs protocol",
  })
) {}

export class CommentLocalAttachmentUploading extends S.Class<CommentLocalAttachmentUploading>(
  $I`CommentLocalAttachmentUploading`
)(
  {
    type: S.tag("localAttachment"),
    status: S.Literal("uploading"),
    id: S.String,
    name: S.String,
    size: S.NonNegativeInt,
    mimeType: BS.MimeType,
    file: BS.FileFromSelf,
  },
  $I.annotations("CommentLocalAttachmentUploading", {
    description: "Comment local attachment uploading for Yjs protocol",
  })
) {}

export class CommentLocalAttachmentUploaded extends S.Class<CommentLocalAttachmentUploaded>(
  $I`CommentLocalAttachmentUploaded`
)(
  {
    type: S.tag("localAttachment"),
    status: S.Literal("uploaded"),
    id: S.String,
    name: S.String,
    size: S.NonNegativeInt,
    mimeType: BS.MimeType,
    file: BS.FileFromSelf,
  },
  $I.annotations("CommentLocalAttachmentUploaded", {
    description: "Comment local attachment uploaded for Yjs protocol",
  })
) {}

export class CommentLocalAttachmentError extends S.TaggedError<CommentLocalAttachmentError>(
  $I`CommentLocalAttachmentError`
)(
  "CommentLocalAttachmentError",
  {
    type: S.tag("localAttachment"),
    status: S.Literal("error"),
    id: S.String,
    name: S.String,
    size: S.NonNegativeInt,
    mimeType: BS.MimeType,
    file: BS.FileFromSelf,
    error: S.Defect,
  },
  $I.annotations("CommentLocalAttachmentError", {
    description: "Comment local attachment error for Yjs protocol",
  })
) {}

export class CommentLocalAttachment extends S.Union(
  CommentLocalAttachmentIdle,
  CommentLocalAttachmentUploading,
  CommentLocalAttachmentUploaded,
  CommentLocalAttachmentError
).annotations(
  $I.annotations("CommentLocalAttachment", {
    description: "Comment local attachment for Yjs protocol",
  })
) {}

export declare namespace CommentLocalAttachment {
  export type Type = S.Schema.Type<typeof CommentLocalAttachment>;
  export type Encoded = S.Schema.Encoded<typeof CommentLocalAttachment>;
}

export class CommentMixedAttachment extends S.Union(CommentAttachment, CommentLocalAttachment).annotations(
  $I.annotations("CommentMixedAttachment", {
    description: "Comment mixed attachment for Yjs protocol",
  })
) {}

export declare namespace CommentMixedAttachment {
  export type Type = S.Schema.Type<typeof CommentMixedAttachment>;
  export type Encoded = S.Schema.Encoded<typeof CommentMixedAttachment>;
}

// ===========================
// Comment Body Types
// ===========================

/**
 * Represents text formatting in comment body.
 */
export class CommentBodyText extends S.Struct({
  bold: S.optional(S.Boolean),
  italic: S.optional(S.Boolean),
  strikethrough: S.optional(S.Boolean),
  code: S.optional(S.Boolean),
  text: S.String,
}).annotations(
  $I.annotations("CommentBodyText", {
    description: "Text node with optional formatting in comment body",
  })
) {}

export declare namespace CommentBodyText {
  export type Type = S.Schema.Type<typeof CommentBodyText>;
  export type Encoded = S.Schema.Encoded<typeof CommentBodyText>;
}

/**
 * Represents a hyperlink in comment body.
 */
export class CommentBodyLink extends S.Struct({
  type: S.tag("link"),
  url: S.String,
  text: S.optional(S.String),
}).annotations(
  $I.annotations("CommentBodyLink", {
    description: "Hyperlink in comment body",
  })
) {}

export declare namespace CommentBodyLink {
  export type Type = S.Schema.Type<typeof CommentBodyLink>;
  export type Encoded = S.Schema.Encoded<typeof CommentBodyLink>;
}

/**
 * Represents a user mention in comment body.
 */
export class CommentBodyUserMention extends S.Struct({
  type: S.tag("mention"),
  kind: S.Literal("user"),
  id: S.String,
}).annotations(
  $I.annotations("CommentBodyUserMention", {
    description: "User mention in comment body",
  })
) {}

export declare namespace CommentBodyUserMention {
  export type Type = S.Schema.Type<typeof CommentBodyUserMention>;
  export type Encoded = S.Schema.Encoded<typeof CommentBodyUserMention>;
}

/**
 * Represents a group mention in comment body.
 */
export class CommentBodyGroupMention extends S.Struct({
  type: S.tag("mention"),
  kind: S.Literal("group"),
  id: S.String,
  userIds: S.optional(S.Array(S.String)),
}).annotations(
  $I.annotations("CommentBodyGroupMention", {
    description: "Group mention in comment body",
  })
) {}

export declare namespace CommentBodyGroupMention {
  export type Type = S.Schema.Type<typeof CommentBodyGroupMention>;
  export type Encoded = S.Schema.Encoded<typeof CommentBodyGroupMention>;
}

/**
 * Union of user and group mentions.
 */
export class CommentBodyMention extends S.Union(CommentBodyUserMention, CommentBodyGroupMention).annotations(
  $I.annotations("CommentBodyMention", {
    description: "User or group mention in comment body",
  })
) {}

export declare namespace CommentBodyMention {
  export type Type = S.Schema.Type<typeof CommentBodyMention>;
  export type Encoded = S.Schema.Encoded<typeof CommentBodyMention>;
}

/**
 * Union of all inline elements that can appear in a comment body.
 */
export class CommentBodyInlineElement extends S.Union(CommentBodyText, CommentBodyMention, CommentBodyLink).annotations(
  $I.annotations("CommentBodyInlineElement", {
    description: "Inline element in comment body (text, mention, or link)",
  })
) {}

export declare namespace CommentBodyInlineElement {
  export type Type = S.Schema.Type<typeof CommentBodyInlineElement>;
  export type Encoded = S.Schema.Encoded<typeof CommentBodyInlineElement>;
}

/**
 * Represents a paragraph block in comment body.
 * Uses suspend for recursive reference to CommentBodyInlineElement.
 */
export class CommentBodyParagraph extends S.Struct({
  type: S.tag("paragraph"),
  children: S.Array(CommentBodyInlineElement),
}).annotations(
  $I.annotations("CommentBodyParagraph", {
    description: "Paragraph block containing inline elements",
  })
) {}

export declare namespace CommentBodyParagraph {
  export type Type = S.Schema.Type<typeof CommentBodyParagraph>;
  export type Encoded = S.Schema.Encoded<typeof CommentBodyParagraph>;
}

/**
 * Block element in comment body (currently only paragraph).
 */
export const CommentBodyBlockElement = CommentBodyParagraph;

export declare namespace CommentBodyBlockElement {
  export type Type = S.Schema.Type<typeof CommentBodyBlockElement>;
  export type Encoded = S.Schema.Encoded<typeof CommentBodyBlockElement>;
}

/**
 * Union of all element types (block and inline).
 */
export class CommentBodyElement extends S.Union(CommentBodyBlockElement, CommentBodyInlineElement).annotations(
  $I.annotations("CommentBodyElement", {
    description: "Any element in comment body (block or inline)",
  })
) {}

export declare namespace CommentBodyElement {
  export type Type = S.Schema.Type<typeof CommentBodyElement>;
  export type Encoded = S.Schema.Encoded<typeof CommentBodyElement>;
}

/**
 * Complete comment body structure with version.
 */
export class CommentBody extends S.Struct({
  version: S.Literal(1),
  content: S.Array(CommentBodyBlockElement),
}).annotations(
  $I.annotations("CommentBody", {
    description: "Complete comment body with versioned content",
  })
) {}

export declare namespace CommentBody {
  export type Type = S.Schema.Type<typeof CommentBody>;
  export type Encoded = S.Schema.Encoded<typeof CommentBody>;
}

// ===========================
// Comment User Reaction
// ===========================

/**
 * Represents a single user's reaction to a comment.
 */
export class CommentUserReaction extends S.Class<CommentUserReaction>($I`CommentUserReaction`)(
  {
    emoji: S.String,
    createdAt: BS.DateTimeUtcFromAllAcceptable,
    userId: S.String,
  },
  $I.annotations("CommentUserReaction", {
    description: "A single user's reaction to a comment",
  })
) {}

// ===========================
// Comment Data
// ===========================

/**
 * Base comment data fields shared by all comment states.
 */
const CommentDataBase = S.Struct({
  type: S.tag("comment"),
  id: S.String,
  threadId: S.String,
  roomId: S.String,
  userId: S.String,
  createdAt: BS.DateTimeUtcFromAllAcceptable,
  editedAt: S.optional(BS.DateTimeUtcFromAllAcceptable),
  reactions: S.Array(CommentReaction),
  attachments: S.Array(CommentAttachment),
});

/**
 * Active comment with body content.
 */
const CommentDataWithBody = S.extend(
  CommentDataBase,
  S.Struct({
    body: CommentBody,
  })
);

/**
 * Deleted comment with deletedAt timestamp.
 */
const CommentDataDeleted = S.extend(
  CommentDataBase,
  S.Struct({
    deletedAt: BS.DateTimeUtcFromAllAcceptable,
  })
);

/**
 * Represents a comment - either active with body or deleted.
 * Corresponds to: Relax<{ body: CommentBody } | { deletedAt: Date }>
 */
export class CommentData extends S.Union(CommentDataWithBody, CommentDataDeleted).annotations(
  $I.annotations("CommentData", {
    description: "A comment with either body content or deletion timestamp",
  })
) {}

export declare namespace CommentData {
  export type Type = S.Schema.Type<typeof CommentData>;
  export type Encoded = S.Schema.Encoded<typeof CommentData>;
}

// ===========================
// Thread Data
// ===========================

/**
 * Generic schema constructor for ThreadData.
 *
 * @param metadataSchema - Schema for thread metadata (must be a record type)
 */
export const ThreadData = <M extends S.Schema.Any>(metadataSchema: M) => {
  return S.Struct({
    type: S.tag("thread"),
    id: S.String,
    roomId: S.String,
    createdAt: BS.DateTimeUtcFromAllAcceptable,
    updatedAt: BS.DateTimeUtcFromAllAcceptable,
    comments: S.Array(CommentData),
    metadata: metadataSchema,
    resolved: S.Boolean,
  }).annotations(
    $I.annotations("ThreadData", {
      description: "A thread of comments with metadata",
    })
  );
};

/**
 * Generic schema constructor for ThreadDataWithDeleteInfo.
 * Adds optional deletedAt field to ThreadData.
 */
export const ThreadDataWithDeleteInfo = <M extends S.Schema.Any>(metadataSchema: M) => {
  return S.extend(
    ThreadData(metadataSchema),
    S.Struct({
      deletedAt: S.optional(BS.DateTimeUtcFromAllAcceptable),
    })
  ).annotations(
    $I.annotations("ThreadDataWithDeleteInfo", {
      description: "Thread data with optional deletion timestamp",
    })
  );
};

/**
 * Thread deletion info.
 */
export class ThreadDeleteInfo extends S.Class<ThreadDeleteInfo>($I`ThreadDeleteInfo`)(
  {
    type: S.tag("deletedThread"),
    id: S.String,
    roomId: S.String,
    deletedAt: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("ThreadDeleteInfo", {
    description: "Deletion information for a thread",
  })
) {}

// ===========================
// Search & Query Types
// ===========================

/**
 * Search result for comments.
 */
export class SearchCommentsResult extends S.Struct({
  threadId: S.String,
  commentId: S.String,
  content: S.String,
}).annotations(
  $I.annotations("SearchCommentsResult", {
    description: "Search result containing thread ID, comment ID, and matching content",
  })
) {}

export declare namespace SearchCommentsResult {
  export type Type = S.Schema.Type<typeof SearchCommentsResult>;
  export type Encoded = S.Schema.Encoded<typeof SearchCommentsResult>;
}

/**
 * Generic schema constructor for QueryMetadata.
 *
 * Creates a partial schema with operator support for each metadata field.
 * This allows building type-safe metadata queries.
 *
 * Note: The original TypeScript types supported conditional operators (StringOperators, NumberOperators)
 * based on field types. This simplified version returns a partial schema.
 * For advanced query operators, compose custom schemas using the metadata schema as a base.
 *
 * @param metadataSchema - Base metadata schema to create query operators for
 */
export const QueryMetadata = <M extends S.Schema.Any>(metadataSchema: M) => {
  return S.partial(metadataSchema).annotations(
    $I.annotations("QueryMetadata", {
      description: "Query operators for metadata fields",
    })
  );
};
