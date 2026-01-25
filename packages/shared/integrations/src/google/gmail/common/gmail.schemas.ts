import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { thunkUndefined } from "@beep/utils";
import type { gmail_v1 } from "@googleapis/gmail";
import * as Encoding from "effect/Encoding";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SharedIntegrationsId.create("google/gmail/common/parse");

/**
 * Common helper for nullable optional string fields.
 * Uses exact: true for exactOptionalPropertyTypes compatibility with Gmail API.
 */
const CommonGmailField = S.optionalWith(S.String, { nullable: true, exact: true });

/**
 * Common helper for nullable optional boolean fields.
 * Uses exact: true for exactOptionalPropertyTypes compatibility with Gmail API.
 */
const CommonGmailBoolField = S.optionalWith(S.Boolean, { nullable: true, exact: true });

/**
 * Common helper for nullable optional number fields.
 * Uses exact: true for exactOptionalPropertyTypes compatibility with Gmail API.
 */
const CommonGmailNumberField = S.optionalWith(S.Number, { nullable: true, exact: true });

/**
 * Common helper for nullable optional string array fields.
 * Uses S.mutable for mutable arrays (Gmail API expects T[] not readonly T[]).
 * Uses exact: true for exactOptionalPropertyTypes compatibility.
 */
const CommonGmailStringArrayField = S.optionalWith(S.mutable(S.Array(S.String)), { nullable: true, exact: true });

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
    comment: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Optional comment",
    }),
  },
  $I.annotations("GmailUserAgentDirective", {
    description: "User agent directive for API requests.",
  })
) {}

export class GmailStandardParameters extends S.Class<GmailStandardParameters>($I`GmailStandardParameters`)(
  {
    auth: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Auth client or API Key for the request",
    }),
    errorFormat: S.optionalWith(S.String, { exact: true }).pipe(S.fromKey("$.xgafv")).annotations({
      description: "V1 error format.",
    }),
    accessToken: S.optionalWith(S.String, { exact: true }).pipe(S.fromKey("access_token")).annotations({
      description: "OAuth access token.",
    }),
    alt: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Data format for response.",
    }),
    callback: S.optionalWith(S.String, { exact: true }).annotations({
      description: "JSONP",
    }),
    fields: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Selector specifying which fields to include in a partial response.",
    }),
    key: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token.",
    }),
    oauthToken: S.optionalWith(S.String, { exact: true }).pipe(S.fromKey("oauth_token")).annotations({
      description: "OAuth 2.0 token for the current user.",
    }),
    prettyPrint: S.optionalWith(S.Boolean, { exact: true }).annotations({
      description: "Returns response with indentations and line breaks.",
    }),
    quotaUser: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters.",
    }),
    uploadType: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'Legacy upload protocol for media (e.g. "media", "multipart").',
    }),
    uploadProtocol: S.optionalWith(S.String, { exact: true }).pipe(S.fromKey("upload_protocol")).annotations({
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
) {
  static readonly new = (i: GmailAutoForwarding): gmail_v1.Schema$AutoForwarding => new GmailAutoForwarding(i);
}

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
) {
  static readonly new = (i: GmailBatchDeleteMessagesRequest): gmail_v1.Schema$BatchDeleteMessagesRequest =>
    new GmailBatchDeleteMessagesRequest(i);
}

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
) {
  static readonly new = (i: GmailBatchModifyMessagesRequest): gmail_v1.Schema$BatchModifyMessagesRequest =>
    new GmailBatchModifyMessagesRequest(i);
}

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
) {
  static readonly new = (i: GmailClassificationLabelFieldValue): gmail_v1.Schema$ClassificationLabelFieldValue =>
    new GmailClassificationLabelFieldValue(i);
}

export class GmailClassificationLabelValue extends S.Class<GmailClassificationLabelValue>(
  $I`GmailClassificationLabelValue`
)(
  {
    fields: S.optionalWith(S.mutable(S.Array(GmailClassificationLabelFieldValue)), {
      nullable: true,
      exact: true,
    }).annotations({
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
) {
  static readonly new = (i: GmailClassificationLabelValue): gmail_v1.Schema$ClassificationLabelValue =>
    new GmailClassificationLabelValue(i);
}

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
) {
  static readonly new = (i: GmailHardwareKeyMetadata): gmail_v1.Schema$HardwareKeyMetadata =>
    new GmailHardwareKeyMetadata(i);
}

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
) {
  static readonly new = (i: GmailKaclsKeyMetadata): gmail_v1.Schema$KaclsKeyMetadata => new GmailKaclsKeyMetadata(i);
}

export class GmailCsePrivateKeyMetadata extends S.Class<GmailCsePrivateKeyMetadata>($I`GmailCsePrivateKeyMetadata`)(
  {
    hardwareKeyMetadata: S.optionalWith(GmailHardwareKeyMetadata, { exact: true }).annotations({
      description: "Metadata for hardware keys.",
    }),
    kaclsKeyMetadata: S.optionalWith(GmailKaclsKeyMetadata, { exact: true }).annotations({
      description: "Metadata for a private key instance managed by an external key access control list service.",
    }),
    privateKeyMetadataId: CommonGmailField.annotations({
      description: "Output only. The immutable ID for the private key metadata instance.",
    }),
  },
  $I.annotations("GmailCsePrivateKeyMetadata", {
    description: "Metadata for a private key instance.",
  })
) {
  static readonly new = (i: GmailCsePrivateKeyMetadata): gmail_v1.Schema$CsePrivateKeyMetadata =>
    new GmailCsePrivateKeyMetadata(i);
}

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
) {
  static readonly new = (i: GmailSignAndEncryptKeyPairs): gmail_v1.Schema$SignAndEncryptKeyPairs =>
    new GmailSignAndEncryptKeyPairs(i);
}

export class GmailCseIdentity extends S.Class<GmailCseIdentity>($I`GmailCseIdentity`)(
  {
    emailAddress: CommonGmailField.annotations({
      description:
        "The email address for the sending identity. The email address must be the primary email address of the authenticated user.",
    }),
    primaryKeyPairId: CommonGmailField.annotations({
      description: "If a key pair is associated, the ID of the key pair, CseKeyPair.",
    }),
    signAndEncryptKeyPairs: S.optionalWith(GmailSignAndEncryptKeyPairs, { exact: true }).annotations({
      description: "The configuration of a CSE identity that uses different key pairs for signing and encryption.",
    }),
  },
  $I.annotations("GmailCseIdentity", {
    description: "The client-side encryption (CSE) configuration for the email address of an authenticated user.",
  })
) {
  static readonly new = (i: GmailCseIdentity): gmail_v1.Schema$CseIdentity => new GmailCseIdentity(i);
}

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
    privateKeyMetadata: S.optionalWith(S.mutable(S.Array(GmailCsePrivateKeyMetadata)), { exact: true }).annotations({
      description: "Metadata for instances of this key pair's private key.",
    }),
    subjectEmailAddresses: CommonGmailStringArrayField.annotations({
      description: "Output only. The email address identities that are specified on the leaf certificate.",
    }),
  },
  $I.annotations("GmailCseKeyPair", {
    description: "A client-side encryption S/MIME key pair.",
  })
) {
  static readonly new = (i: GmailCseKeyPair): gmail_v1.Schema$CseKeyPair => new GmailCseKeyPair(i);
}

export class GmailDisableCseKeyPairRequest extends S.Class<GmailDisableCseKeyPairRequest>(
  $I`GmailDisableCseKeyPairRequest`
)(
  {},
  $I.annotations("GmailDisableCseKeyPairRequest", {
    description: "Requests to turn off a client-side encryption key pair.",
  })
) {
  static readonly new = (i: GmailDisableCseKeyPairRequest): gmail_v1.Schema$DisableCseKeyPairRequest =>
    new GmailDisableCseKeyPairRequest(i);
}

export class GmailEnableCseKeyPairRequest extends S.Class<GmailEnableCseKeyPairRequest>(
  $I`GmailEnableCseKeyPairRequest`
)(
  {},
  $I.annotations("GmailEnableCseKeyPairRequest", {
    description: "Requests to turn on a client-side encryption key pair.",
  })
) {
  static readonly new = (i: GmailEnableCseKeyPairRequest): gmail_v1.Schema$EnableCseKeyPairRequest =>
    new GmailEnableCseKeyPairRequest(i);
}

