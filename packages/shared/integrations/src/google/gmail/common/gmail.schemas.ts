import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { thunkUndefined } from "@beep/utils";
import * as Encoding from "effect/Encoding";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SharedIntegrationsId.create("google/gmail/common/parse");

/**
 * Common helper for nullable optional string fields
 */
const CommonGmailField = S.optionalWith(S.String, { nullable: true });

/**
 * Common helper for nullable optional boolean fields
 */
const CommonGmailBoolField = S.optionalWith(S.Boolean, { nullable: true });

/**
 * Common helper for nullable optional number fields
 */
const CommonGmailNumberField = S.optionalWith(S.Number, { nullable: true });

/**
 * Common helper for nullable optional string array fields
 */
const CommonGmailStringArrayField = S.optionalWith(S.Array(S.String), { nullable: true });

// ============================================================================
// Base Types
// ============================================================================

export class GmailUserAgentDirective extends S.Class<GmailUserAgentDirective>($I`GmailUserAgentDirective`)(
  {
    product: S.String.annotations({
      description: "Product name",
    }),
    version: S.String.annotations({
      description: "Product version",
    }),
    comment: S.optional(S.String).annotations({
      description: "Optional comment",
    }),
  },
  $I.annotations("GmailUserAgentDirective", {
    description: "User agent directive for API requests.",
  })
) {}

export class GmailStandardParameters extends S.Class<GmailStandardParameters>($I`GmailStandardParameters`)(
  {
    auth: S.optional(S.String).annotations({
      description: "Auth client or API Key for the request",
    }),
    errorFormat: S.optional(S.String).pipe(S.fromKey("$.xgafv")).annotations({
      description: "V1 error format.",
    }),
    accessToken: S.optional(S.String).pipe(S.fromKey("access_token")).annotations({
      description: "OAuth access token.",
    }),
    alt: S.optional(S.String).annotations({
      description: "Data format for response.",
    }),
    callback: S.optional(S.String).annotations({
      description: "JSONP",
    }),
    fields: S.optional(S.String).annotations({
      description: "Selector specifying which fields to include in a partial response.",
    }),
    key: S.optional(S.String).annotations({
      description:
        "API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token.",
    }),
    oauthToken: S.optional(S.String).pipe(S.fromKey("oauth_token")).annotations({
      description: "OAuth 2.0 token for the current user.",
    }),
    prettyPrint: S.optional(S.Boolean).annotations({
      description: "Returns response with indentations and line breaks.",
    }),
    quotaUser: S.optional(S.String).annotations({
      description:
        "Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters.",
    }),
    uploadType: S.optional(S.String).annotations({
      description: 'Legacy upload protocol for media (e.g. "media", "multipart").',
    }),
    uploadProtocol: S.optional(S.String).pipe(S.fromKey("upload_protocol")).annotations({
      description: 'Upload protocol for media (e.g. "raw", "multipart").',
    }),
  },
  $I.annotations("GmailStandardParameters", {
    description: "Standard parameters for a gmail request.",
  })
) {}

// ============================================================================
// Auto-Forwarding & Batch Operations
// ============================================================================

export class GmailAutoForwarding extends S.Class<GmailAutoForwarding>($I`GmailAutoForwarding`)(
  {
    disposition: CommonGmailField.annotations({
      description: "The state that a message should be left in after it has been forwarded.",
    }),
    emailAddress: CommonGmailField.annotations({
      description:
        "Email address to which all incoming messages are forwarded. This email address must be a verified member of the forwarding addresses.",
    }),
    enabled: CommonGmailBoolField.annotations({
      description: "Whether all incoming mail is automatically forwarded to another address.",
    }),
  },
  $I.annotations("GmailAutoForwarding", {
    description: "Auto-forwarding settings for an account.",
  })
) {}

export class GmailBatchDeleteMessagesRequest extends S.Class<GmailBatchDeleteMessagesRequest>(
  $I`GmailBatchDeleteMessagesRequest`
)(
  {
    ids: CommonGmailStringArrayField.annotations({
      description: "The IDs of the messages to delete.",
    }),
  },
  $I.annotations("GmailBatchDeleteMessagesRequest", {
    description: "Request to batch delete messages.",
  })
) {}

export class GmailBatchModifyMessagesRequest extends S.Class<GmailBatchModifyMessagesRequest>(
  $I`GmailBatchModifyMessagesRequest`
)(
  {
    addLabelIds: CommonGmailStringArrayField.annotations({
      description: "A list of label IDs to add to messages.",
    }),
    ids: CommonGmailStringArrayField.annotations({
      description: "The IDs of the messages to modify. There is a limit of 1000 ids per request.",
    }),
    removeLabelIds: CommonGmailStringArrayField.annotations({
      description: "A list of label IDs to remove from messages.",
    }),
  },
  $I.annotations("GmailBatchModifyMessagesRequest", {
    description: "Request to batch modify messages.",
  })
) {}

// ============================================================================
// Classification Labels
// ============================================================================

export class GmailClassificationLabelFieldValue extends S.Class<GmailClassificationLabelFieldValue>(
  $I`GmailClassificationLabelFieldValue`
)(
  {
    fieldId: CommonGmailField.annotations({
      description:
        "Required. The field ID for the Classification Label Value. Maps to the ID field of the Google Drive `Label.Field` object.",
    }),
    selection: CommonGmailField.annotations({
      description:
        "Selection choice ID for the selection option. Should only be set if the field type is `SELECTION` in the Google Drive `Label.Field` object. Maps to the id field of the Google Drive `Label.Field.SelectionOptions` resource.",
    }),
  },
  $I.annotations("GmailClassificationLabelFieldValue", {
    description: "Field values for a classification label.",
  })
) {}

export class GmailClassificationLabelValue extends S.Class<GmailClassificationLabelValue>(
  $I`GmailClassificationLabelValue`
)(
  {
    fields: S.optional(S.Array(GmailClassificationLabelFieldValue)).annotations({
      description: "Field values for the given classification label ID.",
    }),
    labelId: CommonGmailField.annotations({
      description:
        "Required. The canonical or raw alphanumeric classification label ID. Maps to the ID field of the Google Drive Label resource.",
    }),
  },
  $I.annotations("GmailClassificationLabelValue", {
    description:
      "Classification Labels applied to the email message. Classification Labels are different from Gmail inbox labels. Only used for Google Workspace accounts.",
  })
) {}

// ============================================================================
// CSE (Client-Side Encryption) Types
// ============================================================================

export class GmailHardwareKeyMetadata extends S.Class<GmailHardwareKeyMetadata>($I`GmailHardwareKeyMetadata`)(
  {
    description: CommonGmailField.annotations({
      description: "Description about the hardware key.",
    }),
  },
  $I.annotations("GmailHardwareKeyMetadata", {
    description: "Metadata for hardware keys.",
  })
) {}

export class GmailKaclsKeyMetadata extends S.Class<GmailKaclsKeyMetadata>($I`GmailKaclsKeyMetadata`)(
  {
    kaclsData: CommonGmailField.annotations({
      description: "Opaque data generated and used by the key access control list service. Maximum size: 8 KiB.",
    }),
    kaclsUri: CommonGmailField.annotations({
      description: "The URI of the key access control list service that manages the private key.",
    }),
  },
  $I.annotations("GmailKaclsKeyMetadata", {
    description: "Metadata for private keys managed by an external key access control list service.",
  })
) {}

export class GmailCsePrivateKeyMetadata extends S.Class<GmailCsePrivateKeyMetadata>($I`GmailCsePrivateKeyMetadata`)(
  {
    hardwareKeyMetadata: S.optional(GmailHardwareKeyMetadata).annotations({
      description: "Metadata for hardware keys.",
    }),
    kaclsKeyMetadata: S.optional(GmailKaclsKeyMetadata).annotations({
      description: "Metadata for a private key instance managed by an external key access control list service.",
    }),
    privateKeyMetadataId: CommonGmailField.annotations({
      description: "Output only. The immutable ID for the private key metadata instance.",
    }),
  },
  $I.annotations("GmailCsePrivateKeyMetadata", {
    description: "Metadata for a private key instance.",
  })
) {}

export class GmailSignAndEncryptKeyPairs extends S.Class<GmailSignAndEncryptKeyPairs>($I`GmailSignAndEncryptKeyPairs`)(
  {
    encryptionKeyPairId: CommonGmailField.annotations({
      description: "The ID of the CseKeyPair that encrypts signed outgoing mail.",
    }),
    signingKeyPairId: CommonGmailField.annotations({
      description: "The ID of the CseKeyPair that signs outgoing mail.",
    }),
  },
  $I.annotations("GmailSignAndEncryptKeyPairs", {
    description: "The configuration of a CSE identity that uses different key pairs for signing and encryption.",
  })
) {}

