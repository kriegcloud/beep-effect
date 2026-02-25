#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { HashSet, MutableHashMap, MutableHashSet } from "effect";
import * as O from "effect/Option";
import ts from "typescript";

const ALLOWLIST = HashSet.fromIterable([
  ".claude/scripts/__tests__/analyze-architecture.test.ts",
  "specs/completed/effect-v4-knowledge-graph/enrich-modules.ts",
  "specs/completed/reverse-engineering-palantir-ontology/outputs/p5-rag-enrichment/fetch-content.mjs",
  "specs/completed/effect-v4-knowledge-graph/extract-functions.ts",
  "specs/completed/effect-v4-knowledge-graph/extract-unstable.ts",
  "specs/completed/effect-v4-knowledge-graph/extract-modules.ts",
  "tooling/agent-eval/src/benchmark/runner.ts",
  ".claude/scripts/context-crawler.ts",
  ".claude/scripts/md-typecheck.ts",
  ".claude/scripts/context-crawler.test.ts",
  ".claude/hooks/agent-init/index.ts",
  ".claude/scripts/analyze-architecture.ts",
  "specs/completed/effect-v4-knowledge-graph/compare-systems.mjs",
  ".claude/scripts/cli/architecture.ts",
  "scratchpad/test-graphiti.ts",
  "tooling/cli/src/commands/version-sync/resolvers/docker.ts",
  ".claude/hooks/pattern-detector/core.ts",
  ".claude/hooks/subagent-init/index.ts",
  "tooling/cli/src/commands/tsconfig-sync.ts",
  ".claude/hooks/skill-suggester/index.ts",
  "apps/web/src/lib/auth/server.ts",
  "scripts/check-tooling-tagged-errors.mjs",
  "specs/completed/effect-v4-knowledge-graph/supermemory-ingest.mjs",
  "apps/web/src/app/(auth)/sign-in/page.tsx",
  "scratchpad/p6-rerun-harness.mjs",
  "tooling/agent-eval/src/effect-v4-detector/index.ts",
  "tooling/agent-eval/src/policies/index.ts",
  "specs/completed/effect-v4-knowledge-graph/build-top20-functions.ts",
  "specs/completed/effect-v4-knowledge-graph/ingest.ts",
  "specs/completed/reverse-engineering-palantir-ontology/outputs/p5-rag-enrichment/prepare-batches.mjs",
  "tooling/cli/src/commands/create-package/config-updater.ts",
  "tooling/cli/src/commands/version-sync/handler.ts",
  "tooling/cli/test/codegen.test.ts",
  "tooling/cli/test/purge.test.ts",
  "eslint-rules/no-native-runtime.mjs",
  "scripts/docs.mjs",
  "scripts/effect-laws-fix-imports.mjs",
  "specs/completed/effect-v4-knowledge-graph/dry-run-episodes.ts",
  "specs/completed/reverse-engineering-palantir-ontology/outputs/p5-rag-enrichment/merge-results.mjs",
  "tooling/agent-eval/src/benchmark/catalog.ts",
  "tooling/agent-eval/src/benchmark/report.ts",
  "tooling/agent-eval/src/bin.ts",
  "tooling/cli/test/create-package-services.test.ts",
  "tooling/cli/test/create-package.test.ts",
  "tooling/cli/test/tsconfig-sync.test.ts",
  "tooling/repo-utils/test/FsUtils.test.ts",
]);

const SKIP_KEYS = HashSet.fromIterable([
  "specs/completed/reverse-engineering-palantir-ontology/outputs/p5-rag-enrichment/prepare-batches.mjs:42:17",
  "specs/completed/reverse-engineering-palantir-ontology/outputs/p5-rag-enrichment/prepare-batches.mjs:77:20",
]);

const STRING_METHODS = HashSet.fromIterable([
  "toString",
  "charAt",
  "charCodeAt",
  "concat",
  "indexOf",
  "lastIndexOf",
  "localeCompare",
  "match",
  "replace",
  "search",
  "slice",
  "split",
  "substring",
  "toLowerCase",
  "toLocaleLowerCase",
  "toUpperCase",
  "toLocaleUpperCase",
  "trim",
  "substr",
  "valueOf",
]);