export class GmailObliterateCseKeyPairRequest extends S.Class<GmailObliterateCseKeyPairRequest>(
  $I`GmailObliterateCseKeyPairRequest`
)(
  {},
  $I.annotations("GmailObliterateCseKeyPairRequest", {
    description: "Request to obliterate a CSE key pair.",
  })
) {
  static readonly new = (i: GmailObliterateCseKeyPairRequest): gmail_v1.Schema$ObliterateCseKeyPairRequest =>
    new GmailObliterateCseKeyPairRequest(i);
}

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
) {
  static readonly new = (i: GmailDelegate): gmail_v1.Schema$Delegate => new GmailDelegate(i);
}

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
) {
  static readonly new = (i: GmailFilterAction): gmail_v1.Schema$FilterAction => new GmailFilterAction(i);
}

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
) {
  static readonly new = (i: GmailFilterCriteria): gmail_v1.Schema$FilterCriteria => new GmailFilterCriteria(i);
}

export class GmailFilter extends S.Class<GmailFilter>($I`GmailFilter`)(
  {
    action: S.optionalWith(GmailFilterAction, { exact: true }).annotations({
      description: "Action that the filter performs.",
    }),
    criteria: S.optionalWith(GmailFilterCriteria, { exact: true }).annotations({
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
) {
  static readonly new = (i: GmailFilter): gmail_v1.Schema$Filter => new GmailFilter(i);
}

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
) {
  static readonly new = (i: GmailForwardingAddress): gmail_v1.Schema$ForwardingAddress => new GmailForwardingAddress(i);
}

// ============================================================================
// Message Types
// ============================================================================

export class GmailMessagePartBody extends S.Class<GmailMessagePartBody>($I`GmailMessagePartBody`)(
  {
    attachmentId: S.optionalWith(S.String, { nullable: true, exact: true }).annotations({
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
) {
  static readonly new = (i: GmailMessagePartBody): gmail_v1.Schema$MessagePartBody => new GmailMessagePartBody(i);
}

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
) {
  static readonly new = (i: GmailMessagePartHeader): gmail_v1.Schema$MessagePartHeader => new GmailMessagePartHeader(i);
}

// MessagePart is recursive, so we need a forward declaration approach
// Interface must match gmail_v1.Schema$MessagePart exactly (no readonly, no | undefined on optionals)
// This allows the schema type to be assignable to Gmail API types
export interface GmailMessagePartEncoded {
  body?: {
    attachmentId?: string | null;
    data?: string | null;
    size?: number | null;
  };
  filename?: string | null;
  headers?: {
    name?: string | null;
    value?: string | null;
  }[];
  mimeType?: string | null;
  partId?: string | null;
  parts?: GmailMessagePartEncoded[];
}

// Recursive schema for Gmail message parts
// Uses S.Struct + S.suspend pattern which is the idiomatic way to handle recursive types in Effect
// Type assertion needed due to recursive nature - the schema structure matches the interface
export const GmailMessagePart = S.Struct({
  body: S.optionalWith(
    S.Struct({
      attachmentId: CommonGmailField,
      data: CommonGmailField,
      size: CommonGmailNumberField,
    }),
    { exact: true }
  ).annotations({
    description: "The message part body for this part, which may be empty for container MIME message parts.",
  }),
  filename: CommonGmailField.annotations({
    description: "The filename of the attachment. Only present if this message part represents an attachment.",
  }),
  headers: S.optionalWith(
    S.mutable(
      S.Array(
        S.Struct({
          name: CommonGmailField,
          value: CommonGmailField,
        })
      )
    ),
    { exact: true }
  ).annotations({
    description: "List of headers on this message part.",
  }),
  mimeType: CommonGmailField.annotations({
    description: "The MIME type of the message part.",
  }),
  partId: CommonGmailField.annotations({
    description: "The immutable ID of the message part.",
  }),
  parts: S.optionalWith(
    S.mutable(
      S.Array(S.suspend((): S.Schema<GmailMessagePartEncoded> => GmailMessagePart as S.Schema<GmailMessagePartEncoded>))
    ),
    { exact: true }
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
    classificationLabelValues: S.optionalWith(S.mutable(S.Array(GmailClassificationLabelValue)), {
      nullable: true,
      exact: true,
    }).annotations({
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
    payload: S.optionalWith(GmailMessagePart, { exact: true }).annotations({
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
) {
  static readonly new = (i: GmailMessage): gmail_v1.Schema$Message => new GmailMessage(i);
}

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
) {
  static readonly new = (i: GmailModifyMessageRequest): gmail_v1.Schema$ModifyMessageRequest =>
    new GmailModifyMessageRequest(i);
}

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
) {
  static readonly new = (i: GmailModifyThreadRequest): gmail_v1.Schema$ModifyThreadRequest =>
    new GmailModifyThreadRequest(i);
}

// ============================================================================
// Draft
// ============================================================================

export class GmailDraft extends S.Class<GmailDraft>($I`GmailDraft`)(
  {
    id: CommonGmailField.annotations({
      description: "The immutable ID of the draft.",
    }),
    message: S.optionalWith(GmailMessage, { exact: true }).annotations({
      description: "The message content of the draft.",
    }),
  },
  $I.annotations("GmailDraft", {
    description: "A draft email in the user's mailbox.",
  })
) {
  static readonly new = (i: GmailDraft): gmail_v1.Schema$Draft => new GmailDraft(i);
}

// ============================================================================
// History Types
// ============================================================================

export class GmailHistoryLabelAdded extends S.Class<GmailHistoryLabelAdded>($I`GmailHistoryLabelAdded`)(
  {
    labelIds: CommonGmailStringArrayField.annotations({
      description: "Label IDs added to the message.",
    }),
    message: S.optionalWith(GmailMessage, { exact: true }).annotations({
      description: "The message.",
    }),
  },
  $I.annotations("GmailHistoryLabelAdded", {
    description: "Labels added to a message.",
  })
) {
  static readonly new = (i: GmailHistoryLabelAdded): gmail_v1.Schema$HistoryLabelAdded => new GmailHistoryLabelAdded(i);
}

export class GmailHistoryLabelRemoved extends S.Class<GmailHistoryLabelRemoved>($I`GmailHistoryLabelRemoved`)(
  {
    labelIds: CommonGmailStringArrayField.annotations({
      description: "Label IDs removed from the message.",
    }),
    message: S.optionalWith(GmailMessage, { exact: true }).annotations({
      description: "The message.",
    }),
  },
  $I.annotations("GmailHistoryLabelRemoved", {
    description: "Labels removed from a message.",
  })
) {
  static readonly new = (i: GmailHistoryLabelRemoved): gmail_v1.Schema$HistoryLabelRemoved =>
    new GmailHistoryLabelRemoved(i);
}

export class GmailHistoryMessageAdded extends S.Class<GmailHistoryMessageAdded>($I`GmailHistoryMessageAdded`)(
  {
    message: S.optionalWith(GmailMessage, { exact: true }).annotations({
      description: "The message.",
    }),
  },
  $I.annotations("GmailHistoryMessageAdded", {
    description: "Message added to mailbox.",
  })
) {
  static readonly new = (i: GmailHistoryMessageAdded): gmail_v1.Schema$HistoryMessageAdded =>
    new GmailHistoryMessageAdded(i);
}

export class GmailHistoryMessageDeleted extends S.Class<GmailHistoryMessageDeleted>($I`GmailHistoryMessageDeleted`)(
  {
    message: S.optionalWith(GmailMessage, { exact: true }).annotations({
      description: "The message.",
    }),
  },
  $I.annotations("GmailHistoryMessageDeleted", {
    description: "Message deleted from mailbox.",
  })
) {
  static readonly new = (i: GmailHistoryMessageDeleted): gmail_v1.Schema$HistoryMessageDeleted =>
    new GmailHistoryMessageDeleted(i);
}

export class GmailHistory extends S.Class<GmailHistory>($I`GmailHistory`)(
  {
    id: CommonGmailField.annotations({
      description: "The mailbox sequence ID.",
    }),
    labelsAdded: S.optionalWith(S.mutable(S.Array(GmailHistoryLabelAdded)), { exact: true }).annotations({
      description: "Labels added to messages in this history record.",
    }),
    labelsRemoved: S.optionalWith(S.mutable(S.Array(GmailHistoryLabelRemoved)), { exact: true }).annotations({
      description: "Labels removed from messages in this history record.",
    }),
    messages: S.optionalWith(S.mutable(S.Array(GmailMessage)), { exact: true }).annotations({
      description: "List of messages changed in this history record.",
    }),
    messagesAdded: S.optionalWith(S.mutable(S.Array(GmailHistoryMessageAdded)), { exact: true }).annotations({
      description: "Messages added to the mailbox in this history record.",
    }),
    messagesDeleted: S.optionalWith(S.mutable(S.Array(GmailHistoryMessageDeleted)), { exact: true }).annotations({
      description: "Messages deleted (not Trashed) from the mailbox in this history record.",
    }),
  },
  $I.annotations("GmailHistory", {
    description: "A record of a change to the user's mailbox.",
  })
) {
  static readonly new = (i: GmailHistory): gmail_v1.Schema$History => new GmailHistory(i);
}

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
) {
  static readonly new = (i: GmailImapSettings): gmail_v1.Schema$ImapSettings => new GmailImapSettings(i);
}

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
) {
  static readonly new = (i: GmailPopSettings): gmail_v1.Schema$PopSettings => new GmailPopSettings(i);
}

export class GmailLanguageSettings extends S.Class<GmailLanguageSettings>($I`GmailLanguageSettings`)(
  {
    displayLanguage: CommonGmailField.annotations({
      description: "The language to display Gmail in, formatted as an RFC 3066 Language Tag.",
    }),
  },
  $I.annotations("GmailLanguageSettings", {
    description: "Language settings for an account.",
  })
) {
  static readonly new = (i: GmailLanguageSettings): gmail_v1.Schema$LanguageSettings => new GmailLanguageSettings(i);
}

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
) {
  static readonly new = (i: GmailVacationSettings): gmail_v1.Schema$VacationSettings => new GmailVacationSettings(i);
}

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
) {
  static readonly new = (i: GmailLabelColor): gmail_v1.Schema$LabelColor => new GmailLabelColor(i);
}

export class GmailLabel extends S.Class<GmailLabel>($I`GmailLabel`)(
  {
    color: S.optionalWith(GmailLabelColor, { exact: true }).annotations({
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
) {
  static readonly new = (i: GmailLabel): gmail_v1.Schema$Label => new GmailLabel(i);
}

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
) {
  static readonly new = (i: GmailSmtpMsa): gmail_v1.Schema$SmtpMsa => new GmailSmtpMsa(i);
}

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
    smtpMsa: S.optionalWith(GmailSmtpMsa, { exact: true }).annotations({
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
) {
  static readonly new = (i: GmailSendAs): gmail_v1.Schema$SendAs => new GmailSendAs(i);
}

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
) {
  static readonly new = (i: GmailSmimeInfo): gmail_v1.Schema$SmimeInfo => new GmailSmimeInfo(i);
}

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
    messages: S.optionalWith(S.mutable(S.Array(GmailMessage)), { exact: true }).annotations({
      description: "The list of messages in the thread.",
    }),
    snippet: CommonGmailField.annotations({
      description: "A short part of the message text.",
    }),
  },
  $I.annotations("GmailThread", {
    description: "A collection of messages representing a conversation.",
  })
) {
  static readonly new = (i: GmailThread): gmail_v1.Schema$Thread => new GmailThread(i);
}

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
) {
  static readonly new = (i: GmailProfile): gmail_v1.Schema$Profile => new GmailProfile(i);
}

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
) {
  static readonly new = (i: GmailWatchRequest): gmail_v1.Schema$WatchRequest => new GmailWatchRequest(i);
}

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
) {
  static readonly new = (i: GmailWatchResponse): gmail_v1.Schema$WatchResponse => new GmailWatchResponse(i);
}

// ============================================================================
// List Response Types
// ============================================================================

export class GmailListCseIdentitiesResponse extends S.Class<GmailListCseIdentitiesResponse>(
  $I`GmailListCseIdentitiesResponse`
)(
  {
    cseIdentities: S.optionalWith(S.mutable(S.Array(GmailCseIdentity)), { exact: true }).annotations({
      description: "One page of the list of CSE identities configured for the user.",
    }),
    nextPageToken: CommonGmailField.annotations({
      description: "Pagination token to be passed to a subsequent ListCseIdentities call.",
    }),
  },
  $I.annotations("GmailListCseIdentitiesResponse", {
    description: "Response for listing CSE identities.",
  })
) {
  static readonly new = (i: GmailListCseIdentitiesResponse): gmail_v1.Schema$ListCseIdentitiesResponse =>
    new GmailListCseIdentitiesResponse(i);
}

export class GmailListCseKeyPairsResponse extends S.Class<GmailListCseKeyPairsResponse>(
  $I`GmailListCseKeyPairsResponse`
)(
  {
    cseKeyPairs: S.optionalWith(S.mutable(S.Array(GmailCseKeyPair)), { exact: true }).annotations({
      description: "One page of the list of CSE key pairs installed for the user.",
    }),
    nextPageToken: CommonGmailField.annotations({
      description: "Pagination token to be passed to a subsequent ListCseKeyPairs call.",
    }),
  },
  $I.annotations("GmailListCseKeyPairsResponse", {
    description: "Response for listing CSE key pairs.",
  })
) {
  static readonly new = (i: GmailListCseKeyPairsResponse): gmail_v1.Schema$ListCseKeyPairsResponse =>
    new GmailListCseKeyPairsResponse(i);
}

export class GmailListDelegatesResponse extends S.Class<GmailListDelegatesResponse>($I`GmailListDelegatesResponse`)(
  {
    delegates: S.optionalWith(S.mutable(S.Array(GmailDelegate)), { exact: true }).annotations({
      description: "List of the user's delegates (with any verification status).",
    }),
  },
  $I.annotations("GmailListDelegatesResponse", {
    description: "Response for the ListDelegates method.",
  })
) {
  static readonly new = (i: GmailListDelegatesResponse): gmail_v1.Schema$ListDelegatesResponse =>
    new GmailListDelegatesResponse(i);
}

export class GmailListDraftsResponse extends S.Class<GmailListDraftsResponse>($I`GmailListDraftsResponse`)(
  {
    drafts: S.optionalWith(S.mutable(S.Array(GmailDraft)), { exact: true }).annotations({
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
) {
  static readonly new = (i: GmailListDraftsResponse): gmail_v1.Schema$ListDraftsResponse =>
    new GmailListDraftsResponse(i);
}

export class GmailListFiltersResponse extends S.Class<GmailListFiltersResponse>($I`GmailListFiltersResponse`)(
  {
    filter: S.optionalWith(S.mutable(S.Array(GmailFilter)), { exact: true }).annotations({
      description: "List of a user's filters.",
    }),
  },
  $I.annotations("GmailListFiltersResponse", {
    description: "Response for the ListFilters method.",
  })
) {
  static readonly new = (i: GmailListFiltersResponse): gmail_v1.Schema$ListFiltersResponse =>
    new GmailListFiltersResponse(i);
}

export class GmailListForwardingAddressesResponse extends S.Class<GmailListForwardingAddressesResponse>(
  $I`GmailListForwardingAddressesResponse`
)(
  {
    forwardingAddresses: S.optionalWith(S.mutable(S.Array(GmailForwardingAddress)), { exact: true }).annotations({
      description: "List of addresses that may be used for forwarding.",
    }),
  },
  $I.annotations("GmailListForwardingAddressesResponse", {
    description: "Response for the ListForwardingAddresses method.",
  })
) {
  static readonly new = (i: GmailListForwardingAddressesResponse): gmail_v1.Schema$ListForwardingAddressesResponse =>
    new GmailListForwardingAddressesResponse(i);
}

export class GmailListHistoryResponse extends S.Class<GmailListHistoryResponse>($I`GmailListHistoryResponse`)(
  {
    history: S.optionalWith(S.mutable(S.Array(GmailHistory)), { exact: true }).annotations({
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
) {
  static readonly new = (i: GmailListHistoryResponse): gmail_v1.Schema$ListHistoryResponse =>
    new GmailListHistoryResponse(i);
}

export class GmailListLabelsResponse extends S.Class<GmailListLabelsResponse>($I`GmailListLabelsResponse`)(
  {
    labels: S.optionalWith(S.mutable(S.Array(GmailLabel)), { exact: true }).annotations({
      description: "List of labels.",
    }),
  },
  $I.annotations("GmailListLabelsResponse", {
    description: "Response for listing labels.",
  })
) {
  static readonly new = (i: GmailListLabelsResponse): gmail_v1.Schema$ListLabelsResponse =>
    new GmailListLabelsResponse(i);
}

export class GmailListMessagesResponse extends S.Class<GmailListMessagesResponse>($I`GmailListMessagesResponse`)(
  {
    messages: S.optionalWith(S.mutable(S.Array(GmailMessage)), { exact: true }).annotations({
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
) {
  static readonly new = (i: GmailListMessagesResponse): gmail_v1.Schema$ListMessagesResponse =>
    new GmailListMessagesResponse(i);
}

export class GmailListSendAsResponse extends S.Class<GmailListSendAsResponse>($I`GmailListSendAsResponse`)(
  {
    sendAs: S.optionalWith(S.mutable(S.Array(GmailSendAs)), { exact: true }).annotations({
      description: "List of send-as aliases.",
    }),
  },
  $I.annotations("GmailListSendAsResponse", {
    description: "Response for the ListSendAs method.",
  })
) {
  static readonly new = (i: GmailListSendAsResponse): gmail_v1.Schema$ListSendAsResponse =>
    new GmailListSendAsResponse(i);
}

export class GmailListSmimeInfoResponse extends S.Class<GmailListSmimeInfoResponse>($I`GmailListSmimeInfoResponse`)(
  {
    smimeInfo: S.optionalWith(S.mutable(S.Array(GmailSmimeInfo)), { exact: true }).annotations({
      description: "List of SmimeInfo.",
    }),
  },
  $I.annotations("GmailListSmimeInfoResponse", {
    description: "Response for listing S/MIME info.",
  })
) {
  static readonly new = (i: GmailListSmimeInfoResponse): gmail_v1.Schema$ListSmimeInfoResponse =>
    new GmailListSmimeInfoResponse(i);
}

export class GmailListThreadsResponse extends S.Class<GmailListThreadsResponse>($I`GmailListThreadsResponse`)(
  {
    nextPageToken: CommonGmailField.annotations({
      description: "Page token to retrieve the next page of results in the list.",
    }),
    resultSizeEstimate: CommonGmailNumberField.annotations({
      description: "Estimated total number of results.",
    }),
    threads: S.optionalWith(S.mutable(S.Array(GmailThread)), { exact: true }).annotations({
      description: "List of threads.",
    }),
  },
  $I.annotations("GmailListThreadsResponse", {
    description: "Response for listing threads.",
  })
) {
  static readonly new = (i: GmailListThreadsResponse): gmail_v1.Schema$ListThreadsResponse =>
    new GmailListThreadsResponse(i);
}

// ============================================================================
// Resource Parameter Types (extends StandardParameters)
// ============================================================================

export class GmailParamsResourceUsersGetProfile extends GmailStandardParameters.extend<GmailParamsResourceUsersGetProfile>(
  $I`GmailParamsResourceUsersGetProfile`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersGetProfile", {
    description: "Parameters for the `resource.users.getProfile` method.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersGetProfile): gmail_v1.Params$Resource$Users$Getprofile =>
    new GmailParamsResourceUsersGetProfile(i);
}

export class GmailParamsResourceUsersStop extends GmailStandardParameters.extend<GmailParamsResourceUsersStop>(
  $I`GmailParamsResourceUsersStop`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersStop", {
    description: "Parameters for the `resource.users.stop` method.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersStop): gmail_v1.Params$Resource$Users$Stop =>
    new GmailParamsResourceUsersStop(i);
}

export class GmailParamsResourceUsersWatch extends GmailStandardParameters.extend<GmailParamsResourceUsersWatch>(
  $I`GmailParamsResourceUsersWatch`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailWatchRequest, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersWatch", {
    description: "Parameters for the `resource.users.watch` method.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersWatch): gmail_v1.Params$Resource$Users$Watch =>
    new GmailParamsResourceUsersWatch(i);
}

// Draft Parameters
export class GmailParamsResourceUsersDraftsCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsCreate>(
  $I`GmailParamsResourceUsersDraftsCreate`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailDraft, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsCreate", {
    description: "Parameters for creating a draft.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersDraftsCreate): gmail_v1.Params$Resource$Users$Drafts$Create =>
    new GmailParamsResourceUsersDraftsCreate(i);
}

export class GmailParamsResourceUsersDraftsDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsDelete>(
  $I`GmailParamsResourceUsersDraftsDelete`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the draft to delete.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsDelete", {
    description: "Parameters for deleting a draft.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersDraftsDelete): gmail_v1.Params$Resource$Users$Drafts$Delete =>
    new GmailParamsResourceUsersDraftsDelete(i);
}

export class GmailParamsResourceUsersDraftsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsGet>(
  $I`GmailParamsResourceUsersDraftsGet`
)(
  {
    format: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The format to return the draft in.",
    }),
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the draft to retrieve.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsGet", {
    description: "Parameters for getting a draft.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersDraftsGet): gmail_v1.Params$Resource$Users$Drafts$Get =>
    new GmailParamsResourceUsersDraftsGet(i);
}

export class GmailParamsResourceUsersDraftsList extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsList>(
  $I`GmailParamsResourceUsersDraftsList`
)(
  {
    includeSpamTrash: S.optionalWith(S.Boolean, { exact: true }).annotations({
      description: "Include drafts from `SPAM` and `TRASH` in the results.",
    }),
    maxResults: S.optionalWith(S.Number, { exact: true }).annotations({
      description:
        "Maximum number of drafts to return. This field defaults to 100. The maximum allowed value for this field is 500.",
    }),
    pageToken: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Page token to retrieve a specific page of results in the list.",
    }),
    q: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Only return draft messages matching the specified query.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsList", {
    description: "Parameters for listing drafts.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersDraftsList): gmail_v1.Params$Resource$Users$Drafts$List =>
    new GmailParamsResourceUsersDraftsList(i);
}

export class GmailParamsResourceUsersDraftsSend extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsSend>(
  $I`GmailParamsResourceUsersDraftsSend`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailDraft, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsSend", {
    description: "Parameters for sending a draft.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersDraftsSend): gmail_v1.Params$Resource$Users$Drafts$Send =>
    new GmailParamsResourceUsersDraftsSend(i);
}

export class GmailParamsResourceUsersDraftsUpdate extends GmailStandardParameters.extend<GmailParamsResourceUsersDraftsUpdate>(
  $I`GmailParamsResourceUsersDraftsUpdate`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the draft to update.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailDraft, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersDraftsUpdate", {
    description: "Parameters for updating a draft.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersDraftsUpdate): gmail_v1.Params$Resource$Users$Drafts$Update =>
    new GmailParamsResourceUsersDraftsUpdate(i);
}

// History Parameters
export class GmailParamsResourceUsersHistoryList extends GmailStandardParameters.extend<GmailParamsResourceUsersHistoryList>(
  $I`GmailParamsResourceUsersHistoryList`
)(
  {
    historyTypes: S.optionalWith(S.mutable(S.Array(S.String)), { exact: true }).annotations({
      description: "History types to be returned by the function",
    }),
    labelId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Only return messages with a label matching the ID.",
    }),
    maxResults: S.optionalWith(S.Number, { exact: true }).annotations({
      description:
        "Maximum number of history records to return. This field defaults to 100. The maximum allowed value for this field is 500.",
    }),
    pageToken: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Page token to retrieve a specific page of results in the list.",
    }),
    startHistoryId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Required. Returns history records after the specified `startHistoryId`.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersHistoryList", {
    description: "Parameters for listing history.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersHistoryList): gmail_v1.Params$Resource$Users$History$List =>
    new GmailParamsResourceUsersHistoryList(i);
}

// Label Parameters
export class GmailParamsResourceUsersLabelsCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsCreate>(
  $I`GmailParamsResourceUsersLabelsCreate`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailLabel, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsCreate", {
    description: "Parameters for creating a label.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersLabelsCreate): gmail_v1.Params$Resource$Users$Labels$Create =>
    new GmailParamsResourceUsersLabelsCreate(i);
}

export class GmailParamsResourceUsersLabelsDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsDelete>(
  $I`GmailParamsResourceUsersLabelsDelete`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the label to delete.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsDelete", {
    description: "Parameters for deleting a label.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersLabelsDelete): gmail_v1.Params$Resource$Users$Labels$Delete =>
    new GmailParamsResourceUsersLabelsDelete(i);
}

export class GmailParamsResourceUsersLabelsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsGet>(
  $I`GmailParamsResourceUsersLabelsGet`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the label to retrieve.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsGet", {
    description: "Parameters for getting a label.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersLabelsGet): gmail_v1.Params$Resource$Users$Labels$Get =>
    new GmailParamsResourceUsersLabelsGet(i);
}

export class GmailParamsResourceUsersLabelsList extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsList>(
  $I`GmailParamsResourceUsersLabelsList`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsList", {
    description: "Parameters for listing labels.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersLabelsList): gmail_v1.Params$Resource$Users$Labels$List =>
    new GmailParamsResourceUsersLabelsList(i);
}

export class GmailParamsResourceUsersLabelsPatch extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsPatch>(
  $I`GmailParamsResourceUsersLabelsPatch`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the label to update.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailLabel, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsPatch", {
    description: "Parameters for patching a label.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersLabelsPatch): gmail_v1.Params$Resource$Users$Labels$Patch =>
    new GmailParamsResourceUsersLabelsPatch(i);
}

export class GmailParamsResourceUsersLabelsUpdate extends GmailStandardParameters.extend<GmailParamsResourceUsersLabelsUpdate>(
  $I`GmailParamsResourceUsersLabelsUpdate`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the label to update.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailLabel, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersLabelsUpdate", {
    description: "Parameters for updating a label.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersLabelsUpdate): gmail_v1.Params$Resource$Users$Labels$Update =>
    new GmailParamsResourceUsersLabelsUpdate(i);
}

// Message Parameters
export class GmailParamsResourceUsersMessagesBatchDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesBatchDelete>(
  $I`GmailParamsResourceUsersMessagesBatchDelete`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailBatchDeleteMessagesRequest, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesBatchDelete", {
    description: "Parameters for batch deleting messages.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersMessagesBatchDelete
  ): gmail_v1.Params$Resource$Users$Messages$Batchdelete => new GmailParamsResourceUsersMessagesBatchDelete(i);
}

export class GmailParamsResourceUsersMessagesBatchModify extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesBatchModify>(
  $I`GmailParamsResourceUsersMessagesBatchModify`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailBatchModifyMessagesRequest, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesBatchModify", {
    description: "Parameters for batch modifying messages.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersMessagesBatchModify
  ): gmail_v1.Params$Resource$Users$Messages$Batchmodify => new GmailParamsResourceUsersMessagesBatchModify(i);
}

export class GmailParamsResourceUsersMessagesDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesDelete>(
  $I`GmailParamsResourceUsersMessagesDelete`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the message to delete.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesDelete", {
    description: "Parameters for deleting a message.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersMessagesDelete): gmail_v1.Params$Resource$Users$Messages$Delete =>
    new GmailParamsResourceUsersMessagesDelete(i);
}

export class GmailParamsResourceUsersMessagesGet extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesGet>(
  $I`GmailParamsResourceUsersMessagesGet`
)(
  {
    format: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The format to return the message in.",
    }),
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the message to retrieve.",
    }),
    metadataHeaders: S.optionalWith(S.mutable(S.Array(S.String)), { exact: true }).annotations({
      description: "When given and format is `METADATA`, only include headers specified.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesGet", {
    description: "Parameters for getting a message.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersMessagesGet): gmail_v1.Params$Resource$Users$Messages$Get =>
    new GmailParamsResourceUsersMessagesGet(i);
}

export class GmailParamsResourceUsersMessagesImport extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesImport>(
  $I`GmailParamsResourceUsersMessagesImport`
)(
  {
    deleted: S.optionalWith(S.Boolean, { exact: true }).annotations({
      description: "Mark the email as permanently deleted (not TRASH).",
    }),
    internalDateSource: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Source for Gmail's internal date of the message.",
    }),
    neverMarkSpam: S.optionalWith(S.Boolean, { exact: true }).annotations({
      description: "Ignore the Gmail spam classifier decision and never mark this email as SPAM.",
    }),
    processForCalendar: S.optionalWith(S.Boolean, { exact: true }).annotations({
      description: "Process calendar invites in the email.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailMessage, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesImport", {
    description: "Parameters for importing a message.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersMessagesImport): gmail_v1.Params$Resource$Users$Messages$Import =>
    new GmailParamsResourceUsersMessagesImport(i);
}

export class GmailParamsResourceUsersMessagesInsert extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesInsert>(
  $I`GmailParamsResourceUsersMessagesInsert`
)(
  {
    deleted: S.optionalWith(S.Boolean, { exact: true }).annotations({
      description: "Mark the email as permanently deleted (not TRASH).",
    }),
    internalDateSource: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Source for Gmail's internal date of the message.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailMessage, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesInsert", {
    description: "Parameters for inserting a message.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersMessagesInsert): gmail_v1.Params$Resource$Users$Messages$Insert =>
    new GmailParamsResourceUsersMessagesInsert(i);
}

export class GmailParamsResourceUsersMessagesList extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesList>(
  $I`GmailParamsResourceUsersMessagesList`
)(
  {
    includeSpamTrash: S.optionalWith(S.Boolean, { exact: true }).annotations({
      description: "Include messages from `SPAM` and `TRASH` in the results.",
    }),
    labelIds: S.optionalWith(S.mutable(S.Array(S.String)), { exact: true }).annotations({
      description: "Only return messages with labels that match all of the specified label IDs.",
    }),
    maxResults: S.optionalWith(S.Number, { exact: true }).annotations({
      description:
        "Maximum number of messages to return. This field defaults to 100. The maximum allowed value for this field is 500.",
    }),
    pageToken: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Page token to retrieve a specific page of results in the list.",
    }),
    q: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Only return messages matching the specified query.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesList", {
    description: "Parameters for listing messages.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersMessagesList): gmail_v1.Params$Resource$Users$Messages$List =>
    new GmailParamsResourceUsersMessagesList(i);
}

export class GmailParamsResourceUsersMessagesModify extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesModify>(
  $I`GmailParamsResourceUsersMessagesModify`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the message to modify.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailModifyMessageRequest, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesModify", {
    description: "Parameters for modifying a message.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersMessagesModify): gmail_v1.Params$Resource$Users$Messages$Modify =>
    new GmailParamsResourceUsersMessagesModify(i);
}

export class GmailParamsResourceUsersMessagesSend extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesSend>(
  $I`GmailParamsResourceUsersMessagesSend`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailMessage, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesSend", {
    description: "Parameters for sending a message.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersMessagesSend): gmail_v1.Params$Resource$Users$Messages$Send =>
    new GmailParamsResourceUsersMessagesSend(i);
}

export class GmailParamsResourceUsersMessagesTrash extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesTrash>(
  $I`GmailParamsResourceUsersMessagesTrash`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the message to Trash.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesTrash", {
    description: "Parameters for trashing a message.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersMessagesTrash): gmail_v1.Params$Resource$Users$Messages$Trash =>
    new GmailParamsResourceUsersMessagesTrash(i);
}

export class GmailParamsResourceUsersMessagesUntrash extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesUntrash>(
  $I`GmailParamsResourceUsersMessagesUntrash`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the message to remove from Trash.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesUntrash", {
    description: "Parameters for untrashing a message.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersMessagesUntrash): gmail_v1.Params$Resource$Users$Messages$Untrash =>
    new GmailParamsResourceUsersMessagesUntrash(i);
}

export class GmailParamsResourceUsersMessagesAttachmentsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersMessagesAttachmentsGet>(
  $I`GmailParamsResourceUsersMessagesAttachmentsGet`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the attachment.",
    }),
    messageId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the message containing the attachment.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersMessagesAttachmentsGet", {
    description: "Parameters for getting an attachment.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersMessagesAttachmentsGet
  ): gmail_v1.Params$Resource$Users$Messages$Attachments$Get => new GmailParamsResourceUsersMessagesAttachmentsGet(i);
}

// Settings Parameters
export class GmailParamsResourceUsersSettingsGetAutoForwarding extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsGetAutoForwarding>(
  $I`GmailParamsResourceUsersSettingsGetAutoForwarding`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsGetAutoForwarding", {
    description: "Parameters for getting auto-forwarding settings.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsGetAutoForwarding
  ): gmail_v1.Params$Resource$Users$Settings$Getautoforwarding =>
    new GmailParamsResourceUsersSettingsGetAutoForwarding(i);
}

export class GmailParamsResourceUsersSettingsGetImap extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsGetImap>(
  $I`GmailParamsResourceUsersSettingsGetImap`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsGetImap", {
    description: "Parameters for getting IMAP settings.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersSettingsGetImap): gmail_v1.Params$Resource$Users$Settings$Getimap =>
    new GmailParamsResourceUsersSettingsGetImap(i);
}

export class GmailParamsResourceUsersSettingsGetLanguage extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsGetLanguage>(
  $I`GmailParamsResourceUsersSettingsGetLanguage`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsGetLanguage", {
    description: "Parameters for getting language settings.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsGetLanguage
  ): gmail_v1.Params$Resource$Users$Settings$Getlanguage => new GmailParamsResourceUsersSettingsGetLanguage(i);
}

