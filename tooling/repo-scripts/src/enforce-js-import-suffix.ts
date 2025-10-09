#!/usr/bin/env node
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { findRepoRoot } from "@beep/tooling-utils/repo";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { existsSync, statSync } from "node:fs";
import nodePath from "node:path";
import {
  Node as TsNode,
  Project,
  SyntaxKind,
  type ExportDeclaration,
  type ImportDeclaration,
  type ImportEqualsDeclaration,
  type ImportTypeNode,
  type SourceFile,
} from "ts-morph";

const SOURCE_EXTENSIONS: ReadonlyArray<string> = [
  "ts",
  "tsx",
  "mts",
  "cts",
  "js",
  "jsx",
  "mjs",
  "cjs",
] as const;

const ASSET_EXTENSIONS: ReadonlyArray<string> = [
  "json",
  "jsonc",
  "wasm",
  "css",
  "scss",
  "sass",
  "less",
  "svg",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "bmp",
  "avif",
  "webp",
  "ico",
  "xml",
  "yml",
  "yaml",
  "md",
  "mdx",
  "mdoc",
] as const;

const EXTENSIONS_WITH_DIRECT_JS_TARGET: ReadonlyArray<string> = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
] as const;

type Update = {
  readonly description: string;
  readonly apply: () => void;
};

type ScriptOptions = {
  readonly checkMode: boolean;
  readonly includeDocs: boolean;
};

type ScanResult = {
  readonly file: string;
  readonly updateCount: number;
  readonly fallbacks: ReadonlyArray<string>;
};

type Replacement = {
  readonly value: string;
  readonly fallback: boolean;
};

type UpdateRecord = {
  readonly update: Update;
  readonly fallback: O.Option<string>;
};

type UpdateCollection = {
  readonly updates: ReadonlyArray<Update>;
  readonly fallbacks: HashSet.HashSet<string>;
};

const emptyCollection: UpdateCollection = {
  updates: A.empty<Update>(),
  fallbacks: HashSet.empty<string>(),
};

const parseOptions = (argv: ReadonlyArray<string>): ScriptOptions => ({
  checkMode: F.pipe(argv, A.some((arg) => arg === "--check")),
  includeDocs: F.pipe(argv, A.some((arg) => arg === "--include-docs")),
});

const isRelativeSpecifier = (value: string): boolean =>
  F.pipe(value, Str.startsWith("./")) || F.pipe(value, Str.startsWith("../"));

const splitSpecifierSuffix = (specifier: string): { readonly base: string; readonly suffix: string } => {
  const indexes = F.pipe(
    [
      F.pipe(specifier, Str.indexOf("?")),
      F.pipe(specifier, Str.indexOf("#")),
    ] as ReadonlyArray<O.Option<number>>,
    A.filterMap(F.identity)
  );

  const maybeCutIndex = F.pipe(
    indexes,
    A.match({
      onEmpty: () => O.none<number>(),
      onNonEmpty: ([head, ...tail]) =>
        O.some(
          F.pipe(
            tail,
            A.reduce(head, (acc, value) => (value < acc ? value : acc))
          )
        ),
    })
  );

  return F.pipe(
    maybeCutIndex,
    O.match({
      onNone: () => ({ base: specifier, suffix: "" }),
      onSome: (cutIndex) => ({
        base: F.pipe(specifier, Str.slice(0, cutIndex)),
        suffix: F.pipe(specifier, Str.slice(cutIndex)),
      }),
    })
  );
};

const replaceBackslashes = (value: string): string => F.pipe(value, Str.replace(/\\/gu, "/"));

const ensureRelativePrefix = (value: string): string =>
  isRelativeSpecifier(value) ? value : `./${value}`;

