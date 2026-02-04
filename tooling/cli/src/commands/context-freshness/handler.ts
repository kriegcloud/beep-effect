/**
 * @file Context-Freshness Command Handler
 *
 * Main handler for the context-freshness command. Orchestrates:
 * - Scanning .repos/effect/ for git commit date
 * - Scanning context/ files for mtimes
 * - Scanning .claude/skills/SKILL.md files for mtimes
 * - Computing staleness against configurable thresholds
 * - Formatting output as table or JSON
 *
 * @module context-freshness/handler
 * @since 1.0.0
 */

import * as Command from "@effect/platform/Command";
import * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as FileSystem from "@effect/platform/FileSystem";
import type { PlatformError } from "@effect/platform/Error";
import * as A from "effect/Array";
import * as Clock from "effect/Clock";
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import color from "picocolors";
import { DirectoryNotFoundError, type FreshnessCheckError, GitCommandError } from "./errors.js";
import {
  DEFAULT_THRESHOLDS,
  type FreshnessCheckInput,
  type FreshnessItem,
  type FreshnessReport,
  type FreshnessStatus,
  type FreshnessSummary,
  type ItemCategory,
} from "./schemas.js";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const EFFECT_REPO_PATH = ".repos/effect";
const CONTEXT_EFFECT_PATH = "context/effect";
const CONTEXT_PLATFORM_PATH = "context/platform";
const SKILLS_PATH = ".claude/skills";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/**
 * Calculate age in days from a timestamp relative to now.
 */
const calculateAgeInDays = (timestampMs: number, nowMs: number): number => {
  const diff = nowMs - timestampMs;
  return Math.floor(diff / MS_PER_DAY);
};

/**
 * Determine status based on age and category thresholds.
 */
const determineStatus = (ageInDays: number, category: ItemCategory): FreshnessStatus => {
  const thresholds = DEFAULT_THRESHOLDS[category];
  if (ageInDays >= thresholds.critical) {
    return "critical";
  }
  if (ageInDays >= thresholds.warning) {
    return "warning";
  }
  return "fresh";
};

/**
 * Order for FreshnessItem by age (descending - oldest first).
 */
const itemsByAgeDesc: Order.Order<FreshnessItem> = F.pipe(
  Order.number,
  Order.mapInput((item: FreshnessItem) => item.ageInDays),
  Order.reverse
);

// -----------------------------------------------------------------------------
// Git Operations
// -----------------------------------------------------------------------------

/**
 * Get the last commit date from a git repository using Command.string.
 */
const getGitLastCommitDate = (
  repoPath: string
): Effect.Effect<number, GitCommandError | DirectoryNotFoundError | PlatformError, FileSystem.FileSystem | CommandExecutor.CommandExecutor> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const exists = yield* fs.exists(repoPath);
    if (!exists) {
      return yield* Effect.fail(
        new DirectoryNotFoundError({
          path: repoPath,
          message: `Git repository not found: ${repoPath}`,
        })
      );
    }

    const command = F.pipe(
      Command.make("git", "log", "-1", "--format=%ci"),
      Command.workingDirectory(repoPath)
    );

    const result = yield* F.pipe(
      Command.string(command),
      Effect.mapError(
        (err) =>
          new GitCommandError({
            command: "git log -1 --format=%ci",
            message: `Failed to execute git command in ${repoPath}: ${String(err)}`,
          })
      )
    );

    const dateStr = F.pipe(result, Str.trim);
    const parsed = DateTime.make(dateStr);

    return yield* F.pipe(
      parsed,
      O.match({
        onNone: () =>
          Effect.fail(
            new GitCommandError({
              command: "git log -1 --format=%ci",
              message: `Invalid date from git: ${dateStr}`,
            })
          ),
        onSome: (dt) => Effect.succeed(DateTime.toEpochMillis(dt)),
      })
    );
  });

// -----------------------------------------------------------------------------
// File Scanning
// -----------------------------------------------------------------------------

/**
 * Get all files in a directory recursively.
 */
