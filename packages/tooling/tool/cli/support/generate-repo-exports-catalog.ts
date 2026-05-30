#!/usr/bin/env bun

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { A, O, Str } from "@beep/utils";
import * as jsonc from "jsonc-parser";
import { Node, Project } from "ts-morph";
import type * as Ordering from "effect/Ordering";
import type { SourceFile } from "ts-morph";

type JsonRecord = Record<string, unknown>;

type PackageJson = JsonRecord & {
  readonly name: string;
  readonly workspaces?: unknown;
  readonly exports?: unknown;
};

type WorkspacePackageInfo = {
  readonly name: string;
  readonly path: string;
  readonly absolutePath: string;
  readonly packageJson: PackageJson;
};

type ExportMapEntry = {
  readonly subpath: string;
  readonly target: string | null | undefined;
  readonly denied: boolean;
};

type ExportExposure = {
  readonly exportSubpath: string;
  readonly importSpecifier: string;
  readonly targetPath: string;
  readonly sourceFilePath: string;
};

type CatalogEntryInput = {
  readonly packageName: string;
  readonly packagePath: string;
  readonly importSpecifier: string;
  readonly exportSubpath: string;
  readonly symbolName: string;
  readonly exportKind: string;
  readonly summary: string;
  readonly categories: ReadonlyArray<string>;
  readonly sourcePath: string;
};

type CatalogEntry = CatalogEntryInput & {
  readonly topoOrder: number;
  readonly exportedFromPath: string;
  readonly sourceLine: number;
  readonly since: ReadonlyArray<string>;
  readonly tags: ReadonlyArray<string>;
  readonly searchText: string;
};

type PackageCatalog = {
  readonly packageName: string;
  readonly packagePath: string;
  readonly topoOrder: number;
  readonly status: "has-public-exports" | "no-public-exports" | "missing-workspace-metadata";
  readonly importSpecifiers: ReadonlyArray<string>;
  readonly counts: {
    readonly publicExportEntries: number;
    readonly uniqueSymbols: number;
    readonly sourceFiles: number;
  };
  readonly exports: ReadonlyArray<CatalogEntry>;
};

type Catalog = {
  readonly standard: string;
  readonly schemaVersion: string;
  readonly deterministic: boolean;
  readonly authority: JsonRecord;
  readonly source: JsonRecord;
  readonly totals: ReturnType<typeof catalogTotals>;
  readonly packages: ReadonlyArray<PackageCatalog>;
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "../../../../..");
const outputJsonPath = path.join(rootDir, "standards", "repo-exports.catalog.jsonc");
const outputMarkdownPath = path.join(rootDir, "standards", "repo-exports.catalog.md");
const sourceExtensions = new Set([".ts", ".tsx"]);
const ignoredSourceSuffixes = [".d.ts"];
const conditionPreference = ["types", "import", "default", "require"];
const conditionNames = new Set(conditionPreference);
const checkMode = A.contains(process.argv, "--check");
const compareText = (left: string, right: string): Ordering.Ordering => Str.localeCompare(right)(left);
const compareNumber = (left: number, right: number): Ordering.Ordering => {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
};

const readText = (filePath: string): string => readFileSync(filePath, "utf8");

const readJsonc = (filePath: string): JsonRecord => {
  const text = readText(filePath);
  const errors: jsonc.ParseError[] = [];
  const parsed = jsonc.parse(text, errors, {
    allowTrailingComma: true,
    disallowComments: false,
  });

  if (errors.length > 0) {
    const [first] = errors;
    throw new Error(`Failed to parse ${filePath}: ${jsonc.printParseErrorCode(first.error)} at offset ${first.offset}`);
  }

  return parsed as JsonRecord;
};

const formatJsonc = (value: unknown): string => {
  const encoded = JSON.stringify(value, null, 2);
  return `${jsonc.applyEdits(
    encoded,
    jsonc.format(encoded, undefined, {
      insertSpaces: true,
      tabSize: 2,
    })
  )}\n`;
};

const normalizeSlashes = (value: string): string => Str.replaceAll(path.sep, "/")(value);

const repoRelative = (absolutePath: string): string => normalizeSlashes(path.relative(rootDir, absolutePath) || ".");

