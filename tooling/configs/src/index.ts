/**
 * @beep/repo-configs
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  ESLintConfig as ESLintConfigInternal,
  type ESLintConfigShape as ESLintConfigShapeInternal,
} from "./eslint/ESLintConfig.ts";

/**
 * Package version for `@beep/repo-configs`.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Flat ESLint config array shape exported by this package.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ESLintConfigShape = ESLintConfigShapeInternal;

/**
 * Shared repository ESLint flat config.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ESLintConfig = ESLintConfigInternal;
