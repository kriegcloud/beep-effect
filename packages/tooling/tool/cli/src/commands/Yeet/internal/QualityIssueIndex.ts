/**
 * Schema-first quality issue index for yeet feedback packets.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Order } from "effect";
import * as A from "effect/Array";
import { dual, flow, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { optionalProp } from "../../../internal/cli/OptionRecord.js";
import { commandTextForStep, TurboWorkspacePackage, turboTaskForStep } from "../../../internal/repo-run/index.js";
import type {
  RepoPlanStep,
  RepoRunContext,
  RepoStepRunResult,
  TurboPlanTask,
} from "../../../internal/repo-run/index.js";

const $I = $RepoCliId.create("commands/Yeet/internal/QualityIssueIndex");

const MAX_RAW_EXCERPT_CHARS = 4 * 1024;
const KNOWN_SUB_LANE_TAIL_CHARS = 16 * 1024;
const schemaFirstPolicyIssuePrefix = "[schema-first:issue] ";
const ansiPattern = /\u001b\[[0-9;]*m/gu;
const tsDiagnosticPattern =
  /^(?<file>[^:\n]+):(?<line>\d+):(?<column>\d+)(?:\s+-)?\s+(?<severity>error|warning)\s+TS(?<code>\d+):\s+(?<message>.+)$/u;

/**
 * Classification domain for normalized yeet quality findings.
 *
 * @example
 * ```ts
 * import { QualityIssueCategory } from "@beep/repo-cli/commands/Yeet"
 *
 * console.log(QualityIssueCategory.is.typecheck("typecheck"))
 * ```
 * @category models
 * @since 0.0.0
 */
export const QualityIssueCategory = LiteralKit([
  "typecheck",
  "effect-tsgo-policy",
  "docgen-jsdoc-quality",
  "repo-law",
  "schema-first-policy",
  "lint-tool",
  "test",
  "build",
  "changeset-policy",
  "repo-export-policy",
  "security-audit",
  "pr-review",
  "greptile-review",
  "bot-review",
  "command-failure",
  "parser-error",
  "unknown-raw",
]).pipe(
  $I.annoteSchema("QualityIssueCategory", {
    description: "Category for a normalized yeet quality issue.",
  })
);

/**
 * Type-level union of normalized yeet quality finding categories.
 *
 * @category models
 * @since 0.0.0
 */
export type QualityIssueCategory = typeof QualityIssueCategory.Type;

/**
 * Blocking level assigned to a normalized yeet quality finding.
 *
 * @example
 * ```ts
 * import { QualityIssueSeverity } from "@beep/repo-cli/commands/Yeet"
 *
 * console.log(QualityIssueSeverity.is.error("error"))
 * ```
 * @category models
 * @since 0.0.0
 */
export const QualityIssueSeverity = LiteralKit(["info", "warning", "error", "fatal"]).pipe(
  $I.annoteSchema("QualityIssueSeverity", {
    description: "Severity assigned to a yeet quality issue.",
  })
);

/**
 * Type-level union of yeet quality severity literals.
 *
 * @category models
 * @since 0.0.0
 */
export type QualityIssueSeverity = typeof QualityIssueSeverity.Type;

class SchemaFirstPolicyOutput extends S.Class<SchemaFirstPolicyOutput>($I`SchemaFirstPolicyOutput`)(
  {
    category: S.Literal("schema-first-policy"),
    ruleId: S.String,
    severity: QualityIssueSeverity,
    file: S.String,
    line: S.optionalKey(S.Finite),
    symbol: S.optionalKey(S.String),
    message: S.String,
    remediation: S.String,
  },
  $I.annote("SchemaFirstPolicyOutput", {
    description: "Machine-readable schema-first lint finding emitted by beep lint schema-first.",
  })
) {}

const decodeSchemaFirstPolicyOutput = S.decodeUnknownOption(S.fromJsonString(SchemaFirstPolicyOutput));

/**
 * Parser confidence for a normalized issue.
 *
 * @example
 * ```ts
 * import { QualityIssueConfidence } from "@beep/repo-cli/commands/Yeet"
 *
 * console.log(QualityIssueConfidence.is.raw("raw"))
 * ```
 * @category models
 * @since 0.0.0
 */
export const QualityIssueConfidence = LiteralKit(["structured", "partial", "raw"]).pipe(
  $I.annoteSchema("QualityIssueConfidence", {
    description: "Confidence level for a yeet quality issue parser result.",
  })
);

/**
 * Parser confidence for a normalized issue.
 *
 * @category models
 * @since 0.0.0
 */
export type QualityIssueConfidence = typeof QualityIssueConfidence.Type;