export class GmailCseIdentity extends S.Class<GmailCseIdentity>($I`GmailCseIdentity`)(
  {
    emailAddress: CommonGmailField.annotations({
      description:
        "The email address for the sending identity. The email address must be the primary email address of the authenticated user.",
    }),
    primaryKeyPairId: CommonGmailField.annotations({
      description: "If a key pair is associated, the ID of the key pair, CseKeyPair.",
    }),
    signAndEncryptKeyPairs: S.optional(GmailSignAndEncryptKeyPairs).annotations({
      description: "The configuration of a CSE identity that uses different key pairs for signing and encryption.",
    }),
  },
  $I.annotations("GmailCseIdentity", {
    description: "The client-side encryption (CSE) configuration for the email address of an authenticated user.",
  })
) {}

export class GmailCseKeyPair extends S.Class<GmailCseKeyPair>($I`GmailCseKeyPair`)(
  {
    disableTime: CommonGmailField.annotations({
      description:
        "Output only. If a key pair is set to `DISABLED`, the time that the key pair's state changed from `ENABLED` to `DISABLED`.",
    }),
    enablementState: CommonGmailField.annotations({
      description: "Output only. The current state of the key pair.",
    }),
    keyPairId: CommonGmailField.annotations({
      description: "Output only. The immutable ID for the client-side encryption S/MIME key pair.",
    }),
    pem: CommonGmailField.annotations({
      description: "Output only. The public key and its certificate chain, in PEM format.",
    }),
    pkcs7: CommonGmailField.annotations({
      description:
        "Input only. The public key and its certificate chain. The chain must be in PKCS#7 format and use PEM encoding and ASCII armor.",
    }),
    privateKeyMetadata: S.optional(S.Array(GmailCsePrivateKeyMetadata)).annotations({
      description: "Metadata for instances of this key pair's private key.",
    }),
    subjectEmailAddresses: CommonGmailStringArrayField.annotations({
      description: "Output only. The email address identities that are specified on the leaf certificate.",
    }),
  },
  $I.annotations("GmailCseKeyPair", {
    description: "A client-side encryption S/MIME key pair.",
  })
) {}

export class GmailDisableCseKeyPairRequest extends S.Class<GmailDisableCseKeyPairRequest>(
  $I`GmailDisableCseKeyPairRequest`
)(
  {},
  $I.annotations("GmailDisableCseKeyPairRequest", {
    description: "Requests to turn off a client-side encryption key pair.",
  })
) {}

export class GmailEnableCseKeyPairRequest extends S.Class<GmailEnableCseKeyPairRequest>(
  $I`GmailEnableCseKeyPairRequest`
)(
  {},
  $I.annotations("GmailEnableCseKeyPairRequest", {
    description: "Requests to turn on a client-side encryption key pair.",
  })
) {}

export class GmailObliterateCseKeyPairRequest extends S.Class<GmailObliterateCseKeyPairRequest>(
  $I`GmailObliterateCseKeyPairRequest`
)(
  {},
  $I.annotations("GmailObliterateCseKeyPairRequest", {
    description: "Request to obliterate a CSE key pair.",
  })
) {}

// ============================================================================
// Delegate
// ============================================================================

export class GmailDelegate extends S.Class<GmailDelegate>($I`GmailDelegate`)(
  {
    delegateEmail: CommonGmailField.annotations({
      description: "The email address of the delegate.",
    }),
    verificationStatus: CommonGmailField.annotations({
      description:
        "Indicates whether this address has been verified and can act as a delegate for the account. Read-only.",
    }),
  },
  $I.annotations("GmailDelegate", {
    description:
      "Settings for a delegate. Delegates can read, send, and delete messages, as well as view and add contacts, for the delegator's account.",
  })
) {}

// ============================================================================
// Filter Types
// ============================================================================

export class GmailFilterAction extends S.Class<GmailFilterAction>($I`GmailFilterAction`)(
  {
    addLabelIds: CommonGmailStringArrayField.annotations({
      description: "List of labels to add to the message.",
    }),
    forward: CommonGmailField.annotations({
      description: "Email address that the message should be forwarded to.",
    }),
    removeLabelIds: CommonGmailStringArrayField.annotations({
      description: "List of labels to remove from the message.",
    }),
  },
  $I.annotations("GmailFilterAction", {
    description: "A set of actions to perform on a message.",
  })
) {}

export class GmailFilterCriteria extends S.Class<GmailFilterCriteria>($I`GmailFilterCriteria`)(
  {
    excludeChats: CommonGmailBoolField.annotations({
      description: "Whether the response should exclude chats.",
    }),
    from: CommonGmailField.annotations({
      description: "The sender's display name or email address.",
    }),
    hasAttachment: CommonGmailBoolField.annotations({
      description: "Whether the message has any attachment.",
    }),
    negatedQuery: CommonGmailField.annotations({
      description: "Only return messages not matching the specified query.",
    }),
    query: CommonGmailField.annotations({
      description: "Only return messages matching the specified query.",
    }),
    size: CommonGmailNumberField.annotations({
      description: "The size of the entire RFC822 message in bytes, including all headers and attachments.",
    }),
    sizeComparison: CommonGmailField.annotations({
      description: "How the message size in bytes should be in relation to the size field.",
    }),
    subject: CommonGmailField.annotations({
      description: "Case-insensitive phrase found in the message's subject.",
    }),
    to: CommonGmailField.annotations({
      description: "The recipient's display name or email address.",
    }),
  },
  $I.annotations("GmailFilterCriteria", {
    description: "Message matching criteria.",
  })
) {}

export class GmailFilter extends S.Class<GmailFilter>($I`GmailFilter`)(
  {
    action: S.optional(GmailFilterAction).annotations({
      description: "Action that the filter performs.",
    }),
    criteria: S.optional(GmailFilterCriteria).annotations({
      description: "Matching criteria for the filter.",
    }),
    id: CommonGmailField.annotations({
      description: "The server assigned ID of the filter.",
    }),
  },
  $I.annotations("GmailFilter", {
    description:
      "Resource definition for Gmail filters. Filters apply to specific messages instead of an entire email thread.",
  })
) {}

// ============================================================================
// Forwarding Address
// ============================================================================

export class GmailForwardingAddress extends S.Class<GmailForwardingAddress>($I`GmailForwardingAddress`)(
  {
    forwardingEmail: CommonGmailField.annotations({
      description: "An email address to which messages can be forwarded.",
    }),
    verificationStatus: CommonGmailField.annotations({
      description: "Indicates whether this address has been verified and is usable for forwarding. Read-only.",
    }),
  },
  $I.annotations("GmailForwardingAddress", {
    description: "Settings for a forwarding address.",
  })
) {}

// ============================================================================
// Message Types
// ============================================================================

export class GmailMessagePartBody extends S.Class<GmailMessagePartBody>($I`GmailMessagePartBody`)(
  {
    attachmentId: S.optionalWith(S.String, { nullable: true }).annotations({
      description:
        "When present, contains the ID of an external attachment that can be retrieved in a separate `messages.attachments.get` request.",
    }),
    data: CommonGmailField.annotations({
      description: "The body data of a MIME message part as a base64url encoded string.",
    }),
    size: CommonGmailNumberField.annotations({
      description: "Number of bytes for the message part data (encoding notwithstanding).",
    }),
  },
  $I.annotations("GmailMessagePartBody", {
    description: "The body of a single MIME message part.",
  })
) {}

export class GmailMessagePartHeader extends S.Class<GmailMessagePartHeader>($I`GmailMessagePartHeader`)(
  {
    name: CommonGmailField.annotations({
      description: "The name of the header before the `:` separator. For example, `To`.",
    }),
    value: CommonGmailField.annotations({
      description: "The value of the header after the `:` separator. For example, `someuser@example.com`.",
    }),
  },
  $I.annotations("GmailMessagePartHeader", {
    description: "A message part header.",
  })
) {}

// MessagePart is recursive, so we need a forward declaration approach
// Interface must match schema's actual output type exactly (plain objects, not class instances)
// Aligned with gmail_v1.Schema$MessagePart from @googleapis/gmail
export interface GmailMessagePartEncoded {
  readonly body?:
    | {
        readonly attachmentId?: string | null | undefined;
        readonly data?: string | null | undefined;
        readonly size?: number | null | undefined;
      }
    | undefined;
  readonly filename?: string | null | undefined;
  readonly headers?:
    | readonly {
        readonly name?: string | null | undefined;
        readonly value?: string | null | undefined;
      }[]
    | undefined;
  readonly mimeType?: string | null | undefined;
  readonly partId?: string | null | undefined;
  readonly parts?: readonly GmailMessagePartEncoded[] | undefined;
}