const escapeRegExp = (value: string): string => Str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")(value);

const markdownCell = (value: unknown): string =>
  Str.replace(/\|/g, "\\|")(Str.replace(/\r?\n/g, " ")(String(value ?? "")));

const readPackageJson = (filePath: string): PackageJson => readJsonc(filePath) as PackageJson;

const readRootPackage = (): PackageJson => readPackageJson(path.join(rootDir, "package.json"));

const workspacePatternsFrom = (workspaces: unknown): ReadonlyArray<string> => {
  if (A.isArray(workspaces)) {
    return workspaces.filter((pattern): pattern is string => typeof pattern === "string");
  }
  if (workspaces !== null && typeof workspaces === "object") {
    const workspaceRecord = workspaces as { readonly packages?: unknown };
    if (A.isArray(workspaceRecord.packages)) {
      return workspaceRecord.packages.filter((pattern): pattern is string => typeof pattern === "string");
    }
  }
  return [];
};

const expandWorkspacePattern = (pattern: string): ReadonlyArray<string> => {
  const segments = A.filter(Str.split("/")(normalizeSlashes(pattern)), Str.isNonEmpty);
  let candidates = [rootDir];

  for (const segment of segments) {
    const nextCandidates: Array<string> = [];

    for (const candidate of candidates) {
      if (segment === "*") {
        if (!existsSync(candidate)) {
          continue;
        }
        for (const entry of readdirSync(candidate, { withFileTypes: true })) {
          if (entry.isDirectory()) {
            A.appendInPlace(nextCandidates, path.join(candidate, entry.name));
          }
        }
        continue;
      }

      A.appendInPlace(nextCandidates, path.join(candidate, segment));
    }

    candidates = nextCandidates;
  }

  return A.filter(candidates, (candidate) => existsSync(path.join(candidate, "package.json")));
};

const discoverWorkspacePackages = (): Map<string, WorkspacePackageInfo> => {
  const rootPackage = readRootPackage();
  const packages = new Map<string, WorkspacePackageInfo>();

  packages.set(rootPackage.name, {
    name: rootPackage.name,
    path: ".",
    absolutePath: rootDir,
    packageJson: rootPackage,
  });

  for (const pattern of workspacePatternsFrom(rootPackage.workspaces)) {
    for (const packagePath of expandWorkspacePattern(pattern)) {
      const packageJson = readPackageJson(path.join(packagePath, "package.json"));
      packages.set(packageJson.name, {
        name: packageJson.name,
        path: repoRelative(packagePath),
        absolutePath: packagePath,
        packageJson,
      });
    }
  }

  return packages;
};

const topoSortPackageNames = (): ReadonlyArray<string> => {
  const result = spawnSync("bun", ["run", "topo-sort"], {
    cwd: rootDir,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(`bun run topo-sort failed:\n${result.stderr || result.stdout}`);
  }

  return A.filter(
    A.map(
      A.filter(
        A.map(Str.split(/\r?\n/)(result.stdout), (line) => Str.trim(line)),
        (line) => line.length > 0
      ),
      (line) => Str.split(/\s+/u)(line)[0]
    ),
    (packageName) => packageName !== undefined
  );
};

const listSourceFiles = (directory: string): ReadonlyArray<string> => {
  if (!existsSync(directory)) {
    return [];
  }

  const files: Array<string> = [];
  const visit = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === "dist" ||
          entry.name === "build" ||
          entry.name === ".turbo"
        ) {
          continue;
        }
        visit(absolutePath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const extension = path.extname(entry.name);
      if (!sourceExtensions.has(extension)) {
        continue;
      }

      if (A.some(ignoredSourceSuffixes, (suffix) => Str.endsWith(suffix)(entry.name))) {
        continue;
      }

      A.appendInPlace(files, absolutePath);
    }
  };

  visit(directory);
  return A.sortInPlace(files, compareText);
};

const stripCommentFraming = (commentText: string): ReadonlyArray<string> =>
  A.map(Str.split(/\r?\n/)(Str.replace(/\*\/$/, "")(Str.replace(/^\/\*\*/, "")(commentText))), (line) =>
    Str.trimEnd(Str.replace(/^\s*\*\s?/, "")(line))
  );