/**
 * Source attribution carried by normalized advisory analyzer issues.
 *
 * @example
 * ```ts
 * import { QualityIssueAttribution } from "@beep/repo-cli/commands/Yeet"
 *
 * console.log(QualityIssueAttribution.is.introduced("introduced"))
 * ```
 * @category models
 * @since 0.0.0
 */
export const QualityIssueAttribution = LiteralKit(["introduced", "inherited-adjacent", "not-applicable"]).pipe(
  $I.annoteSchema("QualityIssueAttribution", {
    description: "Attribution class for advisory analyzer issues normalized into Yeet packets.",
  })
);

/**
 * Source attribution carried by normalized advisory analyzer issues.
 *
 * @category models
 * @since 0.0.0
 */
export type QualityIssueAttribution = typeof QualityIssueAttribution.Type;

/**
 * Specialist routing hint for one issue.
 *
 * @example
 * ```ts
 * import { QualityIssueRouting } from "@beep/repo-cli/commands/Yeet"
 *
 * const routing = QualityIssueRouting.make({ skill: "effect-first-development", reason: "Effect law failure" })
 * console.log(routing.skill)
 * ```
 * @category models
 * @since 0.0.0
 */
export class QualityIssueRouting extends S.Class<QualityIssueRouting>($I`QualityIssueRouting`)(
  {
    skill: S.String,
    reason: S.String,
  },
  $I.annote("QualityIssueRouting", {
    description: "Suggested specialist skill or agent route for a quality issue.",
  })
) {}

/**
 * One normalized quality issue.
 *
 * @example
 * ```ts
 * import { QualityIssue } from "@beep/repo-cli/commands/Yeet"
 *
 * const issue = QualityIssue.make({
 *   blocking: true,
 *   category: "command-failure",
 *   confidence: "raw",
 *   evidence: [],
 *   id: "issue-1",
 *   message: "Command failed",
 *   severity: "error",
 *   tool: "yeet"
 * })
 * console.log(issue.id)
 * ```
 * @category models
 * @since 0.0.0
 */
export class QualityIssue extends S.Class<QualityIssue>($I`QualityIssue`)(
  {
    id: S.String,
    category: QualityIssueCategory,
    subCategory: S.optionalKey(S.String),
    severity: QualityIssueSeverity,
    blocking: S.Boolean,
    confidence: QualityIssueConfidence,
    message: S.String,
    evidence: S.Array(S.String),
    remediation: S.optionalKey(S.String),
    packageName: S.optionalKey(S.String),
    packagePath: S.optionalKey(S.String),
    file: S.optionalKey(S.String),
    line: S.optionalKey(S.Finite),
    column: S.optionalKey(S.Finite),
    endLine: S.optionalKey(S.Finite),
    endColumn: S.optionalKey(S.Finite),
    symbol: S.optionalKey(S.String),
    exportName: S.optionalKey(S.String),
    sourceAnchor: S.optionalKey(S.String),
    tool: S.String,
    parser: S.String,
    attribution: QualityIssueAttribution.pipe(S.optionalKey),
    task: S.optionalKey(S.String),
    label: S.optionalKey(S.String),
    command: S.optionalKey(S.String),
    cwd: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Finite),
    rawOutputRef: S.optionalKey(S.String),
    rawExcerpt: S.optionalKey(S.String),
    truncated: S.optionalKey(S.Boolean),
    turboTaskId: S.optionalKey(S.String),
    turboHash: S.optionalKey(S.String),
    cacheState: S.optionalKey(S.String),
    routing: S.Array(QualityIssueRouting),
  },
  $I.annote("QualityIssue", {
    description: "One normalized quality issue captured by yeet.",
  })
) {}

/**
 * Package-level issue report rendered into a quality packet.
 *
 * @example
 * ```ts
 * import { PackageQualityReport } from "@beep/repo-cli/commands/Yeet"
 *
 * const report = PackageQualityReport.make({ issueCount: 0, issues: [], packageName: "@beep/root" })
 * console.log(report.issueCount)
 * ```
 * @category models
 * @since 0.0.0
 */
export class PackageQualityReport extends S.Class<PackageQualityReport>($I`PackageQualityReport`)(
  {
    packageName: S.String,
    packagePath: S.optionalKey(S.String),
    issueCount: S.Finite,
    blockingCount: S.Finite,
    issues: S.Array(QualityIssue),
  },
  $I.annote("PackageQualityReport", {
    description: "Package-grouped view of yeet quality issues.",
  })
) {}

