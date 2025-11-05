import { existsSync, statSync } from "node:fs";
import nodePath from "node:path";
import { FsUtils } from "@beep/tooling-utils/FsUtils";
import type * as Prompt from "@effect/cli/Prompt";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as Str from "effect/String";
import type {
  ExportDeclaration,
  ImportDeclaration,
  ImportEqualsDeclaration,
  ImportTypeNode,
  SourceFile,
} from "ts-morph";
import { Project, SyntaxKind, Node as TsNode } from "ts-morph";

export type ScriptOptions = {
  readonly checkMode: boolean;
};

export type PackageTarget = {
  readonly name: string;
  readonly dir: string;
  readonly relativeDir: string;
};

export type PackageResult = {
  readonly packageName: string;
  readonly filesTouched: number;
  readonly specifiersUpdated: number;
  readonly fallbackNotices: ReadonlyArray<{ readonly file: string; readonly specifier: string }>;
};

const SOURCE_EXTENSIONS: ReadonlyArray<string> = ["ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs"] as const;

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

type Replacement = {
  readonly value: string;
  readonly fallback: boolean;
};

type ScanResult = {
  readonly file: string;
  readonly updateCount: number;
  readonly fallbacks: ReadonlyArray<string>;
};

type Update = {
  readonly description: string;
  readonly apply: () => void;
};

type UpdateCollection = {
  readonly updates: ReadonlyArray<Update>;
  readonly fallbacks: HashSet.HashSet<string>;
};

type SourceFileProcessing = {
  readonly scan: ScanResult;
  readonly updates: ReadonlyArray<Update>;
};

const emptyCollection: UpdateCollection = {
  updates: [] as ReadonlyArray<Update>,
  fallbacks: HashSet.empty<string>(),
};

const isRelativeSpecifier = (value: string): boolean =>
  F.pipe(value, Str.startsWith("./")) || F.pipe(value, Str.startsWith("../"));

const splitSpecifierSuffix = (specifier: string): { readonly base: string; readonly suffix: string } => {
  const queryIndex = F.pipe(specifier, Str.indexOf("?"));
  const hashIndex = F.pipe(specifier, Str.indexOf("#"));

  const resolvedIndex = F.pipe(
    queryIndex,
    O.match({
      onNone: () =>
        F.pipe(
          hashIndex,
          O.getOrElse(() => -1)
        ),
      onSome: (qIndex) =>
        F.pipe(
          hashIndex,
          O.match({
            onNone: () => qIndex,
            onSome: (hIndex) => (qIndex < hIndex ? qIndex : hIndex),
          })
        ),
    })
  );

  if (resolvedIndex < 0) {
    return {
      base: specifier,
      suffix: Str.empty,
    };
  }

  return {
    base: F.pipe(specifier, Str.slice(0, resolvedIndex)),
    suffix: F.pipe(specifier, Str.slice(resolvedIndex)),
  };
};

const replaceBackslashes = (value: string): string => F.pipe(value, Str.replaceAll(/\\/g, "/"));

const ensureRelativePrefix = (value: string): string =>
  F.pipe(value, (candidate) =>
    F.pipe(candidate, Str.startsWith("./")) || F.pipe(candidate, Str.startsWith("../"))
      ? candidate
      : Str.concat("./", candidate)
  );

const replaceExtensionWithJs = (filePath: string): string => {
  if (F.pipe(filePath, Str.endsWith(".d.ts"))) {
    return Str.concat(F.pipe(filePath, Str.slice(0, Str.length(filePath) - 4)), ".js");
  }

  if (F.pipe(filePath, Str.endsWith(".d.mts")) || F.pipe(filePath, Str.endsWith(".d.cts"))) {
    return Str.concat(F.pipe(filePath, Str.slice(0, Str.length(filePath) - 6)), ".js");
  }

  const ext = nodePath.extname(filePath);
  if (F.pipe(ext, Str.isEmpty)) {
    return Str.concat(filePath, ".js");
  }

  const extLength = Str.length(ext);
  return Str.concat(F.pipe(filePath, Str.slice(0, Str.length(filePath) - extLength)), ".js");
};

const appendExtension = (value: string, extension: string): string => Str.concat(Str.concat(value, "."), extension);

