/**
 * Report-only JSDoc quality analysis for `beep docgen quality`.
 *
 * The command keeps deterministic parsing and exported-symbol evidence in the
 * CLI layer so future model review can score a bounded packet without
 * inventing repo policy.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { parseComment } from "@beep/repo-docgen/Parser";
import { DomainError, findRepoRoot } from "@beep/repo-utils";
import { ContentHashFromSourceText } from "@beep/repo-utils/TSMorph/index";
import { LiteralKit } from "@beep/schema";
import { thunkEmptyStr } from "@beep/utils";
import { DateTime, Effect, FileSystem, flow, Match, Order, Path, pipe, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess } from "effect/unstable/process";
import * as jsonc from "jsonc-parser";
import { type Diagnostic, type ExportDeclaration, type JSDoc, Node, Project, type SourceFile } from "ts-morph";
import { normalizeJSDocCategory } from "../../Shared/JSDocCategories.js";
import {
  assertNoOrphanDocgenConfigPaths,
  DocgenConfigDocument,
  type DocgenWorkspacePackage,
  discoverDocgenWorkspacePackages,
  loadDocgenConfigDocument,
  resolveDocgenWorkspacePackage,
} from "./Operations.js";

const $I = $RepoCliId.create("commands/Docgen/internal/Quality");

const QUALITY_SCHEMA_VERSION = 1 as const;
const QUALITY_RUBRIC_VERSION = "jsdoc-quality-v1" as const;
const QUALITY_REQUIRED_EXPORT_TAGS = ["@category", "@example", "@since"] as const;
const QUALITY_REQUIRED_MODULE_TAGS = ["@since"] as const;
const QUALITY_TS_GLOBS = ["**/*.ts", "**/*.tsx"] as const;
const EXCLUDED_SOURCE_SEGMENTS = [
  "/.git/",
  "/.turbo/",
  "/build/",
  "/coverage/",
  "/dist/",
  "/docs/",
  "/node_modules/",
  "/test/",
  "/tests/",
  "/dtslint/",
] as const;
const REPO_BASE_CHANGED_FILE_COMMAND = [
  "diff",
  "--name-only",
  "--diff-filter=ACMR",
  "origin/main...HEAD",
  "--",
  "*.ts",
  "*.tsx",
] as const;
const WORKING_TREE_CHANGED_FILE_COMMANDS = [
  ["diff", "--name-only", "--diff-filter=ACMR", "HEAD", "--", "*.ts", "*.tsx"],
  ["ls-files", "--others", "--exclude-standard", "--", "*.ts", "*.tsx"],
] as const;

const encodeJson = S.encodeUnknownEffect(S.UnknownFromJsonString);
const decodeContentHashFromSourceText = S.decodeUnknownEffect(ContentHashFromSourceText);

/**
 * Scope mode supported by `docgen quality`.
 *
 * @example
 * ```ts
 * import { DocgenQualityScopeMode } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 *
 * console.log(DocgenQualityScopeMode.is["changed-files"]("changed-files"))
 * ```
 * @category models
 * @since 0.0.0
 */
export const DocgenQualityScopeMode = LiteralKit(["affected", "package", "changed-files", "all"]).annotate(
  $I.annote("DocgenQualityScopeMode", {
    description: "Scope mode supported by docgen quality.",
  })
);

/**
 * Scope mode supported by `docgen quality`.
 *
 * @example
 * ```ts
 * import type { DocgenQualityScopeMode } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 *
 * const mode: DocgenQualityScopeMode = "affected"
 * console.log(mode)
 * ```
 * @category type-level
 * @since 0.0.0
 */
export type DocgenQualityScopeMode = typeof DocgenQualityScopeMode.Type;

/**
 * Optional advisory scoring mode for `docgen quality`.
 *
 * @example
 * ```ts
 * import { DocgenQualityScoreMode } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 *
 * console.log(DocgenQualityScoreMode.is.rubric("rubric"))
 * ```
 * @category models
 * @since 0.0.0
 */
export const DocgenQualityScoreMode = LiteralKit(["none", "rubric", "codex"]).annotate(
  $I.annote("DocgenQualityScoreMode", {
    description: "Optional advisory scoring mode for docgen quality.",
  })
);

/**
 * Optional advisory scoring mode for `docgen quality`.
 *
 * @example
 * ```ts
 * import type { DocgenQualityScoreMode } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 *
 * const mode: DocgenQualityScoreMode = "rubric"
 * console.log(mode)
 * ```
 * @category type-level
 * @since 0.0.0
 */
export type DocgenQualityScoreMode = typeof DocgenQualityScoreMode.Type;

/**
 * Quality tier assigned to a JSDoc review subject.
 *
 * @example
 * ```ts
 * import { DocgenQualityTier } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 *
 * console.log(DocgenQualityTier.is.warn("warn"))
 * ```
 * @category models
 * @since 0.0.0
 */
export const DocgenQualityTier = LiteralKit(["pass", "warn", "fail"]).annotate(
  $I.annote("DocgenQualityTier", {
    description: "Quality tier assigned to a JSDoc review subject.",
  })
);

/**
 * Quality tier assigned to a JSDoc review subject.
 *
 * @example
 * ```ts
 * import type { DocgenQualityTier } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 *
 * const tier: DocgenQualityTier = "warn"
 * console.log(tier)
 * ```
 * @category type-level
 * @since 0.0.0
 */
export type DocgenQualityTier = typeof DocgenQualityTier.Type;

/**
 * Typed finding code emitted by the v1 quality rubric.
 *
 * @example
 * ```ts
 * import { DocgenQualityFindingCode } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 *
 * console.log(DocgenQualityFindingCode.is["missing-example"]("missing-example"))
 * ```
 * @category models
 * @since 0.0.0
 */
export const DocgenQualityFindingCode = LiteralKit([
  "missing-description",
  "missing-example",
  "missing-category",
  "missing-since",
  "invalid-category",
  "example-not-code-fenced",
  "example-too-trivial",
  "example-only-voids-result",
  "example-lacks-observable-result",
  "missing-effects-for-effectful-symbol",
  "insufficient-agent-context",
]).annotate(
  $I.annote("DocgenQualityFindingCode", {
    description: "Typed finding code emitted by the v1 quality rubric.",
  })
);

/**
 * Typed finding code emitted by the v1 quality rubric.
 *
 * @example
 * ```ts
 * import type { DocgenQualityFindingCode } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 *
 * const code: DocgenQualityFindingCode = "missing-example"
 * console.log(code)
 * ```
 * @category type-level
 * @since 0.0.0
 */
export type DocgenQualityFindingCode = typeof DocgenQualityFindingCode.Type;

class DocgenQualityFinding extends S.Class<DocgenQualityFinding>($I`DocgenQualityFinding`)(
  {
    code: DocgenQualityFindingCode,
    tier: DocgenQualityTier,
    scoreImpact: S.Number,
    message: S.String,
    evidence: S.Array(S.String),
    remediation: S.String,
  },
  $I.annote("DocgenQualityFinding", {
    description: "Single typed quality finding for one JSDoc subject.",
  })
) {}

class DocgenQualityDiagnostic extends S.Class<DocgenQualityDiagnostic>($I`DocgenQualityDiagnostic`)(
  {
    category: S.String,
    code: S.Number,
    message: S.String,
    line: S.Number,
  },
  $I.annote("DocgenQualityDiagnostic", {
    description: "Nearby TypeScript diagnostic carried as quality-review evidence.",
  })
) {}