/**
 * Complete quality issue index for a yeet run.
 *
 * @example
 * ```ts
 * import { QualityIssueIndex } from "@beep/repo-cli/commands/Yeet"
 *
 * const index = QualityIssueIndex.make({ issues: [], packages: [], rawOutputRefs: [], schemaVersion: "yeet-quality-issue-index/v1" })
 * console.log(index.schemaVersion)
 * ```
 * @category models
 * @since 0.0.0
 */
export class QualityIssueIndex extends S.Class<QualityIssueIndex>($I`QualityIssueIndex`)(
  {
    schemaVersion: S.Literal("yeet-quality-issue-index/v1"),
    issues: S.Array(QualityIssue),
    packages: S.Array(PackageQualityReport),
    rawOutputRefs: S.Array(S.String),
  },
  $I.annote("QualityIssueIndex", {
    description: "Schema-first collection of issues and package packet summaries for yeet.",
  })
) {}

const issueOrder: Order.Order<QualityIssue> = Order.combine(
  Order.mapInput(Order.String, (issue: QualityIssue) => issue.packageName ?? ""),
  Order.combine(
    Order.mapInput(Order.String, (issue: QualityIssue) => issue.category),
    Order.mapInput(Order.String, (issue: QualityIssue) => issue.id)
  )
);

const packageReportOrder: Order.Order<PackageQualityReport> = Order.mapInput(
  Order.String,
  (report: PackageQualityReport) => report.packageName
);

const stripAnsi = Str.replace(ansiPattern, "");
const normalizeOutput = flow(stripAnsi, Str.trim);
const lineText = flow(Str.trim, normalizeOutput);
const nonEmptyLines = flow(Str.split(/\r?\n/u), A.map(lineText), A.filter(Str.isNonEmpty));
const truncateExcerpt = (value: string): string =>
  Str.length(value) <= MAX_RAW_EXCERPT_CHARS
    ? value
    : `${Str.slice(0, MAX_RAW_EXCERPT_CHARS)(value)}\n[yeet] excerpt truncated`;

const issuePackageName = (issue: QualityIssue): string => issue.packageName ?? "@beep/root";
const issuePackagePath = (issue: QualityIssue): O.Option<string> => O.fromUndefinedOr(issue.packagePath);
const packageKey = (issue: QualityIssue): string => `${issuePackageName(issue)}\u0000${issue.packagePath ?? ""}`;
const filterArgPrefix = "--filter=";

const routeForCategory = (category: QualityIssueCategory): ReadonlyArray<QualityIssueRouting> =>
  QualityIssueCategory.$match(category, {
    "docgen-jsdoc-quality": () => [
      QualityIssueRouting.make({ skill: "jsdoc-annotation-specialist", reason: "JSDoc/docgen quality finding" }),
    ],
    "schema-first-policy": () => [
      QualityIssueRouting.make({ skill: "schema-first-development", reason: "Schema-first policy finding" }),
    ],
    "effect-tsgo-policy": () => [
      QualityIssueRouting.make({ skill: "effect-first-development", reason: "Effect tsgo diagnostic" }),
    ],
    "repo-law": () => [
      QualityIssueRouting.make({ skill: "effect-first-development", reason: "Repository law finding" }),
    ],
    "command-failure": () => [
      QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason: "Raw command failure needs triage" }),
    ],
    "parser-error": () => [
      QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason: "Issue parser failed to classify output" }),
    ],
    "unknown-raw": () => [
      QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason: "Raw quality output needs classification" }),
    ],
    typecheck: () => [
      QualityIssueRouting.make({ skill: "effect-first-development", reason: "TypeScript check failure" }),
    ],
    "lint-tool": () => [QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason: "Tool lint failure" })],
    test: () => [QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason: "Test failure" })],
    build: () => [QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason: "Build failure" })],
    "changeset-policy": () => [
      QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason: "Changeset policy failure" }),
    ],
    "repo-export-policy": () => [
      QualityIssueRouting.make({ skill: "repo-symbol-discovery", reason: "Stale repo-export workflow reference" }),
    ],
    "security-audit": () => [
      QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason: "Security audit failure" }),
    ],
    "pr-review": () => [
      QualityIssueRouting.make({ skill: "github:gh-address-comments", reason: "Actionable PR review thread" }),
    ],
    "greptile-review": () => [
      QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason: "Greptile closeout gate failure" }),
    ],
    "bot-review": () => [
      QualityIssueRouting.make({ skill: "quality-review-fix-loop", reason: "Hosted review bot finding" }),
    ],
  });

