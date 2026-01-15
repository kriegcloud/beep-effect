/**
 * Common repository dependencies for Calendar slice
 *
 * Shared dependencies injected into all repositories in this slice.
 *
 * @module calendar-server/db/repos/_common
 * @since 0.1.0
 */
import { CalendarDb } from "@beep/calendar-server/db";

/**
 * Common dependencies for all calendar repositories.
 *
 * All repos in this slice should use these dependencies
 * to ensure consistent database access.
 */
export const dependencies = [CalendarDb.layer] as const;