export class GmailParamsResourceUsersSettingsGetPop extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsGetPop>(
  $I`GmailParamsResourceUsersSettingsGetPop`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsGetPop", {
    description: "Parameters for getting POP settings.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersSettingsGetPop): gmail_v1.Params$Resource$Users$Settings$Getpop =>
    new GmailParamsResourceUsersSettingsGetPop(i);
}

export class GmailParamsResourceUsersSettingsGetVacation extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsGetVacation>(
  $I`GmailParamsResourceUsersSettingsGetVacation`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsGetVacation", {
    description: "Parameters for getting vacation settings.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsGetVacation
  ): gmail_v1.Params$Resource$Users$Settings$Getvacation => new GmailParamsResourceUsersSettingsGetVacation(i);
}

export class GmailParamsResourceUsersSettingsUpdateAutoForwarding extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsUpdateAutoForwarding>(
  $I`GmailParamsResourceUsersSettingsUpdateAutoForwarding`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optionalWith(GmailAutoForwarding, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsUpdateAutoForwarding", {
    description: "Parameters for updating auto-forwarding settings.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsUpdateAutoForwarding
  ): gmail_v1.Params$Resource$Users$Settings$Updateautoforwarding =>
    new GmailParamsResourceUsersSettingsUpdateAutoForwarding(i);
}

