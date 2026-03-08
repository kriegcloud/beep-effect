/**
 * Human-first docgen operations shared by `beep docgen` and `beep docs aggregate`.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import {
  DomainError,
  decodePackageJsonEffect,
  type FsUtils,
  findRepoRoot,
  type NoSuchFileError,
  type PackageJson,
  resolveWorkspaceDirs,
} from "@beep/repo-utils";
import { LiteralKit } from "@beep/schema";
import { DateTime, Effect, FileSystem, HashMap, MutableHashSet, Order, Path, pipe, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess } from "effect/unstable/process";
import type { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
import * as jsonc from "jsonc-parser";
import { type ExportDeclaration, type JSDoc, Node, Project, type SourceFile, SyntaxKind } from "ts-morph";
import { buildCanonicalAliasTargets, resolveRootExportTarget } from "../../Shared/TsconfigAliasTargets.js";

const $I = $RepoCliId.create("commands/Docgen/internal/Operations");

const DOCGEN_CONFIG_FILENAME = "docgen.json" as const;
const DOCS_MODULES_SEGMENTS = ["docs", "modules"] as const;
const REQUIRED_TAGS = ["@category", "@example", "@since"] as const;
const parseJsonText = S.decodeUnknownSync(S.UnknownFromJsonString);
const byRelativePathAscending: Order.Order<DocgenWorkspacePackage> = Order.mapInput(
  Order.String,
  (pkg: DocgenWorkspacePackage) => pkg.relativePath
);
const byDocsOutputPathAscending: Order.Order<DocgenWorkspacePackage> = Order.mapInput(
  Order.String,
  (pkg: DocgenWorkspacePackage) => pkg.docsOutputPath
);
const byIssueAscending: Order.Order<DocgenExportAnalysis> = Order.mapInput(
  Order.String,
  (analysis: DocgenExportAnalysis) =>
    `${analysis.priority === "high" ? "0" : analysis.priority === "medium" ? "1" : "2"}:${analysis.filePath}:${analysis.line}:${analysis.name}`
);

/**
 * Workspace docgen status derived from config and generated output presence.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const DocgenPackageStatus = LiteralKit([
  "configured-and-generated",
  "configured-not-generated",
  "not-configured",
] as const).annotate(
  $I.annote("DocgenPackageStatus", {
    description: "Workspace docgen status derived from config and generated output presence.",
  })
);
/**
 * Workspace docgen status derived from config and generated output presence.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DocgenPackageStatus = typeof DocgenPackageStatus.Type;

const DocgenJsonObject = S.Record(S.String, S.Unknown).annotate(
  $I.annote("DocgenJsonObject", {
    description: "Generic JSON object payload used for docgen compiler option blocks.",
  })
);

/**
 * Parsed `docgen.json` document used by the command suite.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DocgenConfigDocument extends S.Class<DocgenConfigDocument>($I`DocgenConfigDocument`)(
  {
    $schema: S.optionalKey(S.String),
    projectHomepage: S.optionalKey(S.String),
    srcLink: S.optionalKey(S.String),
    srcDir: S.optionalKey(S.String),
    outDir: S.optionalKey(S.String),
    theme: S.optionalKey(S.String),
    enableSearch: S.optionalKey(S.Boolean),
    enforceDescriptions: S.optionalKey(S.Boolean),
    enforceExamples: S.optionalKey(S.Boolean),
    enforceVersion: S.optionalKey(S.Boolean),
    tscExecutable: S.optionalKey(S.String),
    runExamples: S.optionalKey(S.Boolean),
    exclude: S.optionalKey(S.Array(S.String)),
    parseCompilerOptions: S.optionalKey(S.Union([S.String, DocgenJsonObject])),
    examplesCompilerOptions: S.optionalKey(S.Union([S.String, DocgenJsonObject])),
  },
  $I.annote("DocgenConfigDocument", {
    description: "Parsed docgen.json document used by the command suite.",
  })
) {}

/**
 * Workspace package metadata used by docgen commands.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DocgenWorkspacePackage extends S.Class<DocgenWorkspacePackage>($I`DocgenWorkspacePackage`)(
  {
    name: S.String,
    relativePath: S.String,
    absolutePath: S.String,
    docsOutputPath: S.String,
    hasDocgenConfig: S.Boolean,
    hasGeneratedDocs: S.Boolean,
    status: DocgenPackageStatus,
  },
  $I.annote("DocgenWorkspacePackage", {
    description: "Workspace package metadata used by docgen commands.",
  })
) {}

/**
 * Issue priority used by analysis findings.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const DocgenIssuePriority = LiteralKit(["high", "medium", "low"] as const).annotate(
  $I.annote("DocgenIssuePriority", {
    description: "Issue priority used by analysis findings.",
  })
);
/**
 * Issue priority used by analysis findings.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DocgenIssuePriority = typeof DocgenIssuePriority.Type;

/**
 * Export kind surfaced by analysis.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const DocgenExportKind = LiteralKit([
  "function",
  "const",
  "type",
  "interface",
  "class",
  "namespace",
  "enum",
  "re-export",
  "module-fileoverview",
] as const).annotate(
  $I.annote("DocgenExportKind", {
    description: "Export kind surfaced by analysis.",
  })
);
/**
 * Export kind surfaced by analysis.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DocgenExportKind = typeof DocgenExportKind.Type;

/**
 * Analysis finding for a single export or module-level doc requirement.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DocgenExportAnalysis extends S.Class<DocgenExportAnalysis>($I`DocgenExportAnalysis`)(
  {
    name: S.String,
    kind: DocgenExportKind,
    filePath: S.String,
    line: S.Number,
    presentTags: S.Array(S.String),
    missingTags: S.Array(S.String),
    hasJsDoc: S.Boolean,
    context: S.optionalKey(S.String),
    priority: DocgenIssuePriority,
    declarationSource: S.String,
  },
  $I.annote("DocgenExportAnalysis", {
    description: "Analysis finding for a single export or module-level doc requirement.",
  })
) {}

/**
 * Summary counts for a package analysis run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DocgenAnalysisSummary extends S.Class<DocgenAnalysisSummary>($I`DocgenAnalysisSummary`)(
  {
    totalExports: S.Number,
    fullyDocumented: S.Number,
    missingDocumentation: S.Number,
    missingCategory: S.Number,
    missingExample: S.Number,
    missingSince: S.Number,
  },
  $I.annote("DocgenAnalysisSummary", {
    description: "Summary counts for a package analysis run.",
  })
) {}

/**
 * Package-level analysis document written by `docgen analyze`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DocgenPackageAnalysis extends S.Class<DocgenPackageAnalysis>($I`DocgenPackageAnalysis`)(
  {
    packageName: S.String,
    packagePath: S.String,
    timestamp: S.String,
    exports: S.Array(DocgenExportAnalysis),
    summary: DocgenAnalysisSummary,
  },
  $I.annote("DocgenPackageAnalysis", {
    description: "Package-level analysis document written by docgen analyze.",
  })
) {}

/**
 * Per-package docgen generation result.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DocgenGenerationResult extends S.Class<DocgenGenerationResult>($I`DocgenGenerationResult`)(
  {
    packageName: S.String,
    packagePath: S.String,
    success: S.Boolean,
    moduleCount: S.optionalKey(S.Number),
    error: S.optionalKey(S.String),
    output: S.optionalKey(S.String),
  },
  $I.annote("DocgenGenerationResult", {
    description: "Per-package docgen generation result.",
  })
) {}

/**
 * Per-package aggregated docs result.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DocgenAggregateResult extends S.Class<DocgenAggregateResult>($I`DocgenAggregateResult`)(
  {
    packageName: S.String,
    packagePath: S.String,
    docsOutputPath: S.String,
    fileCount: S.Number,
  },
  $I.annote("DocgenAggregateResult", {
    description: "Per-package aggregated docs result.",
  })
) {}

class RootTsconfigCompilerOptions extends S.Class<RootTsconfigCompilerOptions>($I`RootTsconfigCompilerOptions`)(
  {
    paths: S.optionalKey(S.Record(S.String, S.Array(S.String))),
  },
  $I.annote("RootTsconfigCompilerOptions", {
    description: "Minimal compiler options shape containing tsconfig path aliases.",
  })
) {}

class RootTsconfigPathsDocument extends S.Class<RootTsconfigPathsDocument>($I`RootTsconfigPathsDocument`)(
  {
    compilerOptions: S.optionalKey(RootTsconfigCompilerOptions),
  },
  $I.annote("RootTsconfigPathsDocument", {
    description: "Minimal root tsconfig shape containing compilerOptions.paths.",
  })
) {}
const decodeDocgenConfigDocument = S.decodeUnknownEffect(DocgenConfigDocument);
const decodeRootTsconfigPathsDocument = S.decodeUnknownEffect(RootTsconfigPathsDocument);

const normalizeSlashes = (value: string): string => Str.replace(/\\/g, "/")(value);

const stringFromUnknown = (value: unknown): string => {
  if (P.isString(value)) {
    return value;
  }
  if (P.isError(value)) {
    return value.message;
  }
  return `${value}`;
};

const recordOrEmpty = (value: O.Option<Readonly<Record<string, string>>>): Readonly<Record<string, string>> =>
  O.getOrElse(value, () => ({}) as Record<string, string>);

const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const jsonText = (value: unknown): string => `${encodeJson(value)}\n`;

const readUnknownJsonFile = (filePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to read "${filePath}"`, cause })));
    const parsed = yield* Effect.try({
      try: () => parseJsonText(content),
      catch: (cause) => new DomainError({ message: `Invalid JSON in "${filePath}"`, cause }),
    });
    return parsed;
  });

const readUnknownJsoncFile = (filePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to read "${filePath}"`, cause })));
    const errors: Array<jsonc.ParseError> = [];
    const parsed = jsonc.parse(content, errors);

    if (errors.length > 0) {
      return yield* new DomainError({
        message: `Invalid JSONC in "${filePath}": ${errors.map((error) => jsonc.printParseErrorCode(error.error)).join(", ")}`,
      });
    }

    return parsed;
  });

const readPackageJson = (absolutePackagePath: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const packageJsonPath = path.join(absolutePackagePath, "package.json");
    const parsed = yield* readUnknownJsonFile(packageJsonPath);
    return yield* decodePackageJsonEffect(parsed).pipe(
      Effect.mapError((cause) => new DomainError({ message: `Invalid package.json at "${packageJsonPath}"`, cause }))
    );
  });

const readRootTsconfigPaths = (rootDir: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const tsconfigPath = path.join(rootDir, "tsconfig.json");
    const parsed = yield* readUnknownJsoncFile(tsconfigPath);
    const decoded = yield* decodeRootTsconfigPathsDocument(parsed).pipe(
      Effect.mapError(
        (cause) => new DomainError({ message: `Invalid JSONC shape in "${tsconfigPath}": ${cause.message}`, cause })
      )
    );
    return decoded.compilerOptions?.paths ?? {};
  });

const collectWorkspaceDependencyNames = (packageJson: PackageJson.Type): ReadonlyArray<string> =>
  pipe(
    [
      ...Object.keys(recordOrEmpty(packageJson.dependencies)),
      ...Object.keys(recordOrEmpty(packageJson.devDependencies)),
      ...Object.keys(recordOrEmpty(packageJson.peerDependencies)),
      ...Object.keys(recordOrEmpty(packageJson.optionalDependencies)),
    ],
    A.filter((name) => Str.startsWith("@beep/")(name)),
    MutableHashSet.fromIterable,
    A.fromIterable,
    A.sort(Order.String)
  );

const withRootRelativePrefix = (rootRelativePrefix: string, targetPath: string): string =>
  `${rootRelativePrefix}${Str.replace(/^\.\//, "")(targetPath)}`;

const buildOwnPathMappings = (
  packageName: string,
  packageRelativePath: string,
  packageJson: PackageJson.Type,
  rootRelativePrefix: string
): Readonly<Record<string, ReadonlyArray<string>>> => {
  const exportsField = O.isSome(packageJson.exports) ? packageJson.exports.value : undefined;
  const rootExportTarget = pipe(
    exportsField,
    resolveRootExportTarget,
    O.getOrElse(() => "./src/index.ts")
  );
  const aliasTargets = buildCanonicalAliasTargets(packageRelativePath, rootExportTarget);

  return {
    [packageName]: [withRootRelativePrefix(rootRelativePrefix, aliasTargets.rootAliasTarget)],
    [`${packageName}/*`]: [withRootRelativePrefix(rootRelativePrefix, aliasTargets.wildcardAliasTarget)],
  };
};

const buildExamplesPaths = (
  rootDir: string,
  packageDir: string,
  packageName: string,
  packageRelativePath: string,
  rootPaths: Readonly<Record<string, ReadonlyArray<string>>>,
  packageJson: PackageJson.Type
) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const rootRelative = normalizeSlashes(path.relative(packageDir, rootDir));
    const rootRelativePrefix = rootRelative.length === 0 ? "./" : `${rootRelative}/`;
    let mappings: Record<string, ReadonlyArray<string>> = {
      effect: [withRootRelativePrefix(rootRelativePrefix, "./packages/effect/src/index.ts")],
      ...buildOwnPathMappings(packageName, packageRelativePath, packageJson, rootRelativePrefix),
    };

    const workspaceDependencies = collectWorkspaceDependencyNames(packageJson);

    for (const dependencyName of workspaceDependencies) {
      const matchingEntries = pipe(
        R.toEntries(rootPaths),
        A.filter(([key]) => key === dependencyName || Str.startsWith(`${dependencyName}/`)(key))
      );

      for (const [key, values] of matchingEntries) {
        mappings = {
          ...mappings,
          [key]: A.map(values, (value) => withRootRelativePrefix(rootRelativePrefix, value)),
        };
      }
    }

    return mappings;
  });

const packageHasDocgenConfig = (absolutePackagePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    return yield* fs
      .exists(path.join(absolutePackagePath, DOCGEN_CONFIG_FILENAME))
      .pipe(Effect.orElseSucceed(() => false));
  });

const packageHasGeneratedDocs = (absolutePackagePath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    return yield* fs
      .exists(path.join(absolutePackagePath, ...DOCS_MODULES_SEGMENTS))
      .pipe(Effect.orElseSucceed(() => false));
  });

const computePackageStatus = (hasDocgenConfig: boolean, hasGeneratedDocs: boolean): DocgenPackageStatus => {
  if (hasDocgenConfig && hasGeneratedDocs) {
    return "configured-and-generated";
  }
  if (hasDocgenConfig) {
    return "configured-not-generated";
  }
  return "not-configured";
};

const relativePathWithinPackage = (absolutePackagePath: string, absoluteFilePath: string, path: Path.Path): string =>
  normalizeSlashes(path.relative(absolutePackagePath, absoluteFilePath));

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

  return [];
};

const extractJsDocTags = (node: Node): ReadonlyArray<string> =>
  pipe(
    getJsDocs(node),
    A.flatMap((doc) => A.map(doc.getTags(), (tag) => `@${tag.getTagName()}`))
  );

const extractContext = (node: Node): undefined | string =>
  pipe(
    getJsDocs(node),
    A.head,
    O.flatMap((doc) => O.fromNullishOr(doc.getDescription())),
    O.map((description) => Str.trim(description)),
    O.filter((description) => description.length > 0),
    O.map((description) => {
      const [firstLine] = description.split("\n");
      return firstLine === undefined ? description : firstLine;
    }),
    O.getOrUndefined
  );

const hasJsDocComment = (node: Node): boolean => getJsDocs(node).length > 0;

const getExportKind = (node: Node): DocgenExportKind => {
  if (Node.isFunctionDeclaration(node)) return "function";
  if (Node.isVariableDeclaration(node)) return "const";
  if (Node.isTypeAliasDeclaration(node)) return "type";
  if (Node.isInterfaceDeclaration(node)) return "interface";
  if (Node.isClassDeclaration(node)) return "class";
  if (Node.isModuleDeclaration(node)) return "namespace";
  if (Node.isEnumDeclaration(node)) return "enum";
  return "const";
};

const computePriority = (hasJsDoc: boolean, missingTags: ReadonlyArray<string>): DocgenIssuePriority => {
  if (!hasJsDoc || missingTags.length >= 3) {
    return "high";
  }
  if (missingTags.length > 0) {
    return "medium";
  }
  return "low";
};

const makeExportAnalysis = (options: {
  readonly name: string;
  readonly kind: DocgenExportKind;
  readonly filePath: string;
  readonly line: number;
  readonly presentTags: ReadonlyArray<string>;
  readonly missingTags: ReadonlyArray<string>;
  readonly hasJsDoc: boolean;
  readonly declarationSource: string;
  readonly context?: string | undefined;
}): DocgenExportAnalysis =>
  new DocgenExportAnalysis({
    name: options.name,
    kind: options.kind,
    filePath: options.filePath,
    line: options.line,
    presentTags: [...options.presentTags],
    missingTags: [...options.missingTags],
    hasJsDoc: options.hasJsDoc,
    priority: computePriority(options.hasJsDoc, options.missingTags),
    declarationSource: options.declarationSource,
    ...(options.context === undefined ? {} : { context: options.context }),
  });

const analyzeExport = (name: string, node: Node, filePath: string): DocgenExportAnalysis => {
  const presentTags = extractJsDocTags(node);
  const missingTags = A.filter(REQUIRED_TAGS, (tag) => !A.contains(presentTags, tag));

  return makeExportAnalysis({
    name,
    kind: getExportKind(node),
    filePath,
    line: node.getStartLineNumber(),
    presentTags,
    missingTags,
    hasJsDoc: hasJsDocComment(node),
    declarationSource: node.getText(),
    context: extractContext(node),
  });
};

const analyzeModuleFileoverview = (
  sourceFile: SourceFile,
  relativeFilePath: string
): O.Option<DocgenExportAnalysis> => {
  const match = /^\s*(\/\*\*[\s\S]*?\*\/)/.exec(sourceFile.getFullText());

  if (match === null) {
    return O.some(
      makeExportAnalysis({
        name: "<module fileoverview>",
        kind: "module-fileoverview",
        filePath: relativeFilePath,
        line: 1,
        presentTags: [],
        missingTags: ["@since"],
        hasJsDoc: false,
        declarationSource: "",
        context: "Module fileoverview JSDoc is missing.",
      })
    );
  }

  const commentText = match[1] ?? "";
  if (/@since\b/.test(commentText)) {
    return O.none();
  }

  const presentTags = pipe(
    ["@file", "@fileoverview", "@module", "@category", "@example"] as const,
    A.filter((tag) => Str.includes(tag)(commentText))
  );

  return O.some(
    makeExportAnalysis({
      name: "<module fileoverview>",
      kind: "module-fileoverview",
      filePath: relativeFilePath,
      line: 1,
      presentTags,
      missingTags: ["@since"],
      hasJsDoc: true,
      declarationSource: commentText,
      context: "Module fileoverview is missing @since.",
    })
  );
};

const analyzeReExports = (sourceFile: SourceFile, relativeFilePath: string): ReadonlyArray<DocgenExportAnalysis> =>
  pipe(
    sourceFile.getDescendantsOfKind(SyntaxKind.ExportDeclaration),
    A.filter((declaration: ExportDeclaration) => declaration.getModuleSpecifier() !== undefined),
    A.map((declaration: ExportDeclaration) => {
      const presentTags = pipe(
        getJsDocs(declaration),
        A.flatMap((doc) => A.map(doc.getTags(), (tag) => `@${tag.getTagName()}`))
      );
      const hasJsDoc = presentTags.length > 0;
      const missingTags = hasJsDoc
        ? A.filter(["@since"] as const, (tag) => !A.contains(presentTags, tag))
        : [...REQUIRED_TAGS];

      return makeExportAnalysis({
        name: declaration.getText(),
        kind: "re-export",
        filePath: relativeFilePath,
        line: declaration.getStartLineNumber(),
        presentTags,
        missingTags,
        hasJsDoc,
        declarationSource: declaration.getText(),
        context: `Re-export from ${declaration.getModuleSpecifierValue() ?? "<unknown>"} needs documentation.`,
      });
    }),
    A.filter((analysis) => analysis.missingTags.length > 0)
  );

const sourceFileMatchesExclude = (
  absolutePackagePath: string,
  srcDir: string,
  sourceFilePath: string,
  pattern: string
): boolean => {
  const normalizedPattern = normalizeSlashes(Str.replace(/^\.\//, "")(pattern));
  const packageRelative = normalizeSlashes(sourceFilePath).replace(`${normalizeSlashes(absolutePackagePath)}/`, "");
  const srcRelative = packageRelative.startsWith(`${srcDir}/`)
    ? packageRelative.slice(srcDir.length + 1)
    : packageRelative;
  const escapedPattern = Str.replace(/[.+?^${}()|[\]\\]/g, "\\$&")(normalizedPattern);
  const patternRegex = new RegExp(`^${Str.replace(/\*/g, ".*")(escapedPattern)}$`);

  return [packageRelative, srcRelative].some((candidate) => patternRegex.test(candidate));
};

const getSourceFiles = (
  project: Project,
  absolutePackagePath: string,
  srcDir: string,
  exclude: ReadonlyArray<string>
): ReadonlyArray<SourceFile> => {
  const baseDir = normalizeSlashes(`${absolutePackagePath}/${srcDir}`);
  project.addSourceFilesAtPaths(`${baseDir}/**/*.ts`);
  project.addSourceFilesAtPaths(`${baseDir}/**/*.tsx`);

  return pipe(
    project.getSourceFiles(),
    A.filter((sourceFile) => !Str.endsWith(".d.ts")(sourceFile.getFilePath())),
    A.filter(
      (sourceFile) =>
        !A.some(exclude, (pattern) =>
          sourceFileMatchesExclude(absolutePackagePath, srcDir, sourceFile.getFilePath(), pattern)
        )
    )
  );
};

const analyzeSourceFile = (
  sourceFile: SourceFile,
  absolutePackagePath: string,
  path: Path.Path
): ReadonlyArray<DocgenExportAnalysis> => {
  const relativeFilePath = relativePathWithinPackage(absolutePackagePath, sourceFile.getFilePath(), path);
  const moduleFileoverview = analyzeModuleFileoverview(sourceFile, relativeFilePath);
  const reExports = analyzeReExports(sourceFile, relativeFilePath);
  const directExports = pipe(
    A.fromIterable(sourceFile.getExportedDeclarations().entries()),
    A.flatMap(([name, declarations]) =>
      pipe(
        declarations,
        A.filter((declaration) => declaration.getSourceFile() === sourceFile),
        A.map((declaration) => analyzeExport(name, declaration, relativeFilePath))
      )
    )
  );

  return pipe(O.toArray(moduleFileoverview), A.appendAll(reExports), A.appendAll(directExports));
};

const computeAnalysisSummary = (analyses: ReadonlyArray<DocgenExportAnalysis>): DocgenAnalysisSummary =>
  new DocgenAnalysisSummary({
    totalExports: analyses.length,
    fullyDocumented: analyses.filter((analysis) => analysis.missingTags.length === 0).length,
    missingDocumentation: analyses.filter((analysis) => analysis.missingTags.length > 0).length,
    missingCategory: analyses.filter((analysis) => A.contains(analysis.missingTags, "@category")).length,
    missingExample: analyses.filter((analysis) => A.contains(analysis.missingTags, "@example")).length,
    missingSince: analyses.filter((analysis) => A.contains(analysis.missingTags, "@since")).length,
  });

const formatChecklistItem = (analysis: DocgenExportAnalysis): string =>
  [
    `- [ ] \`${analysis.filePath}:${analysis.line}\` - **${analysis.name}** (${analysis.kind})`,
    `  - Missing: ${analysis.missingTags.join(", ") || "none"}`,
    ...(analysis.presentTags.length === 0 ? [] : [`  - Has: ${analysis.presentTags.join(", ")}`]),
    ...(analysis.context === undefined ? [] : [`  - Context: ${analysis.context}`]),
  ].join("\n");