const isAssetExtension = (base: string): boolean =>
  F.pipe(
    ASSET_EXTENSIONS,
    A.some((ext) => F.pipe(base, Str.endsWith(appendExtension("", ext))))
  );

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
    const ext = nodePath.extname(base);
    const withoutExt = F.pipe(Str.isEmpty(ext), (isEmptyExt) =>
      isEmptyExt ? base : F.pipe(base, Str.slice(0, Str.length(base) - Str.length(ext)))
    );
    const replaced = replaceBackslashes(Str.concat(withoutExt, ".js"));
    return O.some({
      value: Str.concat(replaced, suffix),
      fallback: false,
    });
  }

  const absoluteTarget = nodePath.resolve(fileDir, base);

  const directCandidate = A.findFirst(SOURCE_EXTENSIONS, (ext) => existsSync(appendExtension(absoluteTarget, ext)));

  if (O.isSome(directCandidate)) {
    const filePath = appendExtension(absoluteTarget, directCandidate.value);
    const jsPath = replaceExtensionWithJs(filePath);
    const relative = path_.relative(fileDir, jsPath);
    const withPrefix = ensureRelativePrefix(replaceBackslashes(relative));
    return O.some({
      value: Str.concat(withPrefix, suffix),
      fallback: false,
    });
  }

  const indexCandidate = A.findFirst(SOURCE_EXTENSIONS, (ext) =>
    existsSync(nodePath.join(absoluteTarget, Str.concat("index.", ext)))
  );

  if (O.isSome(indexCandidate)) {
    const filePath = nodePath.join(absoluteTarget, Str.concat("index.", indexCandidate.value));
    const jsPath = replaceExtensionWithJs(filePath);
    const relative = path_.relative(fileDir, jsPath);
    const withPrefix = ensureRelativePrefix(replaceBackslashes(relative));
    return O.some({
      value: Str.concat(withPrefix, suffix),
      fallback: false,
    });
  }

  const maybeDirectory =
    existsSync(absoluteTarget) &&
    (() => {
      try {
        return statSync(absoluteTarget).isDirectory();
      } catch {
        return false;
      }
    })();

  if (maybeDirectory) {
    const jsIndexRelative = replaceBackslashes(Str.concat(Str.concat(base, "/"), "index.js"));
    return O.some({
      value: Str.concat(jsIndexRelative, suffix),
      fallback: true,
    });
  }

  const fallbackRelative = replaceBackslashes(Str.concat(base, ".js"));
  return O.some({
    value: Str.concat(fallbackRelative, suffix),
    fallback: true,
  });
};

const describeChange = (kind: string, previous: string, next: string): string => {
  const withKind = Str.concat(kind, " '");
  const withPrevious = Str.concat(withKind, previous);
  const withArrow = Str.concat(withPrevious, "' -> '");
  const withNext = Str.concat(withArrow, next);
  return Str.concat(withNext, "'");
};

const applyReplacement = (
  collection: UpdateCollection,
  kind: string,
  current: string,
  setter: (next: string) => void,
  replacement: O.Option<Replacement>
): UpdateCollection => {
  if (O.isNone(replacement)) {
    return collection;
  }

  const { value: nextValue, fallback } = replacement.value;
  if (nextValue === current) {
    return collection;
  }

  const update: Update = {
    description: describeChange(kind, current, nextValue),
    apply: () => setter(nextValue),
  };

  const updates = F.pipe(collection.updates, A.append(update));
  const fallbacks = fallback ? HashSet.add(collection.fallbacks, current) : collection.fallbacks;

  return {
    updates,
    fallbacks,
  };
};

