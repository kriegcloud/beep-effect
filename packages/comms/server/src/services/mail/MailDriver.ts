/**
 * MailDriver Interface
 *
 * Unified email driver abstraction for Google and Microsoft email providers.
 * Implementations (GmailDriverAdapter, OutlookDriver) provide provider-specific
 * logic while conforming to this common interface.
 *
 * @module comms-server/services/mail/MailDriver
 * @since 0.1.0
 */
import { Errors, MailValues } from "@beep/comms-domain";
import { $CommsServerId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

import type {
  CreateLabelParams,
  DraftData,
  DraftsResponse,
  DriverLabel,
  ListDraftsParams,
  ListThreadsParams,
  ModifyLabelsParams,
  SendMailParams,
  SendResult,
  ThreadResponse,
  ThreadsResponse,
} from "./types";

const $I = $CommsServerId.create("services/mail/MailDriver");

// ---------------------------------------------------------------------------
// Interface Definition
// ---------------------------------------------------------------------------

/**
 * Unified mail driver interface for email operations.
 *
 * This interface defines the contract that all email provider implementations
 * (Gmail, Outlook) must satisfy. It provides a consistent API for:
 * - Thread operations (list, get)
 * - Message operations (send, get attachment)
 * - Draft operations (create, get, list, delete, send)
 * - Label operations (list, create, delete, modify)
 * - Read/unread status management
 *
 * @since 0.1.0
 * @category interface
 */
export interface MailDriver {
  /**
   * The email provider this driver connects to
   */
  readonly provider: MailValues.EmailProvider.Type;

  // -------------------------------------------------------------------------
  // Thread Operations
  // -------------------------------------------------------------------------

  /**
   * List email threads with optional filtering
   *
   * @param params - Parameters for filtering and pagination
   * @returns Effect yielding threads response or provider error
   */
  readonly listThreads: (
    params: ListThreadsParams
  ) => Effect.Effect<ThreadsResponse, Errors.ProviderApiError>;

  /**
   * Get a single thread by ID with all messages
   *
   * @param id - Thread identifier
   * @returns Effect yielding full thread or not found/provider error
   */
  readonly getThread: (
    id: string
  ) => Effect.Effect<ThreadResponse, Errors.ThreadNotFoundError | Errors.ProviderApiError>;

  // -------------------------------------------------------------------------
  // Message Operations
  // -------------------------------------------------------------------------

  /**
   * Send a new email
   *
   * @param data - Email composition data
   * @returns Effect yielding send result or provider error
   */
  readonly sendMail: (
    data: SendMailParams
  ) => Effect.Effect<SendResult, Errors.ProviderApiError>;

  /**
   * Get an attachment from a message
   *
   * @param messageId - Message identifier
   * @param attachmentId - Attachment identifier
   * @returns Effect yielding attachment data (base64) or None if not found
   */
  readonly getAttachment: (
    messageId: string,
    attachmentId: string
  ) => Effect.Effect<O.Option<string>, Errors.ProviderApiError>;

  // -------------------------------------------------------------------------
  // Draft Operations
  // -------------------------------------------------------------------------

  /**
   * Create a new draft
   *
   * @param data - Draft composition data
   * @returns Effect yielding draft ID or provider error
   */
  readonly createDraft: (
    data: DraftData
  ) => Effect.Effect<{ readonly id: string }, Errors.ProviderApiError>;

  /**
   * Get a draft by ID
   *
   * @param id - Draft identifier
   * @returns Effect yielding draft data or not found/provider error
   */
  readonly getDraft: (
    id: string
  ) => Effect.Effect<
    DraftData & { readonly id: string },
    Errors.DraftNotFoundError | Errors.ProviderApiError
  >;

  /**
   * List drafts with optional filtering
   *
   * @param params - Parameters for filtering and pagination
   * @returns Effect yielding drafts response or provider error
   */
  readonly listDrafts: (
    params: ListDraftsParams
  ) => Effect.Effect<DraftsResponse, Errors.ProviderApiError>;

  /**
   * Delete a draft
   *
   * @param id - Draft identifier
   * @returns Effect yielding void or provider error
   */
  readonly deleteDraft: (id: string) => Effect.Effect<void, Errors.ProviderApiError>;

  /**
   * Send an existing draft
   *
   * @param id - Draft identifier
   * @returns Effect yielding send result or provider error
   */
  readonly sendDraft: (id: string) => Effect.Effect<SendResult, Errors.ProviderApiError>;

  // -------------------------------------------------------------------------
  // Label Operations
  // -------------------------------------------------------------------------

  /**
   * Get all user labels
   *
   * @returns Effect yielding array of labels or provider error
   */
  readonly getUserLabels: () => Effect.Effect<
    ReadonlyArray<DriverLabel>,
    Errors.ProviderApiError
  >;

  /**
   * Create a new label
   *
   * @param params - Label creation parameters
   * @returns Effect yielding created label or provider error
   */
  readonly createLabel: (
    params: CreateLabelParams.Type
  ) => Effect.Effect<DriverLabel.Type, Errors.ProviderApiError>;

  /**
   * Delete a label
   *
   * @param id - Label identifier
   * @returns Effect yielding void or provider error
   */
  readonly deleteLabel: (id: string) => Effect.Effect<void, Errors.ProviderApiError>;

  /**
   * Modify labels on one or more messages
   *
   * @param messageIds - Array of message identifiers
   * @param options - Labels to add and/or remove
   * @returns Effect yielding void or provider error
   */
  readonly modifyLabels: (
    messageIds: ReadonlyArray<string>,
    options: ModifyLabelsParams.Type
  ) => Effect.Effect<void, Errors.ProviderApiError>;

  // -------------------------------------------------------------------------
  // Read/Unread Operations
  // -------------------------------------------------------------------------

  /**
   * Mark messages as read
   *
   * @param messageIds - Array of message identifiers
   * @returns Effect yielding void or provider error
   */
  readonly markAsRead: (
    messageIds: ReadonlyArray<string>
  ) => Effect.Effect<void, Errors.ProviderApiError>;

  /**
   * Mark messages as unread
   *
   * @param messageIds - Array of message identifiers
   * @returns Effect yielding void or provider error
   */
  readonly markAsUnread: (
    messageIds: ReadonlyArray<string>
  ) => Effect.Effect<void, Errors.ProviderApiError>;
}

// ---------------------------------------------------------------------------
// Context Tag
// ---------------------------------------------------------------------------

/**
 * Context tag for the MailDriver service.
 *
 * This enables dependency injection of email driver implementations.
 * Use `Layer.succeed(MailDriver, implementation)` to provide a concrete driver.
 *
 * @since 0.1.0
 * @category context
 *
 * @example
 * ```typescript
 * import { MailDriver } from "@beep/comms-server/services/mail";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const driver = yield* MailDriver;
 *   const threads = yield* driver.listThreads({ maxResults: O.some(10) });
 *   return threads;
 * });
 * ```
 */
export class MailDriver extends Context.Tag($I`MailDriver`)<MailDriver, MailDriver>() {}

// ---------------------------------------------------------------------------
// Type Exports
// ---------------------------------------------------------------------------

export declare namespace MailDriver {
  export type Shape = MailDriver;
}