// Recursive schema for Gmail message parts
// Uses S.Struct + S.suspend pattern which is the idiomatic way to handle recursive types in Effect
// Type assertion needed due to recursive nature - the schema structure matches the interface
export const GmailMessagePart = S.Struct({
  body: S.optional(
    S.Struct({
      attachmentId: CommonGmailField,
      data: CommonGmailField,
      size: CommonGmailNumberField,
    })
  ).annotations({
    description: "The message part body for this part, which may be empty for container MIME message parts.",
  }),
  filename: CommonGmailField.annotations({
    description: "The filename of the attachment. Only present if this message part represents an attachment.",
  }),
  headers: S.optional(
    S.Array(
      S.Struct({
        name: CommonGmailField,
        value: CommonGmailField,
      })
    )
  ).annotations({
    description: "List of headers on this message part.",
  }),
  mimeType: CommonGmailField.annotations({
    description: "The MIME type of the message part.",
  }),
  partId: CommonGmailField.annotations({
    description: "The immutable ID of the message part.",
  }),
  parts: S.optional(
    S.Array(S.suspend((): S.Schema<GmailMessagePartEncoded> => GmailMessagePart as S.Schema<GmailMessagePartEncoded>))
  ).annotations({
    description: "The child MIME message parts of this part.",
  }),
}).annotations({
  identifier: $I`GmailMessagePart`.toString(),
  description: "A single MIME message part.",
});

// Type alias for the schema type
export type GmailMessagePartType = S.Schema.Type<typeof GmailMessagePart>;

// Helper function to extract plain text body from a message part
// Uses GmailMessagePartEncoded since that's the type used in recursive parts array
export const extractPlainTextBody = (part?: GmailMessagePartEncoded): string | undefined => {
  return Match.value(part).pipe(
    Match.when(P.isNullable, () => undefined),
    Match.whenAnd({ mimeType: BS.MimeType.is["text/plain"] }, { body: { data: P.isNotNullable } }, ({ body }) =>
      Encoding.encodeBase64(body.data)
    ),
    Match.when({ parts: P.isNotNullable }, (p) => {
      for (const child of p.parts ?? []) {
        const text = extractPlainTextBody(child);
        if (P.isNotUndefined(text)) return text;
      }
      return undefined;
    }),
    Match.orElse(thunkUndefined)
  );
};

export class GmailMessage extends S.Class<GmailMessage>($I`GmailMessage`)(
  {
    classificationLabelValues: S.optional(S.Array(GmailClassificationLabelValue)).annotations({
      description: "Classification Label values on the message.",
    }),
    historyId: CommonGmailField.annotations({
      description: "The ID of the last history record that modified this message.",
    }),
    id: CommonGmailField.annotations({
      description: "The immutable ID of the message.",
    }),
    internalDate: CommonGmailField.annotations({
      description: "The internal message creation timestamp (epoch ms).",
    }),
    labelIds: CommonGmailStringArrayField.annotations({
      description: "List of IDs of labels applied to this message.",
    }),
    payload: S.optional(GmailMessagePart).annotations({
      description: "The parsed email structure in the message parts.",
    }),
    raw: CommonGmailField.annotations({
      description: "The entire email message in an RFC 2822 formatted and base64url encoded string.",
    }),
    sizeEstimate: CommonGmailNumberField.annotations({
      description: "Estimated size in bytes of the message.",
    }),
    snippet: CommonGmailField.annotations({
      description: "A short part of the message text.",
    }),
    threadId: CommonGmailField.annotations({
      description: "The ID of the thread the message belongs to.",
    }),
  },
  $I.annotations("GmailMessage", {
    description: "An email message.",
  })
) {}

export class GmailModifyMessageRequest extends S.Class<GmailModifyMessageRequest>($I`GmailModifyMessageRequest`)(
  {
    addLabelIds: CommonGmailStringArrayField.annotations({
      description: "A list of IDs of labels to add to this message. You can add up to 100 labels with each update.",
    }),
    removeLabelIds: CommonGmailStringArrayField.annotations({
      description:
        "A list IDs of labels to remove from this message. You can remove up to 100 labels with each update.",
    }),
  },
  $I.annotations("GmailModifyMessageRequest", {
    description: "Request to modify a message.",
  })
) {}

export class GmailModifyThreadRequest extends S.Class<GmailModifyThreadRequest>($I`GmailModifyThreadRequest`)(
  {
    addLabelIds: CommonGmailStringArrayField.annotations({
      description: "A list of IDs of labels to add to this thread. You can add up to 100 labels with each update.",
    }),
    removeLabelIds: CommonGmailStringArrayField.annotations({
      description:
        "A list of IDs of labels to remove from this thread. You can remove up to 100 labels with each update.",
    }),
  },
  $I.annotations("GmailModifyThreadRequest", {
    description: "Request to modify a thread.",
  })
) {}

// ============================================================================
// Draft
// ============================================================================

export class GmailDraft extends S.Class<GmailDraft>($I`GmailDraft`)(
  {
    id: CommonGmailField.annotations({
      description: "The immutable ID of the draft.",
    }),
    message: S.optional(GmailMessage).annotations({
      description: "The message content of the draft.",
    }),
  },
  $I.annotations("GmailDraft", {
    description: "A draft email in the user's mailbox.",
  })
) {}

// ============================================================================
// History Types
// ============================================================================

export class GmailHistoryLabelAdded extends S.Class<GmailHistoryLabelAdded>($I`GmailHistoryLabelAdded`)(
  {
    labelIds: CommonGmailStringArrayField.annotations({
      description: "Label IDs added to the message.",
    }),
    message: S.optional(GmailMessage).annotations({
      description: "The message.",
    }),
  },
  $I.annotations("GmailHistoryLabelAdded", {
    description: "Labels added to a message.",
  })
) {}

export class GmailHistoryLabelRemoved extends S.Class<GmailHistoryLabelRemoved>($I`GmailHistoryLabelRemoved`)(
  {
    labelIds: CommonGmailStringArrayField.annotations({
      description: "Label IDs removed from the message.",
    }),
    message: S.optional(GmailMessage).annotations({
      description: "The message.",
    }),
  },
  $I.annotations("GmailHistoryLabelRemoved", {
    description: "Labels removed from a message.",
  })
) {}

export class GmailHistoryMessageAdded extends S.Class<GmailHistoryMessageAdded>($I`GmailHistoryMessageAdded`)(
  {
    message: S.optional(GmailMessage).annotations({
      description: "The message.",
    }),
  },
  $I.annotations("GmailHistoryMessageAdded", {
    description: "Message added to mailbox.",
  })
) {}

export class GmailHistoryMessageDeleted extends S.Class<GmailHistoryMessageDeleted>($I`GmailHistoryMessageDeleted`)(
  {
    message: S.optional(GmailMessage).annotations({
      description: "The message.",
    }),
  },
  $I.annotations("GmailHistoryMessageDeleted", {
    description: "Message deleted from mailbox.",
  })
) {}

export class GmailHistory extends S.Class<GmailHistory>($I`GmailHistory`)(
  {
    id: CommonGmailField.annotations({
      description: "The mailbox sequence ID.",
    }),
    labelsAdded: S.optional(S.Array(GmailHistoryLabelAdded)).annotations({
      description: "Labels added to messages in this history record.",
    }),
    labelsRemoved: S.optional(S.Array(GmailHistoryLabelRemoved)).annotations({
      description: "Labels removed from messages in this history record.",
    }),
    messages: S.optional(S.Array(GmailMessage)).annotations({
      description: "List of messages changed in this history record.",
    }),
    messagesAdded: S.optional(S.Array(GmailHistoryMessageAdded)).annotations({
      description: "Messages added to the mailbox in this history record.",
    }),
    messagesDeleted: S.optional(S.Array(GmailHistoryMessageDeleted)).annotations({
      description: "Messages deleted (not Trashed) from the mailbox in this history record.",
    }),
  },
  $I.annotations("GmailHistory", {
    description: "A record of a change to the user's mailbox.",
  })
) {}

// ============================================================================
// Settings Types
// ============================================================================

export class GmailImapSettings extends S.Class<GmailImapSettings>($I`GmailImapSettings`)(
  {
    autoExpunge: CommonGmailBoolField.annotations({
      description:
        "If this value is true, Gmail will immediately expunge a message when it is marked as deleted in IMAP.",
    }),
    enabled: CommonGmailBoolField.annotations({
      description: "Whether IMAP is enabled for the account.",
    }),
    expungeBehavior: CommonGmailField.annotations({
      description:
        "The action that will be executed on a message when it is marked as deleted and expunged from the last visible IMAP folder.",
    }),
    maxFolderSize: CommonGmailNumberField.annotations({
      description:
        "An optional limit on the number of messages that an IMAP folder may contain. Legal values are 0, 1000, 2000, 5000 or 10000.",
    }),
  },
  $I.annotations("GmailImapSettings", {
    description: "IMAP settings for an account.",
  })
) {}

export class GmailPopSettings extends S.Class<GmailPopSettings>($I`GmailPopSettings`)(
  {
    accessWindow: CommonGmailField.annotations({
      description: "The range of messages which are accessible via POP.",
    }),
    disposition: CommonGmailField.annotations({
      description: "The action that will be executed on a message after it has been fetched via POP.",
    }),
  },
  $I.annotations("GmailPopSettings", {
    description: "POP settings for an account.",
  })
) {}

