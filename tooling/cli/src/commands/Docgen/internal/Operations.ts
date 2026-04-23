/**
 * Human-first docgen operations shared by `beep docgen` and `beep docs aggregate`.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import {
  DomainError,
  decodePackageJsonEffect,
  type FsUtils,
  findRepoRoot,
  type NoSuchFileError,
  resolveWorkspaceDirs,
} from "@beep/repo-utils";
import { LiteralKit } from "@beep/schema";
import { thunk0, thunkEmptyStr, thunkFalse } from "@beep/utils";
import { DateTime, Effect, FileSystem, flow, HashMap, MutableHashSet, Order, Path, pipe, Stream } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess } from "effect/unstable/process";
import type { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner";
import * as jsonc from "jsonc-parser";
import { type ExportDeclaration, type JSDoc, Node, Project, type SourceFile, SyntaxKind } from "ts-morph";
import {
  buildDocgenAliasSource,
  CanonicalDocgenConfigInput,
  collectDocgenWorkspaceDependencyNames,
  createCanonicalDocgenConfig,
  type DocgenAliasSource,
  toCanonicalDocgenConfigJson,
} from "../../Shared/DocgenConfig.js";

const $I = $RepoCliId.create("commands/Docgen/internal/Operations");

const DOCGEN_CONFIG_FILENAME = "docgen.json" as const;
const DOCS_MODULES_SEGMENTS = ["docs", "modules"] as const;
const DOCGEN_REQUIRED_TAGS = ["@example", "@since"] as const;

type ResolveDocgenWorkspacePackageOptions = {
  readonly rootDir?: string | undefined;
};

const isResolveDocgenWorkspacePackageDataFirst = (args: IArguments): boolean =>
  (args.length === 1 && P.isString(args[0])) || args.length === 2;

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
    `${
      analysis.priority === "high" ? "0" : analysis.priority === "medium" ? "1" : "2"
    }:${analysis.filePath}:${analysis.line}:${analysis.name}`
);

/**
 * Workspace docgen status derived from config and generated output presence.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const DocgenPackageStatus = LiteralKit([
  "configured-and-generated",
  "configured-not-generated",
  "not-configured",
]).annotate(
  $I.annote("DocgenPackageStatus", {
    description: "Workspace docgen status derived from config and generated output presence.",
  })
);
/**
 * Workspace docgen status derived from config and generated output presence.
 *
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
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
    exclude: S.String.pipe(S.Array, S.optionalKey),
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
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
 */