export class GmailParamsResourceUsersSettingsUpdateImap extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsUpdateImap>(
  $I`GmailParamsResourceUsersSettingsUpdateImap`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optionalWith(GmailImapSettings, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsUpdateImap", {
    description: "Parameters for updating IMAP settings.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsUpdateImap
  ): gmail_v1.Params$Resource$Users$Settings$Updateimap => new GmailParamsResourceUsersSettingsUpdateImap(i);
}

export class GmailParamsResourceUsersSettingsUpdateLanguage extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsUpdateLanguage>(
  $I`GmailParamsResourceUsersSettingsUpdateLanguage`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optionalWith(GmailLanguageSettings, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsUpdateLanguage", {
    description: "Parameters for updating language settings.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsUpdateLanguage
  ): gmail_v1.Params$Resource$Users$Settings$Updatelanguage => new GmailParamsResourceUsersSettingsUpdateLanguage(i);
}

export class GmailParamsResourceUsersSettingsUpdatePop extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsUpdatePop>(
  $I`GmailParamsResourceUsersSettingsUpdatePop`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optionalWith(GmailPopSettings, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsUpdatePop", {
    description: "Parameters for updating POP settings.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsUpdatePop
  ): gmail_v1.Params$Resource$Users$Settings$Updatepop => new GmailParamsResourceUsersSettingsUpdatePop(i);
}