const summaryFromComment = (commentText: string): string | undefined => {
  for (const line of stripCommentFraming(commentText)) {
    const trimmed = Str.trim(line);
    if (trimmed.length === 0 || Str.startsWith("@")(trimmed) || Str.startsWith("```")(trimmed)) {
      continue;
    }
    return trimmed;
  }
  return undefined;
};

const tagsFromComment = (commentText: string): ReadonlyArray<string> => {
  const tags: Array<string> = [];
  for (const line of stripCommentFraming(commentText)) {
    const match = /^\s*@([A-Za-z][\w-]*)\b/.exec(line);
    if (match !== null) {
      A.appendInPlace(tags, `@${match[1]}`);
    }
  }
  return [...new Set(tags)];
};

const valuesForTag = (commentText: string, tagName: string): ReadonlyArray<string> => {
  const values: Array<string> = [];
  const pattern = new RegExp(`^\\s*${escapeRegExp(tagName)}\\b\\s*(.*)$`);

  for (const line of stripCommentFraming(commentText)) {
    const match = pattern.exec(line);
    if (match !== null) {
      A.appendInPlace(values, Str.trim(match[1] ?? ""));
    }
  }

  return values;
};

const getDocNode = (node: Node): Node => {
  if (Node.isVariableDeclaration(node)) {
    return node.getVariableStatement() ?? node;
  }
  if (Node.isExportSpecifier(node)) {
    return node.getParent();
  }
  return node;
};

const getJsDocText = (node: Node): string => {
  const docNode = getDocNode(node);
  if (Node.isJSDocable(docNode)) {
    const docs = docNode.getJsDocs();
    return docs.at(-1)?.getText() ?? "";
  }
  return "";
};

const declarationKind = (node: Node): string => {
  if (Node.isFunctionDeclaration(node)) {
    return "function";
  }
  if (Node.isVariableDeclaration(node)) {
    return "const";
  }
  if (Node.isTypeAliasDeclaration(node)) {
    return "type";
  }
  if (Node.isInterfaceDeclaration(node)) {
    return "interface";
  }
  if (Node.isClassDeclaration(node)) {
    return "class";
  }
  if (Node.isModuleDeclaration(node)) {
    return "namespace";
  }
  if (Node.isEnumDeclaration(node)) {
    return "enum";
  }
  return node.getKindName();
};

const isIgnoredSourceTarget = (target: unknown): target is string =>
  typeof target === "string" && A.some(ignoredSourceSuffixes, (suffix) => Str.endsWith(suffix)(target));

const exportTargetFrom = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value !== "object") {
    return undefined;
  }

  const record = value as JsonRecord;
  let ignoredSourceFallback: string | undefined;
  const selectTarget = (target: string | undefined): string | undefined => {
    if (target === undefined) {
      return undefined;
    }
    if (isIgnoredSourceTarget(target)) {
      ignoredSourceFallback ??= target;
      return undefined;
    }
    return target;
  };

  for (const condition of conditionPreference) {
    const target = exportTargetFrom(record[condition]);
    const selected = selectTarget(target);
    if (selected !== undefined) {
      return selected;
    }
  }

  for (const [key, nested] of Object.entries(record)) {
    if (conditionNames.has(key)) {
      continue;
    }
    const target = exportTargetFrom(nested);
    const selected = selectTarget(target);
    if (selected !== undefined) {
      return selected;
    }
  }

  return ignoredSourceFallback;
};

const hasExportSubpathKeys = (value: JsonRecord): boolean =>
  A.some(Object.keys(value), (key) => key === "." || Str.startsWith("./")(key));

const isRootConditionalExportMap = (value: JsonRecord): boolean =>
  !A.isArray(value) && !hasExportSubpathKeys(value) && A.some(Object.keys(value), (key) => conditionNames.has(key));