const categoryForStep = (step: RepoPlanStep): QualityIssueCategory => {
  const label = step.label;
  if (Str.includes("docgen")(label)) {
    return "docgen-jsdoc-quality";
  }
  if (Str.includes("schema")(label)) {
    return "schema-first-policy";
  }
  if (Str.includes("tsgo")(label) || Str.includes("effect")(label)) {
    return "effect-tsgo-policy";
  }
  if (Str.includes("repo-exports")(label)) {
    return "repo-export-policy";
  }
  if (Str.includes("changeset")(label)) {
    return "changeset-policy";
  }
  if (Str.includes("security")(label) || Str.includes("secrets")(label) || Str.includes("audit")(label)) {
    return "security-audit";
  }
  if (Str.includes("lint")(label)) {
    return "lint-tool";
  }
  if (Str.includes("test")(label)) {
    return "test";
  }
  if (Str.includes("build")(label)) {
    return "build";
  }
  if (Str.includes("law")(label)) {
    return "repo-law";
  }
  return "command-failure";
};

type KnownSubLaneHint = {
  readonly needle: string;
  readonly subCategory: string;
  readonly category: QualityIssueCategory;
  readonly remediation: string;
};

type KnownSubLaneMatch = {
  readonly hint: KnownSubLaneHint;
  readonly index: number;
};

const knownSubLaneHints: ReadonlyArray<KnownSubLaneHint> = [
  {
    needle: "cspell",
    subCategory: "cspell",
    category: "lint-tool",
    remediation: "Run `bun run cspell` or update the spelling dictionary for intentional terms.",
  },
  {
    needle: "unknown word found",
    subCategory: "cspell",
    category: "lint-tool",
    remediation: "Run `bun run cspell` or update the spelling dictionary for intentional terms.",
  },
  {
    needle: "terse-effect",
    subCategory: "terse-effect",
    category: "repo-law",
    remediation:
      "Run `bun run beep laws terse-effect --check` and inspect blocking, rewritable, and informational files.",
  },
  {
    needle: "dual-arity",
    subCategory: "dual-arity",
    category: "repo-law",
    remediation: "Run `bun run beep laws dual-arity --check` and fix enforced candidates.",
  },
  {
    needle: "repo-exports",
    subCategory: "stale-repo-export-workflow",
    category: "repo-export-policy",
    remediation: "Remove stale repo-export workflow references and use live source/barrel search for symbol discovery.",
  },
  {
    needle: "docgen",
    subCategory: "docgen",
    category: "docgen-jsdoc-quality",
    remediation: "Run `bun run docgen:local` for edit loops or `bun run docgen` for the full proof.",
  },
  {
    needle: "semgrep",
    subCategory: "sast",
    category: "security-audit",
    remediation: "Inspect the Semgrep finding and rerun `bun run beep quality github-checks sast`.",
  },
  {
    needle: "gitleaks",
    subCategory: "secrets",
    category: "security-audit",
    remediation: "Inspect the Gitleaks finding and rerun `bun run beep quality github-checks secrets`.",
  },
  {
    needle: "osv",
    subCategory: "security",
    category: "security-audit",
    remediation: "Inspect the OSV finding and rerun `bun run beep quality github-checks security`.",
  },
  {
    needle: "nix",
    subCategory: "nix",
    category: "security-audit",
    remediation: "Rerun `bun run beep quality github-checks nix` and inspect the Nix error.",
  },
  {
    needle: "changeset",
    subCategory: "changeset-status",
    category: "changeset-policy",
    remediation:
      "Run `bun run changeset:status:since-main`. If the change is intentionally version-neutral, run `bunx changeset add --empty` and commit the empty changeset.",
  },
  {
    needle: "typos",
    subCategory: "typos",
    category: "lint-tool",
    remediation:
      "Run the typos checker on the flagged files and fix the spelling, or whitelist intentional terms in `_typos.toml`.",
  },
];

const knownSubLaneHintFromText = (text: string): O.Option<KnownSubLaneHint> =>
  pipe(
    knownSubLaneHints,
    A.reduce(O.none<KnownSubLaneMatch>(), (latest, hint) => {
      const index = text.lastIndexOf(hint.needle);
      if (index < 0) {
        return latest;
      }
      const candidate = { hint, index };
      return pipe(
        latest,
        O.match({
          onNone: () => O.some(candidate),
          onSome: (match) => (index > match.index ? O.some(candidate) : latest),
        })
      );
    }),
    O.map((match) => match.hint)
  );

const FAILURE_HINT_WINDOW_RADIUS = 12;

interface FailureHintSlices {
  readonly prefix: O.Option<string>;
  readonly windows: ReadonlyArray<string>;
}

const lineIndicatesFailure = (line: string): boolean => {
  const normalized = Str.toLowerCase(line);
  return (
    Str.includes("failed")(normalized) ||
    Str.includes("failure")(normalized) ||
    Str.includes("error")(normalized) ||
    Str.includes("exit code")(normalized) ||
    Str.includes("timed out")(normalized)
  );
};