export class GmailParamsResourceUsersSettingsUpdateVacation extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsUpdateVacation>(
  $I`GmailParamsResourceUsersSettingsUpdateVacation`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optionalWith(GmailVacationSettings, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsUpdateVacation", {
    description: "Parameters for updating vacation settings.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsUpdateVacation
  ): gmail_v1.Params$Resource$Users$Settings$Updatevacation => new GmailParamsResourceUsersSettingsUpdateVacation(i);
}

// CSE Identity Parameters
export class GmailParamsResourceUsersSettingsCseIdentitiesCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseIdentitiesCreate>(
  $I`GmailParamsResourceUsersSettingsCseIdentitiesCreate`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optionalWith(GmailCseIdentity, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseIdentitiesCreate", {
    description: "Parameters for creating a CSE identity.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsCseIdentitiesCreate
  ): gmail_v1.Params$Resource$Users$Settings$Cse$Identities$Create =>
    new GmailParamsResourceUsersSettingsCseIdentitiesCreate(i);
}

export class GmailParamsResourceUsersSettingsCseIdentitiesDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseIdentitiesDelete>(
  $I`GmailParamsResourceUsersSettingsCseIdentitiesDelete`
)(
  {
    cseEmailAddress: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The primary email address associated with the client-side encryption identity configuration that's removed.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseIdentitiesDelete", {
    description: "Parameters for deleting a CSE identity.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsCseIdentitiesDelete
  ): gmail_v1.Params$Resource$Users$Settings$Cse$Identities$Delete =>
    new GmailParamsResourceUsersSettingsCseIdentitiesDelete(i);
}

