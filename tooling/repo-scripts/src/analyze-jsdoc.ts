#!/usr/bin/env node
import { DomainError, findRepoRoot } from "@beep/tooling-utils/repo";
import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import type { PlatformError } from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import * as Glob from "glob";
import color from "picocolors";
import ts from "typescript";

const DEFAULT_SCOPE = "schema-v2" as const;

const SCOPE_PATHS: Record<string, string> = {
  invariant: "packages/common/invariant",
  // schema: "packages/common/schema",
  "schema-v2": "packages/common/schema-v2",
  identity: "packages/common/identity",
  types: "packages/common/types",
  utils: "packages/common/utils",
};

const REQUIRED_TAGS = ["category", "example", "since"] as const;
type RequiredTag = (typeof REQUIRED_TAGS)[number];

type MissingRecord = {
  readonly file: string;
  readonly exportName: string;
  readonly line: number;
  readonly missingTags: ReadonlyArray<RequiredTag>;
};

type FileSummary = {
  readonly file: string;
  readonly exports: number;
  readonly missing: ReadonlyArray<MissingRecord>;
};

const jsdocOptions = {
  scope: F.pipe(Options.text("scope"), Options.withAlias("s"), Options.withDefault(DEFAULT_SCOPE)),
  files: F.pipe(
    Options.repeated(Options.text("file")),
    Options.withAlias("f"),
    Options.withDefault([] as ReadonlyArray<string>)
  ),
  includeInternal: F.pipe(Options.boolean("include-internal"), Options.withAlias("i"), Options.withDefault(false)),
  pattern: F.pipe(Options.text("pattern"), Options.withAlias("p"), Options.withDefault("src/**/*.ts")),
  output: F.pipe(Options.text("output"), Options.withAlias("o"), Options.optional),
  root: F.pipe(Options.text("root"), Options.withAlias("r"), Options.optional),
};

