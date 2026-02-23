/**
 * @fileoverview Agent manifest validation command
 *
 * Validates that the agents-manifest.yaml is in sync with agent definitions
 * in .claude/agents/. Designed to run as a pre-commit hook to ensure agent
 * documentation stays current when agent definitions change.
 *
 * @module @beep/tooling-cli/commands/agents-validate
 * @since 0.1.0
 * @category Commands
 *
 * @example
 * ```typescript
 * import { agentsValidateCommand } from "@beep/tooling-cli/commands/agents-validate"
 * import * as CliCommand from "@effect/cli/Command"
 *
 * // Run validation
 * const cli = CliCommand.make("beep").pipe(
 *   CliCommand.withSubcommands([agentsValidateCommand])
 * )
 * ```
 */

import { findRepoRoot } from "@beep/tooling-utils/repo";
import { DomainError } from "@beep/tooling-utils/repo/Errors";
import * as CliCommand from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as ProcessCommand from "@effect/platform/Command";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import color from "picocolors";

// =============================================================================
// Configuration
// =============================================================================

const AGENTS_DIR = ".claude/agents";
const MANIFEST_PATH = ".claude/agents-manifest.yaml";
const AGENT_FILE_PATTERN = /\.md$/;
const EXCLUDED_FILES = ["agents-md-template.md"];

// =============================================================================
// Types
// =============================================================================

interface AgentDefinition {
  readonly name: string;
  readonly tools: ReadonlyArray<string>;
  readonly description: string;
}

interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
}

// =============================================================================
// Git Operations
// =============================================================================

/**
 * Get list of staged files in the current commit
 */
const getStagedFiles = Effect.gen(function* () {
  const command = F.pipe(
    ProcessCommand.make("git", "diff", "--cached", "--name-only"),
    ProcessCommand.stdout("pipe"),
    ProcessCommand.stderr("pipe")
  );

  const result = yield* ProcessCommand.string(command);
  return F.pipe(
    result,
    Str.trim,
    Str.split("\n"),
    A.filter((line) => Str.length(line) > 0)
  );
}).pipe(
  Effect.catchAll(() => Effect.succeed([] as ReadonlyArray<string>)),
  Effect.withSpan("getStagedFiles")
);

/**
 * Check if we're in a git commit context (pre-commit hook)
 */
const isInCommitContext = Effect.gen(function* () {
  const staged = yield* getStagedFiles;
  return A.length(staged) > 0;
});

// =============================================================================
// File Parsing
// =============================================================================

/**
 * Parse frontmatter from an agent markdown file
 */
const parseAgentFrontmatter = (content: string, filename: string): O.Option<AgentDefinition> => {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch?.[1]) return O.none();

  const frontmatter = frontmatterMatch[1];
  const name = F.pipe(filename, Str.replace(/\.md$/, ""));

  // Extract tools array
  const toolsMatch = frontmatter.match(/tools:\s*\[(.*?)]/s);
  const tools = toolsMatch?.[1]
    ? F.pipe(
        toolsMatch[1],
        Str.split(","),
        A.map(Str.trim),
        A.filter((t) => Str.length(t) > 0)
      )
    : [];

  // Extract description
  const descMatch = frontmatter.match(/description:\s*[|]?\s*([\s\S]*?)(?:\n[a-z]+:|$)/);
  const description = descMatch?.[1] ? Str.trim(descMatch[1]) : "";

  return O.some({
    name,
    tools,
    description: F.pipe(
      description,
      Str.split("\n"),
      A.head,
      O.getOrElse(() => description)
    ),
  });
};

/**
 * Parse agents from manifest YAML (simplified parsing)
 *
 * Looks for the `agents:` section and extracts all direct children (2-space indented keys).
 * Stops when it hits a top-level key (like `selection_rules:` or `quick_reference:`).
 */