const getFilesRecursive = (
  dirPath: string
): Effect.Effect<ReadonlyArray<string>, PlatformError | DirectoryNotFoundError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const exists = yield* fs.exists(dirPath);
    if (!exists) {
      return yield* Effect.fail(
        new DirectoryNotFoundError({
          path: dirPath,
          message: `Directory not found: ${dirPath}`,
        })
      );
    }

    const entries = yield* fs.readDirectory(dirPath);

    const results = yield* Effect.all(
      F.pipe(
        entries,
        A.map((entry) =>
          Effect.gen(function* () {
            const fullPath = `${dirPath}/${entry}`;
            const stat = yield* fs.stat(fullPath);

            if (stat.type === "Directory") {
              return yield* getFilesRecursive(fullPath);
            }
            if (stat.type === "File") {
              return [fullPath] as ReadonlyArray<string>;
            }
            return [] as ReadonlyArray<string>;
          })
        )
      ),
      { concurrency: "unbounded" }
    );

    return A.flatten(results);
  });

/**
 * Get file modification time in milliseconds.
 * Returns Option.none if mtime is not available.
 */
const getFileMtimeMs = (
  filePath: string
): Effect.Effect<O.Option<number>, PlatformError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const stat = yield* fs.stat(filePath);
    return F.pipe(
      stat.mtime,
      O.map((date) => date.getTime())
    );
  });

/**
 * Find the oldest file mtime in a directory.
 */
const getOldestFileMtime = (
  dirPath: string
): Effect.Effect<O.Option<{ path: string; mtimeMs: number }>, PlatformError | DirectoryNotFoundError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const files = yield* getFilesRecursive(dirPath);

    if (A.isEmptyReadonlyArray(files)) {
      return O.none();
    }

    const filesWithMtimes = yield* Effect.all(
      F.pipe(
        files,
        A.map((filePath) =>
          F.pipe(
            getFileMtimeMs(filePath),
            Effect.map((mtimeOpt) =>
              F.pipe(
                mtimeOpt,
                O.map((mtimeMs) => ({ path: filePath, mtimeMs }))
              )
            )
          )
        )
      ),
      { concurrency: "unbounded" }
    );

    // Filter out files without mtime and find oldest using functional reduce
    const validFiles = A.filterMap(filesWithMtimes, F.identity);

    return F.pipe(
      validFiles,
      A.reduce(O.none<{ path: string; mtimeMs: number }>(), (acc, curr) =>
        F.pipe(
          acc,
          O.match({
            onNone: () => O.some(curr),
            onSome: (prev) => (curr.mtimeMs < prev.mtimeMs ? O.some(curr) : O.some(prev)),
          })
        )
      )
    );
  });

// -----------------------------------------------------------------------------
// Skill Scanning
// -----------------------------------------------------------------------------

/**
 * Scan skills directory for SKILL.md files.
 */
const scanSkills = (
  skillsPath: string,
  nowMs: number
): Effect.Effect<ReadonlyArray<FreshnessItem>, PlatformError | DirectoryNotFoundError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const exists = yield* fs.exists(skillsPath);
    if (!exists) {
      return [];
    }

    const entries = yield* fs.readDirectory(skillsPath);

    const maybeItems = yield* Effect.all(
      F.pipe(
        entries,
        A.map((entry) =>
          Effect.gen(function* () {
            const skillDir = `${skillsPath}/${entry}`;
            const stat = yield* fs.stat(skillDir);

            if (stat.type !== "Directory") {
              return O.none<FreshnessItem>();
            }

            const skillMdPath = `${skillDir}/SKILL.md`;
            const skillExists = yield* fs.exists(skillMdPath);

            if (!skillExists) {
              return O.none<FreshnessItem>();
            }

            const skillStat = yield* fs.stat(skillMdPath);

            return F.pipe(
              skillStat.mtime,
              O.map((mtime) => {
                const mtimeMs = mtime.getTime();
                const ageInDays = calculateAgeInDays(mtimeMs, nowMs);
                const status = determineStatus(ageInDays, "skill");

                return {
                  path: skillMdPath,
                  category: "skill" as const,
                  lastModified: mtime.toISOString(),
                  ageInDays,
                  status,
                };
              })
            );
          })
        )
      ),
      { concurrency: "unbounded" }
    );

    return A.filterMap(maybeItems, F.identity);
  });

// -----------------------------------------------------------------------------
// Report Building
// -----------------------------------------------------------------------------

