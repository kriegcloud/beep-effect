/**
 * \@beep/repo-configs
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
 * @example
 * ```ts
 * import { VERSION } from "@beep/repo-configs"
 *
 * void VERSION
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Flat docs-only ESLint config array shape exported by this package.
 *
 * @example
 * ```ts
 * import type { DocsESLintConfigShape } from "@beep/repo-configs"
 *
 * const config = [] satisfies DocsESLintConfigShape
 * void config
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export type DocsESLintConfigShape = DocsESLintConfigShapeInternal;

/**
 * Shared docs-only repository ESLint flat config.
 *
 * @example
 * ```ts
 * import { DocsESLintConfig } from "@beep/repo-configs"
 *
 * void DocsESLintConfig
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const DocsESLintConfig = DocsESLintConfigInternal;