class DocgenRelatedSymbol extends S.Class<DocgenRelatedSymbol>($I`DocgenRelatedSymbol`)(
  {
    name: S.String,
    kind: S.String,
    line: S.Number,
    signature: S.String,
  },
  $I.annote("DocgenRelatedSymbol", {
    description: "Nearby exported symbol carried as review context.",
  })
) {}

/**
 * Stable evidence packet for one exported-symbol JSDoc quality review.
 *
 * @example
 * ```ts
 * import type { DocgenQualitySubject } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 *
 * const subject: Pick<DocgenQualitySubject, "exportName"> = { exportName: "makeUser" }
 * console.log(subject.exportName)
 * ```
 * @category models
 * @since 0.0.0
 */
export class DocgenQualitySubject extends S.Class<DocgenQualitySubject>($I`DocgenQualitySubject`)(
  {
    packageName: S.String,
    packagePath: S.String,
    filePath: S.String,
    repoPath: S.String,
    sourceAnchor: S.String,
    exportName: S.String,
    declarationKind: S.String,
    signature: S.String,
    declarationSource: S.String,
    rawJsDoc: S.String,
    description: S.NullOr(S.String),
    tags: S.Record(S.String, S.Array(S.String)),
    parsedExamples: S.Array(S.String),
    generatedDocSnippet: S.NullOr(S.String),
    stableIdentity: S.String,
    contentHash: S.String,
    diagnostics: S.Array(DocgenQualityDiagnostic),
    relatedSymbols: S.Array(DocgenRelatedSymbol),
    deterministicMissingTags: S.Array(S.String),
    categoryValues: S.Array(S.String),
    categoryIssues: S.Array(S.String),
  },
  $I.annote("DocgenQualitySubject", {
    description: "Stable evidence packet for one exported-symbol JSDoc quality review.",
  })
) {}

class DocgenQualityReview extends S.Class<DocgenQualityReview>($I`DocgenQualityReview`)(
  {
    subjectId: S.String,
    tier: DocgenQualityTier,
    score: S.Number,
    findings: S.Array(DocgenQualityFinding),
    rationale: S.String,
  },
  $I.annote("DocgenQualityReview", {
    description: "Rubric outcome for one JSDoc quality subject.",
  })
) {}

class DocgenQualitySummary extends S.Class<DocgenQualitySummary>($I`DocgenQualitySummary`)(
  {
    packages: S.Number,
    subjects: S.Number,
    passing: S.Number,
    warnings: S.Number,
    failures: S.Number,
    remediationPackets: S.Number,
  },
  $I.annote("DocgenQualitySummary", {
    description: "Aggregate summary for a JSDoc quality run.",
  })
) {}

class DocgenQualityPackageReport extends S.Class<DocgenQualityPackageReport>($I`DocgenQualityPackageReport`)(
  {
    packageName: S.String,
    packagePath: S.String,
    subjects: S.Array(DocgenQualitySubject),
    reviews: S.Array(DocgenQualityReview),
    summary: DocgenQualitySummary,
  },
  $I.annote("DocgenQualityPackageReport", {
    description: "Package-scoped JSDoc quality report.",
  })
) {}

class DocgenQualityRemediationPacket extends S.Class<DocgenQualityRemediationPacket>(
  $I`DocgenQualityRemediationPacket`
)(
  {
    id: S.String,
    subjectId: S.String,
    title: S.String,
    prompt: S.String,
    verificationCommand: S.String,
    verificationArgv: S.Array(S.String),
  },
  $I.annote("DocgenQualityRemediationPacket", {
    description: "Bounded advisory packet for future Codex remediation.",
  })
) {}

/**
 * Consolidated report emitted by `beep docgen quality`.
 *
 * @example
 * ```ts
 * import type { DocgenQualityReport } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 *
 * const report: Pick<DocgenQualityReport, "schemaVersion"> = { schemaVersion: 1 }
 * console.log(report.schemaVersion)
 * ```
 * @category models
 * @since 0.0.0
 */
export class DocgenQualityReport extends S.Class<DocgenQualityReport>($I`DocgenQualityReport`)(
  {
    schemaVersion: S.Literal(QUALITY_SCHEMA_VERSION),
    rubricVersion: S.String,
    generatedAt: S.String,
    scope: DocgenQualityScopeMode,
    scorer: S.String,
    summary: DocgenQualitySummary,
    packages: S.Array(DocgenQualityPackageReport),
    remediationPackets: S.Array(DocgenQualityRemediationPacket),
  },
  $I.annote("DocgenQualityReport", {
    description: "Consolidated report emitted by beep docgen quality.",
  })
) {}

type DocgenQualitySubjectCandidate = Omit<DocgenQualitySubject, "contentHash" | "stableIdentity"> & {
  readonly hashSourceText: string;
  readonly identityStem: string;
};

const byPackagePathAscending: Order.Order<DocgenWorkspacePackage> = Order.mapInput(
  Order.String,
  (pkg: DocgenWorkspacePackage) => pkg.relativePath
);
const bySubjectIdentityAscending: Order.Order<DocgenQualitySubject> = Order.mapInput(
  Order.String,
  (subject: DocgenQualitySubject) => subject.stableIdentity
);

const normalizeSlashes = (value: string): string => value.replace(/\\/g, "/");

const firstLine = (value: string): string => {
  const [line] = value.split(/\r?\n/);
  return Str.trim(line ?? value);
};

const timestampIso = (): string => DateTime.formatIso(DateTime.nowUnsafe());

const renderJson = Effect.fn("DocgenQuality.renderJson")(function* (value: unknown) {
  const encoded = yield* encodeJson(value).pipe(
    Effect.mapError((cause) => new DomainError({ message: "Failed to encode docgen quality JSON.", cause }))
  );
  const edits = jsonc.format(encoded, undefined, {
    tabSize: 2,
    insertSpaces: true,
  });
  return `${jsonc.applyEdits(encoded, edits)}\n`;
});

const runGitLines = Effect.fn("DocgenQuality.runGitLines")(function* (repoRoot: string, args: ReadonlyArray<string>) {
  const process = ChildProcess.make("git", [...args], {
    cwd: repoRoot,
    stderr: "ignore",
    stdout: "pipe",
  });
  const output = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* process;
      const text = yield* handle.stdout.pipe(
        Stream.decodeText(),
        // Effect v4 Stream.runFold takes a LazyArg initializer; the named thunk keeps the runtime value empty.
        Stream.runFold(thunkEmptyStr, (acc: string, chunk: string) => `${acc}${chunk}`)
      );
      const exitCode = yield* handle.exitCode;
      if (exitCode !== 0) {
        return yield* new DomainError({ message: `git ${A.join(args, " ")} failed with exit code ${exitCode}.` });
      }
      return text;
    })
  );
  return pipe(output.split(/\r?\n/), A.map(Str.trim), A.filter(Str.isNonEmpty));
});

const collectWorkingTreeChangedFiles = Effect.fn("DocgenQuality.collectWorkingTreeChangedFiles")(function* (
  repoRoot: string
) {
  const files = yield* Effect.forEach(
    WORKING_TREE_CHANGED_FILE_COMMANDS,
    (args) => runGitLines(repoRoot, args).pipe(Effect.catch(() => Effect.succeed(A.empty<string>()))),
    { concurrency: "unbounded" }
  );
  return pipe(A.flatten(files), A.map(normalizeSlashes), A.dedupe);
});

