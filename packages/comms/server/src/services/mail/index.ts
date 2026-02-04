/**
 * Mail Driver Module
 *
 * Unified email driver abstraction for Google and Microsoft email providers.
 *
 * @module comms-server/services/mail
 * @since 0.1.0
 */

// ---------------------------------------------------------------------------
// Interface & Context Tag
// ---------------------------------------------------------------------------

export { MailDriver } from "./MailDriver";

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

export {
  // Thread types
  ThreadSummary,
  ThreadsResponse,
  ThreadLabel,
  ThreadResponse,
  DriverParsedMessage,
  // Draft types
  Recipient,
  DraftData,
  DraftSummary,
  DraftsResponse,
  // Send types
  SendResult,
  // Label types
  DriverLabel,
  DriverLabelColor,
  LabelType,
  // Input types
  ListThreadsParams,
  SendMailParams,
  ListDraftsParams,
  CreateLabelParams,
  ModifyLabelsParams,
} from "./types";
