/**
 * Repo operational quality commands migrated from root scripts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { findRepoRoot, jsonStringifyPretty } from "@beep/repo-utils";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { A, Str, thunkFalse } from "@beep/utils";
import { Console, Effect, FileSystem, flow, Match, Order, Path, pipe, Runtime, Stream } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { ChildProcess, type ChildProcessSpawner } from "effect/unstable/process";
import { XMLParser } from "fast-xml-parser";
import { type ParseError, parse } from "jsonc-parser";
import { printLines } from "../../internal/cli/Printer.js";
import { runChangesetGraphCheck } from "./ChangesetGraph.js";
import { configStringEqualsSync } from "./internal/Config.js";
import { QualityTaskStep } from "./Tasks.js";

const $I = $RepoCliId.create("commands/Quality/ScriptCommands");

const GITHUB_CHECK_MODES = ["quality", "repo-sanity", "secrets", "security", "sast", "nix", "pre-push"] as const;
const ignoredTestDirectoryNames = ["node_modules", "dist", "coverage", "tmp"] as const;
const ignoredTestPathSegments = ["/test/fixtures/"] as const;
const dtslintSearchRoots = ["apps", "packages", "tooling"] as const;
const testSearchRoots = ["apps", "packages", "tooling", "infra"] as const;
const moduleTagScannedRoots = [".patterns", "apps", "packages", "tooling"] as const;
const moduleTagScannedExtensions = [".hbs", ".md", ".ts", ".tsx"] as const;
const effectDiagnosticsDirectiveScannedRoots = ["apps", "packages", "tooling", "infra"] as const;
const effectDiagnosticsDirectiveScannedExtensions = [".cts", ".mts", ".ts", ".tsx"] as const;
const effectDiagnosticsDirectiveIgnoredDirectoryNames = ["node_modules", "dist", "coverage", "tmp", "scripts"] as const;
const effectTsgoDiagnosticsTableStartMarker = "<!-- diagnostics-table:start -->";
const effectTsgoDiagnosticsTableEndMarker = "<!-- diagnostics-table:end -->";
const effectDiagnosticsDirectivePrefix = "@effect-diagnostics";
const effectDiagnosticsOffDirectivePattern = new RegExp(`${effectDiagnosticsDirectivePrefix}[^\\n]*:${"off"}\\b`, "u");
const effectTsgoDiagnosticPattern = /\b(?:error|warning) TS\d+: .* effect\([^)]+\)/u;
const decodeUnknownRecordOption = S.decodeUnknownOption(S.Record(S.String, S.Unknown));
const decodeUnknownArrayOption = S.decodeUnknownOption(S.Array(S.Unknown));
const effectTsgoReadmeParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

class EffectTsgoRuleCell extends S.Class<EffectTsgoRuleCell>($I`EffectTsgoRuleCell`)(
  {
    code: S.String,
  },
  $I.annote("EffectTsgoRuleCell", {
    description: "Parsed diagnostics table cell containing an Effect tsgo rule code.",
  })
) {}

class EffectTsgoRuleRow extends S.Class<EffectTsgoRuleRow>($I`EffectTsgoRuleRow`)(
  {
    td: S.Array(S.Unknown),
  },
  $I.annote("EffectTsgoRuleRow", {
    description: "Parsed diagnostics table row from the installed Effect tsgo README.",
  })
) {}

class EffectTsgoDiagnosticsTbody extends S.Class<EffectTsgoDiagnosticsTbody>($I`EffectTsgoDiagnosticsTbody`)(
  {
    tr: S.Array(S.Unknown),
  },
  $I.annote("EffectTsgoDiagnosticsTbody", {
    description: "Parsed diagnostics table body containing Effect tsgo rule rows.",
  })
) {}

class EffectTsgoDiagnosticsTableNode extends S.Class<EffectTsgoDiagnosticsTableNode>(
  $I`EffectTsgoDiagnosticsTableNode`
)(
  {
    tbody: EffectTsgoDiagnosticsTbody,
  },
  $I.annote("EffectTsgoDiagnosticsTableNode", {
    description: "Parsed diagnostics table node from the installed Effect tsgo README.",
  })
) {}

class EffectTsgoDiagnosticsRoot extends S.Class<EffectTsgoDiagnosticsRoot>($I`EffectTsgoDiagnosticsRoot`)(
  {
    table: EffectTsgoDiagnosticsTableNode,
  },
  $I.annote("EffectTsgoDiagnosticsRoot", {
    description: "Root wrapper used to parse the Effect tsgo diagnostics table fragment.",
  })
) {}

class EffectTsgoDiagnosticsTable extends S.Class<EffectTsgoDiagnosticsTable>($I`EffectTsgoDiagnosticsTable`)(
  {
    root: EffectTsgoDiagnosticsRoot,
  },
  $I.annote("EffectTsgoDiagnosticsTable", {
    description: "Parsed diagnostics table fragment from the installed Effect tsgo README.",
  })
) {}
const decodeEffectTsgoRuleCellOption = S.decodeUnknownOption(EffectTsgoRuleCell);
const decodeEffectTsgoRuleRowOption = S.decodeUnknownOption(EffectTsgoRuleRow);
const decodeEffectTsgoDiagnosticsTableOption = S.decodeUnknownOption(EffectTsgoDiagnosticsTable);

type QualityScriptEnvironment = FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner;
type TsgoDiagnosticOutput = {
  readonly output: string;
};

/**
 * GitHub check mode handled by `beep quality github-checks`.
 *
 * @example
 * ```ts
 * import { GithubCheckMode } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const mode: GithubCheckMode = "repo-sanity"
 * ```
 * @category models
 * @since 0.0.0
 */
export const GithubCheckMode = LiteralKit(GITHUB_CHECK_MODES).annotate(
  $I.annote("GithubCheckMode", {
    description: "GitHub verification mode handled by the repo-cli quality command group.",
  })
);

/**
 * GitHub check mode handled by `beep quality github-checks`.
 *
 * @example
 * ```ts
 * import type { GithubCheckMode } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const mode: GithubCheckMode = "quality"
 * ```
 * @category models
 * @since 0.0.0
 */
export type GithubCheckMode = typeof GithubCheckMode.Type;

/**
 * Typed failure for repo operational commands.
 *
 * @example
 * ```ts
 * import { QualityScriptCommandError } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const error = QualityScriptCommandError.make({ message: "failed" })
 * ```
 * @category errors
 * @since 0.0.0
 */
export class QualityScriptCommandError extends TaggedErrorClass<QualityScriptCommandError>(
  $I`QualityScriptCommandError`
)(
  "QualityScriptCommandError",
  {
    message: S.String,
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Number),
    cause: S.optionalKey(S.Defect),
  },
  $I.annote("QualityScriptCommandError", {
    description: "Failure raised while running a migrated repo operational command.",
  })
) {
  /** Process exit code reported when this error reaches the runtime boundary. */
  override readonly [Runtime.errorExitCode] = this.exitCode ?? 1;
}

const commandText = (command: string, args: ReadonlyArray<string>) => A.join([command, ...args], " ");

const normalizeExtraArgs = (args: unknown): ReadonlyArray<string> => {
  if (P.isUndefined(args)) {
    return A.empty();
  }

  if (P.isString(args)) {
    return A.make(args);
  }

  return P.isIterable(args) ? pipe(A.fromIterable(args), A.filter(P.isString)) : A.empty();
};

const withExitCode = (label: string, command: string, args: ReadonlyArray<string>, exitCode: number) =>
  QualityScriptCommandError.make({
    message: `${label} failed with exit code ${exitCode}.`,
    command: commandText(command, args),
    exitCode,
  });

