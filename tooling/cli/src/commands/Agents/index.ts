/**
 * Agent-related command suite.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { thunkFalse, thunkSomeFalse } from "@beep/utils";
import { Console, Effect, FileSystem, Inspectable, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";

const $I = $RepoCliId.create("commands/Agents");

/**
 * `agents check` resolved options.
 *
 * @since 0.0.0
 * @category DomainModel
 */
class AgentsCheckOptions extends S.Class<AgentsCheckOptions>($I`AgentsCheckOptions`)(
  {
    strict: S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefault(thunkFalse)),
  },
  $I.annote("AgentsCheckOptions", {
    description: "Resolved options for agents check command.",
  })
) {}

/**
 * Managed file manifest entry.
 *
 * @since 0.0.0
 * @category DomainModel
 */
class ManagedFile extends S.Class<ManagedFile>($I`ManagedFile`)(
  {
    path: S.String,
  },
  $I.annote("ManagedFile", {
    description: "Managed file manifest entry.",
  })
) {}

/**
 * Managed file manifest payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
class ManagedFilesManifest extends S.Class<ManagedFilesManifest>($I`ManagedFilesManifest`)(
  {
    files: S.Array(ManagedFile).pipe(
      S.withConstructorDefault(() => O.some(A.empty<ManagedFile>())),
      S.withDecodingDefault(A.empty<ManagedFile>)
    ),
  },
  $I.annote("ManagedFilesManifest", {
    description: "Managed file manifest payload used by agents check.",
  })
) {}

/**
 * Pathless configuration violation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
class PathlessViolation extends S.Class<PathlessViolation>($I`PathlessViolation`)(
  {
    file: S.String,
    line: S.Number,
    column: S.Number,
    message: S.String,
    excerpt: S.String,
  },
  $I.annote("PathlessViolation", {
    description: "Violation reported by pathless config checks.",
  })
) {}

class AgentsManifestDecodeError extends TaggedErrorClass<AgentsManifestDecodeError>($I`AgentsManifestDecodeError`)(
  "AgentsManifestDecodeError",
  {
    message: S.String,
  },
  $I.annote("AgentsManifestDecodeError", {
    description: "Manifest payload failed schema decoding.",
  })
) {}

const TARGET_PATHLESS_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
  ".claude/rules/agent-instructions.md",
  "tooling/cli/src/commands/CreatePackage/templates/AGENTS.md.hbs",
] as const;

const decodeJsonString = S.decodeUnknownSync(S.UnknownFromJsonString);
const decodeManagedFilesManifest = S.decodeUnknownSync(ManagedFilesManifest);

const findSlashColumn = (line: string): O.Option<number> => {
  const slashColumn = line.indexOf("/");
  const backslashColumn = line.indexOf("\\");

  if (slashColumn >= 0 && backslashColumn >= 0) {
    return O.some(Math.min(slashColumn, backslashColumn) + 1);
  }
  if (slashColumn >= 0) {
    return O.some(slashColumn + 1);
  }
  if (backslashColumn >= 0) {
    return O.some(backslashColumn + 1);
  }

  return O.none();
};

/**
 * CLI command for validating AGENTS manifest coverage.
 *
 * @since 0.0.0
 * @category UseCase
 */
