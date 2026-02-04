/**
 * Adapters for external service integration with knowledge extraction
 *
 * @module knowledge-server/adapters
 * @since 0.1.0
 */

export {
  type EmailMetadata,
  type ExtractedEmailDocument,
  GmailExtractionAdapter,
  GmailExtractionAdapterLive,
  REQUIRED_SCOPES as GMAIL_EXTRACTION_REQUIRED_SCOPES,
  type ThreadContext,
} from "./GmailExtractionAdapter";
