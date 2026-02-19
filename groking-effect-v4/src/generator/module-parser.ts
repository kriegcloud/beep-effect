import * as fs from "node:fs";
import * as path from "node:path";
import { namedTypes as n, visit } from "ast-types";
import jscodeshift from "jscodeshift";
import { Node, type Project, type SourceFile, SyntaxKind, VariableDeclarationKind } from "ts-morph";
import { cleanJsDocBlock, extractFirstExampleCodeBlock, extractSummary } from "./doc.ts";
import type { ExportKind, ModuleParseDiagnostics } from "./types.ts";

export interface ParsedModuleExport {
  readonly exportName: string;
  readonly exportKind: ExportKind;
  readonly summary: string | undefined;
  readonly exampleCode: string | undefined;
  readonly sourceRelativePath: string;
}

export interface ParseModuleExportsResult {
  readonly exports: ReadonlyArray<ParsedModuleExport>;
  readonly diagnostics: ModuleParseDiagnostics;
}

interface TsMorphExportDetails {
  readonly exportName: string;
  readonly exportKind: ExportKind;
  readonly sourceRelativePath: string;
  readonly summary: string | undefined;
  readonly exampleCode: string | undefined;
}

const normalizePath = (value: string): string => value.split(path.sep).join("/");

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const extractNameFromSpecifier = (specifier: unknown): string | undefined => {
  if (!isRecord(specifier)) {
    return undefined;
  }
  const exported = specifier.exported;
  if (n.Identifier.check(exported)) {
    return exported.name;
  }
  if (n.StringLiteral.check(exported)) {
    return exported.value;
  }
  return undefined;
};

const collectBindingNamesFromPattern = (node: unknown): Array<string> => {
  if (n.Identifier.check(node)) {
    return [node.name];
  }

  if (n.ObjectPattern.check(node)) {
    const output: Array<string> = [];
    for (const property of node.properties) {
      if (property === null) {
        continue;
      }

      if (isRecord(property) && "argument" in property) {
        output.push(...collectBindingNamesFromPattern(property.argument));
        continue;
      }

      if (isRecord(property) && "value" in property) {
        output.push(...collectBindingNamesFromPattern(property.value));
      }
    }
    return output;
  }

  if (n.ArrayPattern.check(node)) {
    const output: Array<string> = [];
    for (const element of node.elements) {
      if (element === null) {
        continue;
      }
      output.push(...collectBindingNamesFromPattern(element));
    }
    return output;
  }

  if (n.RestElement.check(node)) {
    return collectBindingNamesFromPattern(node.argument);
  }

  if (n.AssignmentPattern.check(node)) {
    return collectBindingNamesFromPattern(node.left);
  }

  return [];
};

const kindFromVariableDeclarationKind = (kind: string | undefined): ExportKind => {
  if (kind === "const") {
    return "const";
  }
  if (kind === "let") {
    return "let";
  }
  return "var";
};

const inferExportKindFromDeclarationType = (declaration: unknown): ExportKind => {
  if (!isRecord(declaration) || typeof declaration.type !== "string") {
    return "reexport";
  }

  switch (declaration.type) {
    case "VariableDeclaration":
      return kindFromVariableDeclarationKind(typeof declaration.kind === "string" ? declaration.kind : undefined);
    case "FunctionDeclaration":
    case "TSDeclareFunction":
      return "function";
    case "ClassDeclaration":
      return "class";
    case "TSInterfaceDeclaration":
      return "interface";
    case "TSTypeAliasDeclaration":
      return "type";
    case "TSEnumDeclaration":
      return "enum";
    case "TSModuleDeclaration":
      return "namespace";
    default:
      return "reexport";
  }
};

const collectExportsWithAst = (sourceText: string): Map<string, ExportKind> => {
  const j = jscodeshift.withParser("ts");
  const root = j(sourceText);
  const ast = root.get().node;
  const output = new Map<string, ExportKind>();

  visit(ast, {
    visitExportNamedDeclaration(visitPath) {
      const node = visitPath.node;
      const declaration = node.declaration;

      if (declaration !== null && declaration !== undefined) {
        if (n.VariableDeclaration.check(declaration)) {
          const kind = kindFromVariableDeclarationKind(declaration.kind);
          for (const variableDeclaration of declaration.declarations) {
            if (!n.VariableDeclarator.check(variableDeclaration)) {
              continue;
            }
            for (const name of collectBindingNamesFromPattern(variableDeclaration.id)) {
              output.set(name, kind);
            }
          }
        } else if (isRecord(declaration) && "id" in declaration) {
          const identifier = declaration.id;
          if (n.Identifier.check(identifier)) {
            output.set(identifier.name, inferExportKindFromDeclarationType(declaration));
          }
        }
      }

      if (node.specifiers !== undefined && node.specifiers !== null) {
        for (const specifier of node.specifiers) {
          const name = extractNameFromSpecifier(specifier);
          if (name !== undefined) {
            output.set(name, "reexport");
          }
        }
      }

      this.traverse(visitPath);
    },
  });

  return output;
};

interface JsDocNodeLike {
  readonly getJsDocs: () => ReadonlyArray<{
    readonly getText: () => string;
  }>;
}

const isJsDocNodeLike = (value: unknown): value is JsDocNodeLike =>
  isRecord(value) && typeof value.getJsDocs === "function";