export class GmailParamsResourceUsersSettingsCseIdentitiesGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseIdentitiesGet>(
  $I`GmailParamsResourceUsersSettingsCseIdentitiesGet`
)(
  {
    cseEmailAddress: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The primary email address associated with the client-side encryption identity configuration that's retrieved.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseIdentitiesGet", {
    description: "Parameters for getting a CSE identity.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsCseIdentitiesGet
  ): gmail_v1.Params$Resource$Users$Settings$Cse$Identities$Get =>
    new GmailParamsResourceUsersSettingsCseIdentitiesGet(i);
}

export class GmailParamsResourceUsersSettingsCseIdentitiesList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseIdentitiesList>(
  $I`GmailParamsResourceUsersSettingsCseIdentitiesList`
)(
  {
    pageSize: S.optionalWith(S.Number, { exact: true }).annotations({
      description: "The number of identities to return. If not provided, the page size will default to 20 entries.",
    }),
    pageToken: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Pagination token indicating which page of identities to return.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseIdentitiesList", {
    description: "Parameters for listing CSE identities.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsCseIdentitiesList
  ): gmail_v1.Params$Resource$Users$Settings$Cse$Identities$List =>
    new GmailParamsResourceUsersSettingsCseIdentitiesList(i);
}

export class GmailParamsResourceUsersSettingsCseIdentitiesPatch extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseIdentitiesPatch>(
  $I`GmailParamsResourceUsersSettingsCseIdentitiesPatch`
)(
  {
    emailAddress: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The email address of the client-side encryption identity to update.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optionalWith(GmailCseIdentity, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseIdentitiesPatch", {
    description: "Parameters for patching a CSE identity.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsCseIdentitiesPatch
  ): gmail_v1.Params$Resource$Users$Settings$Cse$Identities$Patch =>
    new GmailParamsResourceUsersSettingsCseIdentitiesPatch(i);
}

// CSE Keypairs Parameters
export class GmailParamsResourceUsersSettingsCseKeypairsCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsCreate>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsCreate`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optionalWith(GmailCseKeyPair, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsCreate", {
    description: "Parameters for creating a CSE keypair.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsCseKeypairsCreate
  ): gmail_v1.Params$Resource$Users$Settings$Cse$Keypairs$Create =>
    new GmailParamsResourceUsersSettingsCseKeypairsCreate(i);
}

export class GmailParamsResourceUsersSettingsCseKeypairsDisable extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsDisable>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsDisable`
)(
  {
    keyPairId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The identifier of the key pair to turn off.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optionalWith(GmailDisableCseKeyPairRequest, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsDisable", {
    description: "Parameters for disabling a CSE keypair.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsCseKeypairsDisable
  ): gmail_v1.Params$Resource$Users$Settings$Cse$Keypairs$Disable =>
    new GmailParamsResourceUsersSettingsCseKeypairsDisable(i);
}

export class GmailParamsResourceUsersSettingsCseKeypairsEnable extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsEnable>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsEnable`
)(
  {
    keyPairId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The identifier of the key pair to turn on.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optionalWith(GmailEnableCseKeyPairRequest, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsEnable", {
    description: "Parameters for enabling a CSE keypair.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsCseKeypairsEnable
  ): gmail_v1.Params$Resource$Users$Settings$Cse$Keypairs$Enable =>
    new GmailParamsResourceUsersSettingsCseKeypairsEnable(i);
}

export class GmailParamsResourceUsersSettingsCseKeypairsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsGet>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsGet`
)(
  {
    keyPairId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The identifier of the key pair to retrieve.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsGet", {
    description: "Parameters for getting a CSE keypair.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsCseKeypairsGet
  ): gmail_v1.Params$Resource$Users$Settings$Cse$Keypairs$Get => new GmailParamsResourceUsersSettingsCseKeypairsGet(i);
}

