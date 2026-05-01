#!/usr/bin/env bun

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as jsonc from "jsonc-parser";
import { Node, Project, SyntaxKind } from "ts-morph";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const outputJsonPath = path.join(rootDir, "standards", "jsdoc-documentation.inventory.jsonc");
const outputMarkdownPath = path.join(rootDir, "standards", "jsdoc-documentation.inventory.md");
const requiredExportTags = ["@example", "@category", "@since"];
const requiredModuleTags = ["@since"];
const forbiddenTags = ["@module", "@template"];
const requiredTsdocCustomTags = ["@effects", "@precondition", "@postcondition", "@invariant"];
const sourceExtensions = new Set([".ts", ".tsx"]);
const ignoredSourceSuffixes = [".d.ts"];

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

const markdownAnchor = (value) =>
  value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const globPatternToRegExp = (pattern) => {
  const normalized = normalizeSlashes(pattern.replace(/^\.\//, ""));
  let source = "^";
  let index = 0;

  while (index < normalized.length) {
    const char = normalized[index];
    const next = normalized[index + 1];
    const afterNext = normalized[index + 2];

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

    source += escapeRegExp(char ?? "");
    index += 1;
  }

  return new RegExp(`${source}$`);
};

const packageSourceMatchesExclude = (packagePath, srcDir, sourceFilePath, pattern) => {
  const packageRelative = normalizeSlashes(path.relative(packagePath, sourceFilePath));
  const srcRelative = packageRelative.startsWith(`${srcDir}/`)
    ? packageRelative.slice(srcDir.length + 1)
    : packageRelative;
  const matcher = globPatternToRegExp(pattern);

  return matcher.test(packageRelative) || matcher.test(srcRelative);
};

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
    .filter((line) => line.startsWith("@"));
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

const extractExamples = (commentText) => {
  const cleaned = stripCommentFraming(commentText).join("\n");
  const examples = [];
  const codeFencePattern = /```(?:ts|typescript)\s*\n([\s\S]*?)```/g;
  let match = codeFencePattern.exec(cleaned);

  while (match !== null) {
    examples.push(match[1] ?? "");
    match = codeFencePattern.exec(cleaned);
  }

  return examples;
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

const leadingJsDocText = (node) =>
  node
    .getLeadingCommentRanges()
    .map((range) => range.getText())
    .filter((text) => text.startsWith("/**"))
    .at(-1) ?? "";

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

const missingRequiredTags = (presentTags, requiredTags) => requiredTags.filter((tag) => !presentTags.includes(tag));

const malformedConditionalTags = (commentText) => {
  const findings = [];
  const lines = stripCommentFraming(commentText);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (/^\s*@(?:param|returns|throws)\s+\{[^}]+}/.test(line)) {
      findings.push({
        rule: "no-type-braces-in-tags",
        lineOffset: lineNumber,
        text: line.trim(),
      });
    }

    if (/^\s*@(?:returns|throws)\s+-\s+/.test(line)) {
      findings.push({
        rule: "no-hyphen-after-returns-or-throws",
        lineOffset: lineNumber,
        text: line.trim(),
      });
    }

    if (/^\s*@deprecated\b/.test(line) && !line.includes("{@link")) {
      findings.push({
        rule: "deprecated-requires-link",
        lineOffset: lineNumber,
        text: line.trim(),
      });
    }
  });

  return findings;
};