const extractJsDocBlocks = (node: Node): ReadonlyArray<string> => {
  const blocks: Array<string> = [];
  const pushDocs = (candidate: unknown): void => {
    if (!isJsDocNodeLike(candidate)) {
      return;
    }
    for (const doc of candidate.getJsDocs()) {
      blocks.push(doc.getText());
    }
  };

  pushDocs(node);

  if (Node.isVariableDeclaration(node)) {
    pushDocs(node.getFirstAncestorByKind(SyntaxKind.VariableStatement));
  }

  if (Node.isExportSpecifier(node)) {
    pushDocs(node.getFirstAncestorByKind(SyntaxKind.ExportDeclaration));
  }

  return blocks;
};

const inferExportKindFromTsMorphNode = (declaration: Node): ExportKind => {
  if (Node.isInterfaceDeclaration(declaration)) {
    return "interface";
  }
  if (Node.isTypeAliasDeclaration(declaration)) {
    return "type";
  }
  if (Node.isClassDeclaration(declaration)) {
    return "class";
  }
  if (Node.isFunctionDeclaration(declaration)) {
    return "function";
  }
  if (Node.isEnumDeclaration(declaration)) {
    return "enum";
  }
  if (Node.isModuleDeclaration(declaration)) {
    return "namespace";
  }
  if (Node.isVariableDeclaration(declaration)) {
    const declarationList = declaration.getFirstAncestorByKind(SyntaxKind.VariableDeclarationList);
    const declarationKind = declarationList?.getDeclarationKind();
    if (declarationKind === VariableDeclarationKind.Const) {
      return "const";
    }
    if (declarationKind === VariableDeclarationKind.Let) {
      return "let";
    }
    return "var";
  }
  if (Node.isExportSpecifier(declaration)) {
    return "reexport";
  }
  return "reexport";
};

const collectExportsWithTsMorph = (sourceFile: SourceFile, repoRoot: string): Map<string, TsMorphExportDetails> => {
  const exportedDeclarations = sourceFile.getExportedDeclarations();
  const output = new Map<string, TsMorphExportDetails>();

  for (const [exportName, declarations] of exportedDeclarations) {
    if (exportName === "default" || declarations.length === 0) {
      continue;
    }

    const declaration =
      declarations.find((item) => item.getSourceFile().getFilePath() === sourceFile.getFilePath()) ?? declarations[0];

    if (declaration === undefined) {
      continue;
    }

    const jsDocBlocks = extractJsDocBlocks(declaration);
    const jsDocBlock = jsDocBlocks[jsDocBlocks.length - 1];
    const cleanDoc = jsDocBlock === undefined ? undefined : cleanJsDocBlock(jsDocBlock);

    output.set(exportName, {
      exportName,
      exportKind: inferExportKindFromTsMorphNode(declaration),
      sourceRelativePath: normalizePath(path.relative(repoRoot, declaration.getSourceFile().getFilePath())),
      summary: cleanDoc === undefined ? undefined : extractSummary(cleanDoc),
      exampleCode: cleanDoc === undefined ? undefined : extractFirstExampleCodeBlock(cleanDoc),
    });
  }

  return output;
};

export const parseModuleExports = (options: {
  readonly moduleSourcePath: string;
  readonly repoRoot: string;
  readonly project: Project;
}): ParseModuleExportsResult => {
  const sourceText = fs.readFileSync(options.moduleSourcePath, "utf8");

  let astExports = new Map<string, ExportKind>();
  let astParseError: string | undefined;
  try {
    astExports = collectExportsWithAst(sourceText);
  } catch (error) {
    astParseError = error instanceof Error ? error.message : String(error);
  }

  const sourceFile =
    options.project.addSourceFileAtPathIfExists(options.moduleSourcePath) ??
    options.project.getSourceFileOrThrow(options.moduleSourcePath);
  const tsMorphExports = collectExportsWithTsMorph(sourceFile, options.repoRoot);

  const astNames = new Set(astExports.keys());
  const tsMorphNames = new Set(tsMorphExports.keys());
  const mergedNames = tsMorphNames.size > 0 ? new Set<string>(tsMorphNames) : new Set<string>(astNames);

  const moduleSourceRelativePath = normalizePath(path.relative(options.repoRoot, options.moduleSourcePath));

  const mergedExports: Array<ParsedModuleExport> = [];
  for (const exportName of mergedNames) {
    const tsMorph = tsMorphExports.get(exportName);
    const astKind = astExports.get(exportName);

    mergedExports.push({
      exportName,
      exportKind: tsMorph?.exportKind ?? astKind ?? "reexport",
      summary: tsMorph?.summary,
      exampleCode: tsMorph?.exampleCode,
      sourceRelativePath: tsMorph?.sourceRelativePath ?? moduleSourceRelativePath,
    });
  }

  mergedExports.sort((a, b) => a.exportName.localeCompare(b.exportName));

  const missingInTsMorph = [...astNames].filter((name) => !tsMorphNames.has(name)).sort((a, b) => a.localeCompare(b));

  const missingInAst = [...tsMorphNames].filter((name) => !astNames.has(name)).sort((a, b) => a.localeCompare(b));

  const diagnosticsBase: Omit<ModuleParseDiagnostics, "parseError"> = {
    jscodeshiftParseOk: astParseError === undefined,
    astExportCount: astNames.size,
    tsMorphExportCount: tsMorphNames.size,
    mergedExportCount: mergedNames.size,
    missingInTsMorph,
    missingInAst,
  };

  const diagnostics: ModuleParseDiagnostics =
    astParseError === undefined
      ? diagnosticsBase
      : {
          ...diagnosticsBase,
          parseError: astParseError,
        };

  return {
    exports: mergedExports,
    diagnostics,
  };
};
