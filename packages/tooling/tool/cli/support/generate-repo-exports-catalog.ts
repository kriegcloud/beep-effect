#!/usr/bin/env bun

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as jsonc from "jsonc-parser";
import { Node, Project } from "ts-morph";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "../../../../..");
const outputJsonPath = path.join(rootDir, "standards", "repo-exports.catalog.jsonc");
const outputMarkdownPath = path.join(rootDir, "standards", "repo-exports.catalog.md");
const sourceExtensions = new Set([".ts", ".tsx"]);
const ignoredSourceSuffixes = [".d.ts"];
const conditionPreference = ["types", "import", "default", "require"];
const conditionNames = new Set(conditionPreference);
const checkMode = process.argv.includes("--check");

const readText = (filePath) => readFileSync(filePath, "utf8");

const readJsonc = (filePath) => {
  const text = readText(filePath);
  const errors = [];
  const parsed = jsonc.parse(text, errors, {
    allowTrailingComma: true,
    disallowComments: false,
  });

  if (errors.length > 0) {
    const [first] = errors;
    throw new Error(`Failed to parse ${filePath}: ${jsonc.printParseErrorCode(first.error)} at offset ${first.offset}`);
  }

  return parsed;
};

const formatJsonc = (value) => {
  const encoded = JSON.stringify(value, null, 2);
  return `${jsonc.applyEdits(
    encoded,
    jsonc.format(encoded, undefined, {
      insertSpaces: true,
      tabSize: 2,
    })
  )}\n`;
};

const normalizeSlashes = (value) => value.replaceAll(path.sep, "/");

const repoRelative = (absolutePath) => normalizeSlashes(path.relative(rootDir, absolutePath) || ".");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const markdownCell = (value) =>
  String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|");

const readRootPackage = () => readJsonc(path.join(rootDir, "package.json"));

const workspacePatternsFrom = (workspaces) => {
  if (Array.isArray(workspaces)) {
    return workspaces;
  }
  if (workspaces !== null && typeof workspaces === "object" && Array.isArray(workspaces.packages)) {
    return workspaces.packages;
  }
  return [];
};

const expandWorkspacePattern = (pattern) => {
  const segments = normalizeSlashes(pattern).split("/").filter(Boolean);
  let candidates = [rootDir];

  for (const segment of segments) {
    const nextCandidates = [];

    for (const candidate of candidates) {
      if (segment === "*") {
        if (!existsSync(candidate)) {
          continue;
        }
        for (const entry of readdirSync(candidate, { withFileTypes: true })) {
          if (entry.isDirectory()) {
            nextCandidates.push(path.join(candidate, entry.name));
          }
        }
        continue;
      }

      nextCandidates.push(path.join(candidate, segment));
    }

    candidates = nextCandidates;
  }

  return candidates.filter((candidate) => existsSync(path.join(candidate, "package.json")));
};