const OPTION_WRAPPED_METHODS = HashSet.fromIterable(["charAt", "charCodeAt", "indexOf", "lastIndexOf", "match", "search"]);

const args = process.argv.slice(2);
const write = args.includes("--write");

const tracked = execSync("git ls-files -z", {
  encoding: "buffer",
  maxBuffer: 1024 * 1024 * 64,
})
  .toString("utf8")
  .split("\0")
  .filter(Boolean)
  .filter((f) => !f.startsWith(".repos/"));

const sourceFiles = tracked.filter((f) => /\.(?:[cm]?tsx?|[cm]?jsx?)$/.test(f) && !f.endsWith(".d.ts"));
const sourceFileSet = HashSet.fromIterable(sourceFiles);

const program = ts.createProgram({
  rootNames: sourceFiles,
  options: {
    allowJs: true,
    checkJs: false,
    skipLibCheck: true,
    noEmit: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
  },
});

const checker = program.getTypeChecker();

const isStringLikeType = (type) => {
  if (!type) return false;
  if ((type.flags & ts.TypeFlags.StringLike) !== 0) return true;
  if (type.isUnion()) return type.types.some(isStringLikeType);
  if (type.isIntersection()) return type.types.some(isStringLikeType);
  if ((type.flags & ts.TypeFlags.TypeParameter) !== 0) {
    const base = checker.getBaseConstraintOfType(type);
    return base ? isStringLikeType(base) : false;
  }
  if ((type.flags & ts.TypeFlags.Object) !== 0) {
    const symbol = type.getSymbol();
    if (symbol && symbol.getName() === "String") return true;
  }
  return false;
};

const isAnyOrUnknown = (type) =>
  !!type && ((type.flags & ts.TypeFlags.Any) !== 0 || (type.flags & ts.TypeFlags.Unknown) !== 0);

const makeOptionFallback = (method, innerExpr) => {
  switch (method) {
    case "charAt":
      return `O.getOrElse(O.fromUndefinedOr(${innerExpr}), () => "")`;
    case "charCodeAt":
      return `O.getOrElse(O.fromUndefinedOr(${innerExpr}), () => Number.NaN)`;
    case "indexOf":
    case "lastIndexOf":
    case "search":
      return `O.getOrElse(O.fromUndefinedOr(${innerExpr}), () => -1)`;
    case "match":
      return `O.getOrNull(O.fromNullishOr(${innerExpr}))`;
    default:
      return innerExpr;
  }
};