const jsdocCommand = Command.make("jsdoc", jsdocOptions, (config) =>
  Effect.gen(function* () {
    const repoRoot = yield* findRepoRoot;
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const scopePath = SCOPE_PATHS[config.scope] ?? config.scope;
    const defaultRoot = path.join(repoRoot, scopePath);

    const resolvedRoot = F.pipe(
      config.root,
      O.match({
        onNone: () => defaultRoot,
        onSome: (customRoot) => (path.isAbsolute(customRoot) ? customRoot : path.join(repoRoot, customRoot)),
      })
    );

    const defaultPattern = path.join(resolvedRoot, config.pattern);

    const patternInputs = F.pipe(
      config.files,
      A.match({
        onEmpty: () => [defaultPattern] as ReadonlyArray<string>,
        onNonEmpty: (values) => values,
      })
    );

    const expandedPaths = F.pipe(
      patternInputs,
      A.flatMap((input) => expandInputPattern(input, { repoRoot, path }))
    );

    const uniquePaths = dedupePaths(expandedPaths);

    const filteredPaths = F.pipe(
      uniquePaths,
      A.filter((filePath) =>
        shouldIncludeFile(filePath, { root: resolvedRoot, includeInternal: config.includeInternal, path })
      )
    );

    const tsFiles = F.pipe(filteredPaths, A.filter(isTypeScriptSource));

    if (A.isEmptyArray(tsFiles)) {
      const hint = color.yellow("No matching TypeScript files found for analysis.");
      yield* Console.log(hint);
      return;
    }

    const fileSummaries = yield* Effect.forEach(
      tsFiles,
      (filePath) =>
        analyzeFile({
          absolutePath: filePath,
          repoRoot,
          fs,
          path,
        }),
      { concurrency: 4 }
    );

    const filesScanned = A.length(fileSummaries);

    const exportsChecked = F.pipe(
      fileSummaries,
      A.reduce(0, (total, summary) => total + summary.exports)
    );

    const missingRecords = F.pipe(
      fileSummaries,
      A.flatMap((summary) => summary.missing)
    );

    const missingByTag = F.pipe(
      missingRecords,
      A.reduce(
        {
          category: 0,
          example: 0,
          since: 0,
        } as Record<RequiredTag, number>,
        (acc, record) =>
          F.pipe(
            record.missingTags,
            A.reduce(acc, (innerAcc, tag) => ({
              ...innerAcc,
              [tag]: innerAcc[tag] + 1,
            }))
          )
      )
    );

    const outputPath = F.pipe(
      config.output,
      O.match({
        onNone: () => path.join(repoRoot, "jsdoc-analysis-results.json"),
        onSome: (customPath) => (path.isAbsolute(customPath) ? customPath : path.join(repoRoot, customPath)),
      })
    );

    const summary = {
      scope: config.scope,
      root: resolvedRoot,
      pattern: config.pattern,
      includeInternal: config.includeInternal,
      filesScanned,
      exportsChecked,
      missingCount: A.length(missingRecords),
      missingByTag,
      items: missingRecords,
      generatedAt: DateTime.toDate(DateTime.unsafeNow()).toISOString(),
    };

    const summaryContent = `${JSON.stringify(summary, null, 2)}\n`;
    yield* fs.writeFileString(outputPath, summaryContent);

    yield* Console.log(color.cyan(`Analyzed ${filesScanned} files (${exportsChecked} exports).`));
    yield* Console.log(color.cyan(`Results written to ${path.relative(repoRoot, outputPath)}`));

    if (A.isEmptyArray(missingRecords)) {
      yield* Console.log(color.green("All exports include @category, @example, and @since tags."));
      return;
    }

    const issueCount = A.length(missingRecords);
    yield* Console.log(color.red(`Detected ${issueCount} exports with missing required tags:`));

    const sortedRecords = sortMissingRecords(missingRecords);

    yield* Effect.forEach(
      sortedRecords,
      (record) =>
        Console.log(`- ${record.file}:${record.line} — ${record.exportName} missing ${formatTags(record.missingTags)}`),
      { discard: true }
    );

    yield* Console.log(color.yellow("Run the analyzer again after fixing the missing tags."));
    return yield* Effect.fail(
      new DomainError({
        message: "JSDoc analyzer found missing metadata.",
        cause: {},
      })
    );
  })
).pipe(Command.withDescription("Analyze JSDoc blocks for required tags."));

const run = Command.run(jsdocCommand, { name: "beep-jsdoc", version: "0.0.0" });

export const main = (argv: ReadonlyArray<string>) =>
  run(argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain);

const scriptMeta = import.meta as ImportMeta & { readonly main?: boolean | undefined };
if (scriptMeta.main ?? true) {
  main(process.argv);
}

const hasGlobSyntax = (value: string): boolean =>
  F.pipe(
    ["*", "?", "["] as const,
    A.some((token) => F.pipe(value, Str.includes(token)))
  );

const expandInputPattern = (
  input: string,
  context: { readonly repoRoot: string; readonly path: Path.Path }
): ReadonlyArray<string> => {
  const { repoRoot, path } = context;

  const segments = F.pipe(Str.split(",")(input), A.map(Str.trim), A.filter(Str.isNonEmpty));

  if (A.length(segments) > 1) {
    return F.pipe(
      segments,
      A.flatMap((segment) => expandInputPattern(segment, context))
    );
  }

  const normalizedInput = segments[0] ?? input;
  const candidate = path.isAbsolute(normalizedInput) ? normalizedInput : path.join(repoRoot, normalizedInput);
  if (!hasGlobSyntax(candidate)) {
    return [candidate];
  }
  return Glob.sync(candidate, { nodir: true, absolute: true });
};

const dedupePaths = (paths: ReadonlyArray<string>): ReadonlyArray<string> =>
  F.pipe(
    paths,
    A.reduce(
      {
        seen: HashSet.empty<string>(),
        result: [] as ReadonlyArray<string>,
      },
      (state, filePath) =>
        HashSet.has(state.seen, filePath)
          ? state
          : {
              seen: HashSet.add(state.seen, filePath),
              result: A.append(state.result, filePath),
            }
    ),
    (state) => state.result
  );