const parseManifestAgents = (content: string): ReadonlyArray<string> => {
  // Find where agents: section starts
  const agentsStart = content.indexOf("\nagents:\n");
  if (agentsStart === -1) return [];

  // Find the next top-level key (line starting with a letter and colon, no indent)
  const afterAgents = content.substring(agentsStart + 9); // 9 = length of "\nagents:\n"
  const nextTopLevelMatch = afterAgents.match(/\n[a-z_]+:/);
  const agentsContent = nextTopLevelMatch ? afterAgents.substring(0, nextTopLevelMatch.index) : afterAgents;

  // Extract agent names: lines with exactly 2-space indent followed by kebab-case name and colon
  // Use ^ with multiline flag to match at start of content (first agent) and after newlines
  const agentMatches = agentsContent.matchAll(/(?:^|\n) {2}([a-z][a-z0-9-]*):\n/gm);

  return F.pipe(
    Array.from(agentMatches),
    A.map((match) => match[1]),
    A.filter((name): name is string => name !== undefined)
  );
};

// =============================================================================
// Validation Logic
// =============================================================================

const validateAgentsManifest = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot;

  const agentsDir = path.join(repoRoot, AGENTS_DIR);
  const manifestPath = path.join(repoRoot, MANIFEST_PATH);

  const errors: Array<string> = [];
  const warnings: Array<string> = [];

  // Check if manifest exists
  const manifestExists = yield* fs.exists(manifestPath);
  if (!manifestExists) {
    errors.push(`Manifest file not found: ${MANIFEST_PATH}`);
    return { valid: false, errors, warnings } as ValidationResult;
  }

  // Check if agents directory exists
  const agentsDirExists = yield* fs.exists(agentsDir);
  if (!agentsDirExists) {
    errors.push(`Agents directory not found: ${AGENTS_DIR}`);
    return { valid: false, errors, warnings } as ValidationResult;
  }

  // Get all agent files
  const agentFiles = yield* fs.readDirectory(agentsDir);
  const agentMdFiles = F.pipe(
    agentFiles,
    A.filter((file) => AGENT_FILE_PATTERN.test(file)),
    A.filter((file) => !A.contains(EXCLUDED_FILES, file))
  );

  // Parse agent definitions
  const agentDefinitions: Array<AgentDefinition> = [];
  for (const file of agentMdFiles) {
    const filePath = path.join(agentsDir, file);
    const content = yield* fs.readFileString(filePath);
    const parsed = parseAgentFrontmatter(content, file);
    if (O.isSome(parsed)) {
      agentDefinitions.push(parsed.value);
    } else {
      warnings.push(`Could not parse frontmatter from: ${file}`);
    }
  }

  // Parse manifest
  const manifestContent = yield* fs.readFileString(manifestPath);
  const manifestAgents = parseManifestAgents(manifestContent);

  // Compare agent lists
  const definedAgentNames = F.pipe(
    agentDefinitions,
    A.map((a) => a.name),
    A.sort(Str.Order)
  );
  const manifestAgentNames = F.pipe(manifestAgents, A.sort(Str.Order));

  // Check for agents in definitions but not in manifest
  const missingFromManifest = F.pipe(
    definedAgentNames,
    A.filter((name) => !A.contains(manifestAgentNames, name))
  );

  // Check for agents in manifest but not in definitions
  const extraInManifest = F.pipe(
    manifestAgentNames,
    A.filter((name) => !A.contains(definedAgentNames, name))
  );

  if (A.length(missingFromManifest) > 0) {
    errors.push(`Agents missing from manifest: ${A.join(missingFromManifest, ", ")}`);
  }

  if (A.length(extraInManifest) > 0) {
    warnings.push(`Agents in manifest but not in definitions: ${A.join(extraInManifest, ", ")}`);
  }

  return {
    valid: A.length(errors) === 0,
    errors,
    warnings,
  } as ValidationResult;
}).pipe(DomainError.mapError);

/**
 * Check if agent-related files were modified in staged changes
 */