/**
 * Scan effect repository and create item.
 */
const scanEffectRepo = (
  repoPath: string,
  nowMs: number
): Effect.Effect<
  O.Option<FreshnessItem>,
  GitCommandError | DirectoryNotFoundError | PlatformError,
  FileSystem.FileSystem | CommandExecutor.CommandExecutor
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const exists = yield* fs.exists(repoPath);
    if (!exists) {
      return O.none();
    }

    const lastCommitMs = yield* getGitLastCommitDate(repoPath);
    const ageInDays = calculateAgeInDays(lastCommitMs, nowMs);
    const status = determineStatus(ageInDays, "effect-repo");

    return O.some<FreshnessItem>({
      path: repoPath,
      category: "effect-repo",
      lastModified: new Date(lastCommitMs).toISOString(),
      ageInDays,
      status,
    });
  }).pipe(Effect.catchTag("DirectoryNotFoundError", () => Effect.succeed(O.none())));

/**
 * Scan context directory and create item.
 */
const scanContextDir = (
  dirPath: string,
  nowMs: number
): Effect.Effect<O.Option<FreshnessItem>, PlatformError | DirectoryNotFoundError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const exists = yield* fs.exists(dirPath);
    if (!exists) {
      return O.none();
    }

    const oldest = yield* getOldestFileMtime(dirPath);

    return F.pipe(
      oldest,
      O.map(({ mtimeMs }) => {
        const ageInDays = calculateAgeInDays(mtimeMs, nowMs);
        const status = determineStatus(ageInDays, "context");

        return {
          path: dirPath,
          category: "context" as const,
          lastModified: new Date(mtimeMs).toISOString(),
          ageInDays,
          status,
        };
      })
    );
  }).pipe(Effect.catchTag("DirectoryNotFoundError", () => Effect.succeed(O.none())));

/**
 * Calculate summary from items using functional reduce.
 */
const calculateSummary = (items: ReadonlyArray<FreshnessItem>): FreshnessSummary =>
  F.pipe(
    items,
    A.reduce({ fresh: 0, warning: 0, critical: 0 }, (acc, item) =>
      F.pipe(
        Match.value(item.status),
        Match.when("fresh", () => ({ ...acc, fresh: acc.fresh + 1 })),
        Match.when("warning", () => ({ ...acc, warning: acc.warning + 1 })),
        Match.when("critical", () => ({ ...acc, critical: acc.critical + 1 })),
        Match.exhaustive
      )
    )
  );

// -----------------------------------------------------------------------------
// Formatting
// -----------------------------------------------------------------------------

/**
 * Pad string to width.
 */
const padEnd = (str: string, width: number): string => {
  const len = Str.length(str);
  if (len >= width) return Str.slice(0, width)(str);
  return str + " ".repeat(width - len);
};

const padStart = (str: string, width: number): string => {
  const len = Str.length(str);
  if (len >= width) return str;
  return " ".repeat(width - len) + str;
};

/**
 * Get color function for status using Match.
 */
const getStatusColor = (status: FreshnessStatus): ((s: string) => string) =>
  F.pipe(
    Match.value(status),
    Match.when("fresh", () => color.green),
    Match.when("warning", () => color.yellow),
    Match.when("critical", () => color.red),
    Match.exhaustive
  );

/**
 * Format report as ASCII table.
 */