export const DocgenIssuePriority = LiteralKit(["high", "medium", "low"]).annotate(
  $I.annote("DocgenIssuePriority", {
    description: "Issue priority used by analysis findings.",
  })
);
/**
 * Issue priority used by analysis findings.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type DocgenIssuePriority = typeof DocgenIssuePriority.Type;

/**
 * Export kind surfaced by analysis.
 *
 * @category DomainModel
 * @since 0.0.0
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
]).annotate(
  $I.annote("DocgenExportKind", {
    description: "Export kind surfaced by analysis.",
  })
);
/**
 * Export kind surfaced by analysis.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type DocgenExportKind = typeof DocgenExportKind.Type;

/**
 * Analysis finding for a single export or module-level doc requirement.
 *
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
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

const decodeDocgenConfigDocument = S.decodeUnknownEffect(DocgenConfigDocument);

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

const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const jsonText = (value: unknown): string => {
  const encoded = encodeJson(value);
  const edits = jsonc.format(encoded, undefined, {
    tabSize: 2,
    insertSpaces: true,
  });
  return `${jsonc.applyEdits(encoded, edits)}\n`;
};

const readUnknownJsonFile = Effect.fn("DocgenOperations.readUnknownJsonFile")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const content = yield* fs.readFileString(filePath).pipe(
    Effect.mapError(
      (cause) =>
        new DomainError({
          message: `Failed to read "${filePath}"`,
          cause,
        })
    )
  );
  const parsed = yield* Effect.try({
    try: () => parseJsonText(content),
    catch: (cause) =>
      new DomainError({
        message: `Invalid JSON in "${filePath}"`,
        cause,
      }),
  });
  return parsed;
});

const readPackageJson = Effect.fn("DocgenOperations.readPackageJson")(function* (absolutePackagePath: string) {
  const path = yield* Path.Path;
  const packageJsonPath = path.join(absolutePackagePath, "package.json");
  const parsed = yield* readUnknownJsonFile(packageJsonPath);
  return yield* decodePackageJsonEffect(parsed).pipe(
    Effect.mapError(
      (cause) =>
        new DomainError({
          message: `Invalid package.json at "${packageJsonPath}"`,
          cause,
        })
    )
  );
});

const loadWorkspaceDocgenAliasSources = Effect.fn("DocgenOperations.loadWorkspaceDocgenAliasSources")(function* (
  rootDir: string
) {
  const path = yield* Path.Path;
  const workspaceDirs = yield* resolveWorkspaceDirs(rootDir);
  const aliasSources = A.empty<DocgenAliasSource>();

  for (const [packageName, absolutePath] of workspaceDirs) {
    const packageJson = yield* readPackageJson(absolutePath);
    aliasSources.push(
      buildDocgenAliasSource(packageName, normalizeSlashes(path.relative(rootDir, absolutePath)), packageJson)
    );
  }

  return aliasSources;
});

const packageHasDocgenConfig = Effect.fn("DocgenOperations.packageHasDocgenConfig")(function* (
  absolutePackagePath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  return yield* fs
    .exists(path.join(absolutePackagePath, DOCGEN_CONFIG_FILENAME))
    .pipe(Effect.orElseSucceed(thunkFalse));
});

const packageHasGeneratedDocs = Effect.fn("DocgenOperations.packageHasGeneratedDocs")(function* (
  absolutePackagePath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  return yield* fs
    .exists(path.join(absolutePackagePath, ...DOCS_MODULES_SEGMENTS))
    .pipe(Effect.orElseSucceed(thunkFalse));
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

  return A.empty();
};

const extractJsDocTags = (node: Node): ReadonlyArray<string> =>
  pipe(
    getJsDocs(node),
    A.flatMap((doc) => A.map(doc.getTags(), (tag) => `@${tag.getTagName()}`))
  );

const getLeadingJsDocCommentText = (node: ExportDeclaration): O.Option<string> =>
  pipe(
    node.getLeadingCommentRanges(),
    A.filter((range) => Str.startsWith("/**")(range.getText())),
    A.last,
    O.map((range) => range.getText())
  );

const extractJsDocTagsFromText = (commentText: string): ReadonlyArray<string> =>
  pipe(
    commentText.matchAll(/@([A-Za-z][\w-]*)/g),
    A.fromIterable,
    A.flatMap((match) => (match[1] === undefined ? A.empty<string>() : [`@${match[1]}`]))
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

type DocgenRequiredTag = (typeof DOCGEN_REQUIRED_TAGS)[number];

const resolveRequiredTags = (config: DocgenConfigDocument): ReadonlyArray<DocgenRequiredTag> => {
  const tags = A.empty<DocgenRequiredTag>();

  if (config.enforceExamples === true) {
    tags.push("@example");
  }

  if (config.enforceVersion !== false) {
    tags.push("@since");
  }

  return tags;
};

const missingRequiredTags = (
  presentTags: ReadonlyArray<string>,
  requiredTags: ReadonlyArray<DocgenRequiredTag>
): ReadonlyArray<DocgenRequiredTag> => A.filter(requiredTags, (tag) => !A.contains(presentTags, tag));

const extractLeadingCommentTags = (node: Node): ReadonlyArray<string> =>
  pipe(
    node.getLeadingCommentRanges(),
    A.flatMap((range) => extractJsDocTagsFromText(range.getText()))
  );

const collectExportSpecifierTags = (sourceFile: SourceFile): HashMap.HashMap<string, ReadonlyArray<string>> => {
  let index = HashMap.empty<string, ReadonlyArray<string>>();

  for (const declaration of sourceFile.getDescendantsOfKind(SyntaxKind.ExportDeclaration)) {
    for (const specifier of declaration.getNamedExports()) {
      const exportName = specifier.getAliasNode()?.getText() ?? specifier.getName();
      const tags = pipe(
        [...extractLeadingCommentTags(specifier), ...extractJsDocTagsFromText(specifier.getText())],
        A.dedupe
      );

      if (A.isReadonlyArrayNonEmpty(tags)) {
        index = HashMap.set(index, exportName, tags);
      }
    }
  }

  return index;
};

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

const analyzeExport = (
  name: string,
  node: Node,
  filePath: string,
  requiredTags: ReadonlyArray<DocgenRequiredTag>,
  inheritedTags: ReadonlyArray<string>
): DocgenExportAnalysis => {
  const presentTags = pipe([...extractJsDocTags(node), ...inheritedTags], A.dedupe);
  const missingTags = missingRequiredTags(presentTags, requiredTags);

  return makeExportAnalysis({
    name,
    kind: getExportKind(node),
    filePath,
    line: node.getStartLineNumber(),
    presentTags,
    missingTags,
    hasJsDoc: hasJsDocComment(node) || A.isReadonlyArrayNonEmpty(inheritedTags),
    declarationSource: node.getText(),
    context: extractContext(node),
  });
};

const analyzeModuleFileoverview = (
  sourceFile: SourceFile,
  relativeFilePath: string,
  requiredTags: ReadonlyArray<DocgenRequiredTag>
): O.Option<DocgenExportAnalysis> => {
  if (!A.contains(requiredTags, "@since")) {
    return O.none();
  }

  const match = /^(?:#![^\n]*\n)?\s*(\/\*\*[\s\S]*?\*\/)/.exec(sourceFile.getFullText());

  if (match === null) {
    return O.some(
      makeExportAnalysis({
        name: "<module fileoverview>",
        kind: "module-fileoverview",
        filePath: relativeFilePath,
        line: 1,
        presentTags: A.empty(),
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
    ["@file", "@fileoverview", "@module", "@category", "@example"],
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

const analyzeReExports = (
  sourceFile: SourceFile,
  relativeFilePath: string,
  requiredTags: ReadonlyArray<DocgenRequiredTag>
): ReadonlyArray<DocgenExportAnalysis> =>
  pipe(
    sourceFile.getDescendantsOfKind(SyntaxKind.ExportDeclaration),
    A.map((declaration: ExportDeclaration) => {
      const jsDocTags = pipe(
        getJsDocs(declaration),
        A.flatMap((doc) => A.map(doc.getTags(), (tag) => `@${tag.getTagName()}`))
      );
      const leadingTags = pipe(
        getLeadingJsDocCommentText(declaration),
        O.map(extractJsDocTagsFromText),
        O.getOrElse(A.empty<string>)
      );
      const declarationTextTags = extractJsDocTagsFromText(declaration.getText());
      const presentTags = pipe([...jsDocTags, ...leadingTags, ...declarationTextTags], A.dedupe);
      const missingTags = missingRequiredTags(presentTags, requiredTags);

      return makeExportAnalysis({
        name: declaration.getText(),
        kind: "re-export",
        filePath: relativeFilePath,
        line: declaration.getStartLineNumber(),
        presentTags,
        missingTags,
        hasJsDoc: presentTags.length > 0,
        declarationSource: declaration.getText(),
        context: `Re-export from ${declaration.getModuleSpecifierValue() ?? "<unknown>"} needs documentation.`,
      });
    }),
    A.filter((analysis) => A.isReadonlyArrayNonEmpty(analysis.missingTags))
  );

const sourceFileMatchesExclude = (
  absolutePackagePath: string,
  srcDir: string,
  sourceFilePath: string,
  pattern: string
): boolean => {
  const normalizedPattern = normalizeSlashes(Str.replace(/^\.\//, "")(pattern));
  const packageRelative = Str.replace(
    `${normalizeSlashes(absolutePackagePath)}/`,
    ""
  )(normalizeSlashes(sourceFilePath));
  const srcRelative = Str.startsWith(`${srcDir}/`)(packageRelative)
    ? packageRelative.slice(srcDir.length + 1)
    : packageRelative;
  const patternRegex = globPatternToRegExp(normalizedPattern);

  return A.some([packageRelative, srcRelative], (candidate) => patternRegex.test(candidate));
};

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
  path: Path.Path,
  requiredTags: ReadonlyArray<DocgenRequiredTag>
): ReadonlyArray<DocgenExportAnalysis> => {
  const relativeFilePath = relativePathWithinPackage(absolutePackagePath, sourceFile.getFilePath(), path);
  const reExports = analyzeReExports(sourceFile, relativeFilePath, requiredTags);
  const exportSpecifierTags = collectExportSpecifierTags(sourceFile);
  const directExports = pipe(
    A.fromIterable(sourceFile.getExportedDeclarations().entries()),
    A.flatMap(([name, declarations]) => {
      const localDeclarations = A.filter(declarations, (declaration) => declaration.getSourceFile() === sourceFile);
      const siblingTags = pipe(localDeclarations, A.flatMap(extractJsDocTags), A.dedupe);
      const specifierTags = O.getOrElse(HashMap.get(exportSpecifierTags, name), A.empty<string>);
      const inheritedTags = pipe([...siblingTags, ...specifierTags], A.dedupe);

      return A.map(localDeclarations, (declaration) =>
        analyzeExport(name, declaration, relativeFilePath, requiredTags, inheritedTags)
      );
    })
  );

  if (reExports.length === 0 && directExports.length === 0) {
    return A.empty();
  }

  const moduleFileoverview = analyzeModuleFileoverview(sourceFile, relativeFilePath, requiredTags);

  return pipe(O.toArray(moduleFileoverview), A.appendAll(reExports), A.appendAll(directExports));
};

const computeAnalysisSummary = (analyses: ReadonlyArray<DocgenExportAnalysis>): DocgenAnalysisSummary =>
  new DocgenAnalysisSummary({
    totalExports: analyses.length,
    fullyDocumented: A.filter(analyses, (analysis) => analysis.missingTags.length === 0).length,
    missingDocumentation: A.filter(analyses, (analysis) => analysis.missingTags.length > 0).length,
    missingCategory: A.filter(analyses, (analysis) => A.contains(analysis.missingTags, "@category")).length,
    missingExample: A.filter(analyses, (analysis) => A.contains(analysis.missingTags, "@example")).length,
    missingSince: A.filter(analyses, (analysis) => A.contains(analysis.missingTags, "@since")).length,
  });

const formatChecklistItem = (analysis: DocgenExportAnalysis): string =>
  A.join(
    [
      `- [ ] \`${analysis.filePath}:${analysis.line}\` - **${analysis.name}** (${analysis.kind})`,
      `  - Missing: ${A.join(analysis.missingTags, ", ") || "none"}`,
      ...(analysis.presentTags.length === 0 ? A.empty() : [`  - Has: ${A.join(analysis.presentTags, ", ")}`]),
      ...(analysis.context === undefined ? A.empty() : [`  - Context: ${analysis.context}`]),
    ],
    "\n"
  );

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

    yield* fs.makeDirectory(destinationDir, { recursive: true }).pipe(
      Effect.mapError(
        (cause) =>
          new DomainError({
            message: `Failed to create "${destinationDir}"`,
            cause,
          })
      )
    );

    const entries = yield* fs.readDirectory(sourceDir).pipe(
      Effect.mapError(
        (cause) =>
          new DomainError({
            message: `Failed to read "${sourceDir}"`,
            cause,
          })
      )
    );

    let copiedFiles = 0;

    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry);
      const destinationPath = path.join(destinationDir, entry);
      const stat = yield* fs.stat(sourcePath).pipe(
        Effect.mapError(
          (cause) =>
            new DomainError({
              message: `Failed to stat "${sourcePath}"`,
              cause,
            })
        )
      );

      if (stat.type === "Directory") {
        copiedFiles += yield* copyDocsTree(sourcePath, destinationPath, packageName);
        continue;
      }

      const content = yield* fs.readFileString(sourcePath).pipe(
        Effect.mapError(
          (cause) =>
            new DomainError({
              message: `Failed to read "${sourcePath}"`,
              cause,
            })
        )
      );
      const rewritten = Str.replace(/^parent: Modules$/m, `parent: "${packageName}"`)(content);
      yield* fs.writeFileString(destinationPath, rewritten).pipe(
        Effect.mapError(
          (cause) =>
            new DomainError({
              message: `Failed to write "${destinationPath}"`,
              cause,
            })
        )
      );
      copiedFiles += 1;
    }

    return copiedFiles;
  });

/**
 * Normalize a workspace-relative package path to the current root docs output layout.
 *
 * @param relativePath - Workspace-relative package path.
 * @returns Current nested docs output path with the top-level workspace root trimmed.
 * @category DomainModel
 * @since 0.0.0
 */
