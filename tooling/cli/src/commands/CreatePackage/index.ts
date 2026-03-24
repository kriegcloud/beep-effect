/**
 * Package creation command - scaffold new packages following Effect v4 conventions.
 *
 * @module
 * @since 0.0.0
 */

import { createPackageCommand as createPackageCommandFromHandler } from "./Handler.js";

/**
 * Package creation command.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const createPackageCommand = createPackageCommandFromHandler;