export class GmailLanguageSettings extends S.Class<GmailLanguageSettings>($I`GmailLanguageSettings`)(
  {
    displayLanguage: CommonGmailField.annotations({
      description: "The language to display Gmail in, formatted as an RFC 3066 Language Tag.",
    }),
  },
  $I.annotations("GmailLanguageSettings", {
    description: "Language settings for an account.",
  })
) {}

export class GmailVacationSettings extends S.Class<GmailVacationSettings>($I`GmailVacationSettings`)(
  {
    enableAutoReply: CommonGmailBoolField.annotations({
      description: "Flag that controls whether Gmail automatically replies to messages.",
    }),
    endTime: CommonGmailField.annotations({
      description: "An optional end time for sending auto-replies (epoch ms).",
    }),
    responseBodyHtml: CommonGmailField.annotations({
      description: "Response body in HTML format.",
    }),
    responseBodyPlainText: CommonGmailField.annotations({
      description: "Response body in plain text format.",
    }),
    responseSubject: CommonGmailField.annotations({
      description: "Optional text to prepend to the subject line in vacation responses.",
    }),
    restrictToContacts: CommonGmailBoolField.annotations({
      description:
        "Flag that determines whether responses are sent to recipients who are not in the user's list of contacts.",
    }),
    restrictToDomain: CommonGmailBoolField.annotations({
      description:
        "Flag that determines whether responses are sent to recipients who are outside of the user's domain.",
    }),
    startTime: CommonGmailField.annotations({
      description: "An optional start time for sending auto-replies (epoch ms).",
    }),
  },
  $I.annotations("GmailVacationSettings", {
    description: "Vacation auto-reply settings for an account.",
  })
) {}

// ============================================================================
// Label Types
// ============================================================================

export class GmailLabelColor extends S.Class<GmailLabelColor>($I`GmailLabelColor`)(
  {
    backgroundColor: CommonGmailField.annotations({
      description: "The background color represented as hex string #RRGGBB.",
    }),
    textColor: CommonGmailField.annotations({
      description: "The text color of the label, represented as hex string.",
    }),
  },
  $I.annotations("GmailLabelColor", {
    description: "Label color.",
  })
) {}

export class GmailLabel extends S.Class<GmailLabel>($I`GmailLabel`)(
  {
    color: S.optional(GmailLabelColor).annotations({
      description:
        "The color to assign to the label. Color is only available for labels that have their `type` set to `user`.",
    }),
    id: CommonGmailField.annotations({
      description: "The immutable ID of the label.",
    }),
    labelListVisibility: CommonGmailField.annotations({
      description: "The visibility of the label in the label list in the Gmail web interface.",
    }),
    messageListVisibility: CommonGmailField.annotations({
      description: "The visibility of messages with this label in the message list in the Gmail web interface.",
    }),
    messagesTotal: CommonGmailNumberField.annotations({
      description: "The total number of messages with the label.",
    }),
    messagesUnread: CommonGmailNumberField.annotations({
      description: "The number of unread messages with the label.",
    }),
    name: CommonGmailField.annotations({
      description: "The display name of the label.",
    }),
    threadsTotal: CommonGmailNumberField.annotations({
      description: "The total number of threads with the label.",
    }),
    threadsUnread: CommonGmailNumberField.annotations({
      description: "The number of unread threads with the label.",
    }),
    type: CommonGmailField.annotations({
      description:
        "The owner type for the label. User labels are created by the user and can be modified and deleted by the user.",
    }),
  },
  $I.annotations("GmailLabel", {
    description: "Labels are used to categorize messages and threads within the user's mailbox.",
  })
) {}

// ============================================================================
// SendAs & S/MIME Types
// ============================================================================

export class GmailSmtpMsa extends S.Class<GmailSmtpMsa>($I`GmailSmtpMsa`)(
  {
    host: CommonGmailField.annotations({
      description: "The hostname of the SMTP service. Required.",
    }),
    password: CommonGmailField.annotations({
      description:
        "The password that will be used for authentication with the SMTP service. This is a write-only field.",
    }),
    port: CommonGmailNumberField.annotations({
      description: "The port of the SMTP service. Required.",
    }),
    securityMode: CommonGmailField.annotations({
      description: "The protocol that will be used to secure communication with the SMTP service. Required.",
    }),
    username: CommonGmailField.annotations({
      description:
        "The username that will be used for authentication with the SMTP service. This is a write-only field.",
    }),
  },
  $I.annotations("GmailSmtpMsa", {
    description: "Configuration for communication with an SMTP service.",
  })
) {}

export class GmailSendAs extends S.Class<GmailSendAs>($I`GmailSendAs`)(
  {
    displayName: CommonGmailField.annotations({
      description: 'A name that appears in the "From:" header for mail sent using this alias.',
    }),
    isDefault: CommonGmailBoolField.annotations({
      description: 'Whether this address is selected as the default "From:" address.',
    }),
    isPrimary: CommonGmailBoolField.annotations({
      description: "Whether this address is the primary address used to login to the account.",
    }),
    replyToAddress: CommonGmailField.annotations({
      description: 'An optional email address that is included in a "Reply-To:" header.',
    }),
    sendAsEmail: CommonGmailField.annotations({
      description: 'The email address that appears in the "From:" header for mail sent using this alias.',
    }),
    signature: CommonGmailField.annotations({
      description: "An optional HTML signature that is included in messages composed with this alias.",
    }),
    smtpMsa: S.optional(GmailSmtpMsa).annotations({
      description: "An optional SMTP service that will be used as an outbound relay for mail sent using this alias.",
    }),
    treatAsAlias: CommonGmailBoolField.annotations({
      description: "Whether Gmail should treat this address as an alias for the user's primary email address.",
    }),
    verificationStatus: CommonGmailField.annotations({
      description: "Indicates whether this address has been verified for use as a send-as alias.",
    }),
  },
  $I.annotations("GmailSendAs", {
    description: "Settings associated with a send-as alias.",
  })
) {}

export class GmailSmimeInfo extends S.Class<GmailSmimeInfo>($I`GmailSmimeInfo`)(
  {
    encryptedKeyPassword: CommonGmailField.annotations({
      description: "Encrypted key password, when key is encrypted.",
    }),
    expiration: CommonGmailField.annotations({
      description: "When the certificate expires (in milliseconds since epoch).",
    }),
    id: CommonGmailField.annotations({
      description: "The immutable ID for the SmimeInfo.",
    }),
    isDefault: CommonGmailBoolField.annotations({
      description: "Whether this SmimeInfo is the default one for this user's send-as address.",
    }),
    issuerCn: CommonGmailField.annotations({
      description: "The S/MIME certificate issuer's common name.",
    }),
    pem: CommonGmailField.annotations({
      description: "PEM formatted X509 concatenated certificate string.",
    }),
    pkcs12: CommonGmailField.annotations({
      description: "PKCS#12 format containing a single private/public key pair and certificate chain.",
    }),
  },
  $I.annotations("GmailSmimeInfo", {
    description: "An S/MIME email config.",
  })
) {}

// ============================================================================
// Thread
// ============================================================================

export class GmailThread extends S.Class<GmailThread>($I`GmailThread`)(
  {
    historyId: CommonGmailField.annotations({
      description: "The ID of the last history record that modified this thread.",
    }),
    id: CommonGmailField.annotations({
      description: "The unique ID of the thread.",
    }),
    messages: S.optional(S.Array(GmailMessage)).annotations({
      description: "The list of messages in the thread.",
    }),
    snippet: CommonGmailField.annotations({
      description: "A short part of the message text.",
    }),
  },
  $I.annotations("GmailThread", {
    description: "A collection of messages representing a conversation.",
  })
) {}

// ============================================================================
// Profile
// ============================================================================

export class GmailProfile extends S.Class<GmailProfile>($I`GmailProfile`)(
  {
    emailAddress: CommonGmailField.annotations({
      description: "The user's email address.",
    }),
    historyId: CommonGmailField.annotations({
      description: "The ID of the mailbox's current history record.",
    }),
    messagesTotal: CommonGmailNumberField.annotations({
      description: "The total number of messages in the mailbox.",
    }),
    threadsTotal: CommonGmailNumberField.annotations({
      description: "The total number of threads in the mailbox.",
    }),
  },
  $I.annotations("GmailProfile", {
    description: "Profile for a Gmail user.",
  })
) {}

// ============================================================================
// Watch Types
// ============================================================================

export class GmailWatchRequest extends S.Class<GmailWatchRequest>($I`GmailWatchRequest`)(
  {
    labelFilterAction: CommonGmailField.annotations({
      description: "Filtering behavior of `labelIds list` specified. This field is deprecated.",
    }),
    labelFilterBehavior: CommonGmailField.annotations({
      description: "Filtering behavior of `labelIds list` specified. This field replaces `label_filter_action`.",
    }),
    labelIds: CommonGmailStringArrayField.annotations({
      description: "List of label_ids to restrict notifications about.",
    }),
    topicName: CommonGmailField.annotations({
      description: "A fully qualified Google Cloud Pub/Sub API topic name to publish the events to.",
    }),
  },
  $I.annotations("GmailWatchRequest", {
    description: "Set up or update a new push notification watch on this user's mailbox.",
  })
) {}

