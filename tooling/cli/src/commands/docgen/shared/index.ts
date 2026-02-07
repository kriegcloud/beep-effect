/**
 * @file Shared Utilities Index
 *
 * Re-exports all shared utilities for the docgen CLI commands.
 * Import from this module for access to all shared functionality.
 *
 * Modules:
 * - config: docgen.json loading and validation
 * - discovery: Package discovery and resolution
 * - ast: TypeScript AST analysis with ts-morph
 * - markdown: Markdown report generation
 * - output: CLI output formatting with colors
 *
 * @module docgen/shared
 * @since 0.1.0
 */

/**
 * Re-exports TypeScript AST analysis utilities using ts-morph.
 *
 * @example
 * ```ts
 * import { createProject, analyzePackage } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const project = yield* createProject({ tsConfigFilePath: "tsconfig.json" })
 *   const analysis = yield* analyzePackage(project, "packages/common/schema", "src")
 *   return analysis
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./ast.js";

/**
 * Re-exports configuration loading and validation utilities.
 *
 * @example
 * ```ts
 * import { loadDocgenConfig, hasDocgenConfig } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const hasConfig = yield* hasDocgenConfig("packages/common/schema")
 *   if (hasConfig) {
 *     const config = yield* loadDocgenConfig("packages/common/schema")
 *     return config
 *   }
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./config.js";

/**
 * Re-exports package discovery and resolution utilities.
 *
 * @example
 * ```ts
 * import { discoverConfiguredPackages, resolvePackagePath } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const packages = yield* discoverConfiguredPackages
 *   const pkg = yield* resolvePackagePath("packages/common/schema")
 *   return { packages, pkg }
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./discovery.js";

/**
 * Re-exports markdown report generation utilities.
 *
 * @example
 * ```ts
 * import { generateAnalysisReport } from "@beep/repo-cli/commands/docgen/shared"
 * import * as F from "effect/Function"
 *
 * const analysis = {
 *   packageName: "@beep/schema",
 *   packagePath: "packages/common/schema",
 *   timestamp: "2025-12-06T12:00:00.000Z",
 *   exports: [],
 *   summary: {
 *     totalExports: 0,
 *     fullyDocumented: 0,
 *     missingDocumentation: 0,
 *     missingCategory: 0,
 *     missingExample: 0,
 *     missingSince: 0
 *   }
 * }
 * const report = generateAnalysisReport(analysis)
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./markdown.js";

/**
 * Re-exports CLI output formatting utilities with ANSI colors.
 *
 * @example
 * ```ts
 * import { success, error, info, formatPath } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   yield* success("Operation completed")
 *   yield* error("Something went wrong")
 *   yield* info(formatPath("packages/common/schema"))
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./output.js";
