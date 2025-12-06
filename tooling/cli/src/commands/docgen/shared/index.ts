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
 */

export * from "./ast.js";
export * from "./config.js";
export * from "./discovery.js";
export * from "./markdown.js";
export * from "./output.js";