const outputFailureHintSlices = (text: string): FailureHintSlices => {
  const lines = pipe(text, Str.replace(/\r\n/gu, "\n"), Str.split("\n"));
  const failureEntries = pipe(
    lines,
    A.map((line, index) => ({ index, line })),
    A.filter((entry) => lineIndicatesFailure(entry.line))
  );
  return {
    prefix: pipe(
      failureEntries,
      A.findLast(() => true),
      O.map((entry) => pipe(lines, A.take(entry.index + 1), A.join("\n")))
    ),
    windows: pipe(
      failureEntries,
      A.map((entry) => {
        const start = Math.max(0, entry.index - FAILURE_HINT_WINDOW_RADIUS);
        return pipe(lines, A.drop(start), A.take(entry.index - start + 1), A.join("\n"));
      })
    ),
  };
};

const knownSubLaneHintFromFailureSlices = (slices: FailureHintSlices): O.Option<KnownSubLaneHint> => {
  if (A.isReadonlyArrayEmpty(slices.windows)) {
    return O.none();
  }
  return pipe(
    slices.windows,
    A.reduce(O.none<KnownSubLaneHint>(), (matched, window) =>
      O.isSome(matched) ? matched : knownSubLaneHintFromText(window)
    ),
    O.orElse(() => pipe(slices.prefix, O.flatMap(knownSubLaneHintFromText)))
  );
};

const knownSubLaneHintFromOutput = (output: string | undefined): O.Option<KnownSubLaneHint> => {
  const normalized = Str.toLowerCase(output ?? "");
  const tail = normalized.slice(-KNOWN_SUB_LANE_TAIL_CHARS);
  const failureSlices = outputFailureHintSlices(normalized);
  return pipe(
    knownSubLaneHintFromFailureSlices(failureSlices),
    O.orElse(() =>
      A.isReadonlyArrayEmpty(failureSlices.windows)
        ? pipe(
            knownSubLaneHintFromText(tail),
            O.orElse(() => knownSubLaneHintFromText(normalized))
          )
        : O.none()
    )
  );
};