const collectChangedFiles = Effect.fn("DocgenQuality.collectChangedFiles")(function* (
  repoRoot: string,
  scope: DocgenQualityScopeMode
) {
  if (scope === "changed-files") {
    return yield* collectWorkingTreeChangedFiles(repoRoot);
  }

  const baseChanged = yield* runGitLines(repoRoot, REPO_BASE_CHANGED_FILE_COMMAND).pipe(
    Effect.mapError(
      (cause) =>
        new DomainError({
          message:
            "Unable to resolve affected docgen quality scope from origin/main...HEAD. Use --changed-files, --all, or --package explicitly, or refresh origin/main.",
          cause,
        })
    )
  );
  const workingTreeChanged = yield* collectWorkingTreeChangedFiles(repoRoot);

  return pipe([...baseChanged, ...workingTreeChanged], A.map(normalizeSlashes), A.dedupe);
});

const selectPackagesForFiles = (
  packages: ReadonlyArray<DocgenWorkspacePackage>,
  files: ReadonlyArray<string>
): ReadonlyArray<DocgenWorkspacePackage> =>
  pipe(
    packages,
    A.filter((pkg) =>
      A.some(files, (filePath) => filePath === pkg.relativePath || Str.startsWith(`${pkg.relativePath}/`)(filePath))
    ),
    A.sort(byPackagePathAscending)
  );

const countSelectedScopes = (packageSelector: O.Option<string>, all: boolean, changedFiles: boolean): number =>
  (O.isSome(packageSelector) ? 1 : 0) + (all ? 1 : 0) + (changedFiles ? 1 : 0);

/**
 * Resolves `docgen quality` targets using the v1 scope policy.
 *
 * @effects Requires workspace discovery and git state for affected or changed-file scopes.
 * @example
 * ```ts
 * import { FsUtilsLive } from "@beep/repo-utils"
 * import { resolveDocgenQualityTargets } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 * import { BunChildProcessSpawner, BunServices } from "@effect/platform-bun"
 * import { Effect, Layer } from "effect"
 * import * as O from "effect/Option"
 *
 * const RuntimeLayer = Layer.mergeAll(BunChildProcessSpawner.layer, FsUtilsLive).pipe(
 *   Layer.provideMerge(BunServices.layer)
 * )
 *
 * const program = Effect.gen(function* () {
 *   const targets = yield* resolveDocgenQualityTargets({
 *     all: false,
 *     changedFiles: true,
 *     packageSelector: O.none()
 *   })
 *   return `${targets.scope}: ${targets.targets.length} packages`
 * })
 *
 * Effect.runPromise(program.pipe(Effect.provide(RuntimeLayer))).then(console.log)
 * ```
 * @category workflows
 * @since 0.0.0
 */
export const resolveDocgenQualityTargets = Effect.fn("DocgenQuality.resolveDocgenQualityTargets")(function* ({
  all,
  changedFiles,
  packageSelector,
}: {
  readonly all: boolean;
  readonly changedFiles: boolean;
  readonly packageSelector: O.Option<string>;
}) {
  yield* assertNoOrphanDocgenConfigPaths();

  if (countSelectedScopes(packageSelector, all, changedFiles) > 1) {
    return yield* new DomainError({
      message: "Choose only one docgen quality scope: --package, --all, or --changed-files.",
    });
  }

  if (O.isSome(packageSelector)) {
    return {
      scope: "package" as const,
      targets: [yield* resolveDocgenWorkspacePackage(packageSelector.value)] as const,
    };
  }

  const configuredPackages = yield* discoverDocgenWorkspacePackages().pipe(
    Effect.map(
      flow(
        A.filter((pkg: DocgenWorkspacePackage) => pkg.hasDocgenConfig),
        A.sort(byPackagePathAscending)
      )
    )
  );

  if (all) {
    return {
      scope: "all" as const,
      targets: configuredPackages,
    };
  }

  const repoRoot = yield* findRepoRoot();
  const scope: DocgenQualityScopeMode = changedFiles ? "changed-files" : "affected";
  const changed = yield* collectChangedFiles(repoRoot, scope);

  return {
    scope,
    targets: selectPackagesForFiles(configuredPackages, changed),
  };
});

const escapeRegexChar = (char: string): string => Str.replace(/[.+?^${}()|[\]\\]/g, "\\$&")(char);

const globPatternToRegExp = (pattern: string): RegExp => {
  let source = "^";
  let index = 0;

  while (index < pattern.length) {
    const char = pattern[index];
    const next = pattern[index + 1];
    const afterNext = pattern[index + 2];

    if (char === "*" && next === "*" && afterNext === "/") {
      source += "(?:.*/)?";
      index += 3;
      continue;
    }

    if (char === "*" && next === "*") {
      source += ".*";
      index += 2;
      continue;
    }

    if (char === "*") {
      source += "[^/]*";
      index += 1;
      continue;
    }

    source += escapeRegexChar(char ?? "");
    index += 1;
  }

  return new RegExp(`${source}$`);
};