const discoverWorkspacePackages = () => {
  const rootPackage = readRootPackage();
  const packages = new Map();

  packages.set(rootPackage.name, {
    name: rootPackage.name,
    path: ".",
    absolutePath: rootDir,
    packageJson: rootPackage,
  });

  for (const pattern of workspacePatternsFrom(rootPackage.workspaces)) {
    for (const packagePath of expandWorkspacePattern(pattern)) {
      const packageJson = readJsonc(path.join(packagePath, "package.json"));
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

const topoSortPackageNames = () => {
  const result = spawnSync("bun", ["run", "topo-sort"], {
    cwd: rootDir,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(`bun run topo-sort failed:\n${result.stderr || result.stdout}`);
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

const listSourceFiles = (directory) => {
  if (!existsSync(directory)) {
    return [];
  }

  const files = [];
  const visit = (current) => {
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

      if (ignoredSourceSuffixes.some((suffix) => entry.name.endsWith(suffix))) {
        continue;
      }

      files.push(absolutePath);
    }
  };

  visit(directory);
  return files.sort();
};

const stripCommentFraming = (commentText) =>
  commentText
    .replace(/^\/\*\*/, "")
    .replace(/\*\/$/, "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*\s?/, "").trimEnd());

const summaryFromComment = (commentText) => {
  for (const line of stripCommentFraming(commentText)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("@") || trimmed.startsWith("```")) {
      continue;
    }
    return trimmed;
  }
  return undefined;
};

const tagsFromComment = (commentText) => {
  const tags = [];
  for (const line of stripCommentFraming(commentText)) {
    const match = /^\s*@([A-Za-z][\w-]*)\b/.exec(line);
    if (match !== null) {
      tags.push(`@${match[1]}`);
    }
  }
  return [...new Set(tags)];
};

const valuesForTag = (commentText, tagName) => {
  const values = [];
  const pattern = new RegExp(`^\\s*${escapeRegExp(tagName)}\\b\\s*(.*)$`);

  for (const line of stripCommentFraming(commentText)) {
    const match = pattern.exec(line);
    if (match !== null) {
      values.push((match[1] ?? "").trim());
    }
  }

  return values;
};

const getDocNode = (node) => {
  if (Node.isVariableDeclaration(node)) {
    return node.getVariableStatement() ?? node;
  }
  if (Node.isExportSpecifier(node)) {
    return node.getParent();
  }
  return node;
};

const getJsDocText = (node) => {
  const docNode = getDocNode(node);
  if (Node.isJSDocable(docNode)) {
    const docs = docNode.getJsDocs();
    return docs.at(-1)?.getText() ?? "";
  }
  return "";
};

const declarationKind = (node) => {
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

const isIgnoredSourceTarget = (target) =>
  typeof target === "string" && ignoredSourceSuffixes.some((suffix) => target.endsWith(suffix));

const exportTargetFrom = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value !== "object") {
    return undefined;
  }

  let ignoredSourceFallback: string | undefined;
  const selectTarget = (target) => {
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
    const target = exportTargetFrom(value[condition]);
    const selected = selectTarget(target);
    if (selected !== undefined) {
      return selected;
    }
  }

  for (const [key, nested] of Object.entries(value)) {
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

const hasExportSubpathKeys = (value) => Object.keys(value).some((key) => key === "." || key.startsWith("./"));

const isRootConditionalExportMap = (value) =>
  !Array.isArray(value) && !hasExportSubpathKeys(value) && Object.keys(value).some((key) => conditionNames.has(key));

const exportMapEntriesFrom = (packageJson) => {
  const exportsField = packageJson.exports;
  if (exportsField === undefined) {
    return [];
  }

  if (typeof exportsField === "string" || exportsField === null) {
    return [
      {
        subpath: ".",
        target: exportsField,
        denied: exportsField === null,
      },
    ];
  }

  if (typeof exportsField !== "object" || Array.isArray(exportsField)) {
    return [];
  }

  if (isRootConditionalExportMap(exportsField)) {
    return [
      {
        subpath: ".",
        target: exportTargetFrom(exportsField),
        denied: false,
      },
    ];
  }

  return Object.entries(exportsField).map(([subpath, value]) => ({
    subpath,
    target: value === null ? null : exportTargetFrom(value),
    denied: value === null,
  }));
};

const isSourceTarget = (target) =>
  typeof target === "string" &&
  (target.endsWith(".ts") || target.endsWith(".tsx")) &&
  !ignoredSourceSuffixes.some((suffix) => target.endsWith(suffix));

const capturesForPattern = (pattern, value) => {
  const parts = normalizeSlashes(pattern).split("*").map(escapeRegExp);
  const regex = new RegExp(`^${parts.join("(.+)")}$`);
  const match = regex.exec(normalizeSlashes(value));
  return match === null ? undefined : match.slice(1);
};

const fillPattern = (pattern, captures) => {
  let captureIndex = 0;
  return normalizeSlashes(pattern).replace(/\*/g, () => captures[captureIndex++] ?? "");
};

const subpathDenied = (subpath, deniedEntries) =>
  deniedEntries.some((entry) =>
    entry.subpath.includes("*")
      ? capturesForPattern(entry.subpath, subpath) !== undefined
      : normalizeSlashes(entry.subpath) === normalizeSlashes(subpath)
  );

const importSpecifierFor = (packageName, subpath) => {
  if (subpath === ".") {
    return packageName;
  }
  return `${packageName}/${subpath.replace(/^\.\//, "")}`;
};

const exportedSourceFilePath = (packagePath, target) =>
  path.join(packagePath, normalizeSlashes(target).replace(/^\.\//, ""));

const expandExportMap = (packageInfo, sourceFilePaths) => {
  const exportEntries = exportMapEntriesFrom(packageInfo.packageJson);
  const deniedEntries = exportEntries.filter((entry) => entry.denied);
  const activeEntries = exportEntries.filter((entry) => !entry.denied && isSourceTarget(entry.target));
  const exposures = [];
  const seen = new Set();

  for (const entry of activeEntries) {
    if (entry.target.includes("*")) {
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
          exposures.push({
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
      exposures.push({
        exportSubpath: entry.subpath,
        importSpecifier: importSpecifierFor(packageInfo.name, entry.subpath),
        targetPath: normalizeSlashes(entry.target),
        sourceFilePath,
      });
    }
  }

  return exposures.sort((left, right) =>
    `${left.importSpecifier}:${left.targetPath}`.localeCompare(`${right.importSpecifier}:${right.targetPath}`)
  );
};

const searchTextFor = (entry) =>
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
  ]
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const catalogEntryFor = (packageInfo, topoOrder, exposure, symbolName, declaration) => {
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

const packageStatusFor = (exportCount) => (exportCount === 0 ? "no-public-exports" : "has-public-exports");

const analyzePackage = (packageInfo, topoOrder) => {
  const sourceRoot = path.join(packageInfo.absolutePath, "src");
  const sourceFilePaths = listSourceFiles(sourceRoot);
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sourceFileByPath = new Map();

  for (const sourceFilePath of sourceFilePaths) {
    sourceFileByPath.set(sourceFilePath, project.addSourceFileAtPath(sourceFilePath));
  }

  const exports = [];
  const seen = new Set();

  for (const exposure of expandExportMap(packageInfo, sourceFilePaths)) {
    const sourceFile = sourceFileByPath.get(exposure.sourceFilePath);
    if (sourceFile === undefined) {
      continue;
    }

    for (const [symbolName, declarations] of sourceFile.getExportedDeclarations()) {
      for (const declaration of declarations) {
        const key = [
          exposure.importSpecifier,
          symbolName,
          declarationKind(declaration),
          repoRelative(declaration.getSourceFile().getFilePath()),
          declaration.getStartLineNumber(),
        ].join(":");

        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        exports.push(catalogEntryFor(packageInfo, topoOrder, exposure, symbolName, declaration));
      }
    }
  }

  exports.sort(
    (left, right) =>
      [
        left.importSpecifier.localeCompare(right.importSpecifier),
        left.symbolName.localeCompare(right.symbolName),
        left.exportKind.localeCompare(right.exportKind),
        left.sourcePath.localeCompare(right.sourcePath),
        left.sourceLine - right.sourceLine,
      ].find((result) => result !== 0) ?? 0
  );

  return {
    packageName: packageInfo.name,
    packagePath: packageInfo.path,
    topoOrder,
    status: packageStatusFor(exports.length),
    importSpecifiers: [...new Set(exports.map((entry) => entry.importSpecifier))].sort(),
    counts: {
      publicExportEntries: exports.length,
      uniqueSymbols: new Set(exports.map((entry) => entry.symbolName)).size,
      sourceFiles: sourceFilePaths.length,
    },
    exports,
  };
};

const analyzeMissingPackage = (packageName, topoOrder) => ({
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

const catalogTotals = (packages) => ({
  packages: packages.length,
  packagesWithPublicExports: packages.filter((entry) => entry.status === "has-public-exports").length,
  packagesWithoutPublicExports: packages.filter((entry) => entry.status === "no-public-exports").length,
  missingWorkspaceMetadata: packages.filter((entry) => entry.status === "missing-workspace-metadata").length,
  importSpecifiers: packages.reduce((total, entry) => total + entry.importSpecifiers.length, 0),
  publicExportEntries: packages.reduce((total, entry) => total + entry.counts.publicExportEntries, 0),
  uniquePackageSymbols: packages.reduce((total, entry) => total + entry.counts.uniqueSymbols, 0),
});

const allExports = (catalog) => catalog.packages.flatMap((pkg) => pkg.exports);

const renderUnknownRecordProof = (catalog) =>
  allExports(catalog).filter(
    (entry) =>
      entry.packageName === "@beep/schema" &&
      entry.importSpecifier === "@beep/schema" &&
      entry.symbolName === "UnknownRecord"
  );

const renderMarkdown = (catalog) => {
  const lines = [];
  lines.push("# Repo Export Catalog");
  lines.push("");
  lines.push("Generated deterministically from package export maps, TypeScript exported declarations, and JSDoc.");
  lines.push("");
  lines.push("## Authority");
  lines.push("");
  lines.push(
    "This catalog is descriptive current-state metadata. It lists legal public export facts; it does not decide whether an import path, package root, wildcard export, or symbol is the canonical architecture surface for new code."
  );
  lines.push("");
  lines.push(
    "Use `standards/ARCHITECTURE.md`, the numbered architecture doctrine, and package-local policy for canonical boundary choices."
  );
  lines.push("");
  lines.push("## Scope");
  lines.push("");
  lines.push(
    "The package universe is the current `bun run topo-sort` output. This catalog exists so coding agents can answer symbol-discovery questions with repo topology before recreating local helpers."
  );
  lines.push("");
  lines.push("## Totals");
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("|---|---:|");
  for (const [key, value] of Object.entries(catalog.totals)) {
    lines.push(`| ${key} | ${value} |`);
  }
  lines.push("");
  lines.push("## Seed Discovery Proof");
  lines.push("");
  lines.push(
    "`UnknownRecord` is intentionally proven through generated source metadata, not a hand-maintained alias table."
  );
  lines.push("");
  lines.push("| Import | Symbol | Kind | Source | Summary |");
  lines.push("|---|---|---|---|---|");
  for (const entry of renderUnknownRecordProof(catalog)) {
    lines.push(
      `| \`${markdownCell(entry.importSpecifier)}\` | \`${markdownCell(entry.symbolName)}\` | ${markdownCell(entry.exportKind)} | \`${markdownCell(entry.sourcePath)}:${entry.sourceLine}\` | ${markdownCell(entry.summary)} |`
    );
  }
  lines.push("");
  lines.push("## Package Summary");
  lines.push("");
  lines.push("| Order | Package | Path | Status | Import Specifiers | Export Entries | Unique Symbols |");
  lines.push("|---:|---|---|---|---:|---:|---:|");
  for (const pkg of catalog.packages) {
    lines.push(
      `| ${pkg.topoOrder} | \`${markdownCell(pkg.packageName)}\` | \`${markdownCell(pkg.packagePath)}\` | ${markdownCell(pkg.status)} | ${pkg.importSpecifiers.length} | ${pkg.counts.publicExportEntries} | ${pkg.counts.uniqueSymbols} |`
    );
  }
  lines.push("");
  lines.push("## Public Exports");

  for (const pkg of catalog.packages.filter((entry) => entry.exports.length > 0)) {
    lines.push("");
    lines.push(`### ${pkg.packageName}`);
    lines.push("");
    lines.push("| Import | Symbol | Kind | Source | Summary |");
    lines.push("|---|---|---|---|---|");
    for (const entry of pkg.exports) {
      lines.push(
        `| \`${markdownCell(entry.importSpecifier)}\` | \`${markdownCell(entry.symbolName)}\` | ${markdownCell(entry.exportKind)} | \`${markdownCell(entry.sourcePath)}:${entry.sourceLine}\` | ${markdownCell(entry.summary)} |`
      );
    }
  }

  return `${lines.join("\n")}\n`;
};

const buildCatalog = () => {
  const packageByName = discoverWorkspacePackages();
  const topoNames = topoSortPackageNames();
  const packages = topoNames.map((packageName, index) => {
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

const checkFile = (filePath, content) => {
  if (!existsSync(filePath)) {
    return [`${repoRelative(filePath)} is missing`];
  }

  const current = readText(filePath);
  return current === content ? [] : [`${repoRelative(filePath)} is stale`];
};

const writeOrCheck = (jsonContent, markdownContent) => {
  if (checkMode) {
    const findings = [...checkFile(outputJsonPath, jsonContent), ...checkFile(outputMarkdownPath, markdownContent)];
    if (findings.length > 0) {
      console.error("[repo-exports-catalog] generated artifacts are stale:");
      for (const finding of findings) {
        console.error(`- ${finding}`);
      }
      console.error("[repo-exports-catalog] run `bun run beep quality repo-exports-catalog` to refresh them.");
      process.exitCode = 1;
      return;
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

const main = () => {
  const catalog = buildCatalog();
  const jsonContent = formatJsonc(catalog);
  const markdownContent = renderMarkdown(catalog);
  writeOrCheck(jsonContent, markdownContent);
  console.log(
    `packages=${catalog.totals.packages} importSpecifiers=${catalog.totals.importSpecifiers} publicExportEntries=${catalog.totals.publicExportEntries}`
  );
};

main();
