/**
 * \@beep/repo-configs
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { DeprecatedApisESLintConfig as DeprecatedApisESLintConfigInternal } from "./eslint/DeprecatedApisESLintConfig.ts";
import { DocsESLintConfig as DocsESLintConfigInternal } from "./eslint/DocsESLintConfig.ts";
import type { DeprecatedApisESLintConfigShape as DeprecatedApisESLintConfigShapeInternal } from "./eslint/DeprecatedApisESLintConfig.ts";
import type { DocsESLintConfigShape as DocsESLintConfigShapeInternal } from "./eslint/DocsESLintConfig.ts";

/**
 * Flat docs-only ESLint config array shape exported by this package.
 *
 * @example
 * ```ts
 * import type { DocsESLintConfigShape } from "@beep/repo-configs"
 * const config = [] satisfies DocsESLintConfigShape
 * console.log(config)
 * ```
 * @category configuration
 * @since 0.0.0
 */
export type DocsESLintConfigShape = DocsESLintConfigShapeInternal;

/**
 * Flat deprecated API ESLint config array shape exported by this package.
 *
 * @example
 * ```ts
 * import type { DeprecatedApisESLintConfigShape } from "@beep/repo-configs"
 * const config = [] satisfies DeprecatedApisESLintConfigShape
 * console.log(config)
 * ```
 * @category configuration
 * @since 0.0.0
 */
export type DeprecatedApisESLintConfigShape = DeprecatedApisESLintConfigShapeInternal;

/**
 * Shared docs-only repository ESLint flat config.
 *
 * @example
 * ```ts
 * import { DocsESLintConfig } from "@beep/repo-configs"
 * console.log(DocsESLintConfig)
 * ```
 * @category configuration
 * @since 0.0.0
 */
export const DocsESLintConfig = DocsESLintConfigInternal;

/**
 * Shared deprecated API ESLint flat config.
 *
 * @example
 * ```ts
 * import { DeprecatedApisESLintConfig } from "@beep/repo-configs"
 * console.log(DeprecatedApisESLintConfig)
 * ```
 * @category configuration
 * @since 0.0.0
 */
export const DeprecatedApisESLintConfig = DeprecatedApisESLintConfigInternal;