const exportMapEntriesFrom = (packageJson: PackageJson): ReadonlyArray<ExportMapEntry> => {
  const exportsField = packageJson.exports;
  if (exportsField === undefined) {
    return [];
  }

  if (typeof exportsField === "string" || exportsField === null) {
    return [
      {
        subpath: ".",
        target: exportsField as string | null,
        denied: exportsField === null,
      },
    ];
  }

  if (typeof exportsField !== "object" || A.isArray(exportsField)) {
    return [];
  }

  const exportsRecord = exportsField as JsonRecord;

  if (isRootConditionalExportMap(exportsRecord)) {
    return [
      {
        subpath: ".",
        target: exportTargetFrom(exportsRecord),
        denied: false,
      },
    ];
  }

  return A.map(Object.entries(exportsRecord), ([subpath, value]) => ({
    subpath,
    target: value === null ? null : exportTargetFrom(value),
    denied: value === null,
  }));
};

const isSourceTarget = (target: unknown): target is string =>
  typeof target === "string" &&
  (Str.endsWith(".ts")(target) || Str.endsWith(".tsx")(target)) &&
  !A.some(ignoredSourceSuffixes, (suffix) => Str.endsWith(suffix)(target));

const capturesForPattern = (pattern: string, value: string): Array<string> | undefined => {
  const parts = A.map(Str.split("*")(normalizeSlashes(pattern)), escapeRegExp);
  const regex = new RegExp(`^${A.join(parts, "(.+)")}$`);
  const match = regex.exec(normalizeSlashes(value));
  return match === null ? undefined : match.slice(1);
};

const fillPattern = (pattern: string, captures: ReadonlyArray<string>): string => {
  let captureIndex = 0;
  return Str.replaceWith(/\*/g, () => captures[captureIndex++] ?? "")(normalizeSlashes(pattern));
};

const subpathDenied = (subpath: string, deniedEntries: ReadonlyArray<ExportMapEntry>): boolean =>
  deniedEntries.some((entry) =>
    Str.includes("*")(entry.subpath)
      ? capturesForPattern(entry.subpath, subpath) !== undefined
      : normalizeSlashes(entry.subpath) === normalizeSlashes(subpath)
  );

const importSpecifierFor = (packageName: string, subpath: string): string => {
  if (subpath === ".") {
    return packageName;
  }
  return `${packageName}/${Str.replace(/^\.\//, "")(subpath)}`;
};