export class GmailWatchResponse extends S.Class<GmailWatchResponse>($I`GmailWatchResponse`)(
  {
    expiration: CommonGmailField.annotations({
      description: "When Gmail will stop sending notifications for mailbox updates (epoch millis).",
    }),
    historyId: CommonGmailField.annotations({
      description: "The ID of the mailbox's current history record.",
    }),
  },
  $I.annotations("GmailWatchResponse", {
    description: "Push notification watch response.",
  })
) {}

// ============================================================================
// List Response Types
// ============================================================================

export class GmailListCseIdentitiesResponse extends S.Class<GmailListCseIdentitiesResponse>(
  $I`GmailListCseIdentitiesResponse`
)(
  {
    cseIdentities: S.optional(S.Array(GmailCseIdentity)).annotations({
      description: "One page of the list of CSE identities configured for the user.",
    }),
    nextPageToken: CommonGmailField.annotations({
      description: "Pagination token to be passed to a subsequent ListCseIdentities call.",
    }),
  },
  $I.annotations("GmailListCseIdentitiesResponse", {
    description: "Response for listing CSE identities.",
  })
) {}

export class GmailListCseKeyPairsResponse extends S.Class<GmailListCseKeyPairsResponse>(
  $I`GmailListCseKeyPairsResponse`
)(
  {
    cseKeyPairs: S.optional(S.Array(GmailCseKeyPair)).annotations({
      description: "One page of the list of CSE key pairs installed for the user.",
    }),
    nextPageToken: CommonGmailField.annotations({
      description: "Pagination token to be passed to a subsequent ListCseKeyPairs call.",
    }),
  },
  $I.annotations("GmailListCseKeyPairsResponse", {
    description: "Response for listing CSE key pairs.",
  })
) {}

export class GmailListDelegatesResponse extends S.Class<GmailListDelegatesResponse>($I`GmailListDelegatesResponse`)(
  {
    delegates: S.optional(S.Array(GmailDelegate)).annotations({
      description: "List of the user's delegates (with any verification status).",
    }),
  },
  $I.annotations("GmailListDelegatesResponse", {
    description: "Response for the ListDelegates method.",
  })
) {}

export class GmailListDraftsResponse extends S.Class<GmailListDraftsResponse>($I`GmailListDraftsResponse`)(
  {
    drafts: S.optional(S.Array(GmailDraft)).annotations({
      description: "List of drafts.",
    }),
    nextPageToken: CommonGmailField.annotations({
      description: "Token to retrieve the next page of results in the list.",
    }),
    resultSizeEstimate: CommonGmailNumberField.annotations({
      description: "Estimated total number of results.",
    }),
  },
  $I.annotations("GmailListDraftsResponse", {
    description: "Response for listing drafts.",
  })
) {}

export class GmailListFiltersResponse extends S.Class<GmailListFiltersResponse>($I`GmailListFiltersResponse`)(
  {
    filter: S.optional(S.Array(GmailFilter)).annotations({
      description: "List of a user's filters.",
    }),
  },
  $I.annotations("GmailListFiltersResponse", {
    description: "Response for the ListFilters method.",
  })
) {}

export class GmailListForwardingAddressesResponse extends S.Class<GmailListForwardingAddressesResponse>(
  $I`GmailListForwardingAddressesResponse`
)(
  {
    forwardingAddresses: S.optional(S.Array(GmailForwardingAddress)).annotations({
      description: "List of addresses that may be used for forwarding.",
    }),
  },
  $I.annotations("GmailListForwardingAddressesResponse", {
    description: "Response for the ListForwardingAddresses method.",
  })
) {}

export class GmailListHistoryResponse extends S.Class<GmailListHistoryResponse>($I`GmailListHistoryResponse`)(
  {
    history: S.optional(S.Array(GmailHistory)).annotations({
      description: "List of history records.",
    }),
    historyId: CommonGmailField.annotations({
      description: "The ID of the mailbox's current history record.",
    }),
    nextPageToken: CommonGmailField.annotations({
      description: "Page token to retrieve the next page of results in the list.",
    }),
  },
  $I.annotations("GmailListHistoryResponse", {
    description: "Response for listing history.",
  })
) {}

export class GmailListLabelsResponse extends S.Class<GmailListLabelsResponse>($I`GmailListLabelsResponse`)(
  {
    labels: S.optional(S.Array(GmailLabel)).annotations({
      description: "List of labels.",
    }),
  },
  $I.annotations("GmailListLabelsResponse", {
    description: "Response for listing labels.",
  })
) {}

export class GmailListMessagesResponse extends S.Class<GmailListMessagesResponse>($I`GmailListMessagesResponse`)(
  {
    messages: S.optional(S.Array(GmailMessage)).annotations({
      description: "List of messages.",
    }),
    nextPageToken: CommonGmailField.annotations({
      description: "Token to retrieve the next page of results in the list.",
    }),
    resultSizeEstimate: CommonGmailNumberField.annotations({
      description: "Estimated total number of results.",
    }),
  },
  $I.annotations("GmailListMessagesResponse", {
    description: "Response for listing messages.",
  })
) {}

export class GmailListSendAsResponse extends S.Class<GmailListSendAsResponse>($I`GmailListSendAsResponse`)(
  {
    sendAs: S.optional(S.Array(GmailSendAs)).annotations({
      description: "List of send-as aliases.",
    }),
  },
  $I.annotations("GmailListSendAsResponse", {
    description: "Response for the ListSendAs method.",
  })
) {}

export class GmailListSmimeInfoResponse extends S.Class<GmailListSmimeInfoResponse>($I`GmailListSmimeInfoResponse`)(
  {
    smimeInfo: S.optional(S.Array(GmailSmimeInfo)).annotations({
      description: "List of SmimeInfo.",
    }),
  },
  $I.annotations("GmailListSmimeInfoResponse", {
    description: "Response for listing S/MIME info.",
  })
) {}

export class GmailListThreadsResponse extends S.Class<GmailListThreadsResponse>($I`GmailListThreadsResponse`)(
  {
    nextPageToken: CommonGmailField.annotations({
      description: "Page token to retrieve the next page of results in the list.",
    }),
    resultSizeEstimate: CommonGmailNumberField.annotations({
      description: "Estimated total number of results.",
    }),
    threads: S.optional(S.Array(GmailThread)).annotations({
      description: "List of threads.",
    }),
  },
  $I.annotations("GmailListThreadsResponse", {
    description: "Response for listing threads.",
  })
) {}

// ============================================================================
// Resource Parameter Types (extends StandardParameters)
// ============================================================================

export class GmailParamsResourceUsersGetProfile extends GmailStandardParameters.extend<GmailParamsResourceUsersGetProfile>(
  $I`GmailParamsResourceUsersGetProfile`
)(
  {
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersGetProfile", {
    description: "Parameters for the `resource.users.getProfile` method.",
  })
) {}

export class GmailParamsResourceUsersStop extends GmailStandardParameters.extend<GmailParamsResourceUsersStop>(
  $I`GmailParamsResourceUsersStop`
)(
  {
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersStop", {
    description: "Parameters for the `resource.users.stop` method.",
  })
) {}

export class GmailParamsResourceUsersWatch extends GmailStandardParameters.extend<GmailParamsResourceUsersWatch>(
  $I`GmailParamsResourceUsersWatch`
)(
  {
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailWatchRequest).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersWatch", {
    description: "Parameters for the `resource.users.watch` method.",
  })
) {}

// Draft Parameters
export class GmailParamsResourceUsersDraftsCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsCreate>(
  $I`GmailParamsResourceUsersDraftsCreate`
)(
  {
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailDraft).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsCreate", {
    description: "Parameters for creating a draft.",
  })
) {}

export class GmailParamsResourceUsersDraftsDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsDelete>(
  $I`GmailParamsResourceUsersDraftsDelete`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the draft to delete.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsDelete", {
    description: "Parameters for deleting a draft.",
  })
) {}

export class GmailParamsResourceUsersDraftsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsGet>(
  $I`GmailParamsResourceUsersDraftsGet`
)(
  {
    format: S.optional(S.String).annotations({
      description: "The format to return the draft in.",
    }),
    id: S.optional(S.String).annotations({
      description: "The ID of the draft to retrieve.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsGet", {
    description: "Parameters for getting a draft.",
  })
) {}

export class GmailParamsResourceUsersDraftsList extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsList>(
  $I`GmailParamsResourceUsersDraftsList`
)(
  {
    includeSpamTrash: S.optional(S.Boolean).annotations({
      description: "Include drafts from `SPAM` and `TRASH` in the results.",
    }),
    maxResults: S.optional(S.Number).annotations({
      description:
        "Maximum number of drafts to return. This field defaults to 100. The maximum allowed value for this field is 500.",
    }),
    pageToken: S.optional(S.String).annotations({
      description: "Page token to retrieve a specific page of results in the list.",
    }),
    q: S.optional(S.String).annotations({
      description: "Only return draft messages matching the specified query.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsList", {
    description: "Parameters for listing drafts.",
  })
) {}

export class GmailParamsResourceUsersDraftsSend extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsSend>(
  $I`GmailParamsResourceUsersDraftsSend`
)(
  {
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailDraft).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsSend", {
    description: "Parameters for sending a draft.",
  })
) {}

export class GmailParamsResourceUsersDraftsUpdate extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsUpdate>(
  $I`GmailParamsResourceUsersDraftsUpdate`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the draft to update.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailDraft).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsUpdate", {
    description: "Parameters for updating a draft.",
  })
) {}

