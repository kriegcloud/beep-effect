/**
 * @beep/repo-configs
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  DocsESLintConfig as DocsESLintConfigInternal,
  type DocsESLintConfigShape as DocsESLintConfigShapeInternal,
} from "./eslint/DocsESLintConfig.ts";

/**
 * Package version for `@beep/repo-configs`.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Flat docs-only ESLint config array shape exported by this package.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type DocsESLintConfigShape = DocsESLintConfigShapeInternal;

/**
 * Shared docs-only repository ESLint flat config.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const DocsESLintConfig = DocsESLintConfigInternal;