const getStringMethodReplacement = (method, receiverText, argTexts) => {
  switch (method) {
    case "replace":
      if (argTexts.length !== 2) return null;
      return `Str.replace(${argTexts[0]}, ${argTexts[1]})(${receiverText})`;
    case "split":
      if (argTexts.length !== 1) return null;
      return `Str.split(${argTexts[0]})(${receiverText})`;
    case "trim":
      if (argTexts.length !== 0) return null;
      return `Str.trim(${receiverText})`;
    case "slice":
      if (argTexts.length === 0) return `Str.slice()(${receiverText})`;
      if (argTexts.length === 1) return `Str.slice(${argTexts[0]})(${receiverText})`;
      if (argTexts.length === 2) return `Str.slice(${argTexts[0]}, ${argTexts[1]})(${receiverText})`;
      return null;
    case "substring":
      if (argTexts.length === 1) return `Str.substring(${argTexts[0]})(${receiverText})`;
      if (argTexts.length === 2) return `Str.substring(${argTexts[0]}, ${argTexts[1]})(${receiverText})`;
      return null;
    case "toLowerCase":
      if (argTexts.length !== 0) return null;
      return `Str.toLowerCase(${receiverText})`;
    case "toUpperCase":
      if (argTexts.length !== 0) return null;
      return `Str.toUpperCase(${receiverText})`;
    case "toLocaleLowerCase":
      if (argTexts.length === 0) return `Str.toLocaleLowerCase()(${receiverText})`;
      if (argTexts.length === 1) return `Str.toLocaleLowerCase(${argTexts[0]})(${receiverText})`;
      return null;
    case "toLocaleUpperCase":
      if (argTexts.length === 0) return `Str.toLocaleUpperCase()(${receiverText})`;
      if (argTexts.length === 1) return `Str.toLocaleUpperCase(${argTexts[0]})(${receiverText})`;
      return null;
    case "localeCompare":
      if (argTexts.length < 1 || argTexts.length > 3) return null;
      return `Str.localeCompare(${argTexts.join(", ")})(${receiverText})`;
    case "match":
      if (argTexts.length !== 1) return null;
      return makeOptionFallback(method, `Str.match(${argTexts[0]})(${receiverText})`);
    case "search":
      if (argTexts.length !== 1) return null;
      return makeOptionFallback(method, `Str.search(${argTexts[0]})(${receiverText})`);
    case "indexOf":
      if (argTexts.length !== 1) return null;
      return makeOptionFallback(method, `Str.indexOf(${argTexts[0]})(${receiverText})`);
    case "lastIndexOf":
      if (argTexts.length !== 1) return null;
      return makeOptionFallback(method, `Str.lastIndexOf(${argTexts[0]})(${receiverText})`);
    case "charCodeAt":
      if (argTexts.length !== 1) return null;
      return makeOptionFallback(method, `Str.charCodeAt(${argTexts[0]})(${receiverText})`);
    case "charAt":
      if (argTexts.length !== 1) return null;
      return makeOptionFallback(method, `Str.charAt(${argTexts[0]})(${receiverText})`);
    case "concat":
      if (argTexts.length < 1) return null;
      return argTexts.reduce((acc, arg) => `Str.concat(${arg})(${acc})`, receiverText);
    case "substr":
      if (argTexts.length === 1) return `Str.substring(${argTexts[0]})(${receiverText})`;
      if (argTexts.length === 2) return `Str.substring(${argTexts[0]}, (${argTexts[0]}) + (${argTexts[1]}))(${receiverText})`;
      return null;
    case "toString":
    case "valueOf":
      if (argTexts.length !== 0) return null;
      return receiverText;
    default:
      return null;
  }
};

const applyReplacements = (input, replacements) => {
  const sorted = [...replacements].sort((a, b) => b.start - a.start || b.end - a.end);
  let output = input;
  for (const r of sorted) {
    output = `${output.slice(0, r.start)}${r.text}${output.slice(r.end)}`;
  }
  return output;
};

const getImportInsertionPosition = (text, sourceFile) => {
  const imports = sourceFile.statements.filter(ts.isImportDeclaration);
  if (imports.length > 0) {
    return imports[imports.length - 1].getEnd();
  }
  if (text.startsWith("#!")) {
    const newline = text.indexOf("\n");
    return newline >= 0 ? newline + 1 : text.length;
  }
  return 0;
};

const rewriteImportDeclaration = (sourceFile, declaration, removedElements) => {
  const clause = declaration.importClause;
  if (!clause) return null;

  let defaultPart = clause.name ? clause.name.getText(sourceFile) : "";
  let namespacePart = "";
  let namedParts = [];

  if (clause.namedBindings) {
    if (ts.isNamespaceImport(clause.namedBindings)) {
      namespacePart = clause.namedBindings.getText(sourceFile);
    } else if (ts.isNamedImports(clause.namedBindings)) {
      namedParts = clause.namedBindings.elements
        .filter((element) => !MutableHashSet.has(removedElements, element))
        .map((element) => element.getText(sourceFile));
    }
  }

  const importParts = [];
  if (defaultPart) importParts.push(defaultPart);
  if (namespacePart) importParts.push(namespacePart);
  if (namedParts.length > 0) importParts.push(`{ ${namedParts.join(", ")} }`);

  if (importParts.length === 0) {
    return "";
  }

  const typePrefix = clause.isTypeOnly ? "import type " : "import ";
  const moduleSpecifier = declaration.moduleSpecifier.getText(sourceFile);
  return `${typePrefix}${importParts.join(", ")} from ${moduleSpecifier};`;
};