const collectImportUpdates = (sourceFile: SourceFile, fileDir: string, path_: Path.Path): UpdateCollection => {
  const importCollection = F.pipe(
    sourceFile.getImportDeclarations(),
    A.fromIterable,
    A.reduce(emptyCollection, (state, importDecl: ImportDeclaration) => {
      const literal = importDecl.getModuleSpecifier();
      const current = literal.getLiteralText();
      const replacement = computeReplacement(current, fileDir, path_);
      return applyReplacement(state, "import", current, (next) => literal.setLiteralValue(next), replacement);
    })
  );

  const exportCollection = F.pipe(
    sourceFile.getExportDeclarations(),
    A.fromIterable,
    A.reduce(importCollection, (state, exportDecl: ExportDeclaration) => {
      const literal = exportDecl.getModuleSpecifier();
      if (!literal) {
        return state;
      }
      const current = literal.getLiteralText();
      const replacement = computeReplacement(current, fileDir, path_);
      return applyReplacement(state, "export", current, (next) => literal.setLiteralValue(next), replacement);
    })
  );

  const importEqualsCollection = F.pipe(
    sourceFile.getDescendantsOfKind(SyntaxKind.ImportEqualsDeclaration),
    A.fromIterable,
    A.reduce(exportCollection, (state, importEquals: ImportEqualsDeclaration) => {
      const reference = importEquals.getModuleReference();
      if (!TsNode.isExternalModuleReference(reference)) {
        return state;
      }
      const expression = reference.getExpression();
      if (!expression) {
        return state;
      }
      if (!(TsNode.isStringLiteral(expression) || TsNode.isNoSubstitutionTemplateLiteral(expression))) {
        return state;
      }
      const current = expression.getLiteralText();
      const replacement = computeReplacement(current, fileDir, path_);
      return applyReplacement(state, "import=", current, (next) => expression.setLiteralValue(next), replacement);
    })
  );

  const importTypeCollection = F.pipe(
    sourceFile.getDescendantsOfKind(SyntaxKind.ImportType),
    A.fromIterable,
    A.reduce(importEqualsCollection, (state, importType: ImportTypeNode) => {
      const argument = importType.getArgument();
      if (!argument || !TsNode.isLiteralTypeNode(argument)) {
        return state;
      }
      const literal = argument.getLiteral();
      if (!(TsNode.isStringLiteral(literal) || TsNode.isNoSubstitutionTemplateLiteral(literal))) {
        return state;
      }
      const current = literal.getLiteralText();
      const replacement = computeReplacement(current, fileDir, path_);
      return applyReplacement(state, "import type", current, (next) => literal.setLiteralValue(next), replacement);
    })
  );

  const callExpressionCollection = F.pipe(
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression),
    A.fromIterable,
    A.reduce(importTypeCollection, (state, callExpr) => {
      const expression = callExpr.getExpression();
      const args = callExpr.getArguments();
      if (F.pipe(args, A.isEmptyReadonlyArray)) {
        return state;
      }
      const firstArg = A.unsafeGet(args, 0);

      const isDynamicImport =
        expression.getKind() === SyntaxKind.ImportKeyword &&
        (TsNode.isStringLiteral(firstArg) || TsNode.isNoSubstitutionTemplateLiteral(firstArg));

      const isRequireCall =
        TsNode.isIdentifier(expression) &&
        expression.getText() === "require" &&
        (TsNode.isStringLiteral(firstArg) || TsNode.isNoSubstitutionTemplateLiteral(firstArg));

      if (!isDynamicImport && !isRequireCall) {
        return state;
      }

      if (!(TsNode.isStringLiteral(firstArg) || TsNode.isNoSubstitutionTemplateLiteral(firstArg))) {
        return state;
      }

      const current = firstArg.getLiteralText();
      const replacement = computeReplacement(current, fileDir, path_);
      return applyReplacement(
        state,
        isRequireCall ? "require" : "dynamic import",
        current,
        (next) => firstArg.setLiteralValue(next),
        replacement
      );
    })
  );

  const newExpressionCollection = F.pipe(
    sourceFile.getDescendantsOfKind(SyntaxKind.NewExpression),
    A.fromIterable,
    A.reduce(callExpressionCollection, (state, newExpr) => {
      const expression = newExpr.getExpression();
      if (!TsNode.isIdentifier(expression) || expression.getText() !== "URL") {
        return state;
      }
      const args = newExpr.getArguments();
      if (F.pipe(args, A.isEmptyReadonlyArray)) {
        return state;
      }
      const firstArg = A.unsafeGet(args, 0);
      if (!(TsNode.isStringLiteral(firstArg) || TsNode.isNoSubstitutionTemplateLiteral(firstArg))) {
        return state;
      }
      const current = firstArg.getLiteralText();
      const replacement = computeReplacement(current, fileDir, path_);
      return applyReplacement(state, "new URL", current, (next) => firstArg.setLiteralValue(next), replacement);
    })
  );

  return newExpressionCollection;
};

const processSourceFile = (sourceFile: SourceFile, path_: Path.Path): SourceFileProcessing => {
  const filePath = sourceFile.getFilePath();
  const collection = collectImportUpdates(sourceFile, nodePath.dirname(filePath), path_);
  const updates = collection.updates;
  const updateCount = updates.length;

  const scan: ScanResult = {
    file: filePath,
    updateCount,
    fallbacks: HashSet.toValues(collection.fallbacks),
  };

  return {
    scan,
    updates,
  };
};

const gatherSourceFilesForPackage = (dir: string) =>
  Effect.gen(function* () {
    const fsUtils = yield* FsUtils;
    const patterns = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts", "**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs"];

    const ignore = [
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
      cwd: dir,
      absolute: true,
      ignore,
    });
  });