/**
 * Return the remediation command for a known failed sub-lane found in broad
 * command output.
 *
 * @param output - Captured step output to scan for known sub-lane needles.
 * @returns Remediation text when a known sub-lane hint matches.
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { knownSubLaneRemediationFromOutput } from "@beep/repo-cli/test/Yeet"
 *
 * console.log(O.isSome(knownSubLaneRemediationFromOutput("lint:cspell failed")))
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const knownSubLaneRemediationFromOutput = (output: string | undefined): O.Option<string> =>
  pipe(
    knownSubLaneHintFromOutput(output),
    O.map((hint) => hint.remediation)
  );

const severityForLine = (severity: string): QualityIssueSeverity => (severity === "warning" ? "warning" : "error");
const lineIndicatesEffectDiagnostic = (line: string): boolean =>
  Str.includes(" effect(")(line) || Str.includes("effectFn")(line) || Str.includes("@effect")(line);

const optionalNumberFromString = (value: string | undefined): O.Option<number> =>
  pipe(
    O.fromUndefinedOr(value),
    O.flatMap((text) => {
      const parsed = globalThis.Number.parseInt(text, 10);
      return globalThis.Number.isNaN(parsed) ? O.none<number>() : O.some(parsed);
    })
  );

const optionalStringFromStep = (value: string | undefined): O.Option<string> =>
  pipe(O.fromUndefinedOr(value), O.filter(Str.isNonEmpty));
const packageNameFromFilterArg: (arg: string) => O.Option<string> = flow(
  O.liftPredicate(Str.startsWith(filterArgPrefix)),
  O.map(Str.replace(filterArgPrefix, "")),
  O.filter(Str.isNonEmpty)
);

const filteredPackageNamesForStep = (step: RepoPlanStep): ReadonlyArray<string> =>
  pipe(step.args, A.map(packageNameFromFilterArg), A.getSomes, A.dedupe, A.sort(Order.String));

const turboWorkspacePackageFromTask = (task: TurboPlanTask): O.Option<TurboWorkspacePackage> =>
  pipe(
    O.all({
      name: optionalStringFromStep(task.packageName),
      path: optionalStringFromStep(task.packagePath),
    }),
    O.filter(({ name }) => !Str.Equivalence(name, "//")),
    O.map(({ name, path }) => TurboWorkspacePackage.make({ name, path }))
  );

const workspacePackagesForContext = (context: RepoRunContext): ReadonlyArray<TurboWorkspacePackage> => {
  const packageCatalog = context.turbo.packages ?? A.empty<TurboWorkspacePackage>();
  const taskPackages = pipe(context.turbo.tasks, A.map(turboWorkspacePackageFromTask), A.getSomes);

  return pipe(
    [...packageCatalog, ...taskPackages],
    A.dedupeWith((left, right) => Str.Equivalence(left.name, right.name) && Str.Equivalence(left.path, right.path)),
    A.sort(Order.mapInput(Order.String, (pkg: TurboWorkspacePackage) => pkg.name))
  );
};

const packagePathForPackageName = (context: RepoRunContext, packageName: string): O.Option<string> =>
  pipe(
    workspacePackagesForContext(context),
    A.findFirst((pkg) => Str.Equivalence(pkg.name, packageName)),
    O.map((pkg) => pkg.path)
  );

const turboTaskForPackageName = (
  context: RepoRunContext,
  step: RepoPlanStep,
  packageName: string
): O.Option<TurboPlanTask> => {
  const stepTask = optionalStringFromStep(step.task);
  return A.findFirst(
    context.turbo.tasks,
    (task) =>
      Str.Equivalence(task.packageName ?? "", packageName) &&
      pipe(
        stepTask,
        O.match({
          onNone: () => true,
          onSome: (taskName) =>
            O.exists(optionalStringFromStep(task.task), (taskValue) => Str.Equivalence(taskValue, taskName)) ||
            Str.Equivalence(task.taskId, taskName),
        })
      )
  );
};

const packageNameForFile = (context: RepoRunContext, file: string): O.Option<string> =>
  pipe(
    workspacePackagesForContext(context),
    A.filter((pkg) => Str.Equivalence(file, pkg.path) || Str.startsWith(`${pkg.path}/`)(file)),
    A.sort(Order.mapInput(Order.Number, (pkg: TurboWorkspacePackage) => -Str.length(pkg.path))),
    A.head,
    O.map((pkg) => pkg.name)
  );

const issueIdPathIdentity = (packageName: O.Option<string>, file: O.Option<string>): O.Option<string> =>
  pipe(
    file,
    O.orElse(() =>
      pipe(
        packageName,
        O.map((name) => `package:${name}`)
      )
    ),
    O.filter(Str.isNonEmpty)
  );

const issueId = (
  step: RepoPlanStep,
  category: QualityIssueCategory,
  message: string,
  packageName: O.Option<string>,
  file: O.Option<string>,
  line: O.Option<number>
): string =>
  A.join(
    [
      step.id,
      category,
      pipe(
        issueIdPathIdentity(packageName, file),
        O.getOrElse(() => "repo")
      ),
      pipe(
        line,
        O.map((value) => `${value}`),
        O.getOrElse(() => "0")
      ),
      Str.slice(0, 96)(message),
    ],
    "::"
  );

const issueBase = (
  context: RepoRunContext,
  step: RepoPlanStep,
  result: RepoStepRunResult,
  category: QualityIssueCategory,
  message: string,
  inferredPackageName: O.Option<string> = O.none()
) => {
  const packageName = pipe(
    optionalStringFromStep(step.packageName),
    O.orElse(() => inferredPackageName)
  );
  const packagePath = pipe(
    optionalStringFromStep(step.packagePath),
    O.orElse(() =>
      pipe(
        packageName,
        O.flatMap((name) => packagePathForPackageName(context, name))
      )
    )
  );
  const turboTask = pipe(
    packageName,
    O.flatMap((name) => turboTaskForPackageName(context, step, name)),
    O.orElse(() => (step.scope === "repo" ? O.none() : turboTaskForStep(context, step)))
  );
  return {
    category,
    blocking: true,
    confidence: "partial" as const,
    message,
    tool: step.task ?? step.label,
    parser: "yeet/raw-plus-known/v1",
    evidence: A.empty<string>(),
    routing: [...routeForCategory(category)],
    ...optionalProp("packageName", packageName),
    ...optionalProp("packagePath", packagePath),
    ...optionalProp("task", optionalStringFromStep(step.task)),
    ...optionalProp("label", O.some(step.label)),
    ...optionalProp("command", O.some(commandTextForStep(step))),
    ...optionalProp("cwd", O.some(step.cwd)),
    ...optionalProp("exitCode", O.some(result.exitCode)),
    ...optionalProp("rawOutputRef", O.fromUndefinedOr(result.rawOutputRef)),
    ...optionalProp("rawExcerpt", pipe(O.fromUndefinedOr(result.output), O.map(truncateExcerpt))),
    ...optionalProp("truncated", O.fromUndefinedOr(result.truncated)),
    ...optionalProp(
      "turboTaskId",
      pipe(
        turboTask,
        O.map((task) => task.taskId)
      )
    ),
    ...optionalProp(
      "turboHash",
      pipe(
        turboTask,
        O.flatMap((task) => O.fromUndefinedOr(task.hash))
      )
    ),
    ...optionalProp(
      "cacheState",
      pipe(
        turboTask,
        O.flatMap((task) => O.fromUndefinedOr(task.cacheStatus))
      )
    ),
  };
};

const diagnosticIssueFromLine = (
  context: RepoRunContext,
  step: RepoPlanStep,
  result: RepoStepRunResult,
  line: string
): O.Option<QualityIssue> => {
  const match = tsDiagnosticPattern.exec(line);
  if (match?.groups === undefined) {
    return O.none();
  }

  const file = O.fromUndefinedOr(match.groups.file);
  const startLine = optionalNumberFromString(match.groups.line);
  const startColumn = optionalNumberFromString(match.groups.column);
  const message = match.groups.message ?? line;
  const category: QualityIssueCategory = lineIndicatesEffectDiagnostic(line) ? "effect-tsgo-policy" : "typecheck";
  const inferredPackageName = pipe(
    file,
    O.flatMap((path) => packageNameForFile(context, path))
  );

  return O.some(
    QualityIssue.make({
      ...issueBase(context, step, result, category, message, inferredPackageName),
      id: issueId(step, category, message, inferredPackageName, file, startLine),
      severity: severityForLine(match.groups.severity ?? "error"),
      confidence: "structured",
      evidence: [line],
      ...optionalProp("file", file),
      ...optionalProp("line", startLine),
      ...optionalProp("column", startColumn),
    })
  );
};

const schemaFirstPolicyIssueFromLine = (
  context: RepoRunContext,
  step: RepoPlanStep,
  result: RepoStepRunResult,
  line: string
): O.Option<QualityIssue> =>
  pipe(
    line,
    O.liftPredicate(Str.startsWith(schemaFirstPolicyIssuePrefix)),
    O.map(Str.replace(schemaFirstPolicyIssuePrefix, "")),
    O.flatMap(decodeSchemaFirstPolicyOutput),
    O.map((finding) => {
      const file = O.some(finding.file);
      const startLine = O.fromUndefinedOr(finding.line);
      const inferredPackageName = pipe(
        file,
        O.flatMap((path) => packageNameForFile(context, path))
      );
      return QualityIssue.make({
        ...issueBase(context, step, result, "schema-first-policy", finding.message, inferredPackageName),
        id: issueId(
          step,
          "schema-first-policy",
          `${finding.ruleId}: ${finding.message}`,
          inferredPackageName,
          file,
          startLine
        ),
        subCategory: finding.ruleId,
        severity: finding.severity,
        confidence: "structured",
        evidence: [line],
        remediation: finding.remediation,
        file: finding.file,
        ...optionalProp("line", startLine),
        ...optionalProp("symbol", O.fromUndefinedOr(finding.symbol)),
      });
    })
  );

const fallbackIssueFromResult = (
  context: RepoRunContext,
  step: RepoPlanStep,
  result: RepoStepRunResult,
  inferredPackageName: O.Option<string> = O.none()
): QualityIssue => {
  const subLaneHint = knownSubLaneHintFromOutput(result.output);
  const category = pipe(
    subLaneHint,
    O.map((hint) => hint.category),
    O.getOrElse(() => categoryForStep(step))
  );
  const message = pipe(
    subLaneHint,
    O.map((hint) => `${step.label} failed in ${hint.subCategory} with exit code ${result.exitCode}.`),
    O.getOrElse(() => `${step.label} failed with exit code ${result.exitCode}.`)
  );
  return QualityIssue.make({
    ...issueBase(context, step, result, category, message, inferredPackageName),
    id: issueId(step, category, message, inferredPackageName, O.none(), O.none()),
    severity: "error",
    confidence: "raw",
    ...optionalProp(
      "subCategory",
      pipe(
        subLaneHint,
        O.map((hint) => hint.subCategory)
      )
    ),
    ...optionalProp(
      "remediation",
      pipe(
        subLaneHint,
        O.map((hint) => hint.remediation)
      )
    ),
  });
};

const fallbackIssuesFromResult = (
  context: RepoRunContext,
  step: RepoPlanStep,
  result: RepoStepRunResult
): ReadonlyArray<QualityIssue> => {
  const packageNames = filteredPackageNamesForStep(step);
  return A.isReadonlyArrayNonEmpty(packageNames)
    ? pipe(
        packageNames,
        A.map((packageName) => fallbackIssueFromResult(context, step, result, O.some(packageName)))
      )
    : [fallbackIssueFromResult(context, step, result)];
};

/**
 * Convert a failed step result into quality issues.
 *
 * @param context - Shared run context.
 * @param step - Planned step that produced the result.
 * @param result - Captured step result.
 * @returns Structured or raw issues; successful results produce no issues.
 * @example
 * ```ts
 * import { qualityIssuesFromStepResult, RepoPlanStep, RepoRunContext, RepoStepRunResult, TurboPlanSnapshot } from "@beep/repo-cli/test/Yeet"
 *
 * const context = RepoRunContext.make({
 *   base: "origin/main",
 *   branch: "repo-cli-yeet",
 *   cwd: "/repo",
 *   head: "HEAD",
 *   originalArgv: [],
 *   packetDir: ".beep/yeet",
 *   repoRoot: "/repo",
 *   turbo: TurboPlanSnapshot.make({ graphHealthStatus: "ok", graphHealthWarnings: [], tasks: [] })
 * })
 * const step = RepoPlanStep.make({
 *   args: ["run", "check"],
 *   command: "bun",
 *   cwd: "/repo",
 *   id: "feedback:check",
 *   label: "feedback:check",
 *   mutability: "readonly",
 *   phase: "feedback",
 *   resume: "never",
 *   scope: "repo"
 * })
 * const result = RepoStepRunResult.make({ commandText: "bun run check", exitCode: 1, output: "check failed", stepId: step.id })
 * console.log(qualityIssuesFromStepResult(context, step, result))
 * ```
 * @category parsing
 * @since 0.0.0
 */
