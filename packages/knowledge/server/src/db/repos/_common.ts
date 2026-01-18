/**
 * Common repository dependencies for Knowledge slice
 *
 * Shared dependencies injected into all repositories in this slice.
 *
 * @module knowledge-server/db/repos/_common
 * @since 0.1.0
 */
import { KnowledgeDb } from "@beep/knowledge-server/db";

/**
 * Common dependencies for all knowledge repositories.
 *
 * All repos in this slice should use these dependencies
 * to ensure consistent database access.
 */
export const dependencies = [KnowledgeDb.layer] as const;