const generateDocsIndexContent = (packageName: string, outputPath: string, order: number): string => `---
title: "${packageName}"
has_children: true
permalink: /docs/${normalizeSlashes(outputPath)}
nav_order: ${order}
---
`;

const copyDocsTree = (
  sourceDir: string,
  destinationDir: string,
  packageName: string
): Effect.Effect<number, DomainError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    yield* fs
      .makeDirectory(destinationDir, { recursive: true })
      .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to create "${destinationDir}"`, cause })));

    const entries = yield* fs
      .readDirectory(sourceDir)
      .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to read "${sourceDir}"`, cause })));

    let copiedFiles = 0;

    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry);
      const destinationPath = path.join(destinationDir, entry);
      const stat = yield* fs
        .stat(sourcePath)
        .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to stat "${sourcePath}"`, cause })));

      if (stat.type === "Directory") {
        copiedFiles += yield* copyDocsTree(sourcePath, destinationPath, packageName);
        continue;
      }

      const content = yield* fs
        .readFileString(sourcePath)
        .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to read "${sourcePath}"`, cause })));
      const rewritten = Str.replace(/^parent: Modules$/m, `parent: "${packageName}"`)(content);
      yield* fs
        .writeFileString(destinationPath, rewritten)
        .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to write "${destinationPath}"`, cause })));
      copiedFiles += 1;
    }

    return copiedFiles;
  });

/**
 * Normalize a workspace-relative package path to the current root docs output layout.
 *
 * @param relativePath - Workspace-relative package path.
 * @returns Current nested docs output path with the top-level workspace root trimmed.
 * @since 0.0.0
 * @category DomainModel
 */
export const normalizeDocsOutputPath = (relativePath: string): string =>
  Str.replace(/^(packages|tooling|apps)\//, "")(normalizeSlashes(relativePath));

/**
 * Load a package-local `docgen.json` document.
 *
 * @param absolutePackagePath - Absolute package path containing the `docgen.json` file to decode.
 * @returns Parsed current-schema docgen configuration.
 * @since 0.0.0
 * @category DomainModel
 */
export const loadDocgenConfigDocument: (
  absolutePackagePath: string
) => Effect.Effect<DocgenConfigDocument, DomainError, FileSystem.FileSystem | Path.Path> = (absolutePackagePath) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const configPath = path.join(absolutePackagePath, DOCGEN_CONFIG_FILENAME);
    const parsed = yield* readUnknownJsonFile(configPath);
    return yield* decodeDocgenConfigDocument(parsed).pipe(
      Effect.mapError(
        (cause) => new DomainError({ message: `Invalid JSON shape in "${configPath}": ${cause.message}`, cause })
      )
    );
  });

/**
 * Build the repo-standard `docgen.json` document for a package.
 *
 * @param targetPackage - Target workspace package.
 * @param rootDir - Absolute repo root.
 * @returns Bootstrapped docgen config using current repo defaults plus dependency-aware paths.
 * @since 0.0.0
 * @category DomainModel
 */
export const createDocgenConfigDocument: (
  targetPackage: DocgenWorkspacePackage,
  rootDir: string
) => Effect.Effect<DocgenConfigDocument, DomainError, FileSystem.FileSystem | Path.Path> = (targetPackage, rootDir) =>
  Effect.gen(function* () {
    const packageJson = yield* readPackageJson(targetPackage.absolutePath);
    const rootPaths = yield* readRootTsconfigPaths(rootDir);
    const examplesPaths = yield* buildExamplesPaths(
      rootDir,
      targetPackage.absolutePath,
      targetPackage.name,
      targetPackage.relativePath,
      rootPaths,
      packageJson
    );
    const path = yield* Path.Path;
    const rootRelative = normalizeSlashes(path.relative(targetPackage.absolutePath, rootDir));
    const rootRelativePrefix = rootRelative.length === 0 ? "./" : `${rootRelative}/`;

    return new DocgenConfigDocument({
      $schema: `${rootRelativePrefix}node_modules/@effect/docgen/schema.json`,
      srcDir: "src",
      outDir: "docs",
      exclude: ["src/internal/**/*.ts"],
      srcLink: `https://github.com/kriegcloud/beep-effect/tree/main/${targetPackage.relativePath}/src/`,
      examplesCompilerOptions: {
        noEmit: true,
        strict: true,
        skipLibCheck: true,
        moduleResolution: "Bundler",
        module: "ES2022",
        target: "ES2022",
        lib: ["ESNext", "DOM", "DOM.Iterable"],
        rewriteRelativeImportExtensions: true,
        allowImportingTsExtensions: true,
        paths: examplesPaths,
      },
    });
  });

