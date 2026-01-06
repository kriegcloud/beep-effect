/**
 * Common repository dependencies for Comms slice
 *
 * Shared dependencies injected into all repositories in this slice.
 *
 * @module comms-server/db/repos/_common
 * @since 0.1.0
 */
import { CommsDb } from "@beep/comms-server/db";

/**
 * Common dependencies for all comms repositories.
 *
 * All repos in this slice should use these dependencies
 * to ensure consistent database access.
 */
export const dependencies = [CommsDb.layer] as const;