export const normalizeDocsOutputPath = (relativePath: string): string =>
  Str.replace(/^(packages|tooling|apps)\//, "")(normalizeSlashes(relativePath));

/**
 * Load a package-local `docgen.json` document.
 *
 * @param absolutePackagePath - Absolute package path containing the `docgen.json` file to decode.
 * @returns Parsed current-schema docgen configuration.
 * @category DomainModel
 * @since 0.0.0
 */
export const loadDocgenConfigDocument: (
  absolutePackagePath: string
) => Effect.Effect<DocgenConfigDocument, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  "DocgenOperations.loadDocgenConfigDocument"
)(function* (absolutePackagePath) {
  const path = yield* Path.Path;
  const configPath = path.join(absolutePackagePath, DOCGEN_CONFIG_FILENAME);
  const parsed = yield* readUnknownJsonFile(configPath);
  return yield* decodeDocgenConfigDocument(parsed).pipe(
    Effect.mapError(
      (cause) =>
        new DomainError({
          message: `Invalid JSON shape in "${configPath}": ${cause.message}`,
          cause,
        })
    )
  );
});

/**
 * Build the repo-standard `docgen.json` document for a package.
 *
 * @param targetPackage - Target workspace package.
 * @param rootDir - Absolute repo root.
 * @returns Bootstrapped docgen config using current repo defaults plus dependency-aware paths.
 * @category DomainModel
 * @since 0.0.0
 */