// History Parameters
export class GmailParamsResourceUsersHistoryList extends GmailStandardParameters.extend<GmailParamsResourceUsersHistoryList>(
  $I`GmailParamsResourceUsersHistoryList`
)(
  {
    historyTypes: S.optional(S.Array(S.String)).annotations({
      description: "History types to be returned by the function",
    }),
    labelId: S.optional(S.String).annotations({
      description: "Only return messages with a label matching the ID.",
    }),
    maxResults: S.optional(S.Number).annotations({
      description:
        "Maximum number of history records to return. This field defaults to 100. The maximum allowed value for this field is 500.",
    }),
    pageToken: S.optional(S.String).annotations({
      description: "Page token to retrieve a specific page of results in the list.",
    }),
    startHistoryId: S.optional(S.String).annotations({
      description: "Required. Returns history records after the specified `startHistoryId`.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersHistoryList", {
    description: "Parameters for listing history.",
  })
) {}

// Label Parameters
export class GmailParamsResourceUsersLabelsCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsCreate>(
  $I`GmailParamsResourceUsersLabelsCreate`
)(
  {
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailLabel).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsCreate", {
    description: "Parameters for creating a label.",
  })
) {}

export class GmailParamsResourceUsersLabelsDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsDelete>(
  $I`GmailParamsResourceUsersLabelsDelete`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the label to delete.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsDelete", {
    description: "Parameters for deleting a label.",
  })
) {}

export class GmailParamsResourceUsersLabelsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsGet>(
  $I`GmailParamsResourceUsersLabelsGet`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the label to retrieve.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsGet", {
    description: "Parameters for getting a label.",
  })
) {}

export class GmailParamsResourceUsersLabelsList extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsList>(
  $I`GmailParamsResourceUsersLabelsList`
)(
  {
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsList", {
    description: "Parameters for listing labels.",
  })
) {}

export class GmailParamsResourceUsersLabelsPatch extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsPatch>(
  $I`GmailParamsResourceUsersLabelsPatch`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the label to update.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailLabel).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsPatch", {
    description: "Parameters for patching a label.",
  })
) {}

export class GmailParamsResourceUsersLabelsUpdate extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsUpdate>(
  $I`GmailParamsResourceUsersLabelsUpdate`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the label to update.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailLabel).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsUpdate", {
    description: "Parameters for updating a label.",
  })
) {}

// Message Parameters
export class GmailParamsResourceUsersMessagesBatchDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesBatchDelete>(
  $I`GmailParamsResourceUsersMessagesBatchDelete`
)(
  {
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailBatchDeleteMessagesRequest).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesBatchDelete", {
    description: "Parameters for batch deleting messages.",
  })
) {}

export class GmailParamsResourceUsersMessagesBatchModify extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesBatchModify>(
  $I`GmailParamsResourceUsersMessagesBatchModify`
)(
  {
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailBatchModifyMessagesRequest).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesBatchModify", {
    description: "Parameters for batch modifying messages.",
  })
) {}

export class GmailParamsResourceUsersMessagesDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesDelete>(
  $I`GmailParamsResourceUsersMessagesDelete`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the message to delete.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesDelete", {
    description: "Parameters for deleting a message.",
  })
) {}

export class GmailParamsResourceUsersMessagesGet extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesGet>(
  $I`GmailParamsResourceUsersMessagesGet`
)(
  {
    format: S.optional(S.String).annotations({
      description: "The format to return the message in.",
    }),
    id: S.optional(S.String).annotations({
      description: "The ID of the message to retrieve.",
    }),
    metadataHeaders: S.optional(S.Array(S.String)).annotations({
      description: "When given and format is `METADATA`, only include headers specified.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesGet", {
    description: "Parameters for getting a message.",
  })
) {}

export class GmailParamsResourceUsersMessagesImport extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesImport>(
  $I`GmailParamsResourceUsersMessagesImport`
)(
  {
    deleted: S.optional(S.Boolean).annotations({
      description: "Mark the email as permanently deleted (not TRASH).",
    }),
    internalDateSource: S.optional(S.String).annotations({
      description: "Source for Gmail's internal date of the message.",
    }),
    neverMarkSpam: S.optional(S.Boolean).annotations({
      description: "Ignore the Gmail spam classifier decision and never mark this email as SPAM.",
    }),
    processForCalendar: S.optional(S.Boolean).annotations({
      description: "Process calendar invites in the email.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailMessage).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesImport", {
    description: "Parameters for importing a message.",
  })
) {}

export class GmailParamsResourceUsersMessagesInsert extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesInsert>(
  $I`GmailParamsResourceUsersMessagesInsert`
)(
  {
    deleted: S.optional(S.Boolean).annotations({
      description: "Mark the email as permanently deleted (not TRASH).",
    }),
    internalDateSource: S.optional(S.String).annotations({
      description: "Source for Gmail's internal date of the message.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailMessage).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesInsert", {
    description: "Parameters for inserting a message.",
  })
) {}

export class GmailParamsResourceUsersMessagesList extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesList>(
  $I`GmailParamsResourceUsersMessagesList`
)(
  {
    includeSpamTrash: S.optional(S.Boolean).annotations({
      description: "Include messages from `SPAM` and `TRASH` in the results.",
    }),
    labelIds: S.optional(S.Array(S.String)).annotations({
      description: "Only return messages with labels that match all of the specified label IDs.",
    }),
    maxResults: S.optional(S.Number).annotations({
      description:
        "Maximum number of messages to return. This field defaults to 100. The maximum allowed value for this field is 500.",
    }),
    pageToken: S.optional(S.String).annotations({
      description: "Page token to retrieve a specific page of results in the list.",
    }),
    q: S.optional(S.String).annotations({
      description: "Only return messages matching the specified query.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesList", {
    description: "Parameters for listing messages.",
  })
) {}

export class GmailParamsResourceUsersMessagesModify extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesModify>(
  $I`GmailParamsResourceUsersMessagesModify`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the message to modify.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailModifyMessageRequest).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesModify", {
    description: "Parameters for modifying a message.",
  })
) {}

export class GmailParamsResourceUsersMessagesSend extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesSend>(
  $I`GmailParamsResourceUsersMessagesSend`
)(
  {
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailMessage).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesSend", {
    description: "Parameters for sending a message.",
  })
) {}

export class GmailParamsResourceUsersMessagesTrash extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesTrash>(
  $I`GmailParamsResourceUsersMessagesTrash`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the message to Trash.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesTrash", {
    description: "Parameters for trashing a message.",
  })
) {}

export class GmailParamsResourceUsersMessagesUntrash extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesUntrash>(
  $I`GmailParamsResourceUsersMessagesUntrash`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the message to remove from Trash.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesUntrash", {
    description: "Parameters for untrashing a message.",
  })
) {}

export class GmailParamsResourceUsersMessagesAttachmentsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesAttachmentsGet>(
  $I`GmailParamsResourceUsersMessagesAttachmentsGet`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the attachment.",
    }),
    messageId: S.optional(S.String).annotations({
      description: "The ID of the message containing the attachment.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesAttachmentsGet", {
    description: "Parameters for getting an attachment.",
  })
) {}

// Settings Parameters
export class GmailParamsResourceUsersSettingsGetAutoForwarding extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsGetAutoForwarding>(
  $I`GmailParamsResourceUsersSettingsGetAutoForwarding`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsGetAutoForwarding", {
    description: "Parameters for getting auto-forwarding settings.",
  })
) {}

export class GmailParamsResourceUsersSettingsGetImap extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsGetImap>(
  $I`GmailParamsResourceUsersSettingsGetImap`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsGetImap", {
    description: "Parameters for getting IMAP settings.",
  })
) {}

export class GmailParamsResourceUsersSettingsGetLanguage extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsGetLanguage>(
  $I`GmailParamsResourceUsersSettingsGetLanguage`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsGetLanguage", {
    description: "Parameters for getting language settings.",
  })
) {}

export class GmailParamsResourceUsersSettingsGetPop extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsGetPop>(
  $I`GmailParamsResourceUsersSettingsGetPop`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsGetPop", {
    description: "Parameters for getting POP settings.",
  })
) {}