/**
 * Discover all workspace packages relevant to docgen.
 *
 * @param rootDir - Optional repo root override.
 * @returns Sorted workspace package descriptors with current docgen status.
 * @since 0.0.0
 * @category DomainModel
 */
export const discoverDocgenWorkspacePackages: (
  rootDir?: string
) => Effect.Effect<
  ReadonlyArray<DocgenWorkspacePackage>,
  DomainError | NoSuchFileError,
  FileSystem.FileSystem | Path.Path | FsUtils
> = (rootDir) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const repoRoot = rootDir ?? (yield* findRepoRoot());
    const workspaceDirs = yield* resolveWorkspaceDirs(repoRoot);
    const packages = yield* Effect.forEach(
      HashMap.toEntries(workspaceDirs),
      ([name, absolutePath]) =>
        Effect.gen(function* () {
          const relativePath = normalizeSlashes(path.relative(repoRoot, absolutePath));
          const hasDocgenConfig = yield* packageHasDocgenConfig(absolutePath);
          const hasGeneratedDocs = yield* packageHasGeneratedDocs(absolutePath);

          return new DocgenWorkspacePackage({
            name,
            relativePath,
            absolutePath,
            docsOutputPath: normalizeDocsOutputPath(relativePath),
            hasDocgenConfig,
            hasGeneratedDocs,
            status: computePackageStatus(hasDocgenConfig, hasGeneratedDocs),
          });
        }),
      { concurrency: "unbounded" }
    );

    return A.sort(packages, byRelativePathAscending);
  });