const exportedSourceFilePath = (packagePath: string, target: string): string =>
  path.join(packagePath, Str.replace(/^\.\//, "")(normalizeSlashes(target)));

const expandExportMap = (
  packageInfo: WorkspacePackageInfo,
  sourceFilePaths: ReadonlyArray<string>
): ReadonlyArray<ExportExposure> => {
  const exportEntries = exportMapEntriesFrom(packageInfo.packageJson);
  const deniedEntries = A.filter(exportEntries, (entry) => entry.denied);
  const activeEntries = A.filter(exportEntries, (entry) => !entry.denied && isSourceTarget(entry.target));
  const exposures: Array<ExportExposure> = [];
  const seen = new Set<string>();

  for (const entry of activeEntries) {
    if (Str.includes("*")(entry.target)) {
      for (const sourceFilePath of sourceFilePaths) {
        const packageTarget = `./${normalizeSlashes(path.relative(packageInfo.absolutePath, sourceFilePath))}`;
        const captures = capturesForPattern(entry.target, packageTarget);
        if (captures === undefined) {
          continue;
        }

        const subpath = fillPattern(entry.subpath, captures);
        if (subpathDenied(subpath, deniedEntries)) {
          continue;
        }

        const key = `${subpath}:${sourceFilePath}`;
        if (!seen.has(key)) {
          seen.add(key);
          A.appendInPlace(exposures, {
            exportSubpath: subpath,
            importSpecifier: importSpecifierFor(packageInfo.name, subpath),
            targetPath: packageTarget,
            sourceFilePath,
          });
        }
      }
      continue;
    }

    const sourceFilePath = exportedSourceFilePath(packageInfo.absolutePath, entry.target);
    if (!existsSync(sourceFilePath) || subpathDenied(entry.subpath, deniedEntries)) {
      continue;
    }

    const key = `${entry.subpath}:${sourceFilePath}`;
    if (!seen.has(key)) {
      seen.add(key);
      A.appendInPlace(exposures, {
        exportSubpath: entry.subpath,
        importSpecifier: importSpecifierFor(packageInfo.name, entry.subpath),
        targetPath: normalizeSlashes(entry.target),
        sourceFilePath,
      });
    }
  }

  return A.sortInPlace(exposures, (left, right) =>
    compareText(`${left.importSpecifier}:${left.targetPath}`, `${right.importSpecifier}:${right.targetPath}`)
  );
};

const searchTextFor = (entry: CatalogEntryInput): string =>
  Str.trim(
    Str.replace(
      /\s+/g,
      " "
    )(
      Str.toLowerCase(
        A.join(
          [
            entry.packageName,
            entry.packagePath,
            entry.importSpecifier,
            entry.exportSubpath,
            entry.symbolName,
            entry.exportKind,
            entry.summary,
            ...entry.categories,
            entry.sourcePath,
          ],
          " "
        )
      )
    )
  );

const catalogEntryFor = (
  packageInfo: WorkspacePackageInfo,
  topoOrder: number,
  exposure: ExportExposure,
  symbolName: string,
  declaration: Node
): CatalogEntry => {
  const docText = getJsDocText(declaration);
  const categories = valuesForTag(docText, "@category");
  const sourcePath = repoRelative(declaration.getSourceFile().getFilePath());
  const entry = {
    packageName: packageInfo.name,
    packagePath: packageInfo.path,
    topoOrder,
    importSpecifier: exposure.importSpecifier,
    exportSubpath: exposure.exportSubpath,
    exportedFromPath: repoRelative(exposure.sourceFilePath),
    symbolName,
    exportKind: declarationKind(declaration),
    sourcePath,
    sourceLine: declaration.getStartLineNumber(),
    summary: summaryFromComment(docText) ?? "",
    categories,
    since: valuesForTag(docText, "@since"),
    tags: tagsFromComment(docText),
  };

  return {
    ...entry,
    searchText: searchTextFor(entry),
  };
};

const packageStatusFor = (exportCount: number): PackageCatalog["status"] =>
  exportCount === 0 ? "no-public-exports" : "has-public-exports";

const analyzePackage = (packageInfo: WorkspacePackageInfo, topoOrder: number): PackageCatalog => {
  const sourceRoot = path.join(packageInfo.absolutePath, "src");
  const sourceFilePaths = listSourceFiles(sourceRoot);
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sourceFileByPath = new Map<string, SourceFile>();

  for (const sourceFilePath of sourceFilePaths) {
    sourceFileByPath.set(sourceFilePath, project.addSourceFileAtPath(sourceFilePath));
  }

  const exports: Array<CatalogEntry> = [];
  const seen = new Set<string>();

  for (const exposure of expandExportMap(packageInfo, sourceFilePaths)) {
    const sourceFile = sourceFileByPath.get(exposure.sourceFilePath);
    if (sourceFile === undefined) {
      continue;
    }

    for (const [symbolName, declarations] of sourceFile.getExportedDeclarations()) {
      for (const declaration of declarations) {
        const key = A.join(
          [
            exposure.importSpecifier,
            symbolName,
            declarationKind(declaration),
            repoRelative(declaration.getSourceFile().getFilePath()),
            `${declaration.getStartLineNumber()}`,
          ],
          ":"
        );

        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        A.appendInPlace(exports, catalogEntryFor(packageInfo, topoOrder, exposure, symbolName, declaration));
      }
    }
  }

  A.sortInPlace(
    exports,
    (left, right) =>
      O.getOrUndefined(
        A.findFirst(
          [
            Str.localeCompare(right.importSpecifier)(left.importSpecifier),
            Str.localeCompare(right.symbolName)(left.symbolName),
            Str.localeCompare(right.exportKind)(left.exportKind),
            Str.localeCompare(right.sourcePath)(left.sourcePath),
            compareNumber(left.sourceLine, right.sourceLine),
          ],
          (result) => result !== 0
        )
      ) ?? 0
  );

  return {
    packageName: packageInfo.name,
    packagePath: packageInfo.path,
    topoOrder,
    status: packageStatusFor(exports.length),
    importSpecifiers: A.sort(
      A.map(A.fromIterable(new Set(A.map(exports, (entry) => entry.importSpecifier))), (specifier) => `${specifier}`),
      compareText
    ),
    counts: {
      publicExportEntries: exports.length,
      uniqueSymbols: new Set(A.map(exports, (entry) => entry.symbolName)).size,
      sourceFiles: sourceFilePaths.length,
    },
    exports,
  };
};

const analyzeMissingPackage = (packageName: string, topoOrder: number): PackageCatalog => ({
  packageName,
  packagePath: "<unresolved>",
  topoOrder,
  status: "missing-workspace-metadata",
  importSpecifiers: [],
  counts: {
    publicExportEntries: 0,
    uniqueSymbols: 0,
    sourceFiles: 0,
  },
  exports: [],
});

const catalogTotals = (packages: ReadonlyArray<PackageCatalog>) => ({
  packages: packages.length,
  packagesWithPublicExports: packages.filter((entry) => entry.status === "has-public-exports").length,
  packagesWithoutPublicExports: packages.filter((entry) => entry.status === "no-public-exports").length,
  missingWorkspaceMetadata: packages.filter((entry) => entry.status === "missing-workspace-metadata").length,
  importSpecifiers: packages.reduce((total, entry) => total + entry.importSpecifiers.length, 0),
  publicExportEntries: packages.reduce((total, entry) => total + entry.counts.publicExportEntries, 0),
  uniquePackageSymbols: packages.reduce((total, entry) => total + entry.counts.uniqueSymbols, 0),
});

const allExports = (catalog: Catalog): ReadonlyArray<CatalogEntry> => catalog.packages.flatMap((pkg) => pkg.exports);

const renderUnknownRecordProof = (catalog: Catalog): ReadonlyArray<CatalogEntry> =>
  allExports(catalog).filter(
    (entry) =>
      entry.packageName === "@beep/schema" &&
      entry.importSpecifier === "@beep/schema" &&
      entry.symbolName === "UnknownRecord"
  );

const renderMarkdown = (catalog: Catalog): string => {
  const lines: Array<string> = [];
  A.appendInPlace(lines, "# Repo Export Catalog");
  A.appendInPlace(lines, "");
  A.appendInPlace(
    lines,
    "Generated deterministically from package export maps, TypeScript exported declarations, and JSDoc."
  );
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Authority");
  A.appendInPlace(lines, "");
  A.appendInPlace(
    lines,
    "This catalog is descriptive current-state metadata. It lists legal public export facts; it does not decide whether an import path, package root, wildcard export, or symbol is the canonical architecture surface for new code."
  );
  A.appendInPlace(lines, "");
  A.appendInPlace(
    lines,
    "Use `standards/ARCHITECTURE.md`, the numbered architecture doctrine, and package-local policy for canonical boundary choices."
  );
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Scope");
  A.appendInPlace(lines, "");
  A.appendInPlace(
    lines,
    "The package universe is the current `bun run topo-sort` output. This catalog exists so coding agents can answer symbol-discovery questions with repo topology before recreating local helpers."
  );
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Totals");
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "| Metric | Count |");
  A.appendInPlace(lines, "|---|---:|");
  for (const [key, value] of Object.entries(catalog.totals)) {
    A.appendInPlace(lines, `| ${key} | ${value} |`);
  }
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Seed Discovery Proof");
  A.appendInPlace(lines, "");
  A.appendInPlace(
    lines,
    "`UnknownRecord` is intentionally proven through generated source metadata, not a hand-maintained alias table."
  );
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "| Import | Symbol | Kind | Source | Summary |");
  A.appendInPlace(lines, "|---|---|---|---|---|");
  for (const entry of renderUnknownRecordProof(catalog)) {
    A.appendInPlace(
      lines,
      `| \`${markdownCell(entry.importSpecifier)}\` | \`${markdownCell(entry.symbolName)}\` | ${markdownCell(entry.exportKind)} | \`${markdownCell(entry.sourcePath)}:${entry.sourceLine}\` | ${markdownCell(entry.summary)} |`
    );
  }
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Package Summary");
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "| Order | Package | Path | Status | Import Specifiers | Export Entries | Unique Symbols |");
  A.appendInPlace(lines, "|---:|---|---|---|---:|---:|---:|");
  for (const pkg of catalog.packages) {
    A.appendInPlace(
      lines,
      `| ${pkg.topoOrder} | \`${markdownCell(pkg.packageName)}\` | \`${markdownCell(pkg.packagePath)}\` | ${markdownCell(pkg.status)} | ${pkg.importSpecifiers.length} | ${pkg.counts.publicExportEntries} | ${pkg.counts.uniqueSymbols} |`
    );
  }
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Public Exports");

  for (const pkg of catalog.packages.filter((entry) => entry.exports.length > 0)) {
    A.appendInPlace(lines, "");
    A.appendInPlace(lines, `### ${pkg.packageName}`);
    A.appendInPlace(lines, "");
    A.appendInPlace(lines, "| Import | Symbol | Kind | Source | Summary |");
    A.appendInPlace(lines, "|---|---|---|---|---|");
    for (const entry of pkg.exports) {
      A.appendInPlace(
        lines,
        `| \`${markdownCell(entry.importSpecifier)}\` | \`${markdownCell(entry.symbolName)}\` | ${markdownCell(entry.exportKind)} | \`${markdownCell(entry.sourcePath)}:${entry.sourceLine}\` | ${markdownCell(entry.summary)} |`
      );
    }
  }

  return `${A.join(lines, "\n")}\n`;
};