const sourceFileMatchesExclude = (
  relativeFilePath: string,
  srcDir: string,
  exclude: ReadonlyArray<string> | undefined
): boolean => {
  const normalized = normalizeSlashes(relativeFilePath);

  if (normalized.endsWith(".d.ts")) {
    return true;
  }

  if (A.some(EXCLUDED_SOURCE_SEGMENTS, (segment) => normalized.includes(segment))) {
    return true;
  }

  if (exclude === undefined) {
    return false;
  }

  const srcRelative = Str.startsWith(`${srcDir}/`)(normalized) ? normalized.slice(srcDir.length + 1) : normalized;

  return A.some(exclude, (pattern) =>
    A.some([normalized, srcRelative], (candidate) =>
      globPatternToRegExp(normalizeSlashes(Str.replace(/^\.\//, "")(pattern))).test(candidate)
    )
  );
};

const getJsDocs = (node: Node): ReadonlyArray<JSDoc> => {
  if (Node.isJSDocable(node)) {
    return node.getJsDocs();
  }

  if (Node.isVariableDeclaration(node)) {
    const statement = node.getVariableStatement();
    if (statement !== undefined) {
      return statement.getJsDocs();
    }
  }

  return A.empty();
};

const getLastJsDocText = (node: Node): string =>
  pipe(
    getJsDocs(node),
    A.last,
    O.map((doc) => doc.getText()),
    O.getOrElse(thunkEmptyStr)
  );

const getLeadingJsDocCommentText = (node: ExportDeclaration): string =>
  pipe(
    node.getLeadingCommentRanges(),
    A.filter((range) => Str.startsWith("/**")(range.getText())),
    A.last,
    O.map((range) => range.getText()),
    O.getOrElse(thunkEmptyStr)
  );

const getTopFileoverviewText = (sourceFile: SourceFile): string => {
  const match = /^\s*(\/\*\*[\s\S]*?\*\/)/.exec(sourceFile.getFullText());
  return match?.[1] ?? "";
};

const isFileoverviewJsDoc = (rawJsDoc: string): boolean => /@(packageDocumentation|fileoverview|file)\b/.test(rawJsDoc);

const normalizeTags = (rawJsDoc: string): Record<string, ReadonlyArray<string>> => {
  if (Str.trim(rawJsDoc).length === 0) {
    return {};
  }

  const parsed = parseComment(rawJsDoc);
  return pipe(
    parsed.tags,
    R.map((value) => (value === undefined ? A.empty<string>() : A.fromIterable(value)))
  );
};

const tagValues = (tags: Record<string, ReadonlyArray<string>>, tagName: string): ReadonlyArray<string> =>
  tags[tagName] ?? A.empty<string>();

const hasTag = (tags: Record<string, ReadonlyArray<string>>, tagName: string): boolean =>
  R.has(tags, tagName.replace(/^@/, ""));

const descriptionFromRawJsDoc = (rawJsDoc: string): string | null => {
  if (Str.trim(rawJsDoc).length === 0) {
    return null;
  }

  return parseComment(rawJsDoc).description ?? null;
};

const categoryIssueMessages = flow(
  A.map(normalizeJSDocCategory),
  A.filter((category) => category.status === "rejected" || category.status === "unknown"),
  A.map((category) => category.message ?? `Invalid @category value ${category.original}.`)
);

const missingRequiredTags = (kind: string, tags: Record<string, ReadonlyArray<string>>): ReadonlyArray<string> => {
  const requiredTags = kind === "module-fileoverview" ? QUALITY_REQUIRED_MODULE_TAGS : QUALITY_REQUIRED_EXPORT_TAGS;
  return A.filter(requiredTags, (tag) => !hasTag(tags, tag));
};

const getExportKind = (node: Node): string => {
  if (Node.isFunctionDeclaration(node)) return "function";
  if (Node.isVariableDeclaration(node)) return "const";
  if (Node.isTypeAliasDeclaration(node)) return "type";
  if (Node.isInterfaceDeclaration(node)) return "interface";
  if (Node.isClassDeclaration(node)) return "class";
  if (Node.isModuleDeclaration(node)) return "namespace";
  if (Node.isEnumDeclaration(node)) return "enum";
  return "const";
};

type ExportedDeclarationCandidate = {
  readonly name: string;
  readonly declaration: Node;
  readonly anchorNode?: Node;
  readonly rawJsDoc?: string;
  readonly exportDeclarationText?: string;
};

const collectExportedDeclarationCandidates = (sourceFile: SourceFile): ReadonlyArray<ExportedDeclarationCandidate> => {
  let candidates = A.empty<ExportedDeclarationCandidate>();
  const exportedDeclarations = sourceFile.getExportedDeclarations();

  for (const exportDeclaration of sourceFile.getExportDeclarations()) {
    if (exportDeclaration.getModuleSpecifierValue() !== undefined) {
      continue;
    }

    const rawJsDoc = getLeadingJsDocCommentText(exportDeclaration);
    if (Str.trim(rawJsDoc).length === 0) {
      continue;
    }

    for (const specifier of exportDeclaration.getNamedExports()) {
      const exportName = specifier.getAliasNode()?.getText() ?? specifier.getName();
      const declarations =
        exportedDeclarations.get(exportName) ?? exportedDeclarations.get(specifier.getName()) ?? A.empty();

      for (const declaration of declarations) {
        if (declaration.getSourceFile() !== sourceFile) {
          continue;
        }

        candidates = A.append(candidates, {
          name: exportName,
          declaration,
          anchorNode: exportDeclaration,
          rawJsDoc,
          exportDeclarationText: exportDeclaration.getText(),
        });
      }
    }
  }

  for (const statement of sourceFile.getStatements()) {
    if (Node.isVariableStatement(statement) && statement.isExported()) {
      for (const declaration of statement.getDeclarations()) {
        candidates = A.append(candidates, {
          name: declaration.getName(),
          declaration,
        });
      }
      continue;
    }

    if (
      (Node.isFunctionDeclaration(statement) ||
        Node.isClassDeclaration(statement) ||
        Node.isInterfaceDeclaration(statement) ||
        Node.isTypeAliasDeclaration(statement) ||
        Node.isEnumDeclaration(statement) ||
        Node.isModuleDeclaration(statement)) &&
      statement.isExported()
    ) {
      const name = statement.getName();

      if (name !== undefined) {
        candidates = A.append(candidates, {
          name,
          declaration: statement,
        });
      }
    }
  }

  for (const [name, declarations] of exportedDeclarations) {
    for (const declaration of declarations) {
      if (declaration.getSourceFile() !== sourceFile) {
        continue;
      }

      candidates = A.append(candidates, {
        name,
        declaration,
      });
    }
  }

  return A.dedupeWith(candidates, (left, right) => left.name === right.name && left.declaration === right.declaration);
};

const nodeLine = (node: Node): number => node.getSourceFile().getLineAndColumnAtPos(node.getStart()).line;

const boundedText = (value: string, maxLength: number): string =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;

const signatureText = (node: Node): string => {
  const text = Node.isVariableDeclaration(node)
    ? (node.getVariableStatement()?.getText() ?? node.getText())
    : node.getText();
  return boundedText(firstLine(text), 240);
};

const declarationText = (node: Node): string =>
  boundedText(
    Node.isVariableDeclaration(node) ? (node.getVariableStatement()?.getText() ?? node.getText()) : node.getText(),
    2_000
  );

const diagnosticCategory = (category: number): string =>
  Match.value(category).pipe(
    Match.when(0, () => "warning"),
    Match.when(1, () => "error"),
    Match.when(2, () => "suggestion"),
    Match.when(3, () => "message"),
    Match.orElse(() => "unknown")
  );

const diagnosticMessageText = (message: string | { getMessageText: () => string }): string =>
  P.isString(message) ? message : message.getMessageText();

const collectDiagnostics = (
  diagnostics: ReadonlyArray<Diagnostic>,
  startLine: number,
  endLine: number
): ReadonlyArray<DocgenQualityDiagnostic> =>
  pipe(
    diagnostics,
    A.filter((diagnostic) => {
      const source = diagnostic.getSourceFile();
      const start = diagnostic.getStart();

      if (source === undefined || start === undefined) {
        return false;
      }

      const line = source.getLineAndColumnAtPos(start).line;
      return line >= startLine && line <= endLine;
    }),
    A.take(5),
    A.map((diagnostic) => {
      const source = diagnostic.getSourceFile();
      const start = diagnostic.getStart();
      const line = source === undefined || start === undefined ? startLine : source.getLineAndColumnAtPos(start).line;
      return new DocgenQualityDiagnostic({
        category: diagnosticCategory(diagnostic.getCategory()),
        code: diagnostic.getCode(),
        line,
        message: diagnosticMessageText(diagnostic.getMessageText()),
      });
    })
  );

const makeSubjectCandidate = ({
  declarationKind,
  declarationSource,
  diagnostics,
  endLine,
  exportName,
  filePath,
  generatedDocSnippet,
  hashSourceText,
  line,
  packageName,
  packagePath,
  rawJsDoc,
  relatedSymbols,
  repoPath,
  signature,
}: {
  readonly declarationKind: string;
  readonly declarationSource: string;
  readonly diagnostics: ReadonlyArray<Diagnostic>;
  readonly endLine: number;
  readonly exportName: string;
  readonly filePath: string;
  readonly generatedDocSnippet: string | null;
  readonly hashSourceText: string;
  readonly line: number;
  readonly packageName: string;
  readonly packagePath: string;
  readonly rawJsDoc: string;
  readonly relatedSymbols: ReadonlyArray<DocgenRelatedSymbol>;
  readonly repoPath: string;
  readonly signature: string;
}): DocgenQualitySubjectCandidate => {
  const tags = normalizeTags(rawJsDoc);
  const categoryValues = tagValues(tags, "category");
  const identityStem = `${packageName}:${repoPath}:${declarationKind}:${exportName}`;
  return {
    packageName,
    packagePath,
    filePath,
    repoPath,
    sourceAnchor: `${repoPath}:${line}`,
    exportName,
    declarationKind,
    signature,
    declarationSource,
    rawJsDoc,
    description: descriptionFromRawJsDoc(rawJsDoc),
    tags,
    parsedExamples: tagValues(tags, "example"),
    generatedDocSnippet,
    identityStem,
    diagnostics: collectDiagnostics(diagnostics, line, endLine),
    relatedSymbols,
    deterministicMissingTags: missingRequiredTags(declarationKind, tags),
    categoryValues,
    categoryIssues: categoryIssueMessages(categoryValues),
    hashSourceText: [packageName, repoPath, declarationKind, exportName, hashSourceText].join("\n"),
  };
};

const isInterestingSourceFile = (
  target: DocgenWorkspacePackage,
  sourceFile: SourceFile,
  srcDir: string,
  exclude: ReadonlyArray<string> | undefined,
  path: Path.Path
): boolean => {
  const absoluteFilePath = normalizeSlashes(sourceFile.getFilePath());
  const absolutePackagePath = normalizeSlashes(target.absolutePath);

  if (!Str.startsWith(`${absolutePackagePath}/`)(absoluteFilePath)) {
    return false;
  }

  const relativeFilePath = normalizeSlashes(path.relative(target.absolutePath, sourceFile.getFilePath()));
  return Str.startsWith(`${srcDir}/`)(relativeFilePath) && !sourceFileMatchesExclude(relativeFilePath, srcDir, exclude);
};

const collectModuleSubject = ({
  diagnostics,
  filePath,
  generatedDocSnippet,
  packageName,
  packagePath,
  repoPath,
  sourceFile,
}: {
  readonly diagnostics: ReadonlyArray<Diagnostic>;
  readonly filePath: string;
  readonly generatedDocSnippet: string | null;
  readonly packageName: string;
  readonly packagePath: string;
  readonly repoPath: string;
  readonly sourceFile: SourceFile;
}): O.Option<DocgenQualitySubjectCandidate> => {
  const rawJsDoc = getTopFileoverviewText(sourceFile);

  if (Str.trim(rawJsDoc).length === 0 || !isFileoverviewJsDoc(rawJsDoc)) {
    return O.none();
  }

  return O.some(
    makeSubjectCandidate({
      declarationKind: "module-fileoverview",
      declarationSource: rawJsDoc,
      diagnostics,
      endLine: 1,
      exportName: "<module fileoverview>",
      filePath,
      generatedDocSnippet,
      hashSourceText: `${rawJsDoc}\n${repoPath}`,
      line: 1,
      packageName,
      packagePath,
      rawJsDoc,
      relatedSymbols: A.empty(),
      repoPath,
      signature: `module ${repoPath}`,
    })
  );
};

const collectReExportSubjects = ({
  diagnostics,
  filePath,
  generatedDocSnippet,
  packageName,
  packagePath,
  repoPath,
  sourceFile,
}: {
  readonly diagnostics: ReadonlyArray<Diagnostic>;
  readonly filePath: string;
  readonly generatedDocSnippet: string | null;
  readonly packageName: string;
  readonly packagePath: string;
  readonly repoPath: string;
  readonly sourceFile: SourceFile;
}): ReadonlyArray<DocgenQualitySubjectCandidate> => {
  let subjects = A.empty<DocgenQualitySubjectCandidate>();

  for (const declaration of sourceFile.getExportDeclarations()) {
    if (declaration.getModuleSpecifierValue() === undefined) {
      continue;
    }

    const rawJsDoc = getLeadingJsDocCommentText(declaration);
    const line = nodeLine(declaration);
    const name =
      declaration.getNamedExports().length === 0
        ? `export * from ${declaration.getModuleSpecifierValue()}`
        : `export { ${A.join(
            A.map(
              declaration.getNamedExports(),
              (specifier) => specifier.getAliasNode()?.getText() ?? specifier.getName()
            ),
            ", "
          )} }`;

    subjects = A.append(
      subjects,
      makeSubjectCandidate({
        declarationKind: "re-export",
        declarationSource: declaration.getText(),
        diagnostics,
        endLine: sourceFile.getLineAndColumnAtPos(declaration.getEnd()).line,
        exportName: name,
        filePath,
        generatedDocSnippet,
        hashSourceText: `${rawJsDoc}\n${declaration.getText()}`,
        line,
        packageName,
        packagePath,
        rawJsDoc,
        relatedSymbols: A.empty(),
        repoPath,
        signature: signatureText(declaration),
      })
    );
  }

  return subjects;
};

const collectDirectExportSubjects = ({
  diagnostics,
  filePath,
  generatedDocSnippet,
  packageName,
  packagePath,
  repoPath,
  sourceFile,
}: {
  readonly diagnostics: ReadonlyArray<Diagnostic>;
  readonly filePath: string;
  readonly generatedDocSnippet: string | null;
  readonly packageName: string;
  readonly packagePath: string;
  readonly repoPath: string;
  readonly sourceFile: SourceFile;
}): ReadonlyArray<DocgenQualitySubjectCandidate> => {
  let subjects = A.empty<DocgenQualitySubjectCandidate>();

  for (const candidate of collectExportedDeclarationCandidates(sourceFile)) {
    const { declaration, name: exportName } = candidate;
    const rawJsDoc = candidate.rawJsDoc ?? getLastJsDocText(declaration);
    const line = nodeLine(candidate.anchorNode ?? declaration);
    const declarationSource = declarationText(declaration);

    subjects = A.append(
      subjects,
      makeSubjectCandidate({
        declarationKind: getExportKind(declaration),
        declarationSource,
        diagnostics,
        endLine: sourceFile.getLineAndColumnAtPos(declaration.getEnd()).line,
        exportName,
        filePath,
        generatedDocSnippet,
        hashSourceText: `${rawJsDoc}\n${declarationSource}\n${candidate.exportDeclarationText ?? ""}`,
        line,
        packageName,
        packagePath,
        rawJsDoc,
        relatedSymbols: A.empty(),
        repoPath,
        signature: signatureText(declaration),
      })
    );
  }

  return subjects;
};

const generatedDocSnippetForFile = Effect.fn("DocgenQuality.generatedDocSnippetForFile")(function* (
  target: DocgenWorkspacePackage,
  sourceFilePath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const moduleName = sourceFilePath.replace(/\.(tsx?|mts|cts)$/, ".md");
  const docPath = path.join(target.absolutePath, "docs", "modules", moduleName);
  const exists = yield* fs.exists(docPath);

  if (!exists) {
    return null;
  }

  const content = yield* fs.readFileString(docPath);
  return boundedText(content, 1_000);
});

const finalizeSubject = Effect.fn("DocgenQuality.finalizeSubject")(function* (
  candidate: DocgenQualitySubjectCandidate
) {
  const contentHash = yield* decodeContentHashFromSourceText(candidate.hashSourceText).pipe(
    Effect.mapError((cause) => new DomainError({ message: "Failed to compute JSDoc quality subject hash.", cause }))
  );
  const { hashSourceText: _hashSourceText, identityStem, ...subject } = candidate;
  void _hashSourceText;
  return new DocgenQualitySubject({
    ...subject,
    stableIdentity: `${identityStem}:${contentHash.slice(0, 12)}`,
    contentHash,
  });
});

const collectPackageSubjectCandidates = Effect.fn("DocgenQuality.collectPackageSubjectCandidates")(function* (
  target: DocgenWorkspacePackage
) {
  const path = yield* Path.Path;
  const config = target.hasDocgenConfig
    ? yield* loadDocgenConfigDocument(target.absolutePath)
    : new DocgenConfigDocument({
        srcDir: "src",
        exclude: A.empty(),
      });
  const repoRoot = yield* findRepoRoot();
  const srcDir = config.srcDir ?? "src";
  const exclude = config.exclude;
  const sourceFileGlobs = pipe(
    QUALITY_TS_GLOBS,
    A.map((glob) => normalizeSlashes(path.join(target.absolutePath, srcDir, glob)))
  );
  const candidates = yield* Effect.try({
    try: () => {
      const project = new Project({
        skipAddingFilesFromTsConfig: true,
        skipFileDependencyResolution: true,
      });
      project.addSourceFilesAtPaths([...sourceFileGlobs]);
      let subjects = A.empty<DocgenQualitySubjectCandidate>();

      for (const sourceFile of project.getSourceFiles()) {
        if (!isInterestingSourceFile(target, sourceFile, srcDir, exclude, path)) {
          continue;
        }

        const filePath = normalizeSlashes(path.relative(target.absolutePath, sourceFile.getFilePath()));
        const repoPath = normalizeSlashes(path.relative(repoRoot, sourceFile.getFilePath()));
        const payload = {
          diagnostics: A.empty<Diagnostic>(),
          filePath,
          generatedDocSnippet: null,
          packageName: target.name,
          packagePath: target.relativePath,
          repoPath,
          sourceFile,
        };

        subjects = [
          ...subjects,
          ...pipe(collectModuleSubject(payload), O.match({ onNone: A.empty, onSome: (subject) => [subject] })),
          ...collectReExportSubjects(payload),
          ...collectDirectExportSubjects(payload),
        ];
      }

      return subjects;
    },
    catch: (cause) =>
      new DomainError({
        message: `Failed to inspect ${target.relativePath} source files for JSDoc quality.`,
        cause,
      }),
  });

  return yield* Effect.forEach(candidates, finalizeSubject);
});

const withGeneratedDocSnippets = Effect.fn("DocgenQuality.withGeneratedDocSnippets")(function* (
  target: DocgenWorkspacePackage,
  subjects: ReadonlyArray<DocgenQualitySubject>
) {
  return yield* Effect.forEach(subjects, (subject) =>
    generatedDocSnippetForFile(target, subject.filePath).pipe(
      Effect.map((snippet) =>
        snippet === subject.generatedDocSnippet
          ? subject
          : new DocgenQualitySubject({
              ...subject,
              generatedDocSnippet: snippet,
            })
      )
    )
  );
});

const exampleHasFencedCode = (example: string): boolean => /```(?:ts|tsx|typescript)?\s*[\s\S]*?```/i.test(example);

const exampleCodeText = (example: string): string => {
  const match = /```(?:ts|tsx|typescript)?\s*([\s\S]*?)```/i.exec(example);
  return match?.[1] ?? example;
};

const exampleIsTooTrivial = (example: string): boolean => {
  const code = pipe(
    exampleCodeText(example).split(/\r?\n/),
    A.map(Str.trim),
    A.filter(Str.isNonEmpty),
    A.filter((line) => !Str.startsWith("//")(line))
  );
  return code.length <= 1;
};

const OBSERVABLE_EXAMPLE_RESULT_PATTERN =
  /expect\s*\(|assert|return\s+|(?:Console|console)\.|Effect\.run|S\.decode|Schema\.decode|Equal\.|\.pipe\(/;

const exampleOnlyVoidsResult = (example: string): boolean => {
  const code = exampleCodeText(example);
  return /void\s+\w+/.test(code) && !OBSERVABLE_EXAMPLE_RESULT_PATTERN.test(code);
};

const exampleHasObservableResult = (example: string): boolean =>
  OBSERVABLE_EXAMPLE_RESULT_PATTERN.test(exampleCodeText(example));

const addFinding = (
  findings: ReadonlyArray<DocgenQualityFinding>,
  finding: DocgenQualityFinding
): ReadonlyArray<DocgenQualityFinding> => A.append(findings, finding);

const makeFinding = ({
  code,
  evidence,
  message,
  remediation,
  scoreImpact,
  tier,
}: {
  readonly code: DocgenQualityFindingCode;
  readonly evidence: ReadonlyArray<string>;
  readonly message: string;
  readonly remediation: string;
  readonly scoreImpact: number;
  readonly tier: DocgenQualityTier;
}): DocgenQualityFinding =>
  new DocgenQualityFinding({
    code,
    evidence,
    message,
    remediation,
    scoreImpact,
    tier,
  });

const scoreSubject = (subject: DocgenQualitySubject): DocgenQualityReview => {
  let findings: ReadonlyArray<DocgenQualityFinding> = A.empty();

  if (subject.description === null || Str.trim(subject.description).length === 0) {
    findings = addFinding(
      findings,
      makeFinding({
        code: "missing-description",
        evidence: [subject.sourceAnchor],
        message: "JSDoc is missing a useful description.",
        remediation: "Add a short description that explains the exported symbol's purpose.",
        scoreImpact: 3,
        tier: "fail",
      })
    );
  }

  for (const tag of subject.deterministicMissingTags) {
    const code = tag === "@example" ? "missing-example" : tag === "@category" ? "missing-category" : "missing-since";
    findings = addFinding(
      findings,
      makeFinding({
        code,
        evidence: [subject.sourceAnchor],
        message: `JSDoc is missing required ${tag}.`,
        remediation:
          tag === "@example"
            ? "Add a realistic @example that shows meaningful input and observable output."
            : `Add ${tag} using the repo's documented JSDoc conventions.`,
        scoreImpact: tag === "@example" ? 4 : 3,
        tier: "fail",
      })
    );
  }

  for (const issue of subject.categoryIssues) {
    findings = addFinding(
      findings,
      makeFinding({
        code: "invalid-category",
        evidence: [issue],
        message: issue,
        remediation: "Use one canonical @category value from the repo taxonomy.",
        scoreImpact: 3,
        tier: "fail",
      })
    );
  }

  for (const example of subject.parsedExamples) {
    if (!exampleHasFencedCode(example)) {
      findings = addFinding(
        findings,
        makeFinding({
          code: "example-not-code-fenced",
          evidence: [boundedText(example, 160)],
          message: "@example should include a fenced TypeScript code block.",
          remediation: "Wrap the example in a ```ts fenced block so docgen can validate it.",
          scoreImpact: 1,
          tier: "warn",
        })
      );
    }

    if (exampleIsTooTrivial(example)) {
      findings = addFinding(
        findings,
        makeFinding({
          code: "example-too-trivial",
          evidence: [boundedText(exampleCodeText(example), 160)],
          message: "@example is too small to teach meaningful use.",
          remediation: "Show a realistic call site with setup, input, and an observable result.",
          scoreImpact: 2,
          tier: "warn",
        })
      );
    }

    if (exampleOnlyVoidsResult(example)) {
      findings = addFinding(
        findings,
        makeFinding({
          code: "example-only-voids-result",
          evidence: [boundedText(exampleCodeText(example), 160)],
          message: "@example only silences the result instead of showing what matters.",
          remediation: "Replace `void result` with an assertion, returned value, or visible decoded value.",
          scoreImpact: 2,
          tier: "warn",
        })
      );
    }
  }

  if (subject.parsedExamples.length > 0 && !A.some(subject.parsedExamples, exampleHasObservableResult)) {
    findings = addFinding(
      findings,
      makeFinding({
        code: "example-lacks-observable-result",
        evidence: [subject.sourceAnchor],
        message: "@example does not show an observable result or assertion.",
        remediation: "Make the example demonstrate the output, assertion, Effect execution, or decoded value.",
        scoreImpact: 2,
        tier: "warn",
      })
    );
  }

  if (/Effect(\.|<)/.test(subject.signature) && !hasTag(subject.tags, "@effects")) {
    findings = addFinding(
      findings,
      makeFinding({
        code: "missing-effects-for-effectful-symbol",
        evidence: [subject.signature],
        message: "Effectful API lacks an @effects note.",
        remediation: "Add @effects to name required services, expected failures, or execution behavior.",
        scoreImpact: 1,
        tier: "warn",
      })
    );
  }

  const score = Math.max(1, 10 - A.reduce(findings, 0, (total, finding) => total + finding.scoreImpact));
  const tier: DocgenQualityTier = A.some(findings, (finding) => finding.tier === "fail")
    ? "fail"
    : score < 8 || findings.length > 0
      ? "warn"
      : "pass";
  const rationale =
    findings.length === 0
      ? "JSDoc block supplies the required tags, useful description, and a meaningful example."
      : A.join(
          pipe(
            findings,
            A.take(3),
            A.map((finding) => finding.message)
          ),
          " "
        );

  return new DocgenQualityReview({
    subjectId: subject.stableIdentity,
    tier,
    score,
    findings,
    rationale,
  });
};

const summarizeReviews = (
  packages: number,
  subjects: number,
  reviews: ReadonlyArray<DocgenQualityReview>,
  remediationPackets: number
): DocgenQualitySummary =>
  new DocgenQualitySummary({
    packages,
    subjects,
    passing: A.filter(reviews, (review) => review.tier === "pass").length,
    warnings: A.filter(reviews, (review) => review.tier === "warn").length,
    failures: A.filter(reviews, (review) => review.tier === "fail").length,
    remediationPackets,
  });

const remediationPrompt = (subject: DocgenQualitySubject, review: DocgenQualityReview): string =>
  [
    "Improve the JSDoc block for this exported symbol without changing runtime behavior.",
    "",
    `Subject: ${subject.stableIdentity}`,
    `Anchor: ${subject.sourceAnchor}`,
    `Signature: ${subject.signature}`,
    "",
    "Findings:",
    ...A.map(review.findings, (finding) => `- ${finding.code}: ${finding.remediation}`),
    "",
    "Keep @example mandatory. Prefer a realistic TypeScript example with an observable result.",
  ].join("\n");

const shellQuote = (value: string): string => `'${Str.replace(/'/g, "'\\''")(value)}'`;

const makeRemediationPacket = (
  subject: DocgenQualitySubject,
  review: DocgenQualityReview
): DocgenQualityRemediationPacket =>
  new DocgenQualityRemediationPacket({
    id: `${subject.contentHash}:jsdoc-quality`,
    subjectId: subject.stableIdentity,
    title: `Improve JSDoc for ${subject.exportName}`,
    prompt: remediationPrompt(subject, review),
    verificationCommand: `bun run beep docgen quality -p ${shellQuote(subject.packagePath)} --json`,
    verificationArgv: ["bun", "run", "beep", "docgen", "quality", "-p", subject.packagePath, "--json"],
  });

const remediationPacketsForPackage = (pkg: DocgenQualityPackageReport): ReadonlyArray<DocgenQualityRemediationPacket> =>
  pipe(
    pkg.reviews,
    A.filter((review) => review.tier !== "pass"),
    A.flatMap((review) => {
      const subject = A.findFirst(pkg.subjects, (candidate) => candidate.stableIdentity === review.subjectId);
      return O.isSome(subject)
        ? [makeRemediationPacket(subject.value, review)]
        : A.empty<DocgenQualityRemediationPacket>();
    })
  );

const withRemediationPacketCount = (
  pkg: DocgenQualityPackageReport,
  remediationPackets: number
): DocgenQualityPackageReport =>
  new DocgenQualityPackageReport({
    ...pkg,
    summary: summarizeReviews(1, pkg.subjects.length, pkg.reviews, remediationPackets),
  });

const packageReport = (
  target: DocgenWorkspacePackage,
  subjects: ReadonlyArray<DocgenQualitySubject>
): DocgenQualityPackageReport => {
  const reviews = A.map(subjects, scoreSubject);
  return new DocgenQualityPackageReport({
    packageName: target.name,
    packagePath: target.relativePath,
    subjects,
    reviews,
    summary: summarizeReviews(1, subjects.length, reviews, 0),
  });
};

/**
 * Builds a package-local quality report from ts-morph-enriched subjects.
 *
 * @effects Reads package docgen configuration and TypeScript source files.
 * @example
 * ```ts
 * import { FsUtilsLive } from "@beep/repo-utils"
 * import { analyzePackageQuality } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 * import { discoverDocgenWorkspacePackages } from "@beep/repo-cli/commands/Docgen/internal/Operations"
 * import { BunServices } from "@effect/platform-bun"
 * import { Effect, Layer } from "effect"
 *
 * const RuntimeLayer = Layer.mergeAll(FsUtilsLive).pipe(Layer.provideMerge(BunServices.layer))
 *
 * const program = Effect.gen(function* () {
 *   const packages = yield* discoverDocgenWorkspacePackages()
 *   const target = packages[0]
 *   if (target === undefined) return "no packages"
 *   const report = yield* analyzePackageQuality(target)
 *   return `${report.packageName}: ${report.summary.subjects} subjects`
 * })
 *
 * Effect.runPromise(program.pipe(Effect.provide(RuntimeLayer))).then(console.log)
 * ```
 * @category workflows
 * @since 0.0.0
 */
export const analyzePackageQuality = Effect.fn("DocgenQuality.analyzePackageQuality")(function* (
  target: DocgenWorkspacePackage
) {
  const candidates = yield* collectPackageSubjectCandidates(target);
  const subjects = yield* withGeneratedDocSnippets(
    target,
    pipe(
      candidates,
      A.dedupeWith((left, right) => left.stableIdentity === right.stableIdentity),
      A.sort(bySubjectIdentityAscending)
    )
  );
  return packageReport(target, subjects);
});

/**
 * Builds the consolidated report emitted by the quality command.
 *
 * @effects Runs package-local JSDoc quality analysis for the provided targets.
 * @example
 * ```ts
 * import { FsUtilsLive } from "@beep/repo-utils"
 * import { analyzeDocgenQuality } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 * import { discoverDocgenWorkspacePackages } from "@beep/repo-cli/commands/Docgen/internal/Operations"
 * import { BunServices } from "@effect/platform-bun"
 * import { Effect, Layer } from "effect"
 *
 * const RuntimeLayer = Layer.mergeAll(FsUtilsLive).pipe(Layer.provideMerge(BunServices.layer))
 *
 * const program = Effect.gen(function* () {
 *   const targets = yield* discoverDocgenWorkspacePackages()
 *   const report = yield* analyzeDocgenQuality({ scope: "all", scoreMode: "rubric", targets })
 *   return `${report.summary.packages} packages reviewed`
 * })
 *
 * Effect.runPromise(program.pipe(Effect.provide(RuntimeLayer))).then(console.log)
 * ```
 * @category workflows
 * @since 0.0.0
 */
export const analyzeDocgenQuality = Effect.fn("DocgenQuality.analyzeDocgenQuality")(function* ({
  scope,
  scoreMode,
  targets,
}: {
  readonly scope: DocgenQualityScopeMode;
  readonly scoreMode: DocgenQualityScoreMode;
  readonly targets: ReadonlyArray<DocgenWorkspacePackage>;
}) {
  const analyzedPackages = yield* Effect.forEach(targets, analyzePackageQuality, { concurrency: 2 });
  const packagePackets = A.map(analyzedPackages, (pkg) => ({
    packets: scoreMode === "codex" ? remediationPacketsForPackage(pkg) : A.empty<DocgenQualityRemediationPacket>(),
    pkg,
  }));
  const packages = A.map(packagePackets, ({ packets, pkg }) => withRemediationPacketCount(pkg, packets.length));
  const reviews = pipe(
    packages,
    A.flatMap((pkg) => pkg.reviews)
  );
  const subjects = pipe(
    packages,
    A.flatMap((pkg) => pkg.subjects)
  );
  const remediationPackets = pipe(
    packagePackets,
    A.flatMap(({ packets }) => packets)
  );

  return new DocgenQualityReport({
    schemaVersion: QUALITY_SCHEMA_VERSION,
    rubricVersion: QUALITY_RUBRIC_VERSION,
    generatedAt: timestampIso(),
    scope,
    scorer: scoreMode === "codex" ? "codex-advisory-packet-v1" : "deterministic-rubric-v1",
    summary: summarizeReviews(packages.length, subjects.length, reviews, remediationPackets.length),
    packages,
    remediationPackets,
  });
});

/**
 * Renders a quality report as stable JSON.
 *
 * @param report - Consolidated quality report to encode.
 * @returns An Effect that yields the formatted JSON report.
 * @effects Encodes the report as formatted JSON and fails with a typed domain error if encoding fails.
 * @example
 * ```ts
 * import { FsUtilsLive } from "@beep/repo-utils"
 * import { analyzeDocgenQuality, generateQualityJson } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 * import { BunServices } from "@effect/platform-bun"
 * import { Effect, Layer } from "effect"
 *
 * const RuntimeLayer = Layer.mergeAll(FsUtilsLive).pipe(Layer.provideMerge(BunServices.layer))
 *
 * const program = Effect.gen(function* () {
 *   const report = yield* analyzeDocgenQuality({ scope: "all", scoreMode: "rubric", targets: [] })
 *   const json = yield* generateQualityJson(report)
 *   return json.includes("\"schemaVersion\"")
 * })
 *
 * Effect.runPromise(program.pipe(Effect.provide(RuntimeLayer))).then(console.log)
 * ```
 * @category formatting
 * @since 0.0.0
 */
export const generateQualityJson = (report: DocgenQualityReport): Effect.Effect<string, DomainError> =>
  renderJson(report);

const markdownSubject = (subject: DocgenQualitySubject, review: DocgenQualityReview): string => {
  const findingLines =
    review.findings.length === 0
      ? ["  - No findings."]
      : A.map(
          review.findings,
          (finding) => `  - ${finding.code} (${finding.tier}, -${finding.scoreImpact}): ${finding.message}`
        );

  return [
    `### ${subject.exportName}`,
    "",
    `- Anchor: \`${subject.sourceAnchor}\``,
    `- Kind: \`${subject.declarationKind}\``,
    `- Score: ${review.score}/10 (${review.tier})`,
    `- Signature: \`${subject.signature}\``,
    "",
    ...findingLines,
  ].join("\n");
};

/**
 * Renders a quality report as human-readable Markdown.
 *
 * @param report - Consolidated quality report to render.
 * @returns Human-readable Markdown report content.
 * @example
 * ```ts
 * import { FsUtilsLive } from "@beep/repo-utils"
 * import { analyzeDocgenQuality, generateQualityReport } from "@beep/repo-cli/commands/Docgen/internal/Quality"
 * import { BunServices } from "@effect/platform-bun"
 * import { Effect, Layer } from "effect"
 *
 * const RuntimeLayer = Layer.mergeAll(FsUtilsLive).pipe(Layer.provideMerge(BunServices.layer))
 *
 * const program = Effect.gen(function* () {
 *   const report = yield* analyzeDocgenQuality({ scope: "all", scoreMode: "rubric", targets: [] })
 *   const markdown = generateQualityReport(report)
 *   return markdown.startsWith("# JSDoc Quality Report")
 * })
 *
 * Effect.runPromise(program.pipe(Effect.provide(RuntimeLayer))).then(console.log)
 * ```
 * @category formatting
 * @since 0.0.0
 */
export const generateQualityReport = (report: DocgenQualityReport): string => {
  const lines = [
    "# JSDoc Quality Report",
    "",
    `- Generated: ${report.generatedAt}`,
    `- Scope: ${report.scope}`,
    `- Scorer: ${report.scorer}`,
    `- Rubric: ${report.rubricVersion}`,
    `- Packages: ${report.summary.packages}`,
    `- Subjects: ${report.summary.subjects}`,
    `- Passing: ${report.summary.passing}`,
    `- Warnings: ${report.summary.warnings}`,
    `- Failures: ${report.summary.failures}`,
    `- Remediation packets: ${report.summary.remediationPackets}`,
    "",
  ];

  for (const pkg of report.packages) {
    lines.push(`## ${pkg.packageName}`, "", `Path: \`${pkg.packagePath}\``, "");

    if (pkg.subjects.length === 0) {
      lines.push("No exported-symbol JSDoc subjects found.", "");
      continue;
    }

    for (const subject of pkg.subjects) {
      const review = A.findFirst(pkg.reviews, (candidate) => candidate.subjectId === subject.stableIdentity);
      if (O.isSome(review)) {
        lines.push(markdownSubject(subject, review.value), "");
      }
    }
  }

  if (report.remediationPackets.length > 0) {
    lines.push("## Remediation Packets", "");
    for (const packet of report.remediationPackets) {
      lines.push(
        `- ${packet.id}: ${packet.title}`,
        `  - Subject: \`${packet.subjectId}\``,
        `  - Verify: \`${packet.verificationCommand}\``,
        "",
        "  ```text",
        ...A.map(packet.prompt.split(/\r?\n/), (line) => `  ${line}`),
        "  ```",
        ""
      );
    }
  }

  return `${A.join(lines, "\n")}\n`;
};