const replaceExtensionWithJs = (filePath: string): string => {
  if (F.pipe(filePath, Str.endsWith(".d.ts"))) {
    return F.pipe(filePath, Str.replace(/\.d\.ts$/u, ".js"));
  }
  if (F.pipe(filePath, Str.endsWith(".d.mts"))) {
    return F.pipe(filePath, Str.replace(/\.d\.mts$/u, ".js"));
  }
  if (F.pipe(filePath, Str.endsWith(".d.cts"))) {
    return F.pipe(filePath, Str.replace(/\.d\.cts$/u, ".js"));
  }

  const parsed = nodePath.parse(filePath);
  if (parsed.ext === "") {
    return `${filePath}.js`;
  }

  return nodePath.format({
    dir: parsed.dir,
    root: parsed.root,
    name: parsed.name,
    ext: ".js",
  });
};

const isAssetExtension = (base: string): boolean =>
  F.pipe(
    ASSET_EXTENSIONS,
    A.some((ext) => F.pipe(base, Str.endsWith(`.${ext}`)))
  );

const toJsRelativePath = (relativePath: string): string =>
  nodePath.format({
    ...nodePath.parse(relativePath),
    base: undefined,
    ext: ".js",
  });

const computeReplacement = (specifier: string, fileDir: string, path_: Path.Path): O.Option<Replacement> => {
  if (!isRelativeSpecifier(specifier)) {
    return O.none();
  }

  const { base, suffix } = splitSpecifierSuffix(specifier);

  if (F.pipe(base, Str.endsWith(".js"))) {
    return O.none();
  }

  if (isAssetExtension(base)) {
    return O.none();
  }

  if (
    F.pipe(base, Str.endsWith(".d.ts")) ||
    F.pipe(base, Str.endsWith(".d.mts")) ||
    F.pipe(base, Str.endsWith(".d.cts"))
  ) {
    return O.none();
  }

  if (
    F.pipe(
      EXTENSIONS_WITH_DIRECT_JS_TARGET,
      A.some((ext) => F.pipe(base, Str.endsWith(ext)))
    )
  ) {
    const next = `${toJsRelativePath(base)}${suffix}`;
    return O.some({ value: replaceBackslashes(next), fallback: false });
  }

  const absoluteTarget = nodePath.resolve(fileDir, base);

  const directCandidate = F.pipe(
    SOURCE_EXTENSIONS,
    A.findFirst((ext) => existsSync(`${absoluteTarget}.${ext}`))
  );

  if (O.isSome(directCandidate)) {
    const filePath = `${absoluteTarget}.${directCandidate.value}`;
    const jsPath = replaceExtensionWithJs(filePath);
    const relative = path_.relative(fileDir, jsPath);
    const withPrefix = ensureRelativePrefix(replaceBackslashes(relative));
    return O.some({ value: `${withPrefix}${suffix}`, fallback: false });
  }

  const indexCandidate = F.pipe(
    SOURCE_EXTENSIONS,
    A.findFirst((ext) => existsSync(nodePath.join(absoluteTarget, `index.${ext}`)))
  );

  if (O.isSome(indexCandidate)) {
    const filePath = nodePath.join(absoluteTarget, `index.${indexCandidate.value}`);
    const jsPath = replaceExtensionWithJs(filePath);
    const relative = path_.relative(fileDir, jsPath);
    const withPrefix = ensureRelativePrefix(replaceBackslashes(relative));
    return O.some({ value: `${withPrefix}${suffix}`, fallback: false });
  }

  const maybeDirectory = existsSync(absoluteTarget) && (() => {
    try {
      return statSync(absoluteTarget).isDirectory();
    } catch {
      return false;
    }
  })();

  if (maybeDirectory) {
    const jsIndexPath = replaceBackslashes(`${base}/index.js`);
    return O.some({ value: `${jsIndexPath}${suffix}`, fallback: true });
  }

  const fallback = `${base}.js${suffix}`;
  return O.some({ value: replaceBackslashes(fallback), fallback: true });
};

const combineRecord = (collection: UpdateCollection, record: UpdateRecord): UpdateCollection => ({
  updates: F.pipe(collection.updates, A.append(record.update)),
  fallbacks: F.pipe(
    record.fallback,
    O.match({
      onNone: () => collection.fallbacks,
      onSome: (value) => F.pipe(collection.fallbacks, HashSet.add(value)),
    })
  ),
});

