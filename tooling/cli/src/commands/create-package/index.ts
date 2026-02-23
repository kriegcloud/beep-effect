/**
 * Package creation command - scaffold new packages following Effect v4 conventions.
 *
 * @since 0.0.0
 * @module
 */

import { createPackageCommand as createPackageCommandFromHandler } from "./handler.js";

/**
 * Package creation command.
 *
 * @since 0.0.0
 * @category commands
 */
export const createPackageCommand = createPackageCommandFromHandler;