const INTERNAL_SEGMENT = "src/internal";

const shouldIncludeFile = (
  filePath: string,
  context: { readonly root: string; readonly includeInternal: boolean; readonly path: Path.Path }
): boolean => {
  if (isDeclarationFile(filePath)) {
    return false;
  }

  if (context.includeInternal) {
    return true;
  }

  const relativeToRoot = context.path.relative(context.root, filePath);
  const normalized = toPosix(relativeToRoot);

  if (Str.isEmpty(normalized)) {
    return true;
  }

  const startsWithInternal = Str.startsWith(`${INTERNAL_SEGMENT}/`)(normalized);
  const isInternalDir = normalized === INTERNAL_SEGMENT;
  return !(startsWithInternal || isInternalDir);
};

const isDeclarationFile = (filePath: string): boolean => Str.endsWith(".d.ts")(filePath);

const isTypeScriptSource = (filePath: string): boolean => Str.endsWith(".ts")(filePath) && !isDeclarationFile(filePath);

const toPosix = (value: string): string => Str.replaceAll("\\", "/")(value);

const analyzeFile = ({
  absolutePath,
  repoRoot,
  fs,
  path,
}: {
  readonly absolutePath: string;
  readonly repoRoot: string;
  readonly fs: FileSystem.FileSystem;
  readonly path: Path.Path;
}): Effect.Effect<FileSummary, PlatformError, never> =>
  Effect.gen(function* () {
    const contents = yield* fs.readFileString(absolutePath);
    const sourceFile = ts.createSourceFile(absolutePath, contents, ts.ScriptTarget.Latest, true);
    const repoRelative = path.relative(repoRoot, absolutePath);
    const normalized = toPosix(repoRelative);
    return analyzeSourceFile(sourceFile, normalized);
  });

const analyzeSourceFile = (sourceFile: ts.SourceFile, relativePath: string): FileSummary => {
  let exports = 0;
  let missing: ReadonlyArray<MissingRecord> = [];

  const visitStatement = (node: ts.Statement) => {
    if (ts.isExportDeclaration(node) || ts.isExportSpecifier(node)) {
      return;
    }

    if (ts.isVariableStatement(node) && hasExportModifier(node)) {
      missing = handleVariableStatement(node, sourceFile, relativePath, missing, () => {
        exports += 1;
      });
      return;
    }

    if (ts.isFunctionDeclaration(node) && hasExportModifier(node)) {
      const fnName = node.name ? node.name.text : "default";
      missing = handleSimpleNode(node, fnName, sourceFile, relativePath, missing, () => {
        exports += 1;
      });
      return;
    }

    if (ts.isClassDeclaration(node) && hasExportModifier(node)) {
      const className = node.name ? node.name.text : "default";
      missing = handleSimpleNode(node, className, sourceFile, relativePath, missing, () => {
        exports += 1;
      });
      return;
    }

    if (ts.isInterfaceDeclaration(node) && hasExportModifier(node)) {
      missing = handleSimpleNode(node, node.name.text, sourceFile, relativePath, missing, () => {
        exports += 1;
      });
      return;
    }

    if (ts.isTypeAliasDeclaration(node) && hasExportModifier(node)) {
      missing = handleSimpleNode(node, node.name.text, sourceFile, relativePath, missing, () => {
        exports += 1;
      });
      return;
    }

    if (ts.isEnumDeclaration(node) && hasExportModifier(node)) {
      missing = handleSimpleNode(node, node.name.text, sourceFile, relativePath, missing, () => {
        exports += 1;
      });
      return;
    }

    if (ts.isModuleDeclaration(node) && hasExportModifier(node)) {
      missing = handleSimpleNode(node, node.name.getText(sourceFile), sourceFile, relativePath, missing, () => {
        exports += 1;
      });
      return;
    }

    if (ts.isExportAssignment(node)) {
      const exportName = node.isExportEquals ? "export=" : "default";
      missing = handleSimpleNode(node, exportName, sourceFile, relativePath, missing, () => {
        exports += 1;
      });
    }
  };

  sourceFile.statements.forEach(visitStatement);

  return {
    file: relativePath,
    exports,
    missing,
  };
};