const runStep = Effect.fn("QualityScriptCommands.runStep")(function* (
  step: QualityTaskStep
): Effect.fn.Return<void, QualityScriptCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  yield* Console.log(`[beep-cli] ${step.label}: ${commandText(step.command, step.args)}`);
  const exitCode = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make(step.command, [...step.args], {
        cwd: step.cwd,
        env: step.env,
        extendEnv: true,
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
      });
      return yield* handle.exitCode;
    })
  ).pipe(
    Effect.mapError((cause) =>
      QualityScriptCommandError.make({
        message: `Failed to spawn ${commandText(step.command, step.args)}.`,
        command: commandText(step.command, step.args),
        cause,
      })
    )
  );

  if (exitCode !== 0) {
    return yield* withExitCode(step.label, step.command, step.args, exitCode);
  }
});

const runBun = (repoRoot: string, label: string, args: ReadonlyArray<string>) =>
  runStep(QualityTaskStep.make({ label, command: "bun", args: ["run", ...args], cwd: repoRoot }));

const runBunx = (repoRoot: string, label: string, args: ReadonlyArray<string>) =>
  runStep(QualityTaskStep.make({ label, command: "bunx", args, cwd: repoRoot }));

const runFixedStep = (repoRoot: string, label: string, command: string, args: ReadonlyArray<string>) =>
  runStep(QualityTaskStep.make({ label, command, args, cwd: repoRoot }));

const collectOutput = Effect.fn("QualityScriptCommands.collectOutput")(function* (
  step: QualityTaskStep
): Effect.fn.Return<
  { readonly output: string; readonly exitCode: number },
  QualityScriptCommandError,
  ChildProcessSpawner.ChildProcessSpawner
> {
  return yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make(step.command, [...step.args], {
        cwd: step.cwd,
        env: step.env,
        extendEnv: true,
        stdout: "pipe",
        stderr: "pipe",
      });
      const output = yield* handle.all.pipe(
        Stream.decodeText(),
        Stream.runFold(
          () => "",
          (acc, chunk) => acc + chunk
        )
      );
      const exitCode = yield* handle.exitCode;
      return {
        output: Str.trim(output),
        exitCode,
      };
    })
  ).pipe(
    Effect.mapError((cause) =>
      QualityScriptCommandError.make({
        message: `Failed to collect output from ${commandText(step.command, step.args)}.`,
        command: commandText(step.command, step.args),
        cause,
      })
    )
  );
});

const collectSuccessfulOutput = Effect.fn("QualityScriptCommands.collectSuccessfulOutput")(function* (
  step: QualityTaskStep
): Effect.fn.Return<string, QualityScriptCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const result = yield* collectOutput(step);

  if (result.exitCode !== 0) {
    return yield* withExitCode(step.label, step.command, step.args, result.exitCode);
  }

  return result.output;
});

const isTruthyMainPush = (): boolean =>
  configStringEqualsSync("GITHUB_EVENT_NAME", "push") && configStringEqualsSync("GITHUB_REF_NAME", "main");

const currentBranch = Effect.fn("QualityScriptCommands.currentBranch")(function* (
  repoRoot: string
): Effect.fn.Return<string, QualityScriptCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  return yield* collectSuccessfulOutput(
    QualityTaskStep.make({
      label: "git:branch",
      command: "git",
      args: ["branch", "--show-current"],
      cwd: repoRoot,
    })
  );
});

const ensureOriginMain = Effect.fn("QualityScriptCommands.ensureOriginMain")(function* (
  repoRoot: string
): Effect.fn.Return<void, QualityScriptCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  yield* Console.log("[github-checks] refreshing origin/main");
  const shallow = yield* collectSuccessfulOutput(
    QualityTaskStep.make({
      label: "git:shallow",
      command: "git",
      args: ["rev-parse", "--is-shallow-repository"],
      cwd: repoRoot,
    })
  );

  if (shallow === "true") {
    yield* runFixedStep(repoRoot, "git:fetch:unshallow", "git", ["fetch", "origin", "--quiet", "--unshallow"]);
  }

  yield* runFixedStep(repoRoot, "git:fetch:origin-main", "git", [
    "fetch",
    "origin",
    "main:refs/remotes/origin/main",
    "--quiet",
  ]);
});

const runChangesetStatus = Effect.fn("QualityScriptCommands.runChangesetStatus")(function* (
  repoRoot: string
): Effect.fn.Return<void, QualityScriptCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  if (isTruthyMainPush()) {
    yield* Console.log("[github-checks] quality: skipped changeset status on main push");
    return;
  }

  const branch = yield* currentBranch(repoRoot);
  if (branch === "main") {
    yield* Console.log("[github-checks] quality: skipped changeset status on main");
    return;
  }

  yield* Console.log("[github-checks] quality: changeset status");
  yield* runBun(repoRoot, "quality:changeset-status", ["changeset:status:since-main"]);
});

