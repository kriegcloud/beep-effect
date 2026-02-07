/**
 * @file sync-cursor-rules CLI Command
 *
 * Transforms .claude/rules/*.md files to .cursor/rules/*.mdc format
 * with proper frontmatter for Cursor IDE compatibility.
 *
 * Transformations:
 * - File extension: .md -> .mdc
 * - Add required description: field
 * - Add alwaysApply: field (true for always-loaded, false for scoped)
 * - Transform paths: -> globs: (field rename)
 *
 * @module sync-cursor-rules
 * @since 0.1.0
 */

import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils";
import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import { FileSystem, Path } from "@effect/platform";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Str from "effect/String";
import color from "picocolors";

// =============================================================================
// Configuration
// =============================================================================

const RULES_RELATIVE_DIR = [".claude", "rules"] as const;
const OUTPUT_RELATIVE_DIR = [".cursor", "rules"] as const;

// =============================================================================
// Pure Helper Functions
// =============================================================================

/**
 * Generate a description from filename.
 * Uses native string methods for simple transformations.
 */
const generateDescription = (filename: string): string => {
  const name = filename.replace(".md", "");
  const firstChar = name.charAt(0);
  const rest = name.slice(1);
  return `${firstChar.toUpperCase()}${rest} rules`;
};

/**
 * Transform frontmatter paths: to globs:
 * Handles both YAML array format and single-line format.
 */
const transformPathsToGlobs = (content: string): string => content.replace(/paths:/g, "globs:");

/**
 * Extract frontmatter section from content.
 * Returns [frontmatter, body] or [null, content] if no frontmatter.
 */
const extractFrontmatter = (content: string): readonly [string | null, string] => {
  if (!content.startsWith("---")) {
    return [null, content];
  }

  const firstDelimiter = content.indexOf("---");
  const afterFirst = content.slice(firstDelimiter + 3);
  const secondDelimiter = afterFirst.indexOf("---");

  if (secondDelimiter === -1) {
    return [null, content];
  }

  const frontmatter = content.slice(3, firstDelimiter + 3 + secondDelimiter);
  const bodySlice = content.slice(firstDelimiter + 3 + secondDelimiter + 3);
  const body = bodySlice.startsWith("\n") ? bodySlice.slice(1) : bodySlice;

  return [frontmatter, body];
};

/**
 * Check if frontmatter contains a field.
 */
const hasField = (frontmatter: string, field: string): boolean => frontmatter.includes(`${field}:`);

/**
 * Add field to frontmatter if missing.
 */
const addFieldToFrontmatter = (frontmatter: string, field: string, value: string): string => {
  if (hasField(frontmatter, field)) {
    return frontmatter;
  }

  if (frontmatter.length === 0) {
    return `${field}: ${value}\n`;
  }

  return `${field}: ${value}\n${frontmatter}`;
};

// =============================================================================
// Handler
// =============================================================================