export class GmailParamsResourceUsersSettingsCseKeypairsList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsList>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsList`
)(
  {
    pageSize: S.optionalWith(S.Number, { exact: true }).annotations({
      description: "The number of key pairs to return. If not provided, the page size will default to 20 entries.",
    }),
    pageToken: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Pagination token indicating which page of key pairs to return.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsList", {
    description: "Parameters for listing CSE keypairs.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsCseKeypairsList
  ): gmail_v1.Params$Resource$Users$Settings$Cse$Keypairs$List =>
    new GmailParamsResourceUsersSettingsCseKeypairsList(i);
}

export class GmailParamsResourceUsersSettingsCseKeypairsObliterate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsCseKeypairsObliterate>(
  $I`GmailParamsResourceUsersSettingsCseKeypairsObliterate`
)(
  {
    keyPairId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The identifier of the key pair to obliterate.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description:
        "The requester's primary email address. To indicate the authenticated user, you can use the special value `me`.",
    }),
    requestBody: S.optionalWith(GmailObliterateCseKeyPairRequest, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsCseKeypairsObliterate", {
    description: "Parameters for obliterating a CSE keypair.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsCseKeypairsObliterate
  ): gmail_v1.Params$Resource$Users$Settings$Cse$Keypairs$Obliterate =>
    new GmailParamsResourceUsersSettingsCseKeypairsObliterate(i);
}

// Delegates Parameters
export class GmailParamsResourceUsersSettingsDelegatesCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsDelegatesCreate>(
  $I`GmailParamsResourceUsersSettingsDelegatesCreate`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optionalWith(GmailDelegate, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsDelegatesCreate", {
    description: "Parameters for creating a delegate.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsDelegatesCreate
  ): gmail_v1.Params$Resource$Users$Settings$Delegates$Create => new GmailParamsResourceUsersSettingsDelegatesCreate(i);
}

export class GmailParamsResourceUsersSettingsDelegatesDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsDelegatesDelete>(
  $I`GmailParamsResourceUsersSettingsDelegatesDelete`
)(
  {
    delegateEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The email address of the user to be removed as a delegate.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsDelegatesDelete", {
    description: "Parameters for deleting a delegate.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsDelegatesDelete
  ): gmail_v1.Params$Resource$Users$Settings$Delegates$Delete => new GmailParamsResourceUsersSettingsDelegatesDelete(i);
}

export class GmailParamsResourceUsersSettingsDelegatesGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsDelegatesGet>(
  $I`GmailParamsResourceUsersSettingsDelegatesGet`
)(
  {
    delegateEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The email address of the user whose delegate relationship is to be retrieved.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsDelegatesGet", {
    description: "Parameters for getting a delegate.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsDelegatesGet
  ): gmail_v1.Params$Resource$Users$Settings$Delegates$Get => new GmailParamsResourceUsersSettingsDelegatesGet(i);
}

export class GmailParamsResourceUsersSettingsDelegatesList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsDelegatesList>(
  $I`GmailParamsResourceUsersSettingsDelegatesList`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsDelegatesList", {
    description: "Parameters for listing delegates.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsDelegatesList
  ): gmail_v1.Params$Resource$Users$Settings$Delegates$List => new GmailParamsResourceUsersSettingsDelegatesList(i);
}

// Filters Parameters
export class GmailParamsResourceUsersSettingsFiltersCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsFiltersCreate>(
  $I`GmailParamsResourceUsersSettingsFiltersCreate`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optionalWith(GmailFilter, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsFiltersCreate", {
    description: "Parameters for creating a filter.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsFiltersCreate
  ): gmail_v1.Params$Resource$Users$Settings$Filters$Create => new GmailParamsResourceUsersSettingsFiltersCreate(i);
}

export class GmailParamsResourceUsersSettingsFiltersDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsFiltersDelete>(
  $I`GmailParamsResourceUsersSettingsFiltersDelete`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the filter to be deleted.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsFiltersDelete", {
    description: "Parameters for deleting a filter.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsFiltersDelete
  ): gmail_v1.Params$Resource$Users$Settings$Filters$Delete => new GmailParamsResourceUsersSettingsFiltersDelete(i);
}

export class GmailParamsResourceUsersSettingsFiltersGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsFiltersGet>(
  $I`GmailParamsResourceUsersSettingsFiltersGet`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the filter to be fetched.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsFiltersGet", {
    description: "Parameters for getting a filter.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsFiltersGet
  ): gmail_v1.Params$Resource$Users$Settings$Filters$Get => new GmailParamsResourceUsersSettingsFiltersGet(i);
}

export class GmailParamsResourceUsersSettingsFiltersList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsFiltersList>(
  $I`GmailParamsResourceUsersSettingsFiltersList`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsFiltersList", {
    description: "Parameters for listing filters.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsFiltersList
  ): gmail_v1.Params$Resource$Users$Settings$Filters$List => new GmailParamsResourceUsersSettingsFiltersList(i);
}

// Forwarding Addresses Parameters
export class GmailParamsResourceUsersSettingsForwardingAddressesCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsForwardingAddressesCreate>(
  $I`GmailParamsResourceUsersSettingsForwardingAddressesCreate`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optionalWith(GmailForwardingAddress, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsForwardingAddressesCreate", {
    description: "Parameters for creating a forwarding address.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsForwardingAddressesCreate
  ): gmail_v1.Params$Resource$Users$Settings$Forwardingaddresses$Create =>
    new GmailParamsResourceUsersSettingsForwardingAddressesCreate(i);
}

export class GmailParamsResourceUsersSettingsForwardingAddressesDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsForwardingAddressesDelete>(
  $I`GmailParamsResourceUsersSettingsForwardingAddressesDelete`
)(
  {
    forwardingEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The forwarding address to be deleted.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsForwardingAddressesDelete", {
    description: "Parameters for deleting a forwarding address.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsForwardingAddressesDelete
  ): gmail_v1.Params$Resource$Users$Settings$Forwardingaddresses$Delete =>
    new GmailParamsResourceUsersSettingsForwardingAddressesDelete(i);
}

export class GmailParamsResourceUsersSettingsForwardingAddressesGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsForwardingAddressesGet>(
  $I`GmailParamsResourceUsersSettingsForwardingAddressesGet`
)(
  {
    forwardingEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The forwarding address to be retrieved.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsForwardingAddressesGet", {
    description: "Parameters for getting a forwarding address.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsForwardingAddressesGet
  ): gmail_v1.Params$Resource$Users$Settings$Forwardingaddresses$Get =>
    new GmailParamsResourceUsersSettingsForwardingAddressesGet(i);
}

export class GmailParamsResourceUsersSettingsForwardingAddressesList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsForwardingAddressesList>(
  $I`GmailParamsResourceUsersSettingsForwardingAddressesList`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsForwardingAddressesList", {
    description: "Parameters for listing forwarding addresses.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsForwardingAddressesList
  ): gmail_v1.Params$Resource$Users$Settings$Forwardingaddresses$List =>
    new GmailParamsResourceUsersSettingsForwardingAddressesList(i);
}

// SendAs Parameters
export class GmailParamsResourceUsersSettingsSendAsCreate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsCreate>(
  $I`GmailParamsResourceUsersSettingsSendAsCreate`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optionalWith(GmailSendAs, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsCreate", {
    description: "Parameters for creating a send-as alias.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsCreate
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$Create => new GmailParamsResourceUsersSettingsSendAsCreate(i);
}

export class GmailParamsResourceUsersSettingsSendAsDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsDelete>(
  $I`GmailParamsResourceUsersSettingsSendAsDelete`
)(
  {
    sendAsEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The send-as alias to be deleted.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsDelete", {
    description: "Parameters for deleting a send-as alias.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsDelete
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$Delete => new GmailParamsResourceUsersSettingsSendAsDelete(i);
}

export class GmailParamsResourceUsersSettingsSendAsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsGet>(
  $I`GmailParamsResourceUsersSettingsSendAsGet`
)(
  {
    sendAsEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The send-as alias to be retrieved.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsGet", {
    description: "Parameters for getting a send-as alias.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsGet
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$Get => new GmailParamsResourceUsersSettingsSendAsGet(i);
}

export class GmailParamsResourceUsersSettingsSendAsList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsList>(
  $I`GmailParamsResourceUsersSettingsSendAsList`
)(
  {
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsList", {
    description: "Parameters for listing send-as aliases.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsList
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$List => new GmailParamsResourceUsersSettingsSendAsList(i);
}

export class GmailParamsResourceUsersSettingsSendAsPatch extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsPatch>(
  $I`GmailParamsResourceUsersSettingsSendAsPatch`
)(
  {
    sendAsEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The send-as alias to be updated.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optionalWith(GmailSendAs, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsPatch", {
    description: "Parameters for patching a send-as alias.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsPatch
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$Patch => new GmailParamsResourceUsersSettingsSendAsPatch(i);
}

export class GmailParamsResourceUsersSettingsSendAsUpdate extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsUpdate>(
  $I`GmailParamsResourceUsersSettingsSendAsUpdate`
)(
  {
    sendAsEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The send-as alias to be updated.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
    requestBody: S.optionalWith(GmailSendAs, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsUpdate", {
    description: "Parameters for updating a send-as alias.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsUpdate
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$Update => new GmailParamsResourceUsersSettingsSendAsUpdate(i);
}

export class GmailParamsResourceUsersSettingsSendAsVerify extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsVerify>(
  $I`GmailParamsResourceUsersSettingsSendAsVerify`
)(
  {
    sendAsEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The send-as alias to be verified.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'User\'s email address. The special value "me" can be used to indicate the authenticated user.',
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsVerify", {
    description: "Parameters for verifying a send-as alias.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsVerify
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$Verify => new GmailParamsResourceUsersSettingsSendAsVerify(i);
}

// S/MIME Info Parameters
export class GmailParamsResourceUsersSettingsSendAsSmimeInfoDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsSmimeInfoDelete>(
  $I`GmailParamsResourceUsersSettingsSendAsSmimeInfoDelete`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The immutable ID for the SmimeInfo.",
    }),
    sendAsEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'The email address that appears in the "From:" header for mail sent using this alias.',
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsSmimeInfoDelete", {
    description: "Parameters for deleting S/MIME info.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsSmimeInfoDelete
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$Smimeinfo$Delete =>
    new GmailParamsResourceUsersSettingsSendAsSmimeInfoDelete(i);
}

export class GmailParamsResourceUsersSettingsSendAsSmimeInfoGet extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsSmimeInfoGet>(
  $I`GmailParamsResourceUsersSettingsSendAsSmimeInfoGet`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The immutable ID for the SmimeInfo.",
    }),
    sendAsEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'The email address that appears in the "From:" header for mail sent using this alias.',
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsSmimeInfoGet", {
    description: "Parameters for getting S/MIME info.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsSmimeInfoGet
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$Smimeinfo$Get =>
    new GmailParamsResourceUsersSettingsSendAsSmimeInfoGet(i);
}

export class GmailParamsResourceUsersSettingsSendAsSmimeInfoInsert extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsSmimeInfoInsert>(
  $I`GmailParamsResourceUsersSettingsSendAsSmimeInfoInsert`
)(
  {
    sendAsEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'The email address that appears in the "From:" header for mail sent using this alias.',
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailSmimeInfo, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsSmimeInfoInsert", {
    description: "Parameters for inserting S/MIME info.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsSmimeInfoInsert
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$Smimeinfo$Insert =>
    new GmailParamsResourceUsersSettingsSendAsSmimeInfoInsert(i);
}

export class GmailParamsResourceUsersSettingsSendAsSmimeInfoList extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsSmimeInfoList>(
  $I`GmailParamsResourceUsersSettingsSendAsSmimeInfoList`
)(
  {
    sendAsEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'The email address that appears in the "From:" header for mail sent using this alias.',
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsSmimeInfoList", {
    description: "Parameters for listing S/MIME info.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsSmimeInfoList
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$Smimeinfo$List =>
    new GmailParamsResourceUsersSettingsSendAsSmimeInfoList(i);
}

export class GmailParamsResourceUsersSettingsSendAsSmimeInfoSetDefault extends GmailStandardParameters.extend<GmailParamsResourceUsersSettingsSendAsSmimeInfoSetDefault>(
  $I`GmailParamsResourceUsersSettingsSendAsSmimeInfoSetDefault`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The immutable ID for the SmimeInfo.",
    }),
    sendAsEmail: S.optionalWith(S.String, { exact: true }).annotations({
      description: 'The email address that appears in the "From:" header for mail sent using this alias.',
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersSettingsSendAsSmimeInfoSetDefault", {
    description: "Parameters for setting default S/MIME info.",
  })
) {
  static readonly new = (
    i: GmailParamsResourceUsersSettingsSendAsSmimeInfoSetDefault
  ): gmail_v1.Params$Resource$Users$Settings$Sendas$Smimeinfo$Setdefault =>
    new GmailParamsResourceUsersSettingsSendAsSmimeInfoSetDefault(i);
}

// Thread Parameters
export class GmailParamsResourceUsersThreadsDelete extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsDelete>(
  $I`GmailParamsResourceUsersThreadsDelete`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "ID of the Thread to delete.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsDelete", {
    description: "Parameters for deleting a thread.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersThreadsDelete): gmail_v1.Params$Resource$Users$Threads$Delete =>
    new GmailParamsResourceUsersThreadsDelete(i);
}

export class GmailParamsResourceUsersThreadsGet extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsGet>(
  $I`GmailParamsResourceUsersThreadsGet`
)(
  {
    format: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The format to return the messages in.",
    }),
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the thread to retrieve.",
    }),
    metadataHeaders: S.optionalWith(S.mutable(S.Array(S.String)), { exact: true }).annotations({
      description: "When given and format is METADATA, only include headers specified.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsGet", {
    description: "Parameters for getting a thread.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersThreadsGet): gmail_v1.Params$Resource$Users$Threads$Get =>
    new GmailParamsResourceUsersThreadsGet(i);
}

export class GmailParamsResourceUsersThreadsList extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsList>(
  $I`GmailParamsResourceUsersThreadsList`
)(
  {
    includeSpamTrash: S.optionalWith(S.Boolean, { exact: true }).annotations({
      description: "Include threads from `SPAM` and `TRASH` in the results.",
    }),
    labelIds: S.optionalWith(S.mutable(S.Array(S.String)), { exact: true }).annotations({
      description: "Only return threads with labels that match all of the specified label IDs.",
    }),
    maxResults: S.optionalWith(S.Number, { exact: true }).annotations({
      description:
        "Maximum number of threads to return. This field defaults to 100. The maximum allowed value for this field is 500.",
    }),
    pageToken: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Page token to retrieve a specific page of results in the list.",
    }),
    q: S.optionalWith(S.String, { exact: true }).annotations({
      description: "Only return threads matching the specified query.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsList", {
    description: "Parameters for listing threads.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersThreadsList): gmail_v1.Params$Resource$Users$Threads$List =>
    new GmailParamsResourceUsersThreadsList(i);
}

export class GmailParamsResourceUsersThreadsModify extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsModify>(
  $I`GmailParamsResourceUsersThreadsModify`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the thread to modify.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
    requestBody: S.optionalWith(GmailModifyThreadRequest, { exact: true }).annotations({
      description: "Request body metadata",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsModify", {
    description: "Parameters for modifying a thread.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersThreadsModify): gmail_v1.Params$Resource$Users$Threads$Modify =>
    new GmailParamsResourceUsersThreadsModify(i);
}

export class GmailParamsResourceUsersThreadsTrash extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsTrash>(
  $I`GmailParamsResourceUsersThreadsTrash`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the thread to Trash.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsTrash", {
    description: "Parameters for trashing a thread.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersThreadsTrash): gmail_v1.Params$Resource$Users$Threads$Trash =>
    new GmailParamsResourceUsersThreadsTrash(i);
}

export class GmailParamsResourceUsersThreadsUntrash extends GmailStandardParameters.extend<GmailParamsResourceUsersThreadsUntrash>(
  $I`GmailParamsResourceUsersThreadsUntrash`
)(
  {
    id: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The ID of the thread to remove from Trash.",
    }),
    userId: S.optionalWith(S.String, { exact: true }).annotations({
      description: "The user's email address. The special value `me` can be used to indicate the authenticated user.",
    }),
  },
  $I.annotations("GmailParamsResourceUsersThreadsUntrash", {
    description: "Parameters for untrashing a thread.",
  })
) {
  static readonly new = (i: GmailParamsResourceUsersThreadsUntrash): gmail_v1.Params$Resource$Users$Threads$Untrash =>
    new GmailParamsResourceUsersThreadsUntrash(i);
}