const collectImportUpdates = (
  sourceFile: SourceFile,
  fileDir: string,
  path_: Path.Path
): UpdateCollection => {
  const importRecords = F.pipe(
    sourceFile.getImportDeclarations(),
    A.filterMap((importDecl: ImportDeclaration): O.Option<UpdateRecord> => {
      const literal = importDecl.getModuleSpecifier();
      const current = literal.getLiteralText();

      return F.pipe(
        computeReplacement(current, fileDir, path_),
        O.filter((replacement) => replacement.value !== current),
        O.map((replacement) => ({
          update: {
            description: `import '${current}' -> '${replacement.value}'`,
            apply: () => literal.setLiteralValue(replacement.value),
          },
          fallback: replacement.fallback ? O.some(current) : O.none<string>(),
        }))
      );
    })
  );

  const exportRecords = F.pipe(
    sourceFile.getExportDeclarations(),
    A.filterMap((exportDecl: ExportDeclaration): O.Option<UpdateRecord> => {
      const literal = exportDecl.getModuleSpecifier();
      return F.pipe(
        O.fromNullable(literal),
        O.flatMap((specifier) => {
          const current = specifier.getLiteralText();
          return F.pipe(
            computeReplacement(current, fileDir, path_),
            O.filter((replacement) => replacement.value !== current),
            O.map((replacement) => ({
              update: {
                description: `export '${current}' -> '${replacement.value}'`,
                apply: () => specifier.setLiteralValue(replacement.value),
              },
              fallback: replacement.fallback ? O.some(current) : O.none<string>(),
            }))
          );
        })
      );
    })
  );

  const importEqualsRecords = F.pipe(
    sourceFile.getDescendantsOfKind(SyntaxKind.ImportEqualsDeclaration),
    A.filterMap((importEquals: ImportEqualsDeclaration): O.Option<UpdateRecord> => {
      const reference = importEquals.getModuleReference();
      if (!TsNode.isExternalModuleReference(reference)) {
        return O.none();
      }
      const expression = reference.getExpression();
      if (!expression) {
        return O.none();
      }
      if (!(TsNode.isStringLiteral(expression) || TsNode.isNoSubstitutionTemplateLiteral(expression))) {
        return O.none();
      }
      const current = expression.getLiteralText();
      return F.pipe(
        computeReplacement(current, fileDir, path_),
        O.filter((replacement) => replacement.value !== current),
        O.map((replacement) => ({
          update: {
            description: `import= '${current}' -> '${replacement.value}'`,
            apply: () => expression.setLiteralValue(replacement.value),
          },
          fallback: replacement.fallback ? O.some(current) : O.none<string>(),
        }))
      );
    })
  );

  const importTypeRecords = F.pipe(
    sourceFile.getDescendantsOfKind(SyntaxKind.ImportType),
    A.filterMap((importType: ImportTypeNode): O.Option<UpdateRecord> => {
      const argument = importType.getArgument();
      if (!argument) {
        return O.none();
      }
      if (!TsNode.isLiteralTypeNode(argument)) {
        return O.none();
      }
      const literal = argument.getLiteral();
      if (!(TsNode.isStringLiteral(literal) || TsNode.isNoSubstitutionTemplateLiteral(literal))) {
        return O.none();
      }
      const current = literal.getLiteralText();
      return F.pipe(
        computeReplacement(current, fileDir, path_),
        O.filter((replacement) => replacement.value !== current),
        O.map((replacement) => ({
          update: {
            description: `import type '${current}' -> '${replacement.value}'`,
            apply: () => literal.setLiteralValue(replacement.value),
          },
          fallback: replacement.fallback ? O.some(current) : O.none<string>(),
        }))
      );
    })
  );

  const dynamicImportRecords = F.pipe(
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression),
    A.filterMap((callExpr): O.Option<UpdateRecord> => {
      const expression = callExpr.getExpression();
      const args = callExpr.getArguments();

      return F.pipe(
        A.head(args),
        O.filter((firstArg) => TsNode.isStringLiteral(firstArg) || TsNode.isNoSubstitutionTemplateLiteral(firstArg)),
        O.flatMap((firstArg) => {
          const isDynamicImport = expression.getKind() === SyntaxKind.ImportKeyword;
          const isRequire =
            TsNode.isIdentifier(expression) &&
            expression.getText() === "require";

          if (!isDynamicImport && !isRequire) {
            return O.none();
          }

          const current = firstArg.getLiteralText();
          return F.pipe(
            computeReplacement(current, fileDir, path_),
            O.filter((replacement) => replacement.value !== current),
            O.map((replacement) => ({
              update: {
                description: `dynamic import '${current}' -> '${replacement.value}'`,
                apply: () => firstArg.setLiteralValue(replacement.value),
              },
              fallback: replacement.fallback ? O.some(current) : O.none<string>(),
            }))
          );
        })
      );
    })
  );

  const newUrlRecords = F.pipe(
    sourceFile.getDescendantsOfKind(SyntaxKind.NewExpression),
    A.filterMap((newExpr): O.Option<UpdateRecord> => {
      const expression = newExpr.getExpression();
      if (!TsNode.isIdentifier(expression) || expression.getText() !== "URL") {
        return O.none();
      }

      const args = newExpr.getArguments();
      return F.pipe(
        A.head(args),
        O.filter((firstArg) => TsNode.isStringLiteral(firstArg) || TsNode.isNoSubstitutionTemplateLiteral(firstArg)),
        O.flatMap((firstArg) => {
          const current = firstArg.getLiteralText();
          return F.pipe(
            computeReplacement(current, fileDir, path_),
            O.filter((replacement) => replacement.value !== current),
            O.map((replacement) => ({
              update: {
                description: `new URL '${current}' -> '${replacement.value}'`,
                apply: () => firstArg.setLiteralValue(replacement.value),
              },
              fallback: replacement.fallback ? O.some(current) : O.none<string>(),
            }))
          );
        })
      );
    })
  );

  const buckets: ReadonlyArray<ReadonlyArray<UpdateRecord>> = [
    importRecords,
    exportRecords,
    importEqualsRecords,
    importTypeRecords,
    dynamicImportRecords,
    newUrlRecords,
  ];

  return F.pipe(
    buckets,
    A.reduce(emptyCollection, (collection, records) =>
      F.pipe(
        records,
        A.reduce(collection, combineRecord)
      )
    )
  );
};