const handleSyncCursorRules = (options: { readonly dryRun: boolean; readonly verbose: boolean }) =>
  Effect.gen(function* () {
    const repoUtils = yield* RepoUtils;
    const fs = yield* FileSystem.FileSystem;
    const pathService = yield* Path.Path;

    const rulesDir = F.pipe(
      RULES_RELATIVE_DIR,
      A.reduce(repoUtils.REPOSITORY_ROOT, (acc, segment) => pathService.join(acc, segment))
    );
    const outputDir = F.pipe(
      OUTPUT_RELATIVE_DIR,
      A.reduce(repoUtils.REPOSITORY_ROOT, (acc, segment) => pathService.join(acc, segment))
    );

    yield* Console.log(color.cyan("Syncing Cursor rules from Claude rules..."));

    if (options.verbose) {
      yield* Console.log(`  Source: ${rulesDir}`);
      yield* Console.log(`  Target: ${outputDir}`);
    }

    const files = yield* fs.readDirectory(rulesDir);
    const mdFiles = A.filter(files, Str.endsWith(".md"));

    if (A.isEmptyReadonlyArray(mdFiles)) {
      yield* Console.log(color.yellow("No .md files found in .claude/rules/"));
      return;
    }

    yield* Console.log(`Found ${A.length(mdFiles)} rule file(s) to transform\n`);

    // Ensure output directory exists before writing (only in non-dry-run mode)
    if (!options.dryRun) {
      yield* fs.makeDirectory(outputDir, { recursive: true });
    }

    // Transform each file
    yield* Effect.forEach(
      mdFiles,
      (filename) =>
        Effect.gen(function* () {
          const sourcePath = pathService.join(rulesDir, filename);
          const targetFilename = F.pipe(filename, Str.replace(".md", ".mdc"));
          const targetPath = pathService.join(outputDir, targetFilename);

          const content = yield* fs.readFileString(sourcePath);

          // Extract frontmatter and body
          const [existingFrontmatter, body] = extractFrontmatter(content);

          let newFrontmatter: string;
          const transformedBody = body;

          if (existingFrontmatter !== null) {
            // Transform existing frontmatter
            let transformed = transformPathsToGlobs(existingFrontmatter);

            // Add description if missing
            if (!hasField(transformed, "description")) {
              const description = generateDescription(filename);
              transformed = addFieldToFrontmatter(transformed, "description", `"${description}"`);
            }

            // Add alwaysApply if missing
            if (!hasField(transformed, "alwaysApply")) {
              const hasGlobs = hasField(transformed, "globs");
              const alwaysApply = !hasGlobs;
              transformed = addFieldToFrontmatter(transformed, "alwaysApply", String(alwaysApply));
            }

            newFrontmatter = transformed;
          } else {
            // Create new frontmatter
            const description = generateDescription(filename);
            newFrontmatter = `description: "${description}"\nalwaysApply: true\n`;
          }

          // Combine frontmatter and body
          const transformedContent = `---\n${newFrontmatter}---\n\n${transformedBody}`;

          if (options.dryRun) {
            yield* Console.log(color.yellow(`[dry-run] Would create ${targetFilename}`));
            if (options.verbose) {
              yield* Console.log(`  Source: ${sourcePath}`);
              yield* Console.log(`  Target: ${targetPath}`);
              yield* Console.log(`  Frontmatter: ${existingFrontmatter !== null ? "transformed" : "generated"}`);
            }
          } else {
            yield* fs.writeFileString(targetPath, transformedContent);
            yield* Console.log(color.green(`Created ${targetFilename}`));
            if (options.verbose) {
              yield* Console.log(`  Source: ${sourcePath}`);
              yield* Console.log(`  Target: ${targetPath}`);
              yield* Console.log(`  Frontmatter: ${existingFrontmatter !== null ? "transformed" : "generated"}`);
            }
          }
        }),
      { discard: true }
    );

    const action = options.dryRun ? "Would transform" : "Successfully transformed";
    yield* Console.log(color.green(`\n${action} ${A.length(mdFiles)} rule file(s)`));
    yield* Console.log(`Output directory: ${outputDir}/`);
  }).pipe(Effect.withSpan("syncCursorRulesHandler"));

// =============================================================================
// Options
// =============================================================================

/**
 * Dry-run mode option.
 * When enabled, previews changes without writing files.
 */
const dryRunOption = Options.boolean("dry-run").pipe(
  Options.withDefault(false),
  Options.withDescription("Preview changes without writing files")
);

/**
 * Verbose mode option.
 * When enabled, shows detailed transformation output.
 */
const verboseOption = Options.boolean("verbose").pipe(
  Options.withAlias("v"),
  Options.withDefault(false),
  Options.withDescription("Show detailed transformation output")
);

// =============================================================================
// Service Layer
// =============================================================================

/**
 * Combined layer providing all services needed for sync-cursor-rules.
 * RepoUtilsLive already includes BunFileSystem and BunPath internally.
 */
const SyncCursorRulesServiceLayer = Layer.mergeAll(RepoUtilsLive, BunFileSystem.layer);

// =============================================================================
// Command
// =============================================================================

/**
 * sync-cursor-rules command definition.
 *
 * Transforms .claude/rules/*.md files to .cursor/rules/*.mdc format
 * with proper frontmatter for Cursor IDE compatibility.
 *
 * @since 0.1.0
 * @category constructors
 */
export const syncCursorRulesCommand = Command.make(
  "sync-cursor-rules",
  { dryRun: dryRunOption, verbose: verboseOption },
  (options) =>
    handleSyncCursorRules(options).pipe(
      Effect.catchAll((err) =>
        Effect.gen(function* () {
          yield* Console.log(color.red(`\nError: ${String(err)}`));
          yield* Effect.die(new Error(String(err)));
        })
      )
    )
).pipe(
  Command.withDescription("Sync .claude/rules to .cursor/rules in MDC format"),
  Command.provide(SyncCursorRulesServiceLayer)
);