export class GmailParamsResourceUsersSettingsGetVacation extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsGetVacation>(
  $I`GmailParamsResourceUsersSettingsGetVacation`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsGetVacation", {
    description: "Parameters for getting vacation settings.",
  })
) {}

export class GmailParamsResourceUsersSettingsUpdateAutoForwarding extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsUpdateAutoForwarding>(
  $I`GmailParamsResourceUsersSettingsUpdateAutoForwarding`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optional(GmailAutoForwarding).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsUpdateAutoForwarding", {
    description: "Parameters for updating auto-forwarding settings.",
  })
) {}

export class GmailParamsResourceUsersSettingsUpdateImap extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsUpdateImap>(
  $I`GmailParamsResourceUsersSettingsUpdateImap`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optional(GmailImapSettings).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsUpdateImap", {
    description: "Parameters for updating IMAP settings.",
  })
) {}

export class GmailParamsResourceUsersSettingsUpdateLanguage extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsUpdateLanguage>(
  $I`GmailParamsResourceUsersSettingsUpdateLanguage`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optional(GmailLanguageSettings).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsUpdateLanguage", {
    description: "Parameters for updating language settings.",
  })
) {}

export class GmailParamsResourceUsersSettingsUpdatePop extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsUpdatePop>(
  $I`GmailParamsResourceUsersSettingsUpdatePop`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optional(GmailPopSettings).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsUpdatePop", {
    description: "Parameters for updating POP settings.",
  })
) {}

export class GmailParamsResourceUsersSettingsUpdateVacation extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsUpdateVacation>(
  $I`GmailParamsResourceUsersSettingsUpdateVacation`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optional(GmailVacationSettings).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsUpdateVacation", {
    description: "Parameters for updating vacation settings.",
  })
) {}

// CSE Identity Parameters
export class GmailParamsResourceUsersSettingsCseIdentitiesCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseIdentitiesCreate>(
  $I`GmailParamsResourceUsersSettingsCseIdentitiesCreate`
)(
  {
    userId: S.optional(S.String).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optional(GmailCseIdentity).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseIdentitiesCreate", {
    description: "Parameters for creating a CSE identity.",
  })
) {}

export class GmailParamsResourceUsersSettingsCseIdentitiesDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseIdentitiesDelete>(
  $I`GmailParamsResourceUsersSettingsCseIdentitiesDelete`
)(
  {
    cseEmailAddress: S.optional(S.String).annotations({
      description:
        "The primary email address associated with the client-side encryption identity configuration that's removed.",
    }),
    userId: S.optional(S.String).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseIdentitiesDelete", {
    description: "Parameters for deleting a CSE identity.",
  })
) {}

export class GmailParamsResourceUsersSettingsCseIdentitiesGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseIdentitiesGet>(
  $I`GmailParamsResourceUsersSettingsCseIdentitiesGet`
)(
  {
    cseEmailAddress: S.optional(S.String).annotations({
      description:
        "The primary email address associated with the client-side encryption identity configuration that's retrieved.",
    }),
    userId: S.optional(S.String).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseIdentitiesGet", {
    description: "Parameters for getting a CSE identity.",
  })
) {}

export class GmailParamsResourceUsersSettingsCseIdentitiesList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseIdentitiesList>(
  $I`GmailParamsResourceUsersSettingsCseIdentitiesList`
)(
  {
    pageSize: S.optional(S.Number).annotations({
      description: "The number of identities to return. If not provided, the page size will default to 20 entries.",
    }),
    pageToken: S.optional(S.String).annotations({
      description: "Pagination token indicating which page of identities to return.",
    }),
    userId: S.optional(S.String).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseIdentitiesList", {
    description: "Parameters for listing CSE identities.",
  })
) {}

export class GmailParamsResourceUsersSettingsCseIdentitiesPatch extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseIdentitiesPatch>(
  $I`GmailParamsResourceUsersSettingsCseIdentitiesPatch`
)(
  {
    emailAddress: S.optional(S.String).annotations({
      description: "The email address of the client-side encryption identity to update.",
    }),
    userId: S.optional(S.String).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optional(GmailCseIdentity).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseIdentitiesPatch", {
    description: "Parameters for patching a CSE identity.",
  })
) {}

// CSE Keypairs Parameters
export class GmailParamsResourceUsersSettingsCseKeypairsCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsCreate>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsCreate`
)(
  {
    userId: S.optional(S.String).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optional(GmailCseKeyPair).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsCreate", {
    description: "Parameters for creating a CSE keypair.",
  })
) {}

export class GmailParamsResourceUsersSettingsCseKeypairsDisable extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsDisable>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsDisable`
)(
  {
    keyPairId: S.optional(S.String).annotations({
      description: "The identifier of the key pair to turn off.",
    }),
    userId: S.optional(S.String).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optional(GmailDisableCseKeyPairRequest).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsDisable", {
    description: "Parameters for disabling a CSE keypair.",
  })
) {}

export class GmailParamsResourceUsersSettingsCseKeypairsEnable extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsEnable>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsEnable`
)(
  {
    keyPairId: S.optional(S.String).annotations({
      description: "The identifier of the key pair to turn on.",
    }),
    userId: S.optional(S.String).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optional(GmailEnableCseKeyPairRequest).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsEnable", {
    description: "Parameters for enabling a CSE keypair.",
  })
) {}

export class GmailParamsResourceUsersSettingsCseKeypairsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsGet>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsGet`
)(
  {
    keyPairId: S.optional(S.String).annotations({
      description: "The identifier of the key pair to retrieve.",
    }),
    userId: S.optional(S.String).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsGet", {
    description: "Parameters for getting a CSE keypair.",
  })
) {}

export class GmailParamsResourceUsersSettingsCseKeypairsList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsList>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsList`
)(
  {
    pageSize: S.optional(S.Number).annotations({
      description: "The number of key pairs to return. If not provided, the page size will default to 20 entries.",
    }),
    pageToken: S.optional(S.String).annotations({
      description: "Pagination token indicating which page of key pairs to return.",
    }),
    userId: S.optional(S.String).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsList", {
    description: "Parameters for listing CSE keypairs.",
  })
) {}

export class GmailParamsResourceUsersSettingsCseKeypairsObliterate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsObliterate>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsObliterate`
)(
  {
    keyPairId: S.optional(S.String).annotations({
      description: "The identifier of the key pair to obliterate.",
    }),
    userId: S.optional(S.String).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optional(GmailObliterateCseKeyPairRequest).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsObliterate", {
    description: "Parameters for obliterating a CSE keypair.",
  })
) {}

// Delegates Parameters
export class GmailParamsResourceUsersSettingsDelegatesCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsDelegatesCreate>(
  $I`GmailParamsResourceUsersSettingsDelegatesCreate`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optional(GmailDelegate).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsDelegatesCreate", {
    description: "Parameters for creating a delegate.",
  })
) {}

export class GmailParamsResourceUsersSettingsDelegatesDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsDelegatesDelete>(
  $I`GmailParamsResourceUsersSettingsDelegatesDelete`
)(
  {
    delegateEmail: S.optional(S.String).annotations({
      description: "The email address of the user to be removed as a delegate.",
    }),
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsDelegatesDelete", {
    description: "Parameters for deleting a delegate.",
  })
) {}

export class GmailParamsResourceUsersSettingsDelegatesGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsDelegatesGet>(
  $I`GmailParamsResourceUsersSettingsDelegatesGet`
)(
  {
    delegateEmail: S.optional(S.String).annotations({
      description: "The email address of the user whose delegate relationship is to be retrieved.",
    }),
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsDelegatesGet", {
    description: "Parameters for getting a delegate.",
  })
) {}

export class GmailParamsResourceUsersSettingsDelegatesList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsDelegatesList>(
  $I`GmailParamsResourceUsersSettingsDelegatesList`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsDelegatesList", {
    description: "Parameters for listing delegates.",
  })
) {}

// Filters Parameters
export class GmailParamsResourceUsersSettingsFiltersCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsFiltersCreate>(
  $I`GmailParamsResourceUsersSettingsFiltersCreate`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optional(GmailFilter).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsFiltersCreate", {
    description: "Parameters for creating a filter.",
  })
) {}

export class GmailParamsResourceUsersSettingsFiltersDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsFiltersDelete>(
  $I`GmailParamsResourceUsersSettingsFiltersDelete`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the filter to be deleted.",
    }),
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsFiltersDelete", {
    description: "Parameters for deleting a filter.",
  })
) {}

export class GmailParamsResourceUsersSettingsFiltersGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsFiltersGet>(
  $I`GmailParamsResourceUsersSettingsFiltersGet`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the filter to be fetched.",
    }),
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsFiltersGet", {
    description: "Parameters for getting a filter.",
  })
) {}

export class GmailParamsResourceUsersSettingsFiltersList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsFiltersList>(
  $I`GmailParamsResourceUsersSettingsFiltersList`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsFiltersList", {
    description: "Parameters for listing filters.",
  })
) {}