const processSourceFile = (
  sourceFile: SourceFile,
  path_: Path.Path,
  options: ScriptOptions
): ScanResult => {
  const filePath = sourceFile.getFilePath();
  const fileDir = nodePath.dirname(filePath);
  const collection = collectImportUpdates(sourceFile, fileDir, path_);
  const updateCount = F.pipe(collection.updates, A.length);

  if (updateCount === 0) {
    return {
      file: filePath,
      updateCount,
      fallbacks: [],
    };
  }

  if (!options.checkMode) {
    F.pipe(
      collection.updates,
      A.forEach((update) => update.apply())
    );
    sourceFile.saveSync();
  }

  return {
    file: filePath,
    updateCount,
    fallbacks: F.pipe(collection.fallbacks, HashSet.toValues),
  };
};

const gatherSourceFiles = (options: { readonly repoRoot: string }) =>
  Effect.gen(function* () {
    const fsUtils = yield* FsUtils;

    const patterns: Array<string> = [
      "**/*.ts",
      "**/*.tsx",
      "**/*.mts",
      "**/*.cts",
      "**/*.js",
      "**/*.jsx",
      "**/*.mjs",
      "**/*.cjs",
    ];

    const ignore: Array<string> = [
      "**/node_modules/**",
      "**/.git/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/.effect-cache/**",
    ];

    return yield* fsUtils.globFiles(patterns, {
      cwd: options.repoRoot,
      absolute: true,
      ignore,
    });
  });

