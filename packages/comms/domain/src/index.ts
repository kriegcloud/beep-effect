/**
 * @beep/comms-domain
 * Communications module - Domain entities and value objects
 *
 * This module contains:
 * - Entity models
 * - Value objects
 * - Error types
 * - Business rules (NO side effects)
 *
 * @module comms-domain
 * @since 0.1.0
 */
export * as Entities from "./entities";
export * as Errors from "./errors";
export * as LoggingValues from "./value-objects/logging.value";
export * as MailValues from "./value-objects/mail.value";