const buildCatalog = (): Catalog => {
  const packageByName = discoverWorkspacePackages();
  const topoNames = topoSortPackageNames();
  const packages = A.map(topoNames, (packageName, index) => {
    const packageInfo = packageByName.get(packageName);
    return packageInfo === undefined
      ? analyzeMissingPackage(packageName, index + 1)
      : analyzePackage(packageInfo, index + 1);
  });

  return {
    standard: "repo-exports-catalog",
    schemaVersion: "repo-exports-catalog/v1",
    deterministic: true,
    authority: {
      posture: "descriptive-current-state",
      canonicalStatus: "not-evaluated",
      boundaryDoctrine: ["standards/ARCHITECTURE.md", "standards/architecture/README.md", "package-local policy"],
      note: "This catalog lists legal public export facts. It does not decide whether an import path, package root, wildcard export, or symbol is the canonical architecture surface for new code.",
    },
    source: {
      packageUniverseCommand: "bun run topo-sort",
      generator: "bun run beep quality repo-exports-catalog",
      inputs: ["package.json exports", "TypeScript exported declarations", "JSDoc comments"],
    },
    totals: catalogTotals(packages),
    packages,
  };
};

const checkFile = (filePath: string, content: string): ReadonlyArray<string> => {
  if (!existsSync(filePath)) {
    return [`${repoRelative(filePath)} is missing`];
  }

  const current = readText(filePath);
  return current === content ? [] : [`${repoRelative(filePath)} is stale`];
};

