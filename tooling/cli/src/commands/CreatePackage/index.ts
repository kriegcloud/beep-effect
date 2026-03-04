/**
 * Package creation command - scaffold new packages following Effect v4 conventions.
 *
 * @since 0.0.0
 * @module
 */

import { createPackageCommand as createPackageCommandFromHandler } from "./Handler.js";

/**
 * Package creation command.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const createPackageCommand = createPackageCommandFromHandler;