/**
 * Run Bun's high-severity package audit with OSV ignores mirrored from config.
 *
 * @param repoRoot - Repository root directory.
 * @returns Effect that exits non-zero when audit fails.
 * @example
 * ```ts
 * import { runBunAudit } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const program = runBunAudit("/repo")
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runBunAudit = Effect.fn("QualityScriptCommands.runBunAudit")(function* (
  repoRoot: string
): Effect.fn.Return<
  void,
  QualityScriptCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const configPath = path.join(repoRoot, "osv-scanner.toml");
  const configText = yield* fs.readFileString(configPath).pipe(
    Effect.mapError((cause) =>
      QualityScriptCommandError.make({
        message: `Failed to read ${configPath}.`,
        cause,
      })
    )
  );
  const ignoredIds = pipe(
    Str.split(configText, "\n"),
    A.flatMap((line) => {
      const match = /^id = "(.+)"$/u.exec(line);
      return match?.[1] === undefined ? A.empty<string>() : A.of(match[1]);
    })
  );

  yield* runFixedStep(repoRoot, "repo-sanity:bun-audit", "bun", [
    "audit",
    "--audit-level=high",
    ...A.map(ignoredIds, (id) => `--ignore=${id}`),
  ]);
});

const runRepoSanity = Effect.fn("QualityScriptCommands.runRepoSanity")(function* (
  repoRoot: string
): Effect.fn.Return<void, QualityScriptCommandError, QualityScriptEnvironment> {
  yield* Console.log("[github-checks] repo-sanity: changeset graph");
  yield* runChangesetGraphCheck(repoRoot).pipe(
    Effect.mapError((error) =>
      QualityScriptCommandError.make({
        message: error.message,
        command: "bun run beep quality changeset-graph",
        exitCode: 1,
        cause: error,
      })
    )
  );

  yield* Console.log("[github-checks] repo-sanity: tsconfig sync");
  yield* runBun(repoRoot, "repo-sanity:tsconfig-sync", ["config-sync:check"]);

  yield* Console.log("[github-checks] repo-sanity: versions");
  yield* runBun(repoRoot, "repo-sanity:versions", ["version-sync", "--skip-network"]);

  yield* Console.log("[github-checks] repo-sanity: dependency policy");
  yield* runBunx(repoRoot, "repo-sanity:syncpack", ["syncpack", "lint"]);

  yield* Console.log("[github-checks] repo-sanity: package graph");
  yield* runBunx(repoRoot, "repo-sanity:sherif", ["sherif@1.10.0", "-r", "non-existent-packages"]);

  yield* Console.log("[github-checks] repo-sanity: bun audit");
  yield* runBunAudit(repoRoot);
});

const runQuality = Effect.fn("QualityScriptCommands.runQuality")(function* (
  repoRoot: string
): Effect.fn.Return<void, QualityScriptCommandError, QualityScriptEnvironment> {
  yield* Console.log("[github-checks] quality: build");
  yield* runBun(repoRoot, "quality:build", ["build"]);

  yield* Console.log("[github-checks] quality: type check");
  yield* runBun(repoRoot, "quality:check", ["check"]);

  yield* Console.log("[github-checks] quality: lint");
  yield* runBun(repoRoot, "quality:lint", ["lint"]);

  yield* Console.log("[github-checks] quality: docgen");
  yield* runBun(repoRoot, "quality:docgen-generate", ["beep", "--", "docgen", "generate"]);
  yield* runBun(repoRoot, "quality:docgen-aggregate", ["beep", "--", "docgen", "aggregate"]);

  yield* Console.log("[github-checks] quality: repo export catalog");
  yield* runBun(repoRoot, "quality:repo-exports-catalog-check", ["repo-exports:catalog:check"]);

  yield* Console.log("[github-checks] quality: test");
  yield* runBun(repoRoot, "quality:test", ["test"]);

  yield* Console.log("[github-checks] quality: repo sanity");
  yield* runRepoSanity(repoRoot);
  yield* runChangesetStatus(repoRoot);
});

const runSecretScan = Effect.fn("QualityScriptCommands.runSecretScan")(function* (
  repoRoot: string
): Effect.fn.Return<void, QualityScriptCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const mergeBase = yield* collectSuccessfulOutput(
    QualityTaskStep.make({
      label: "secrets:merge-base",
      command: "git",
      args: ["merge-base", "origin/main", "HEAD"],
      cwd: repoRoot,
    })
  );

  yield* Console.log("[github-checks] secrets: gitleaks");
  yield* runFixedStep(repoRoot, "secrets:gitleaks", "gitleaks", [
    "git",
    "--no-banner",
    "--redact",
    "--config",
    ".gitleaks.toml",
    "--gitleaks-ignore-path",
    ".gitleaksignore",
    "--log-opts",
    `${mergeBase}..HEAD`,
    ".",
  ]);
});

const runSecurityScan = Effect.fn("QualityScriptCommands.runSecurityScan")(function* (
  repoRoot: string
): Effect.fn.Return<void, QualityScriptCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  yield* Console.log("[github-checks] security: osv scan");
  yield* runFixedStep(repoRoot, "security:osv-scan", "docker", [
    "run",
    "--rm",
    "-v",
    `${repoRoot}:/github/workspace`,
    "-w",
    "/github/workspace",
    "ghcr.io/google/osv-scanner-action:v2.3.3",
    "--lockfile=bun.lock",
    "--config=osv-scanner.toml",
  ]);
});

const runSastScan = Effect.fn("QualityScriptCommands.runSastScan")(function* (
  repoRoot: string
): Effect.fn.Return<
  void,
  QualityScriptCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const trackedFilesOutput = yield* collectSuccessfulOutput(
    QualityTaskStep.make({
      label: "sast:changed-files",
      command: "git",
      args: [
        "diff",
        "--name-only",
        "--diff-filter=ACMR",
        "origin/main...HEAD",
        "--",
        "*.ts",
        "*.tsx",
        "*.js",
        "*.jsx",
        "*.mjs",
        "*.cjs",
      ],
      cwd: repoRoot,
    })
  );
  const candidateFiles = pipe(
    Str.split(trackedFilesOutput, "\n"),
    A.map(Str.trim),
    A.filter(Str.isNonEmpty),
    A.filter((filePath) => !Str.startsWith(".repos/")(filePath))
  );
  const semgrepFiles = yield* Effect.forEach(
    candidateFiles,
    Effect.fn(function* (filePath) {
      const absolutePath = path.join(repoRoot, filePath);
      const exists = yield* fs.exists(absolutePath).pipe(Effect.orElseSucceed(thunkFalse));
      if (!exists) {
        return O.none<string>();
      }

      const symlinkTarget = yield* fs.readLink(absolutePath).pipe(Effect.option);
      if (O.isSome(symlinkTarget)) {
        return yield* QualityScriptCommandError.make({
          message: `Changed JavaScript/TypeScript symlink paths are not accepted by the SAST scan: ${filePath}`,
        });
      }

      const canonicalPath = yield* fs.realPath(absolutePath).pipe(Effect.option);
      if (O.isNone(canonicalPath) || canonicalPath.value !== path.resolve(absolutePath)) {
        return O.none<string>();
      }

      return O.some(filePath);
    }),
    { concurrency: 8 }
  ).pipe(Effect.map(A.getSomes));

  if (A.isReadonlyArrayEmpty(semgrepFiles)) {
    yield* Console.log("[github-checks] sast: skipped, no tracked JavaScript or TypeScript files");
    return;
  }

  yield* Console.log("[github-checks] sast: semgrep");
  yield* runFixedStep(repoRoot, "sast:semgrep", "docker", [
    "run",
    "--rm",
    "-e",
    "SEMGREP_SEND_METRICS=off",
    "-v",
    `${repoRoot}:/src`,
    "-w",
    "/src",
    "semgrep/semgrep",
    "semgrep",
    "scan",
    "--config",
    "p/typescript",
    "--config",
    "p/javascript",
    "--config",
    "p/security-audit",
    "--config",
    "p/secrets",
    "--disable-version-check",
    "--timeout",
    "20",
    ...semgrepFiles,
  ]);
});

const runNixChecks = Effect.fn("QualityScriptCommands.runNixChecks")(function* (
  repoRoot: string
): Effect.fn.Return<void, QualityScriptCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  yield* Console.log("[github-checks] nix: flake check");
  yield* runFixedStep(repoRoot, "nix:flake-check", "nix", [
    "--option",
    "warn-dirty",
    "false",
    "flake",
    "check",
    "--all-systems",
  ]);

  yield* Console.log("[github-checks] nix: dev shell");
  yield* runFixedStep(repoRoot, "nix:dev-shell", "nix", [
    "--option",
    "warn-dirty",
    "false",
    "develop",
    "--command",
    "echo",
    "Dev shell OK",
  ]);
});

/**
 * Run a GitHub checks mode from the repository root.
 *
 * @param mode - GitHub check mode to run.
 * @returns Effect that executes the requested mode.
 * @example
 * ```ts
 * import { runGithubChecks } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const program = runGithubChecks("repo-sanity")
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runGithubChecks = Effect.fn("QualityScriptCommands.runGithubChecks")(function* (
  mode: GithubCheckMode
): Effect.fn.Return<void, QualityScriptCommandError, QualityScriptEnvironment> {
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError((cause) =>
      QualityScriptCommandError.make({
        message: "Failed to locate repository root.",
        cause,
      })
    )
  );

  yield* Match.value(mode).pipe(
    Match.when("quality", () => ensureOriginMain(repoRoot).pipe(Effect.andThen(runQuality(repoRoot)))),
    Match.when("repo-sanity", () => ensureOriginMain(repoRoot).pipe(Effect.andThen(runRepoSanity(repoRoot)))),
    Match.when("secrets", () => ensureOriginMain(repoRoot).pipe(Effect.andThen(runSecretScan(repoRoot)))),
    Match.when("security", () => runSecurityScan(repoRoot)),
    Match.when("sast", () => ensureOriginMain(repoRoot).pipe(Effect.andThen(runSastScan(repoRoot)))),
    Match.when("nix", () => runNixChecks(repoRoot)),
    Match.when("pre-push", () =>
      ensureOriginMain(repoRoot).pipe(
        Effect.andThen(runQuality(repoRoot)),
        Effect.andThen(runSecretScan(repoRoot)),
        Effect.andThen(runSecurityScan(repoRoot)),
        Effect.andThen(runSastScan(repoRoot)),
        Effect.andThen(runNixChecks(repoRoot))
      )
    ),
    Match.exhaustive
  );
});

const normalizePath = (filePath: string): string => Str.replaceAll("\\", "/")(filePath);

const pathContainsSegment = (filePath: string, segments: ReadonlyArray<string>): boolean =>
  A.some(segments, (segment) => Str.includes(segment)(filePath));

const collectFiles = Effect.fn("QualityScriptCommands.collectFiles")(function* (
  searchRoot: string,
  shouldInclude: (normalizedPath: string, name: string) => boolean,
  shouldSkipDirectory: (normalizedPath: string, name: string) => boolean
): Effect.fn.Return<ReadonlyArray<string>, QualityScriptCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const exists = yield* fs.exists(searchRoot).pipe(Effect.orElseSucceed(thunkFalse));

  if (!exists) {
    return A.empty<string>();
  }

  const visit = Effect.fn("QualityScriptCommands.collectFiles.visit")(function* (
    currentPath: string
  ): Effect.fn.Return<ReadonlyArray<string>, QualityScriptCommandError, FileSystem.FileSystem | Path.Path> {
    const entries = yield* fs.readDirectory(currentPath).pipe(
      Effect.mapError((cause) =>
        QualityScriptCommandError.make({
          message: `Failed to read directory ${currentPath}.`,
          cause,
        })
      )
    );
    let files = A.empty<string>();

    for (const entry of entries) {
      const childPath = path.join(currentPath, entry);
      const normalized = normalizePath(childPath);
      const symlinkTarget = yield* fs.readLink(childPath).pipe(Effect.option);

      if (O.isSome(symlinkTarget)) {
        continue;
      }

      const stat = yield* fs.stat(childPath).pipe(
        Effect.mapError((cause) =>
          QualityScriptCommandError.make({
            message: `Failed to stat ${childPath}.`,
            cause,
          })
        )
      );

      if (stat.type === "Directory") {
        if (!shouldSkipDirectory(`${normalized}/`, entry)) {
          files = A.appendAll(files, yield* visit(childPath));
        }
        continue;
      }

      if (stat.type === "File" && shouldInclude(normalized, entry)) {
        files = A.append(files, childPath);
      }
    }

    return files;
  });

  return pipe(yield* visit(searchRoot), A.sort(Order.String));
});

type TestTsgoPackageGroup = {
  readonly packageDir: string;
  readonly tsconfigPath: string;
  readonly files: ReadonlyArray<string>;
};

type TestTsgoPackageResult = {
  readonly group: TestTsgoPackageGroup;
  readonly output: string;
  readonly exitCode: number;
  readonly syntheticConfigPath: string;
};

const tsgoTestPackageLabel = (repoRoot: string, packageDir: string): string =>
  pipe(packageDir, Str.replace(`${repoRoot}/`, ""), Str.replaceAll("/", "-"), Str.replaceAll("@", ""));

const findOwningPackageDir = Effect.fn("QualityScriptCommands.findOwningPackageDir")(function* (
  repoRoot: string,
  filePath: string
): Effect.fn.Return<string, QualityScriptCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  let current = path.dirname(filePath);

  while (current !== repoRoot && Str.startsWith(repoRoot)(current)) {
    const packageJsonPath = path.join(current, "package.json");
    const hasPackageJson = yield* fs.exists(packageJsonPath).pipe(Effect.orElseSucceed(thunkFalse));

    if (hasPackageJson) {
      return current;
    }

    current = path.dirname(current);
  }

  return repoRoot;
});

const resolveTestTsconfigPath = Effect.fn("QualityScriptCommands.resolveTestTsconfigPath")(function* (
  packageDir: string
): Effect.fn.Return<string, never, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const candidates = [
    path.join(packageDir, "tsconfig.test.json"),
    path.join(packageDir, "test", "tsconfig.json"),
    path.join(packageDir, "tsconfig.json"),
  ];

  for (const candidate of candidates) {
    const exists = yield* fs.exists(candidate).pipe(Effect.orElseSucceed(thunkFalse));

    if (exists) {
      return candidate;
    }
  }

  return path.join(packageDir, "tsconfig.json");
});

const collectTestTsgoPackageGroups = Effect.fn("QualityScriptCommands.collectTestTsgoPackageGroups")(function* (
  repoRoot: string,
  discoveredFiles: ReadonlyArray<string>
): Effect.fn.Return<ReadonlyArray<TestTsgoPackageGroup>, QualityScriptCommandError, FileSystem.FileSystem | Path.Path> {
  const fileEntries = yield* Effect.forEach(
    discoveredFiles,
    Effect.fnUntraced(function* (filePath) {
      const packageDir = yield* findOwningPackageDir(repoRoot, filePath);
      return [packageDir, filePath] as const;
    }),
    { concurrency: 1 }
  );
  const packageDirs = pipe(
    fileEntries,
    A.map(([packageDir]) => packageDir),
    A.dedupe,
    A.sort(Order.String)
  );

  return yield* Effect.forEach(
    packageDirs,
    Effect.fnUntraced(function* (packageDir) {
      const tsconfigPath = yield* resolveTestTsconfigPath(packageDir);
      const files = pipe(
        fileEntries,
        A.filter(([entryPackageDir]) => entryPackageDir === packageDir),
        A.map(([, filePath]) => filePath),
        A.sort(Order.String)
      );
      return {
        packageDir,
        tsconfigPath,
        files,
      } satisfies TestTsgoPackageGroup;
    }),
    { concurrency: 1 }
  );
});

const runTestTsgoPackageGroup = Effect.fn("QualityScriptCommands.runTestTsgoPackageGroup")(function* (
  repoRoot: string,
  tempDir: string,
  extraArgs: ReadonlyArray<string>,
  group: TestTsgoPackageGroup
): Effect.fn.Return<
  TestTsgoPackageResult,
  QualityScriptCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const groupLabel = tsgoTestPackageLabel(repoRoot, group.packageDir);
  const syntheticConfigPath = path.join(tempDir, `${groupLabel}.tsconfig.json`);
  const syntheticConfig = {
    extends: group.tsconfigPath,
    references: [],
    include: group.files,
    exclude: [],
    compilerOptions: {
      composite: false,
      declaration: false,
      declarationMap: false,
      emitDeclarationOnly: false,
      incremental: false,
      noEmit: true,
      rootDir: repoRoot,
      sourceMap: false,
      tsBuildInfoFile: path.join(tempDir, `${groupLabel}.tsbuildinfo`),
      types: ["node", "bun"],
    },
  };
  const configText = yield* jsonStringifyPretty(syntheticConfig).pipe(
    Effect.mapError((cause) =>
      QualityScriptCommandError.make({
        message: `Failed to encode ${groupLabel} test tsconfig.`,
        cause,
      })
    )
  );

  yield* fs.writeFileString(syntheticConfigPath, `${configText}\n`).pipe(
    Effect.mapError((cause) =>
      QualityScriptCommandError.make({
        message: `Failed to write ${syntheticConfigPath}.`,
        cause,
      })
    )
  );

  const result = yield* collectOutput(
    QualityTaskStep.make({
      label: `check:tsgo:tests:${groupLabel}`,
      command: path.join(repoRoot, "node_modules", ".bin", "tsgo"),
      args: ["-p", syntheticConfigPath, "--pretty", "false", ...extraArgs],
      cwd: repoRoot,
    })
  ).pipe(Effect.ensuring(fs.remove(syntheticConfigPath).pipe(Effect.ignore)));

  return {
    group,
    output: result.output,
    exitCode: result.exitCode,
    syntheticConfigPath,
  };
});

/**
 * Collect Effect tsgo diagnostics from command output regardless of process exit code.
 *
 * @param results - Completed tsgo command outputs to scan.
 * @returns Matching Effect diagnostic output lines.
 * @example
 * ```ts
 * import { collectEffectTsgoDiagnosticLines } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const diagnostics = collectEffectTsgoDiagnosticLines([{ output: "warning TS90001: effect(service)\\n" }])
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const collectEffectTsgoDiagnosticLines: (results: ReadonlyArray<TsgoDiagnosticOutput>) => ReadonlyArray<string> =
  flow(
    A.flatMap((result: TsgoDiagnosticOutput) =>
      pipe(
        Str.split(result.output, "\n"),
        A.filter((line) => effectTsgoDiagnosticPattern.test(line))
      )
    )
  );

const unknownRecordProperty = (value: unknown, key: string): O.Option<unknown> => {
  if (A.isArray(value)) {
    return O.none();
  }

  return pipe(
    decodeUnknownRecordOption(value),
    O.flatMap((record) => O.fromUndefinedOr(record[key]))
  );
};

const unknownRecordKeys = (value: unknown): ReadonlyArray<string> =>
  A.isArray(value)
    ? A.empty<string>()
    : pipe(
        decodeUnknownRecordOption(value),
        O.map((record) => pipe(R.keys(record), A.sort(Order.String))),
        O.getOrElse(A.empty<string>)
      );

const extractEffectTsgoDiagnosticsTableFragment = (readme: string): O.Option<string> => {
  const tableStart = readme.indexOf(effectTsgoDiagnosticsTableStartMarker);
  const tableEnd = readme.indexOf(effectTsgoDiagnosticsTableEndMarker);

  return tableStart === -1 || tableEnd === -1 || tableEnd <= tableStart
    ? O.none()
    : O.some(Str.slice(tableStart + effectTsgoDiagnosticsTableStartMarker.length, tableEnd)(readme));
};

const extractEffectTsgoRuleNameFromRow = (row: unknown): O.Option<string> =>
  pipe(
    decodeEffectTsgoRuleRowOption(row),
    O.flatMap((decodedRow) => A.head(decodedRow.td)),
    O.flatMap(decodeEffectTsgoRuleCellOption),
    O.map((cell) => cell.code)
  );

const extractEffectTsgoReadmeRuleNames = (readme: string): ReadonlyArray<string> =>
  pipe(
    extractEffectTsgoDiagnosticsTableFragment(readme),
    O.map((fragment) => effectTsgoReadmeParser.parse(`<root>${fragment}</root>`) as unknown),
    O.flatMap(decodeEffectTsgoDiagnosticsTableOption),
    O.map((decoded) =>
      pipe(
        decoded.root.table.tbody.tr,
        A.flatMap((row) =>
          pipe(
            extractEffectTsgoRuleNameFromRow(row),
            O.match({
              onNone: A.empty<string>,
              onSome: A.of,
            })
          )
        ),
        A.dedupe,
        A.sort(Order.String)
      )
    ),
    O.getOrElse(A.empty<string>)
  );

const findEffectLanguageServicePlugin = (config: unknown): O.Option<Readonly<Record<string, unknown>>> =>
  pipe(
    unknownRecordProperty(config, "compilerOptions"),
    O.flatMap((compilerOptions) => unknownRecordProperty(compilerOptions, "plugins")),
    O.flatMap(decodeUnknownArrayOption),
    O.flatMap(
      A.findFirst((plugin) =>
        pipe(
          unknownRecordProperty(plugin, "name"),
          O.exists((name) => name === "@effect/language-service")
        )
      )
    ),
    O.flatMap(decodeUnknownRecordOption)
  );

const collectDisabledDiagnosticSeverityEntries = (
  value: unknown,
  propertyPath: ReadonlyArray<string>
): ReadonlyArray<string> => {
  if (A.isArray(value)) {
    return pipe(
      value,
      A.flatMap((entry, index) =>
        collectDisabledDiagnosticSeverityEntries(entry, pipe(propertyPath, A.append(`[${index}]`)))
      )
    );
  }

  const record = decodeUnknownRecordOption(value);
  if (O.isNone(record)) {
    return A.empty<string>();
  }

  return pipe(
    unknownRecordKeys(value),
    A.flatMap((key) => {
      const entryPath = pipe(propertyPath, A.append(key));
      const nested = record.value[key];
      const disabledAtThisProperty =
        key === "diagnosticSeverity"
          ? pipe(
              unknownRecordKeys(nested),
              A.flatMap((ruleName) =>
                pipe(
                  unknownRecordProperty(nested, ruleName),
                  O.filter((severity) => severity === "off"),
                  O.match({
                    onNone: A.empty<string>,
                    onSome: () => A.of(`${A.join(entryPath, ".")}.${ruleName}`),
                  })
                )
              )
            )
          : A.empty<string>();

      return A.appendAll(disabledAtThisProperty, collectDisabledDiagnosticSeverityEntries(nested, entryPath));
    })
  );
};

const renderTsgoRuleDiagnostics = (label: string, diagnostics: ReadonlyArray<string>): ReadonlyArray<string> =>
  A.isReadonlyArrayNonEmpty(diagnostics)
    ? [`${label}:`, ...A.map(diagnostics, (diagnostic) => `  - ${diagnostic}`)]
    : [];

/**
 * Check that the root tsgo Effect diagnostics configuration enables every installed rule as an error.
 *
 * @returns Effect that fails when tsgo rules drift or local source suppresses Effect diagnostics.
 * @example
 * ```ts
 * import { runTsgoRulesCheck } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const program = runTsgoRulesCheck()
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runTsgoRulesCheck = Effect.fn("QualityScriptCommands.runTsgoRulesCheck")(function* (): Effect.fn.Return<
  void,
  QualityScriptCommandError,
  QualityScriptEnvironment
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError((cause) => QualityScriptCommandError.make({ message: "Failed to locate repository root.", cause }))
  );
  const readmePath = path.join(repoRoot, "node_modules", "@effect", "tsgo", "README.md");
  const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
  const readmeText = yield* fs
    .readFileString(readmePath)
    .pipe(
      Effect.mapError((cause) => QualityScriptCommandError.make({ message: `Failed to read ${readmePath}.`, cause }))
    );
  const installedRuleNames = extractEffectTsgoReadmeRuleNames(readmeText);

  if (A.isReadonlyArrayEmpty(installedRuleNames)) {
    return yield* QualityScriptCommandError.make({
      message: "Failed to discover @effect/tsgo diagnostic rules from the installed README.",
      exitCode: 1,
    });
  }

  const configText = yield* fs
    .readFileString(tsconfigPath)
    .pipe(
      Effect.mapError((cause) => QualityScriptCommandError.make({ message: `Failed to read ${tsconfigPath}.`, cause }))
    );
  const parseErrors: Array<ParseError> = [];
  const config = parse(configText, parseErrors, {
    allowTrailingComma: true,
    disallowComments: false,
  });

  if (A.isReadonlyArrayNonEmpty(parseErrors)) {
    yield* Console.error("[check:tsgo-rules] failed to parse tsconfig.base.json");
    yield* Console.error(
      A.join(
        A.map(parseErrors, (error) => `parse error ${error.error} at offset ${error.offset}`),
        "\n"
      )
    );
    return yield* QualityScriptCommandError.make({ message: "tsconfig.base.json is not valid JSONC.", exitCode: 1 });
  }

  const plugin = findEffectLanguageServicePlugin(config);
  if (O.isNone(plugin)) {
    return yield* QualityScriptCommandError.make({
      message: "tsconfig.base.json is missing the @effect/language-service plugin.",
      exitCode: 1,
    });
  }

  const diagnosticSeverity = pipe(
    unknownRecordProperty(plugin.value, "diagnosticSeverity"),
    O.flatMap(decodeUnknownRecordOption)
  );
  if (O.isNone(diagnosticSeverity)) {
    return yield* QualityScriptCommandError.make({
      message: "tsconfig.base.json is missing the root @effect/language-service diagnosticSeverity map.",
      exitCode: 1,
    });
  }

  const configuredRuleNames = pipe(R.keys(diagnosticSeverity.value), A.sort(Order.String));
  const missingRuleNames = A.filter(installedRuleNames, (ruleName) => !A.contains(configuredRuleNames, ruleName));
  const extraRuleNames = A.filter(configuredRuleNames, (ruleName) => !A.contains(installedRuleNames, ruleName));
  const nonErrorSeverities = pipe(
    configuredRuleNames,
    A.flatMap((ruleName) =>
      diagnosticSeverity.value[ruleName] === "error"
        ? A.empty<string>()
        : A.of(`${ruleName}: ${String(diagnosticSeverity.value[ruleName])}`)
    )
  );
  const disabledSeverityEntries = collectDisabledDiagnosticSeverityEntries(plugin.value, [
    "compilerOptions",
    "plugins",
    "@effect/language-service",
  ]);
  const scannedFiles = yield* Effect.forEach(
    effectDiagnosticsDirectiveScannedRoots,
    (root) =>
      collectFiles(
        path.join(repoRoot, root),
        (_normalized, name) =>
          A.contains(effectDiagnosticsDirectiveScannedExtensions as ReadonlyArray<string>, path.extname(name)),
        (_normalized, name) =>
          A.contains(effectDiagnosticsDirectiveIgnoredDirectoryNames as ReadonlyArray<string>, name)
      ),
    { concurrency: 1 }
  ).pipe(Effect.map(A.flatten));
  const disabledDirectives = yield* Effect.forEach(
    scannedFiles,
    Effect.fn(function* (filePath) {
      const text = yield* fs
        .readFileString(filePath)
        .pipe(
          Effect.mapError((cause) => QualityScriptCommandError.make({ message: `Failed to read ${filePath}.`, cause }))
        );
      return pipe(
        Str.split(text, "\n"),
        A.flatMap((line, index) =>
          effectDiagnosticsOffDirectivePattern.test(line)
            ? A.of(`${normalizePath(path.relative(repoRoot, filePath))}:${index + 1}`)
            : A.empty<string>()
        )
      );
    }),
    { concurrency: 8 }
  ).pipe(Effect.map(A.flatten));
  const diagnostics = [
    ...renderTsgoRuleDiagnostics("missing installed rules", missingRuleNames),
    ...renderTsgoRuleDiagnostics("unexpected configured rules", extraRuleNames),
    ...renderTsgoRuleDiagnostics("rules not configured as error", nonErrorSeverities),
    ...renderTsgoRuleDiagnostics("diagnosticSeverity entries set to off", disabledSeverityEntries),
    ...renderTsgoRuleDiagnostics("disabled Effect diagnostic directives", disabledDirectives),
  ];

  if (A.isReadonlyArrayNonEmpty(diagnostics)) {
    yield* Console.error("[check:tsgo-rules] @effect/tsgo diagnostics are not globally enforced.");
    yield* Console.error(A.join(diagnostics, "\n"));
    return yield* QualityScriptCommandError.make({
      message: "@effect/tsgo rule enforcement drift found.",
      exitCode: 1,
    });
  }

  yield* Console.log(
    `[check:tsgo-rules] verified ${A.length(installedRuleNames)} installed @effect/tsgo rule(s) are configured as error`
  );
});

const runTsgoWithSyntheticConfig = Effect.fn("QualityScriptCommands.runTsgoWithSyntheticConfig")(function* (
  repoRoot: string,
  label: string,
  discoveredFiles: ReadonlyArray<string>,
  configName: string,
  baseTsconfig: string,
  extraCompilerOptions: Record<string, unknown>,
  extraArgs: unknown
): Effect.fn.Return<
  void,
  QualityScriptCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const tempDir = path.join(repoRoot, "node_modules", ".tmp", label);
  const syntheticConfigPath = path.join(tempDir, configName);
  const normalizedExtraArgs = normalizeExtraArgs(extraArgs);
  const syntheticConfig = {
    extends: path.join(repoRoot, baseTsconfig),
    references: [],
    include: discoveredFiles,
    exclude: [],
    compilerOptions: {
      composite: false,
      incremental: false,
      noEmit: true,
      rootDir: repoRoot,
      ...extraCompilerOptions,
    },
  };
  const configText = yield* jsonStringifyPretty(syntheticConfig).pipe(
    Effect.mapError((cause) =>
      QualityScriptCommandError.make({
        message: `Failed to encode ${label} synthetic tsconfig.`,
        cause,
      })
    )
  );

  yield* fs.makeDirectory(tempDir, { recursive: true }).pipe(
    Effect.mapError((cause) =>
      QualityScriptCommandError.make({
        message: `Failed to create ${tempDir}.`,
        cause,
      })
    )
  );
  yield* fs.writeFileString(syntheticConfigPath, `${configText}\n`).pipe(
    Effect.mapError((cause) =>
      QualityScriptCommandError.make({
        message: `Failed to write ${syntheticConfigPath}.`,
        cause,
      })
    )
  );

  yield* runFixedStep(repoRoot, label, path.join(repoRoot, "node_modules", ".bin", "tsgo"), [
    "-p",
    syntheticConfigPath,
    ...normalizedExtraArgs,
  ]).pipe(Effect.ensuring(fs.remove(syntheticConfigPath, { recursive: false }).pipe(Effect.ignore)));
});

/**
 * Run repo-wide tsgo diagnostics for dtslint files.
 *
 * @param extraArgs - Additional arguments passed to tsgo.
 * @returns Effect that runs the dtslint tsgo lane.
 * @example
 * ```ts
 * import { runDtslintTsgoChecks } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const program = runDtslintTsgoChecks([])
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runDtslintTsgoChecks = Effect.fn("QualityScriptCommands.runDtslintTsgoChecks")(function* (
  extraArgs: ReadonlyArray<string>
): Effect.fn.Return<void, QualityScriptCommandError, QualityScriptEnvironment> {
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError((cause) => QualityScriptCommandError.make({ message: "Failed to locate repository root.", cause }))
  );
  const discoveredFiles = yield* Effect.forEach(
    dtslintSearchRoots,
    (root) =>
      collectFiles(
        path.join(repoRoot, root),
        (normalized, name) => Str.includes("/dtslint/")(normalized) && /\.tst\.[^.]+$/u.test(name),
        thunkFalse
      ),
    { concurrency: 1 }
  ).pipe(Effect.map(A.flatten));

  if (A.isReadonlyArrayEmpty(discoveredFiles)) {
    yield* Console.log("[check:dtslint:tsgo] no dtslint files found");
    return;
  }

  yield* Console.log(`[check:dtslint:tsgo] checking ${A.length(discoveredFiles)} file(s) with tsconfig.dtslint.json`);
  yield* runTsgoWithSyntheticConfig(
    repoRoot,
    "check:dtslint:tsgo",
    discoveredFiles,
    "dtslint.tsconfig.json",
    "tsconfig.dtslint.json",
    {},
    extraArgs
  );
});

/**
 * Run repo-wide Effect diagnostics for test files.
 *
 * @param extraArgs - Additional arguments passed to tsgo.
 * @returns Effect that runs the test-file tsgo lane.
 * @example
 * ```ts
 * import { runTestTsgoChecks } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const program = runTestTsgoChecks([])
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runTestTsgoChecks = Effect.fn("QualityScriptCommands.runTestTsgoChecks")(function* (
  extraArgs: unknown
): Effect.fn.Return<void, QualityScriptCommandError, QualityScriptEnvironment> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError((cause) => QualityScriptCommandError.make({ message: "Failed to locate repository root.", cause }))
  );
  const discoveredFiles = yield* Effect.forEach(
    testSearchRoots,
    (root) =>
      collectFiles(
        path.join(repoRoot, root),
        (normalized, name) =>
          Str.includes("/test/")(normalized) &&
          !pathContainsSegment(normalized, ignoredTestPathSegments) &&
          /\.(?:cts|mts|ts|tsx)$/u.test(name),
        (normalized, name) =>
          A.contains(ignoredTestDirectoryNames as ReadonlyArray<string>, name) ||
          pathContainsSegment(normalized, ignoredTestPathSegments)
      ),
    { concurrency: 1 }
  ).pipe(Effect.map(A.flatten));

  if (A.isReadonlyArrayEmpty(discoveredFiles)) {
    yield* Console.log("[check:tsgo:tests] no test files found");
    return;
  }

  const tempDir = path.join(repoRoot, "node_modules", ".tmp", "tsgo-test-checks");
  const normalizedExtraArgs = normalizeExtraArgs(extraArgs);
  const packageGroups = yield* collectTestTsgoPackageGroups(repoRoot, discoveredFiles);

  yield* fs
    .makeDirectory(tempDir, { recursive: true })
    .pipe(
      Effect.mapError((cause) => QualityScriptCommandError.make({ message: `Failed to create ${tempDir}.`, cause }))
    );

  yield* Console.log(
    `[check:tsgo:tests] checking ${A.length(discoveredFiles)} file(s) across ${A.length(packageGroups)} package(s)`
  );
  const results = yield* Effect.forEach(
    packageGroups,
    (group) => runTestTsgoPackageGroup(repoRoot, tempDir, normalizedExtraArgs, group),
    { concurrency: 1 }
  ).pipe(Effect.ensuring(fs.remove(tempDir, { recursive: true, force: true }).pipe(Effect.ignore)));
  const failures = A.filter(results, (result) => result.exitCode !== 0);
  const effectDiagnosticLines = collectEffectTsgoDiagnosticLines(results);

  if (A.isReadonlyArrayNonEmpty(effectDiagnosticLines)) {
    yield* Console.error(
      `[check:tsgo:tests] found ${A.length(effectDiagnosticLines)} Effect diagnostic(s) in test files`
    );
    yield* Console.error(A.join(effectDiagnosticLines, "\n"));
  }

  if (A.isReadonlyArrayNonEmpty(failures)) {
    for (const failure of failures) {
      const packageName = tsgoTestPackageLabel(repoRoot, failure.group.packageDir);
      const configName = pipe(failure.group.tsconfigPath, Str.replace(`${failure.group.packageDir}/`, ""));
      yield* Console.error(`[check:tsgo:tests] ${packageName} failed with ${configName}`);
      if (Str.isNonEmpty(failure.output)) {
        yield* Console.error(failure.output);
      }
    }
  }

  if (A.isReadonlyArrayNonEmpty(effectDiagnosticLines) || A.isReadonlyArrayNonEmpty(failures)) {
    return yield* withExitCode(
      "check:tsgo:tests",
      path.join(repoRoot, "node_modules", ".bin", "tsgo"),
      ["-p", "<package-test-tsconfig>"],
      1
    );
  }
});

/**
 * Verify that tsgo reports the Effect diagnostic expected by this repo.
 *
 * @returns Effect that performs the smoke check.
 * @example
 * ```ts
 * import { runTsgoSmokeCheck } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const program = runTsgoSmokeCheck()
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runTsgoSmokeCheck = Effect.fn("QualityScriptCommands.runTsgoSmokeCheck")(function* (): Effect.fn.Return<
  void,
  QualityScriptCommandError,
  QualityScriptEnvironment
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError((cause) => QualityScriptCommandError.make({ message: "Failed to locate repository root.", cause }))
  );
  const tempRoot = path.join(repoRoot, "node_modules", ".tmp");
  const smokeDir = yield* fs
    .makeTempDirectory({ directory: tempRoot })
    .pipe(
      Effect.mapError((cause) => QualityScriptCommandError.make({ message: "Failed to create tsgo smoke dir.", cause }))
    );
  const srcDir = path.join(smokeDir, "src");
  const tsconfigPath = path.join(smokeDir, "tsconfig.json");
  const sourcePath = path.join(srcDir, "index.ts");
  const tsgoPath = path.join(repoRoot, "node_modules", ".bin", "tsgo");

  yield* fs
    .makeDirectory(srcDir, { recursive: true })
    .pipe(
      Effect.mapError((cause) => QualityScriptCommandError.make({ message: `Failed to create ${srcDir}.`, cause }))
    );
  yield* fs
    .writeFileString(
      sourcePath,
      A.join(
        [
          'import { Effect } from "effect";',
          "",
          "export const shouldHaveSuggestion = () => {",
          "  return Effect.gen(function* () {",
          "    yield* Effect.succeed(1);",
          "    return 42;",
          "  });",
          "};",
          "",
        ],
        "\n"
      )
    )
    .pipe(
      Effect.mapError((cause) => QualityScriptCommandError.make({ message: `Failed to write ${sourcePath}.`, cause }))
    );
  const configText = yield* jsonStringifyPretty({
    extends: path.join(repoRoot, "tsconfig.base.json"),
    include: ["src/**/*.ts"],
    exclude: [],
    compilerOptions: {
      composite: false,
      incremental: false,
      noEmit: true,
    },
  }).pipe(
    Effect.mapError((cause) => QualityScriptCommandError.make({ message: "Failed to encode smoke config.", cause }))
  );

  yield* fs
    .writeFileString(tsconfigPath, `${configText}\n`)
    .pipe(
      Effect.mapError((cause) => QualityScriptCommandError.make({ message: `Failed to write ${tsconfigPath}.`, cause }))
    );
  const result = yield* collectOutput(
    QualityTaskStep.make({
      label: "check:tsgo:smoke",
      command: tsgoPath,
      args: ["-p", tsconfigPath, "--pretty", "false"],
      cwd: repoRoot,
    })
  ).pipe(Effect.ensuring(fs.remove(smokeDir, { recursive: true }).pipe(Effect.ignore)));

  if (result.exitCode === 0) {
    yield* Console.error("[check:tsgo:smoke] expected tsgo to fail on effectFnOpportunity but it exited successfully");
    if (Str.isNonEmpty(result.output)) {
      yield* Console.error(result.output);
    }
    return yield* QualityScriptCommandError.make({ message: "tsgo smoke check unexpectedly passed.", exitCode: 1 });
  }

  if (!Str.includes("effect(effectFnOpportunity)")(result.output)) {
    yield* Console.error(
      "[check:tsgo:smoke] tsgo failed, but did not report the expected effectFnOpportunity diagnostic"
    );
    if (Str.isNonEmpty(result.output)) {
      yield* Console.error(result.output);
    }
    return yield* QualityScriptCommandError.make({
      message: "tsgo smoke check did not report effectFnOpportunity.",
      exitCode: 1,
    });
  }

  yield* Console.log("[check:tsgo:smoke] verified tsgo CLI reports effectFnOpportunity under the repo base config");
});