export const createDocgenConfigDocument: {
  (
    targetPackage: DocgenWorkspacePackage,
    rootDir: string
  ): Effect.Effect<DocgenConfigDocument, DomainError | NoSuchFileError, FileSystem.FileSystem | Path.Path | FsUtils>;
  (
    rootDir: string
  ): (
    targetPackage: DocgenWorkspacePackage
  ) => Effect.Effect<DocgenConfigDocument, DomainError | NoSuchFileError, FileSystem.FileSystem | Path.Path | FsUtils>;
} = dual(
  2,
  Effect.fn("DocgenOperations.createDocgenConfigDocument")(function* (targetPackage, rootDir) {
    const packageJson = yield* readPackageJson(targetPackage.absolutePath);
    const workspaceAliasSources = yield* loadWorkspaceDocgenAliasSources(rootDir);
    const canonicalConfig = yield* createCanonicalDocgenConfig(
      new CanonicalDocgenConfigInput({
        rootDir,
        packageAbsolutePath: targetPackage.absolutePath,
        packageRelativePath: targetPackage.relativePath,
        packageName: targetPackage.name,
        directWorkspaceDependencies: [...collectDocgenWorkspaceDependencyNames(packageJson)],
        workspaceAliasSources,
      })
    );
    const canonicalConfigJson = toCanonicalDocgenConfigJson(canonicalConfig);

    return new DocgenConfigDocument({
      srcDir: "src",
      outDir: "docs",
      ...canonicalConfigJson,
    });
  })
);

