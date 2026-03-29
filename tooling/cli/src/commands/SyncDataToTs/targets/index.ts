/**
 * Checked-in sync target registry.
 *
 * @module
 * @since 0.0.0
 */

import { iso4217Target } from "./Iso4217.js";

/**
 * All checked-in sync targets supported by sync-data-to-ts.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const syncDataTargets = [iso4217Target] as const;