export const loadPackageTargets = (
  repoRoot: string,
  workspaceMap: HashMap.HashMap<string, string>,
  path_: Path.Path
): ReadonlyArray<PackageTarget> =>
  F.pipe(
    HashMap.entries(workspaceMap),
    A.fromIterable,
    A.map(([name, dir]) => ({
      name,
      dir,
      relativeDir: path_.relative(repoRoot, dir),
    })),
    A.sortWith((candidate) => candidate.name, Order.string)
  );

export const defaultSelectedPackages = (repoRoot: string, path_: Path.Path) =>
  Effect.gen(function* () {
    const fsUtils = yield* FsUtils;
    const packageJsonPath = path_.join(repoRoot, "tooling", "repo-scripts", "package.json");
    const raw = yield* fsUtils.readJson(packageJsonPath);
    const dependenciesRecord =
      (raw as { readonly dependencies?: Record<string, string> | undefined }).dependencies ?? {};
    const entries = R.toEntries(dependenciesRecord);
    const workspaceDependencies = F.pipe(
      entries,
      A.filter(([, version]) => F.pipe(version, Str.startsWith("workspace")))
    );
    const names = F.pipe(
      workspaceDependencies,
      A.map(([name]) => name)
    );
    return HashSet.fromIterable(names);
  });

export const buildPackageChoices = (
  packages: ReadonlyArray<PackageTarget>,
  defaults: HashSet.HashSet<string>
): ReadonlyArray<Prompt.Prompt.SelectChoice<PackageTarget>> =>
  F.pipe(
    packages,
    A.map((pkg) => ({
      title: pkg.name,
      value: pkg,
      description: pkg.relativeDir,
      selected: HashSet.has(defaults, pkg.name),
    }))
  );

export const processPackage = (pkg: PackageTarget, options: ScriptOptions, repoRoot: string) =>
  Effect.gen(function* () {
    const path_ = yield* Path.Path;
    const files = yield* gatherSourceFilesForPackage(pkg.dir);

    if (F.pipe(files, A.isEmptyReadonlyArray)) {
      return {
        packageName: pkg.name,
        filesTouched: 0,
        specifiersUpdated: 0,
        fallbackNotices: [] as ReadonlyArray<{ readonly file: string; readonly specifier: string }>,
      } satisfies PackageResult;
    }

    const project = new Project({
      tsConfigFilePath: nodePath.join(repoRoot, "tsconfig.json"),
      skipFileDependencyResolution: true,
      skipLoadingLibFiles: true,
    });

    yield* Effect.forEach(
      files,
      (filePath) =>
        Effect.sync(() => {
          project.addSourceFileAtPathIfExists(filePath);
        }),
      { discard: true }
    );

    const sourceFiles = project.getSourceFiles();

    const processed = yield* Effect.forEach(
      sourceFiles,
      (sourceFile) =>
        Effect.sync(() => ({
          sourceFile,
          processing: processSourceFile(sourceFile, path_),
        })),
      { concurrency: 1 }
    );

    if (!options.checkMode) {
      yield* Effect.forEach(
        processed,
        ({ sourceFile, processing }) =>
          processing.scan.updateCount === 0
            ? Effect.void
            : Effect.forEach(processing.updates, (update) => Effect.sync(update.apply), { discard: true }).pipe(
                Effect.zipRight(Effect.sync(() => sourceFile.saveSync()))
              ),
        { discard: true }
      );
    }

    const scanResults = F.pipe(
      processed,
      A.map((entry) => entry.processing.scan)
    );

    const summary = F.pipe(
      scanResults,
      A.reduce(
        {
          filesTouched: 0,
          specifiersUpdated: 0,
          fallbackNotices: [] as ReadonlyArray<{ readonly file: string; readonly specifier: string }>,
        },
        (state, scan) => {
          const filesTouched = scan.updateCount > 0 ? state.filesTouched + 1 : state.filesTouched;
          const specifiersUpdated = state.specifiersUpdated + scan.updateCount;
          const fallbackNotices =
            F.pipe(scan.fallbacks, A.isEmptyReadonlyArray) && scan.updateCount === 0
              ? state.fallbackNotices
              : F.pipe(
                  state.fallbackNotices,
                  A.appendAll(
                    F.pipe(
                      scan.fallbacks,
                      A.map((specifier) => ({
                        file: scan.file,
                        specifier,
                      }))
                    )
                  )
                );

          return {
            filesTouched,
            specifiersUpdated,
            fallbackNotices,
          };
        }
      )
    );

    return {
      packageName: pkg.name,
      filesTouched: summary.filesTouched,
      specifiersUpdated: summary.specifiersUpdated,
      fallbackNotices: summary.fallbackNotices,
    } satisfies PackageResult;
  });