const agentsCheckCommand = Command.make(
  "check",
  {
    strict: Flag.boolean("strict").pipe(
      Flag.withDescription("Exit with failure when managed AGENTS files are missing")
    ),
  },
  Effect.fn(function* ({ strict }) {
    const path = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;
    const options = new AgentsCheckOptions({ strict });

    const manifestPath = path.resolve(".beep/manifests/managed-files.json");
    const manifestExists = yield* fs.exists(manifestPath);

    if (!manifestExists) {
      if (options.strict) {
        yield* Console.error(`[agents-check] manifest missing: ${manifestPath}`);
        process.exitCode = 1;
      } else {
        yield* Console.log(`[agents-check] skipped: no managed-files manifest at ${manifestPath} (non-strict mode)`);
      }
      return;
    }

    const manifestText = yield* fs.readFileString(manifestPath);

    const manifest = yield* Effect.try({
      try: () => decodeManagedFilesManifest(decodeJsonString(manifestText)),
      catch: (cause) =>
        new AgentsManifestDecodeError({
          message: `[agents-check] failed to decode manifest: ${Inspectable.toStringUnknown(cause, 0)}`,
        }),
    });

    const agentPaths = pipe(
      manifest.files,
      A.map((entry) => entry.path),
      A.filter(Str.endsWith("AGENTS.md"))
    );

    const missingCandidates = yield* Effect.forEach(
      agentPaths,
      Effect.fn(function* (relativePath) {
        const exists = yield* fs.exists(path.resolve(relativePath));
        return exists ? O.none<string>() : O.some(relativePath);
      }),
      { concurrency: "unbounded" }
    );

    const missing = pipe(
      missingCandidates,
      A.filter(O.isSome),
      A.map((entry) => entry.value)
    );

    yield* Console.log(`[agents-check] expected=${A.length(agentPaths)} missing=${A.length(missing)}`);
    for (const relativePath of missing) {
      yield* Console.log(`  - ${relativePath}`);
    }

    if (options.strict && A.length(missing) > 0) {
      process.exitCode = 1;
    }
  })
).pipe(Command.withDescription("Validate AGENTS.md manifest entries"));

/**
 * CLI command for validating pathless agent instruction surfaces.
 *
 * @since 0.0.0
 * @category UseCase
 */
const agentsPathlessCheckCommand = Command.make(
  "pathless-check",
  {},
  Effect.fn(function* () {
    const path = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;

    const violations = A.empty<PathlessViolation>();

    for (const relativePath of TARGET_PATHLESS_FILES) {
      const absolutePath = path.resolve(relativePath);
      const exists = yield* fs.exists(absolutePath);

      if (!exists) {
        violations.push(
          new PathlessViolation({
            file: relativePath,
            line: 0,
            column: 0,
            message: "file missing",
            excerpt: "",
          })
        );
        continue;
      }

      const content = yield* fs.readFileString(absolutePath);
      const lines = Str.split("\n")(content);

      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index] ?? "";
        const slashColumn = findSlashColumn(line);

        if (O.isNone(slashColumn)) {
          continue;
        }

        violations.push(
          new PathlessViolation({
            file: relativePath,
            line: index + 1,
            column: slashColumn.value,
            message: "path separator is not allowed in pathless config surfaces",
            excerpt: Str.trim(line),
          })
        );
      }
    }

    if (A.length(violations) > 0) {
      yield* Console.error(`[pathless-config] failed with ${A.length(violations)} violation(s)`);
      for (const violation of violations) {
        const location =
          violation.line > 0 ? `${violation.file}:${violation.line}:${violation.column}` : `${violation.file}:missing`;

        yield* Console.error(`- ${location} ${violation.message}`);

        if (violation.excerpt.length > 0) {
          yield* Console.error(`  ${violation.excerpt}`);
        }
      }

      process.exitCode = 1;
      return;
    }

    yield* Console.log(`[pathless-config] ok (${TARGET_PATHLESS_FILES.length} files)`);
  })
).pipe(Command.withDescription("Validate pathless agent instruction surfaces"));

/**
 * Agent command group.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const agentsCommand = Command.make(
  "agents",
  {},
  Effect.fn(function* () {
    yield* Console.log("Agent commands:");
    yield* Console.log("- bun run beep agents check");
    yield* Console.log("- bun run beep agents check --strict");
    yield* Console.log("- bun run beep agents pathless-check");
  })
).pipe(
  Command.withDescription("Agent manifest and pathless policy commands"),
  Command.withSubcommands([agentsCheckCommand, agentsPathlessCheckCommand])
);