/**
 * Discover all workspace packages relevant to docgen.
 *
 * @param rootDir - Optional repo root override.
 * @returns Sorted workspace package descriptors with current docgen status.
 * @category DomainModel
 * @since 0.0.0
 */
export const discoverDocgenWorkspacePackages: (
  rootDir?: string
) => Effect.Effect<
  ReadonlyArray<DocgenWorkspacePackage>,
  DomainError | NoSuchFileError,
  FileSystem.FileSystem | Path.Path | FsUtils
> = Effect.fn("DocgenOperations.discoverDocgenWorkspacePackages")(function* (rootDir?: string) {
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
 * @param options - Optional repo root override.
 * @returns Resolved workspace package descriptor.
 * @category DomainModel
 * @since 0.0.0
 */
export const resolveDocgenWorkspacePackage: {
  (
    selector: string,
    options?: ResolveDocgenWorkspacePackageOptions
  ): Effect.Effect<DocgenWorkspacePackage, DomainError | NoSuchFileError, FileSystem.FileSystem | Path.Path | FsUtils>;
  (
    options: ResolveDocgenWorkspacePackageOptions
  ): (
    selector: string
  ) => Effect.Effect<
    DocgenWorkspacePackage,
    DomainError | NoSuchFileError,
    FileSystem.FileSystem | Path.Path | FsUtils
  >;
} = dual(
  isResolveDocgenWorkspacePackageDataFirst,
  Effect.fn("DocgenOperations.resolveDocgenWorkspacePackage")(function* (
    selector: string,
    options?: ResolveDocgenWorkspacePackageOptions
  ) {
    const path = yield* Path.Path;
    const repoRoot = options?.rootDir ?? (yield* findRepoRoot());
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
  })
);

/**
 * Analyze a package for missing docgen-required JSDoc.
 *
 * @param targetPackage - Target workspace package.
 * @returns Package analysis document grounded in the current repo package layout.
 * @category DomainModel
 * @since 0.0.0
 */
export const analyzePackageDocumentation: (
  targetPackage: DocgenWorkspacePackage
) => Effect.Effect<DocgenPackageAnalysis, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  "DocgenOperations.analyzePackageDocumentation"
)(function* (targetPackage) {
  const path = yield* Path.Path;
  const config = targetPackage.hasDocgenConfig
    ? yield* loadDocgenConfigDocument(targetPackage.absolutePath)
    : new DocgenConfigDocument({
        srcDir: "src",
        exclude: A.empty(),
      });
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const srcDir = config.srcDir ?? "src";
  const exclude = config.exclude ?? A.empty();
  const requiredTags = resolveRequiredTags(config);
  const analyses = pipe(
    getSourceFiles(project, targetPackage.absolutePath, srcDir, exclude),
    A.flatMap((sourceFile) => analyzeSourceFile(sourceFile, targetPackage.absolutePath, path, requiredTags)),
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
 * @category DomainModel
 * @since 0.0.0
 */
export const generateAnalysisReport: {
  (analysis: DocgenPackageAnalysis, fixMode: boolean): string;
  (fixMode: boolean): (analysis: DocgenPackageAnalysis) => string;
} = dual(2, (analysis: DocgenPackageAnalysis, fixMode: boolean): string => {
  const issues = A.filter(analysis.exports, (entry) => A.isReadonlyArrayNonEmpty(entry.missingTags));
  const high = A.filter(issues, (entry) => entry.priority === "high");
  const medium = A.filter(issues, (entry) => entry.priority === "medium");
  const low = A.filter(issues, (entry) => entry.priority === "low");
  const sections = A.empty<string>();

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

    if (A.isReadonlyArrayEmpty(issues)) {
      sections.push("All public exports are fully documented.");
      sections.push("");
    } else {
      if (A.isReadonlyArrayNonEmpty(high)) {
        sections.push("### High Priority");
        sections.push("");
        for (const entry of high) {
          sections.push(formatChecklistItem(entry));
          sections.push("");
        }
      }

      if (A.isReadonlyArrayNonEmpty(medium)) {
        sections.push("### Medium Priority");
        sections.push("");
        for (const entry of medium) {
          sections.push(formatChecklistItem(entry));
          sections.push("");
        }
      }

      if (A.isReadonlyArrayNonEmpty(low)) {
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

    if (A.isReadonlyArrayEmpty(issues)) {
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
        if (P.isNotUndefined(entry.context)) {
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
});

/**
 * Encode a package analysis document as JSON text.
 *
 * @param analysis - Package analysis document.
 * @returns JSON representation suitable for writing to disk or stdout.
 * @category DomainModel
 * @since 0.0.0
 */
export const generateAnalysisJson = (analysis: DocgenPackageAnalysis): string => jsonText(analysis);

/**
 * Aggregate generated package docs into the current root docs layout.
 *
 * @param options - Aggregate configuration for the docs copy step, including the clean flag and optional package selector.
 * @returns Per-package aggregation results using the current nested layout.
 * @category DomainModel
 * @since 0.0.0
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
    const selectedPackage = P.isUndefined(options?.package)
      ? undefined
      : yield* resolveDocgenWorkspacePackage(options.package, { rootDir: repoRoot });
    const packages = P.isUndefined(selectedPackage)
      ? A.filter(yield* discoverDocgenWorkspacePackages(repoRoot), (pkg) => pkg.hasGeneratedDocs)
      : selectedPackage.hasGeneratedDocs
        ? [selectedPackage]
        : A.empty();

    if (selectedPackage !== undefined && A.isReadonlyArrayEmpty(packages)) {
      return yield* new DomainError({
        message: `Package "${selectedPackage.name}" does not have generated docs. Run "bun run beep docgen generate -p ${selectedPackage.relativePath}" first.`,
      });
    }

    if (A.isReadonlyArrayEmpty(packages)) {
      return A.empty();
    }

    if (P.isUndefined(options?.package)) {
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
          message: `Duplicate docs output paths detected: ${pipe(
            A.fromIterable(duplicates),
            A.sort(Order.String),
            A.join(", ")
          )}`,
        });
      }
    }

    if (options?.clean === true) {
      if (selectedPackage !== undefined) {
        const destinationDir = path.join(docsRoot, selectedPackage.docsOutputPath);
        yield* fs
          .remove(destinationDir, {
            recursive: true,
            force: true,
          })
          .pipe(Effect.mapError(DomainError.newCause(`Failed to remove "${destinationDir}"`)));
      } else {
        yield* fs
          .remove(docsRoot, {
            recursive: true,
            force: true,
          })
          .pipe(Effect.mapError(DomainError.newCause(`Failed to remove "${docsRoot}"`)));
      }
    }

    yield* fs
      .makeDirectory(docsRoot, { recursive: true })
      .pipe(Effect.mapError(DomainError.newCause(`Failed to create "${docsRoot}"`)));

    const sortedPackages = A.sort(packages, byDocsOutputPathAscending);
    return yield* Effect.forEach(
      sortedPackages,
      (pkg, index) =>
        Effect.gen(function* () {
          const sourceDir = path.join(pkg.absolutePath, ...DOCS_MODULES_SEGMENTS);
          const destinationDir = path.join(docsRoot, pkg.docsOutputPath);
          const hasDocs = yield* fs.exists(sourceDir).pipe(Effect.orElseSucceed(thunkFalse));

          if (!hasDocs) {
            return yield* new DomainError({
              message: `Package "${pkg.name}" does not have generated docs. Run "bun run beep docgen generate -p ${pkg.relativePath}" first.`,
            });
          }

          yield* fs
            .remove(destinationDir, {
              recursive: true,
              force: true,
            })
            .pipe(
              Effect.mapError(
                (cause) =>
                  new DomainError({
                    message: `Failed to reset "${destinationDir}"`,
                    cause,
                  })
              )
            );
          const fileCount = yield* copyDocsTree(sourceDir, destinationDir, pkg.name);
          yield* fs
            .writeFileString(
              path.join(destinationDir, "index.md"),
              generateDocsIndexContent(pkg.name, pkg.docsOutputPath, index + 2)
            )
            .pipe(Effect.mapError(DomainError.newCause(`Failed to write docs index for "${pkg.name}"`)));

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
 * Run the repo-local `@beep/docgen` implementation for a single workspace package.
 *
 * @param targetPackage - Target workspace package.
 * @returns Generation result including output and module count.
 * @category DomainModel
 * @since 0.0.0
 */
export const runDocgenForPackage: (
  targetPackage: DocgenWorkspacePackage
) => Effect.Effect<DocgenGenerationResult, never, FileSystem.FileSystem | Path.Path | ChildProcessSpawner> = (
  targetPackage
) => {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const repoRoot = yield* findRepoRoot(targetPackage.absolutePath);
    const docgenEntrypoint = path.join(repoRoot, "tooling", "docgen", "src", "bin.ts");
    const args = ["run", docgenEntrypoint] as const;
    const command = ChildProcess.make("bun", [...args], {
      cwd: targetPackage.absolutePath,
      stdout: "pipe",
      stderr: "pipe",
    });
    const result = yield* Effect.scoped(
      Effect.gen(function* () {
        const handle = yield* command;
        const output = yield* handle.all.pipe(
          Stream.decodeText(),
          Stream.runFold(thunkEmptyStr, (acc: string, chunk) => `${acc}${chunk}`)
        );
        const exitCode = yield* handle.exitCode;
        return {
          output: Str.trim(output),
          exitCode,
        };
      })
    ).pipe(
      Effect.catch((cause) =>
        Effect.succeed({
          output: pipe(cause, stringFromUnknown, Str.trim),
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
        ...(Str.isEmpty(result.output) ? {} : { output: result.output }),
      });
    }

    const docsModulesDir = path.join(targetPackage.absolutePath, ...DOCS_MODULES_SEGMENTS);
    const moduleCount = yield* fs.exists(docsModulesDir).pipe(
      Effect.orElseSucceed(thunkFalse),
      Effect.flatMap((exists) =>
        exists
          ? fs
              .readDirectory(docsModulesDir)
              .pipe(Effect.map(flow(A.filter(Str.endsWith(".md")), A.length)), Effect.orElseSucceed(thunk0))
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
  }).pipe(
    Effect.catch((cause) =>
      Effect.succeed(
        new DocgenGenerationResult({
          packageName: targetPackage.name,
          packagePath: targetPackage.relativePath,
          success: false,
          error: "docgen execution failed before completion",
          output: pipe(cause, stringFromUnknown, Str.trim),
        })
      )
    )
  );
};