/**
 * Resolve a workspace package by package name, repo-relative path, absolute path, or current docs output path.
 *
 * @param selector - Package selector supplied by the CLI.
 * @param rootDir - Optional repo root override.
 * @returns Resolved workspace package descriptor.
 * @since 0.0.0
 * @category DomainModel
 */
export const resolveDocgenWorkspacePackage: (
  selector: string,
  rootDir?: string
) => Effect.Effect<DocgenWorkspacePackage, DomainError | NoSuchFileError, FileSystem.FileSystem | Path.Path | FsUtils> =
  (selector, rootDir) =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const repoRoot = rootDir ?? (yield* findRepoRoot());
      const normalizedSelector = normalizeSlashes(selector);
      const absoluteSelector = path.isAbsolute(selector) ? path.normalize(selector) : path.resolve(repoRoot, selector);
      const packages = yield* discoverDocgenWorkspacePackages(repoRoot);
      const match = A.findFirst(
        packages,
        (pkg) =>
          pkg.name === normalizedSelector ||
          pkg.relativePath === normalizedSelector ||
          pkg.docsOutputPath === normalizedSelector ||
          path.normalize(pkg.absolutePath) === absoluteSelector
      );

      return yield* O.match(match, {
        onNone: () =>
          new DomainError({
            message: `Could not resolve workspace package "${selector}". Use a package name like "@beep/schema" or a repo-relative path like "packages/common/schema".`,
          }),
        onSome: Effect.succeed,
      });
    });