const gatherDocInfo = (node: ts.Node) => {
  const jsDocExampleKind = (ts.SyntaxKind as { readonly JSDocExampleTag?: ts.SyntaxKind }).JSDocExampleTag;

  const tagNames = F.pipe(
    ts.getJSDocTags(node),
    A.map((tag) => {
      if (tag.tagName) {
        return Str.toLowerCase(tag.tagName.getText());
      }
      if (jsDocExampleKind !== undefined && tag.kind === jsDocExampleKind) {
        return "example";
      }
      return "";
    }),
    A.filter(Str.isNonEmpty)
  );

  const tagSet = F.pipe(
    tagNames,
    A.reduce(HashSet.empty<string>(), (set, tag) => HashSet.add(set, tag))
  );

  const hasInternal = HashSet.has(tagSet, "internal");

  const missingTags = F.pipe(
    REQUIRED_TAGS,
    A.filter((required) => !HashSet.has(tagSet, required))
  );

  return {
    hasInternal,
    missingTags,
  };
};

const handleVariableStatement = (
  statement: ts.VariableStatement,
  sourceFile: ts.SourceFile,
  relativePath: string,
  missing: ReadonlyArray<MissingRecord>,
  onCount: () => void
): ReadonlyArray<MissingRecord> => {
  const docInfo = gatherDocInfo(statement);
  if (docInfo.hasInternal) {
    return missing;
  }

  const identifiers = F.pipe(
    statement.declarationList.declarations,
    A.filter((declaration) => ts.isIdentifier(declaration.name)),
    A.map((declaration) => declaration.name as ts.Identifier)
  );

  let nextMissing = missing;
  A.forEach(identifiers, (identifier) => {
    onCount();
    if (A.isEmptyArray(docInfo.missingTags)) {
      return;
    }
    nextMissing = A.append(nextMissing, {
      file: relativePath,
      exportName: identifier.text,
      line: getLineNumber(identifier, sourceFile),
      missingTags: docInfo.missingTags,
    });
  });

  return nextMissing;
};

const handleSimpleNode = (
  node: ts.Node,
  exportName: string,
  sourceFile: ts.SourceFile,
  relativePath: string,
  missing: ReadonlyArray<MissingRecord>,
  onCount: () => void
): ReadonlyArray<MissingRecord> => {
  const docInfo = gatherDocInfo(node);
  if (docInfo.hasInternal) {
    return missing;
  }

  onCount();

  if (A.isEmptyArray(docInfo.missingTags)) {
    return missing;
  }

  return A.append(missing, {
    file: relativePath,
    exportName,
    line: getLineNumber(node, sourceFile),
    missingTags: docInfo.missingTags,
  });
};

const getLineNumber = (node: ts.Node, sourceFile: ts.SourceFile): number => {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return position.line + 1;
};

const hasExportModifier = (node: ts.Node): boolean => {
  if (!("modifiers" in node)) {
    return false;
  }
  const modifiers = (node.modifiers ?? []) as ReadonlyArray<ts.ModifierLike>;
  return A.some(modifiers, (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
};

const sortMissingRecords = (records: ReadonlyArray<MissingRecord>): ReadonlyArray<MissingRecord> => {
  const order = Order.tuple(Order.string, Order.number, Order.string);
  return A.sortWith(records, (record) => [record.file, record.line, record.exportName] as const, order);
};

const formatTags = (tags: ReadonlyArray<RequiredTag>): string =>
  F.pipe(
    tags,
    A.map((tag) => `@${tag}`),
    (items) => A.join(", ")(items)
  );