export const qualityIssuesFromStepResult: {
  (context: RepoRunContext, step: RepoPlanStep, result: RepoStepRunResult): ReadonlyArray<QualityIssue>;
  (step: RepoPlanStep, result: RepoStepRunResult): (context: RepoRunContext) => ReadonlyArray<QualityIssue>;
} = dual(3, (context: RepoRunContext, step: RepoPlanStep, result: RepoStepRunResult): ReadonlyArray<QualityIssue> => {
  if (result.exitCode === 0) {
    return A.empty();
  }

  const parsedIssues = pipe(
    result.output ?? "",
    nonEmptyLines,
    A.map((line) =>
      pipe(
        schemaFirstPolicyIssueFromLine(context, step, result, line),
        O.orElse(() => diagnosticIssueFromLine(context, step, result, line))
      )
    ),
    A.getSomes
  );

  return A.isReadonlyArrayNonEmpty(parsedIssues) ? parsedIssues : fallbackIssuesFromResult(context, step, result);
});

const packageReportForKey = (issues: ReadonlyArray<QualityIssue>, key: string): PackageQualityReport => {
  const packageIssues = pipe(
    issues,
    A.filter((issue) => packageKey(issue) === key),
    A.sort(issueOrder)
  );
  const firstIssue = A.head(packageIssues);
  const packageName = pipe(
    firstIssue,
    O.map(issuePackageName),
    O.getOrElse(() => "@beep/root")
  );
  const packagePath = pipe(firstIssue, O.flatMap(issuePackagePath));
  return PackageQualityReport.make({
    packageName,
    issueCount: A.length(packageIssues),
    blockingCount: A.length(A.filter(packageIssues, (issue) => issue.blocking)),
    issues: packageIssues,
    ...optionalProp("packagePath", packagePath),
  });
};

/**
 * Build a schema-first issue index from normalized issues.
 *
 * @param issues - Issues discovered during a yeet run.
 * @returns Stable issue index with package grouping.
 * @example
 * ```ts
 * import { buildQualityIssueIndex } from "@beep/repo-cli/test/Yeet"
 *
 * console.log(buildQualityIssueIndex([]).schemaVersion)
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const buildQualityIssueIndex = (issues: ReadonlyArray<QualityIssue>): QualityIssueIndex => {
  const sortedIssues = A.sort(issues, issueOrder);
  const packageKeys = pipe(sortedIssues, A.map(packageKey), A.dedupe, A.sort(Order.String));
  const packages = pipe(
    packageKeys,
    A.map((key) => packageReportForKey(sortedIssues, key)),
    A.sort(packageReportOrder)
  );
  const rawOutputRefs = pipe(
    sortedIssues,
    A.map((issue) => issue.rawOutputRef),
    A.filter(P.isNotUndefined),
    A.dedupe,
    A.sort(Order.String)
  );
  return QualityIssueIndex.make({
    schemaVersion: "yeet-quality-issue-index/v1",
    issues: sortedIssues,
    packages,
    rawOutputRefs,
  });
};