/**
 * Analyze a package for missing docgen-required JSDoc.
 *
 * @param targetPackage - Target workspace package.
 * @returns Package analysis document grounded in the current repo package layout.
 * @since 0.0.0
 * @category DomainModel
 */
export const analyzePackageDocumentation: (
  targetPackage: DocgenWorkspacePackage
) => Effect.Effect<DocgenPackageAnalysis, DomainError, FileSystem.FileSystem | Path.Path> = (targetPackage) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const config = targetPackage.hasDocgenConfig
      ? yield* loadDocgenConfigDocument(targetPackage.absolutePath)
      : new DocgenConfigDocument({
          srcDir: "src",
          exclude: [],
        });
    const project = new Project({ skipAddingFilesFromTsConfig: true });
    const srcDir = config.srcDir ?? "src";
    const exclude = config.exclude ?? [];
    const analyses = pipe(
      getSourceFiles(project, targetPackage.absolutePath, srcDir, exclude),
      A.flatMap((sourceFile) => analyzeSourceFile(sourceFile, targetPackage.absolutePath, path)),
      A.sort(byIssueAscending)
    );
    const timestamp = yield* DateTime.now.pipe(
      Effect.map(DateTime.toDateUtc),
      Effect.map((date) => date.toISOString())
    );

    return new DocgenPackageAnalysis({
      packageName: targetPackage.name,
      packagePath: targetPackage.relativePath,
      timestamp,
      exports: analyses,
      summary: computeAnalysisSummary(analyses),
    });
  });