const formatTable = (report: FreshnessReport): string => {
  const COL_PATH = 40;
  const COL_CATEGORY = 12;
  const COL_AGE = 10;
  const COL_STATUS = 10;
  const separator = "\u2500".repeat(COL_PATH + COL_CATEGORY + COL_AGE + COL_STATUS + 6);

  const headerLines = [
    color.cyan("Context Freshness Report"),
    color.cyan("========================"),
    `Scanned at: ${report.scannedAt}`,
    "",
    color.bold("Summary:"),
    `  ${color.green("Fresh")}: ${report.summary.fresh}`,
    `  ${color.yellow("Warning")}: ${report.summary.warning}`,
    `  ${color.red("Critical")}: ${report.summary.critical}`,
    "",
    color.bold(
      [
        padEnd("Path", COL_PATH),
        padEnd("Category", COL_CATEGORY),
        padStart("Age (days)", COL_AGE),
        padEnd("Status", COL_STATUS),
      ].join("  ")
    ),
    separator,
  ];

  const sortedItems = F.pipe(report.items, A.sort(itemsByAgeDesc));

  const itemLines = F.pipe(
    sortedItems,
    A.map((item) => {
      const statusColorFn = getStatusColor(item.status);
      return [
        padEnd(item.path, COL_PATH),
        padEnd(item.category, COL_CATEGORY),
        padStart(String(item.ageInDays), COL_AGE),
        statusColorFn(padEnd(item.status, COL_STATUS)),
      ].join("  ");
    })
  );

  const footerLines = report.hasCritical
    ? [separator, "", color.red(color.bold("WARNING: Critical staleness detected. Context sources need updating."))]
    : [separator];

  return A.join([...headerLines, ...itemLines, ...footerLines], "\n");
};

/**
 * Format report as JSON.
 */
const formatJson = (report: FreshnessReport): string => JSON.stringify(report, null, 2);

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/**
 * Main handler for the context-freshness command.
 *
 * Scans configured directories and git repositories for staleness,
 * compares against thresholds, and outputs a formatted report.
 *
 * @param input - Validated command input
 * @returns Effect that generates the report or fails with appropriate error
 *
 * @since 0.1.0
 * @category handlers
 */
export const contextFreshnessHandler = (
  input: FreshnessCheckInput
): Effect.Effect<
  boolean,
  FreshnessCheckError | PlatformError,
  FileSystem.FileSystem | CommandExecutor.CommandExecutor
> =>
  Effect.gen(function* () {
    // Use Clock service for testability
    const nowMs = yield* Clock.currentTimeMillis;
    const nowIso = new Date(Number(nowMs)).toISOString();

    // 1. Scan all sources in parallel
    const [effectRepoItem, contextEffectItem, contextPlatformItem, skillItems] = yield* Effect.all(
      [
        scanEffectRepo(EFFECT_REPO_PATH, Number(nowMs)).pipe(
          Effect.catchAll((err) =>
            Effect.gen(function* () {
              yield* Console.log(color.yellow(`Warning: Could not scan ${EFFECT_REPO_PATH}: ${err.message}`));
              return O.none<FreshnessItem>();
            })
          )
        ),
        scanContextDir(CONTEXT_EFFECT_PATH, Number(nowMs)).pipe(
          Effect.catchAll((err) =>
            Effect.gen(function* () {
              yield* Console.log(color.yellow(`Warning: Could not scan ${CONTEXT_EFFECT_PATH}: ${String(err)}`));
              return O.none<FreshnessItem>();
            })
          )
        ),
        scanContextDir(CONTEXT_PLATFORM_PATH, Number(nowMs)).pipe(
          Effect.catchAll((err) =>
            Effect.gen(function* () {
              yield* Console.log(color.yellow(`Warning: Could not scan ${CONTEXT_PLATFORM_PATH}: ${String(err)}`));
              return O.none<FreshnessItem>();
            })
          )
        ),
        scanSkills(SKILLS_PATH, Number(nowMs)).pipe(
          Effect.catchAll((err) =>
            Effect.gen(function* () {
              yield* Console.log(color.yellow(`Warning: Could not scan ${SKILLS_PATH}: ${String(err)}`));
              return [] as ReadonlyArray<FreshnessItem>;
            })
          )
        ),
      ],
      { concurrency: "unbounded" }
    );

    // 2. Combine all items using functional composition
    const items: ReadonlyArray<FreshnessItem> = F.pipe(
      [effectRepoItem, contextEffectItem, contextPlatformItem],
      A.filterMap(F.identity),
      A.appendAll(skillItems)
    );

    // 3. Calculate summary
    const summary = calculateSummary(items);
    const hasCritical = summary.critical > 0;

    // 4. Build report
    const report: FreshnessReport = {
      scannedAt: nowIso,
      summary,
      items: [...items],
      hasCritical,
    };

    // 5. Format and output
    const formatted = input.format === "json" ? formatJson(report) : formatTable(report);
    yield* Console.log(formatted);

    return hasCritical;
  }).pipe(Effect.withSpan("contextFreshnessHandler"));
