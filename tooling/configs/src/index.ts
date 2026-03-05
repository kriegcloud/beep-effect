/**
 * @beep/repo-configs
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import {
  ESLintConfig as ESLintConfigInternal,
  type ESLintConfigShape as ESLintConfigShapeInternal,
} from "./eslint/ESLintConfig.ts";

/**
 * Package version for `@beep/repo-configs`.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * Flat ESLint config array shape exported by this package.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type ESLintConfigShape = ESLintConfigShapeInternal;

/**
 * Shared repository ESLint flat config.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const ESLintConfig = ESLintConfigInternal;