/**
 * Render a human-first markdown report for a package analysis run.
 *
 * @param analysis - Package analysis document.
 * @param fixMode - Whether to emit checklist-focused output.
 * @returns Human-first markdown report content.
 * @since 0.0.0
 * @category DomainModel
 */
export const generateAnalysisReport = (analysis: DocgenPackageAnalysis, fixMode: boolean): string => {
  const issues = analysis.exports.filter((entry) => entry.missingTags.length > 0);
  const high = issues.filter((entry) => entry.priority === "high");
  const medium = issues.filter((entry) => entry.priority === "medium");
  const low = issues.filter((entry) => entry.priority === "low");
  const sections: Array<string> = [];

  sections.push(`# JSDoc Analysis Report: ${analysis.packageName}`);
  sections.push("");
  sections.push(`> **Generated**: ${analysis.timestamp}`);
  sections.push(`> **Package**: ${analysis.packagePath}`);
  sections.push(`> **Status**: ${analysis.summary.missingDocumentation} export(s) need documentation`);
  sections.push("");
  sections.push("## What To Fix");
  sections.push("");
  sections.push("Public exports should include the repo-required JSDoc tags:");
  sections.push("");
  sections.push("1. `@category`");
  sections.push("2. `@example`");
  sections.push("3. `@since`");
  sections.push("");
  sections.push("Re-run the analysis after edits:");
  sections.push("");
  sections.push("```bash");
  sections.push(`bun run beep docgen analyze -p ${analysis.packagePath}`);
  sections.push("```");
  sections.push("");

  if (fixMode) {
    sections.push("## Fix Checklist");
    sections.push("");

    if (issues.length === 0) {
      sections.push("All public exports are fully documented.");
      sections.push("");
    } else {
      if (high.length > 0) {
        sections.push("### High Priority");
        sections.push("");
        for (const entry of high) {
          sections.push(formatChecklistItem(entry));
          sections.push("");
        }
      }

      if (medium.length > 0) {
        sections.push("### Medium Priority");
        sections.push("");
        for (const entry of medium) {
          sections.push(formatChecklistItem(entry));
          sections.push("");
        }
      }

      if (low.length > 0) {
        sections.push("### Low Priority");
        sections.push("");
        for (const entry of low) {
          sections.push(formatChecklistItem(entry));
          sections.push("");
        }
      }
    }
  } else {
    sections.push("## Findings");
    sections.push("");

    if (issues.length === 0) {
      sections.push("All public exports are fully documented.");
      sections.push("");
    } else {
      for (const entry of issues) {
        sections.push(`### ${entry.name}`);
        sections.push("");
        sections.push(`- Location: \`${entry.filePath}:${entry.line}\``);
        sections.push(`- Kind: ${entry.kind}`);
        sections.push(`- Missing: ${entry.missingTags.join(", ")}`);
        if (entry.presentTags.length > 0) {
          sections.push(`- Present: ${entry.presentTags.join(", ")}`);
        }
        if (entry.context !== undefined) {
          sections.push(`- Context: ${entry.context}`);
        }
        sections.push("");
      }
    }
  }

  sections.push("## Summary");
  sections.push("");
  sections.push("| Metric | Count |");
  sections.push("|--------|-------|");
  sections.push(`| Total Exports | ${analysis.summary.totalExports} |`);
  sections.push(`| Fully Documented | ${analysis.summary.fullyDocumented} |`);
  sections.push(`| Missing Documentation | ${analysis.summary.missingDocumentation} |`);
  sections.push(`| Missing @category | ${analysis.summary.missingCategory} |`);
  sections.push(`| Missing @example | ${analysis.summary.missingExample} |`);
  sections.push(`| Missing @since | ${analysis.summary.missingSince} |`);
  sections.push("");

  return sections.join("\n");
};