const exampleImportViolations = (commentText) => {
  const violations = [];
  const requiredNamespaceImports = [
    { module: "effect/Schema", alias: "S" },
    { module: "effect/Array", alias: "A" },
    { module: "effect/Option", alias: "O" },
    { module: "effect/Predicate", alias: "P" },
    { module: "effect/Record", alias: "R" },
  ];

  extractExamples(commentText).forEach((example, exampleIndex) => {
    if (/@effect\/schema/.test(example)) {
      violations.push({
        example: exampleIndex + 1,
        rule: "no-deprecated-effect-schema-import",
        detail: "Examples must import Schema APIs from effect/Schema, not @effect/schema.",
      });
    }

    for (const required of requiredNamespaceImports) {
      const namedImportPattern = new RegExp(
        `import\\s*\\{[^}]+\\}\\s*from\\s*["']${escapeRegExp(required.module)}["']`
      );
      const namespaceImportPattern = new RegExp(
        `import\\s*\\*\\s*as\\s+${required.alias}\\s*from\\s*["']${escapeRegExp(required.module)}["']`
      );

      if (namedImportPattern.test(example)) {
        violations.push({
          example: exampleIndex + 1,
          rule: "use-required-namespace-import",
          detail: `Use import * as ${required.alias} from "${required.module}".`,
        });
      }

      if (example.includes(`from "${required.module}"`) && !namespaceImportPattern.test(example)) {
        violations.push({
          example: exampleIndex + 1,
          rule: "wrong-required-namespace-alias",
          detail: `Examples importing ${required.module} must use the ${required.alias} namespace alias.`,
        });
      }
    }
  });

  return violations;
};

