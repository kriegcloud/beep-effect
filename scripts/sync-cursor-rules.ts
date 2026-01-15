#!/usr/bin/env bun
/**
 * @file Sync Cursor Rules
 *
 * Transforms .claude/rules/*.md files to .cursor/rules/*.mdc format
 * with proper frontmatter for Cursor IDE compatibility.
 *
 * Transformations:
 * - File extension: .md → .mdc
 * - Add required description: field
 * - Add alwaysApply: field (true for always-loaded, false for scoped)
 * - Transform paths: → globs: (field rename)
 *
 * @module sync-cursor-rules
 */

import * as FileSystem from "@effect/platform/FileSystem";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Str from "effect/String";

const RULES_DIR = ".claude/rules";
const OUTPUT_DIR = ".cursor/rules";

/**
 * Generate a description from filename
 * Note: Using native string methods for reliability
 */
const generateDescription = (filename: string): string => {
  const name = filename.replace(".md", "");
  // Capitalize first letter and add "rules"
  const firstChar = name.charAt(0);
  const rest = name.slice(1);
  return `${firstChar.toUpperCase()}${rest} rules`;
};

/**
 * Transform frontmatter paths: to globs:
 * Handles both YAML array format and single-line format
 */
const transformPathsToGlobs = (content: string): string => {
  // Simple string replacement: "paths:" → "globs:"
  // Use native replace for reliability
  return content.replace(/paths:/g, "globs:");
};

/**
 * Extract frontmatter section from content
 * Returns [frontmatter, body] or [null, content] if no frontmatter
 * Uses native string methods for reliability
 */
const extractFrontmatter = (
  content: string
): readonly [string | null, string] => {
  if (!content.startsWith("---")) {
    return [null, content];
  }

  // Find the second --- delimiter
  const firstDelimiter = content.indexOf("---");
  const afterFirst = content.slice(firstDelimiter + 3);
  const secondDelimiter = afterFirst.indexOf("---");

  if (secondDelimiter === -1) {
    // No closing delimiter, treat as no frontmatter
    return [null, content];
  }

  const frontmatter = content.slice(3, firstDelimiter + 3 + secondDelimiter);
  const bodySlice = content.slice(firstDelimiter + 3 + secondDelimiter + 3);
  // Remove leading newlines
  const body = bodySlice.startsWith("\n") ? bodySlice.slice(1) : bodySlice;

  return [frontmatter, body];
};

/**
 * Check if frontmatter contains a field
 * Note: Using native string methods for reliability
 */
const hasField = (frontmatter: string, field: string): boolean => {
  return frontmatter.includes(`${field}:`);
};

/**
 * Add field to frontmatter if missing
 */
const addFieldToFrontmatter = (
  frontmatter: string,
  field: string,
  value: string
): string => {
  if (hasField(frontmatter, field)) {
    return frontmatter;
  }

  // Add after the opening --- or at the end
  if (frontmatter.length === 0) {
    return `${field}: ${value}\n`;
  }

  // Add at the beginning of frontmatter content
  return `${field}: ${value}\n${frontmatter}`;
};

/**
 * Transform a single rule file
 */
const transformFile = (
  filename: string
): Effect.Effect<void, Error, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const sourcePath = `${RULES_DIR}/${filename}`;
    const targetFilename = F.pipe(filename, Str.replace(".md", ".mdc"));
    const targetPath = `${OUTPUT_DIR}/${targetFilename}`;

    yield* Effect.log(`Transforming ${filename} → ${targetFilename}`);

    // Read source file
    const content = yield* fs.readFileString(sourcePath);

    // Extract frontmatter and body
    const [existingFrontmatter, body] = extractFrontmatter(content);

    let newFrontmatter: string;
    let transformedBody = body;

    if (existingFrontmatter !== null) {
      // Transform existing frontmatter
      let transformed = transformPathsToGlobs(existingFrontmatter);

      // Add description if missing
      if (!hasField(transformed, "description")) {
        const description = generateDescription(filename);
        transformed = addFieldToFrontmatter(
          transformed,
          "description",
          `"${description}"`
        );
      }

      // Add alwaysApply if missing
      if (!hasField(transformed, "alwaysApply")) {
        const hasGlobs = hasField(transformed, "globs");
        const alwaysApply = !hasGlobs;
        transformed = addFieldToFrontmatter(
          transformed,
          "alwaysApply",
          String(alwaysApply)
        );
      }

      newFrontmatter = transformed;
    } else {
      // Create new frontmatter
      const description = generateDescription(filename);
      newFrontmatter = `description: "${description}"\nalwaysApply: true\n`;
    }

    // Combine frontmatter and body
    const transformedContent = `---\n${newFrontmatter}---\n\n${transformedBody}`;

    // Ensure output directory exists
    yield* fs.makeDirectory(OUTPUT_DIR, { recursive: true });

    // Write transformed file
    yield* fs.writeFileString(targetPath, transformedContent);

    yield* Effect.log(`✓ Created ${targetFilename}`);
  });

/**
 * Main transformation program
 */
const transformRules = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  yield* Console.log("🔄 Syncing Cursor rules from Claude rules...\n");

  // Read source directory
  const files = yield* fs.readDirectory(RULES_DIR);

  // Filter to .md files only
  const mdFiles = A.filter(files, (file) => Str.endsWith(file, ".md"));

  if (A.length(mdFiles) === 0) {
    yield* Console.log("⚠️  No .md files found in .claude/rules/");
    return;
  }

  yield* Console.log(`Found ${A.length(mdFiles)} rule file(s) to transform\n`);

  // Transform each file
  yield* Effect.forEach(mdFiles, transformFile, { concurrency: "unbounded" });

  yield* Console.log(`\n✨ Successfully transformed ${A.length(mdFiles)} rule file(s)`);
  yield* Console.log(`📁 Output directory: ${OUTPUT_DIR}/`);
});

/**
 * Run the program with Bun runtime
 */
const program = transformRules.pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Console.log(`\n❌ Error: ${String(error)}`);
      yield* Effect.log(`Error details: ${String(error)}`);
      return yield* Effect.void;
    })
  ),
  Effect.provide(BunFileSystem.layer)
);

BunRuntime.runMain(program);