/**
 * Encode a package analysis document as JSON text.
 *
 * @param analysis - Package analysis document.
 * @returns JSON representation suitable for writing to disk or stdout.
 * @since 0.0.0
 * @category DomainModel
 */
export const generateAnalysisJson = (analysis: DocgenPackageAnalysis): string => jsonText(analysis);

/**
 * Aggregate generated package docs into the current root docs layout.
 *
 * @param options - Aggregate configuration for the docs copy step.
 * @param options.clean - Whether to remove the root `docs/` directory before copying package docs.
 * @param options.package - Optional workspace package selector that limits aggregation to one package.
 * @returns Per-package aggregation results using the current nested layout.
 * @since 0.0.0
 * @category DomainModel
 */
export const aggregateGeneratedDocs = (options?: {
  readonly clean?: boolean | undefined;
  readonly package?: string | undefined;
}): Effect.Effect<
  ReadonlyArray<DocgenAggregateResult>,
  DomainError | NoSuchFileError,
  FileSystem.FileSystem | Path.Path | FsUtils
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const repoRoot = yield* findRepoRoot();
    const docsRoot = path.join(repoRoot, "docs");
    const selectedPackage = options?.package
      ? yield* resolveDocgenWorkspacePackage(options.package, repoRoot)
      : undefined;
    const packages = selectedPackage
      ? selectedPackage.hasGeneratedDocs
        ? [selectedPackage]
        : []
      : (yield* discoverDocgenWorkspacePackages(repoRoot)).filter((pkg) => pkg.hasGeneratedDocs);

    if (selectedPackage !== undefined && packages.length === 0) {
      return yield* new DomainError({
        message: `Package "${selectedPackage.name}" does not have generated docs. Run "bun run beep docgen generate -p ${selectedPackage.relativePath}" first.`,
      });
    }

    if (packages.length === 0) {
      return [];
    }

    if (options?.package === undefined) {
      const seen = MutableHashSet.empty<string>();
      const duplicates = MutableHashSet.empty<string>();

      for (const pkg of packages) {
        if (MutableHashSet.has(seen, pkg.docsOutputPath)) {
          MutableHashSet.add(duplicates, pkg.docsOutputPath);
          continue;
        }
        MutableHashSet.add(seen, pkg.docsOutputPath);
      }

      if (MutableHashSet.size(duplicates) > 0) {
        return yield* new DomainError({
          message: `Duplicate docs output paths detected: ${pipe(A.fromIterable(duplicates), A.sort(Order.String), A.join(", "))}`,
        });
      }
    }

    if (options?.clean === true) {
      if (selectedPackage !== undefined) {
        const destinationDir = path.join(docsRoot, selectedPackage.docsOutputPath);
        yield* fs
          .remove(destinationDir, { recursive: true, force: true })
          .pipe(
            Effect.mapError((cause) => new DomainError({ message: `Failed to remove "${destinationDir}"`, cause }))
          );
      } else {
        yield* fs
          .remove(docsRoot, { recursive: true, force: true })
          .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to remove "${docsRoot}"`, cause })));
      }
    }

    yield* fs
      .makeDirectory(docsRoot, { recursive: true })
      .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to create "${docsRoot}"`, cause })));

    const sortedPackages = A.sort(packages, byDocsOutputPathAscending);
    return yield* Effect.forEach(
      sortedPackages,
      (pkg, index) =>
        Effect.gen(function* () {
          const sourceDir = path.join(pkg.absolutePath, ...DOCS_MODULES_SEGMENTS);
          const destinationDir = path.join(docsRoot, pkg.docsOutputPath);
          const hasDocs = yield* fs.exists(sourceDir).pipe(Effect.orElseSucceed(() => false));

          if (!hasDocs) {
            return yield* new DomainError({
              message: `Package "${pkg.name}" does not have generated docs. Run "bun run beep docgen generate -p ${pkg.relativePath}" first.`,
            });
          }

          yield* fs
            .remove(destinationDir, { recursive: true, force: true })
            .pipe(
              Effect.mapError((cause) => new DomainError({ message: `Failed to reset "${destinationDir}"`, cause }))
            );
          const fileCount = yield* copyDocsTree(sourceDir, destinationDir, pkg.name);
          yield* fs
            .writeFileString(
              path.join(destinationDir, "index.md"),
              generateDocsIndexContent(pkg.name, pkg.docsOutputPath, index + 2)
            )
            .pipe(
              Effect.mapError(
                (cause) => new DomainError({ message: `Failed to write docs index for "${pkg.name}"`, cause })
              )
            );

          return new DocgenAggregateResult({
            packageName: pkg.name,
            packagePath: pkg.relativePath,
            docsOutputPath: pkg.docsOutputPath,
            fileCount,
          });
        }),
      { concurrency: "unbounded" }
    );
  });