const unsafeExampleViolations = (commentText) => {
  const violations = [];

  extractExamples(commentText).forEach((example, exampleIndex) => {
    const nonImportLines = example
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => !line.startsWith("import "));
    const nonImportText = nonImportLines.join("\n");

    if (/\bdeclare\b/.test(nonImportText)) {
      violations.push({
        example: exampleIndex + 1,
        rule: "no-declare-statements",
        detail: "Examples must be executable snippets, not declaration stubs.",
      });
    }

    if (/\bany\b/.test(nonImportText)) {
      violations.push({
        example: exampleIndex + 1,
        rule: "no-any-in-examples",
        detail: "Examples must not use any.",
      });
    }

    if (/\bas\s+(?:const|unknown|never|string|number|boolean|readonly|[A-Z_$({[])/.test(nonImportText)) {
      violations.push({
        example: exampleIndex + 1,
        rule: "no-type-assertions-in-examples",
        detail: "Examples must construct values through public APIs instead of type assertions.",
      });
    }
  });

  return violations;
};

const forbiddenTagsIn = (presentTags) => presentTags.filter((tag) => forbiddenTags.includes(tag));

const categoryViolations = (commentText) =>
  valuesForTag(commentText, "@category")
    .filter((value) => /[A-Z]/.test(value))
    .map((value) => ({
      rule: "category-must-be-lowercase",
      detail: value,
    }));

const textLooksLikeSchemaExport = (name, node) => {
  const text = getDocNode(node).getText();
  if (name.startsWith("$")) {
    return false;
  }
  if (Node.isClassDeclaration(node)) {
    return /\b(?:S\.Class|Model\.Class|TaggedErrorClass)\b/.test(text);
  }
  if (!Node.isVariableDeclaration(node)) {
    return false;
  }

  const initializer = node.getInitializer()?.getText() ?? "";
  return (
    /\b(?:LiteralKit|TaggedErrorClass|DomainModel\.make|Table\.make)\s*\(/.test(initializer) ||
    /\bS\.(?:String|Number|Boolean|BigInt|Symbol|Object|Unknown|Any|Never|Void|Null|Undefined|Date|Array|Record|Struct|Union|Literal|TemplateLiteral|Tuple|Class|Enums|OptionFrom|NullOr|TaggedStruct|TaggedError)\b/.test(
      initializer
    )
  );
};

const schemaAnnotationGaps = (name, node, sourceFile) => {
  if (!textLooksLikeSchemaExport(name, node)) {
    return [];
  }

  const gaps = [];
  const text = getDocNode(node).getText();
  const hasAnnotation =
    /\$I\.annote(?:Schema)?\s*\(/.test(text) || /\.annotate\s*\(/.test(text) || /\bS\.annotate\s*\(/.test(text);

  if (!hasAnnotation) {
    gaps.push({
      rule: "missing-schema-annotation",
      detail: "Exported schemas should carry $I.annote or $I.annoteSchema metadata.",
    });
  }

  if (!Node.isClassDeclaration(node) && sourceFile.getTypeAlias(name) === undefined) {
    gaps.push({
      rule: "missing-schema-runtime-type-alias",
      detail: `Exported non-class schema ${name} should have an exported same-name runtime type alias.`,
    });
  }

  return gaps;
};

const topFileoverview = (sourceFile) => {
  const text = sourceFile.getFullText();
  const match = /^(?:#![^\n]*\n)?\s*(\/\*\*[\s\S]*?\*\/)/.exec(text);
  return match === null ? undefined : match[1];
};

const analyzeModule = (sourceFile, packagePath, exportCount) => {
  const filePath = repoRelative(sourceFile.getFilePath());
  const relativeFilePath = normalizeSlashes(path.relative(packagePath, sourceFile.getFilePath()));
  const fileoverview = topFileoverview(sourceFile);
  const presentTags = fileoverview === undefined ? [] : tagsFromComment(fileoverview);
  const missingTags = exportCount === 0 ? [] : missingRequiredTags(presentTags, requiredModuleTags);
  const forbidden = forbiddenTagsIn(presentTags);
  const missingSummary = fileoverview === undefined ? exportCount > 0 : summaryFromComment(fileoverview) === undefined;
  const docKind = presentTags.includes("@packageDocumentation")
    ? "packageDocumentation"
    : presentTags.includes("@module")
      ? "module"
      : fileoverview === undefined
        ? "none"
        : "jsdoc";
  const malformedTags = fileoverview === undefined ? [] : malformedConditionalTags(fileoverview);
  const categoryIssues = fileoverview === undefined ? [] : categoryViolations(fileoverview);
  const findingCount =
    missingTags.length + forbidden.length + malformedTags.length + categoryIssues.length + (missingSummary ? 1 : 0);

  return {
    docKind,
    filePath: relativeFilePath,
    repoPath: filePath,
    line: 1,
    anchor: markdownAnchor(`${filePath}-1-module`),
    currentTags: presentTags,
    missingRequiredTags: missingTags,
    forbiddenTags: forbidden,
    missingSummary,
    malformedConditionalTags: malformedTags,
    categoryViolations: categoryIssues,
    exportCount,
    remediationStatus: findingCount === 0 ? "resolved" : "open",
  };
};

const analyzeExportDeclaration = (declaration, sourceFile, packagePath) => {
  const commentText = `${leadingJsDocText(declaration)}\n${declaration.getText()}`;
  const presentTags = tagsFromComment(commentText);
  const missingTags = missingRequiredTags(presentTags, requiredExportTags);
  const filePath = normalizeSlashes(path.relative(packagePath, sourceFile.getFilePath()));
  const repoPath = repoRelative(sourceFile.getFilePath());
  const line = declaration.getStartLineNumber();
  const malformedTags = malformedConditionalTags(commentText);
  const importIssues = exampleImportViolations(commentText);
  const unsafeIssues = unsafeExampleViolations(commentText);
  const categoryIssues = categoryViolations(commentText);
  const forbidden = forbiddenTagsIn(presentTags);
  const missingSummary = summaryFromComment(commentText) === undefined;
  const findingCount =
    missingTags.length +
    forbidden.length +
    malformedTags.length +
    importIssues.length +
    unsafeIssues.length +
    categoryIssues.length +
    (missingSummary ? 1 : 0);

  return {
    symbolName: declaration.getText(),
    exportKind: "re-export",
    filePath,
    repoPath,
    line,
    anchor: markdownAnchor(`${repoPath}-${line}-${declaration.getText()}`),
    currentTags: presentTags,
    missingRequiredTags: missingTags,
    forbiddenTags: forbidden,
    missingSummary,
    malformedConditionalTags: malformedTags,
    exampleImportViolations: importIssues,
    unsafeExampleViolations: unsafeIssues,
    schemaAnnotationGaps: [],
    remediationStatus: findingCount === 0 ? "resolved" : "open",
  };
};

const analyzeDirectExport = (name, declaration, sourceFile, packagePath) => {
  const docText = getJsDocText(declaration);
  const presentTags = tagsFromComment(docText);
  const missingTags = missingRequiredTags(presentTags, requiredExportTags);
  const filePath = normalizeSlashes(path.relative(packagePath, sourceFile.getFilePath()));
  const repoPath = repoRelative(sourceFile.getFilePath());
  const line = declaration.getStartLineNumber();
  const malformedTags = malformedConditionalTags(docText);
  const importIssues = exampleImportViolations(docText);
  const unsafeIssues = unsafeExampleViolations(docText);
  const categoryIssues = categoryViolations(docText);
  const forbidden = forbiddenTagsIn(presentTags);
  const missingSummary = summaryFromComment(docText) === undefined;
  const schemaGaps = schemaAnnotationGaps(name, declaration, sourceFile);
  const findingCount =
    missingTags.length +
    forbidden.length +
    malformedTags.length +
    importIssues.length +
    unsafeIssues.length +
    categoryIssues.length +
    schemaGaps.length +
    (missingSummary ? 1 : 0);

  return {
    symbolName: name,
    exportKind: declarationKind(declaration),
    filePath,
    repoPath,
    line,
    anchor: markdownAnchor(`${repoPath}-${line}-${name}`),
    currentTags: presentTags,
    missingRequiredTags: missingTags,
    forbiddenTags: forbidden,
    missingSummary,
    malformedConditionalTags: malformedTags,
    exampleImportViolations: importIssues,
    unsafeExampleViolations: unsafeIssues,
    schemaAnnotationGaps: schemaGaps,
    remediationStatus: findingCount === 0 ? "resolved" : "open",
  };
};

const exportedDeclarationsFor = (sourceFile, packagePath) => {
  const exports = [];
  const seen = new Set();

  for (const declaration of sourceFile.getDescendantsOfKind(SyntaxKind.ExportDeclaration)) {
    if (declaration.getModuleSpecifierValue() === undefined) {
      continue;
    }
    const key = `re-export:${declaration.getStart()}`;
    seen.add(key);
    exports.push({
      key,
      analysis: analyzeExportDeclaration(declaration, sourceFile, packagePath),
    });
  }

  for (const [name, declarations] of sourceFile.getExportedDeclarations()) {
    for (const declaration of declarations) {
      if (declaration.getSourceFile() !== sourceFile) {
        continue;
      }
      const key = `${name}:${declaration.getStart()}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      exports.push({ key, name, declaration });
    }
  }

  return exports;
};

const analyzePackage = (packageInfo, topoOrder) => {
  const docgenPath = path.join(packageInfo.absolutePath, "docgen.json");
  const hasDocgenConfig = existsSync(docgenPath);
  const docgenConfig = hasDocgenConfig ? readJsonc(docgenPath) : {};
  const srcDir = typeof docgenConfig.srcDir === "string" ? docgenConfig.srcDir : "src";
  const exclude = Array.isArray(docgenConfig.exclude)
    ? docgenConfig.exclude.filter((item) => typeof item === "string")
    : [];
  const sourceRoot = path.join(packageInfo.absolutePath, srcDir);
  const sourceFiles = listSourceFiles(sourceRoot).filter(
    (sourceFilePath) =>
      !exclude.some((pattern) => packageSourceMatchesExclude(packageInfo.absolutePath, srcDir, sourceFilePath, pattern))
  );
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const modules = [];
  const exports = [];

  for (const sourceFilePath of sourceFiles) {
    const sourceFile = project.addSourceFileAtPath(sourceFilePath);
    const packageExports = [];
    const directExports = exportedDeclarationsFor(sourceFile, packageInfo.absolutePath);

    for (const entry of directExports) {
      if (entry.analysis !== undefined) {
        packageExports.push({
          ...entry.analysis,
          filePath: normalizeSlashes(path.relative(packageInfo.absolutePath, sourceFile.getFilePath())),
          repoPath: repoRelative(sourceFile.getFilePath()),
        });
        continue;
      }
      packageExports.push(analyzeDirectExport(entry.name, entry.declaration, sourceFile, packageInfo.absolutePath));
    }

    if (packageExports.length > 0) {
      modules.push(analyzeModule(sourceFile, packageInfo.absolutePath, packageExports.length));
      exports.push(...packageExports);
    }
  }

  const openModuleCount = modules.filter((entry) => entry.remediationStatus === "open").length;
  const openExportCount = exports.filter((entry) => entry.remediationStatus === "open").length;
  const status =
    sourceFiles.length === 0 || (modules.length === 0 && exports.length === 0)
      ? "no-public-src-surface"
      : openModuleCount + openExportCount === 0
        ? "clean"
        : "needs-remediation";

  return {
    packageName: packageInfo.name,
    packagePath: packageInfo.path,
    topoOrder,
    status,
    sourceCoverage: {
      srcDir,
      sourceFileCount: sourceFiles.length,
      publicModuleCount: modules.length,
      publicExportCount: exports.length,
    },
    docgenCoverage: {
      hasDocgenConfig,
      enforceDescriptions: docgenConfig.enforceDescriptions === true,
      enforceExamples: docgenConfig.enforceExamples === true,
      enforceVersion: docgenConfig.enforceVersion !== false,
    },
    counts: {
      openModules: openModuleCount,
      openExports: openExportCount,
      missingExportExamples: exports.filter((entry) => entry.missingRequiredTags.includes("@example")).length,
      missingExportCategories: exports.filter((entry) => entry.missingRequiredTags.includes("@category")).length,
      missingExportSince: exports.filter((entry) => entry.missingRequiredTags.includes("@since")).length,
      missingExportSummaries: exports.filter((entry) => entry.missingSummary).length,
      forbiddenTagFindings:
        modules.reduce((total, entry) => total + entry.forbiddenTags.length, 0) +
        exports.reduce((total, entry) => total + entry.forbiddenTags.length, 0),
      malformedConditionalTagFindings:
        modules.reduce((total, entry) => total + entry.malformedConditionalTags.length, 0) +
        exports.reduce((total, entry) => total + entry.malformedConditionalTags.length, 0),
      exampleImportFindings: exports.reduce((total, entry) => total + entry.exampleImportViolations.length, 0),
      unsafeExampleFindings: exports.reduce((total, entry) => total + entry.unsafeExampleViolations.length, 0),
      schemaAnnotationFindings: exports.reduce((total, entry) => total + entry.schemaAnnotationGaps.length, 0),
    },
    modules,
    exports,
  };
};

const analyzeMissingPackage = (packageName, topoOrder) => ({
  packageName,
  packagePath: "<unresolved>",
  topoOrder,
  status: "missing-workspace-metadata",
  sourceCoverage: {
    srcDir: "src",
    sourceFileCount: 0,
    publicModuleCount: 0,
    publicExportCount: 0,
  },
  docgenCoverage: {
    hasDocgenConfig: false,
    enforceDescriptions: false,
    enforceExamples: false,
    enforceVersion: false,
  },
  counts: {
    openModules: 0,
    openExports: 0,
    missingExportExamples: 0,
    missingExportCategories: 0,
    missingExportSince: 0,
    missingExportSummaries: 0,
    forbiddenTagFindings: 0,
    malformedConditionalTagFindings: 0,
    exampleImportFindings: 0,
    unsafeExampleFindings: 0,
    schemaAnnotationFindings: 0,
  },
  modules: [],
  exports: [],
});

const analyzeRootPolicy = () => {
  const tsdocPath = path.join(rootDir, "tsdoc.json");
  const tsdoc = readJsonc(tsdocPath);
  const tagDefinitions = Array.isArray(tsdoc.tagDefinitions) ? tsdoc.tagDefinitions : [];
  const supportForTags = tsdoc.supportForTags ?? {};

  const customTags = requiredTsdocCustomTags.map((tagName) => {
    const hasDefinition = tagDefinitions.some((entry) => entry?.tagName === tagName);
    const hasSupport = supportForTags[tagName] === true;
    return {
      tagName,
      hasDefinition,
      hasSupport,
      status: hasDefinition && hasSupport ? "resolved" : "open",
      missing: [...(hasDefinition ? [] : ["tagDefinitions"]), ...(hasSupport ? [] : ["supportForTags"])],
    };
  });

  return {
    filePath: "tsdoc.json",
    requiredCustomTags: requiredTsdocCustomTags,
    customTags,
    status: customTags.every((entry) => entry.status === "resolved") ? "resolved" : "open",
  };
};

const inventoryTotals = (packages, rootPolicy) => {
  const openPackageCount = packages.filter((entry) => entry.status === "needs-remediation").length;
  return {
    packages: packages.length,
    cleanPackages: packages.filter((entry) => entry.status === "clean").length,
    packagesWithoutPublicSrcSurface: packages.filter((entry) => entry.status === "no-public-src-surface").length,
    packagesNeedingRemediation: openPackageCount,
    publicModules: packages.reduce((total, entry) => total + entry.sourceCoverage.publicModuleCount, 0),
    publicExports: packages.reduce((total, entry) => total + entry.sourceCoverage.publicExportCount, 0),
    openModules: packages.reduce((total, entry) => total + entry.counts.openModules, 0),
    openExports: packages.reduce((total, entry) => total + entry.counts.openExports, 0),
    missingExportExamples: packages.reduce((total, entry) => total + entry.counts.missingExportExamples, 0),
    missingExportCategories: packages.reduce((total, entry) => total + entry.counts.missingExportCategories, 0),
    missingExportSince: packages.reduce((total, entry) => total + entry.counts.missingExportSince, 0),
    forbiddenTagFindings: packages.reduce((total, entry) => total + entry.counts.forbiddenTagFindings, 0),
    malformedConditionalTagFindings: packages.reduce(
      (total, entry) => total + entry.counts.malformedConditionalTagFindings,
      0
    ),
    exampleImportFindings: packages.reduce((total, entry) => total + entry.counts.exampleImportFindings, 0),
    unsafeExampleFindings: packages.reduce((total, entry) => total + entry.counts.unsafeExampleFindings, 0),
    schemaAnnotationFindings: packages.reduce((total, entry) => total + entry.counts.schemaAnnotationFindings, 0),
    rootPolicyOpen: rootPolicy.status === "open" ? 1 : 0,
  };
};

const detailList = (entry) => {
  const details = [];

  if (entry.missingSummary) {
    details.push("missing summary");
  }
  if (entry.missingRequiredTags.length > 0) {
    details.push(`missing ${entry.missingRequiredTags.join(", ")}`);
  }
  if (entry.forbiddenTags.length > 0) {
    details.push(`forbidden ${entry.forbiddenTags.join(", ")}`);
  }
  if (entry.malformedConditionalTags.length > 0) {
    details.push(`${entry.malformedConditionalTags.length} malformed conditional tag(s)`);
  }
  if (entry.exampleImportViolations?.length > 0) {
    details.push(`${entry.exampleImportViolations.length} example import violation(s)`);
  }
  if (entry.unsafeExampleViolations?.length > 0) {
    details.push(`${entry.unsafeExampleViolations.length} unsafe example violation(s)`);
  }
  if (entry.schemaAnnotationGaps?.length > 0) {
    details.push(`${entry.schemaAnnotationGaps.length} schema annotation/type-alias gap(s)`);
  }
  if (entry.categoryViolations?.length > 0) {
    details.push(`${entry.categoryViolations.length} category casing violation(s)`);
  }

  return details.length === 0 ? "resolved" : details.join("; ");
};

const renderMarkdown = (inventory) => {
  const lines = [];
  lines.push("# JSDoc Documentation Compliance Inventory");
  lines.push("");
  lines.push(`Generated: ${inventory.generatedAt}`);
  lines.push("");
  lines.push("## Scope");
  lines.push("");
  lines.push(
    "The package universe is the current `bun run topo-sort` output. This inventory checks repo JSDoc rules that package docgen does not fully validate yet: required export tags, summaries, TSDoc grammar, forbidden legacy tags, example import aliases, unsafe examples, root TSDoc custom tag registration, and schema annotation/type-alias gaps."
  );
  lines.push("");
  lines.push("## Totals");
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("|---|---:|");
  for (const [key, value] of Object.entries(inventory.totals)) {
    lines.push(`| ${key} | ${value} |`);
  }
  lines.push("");
  lines.push("## Root Policy");
  lines.push("");
  lines.push("| File | Tag | Status | Missing |");
  lines.push("|---|---|---|---|");
  for (const tag of inventory.rootPolicy.customTags) {
    lines.push(
      `| ${inventory.rootPolicy.filePath} | \`${tag.tagName}\` | ${tag.status} | ${tag.missing.join(", ") || "none"} |`
    );
  }
  lines.push("");
  lines.push("## Package Summary");
  lines.push("");
  lines.push("| Order | Package | Path | Status | Modules | Exports | Open Modules | Open Exports |");
  lines.push("|---:|---|---|---|---:|---:|---:|---:|");
  for (const pkg of inventory.packages) {
    lines.push(
      `| ${pkg.topoOrder} | \`${pkg.packageName}\` | \`${pkg.packagePath}\` | ${pkg.status} | ${pkg.sourceCoverage.publicModuleCount} | ${pkg.sourceCoverage.publicExportCount} | ${pkg.counts.openModules} | ${pkg.counts.openExports} |`
    );
  }
  lines.push("");
  lines.push("## Open Findings");

  for (const pkg of inventory.packages.filter((entry) => entry.status === "needs-remediation")) {
    lines.push("");
    lines.push(`### ${pkg.packageName}`);
    lines.push("");
    lines.push(`Path: \`${pkg.packagePath}\``);

    const openModules = pkg.modules.filter((entry) => entry.remediationStatus === "open");
    if (openModules.length > 0) {
      lines.push("");
      lines.push("Module findings:");
      for (const moduleEntry of openModules) {
        lines.push(
          `- \`${moduleEntry.filePath}:${moduleEntry.line}\` (${moduleEntry.docKind}) - ${detailList(moduleEntry)}`
        );
      }
    }

    const openExports = pkg.exports.filter((entry) => entry.remediationStatus === "open");
    if (openExports.length > 0) {
      lines.push("");
      lines.push("Export findings:");
      for (const exportEntry of openExports) {
        lines.push(
          `- \`${exportEntry.filePath}:${exportEntry.line}\` \`${exportEntry.symbolName}\` (${exportEntry.exportKind}) - ${detailList(exportEntry)}`
        );
      }
    }
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
};

const main = () => {
  const packageByName = discoverWorkspacePackages();
  const topoNames = topoSortPackageNames();
  const rootPolicy = analyzeRootPolicy();
  const packages = topoNames.map((packageName, index) => {
    const packageInfo = packageByName.get(packageName);
    return packageInfo === undefined
      ? analyzeMissingPackage(packageName, index + 1)
      : analyzePackage(packageInfo, index + 1);
  });
  const inventory = {
    standard: "jsdoc-documentation",
    version: 1,
    generatedAt: new Date().toISOString(),
    source: {
      packageUniverseCommand: "bun run topo-sort",
      generator: "scripts/generate-jsdoc-documentation-inventory.mjs",
      policy: ".patterns/jsdoc-documentation.md",
      skill: ".claude/skills/jsdoc-annotation-specialist/SKILL.md",
    },
    requiredExportTags,
    requiredModuleTags,
    forbiddenTags,
    rootPolicy,
    totals: inventoryTotals(packages, rootPolicy),
    packages,
  };

  mkdirSync(path.dirname(outputJsonPath), { recursive: true });
  writeFileSync(outputJsonPath, formatJsonc(inventory));
  writeFileSync(outputMarkdownPath, renderMarkdown(inventory));
  console.log(`wrote ${repoRelative(outputJsonPath)}`);
  console.log(`wrote ${repoRelative(outputMarkdownPath)}`);
  console.log(
    `packages=${inventory.totals.packages} openPackages=${inventory.totals.packagesNeedingRemediation} openExports=${inventory.totals.openExports} openModules=${inventory.totals.openModules} rootPolicyOpen=${inventory.totals.rootPolicyOpen}`
  );
};

main();