const checkAgentFilesModified = Effect.gen(function* () {
  const stagedFiles = yield* getStagedFiles;

  const agentFilesModified = F.pipe(stagedFiles, A.filter(Str.startsWith(AGENTS_DIR)));

  const manifestModified = F.pipe(
    stagedFiles,
    A.some((file) => file === MANIFEST_PATH)
  );

  return {
    agentFilesModified,
    manifestModified,
    hasAgentChanges: A.length(agentFilesModified) > 0,
  };
});

// =============================================================================
// Command Handler
// =============================================================================

const handleAgentsValidateCommand = (options: { readonly strict: boolean; readonly preCommit: boolean }) =>
  Effect.gen(function* () {
    yield* Console.log(color.cyan("Validating agents manifest..."));

    // If pre-commit mode, check if agent files were modified
    if (options.preCommit) {
      const inCommitContext = yield* isInCommitContext;

      if (!inCommitContext) {
        yield* Console.log(color.yellow("Not in a commit context, running full validation..."));
      } else {
        const { agentFilesModified, manifestModified, hasAgentChanges } = yield* checkAgentFilesModified;

        if (!hasAgentChanges) {
          yield* Console.log(color.green("No agent files modified, skipping validation."));
          return;
        }

        yield* Console.log(color.cyan(`Agent files modified: ${A.join(agentFilesModified, ", ")}`));

        if (!manifestModified) {
          yield* Console.log(color.yellow(`Warning: Agent files were modified but ${MANIFEST_PATH} was not updated.`));
          if (options.strict) {
            yield* Console.log(color.red("Strict mode: Failing due to manifest not being updated."));
            return yield* Effect.fail(
              new DomainError({
                message: "Agent manifest not updated with agent file changes",
                cause: {},
              })
            );
          }
        }
      }
    }

    // Run full validation
    const result = yield* validateAgentsManifest;

    // Report warnings
    if (A.length(result.warnings) > 0) {
      yield* Console.log(color.yellow("\nWarnings:"));
      for (const warning of result.warnings) {
        yield* Console.log(color.yellow(`  - ${warning}`));
      }
    }

    // Report errors
    if (A.length(result.errors) > 0) {
      yield* Console.log(color.red("\nErrors:"));
      for (const error of result.errors) {
        yield* Console.log(color.red(`  - ${error}`));
      }
    }

    // Final status
    if (result.valid) {
      yield* Console.log(color.green("\nAgent manifest validation passed."));
    } else {
      yield* Console.log(color.red("\nAgent manifest validation failed."));
      return yield* Effect.fail(
        new DomainError({
          message: "Agent manifest validation failed",
          cause: { errors: result.errors },
        })
      );
    }
  });

// =============================================================================
// Command Definition
// =============================================================================

const strictOption = Options.boolean("strict").pipe(
  Options.withAlias("s"),
  Options.withDescription("Fail if agent files changed but manifest was not updated"),
  Options.withDefault(false)
);

const preCommitOption = Options.boolean("pre-commit").pipe(
  Options.withDescription("Run in pre-commit mode (only validate if agent files changed)"),
  Options.withDefault(false)
);

/**
 * Validates agent manifest against agent definitions.
 *
 * Ensures .claude/agents-manifest.yaml stays in sync with agent definitions
 * in .claude/agents/. Can run as a pre-commit hook to enforce documentation
 * updates when agents change.
 *
 * @example
 * ```ts
 * import { agentsValidateCommand } from "@beep/repo-cli/commands/agents-validate"
 * import * as CliCommand from "@effect/cli/Command"
 *
 * // Add to CLI
 * const cli = CliCommand.make("beep").pipe(
 *   CliCommand.withSubcommands([agentsValidateCommand])
 * )
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const agentsValidateCommand = CliCommand.make(
  "agents-validate",
  { strict: strictOption, preCommit: preCommitOption },
  (options) => handleAgentsValidateCommand(options)
).pipe(
  CliCommand.withDescription(
    "Validate agents-manifest.yaml is in sync with agent definitions. Use --pre-commit for git hooks."
  )
);