/**
 * Verify tracked fileoverview comments do not use the legacy `@module` tag.
 *
 * @returns Effect that performs the module-tag lint.
 * @example
 * ```ts
 * import { runJSDocModuleTagsCheck } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const program = runJSDocModuleTagsCheck()
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runJSDocModuleTagsCheck = Effect.fn("QualityScriptCommands.runJSDocModuleTagsCheck")(
  function* (): Effect.fn.Return<void, QualityScriptCommandError, QualityScriptEnvironment> {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const repoRoot = yield* findRepoRoot().pipe(
      Effect.mapError((cause) =>
        QualityScriptCommandError.make({ message: "Failed to locate repository root.", cause })
      )
    );
    const result = yield* collectOutput(
      QualityTaskStep.make({
        label: "lint:jsdoc-module-tags:git-ls-files",
        command: "git",
        args: ["ls-files"],
        cwd: repoRoot,
      })
    );

    if (result.exitCode !== 0) {
      yield* Console.error("[check:jsdoc-module-tags] failed to list tracked files with git ls-files");
      if (Str.isNonEmpty(result.output)) {
        yield* Console.error(result.output);
      }
      return yield* withExitCode("lint:jsdoc-module-tags", "git", ["ls-files"], result.exitCode);
    }

    const isScannedPath = (filePath: string): boolean =>
      A.some(moduleTagScannedRoots, (root) => filePath === root || Str.startsWith(`${root}/`)(filePath)) &&
      A.contains(moduleTagScannedExtensions as ReadonlyArray<string>, path.extname(filePath));
    const violations = yield* Effect.forEach(
      pipe(Str.split(result.output, "\n"), A.filter(Str.isNonEmpty), A.filter(isScannedPath)),
      Effect.fn(function* (filePath) {
        const absolutePath = path.join(repoRoot, filePath);
        const exists = yield* fs.exists(absolutePath).pipe(Effect.orElseSucceed(thunkFalse));
        if (!exists) {
          return A.empty<string>();
        }

        const text = yield* fs
          .readFileString(absolutePath)
          .pipe(
            Effect.mapError((cause) =>
              QualityScriptCommandError.make({ message: `Failed to read ${absolutePath}.`, cause })
            )
          );
        return pipe(
          Str.split(text, "\n"),
          A.flatMap((line, index) =>
            /^\s*\* @module\b.*$/u.test(line)
              ? A.of(`${filePath}:${index + 1}: replace @module with @packageDocumentation`)
              : A.empty<string>()
          )
        );
      }),
      { concurrency: 8 }
    ).pipe(Effect.map(A.flatten));

    if (A.isReadonlyArrayNonEmpty(violations)) {
      yield* Console.error("[check:jsdoc-module-tags] @module is not valid under the repo TSDoc policy.");
      yield* Console.error("[check:jsdoc-module-tags] Use @packageDocumentation for fileoverview JSDoc blocks.");
      yield* Console.error(A.join(violations, "\n"));
      return yield* QualityScriptCommandError.make({ message: "JSDoc module tag violations were found.", exitCode: 1 });
    }

    yield* Console.log("[check:jsdoc-module-tags] verified tracked fileoverview comments do not use @module");
  }
);

/**
 * Run the JSDoc inventory generator now owned by repo-cli.
 *
 * @returns Effect that writes the tracked inventory artifacts.
 * @example
 * ```ts
 * import { runJSDocInventory } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const program = runJSDocInventory()
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runJSDocInventory = Effect.fn("QualityScriptCommands.runJSDocInventory")(function* (): Effect.fn.Return<
  void,
  QualityScriptCommandError,
  FileSystem.FileSystem | ChildProcessSpawner.ChildProcessSpawner
> {
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError((cause) => QualityScriptCommandError.make({ message: "Failed to locate repository root.", cause }))
  );

  yield* runBun(repoRoot, "quality:jsdoc-inventory", ["--filter=@beep/repo-cli", "beep:jsdoc-inventory"]);
});

/**
 * Run the repo export catalog generator now owned by repo-cli.
 *
 * @param check - When `true`, fail if tracked catalog artifacts are stale; when `false`, refresh them.
 * @returns Effect that writes or checks the tracked export catalog artifacts.
 * @example
 * ```ts
 * import { runRepoExportsCatalog } from "@beep/repo-cli/commands/Quality/Quality.command"
 * const program = runRepoExportsCatalog(false)
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runRepoExportsCatalog = Effect.fn("QualityScriptCommands.runRepoExportsCatalog")(function* (
  check: boolean
): Effect.fn.Return<void, QualityScriptCommandError, FileSystem.FileSystem | ChildProcessSpawner.ChildProcessSpawner> {
  const repoRoot = yield* findRepoRoot().pipe(
    Effect.mapError((cause) => QualityScriptCommandError.make({ message: "Failed to locate repository root.", cause }))
  );

  const label = check ? "quality:repo-exports-catalog-check" : "quality:repo-exports-catalog";
  const script = check ? "beep:repo-exports-catalog:check" : "beep:repo-exports-catalog";

  yield* runBun(repoRoot, label, ["--filter=@beep/repo-cli", script]);
});

const runQualityProgram = <A, R>(
  effect: Effect.Effect<A, QualityScriptCommandError, R>
): Effect.Effect<void, QualityScriptCommandError, R> => effect.pipe(Effect.asVoid);

const githubChecksCommand = Command.make(
  "github-checks",
  {
    mode: Argument.choice("mode", GITHUB_CHECK_MODES).pipe(Argument.withDescription("GitHub check mode to run")),
  },
  ({ mode }) => runQualityProgram(runGithubChecks(mode))
).pipe(Command.withDescription("Run repository GitHub verification lanes"));

const bunAuditCommand = Command.make("bun-audit", {}, () =>
  runQualityProgram(
    findRepoRoot().pipe(
      Effect.mapError((cause) =>
        QualityScriptCommandError.make({ message: "Failed to locate repository root.", cause })
      ),
      Effect.flatMap(runBunAudit)
    )
  )
).pipe(Command.withDescription("Run Bun audit with OSV ignore config"));

const dtslintTsgoCommand = Command.make(
  "dtslint-tsgo",
  {
    args: Argument.string("args").pipe(Argument.variadic),
  },
  ({ args }) => runQualityProgram(runDtslintTsgoChecks(args as ReadonlyArray<string>))
).pipe(Command.withDescription("Run tsgo diagnostics for dtslint files"));

const testTsgoCommand = Command.make(
  "test-tsgo",
  {
    args: Argument.string("args").pipe(Argument.variadic),
  },
  ({ args }) => runQualityProgram(runTestTsgoChecks(args as ReadonlyArray<string>))
).pipe(Command.withDescription("Run Effect tsgo diagnostics for test files"));

const tsgoSmokeCommand = Command.make("tsgo-smoke", {}, () => runQualityProgram(runTsgoSmokeCheck())).pipe(
  Command.withDescription("Smoke test the repo tsgo Effect diagnostics")
);

const tsgoRulesCommand = Command.make("tsgo-rules", {}, () => runQualityProgram(runTsgoRulesCheck())).pipe(
  Command.withDescription("Check root @effect/tsgo diagnostic severities")
);

const jsdocModuleTagsCommand = Command.make("jsdoc-module-tags", {}, () =>
  runQualityProgram(runJSDocModuleTagsCheck())
).pipe(Command.withDescription("Check for forbidden @module fileoverview tags"));

const jsdocInventoryCommand = Command.make("jsdoc-inventory", {}, () => runQualityProgram(runJSDocInventory())).pipe(
  Command.withDescription("Generate the tracked JSDoc documentation inventory")
);

const repoExportsCatalogCommand = Command.make(
  "repo-exports-catalog",
  {
    check: Flag.boolean("check").pipe(Flag.withDescription("Fail when the tracked repo export catalog is stale")),
  },
  ({ check }) => runQualityProgram(runRepoExportsCatalog(check))
).pipe(Command.withDescription("Generate or check the tracked repo export catalog"));

const changesetGraphCommand = Command.make("changeset-graph", {}, () =>
  runQualityProgram(
    findRepoRoot().pipe(
      Effect.mapError((cause) =>
        QualityScriptCommandError.make({ message: "Failed to locate repository root.", cause })
      ),
      Effect.flatMap((repoRoot) =>
        runChangesetGraphCheck(repoRoot).pipe(
          Effect.mapError((error) =>
            QualityScriptCommandError.make({
              message: error.message,
              command: "bun run beep quality changeset-graph",
              exitCode: 1,
              cause: error,
            })
          )
        )
      )
    )
  )
).pipe(Command.withDescription("Validate changesets against the current workspace package graph"));

/**
 * Quality command group for repo operational checks.
 *
 * @example
 * ```ts
 * console.log("qualityCommand")
 * ```
 * @category cli-commands
 * @since 0.0.0
 */
export const qualityCommand = Command.make("quality", {}, () =>
  printLines([
    "Quality commands:",
    "- bun run beep quality github-checks quality",
    "- bun run beep quality github-checks repo-sanity",
    "- bun run beep quality bun-audit",
    "- bun run beep quality dtslint-tsgo",
    "- bun run beep quality test-tsgo",
    "- bun run beep quality tsgo-smoke",
    "- bun run beep quality tsgo-rules",
    "- bun run beep quality jsdoc-module-tags",
    "- bun run beep quality jsdoc-inventory",
    "- bun run beep quality repo-exports-catalog",
    "- bun run beep quality changeset-graph",
  ])
).pipe(
  Command.withDescription("Repository operational quality commands"),
  Command.withSubcommands([
    githubChecksCommand,
    bunAuditCommand,
    dtslintTsgoCommand,
    testTsgoCommand,
    tsgoSmokeCommand,
    tsgoRulesCommand,
    jsdocModuleTagsCommand,
    jsdocInventoryCommand,
    repoExportsCatalogCommand,
    changesetGraphCommand,
  ])
);