// Forwarding Addresses Parameters
export class GmailParamsResourceUsersSettingsForwardingAddressesCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsForwardingAddressesCreate>(
  $I`GmailParamsResourceUsersSettingsForwardingAddressesCreate`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optional(GmailForwardingAddress).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsForwardingAddressesCreate", {
    description: "Parameters for creating a forwarding address.",
  })
) {}

export class GmailParamsResourceUsersSettingsForwardingAddressesDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsForwardingAddressesDelete>(
  $I`GmailParamsResourceUsersSettingsForwardingAddressesDelete`
)(
  {
    forwardingEmail: S.optional(S.String).annotations({
      description: "The forwarding address to be deleted.",
    }),
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsForwardingAddressesDelete", {
    description: "Parameters for deleting a forwarding address.",
  })
) {}

export class GmailParamsResourceUsersSettingsForwardingAddressesGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsForwardingAddressesGet>(
  $I`GmailParamsResourceUsersSettingsForwardingAddressesGet`
)(
  {
    forwardingEmail: S.optional(S.String).annotations({
      description: "The forwarding address to be retrieved.",
    }),
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsForwardingAddressesGet", {
    description: "Parameters for getting a forwarding address.",
  })
) {}

export class GmailParamsResourceUsersSettingsForwardingAddressesList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsForwardingAddressesList>(
  $I`GmailParamsResourceUsersSettingsForwardingAddressesList`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsForwardingAddressesList", {
    description: "Parameters for listing forwarding addresses.",
  })
) {}

// SendAs Parameters
export class GmailParamsResourceUsersSettingsSendAsCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsCreate>(
  $I`GmailParamsResourceUsersSettingsSendAsCreate`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optional(GmailSendAs).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsCreate", {
    description: "Parameters for creating a send-as alias.",
  })
) {}

export class GmailParamsResourceUsersSettingsSendAsDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsDelete>(
  $I`GmailParamsResourceUsersSettingsSendAsDelete`
)(
  {
    sendAsEmail: S.optional(S.String).annotations({
      description: "The send-as alias to be deleted.",
    }),
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsDelete", {
    description: "Parameters for deleting a send-as alias.",
  })
) {}

export class GmailParamsResourceUsersSettingsSendAsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsGet>(
  $I`GmailParamsResourceUsersSettingsSendAsGet`
)(
  {
    sendAsEmail: S.optional(S.String).annotations({
      description: "The send-as alias to be retrieved.",
    }),
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsGet", {
    description: "Parameters for getting a send-as alias.",
  })
) {}

export class GmailParamsResourceUsersSettingsSendAsList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsList>(
  $I`GmailParamsResourceUsersSettingsSendAsList`
)(
  {
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsList", {
    description: "Parameters for listing send-as aliases.",
  })
) {}

export class GmailParamsResourceUsersSettingsSendAsPatch extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsPatch>(
  $I`GmailParamsResourceUsersSettingsSendAsPatch`
)(
  {
    sendAsEmail: S.optional(S.String).annotations({
      description: "The send-as alias to be updated.",
    }),
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optional(GmailSendAs).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsPatch", {
    description: "Parameters for patching a send-as alias.",
  })
) {}

export class GmailParamsResourceUsersSettingsSendAsUpdate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsUpdate>(
  $I`GmailParamsResourceUsersSettingsSendAsUpdate`
)(
  {
    sendAsEmail: S.optional(S.String).annotations({
      description: "The send-as alias to be updated.",
    }),
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optional(GmailSendAs).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsUpdate", {
    description: "Parameters for updating a send-as alias.",
  })
) {}

export class GmailParamsResourceUsersSettingsSendAsVerify extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsVerify>(
  $I`GmailParamsResourceUsersSettingsSendAsVerify`
)(
  {
    sendAsEmail: S.optional(S.String).annotations({
      description: "The send-as alias to be verified.",
    }),
    userId: S.optional(S.String).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsVerify", {
    description: "Parameters for verifying a send-as alias.",
  })
) {}

// S/MIME Info Parameters
export class GmailParamsResourceUsersSettingsSendAsSmimeInfoDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsSmimeInfoDelete>(
  $I`GmailParamsResourceUsersSettingsSendAsSmimeInfoDelete`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The immutable ID for the SmimeInfo.",
    }),
    sendAsEmail: S.optional(S.String).annotations({
      description: 'The email address that appears in the "From:" header for mail sent using this alias.',
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsSmimeInfoDelete", {
    description: "Parameters for deleting S/MIME info.",
  })
) {}

export class GmailParamsResourceUsersSettingsSendAsSmimeInfoGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsSmimeInfoGet>(
  $I`GmailParamsResourceUsersSettingsSendAsSmimeInfoGet`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The immutable ID for the SmimeInfo.",
    }),
    sendAsEmail: S.optional(S.String).annotations({
      description: 'The email address that appears in the "From:" header for mail sent using this alias.',
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsSmimeInfoGet", {
    description: "Parameters for getting S/MIME info.",
  })
) {}

export class GmailParamsResourceUsersSettingsSendAsSmimeInfoInsert extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsSmimeInfoInsert>(
  $I`GmailParamsResourceUsersSettingsSendAsSmimeInfoInsert`
)(
  {
    sendAsEmail: S.optional(S.String).annotations({
      description: 'The email address that appears in the "From:" header for mail sent using this alias.',
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailSmimeInfo).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsSmimeInfoInsert", {
    description: "Parameters for inserting S/MIME info.",
  })
) {}

export class GmailParamsResourceUsersSettingsSendAsSmimeInfoList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsSmimeInfoList>(
  $I`GmailParamsResourceUsersSettingsSendAsSmimeInfoList`
)(
  {
    sendAsEmail: S.optional(S.String).annotations({
      description: 'The email address that appears in the "From:" header for mail sent using this alias.',
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsSmimeInfoList", {
    description: "Parameters for listing S/MIME info.",
  })
) {}

export class GmailParamsResourceUsersSettingsSendAsSmimeInfoSetDefault extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsSmimeInfoSetDefault>(
  $I`GmailParamsResourceUsersSettingsSendAsSmimeInfoSetDefault`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The immutable ID for the SmimeInfo.",
    }),
    sendAsEmail: S.optional(S.String).annotations({
      description: 'The email address that appears in the "From:" header for mail sent using this alias.',
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsSmimeInfoSetDefault", {
    description: "Parameters for setting default S/MIME info.",
  })
) {}

// Thread Parameters
export class GmailParamsResourceUsersThreadsDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsDelete>(
  $I`GmailParamsResourceUsersThreadsDelete`
)(
  {
    id: S.optional(S.String).annotations({
      description: "ID of the Thread to delete.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsDelete", {
    description: "Parameters for deleting a thread.",
  })
) {}

export class GmailParamsResourceUsersThreadsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsGet>(
  $I`GmailParamsResourceUsersThreadsGet`
)(
  {
    format: S.optional(S.String).annotations({
      description: "The format to return the messages in.",
    }),
    id: S.optional(S.String).annotations({
      description: "The ID of the thread to retrieve.",
    }),
    metadataHeaders: S.optional(S.Array(S.String)).annotations({
      description: "When given and format is METADATA, only include headers specified.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsGet", {
    description: "Parameters for getting a thread.",
  })
) {}

export class GmailParamsResourceUsersThreadsList extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsList>(
  $I`GmailParamsResourceUsersThreadsList`
)(
  {
    includeSpamTrash: S.optional(S.Boolean).annotations({
      description: "Include threads from `SPAM` and `TRASH` in the results.",
    }),
    labelIds: S.optional(S.Array(S.String)).annotations({
      description: "Only return threads with labels that match all of the specified label IDs.",
    }),
    maxResults: S.optional(S.Number).annotations({
      description:
        "Maximum number of threads to return. This field defaults to 100. The maximum allowed value for this field is 500.",
    }),
    pageToken: S.optional(S.String).annotations({
      description: "Page token to retrieve a specific page of results in the list.",
    }),
    q: S.optional(S.String).annotations({
      description: "Only return threads matching the specified query.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsList", {
    description: "Parameters for listing threads.",
  })
) {}

export class GmailParamsResourceUsersThreadsModify extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsModify>(
  $I`GmailParamsResourceUsersThreadsModify`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the thread to modify.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optional(GmailModifyThreadRequest).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsModify", {
    description: "Parameters for modifying a thread.",
  })
) {}

export class GmailParamsResourceUsersThreadsTrash extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsTrash>(
  $I`GmailParamsResourceUsersThreadsTrash`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the thread to Trash.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsTrash", {
    description: "Parameters for trashing a thread.",
  })
) {}

export class GmailParamsResourceUsersThreadsUntrash extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsUntrash>(
  $I`GmailParamsResourceUsersThreadsUntrash`
)(
  {
    id: S.optional(S.String).annotations({
      description: "The ID of the thread to remove from Trash.",
    }),
    userId: S.optional(S.String).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsUntrash", {
    description: "Parameters for untrashing a thread.",
  })
) {}