/**
 * Run `@effect/docgen` for a single workspace package.
 *
 * @param targetPackage - Target workspace package.
 * @param validateExamples - Whether to pass `--validate-examples`.
 * @returns Generation result including output and module count.
 * @since 0.0.0
 * @category DomainModel
 */
export const runDocgenForPackage: (
  targetPackage: DocgenWorkspacePackage,
  validateExamples: boolean
) => Effect.Effect<DocgenGenerationResult, never, FileSystem.FileSystem | Path.Path | ChildProcessSpawner> = (
  targetPackage,
  validateExamples
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const args = validateExamples ? ["@effect/docgen", "--validate-examples"] : ["@effect/docgen"];
    const command = ChildProcess.make("bunx", args, {
      cwd: targetPackage.absolutePath,
      stdout: "pipe",
      stderr: "pipe",
    });
    const result = yield* Effect.scoped(
      Effect.gen(function* () {
        const handle = yield* command;
        const output = yield* handle.all.pipe(
          Stream.decodeText(),
          Stream.runFold(
            () => "",
            (acc: string, chunk) => `${acc}${chunk}`
          )
        );
        const exitCode = yield* handle.exitCode;
        return { output: Str.trim(output), exitCode };
      })
    ).pipe(
      Effect.catch((cause) =>
        Effect.succeed({
          output: Str.trim(stringFromUnknown(cause)),
          exitCode: 1,
        })
      )
    );

    if (result.exitCode !== 0) {
      return new DocgenGenerationResult({
        packageName: targetPackage.name,
        packagePath: targetPackage.relativePath,
        success: false,
        error: `docgen exited with code ${result.exitCode}`,
        ...(result.output.length === 0 ? {} : { output: result.output }),
      });
    }

    const docsModulesDir = path.join(targetPackage.absolutePath, ...DOCS_MODULES_SEGMENTS);
    const moduleCount = yield* fs.exists(docsModulesDir).pipe(
      Effect.orElseSucceed(() => false),
      Effect.flatMap((exists) =>
        exists
          ? fs.readDirectory(docsModulesDir).pipe(
              Effect.map((entries) => entries.filter((entry) => Str.endsWith(".md")(entry)).length),
              Effect.orElseSucceed(() => 0)
            )
          : Effect.succeed(0)
      )
    );

    return new DocgenGenerationResult({
      packageName: targetPackage.name,
      packagePath: targetPackage.relativePath,
      success: true,
      moduleCount,
      ...(result.output.length === 0 ? {} : { output: result.output }),
    });
  });
