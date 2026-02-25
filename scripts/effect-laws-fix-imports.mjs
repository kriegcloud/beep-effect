#!/usr/bin/env node

import path from "node:path";
import { Project } from "ts-morph";

const args = process.argv.slice(2);
const write = args.includes("--write");
const strictCheck = args.includes("--check");

const excludePaths = new Set();
for (let index = 0; index < args.length; index++) {
  if (args[index] === "--exclude" && typeof args[index + 1] === "string") {
    excludePaths.add(args[index + 1].replaceAll("\\", "/"));
    index++;
  }
}

const ALIAS_RULES = {
  "effect/Array": "A",
  "effect/Option": "O",
  "effect/Predicate": "P",
  "effect/Record": "R",
  "effect/Schema": "S",
};

const INCLUDED_GLOBS = ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}", "tooling/**/*.{ts,tsx}", "infra/**/*.ts"];
const EXCLUDED_SEGMENTS = ["/test/", "/tests/", "/dtslint/", "/dist/", "/.next/", "/.turbo/"];
const EXCLUDED_SUFFIXES = [".d.ts", ".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", ".stories.tsx"];

const toPosix = (value) => value.replaceAll("\\", "/");
const isStableSubmodule = (moduleName) => moduleName.startsWith("effect/") && !moduleName.startsWith("effect/unstable/");
const isExcludedFile = (filePath) => {
  const normalized = toPosix(filePath);
  if (excludePaths.has(normalized)) return true;
  if (EXCLUDED_SUFFIXES.some((suffix) => normalized.endsWith(suffix))) return true;
  return EXCLUDED_SEGMENTS.some((segment) => normalized.includes(segment));
};

const project = new Project({
  tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
  skipAddingFilesFromTsConfig: true,
});

for (const pattern of INCLUDED_GLOBS) {
  project.addSourceFilesAtPaths(pattern);
}

const sourceFiles = project.getSourceFiles().filter((sourceFile) => !isExcludedFile(sourceFile.getFilePath()));

let aliasRenamed = 0;
let stableConverted = 0;
let touchedFiles = 0;

const ensureRootImport = (sourceFile) => {
  const existing = sourceFile
    .getImportDeclarations()
    .find((importDeclaration) => importDeclaration.getModuleSpecifierValue() === "effect" && !importDeclaration.isTypeOnly());

  if (existing) {
    return existing;
  }

  return sourceFile.addImportDeclaration({ moduleSpecifier: "effect" });
};

for (const sourceFile of sourceFiles) {
  const importDeclarations = [...sourceFile.getImportDeclarations()];
  let fileTouched = false;

  for (const importDeclaration of importDeclarations) {
    const moduleName = importDeclaration.getModuleSpecifierValue();

    if (!isStableSubmodule(moduleName)) {
      continue;
    }

    const expectedAlias = ALIAS_RULES[moduleName];

    if (expectedAlias !== undefined) {
      const namespaceImport = importDeclaration.getNamespaceImport();
      const hasOnlyNamespaceImport = namespaceImport !== undefined && importDeclaration.getNamedImports().length === 0;

      if (!hasOnlyNamespaceImport || namespaceImport === undefined) {
        continue;
      }

      const currentAlias = namespaceImport.getText();
      if (currentAlias !== expectedAlias) {
        namespaceImport.rename(expectedAlias);
        aliasRenamed++;
        fileTouched = true;
      }

      continue;
    }

    const stableName = moduleName.slice("effect/".length);
    if (stableName.length === 0 || stableName.includes("/")) {
      continue;
    }

    if (importDeclaration.isTypeOnly()) {
      continue;
    }

    const namespaceImport = importDeclaration.getNamespaceImport();
    const hasOnlyNamespaceImport = namespaceImport !== undefined && importDeclaration.getNamedImports().length === 0;

    if (!hasOnlyNamespaceImport || namespaceImport === undefined) {
      continue;
    }

    const localAlias = namespaceImport.getText();
    const rootImport = ensureRootImport(sourceFile);
    const targetAlias = localAlias === stableName ? undefined : localAlias;

    const hasNamedImport = rootImport.getNamedImports().some((namedImport) => {
      const currentAlias = namedImport.getAliasNode()?.getText();
      return namedImport.getName() === stableName && currentAlias === targetAlias;
    });

    if (!hasNamedImport) {
      if (targetAlias === undefined) {
        rootImport.addNamedImport(stableName);
      } else {
        rootImport.addNamedImport({ name: stableName, alias: targetAlias });
      }
    }

    importDeclaration.remove();
    stableConverted++;
    fileTouched = true;
  }

  if (fileTouched) {
    sourceFile.organizeImports();
    touchedFiles++;
  }
}

if (write) {
  await project.save();
}

const mode = write ? "write" : "dry-run";
console.log(`[effect-laws-fix-imports] mode=${mode}`);
console.log(`[effect-laws-fix-imports] touched_files=${touchedFiles}`);
console.log(`[effect-laws-fix-imports] alias_renamed=${aliasRenamed}`);
console.log(`[effect-laws-fix-imports] stable_converted=${stableConverted}`);

if (!write) {
  console.log("[effect-laws-fix-imports] Run with --write to persist changes.");
}

if (strictCheck && (aliasRenamed > 0 || stableConverted > 0)) {
  process.exit(1);
}