const program = Effect.gen(function* () {
  const path_ = yield* Path.Path;
  const repoRoot = yield* findRepoRoot;

  const options = parseOptions(process.argv.slice(2));

  yield* Console.log("🔍 Scanning for relative imports without .js suffix...");

  if (options.includeDocs) {
    yield* Console.log("⚠️  Markdown processing is not yet implemented; continuing with code files only.");
  }

  const allFiles = yield* gatherSourceFiles({ repoRoot });

  const project = new Project({
    tsConfigFilePath: nodePath.join(repoRoot, "tsconfig.json"),
    skipFileDependencyResolution: true,
    skipLoadingLibFiles: true,
  });

  F.pipe(
    allFiles,
    A.forEach((filePath) => {
      project.addSourceFileAtPathIfExists(filePath);
    })
  );

  const sourceFiles = project.getSourceFiles();

  const summary = F.pipe(
    sourceFiles,
    A.reduce(
      {
        touchedFiles: 0,
        totalUpdates: 0,
        filesNeedingCheck: HashSet.empty<string>(),
        fallbackNotices: A.empty<{ readonly file: string; readonly specifier: string }>(),
      },
      (acc, sourceFile_) => {
        const { updateCount, file, fallbacks } = processSourceFile(sourceFile_, path_, options);

        const touchedFiles = updateCount > 0 ? acc.touchedFiles + 1 : acc.touchedFiles;
        const totalUpdates = acc.totalUpdates + updateCount;
        const filesNeedingCheck =
          options.checkMode && updateCount > 0
            ? F.pipe(acc.filesNeedingCheck, HashSet.add(file))
            : acc.filesNeedingCheck;

        const fallbackNotices = F.pipe(
          fallbacks,
          A.map((specifier) => ({ file, specifier })),
          A.reduce(acc.fallbackNotices, (list, notice) => F.pipe(list, A.append(notice)))
        );

        return {
          touchedFiles,
          totalUpdates,
          filesNeedingCheck,
          fallbackNotices,
        };
      }
    )
  );

  const filesNeedingCheckCount = F.pipe(summary.filesNeedingCheck, HashSet.size);

  if (options.checkMode && filesNeedingCheckCount > 0) {
    yield* Console.log("❌ Missing .js suffix detected in the following files:");
    yield* Effect.forEach(
      HashSet.toValues(summary.filesNeedingCheck),
      (file) =>
        Effect.gen(function* () {
          const relative = nodePath.relative(repoRoot, file);
          yield* Console.log(`   - ${relative}`);
        }),
      { discard: true }
    );

    return yield* Effect.fail(
      new Error(
        `Detected ${summary.totalUpdates} relative import specifier(s) missing .js suffix across ${filesNeedingCheckCount} file(s).`
      )
    );
  }

  if (!options.checkMode) {
    yield* Console.log(
      `✅ Updated ${summary.totalUpdates} relative import specifier(s) across ${summary.touchedFiles} file(s).`
    );

    if (F.pipe(summary.fallbackNotices, A.length) > 0) {
      yield* Console.log("\n⚠️  Used fallback heuristics for unresolved targets:");
      yield* Effect.forEach(
        summary.fallbackNotices,
        (notice) =>
          Effect.gen(function* () {
            const relativePath = nodePath.relative(repoRoot, notice.file);
            yield* Console.log(`   - ${relativePath}: ${notice.specifier}`);
          }),
        { discard: true }
      );
    }
  } else {
    yield* Console.log("✅ All relative imports already include .js suffix.");
  }
});

const layer = Layer.mergeAll(BunContext.layer, FsUtilsLive);

const main = program.pipe(
  Effect.provide(layer),
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Console.log(`\n💥 enforce-js-import-suffix failed: ${String(error)}`);
      const cause = Cause.fail(error);
      yield* Console.log(`\n🔍 Details: ${Cause.pretty(cause)}`);
      return yield* Effect.fail(error);
    })
  )
);

BunRuntime.runMain(main);
