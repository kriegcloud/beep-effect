/**
 * Mail errors for Communications slice
 *
 * Typed errors for email operations including connections, providers,
 * threads, drafts, labels, sending, and AI processing.
 *
 * @module comms-domain/errors/mail
 * @since 0.1.0
 */
import { $CommsDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("errors/mail");

/**
 * Base error for all mail operations
 *
 * @since 0.1.0
 * @category errors
 */
export class MailError extends S.TaggedError<MailError>($I`MailError`)(
  "MailError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("MailError", {
    description: "Base error for mail operations",
  })
) {}

/**
 * Email connection not found
 *
 * @since 0.1.0
 * @category errors
 */
export class ConnectionNotFoundError extends S.TaggedError<ConnectionNotFoundError>($I`ConnectionNotFoundError`)(
  "ConnectionNotFoundError",
  {
    connectionId: S.String,
  },
  $I.annotations("ConnectionNotFoundError", {
    description: "Email connection not found",
  })
) {}

/**
 * OAuth tokens expired for email connection
 *
 * @since 0.1.0
 * @category errors
 */
export class ConnectionExpiredError extends S.TaggedError<ConnectionExpiredError>($I`ConnectionExpiredError`)(
  "ConnectionExpiredError",
  {
    connectionId: S.String,
    provider: S.String,
  },
  $I.annotations("ConnectionExpiredError", {
    description: "OAuth tokens expired for email connection",
  })
) {}

/**
 * Gmail/Outlook API error
 *
 * @since 0.1.0
 * @category errors
 */
export class ProviderApiError extends S.TaggedError<ProviderApiError>($I`ProviderApiError`)(
  "ProviderApiError",
  {
    provider: S.String,
    statusCode: S.optional(S.Number),
    message: S.String,
  },
  $I.annotations("ProviderApiError", {
    description: "Email provider API error (Gmail/Outlook)",
  })
) {}

/**
 * Email thread not found
 *
 * @since 0.1.0
 * @category errors
 */
export class ThreadNotFoundError extends S.TaggedError<ThreadNotFoundError>($I`ThreadNotFoundError`)(
  "ThreadNotFoundError",
  {
    threadId: S.String,
  },
  $I.annotations("ThreadNotFoundError", {
    description: "Email thread not found",
  })
) {}

/**
 * Email draft not found
 *
 * @since 0.1.0
 * @category errors
 */
export class DraftNotFoundError extends S.TaggedError<DraftNotFoundError>($I`DraftNotFoundError`)(
  "DraftNotFoundError",
  {
    draftId: S.String,
  },
  $I.annotations("DraftNotFoundError", {
    description: "Email draft not found",
  })
) {}

/**
 * Label operation failed (create/update/delete)
 *
 * @since 0.1.0
 * @category errors
 */
export class LabelOperationError extends S.TaggedError<LabelOperationError>($I`LabelOperationError`)(
  "LabelOperationError",
  {
    labelId: S.optional(S.String),
    operation: S.String,
    message: S.String,
  },
  $I.annotations("LabelOperationError", {
    description: "Label operation failed (create/update/delete)",
  })
) {}

/**
 * Email send operation failed
 *
 * @since 0.1.0
 * @category errors
 */
export class SendEmailError extends S.TaggedError<SendEmailError>($I`SendEmailError`)(
  "SendEmailError",
  {
    recipient: S.optional(S.String),
    message: S.String,
  },
  $I.annotations("SendEmailError", {
    description: "Email send operation failed",
  })
) {}

/**
 * AI service error during summarization or processing
 *
 * @since 0.1.0
 * @category errors
 */
export class AiServiceError extends S.TaggedError<AiServiceError>($I`AiServiceError`)(
  "AiServiceError",
  {
    operation: S.String,
    message: S.String,
  },
  $I.annotations("AiServiceError", {
    description: "AI service error during summarization or processing",
  })
) {}

/**
 * Union of all mail error types
 *
 * @since 0.1.0
 * @category errors
 */
export const MailErrors = S.Union(
  MailError,
  ConnectionNotFoundError,
  ConnectionExpiredError,
  ProviderApiError,
  ThreadNotFoundError,
  DraftNotFoundError,
  LabelOperationError,
  SendEmailError,
  AiServiceError
).annotations(
  $I.annotations("MailErrors", {
    description: "Union of all mail error types",
  })
);

export declare namespace MailErrors {
  export type Type = typeof MailErrors.Type;
  export type Encoded = typeof MailErrors.Encoded;
}