const writeOrCheck = (jsonContent: string, markdownContent: string): void => {
  if (checkMode) {
    const findings = [...checkFile(outputJsonPath, jsonContent), ...checkFile(outputMarkdownPath, markdownContent)];
    if (findings.length > 0) {
      console.error("[repo-exports-catalog] generated artifacts are stale:");
      for (const finding of findings) {
        console.error(`- ${finding}`);
      }
      console.error("[repo-exports-catalog] run `bun run beep quality repo-exports-catalog` to refresh them.");
      process.exit(1);
    }

    console.log("[repo-exports-catalog] generated artifacts are current");
    return;
  }

  mkdirSync(path.dirname(outputJsonPath), { recursive: true });
  writeFileSync(outputJsonPath, jsonContent);
  writeFileSync(outputMarkdownPath, markdownContent);
  console.log(`wrote ${repoRelative(outputJsonPath)}`);
  console.log(`wrote ${repoRelative(outputMarkdownPath)}`);
};

const main = (): void => {
  const catalog = buildCatalog();
  const jsonContent = formatJsonc(catalog);
  const markdownContent = renderMarkdown(catalog);
  writeOrCheck(jsonContent, markdownContent);
  console.log(
    `packages=${catalog.totals.packages} importSpecifiers=${catalog.totals.importSpecifiers} publicExportEntries=${catalog.totals.publicExportEntries}`
  );
};

main();