const overlapError = (replacements, filePath) => {
  const sorted = [...replacements].sort((a, b) => a.start - b.start || a.end - b.end);
  for (let index = 1; index < sorted.length; index += 1) {
    const prev = sorted[index - 1];
    const current = sorted[index];
    if (current.start < prev.end) {
      throw new Error(`Overlapping replacements in ${filePath} at ${prev.start}-${prev.end} and ${current.start}-${current.end}`);
    }
  }
};

let totalTransformedCalls = 0;
let totalFilesChanged = 0;
const changedFiles = [];

for (const sourceFile of program.getSourceFiles()) {
  const relativeFilePath = path.relative(process.cwd(), sourceFile.fileName).replaceAll("\\", "/");
  if (!HashSet.has(sourceFileSet, relativeFilePath)) continue;
  if (!HashSet.has(ALLOWLIST, relativeFilePath)) continue;

  const originalText = fs.readFileSync(relativeFilePath, "utf8");
  const callCandidates = MutableHashSet.empty();

  const visitCalls = (node) => {
    if (ts.isCallExpression(node)) {
      if (node.questionDotToken) {
        ts.forEachChild(node, visitCalls);
        return;
      }

      const expression = node.expression;
      if (ts.isPropertyAccessExpression(expression) || ts.isPropertyAccessChain(expression)) {
        if (expression.questionDotToken) {
          ts.forEachChild(node, visitCalls);
          return;
        }

        const method = expression.name.text;
        if (HashSet.has(STRING_METHODS, method)) {
          const receiverType = checker.getTypeAtLocation(expression.expression);
          const isStringReceiver = isStringLikeType(receiverType) || isAnyOrUnknown(receiverType);
          if (isStringReceiver) {
            const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            const key = `${relativeFilePath}:${position.line + 1}:${position.character + 1}`;
            if (!HashSet.has(SKIP_KEYS, key)) {
              MutableHashSet.add(callCandidates, node);
            }
          }
        }
      }
    }
    ts.forEachChild(node, visitCalls);
  };

  ts.forEachChild(sourceFile, visitCalls);

  const renderExpression = (node) => {
    if (ts.isCallExpression(node) && MutableHashSet.has(callCandidates, node)) {
      return transformCall(node);
    }
    return node.getText(sourceFile);
  };

  const transformCall = (node) => {
    const expression = node.expression;
    if (!(ts.isPropertyAccessExpression(expression) || ts.isPropertyAccessChain(expression))) {
      return node.getText(sourceFile);
    }

    const method = expression.name.text;
    const receiverText = renderExpression(expression.expression);
    const argTexts = node.arguments.map(renderExpression);
    const replacement = getStringMethodReplacement(method, receiverText, argTexts);

    if (replacement === null) {
      return node.getText(sourceFile);
    }

    return replacement;
  };

  const callReplacements = [];
  const topLevelCandidates = Array.from(callCandidates).filter((node) => {
    let current = node.parent;
    while (current) {
      if (ts.isCallExpression(current) && MutableHashSet.has(callCandidates, current)) {
        return false;
      }
      current = current.parent;
    }
    return true;
  });

  let usesOption = false;
  for (const candidate of topLevelCandidates) {
    const expression = candidate.expression;
    if (!(ts.isPropertyAccessExpression(expression) || ts.isPropertyAccessChain(expression))) continue;

    const method = expression.name.text;
    const replacement = transformCall(candidate);
    if (replacement === candidate.getText(sourceFile)) continue;

    if (HashSet.has(OPTION_WRAPPED_METHODS, method)) usesOption = true;

    callReplacements.push({
      start: candidate.getStart(sourceFile),
      end: candidate.getEnd(),
      text: replacement,
    });
    totalTransformedCalls += 1;
  }

  const hasStrImport = sourceFile.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      statement.moduleSpecifier.getText(sourceFile) === '"effect/String"' &&
      statement.importClause?.namedBindings &&
      ts.isNamespaceImport(statement.importClause.namedBindings) &&
      statement.importClause.namedBindings.name.text === "Str"
  );

  const hasOptionImport = sourceFile.statements.some(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      statement.moduleSpecifier.getText(sourceFile) === '"effect/Option"' &&
      statement.importClause?.namedBindings &&
      ts.isNamespaceImport(statement.importClause.namedBindings) &&
      statement.importClause.namedBindings.name.text === "O"
  );

  const effectStringBindings = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (statement.moduleSpecifier.getText(sourceFile) !== '"effect"') continue;
    const clause = statement.importClause;
    if (!clause?.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;

    for (const element of clause.namedBindings.elements) {
      const imported = element.propertyName?.text ?? element.name.text;
      if (imported !== "String") continue;
      const symbol = checker.getSymbolAtLocation(element.name);
      if (!symbol) continue;
      effectStringBindings.push({
        symbol,
        localName: element.name.text,
        importDecl: statement,
        element,
      });
    }
  }

  const stringIdentifierReplacements = [];
  const importElementsToRemove = MutableHashMap.empty();
  let needsStrImport = callReplacements.length > 0;

  for (const binding of effectStringBindings) {
    const references = [];
    let safe = true;

    const visitIdentifiers = (node) => {
      if (ts.isIdentifier(node)) {
        const symbol = checker.getSymbolAtLocation(node);
        if (symbol === binding.symbol) {
          if (ts.isImportSpecifier(node.parent) && node.parent.name === node) {
            return;
          }

          const parent = node.parent;
          const isPropertyAccessObject =
            (ts.isPropertyAccessExpression(parent) || ts.isPropertyAccessChain(parent)) && parent.expression === node;

          if (isPropertyAccessObject) {
            references.push(node);
          } else {
            safe = false;
          }
        }
      }
      ts.forEachChild(node, visitIdentifiers);
    };

    ts.forEachChild(sourceFile, visitIdentifiers);

    if (!safe) continue;

    for (const reference of references) {
      if (reference.text === "Str") continue;
      stringIdentifierReplacements.push({
        start: reference.getStart(sourceFile),
        end: reference.getEnd(),
        text: "Str",
      });
    }

    needsStrImport = true;

    const removed = O.getOrElse(MutableHashMap.get(importElementsToRemove, binding.importDecl), () => MutableHashSet.empty());
    MutableHashSet.add(removed, binding.element);
    MutableHashMap.set(importElementsToRemove, binding.importDecl, removed);
  }

  const importDeclarationReplacements = [];
  for (const [importDecl, removedElements] of importElementsToRemove) {
    const rewritten = rewriteImportDeclaration(sourceFile, importDecl, removedElements);
    if (rewritten === null) continue;
    importDeclarationReplacements.push({
      start: importDecl.getStart(sourceFile),
      end: importDecl.getEnd(),
      text: rewritten,
    });
  }

  const importInsertions = [];
  if ((needsStrImport && !hasStrImport) || (usesOption && !hasOptionImport)) {
    const insertionPos = getImportInsertionPosition(originalText, sourceFile);
    let importBlock = "";
    if (usesOption && !hasOptionImport) {
      importBlock += 'import * as O from "effect/Option";\n';
    }
    if (needsStrImport && !hasStrImport) {
      importBlock += 'import * as Str from "effect/String";\n';
    }
    if (importBlock.length > 0) {
      const prefix = sourceFile.statements.some(ts.isImportDeclaration) ? "\n" : "";
      importInsertions.push({
        start: insertionPos,
        end: insertionPos,
        text: `${prefix}${importBlock}`,
      });
    }
  }

  const replacements = [
    ...callReplacements,
    ...stringIdentifierReplacements,
    ...importDeclarationReplacements,
    ...importInsertions,
  ];

  if (replacements.length === 0) continue;

  overlapError(replacements, relativeFilePath);
  const nextText = applyReplacements(originalText, replacements);
  if (nextText === originalText) continue;

  totalFilesChanged += 1;
  changedFiles.push(relativeFilePath);

  if (write) {
    fs.writeFileSync(relativeFilePath, nextText, "utf8");
  }
}

if (write) {
  console.log(`Updated ${totalFilesChanged} file(s), transformed ${totalTransformedCalls} call(s).`);
  for (const filePath of changedFiles) {
    console.log(filePath);
  }
} else {
  console.log(`Would update ${totalFilesChanged} file(s), transform ${totalTransformedCalls} call(s).`);
  for (const filePath of changedFiles) {
    console.log(filePath);
  }
}
