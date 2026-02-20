import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import { resolveModuleImportPath } from "./module-import-compat.ts";
import type { ExportKind } from "./types.ts";

export interface RenderExportTemplateParams {
  readonly packageName: string;
  readonly moduleName: string;
  readonly moduleImportPath: string;
  readonly exportName: string;
  readonly exportKind: ExportKind;
  readonly sourceRelativePath: string;
  readonly summary: string | undefined;
  readonly exampleCode: string | undefined;
}

interface ExportTemplateContext {
  readonly GeneratedAt: string;
  readonly PackageName: string;
  readonly ModulePath: string;
  readonly ModuleName: string;
  readonly ModuleImportPath: string;
  readonly ExportName: string;
  readonly ExportKind: string;
  readonly SourcePath: string;
  readonly Summary: string;
  readonly Overview: string;
  readonly OverviewLiteral: string;
  readonly ExampleLiteral: string;
  readonly JSDocExampleCommentBlock: string;
}

type TemplateName = "class-like" | "function-like" | "type-like" | "value-like";

const templateCache = new Map<TemplateName, Handlebars.TemplateDelegate<ExportTemplateContext>>();

const templateDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "templates");

const kindToTemplate = (kind: ExportKind): TemplateName => {
  if (kind === "class") {
    return "class-like";
  }
  if (kind === "function") {
    return "function-like";
  }
  if (kind === "type" || kind === "interface") {
    return "type-like";
  }
  return "value-like";
};

const loadTemplate = (name: TemplateName): Handlebars.TemplateDelegate<ExportTemplateContext> => {
  const cached = templateCache.get(name);
  if (cached !== undefined) {
    return cached;
  }

  const templatePath = path.join(templateDirectory, `${name}.hbs`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file was not found: ${templatePath}`);
  }

  const templateSource = fs.readFileSync(templatePath, "utf8");
  const compiled = Handlebars.compile<ExportTemplateContext>(templateSource, { noEscape: true, strict: true });
  templateCache.set(name, compiled);
  return compiled;
};

const toSafeIdentifier = (value: string): string => {
  const cleaned = value.replace(/[^A-Za-z0-9_$]/g, "");
  if (cleaned.length === 0) {
    return "Module";
  }
  if (/^[0-9]/.test(cleaned)) {
    return `M${cleaned}`;
  }
  return cleaned;
};

const toModuleAlias = (modulePath: string): string => {
  const segments = modulePath.split("/").filter((segment) => segment.length > 0);
  const leaf = segments.at(-1) ?? "Module";
  const alias = toSafeIdentifier(leaf);
  return alias.endsWith("Module") ? alias : `${alias}Module`;
};

const toCommentSafe = (value: string): string => value.replace(/\*\//g, "*\\/");

const toSummary = (summary: string | undefined): string => {
  if (summary === undefined) {
    return "No summary found in JSDoc.";
  }
  const trimmed = summary.trim();
  return trimmed.length === 0 ? "No summary found in JSDoc." : trimmed;
};

const toOverview = (summary: string | undefined): string => {
  const oneLine = toSummary(summary).replace(/\s+/g, " ").trim();
  if (oneLine.length <= 180) {
    return oneLine;
  }
  return `${oneLine.slice(0, 177)}...`;
};

const toJSDocExampleCommentBlock = (exampleCode: string | undefined): string => {
  if (exampleCode === undefined || exampleCode.trim().length === 0) {
    return " * (No inline example was found in the source JSDoc.)";
  }

  const output = [" * ```ts", ...exampleCode.split("\n").map((line) => ` * ${toCommentSafe(line)}`), " * ```"];
  return output.join("\n");
};

const toExampleLiteral = (exampleCode: string | undefined): string => {
  if (exampleCode === undefined) {
    return '""';
  }
  return JSON.stringify(exampleCode);
};

const toLiteral = (value: string): string => JSON.stringify(value);

const toTemplateContext = (params: RenderExportTemplateParams): ExportTemplateContext => {
  const moduleAlias = toModuleAlias(params.moduleName);
  const moduleImportPath = resolveModuleImportPath(params.packageName, params.moduleName);

  if (params.moduleImportPath !== moduleImportPath) {
    throw new Error(
      `Mismatched module import path for ${params.packageName}/${params.moduleName}: expected ${moduleImportPath}, received ${params.moduleImportPath}`
    );
  }

  return {
    GeneratedAt: new Date().toISOString(),
    PackageName: params.packageName,
    ModulePath: params.moduleName,
    ModuleName: moduleAlias,
    ModuleImportPath: moduleImportPath,
    ExportName: params.exportName,
    ExportKind: params.exportKind,
    SourcePath: params.sourceRelativePath,
    Summary: toCommentSafe(toSummary(params.summary)),
    Overview: toCommentSafe(toOverview(params.summary)),
    OverviewLiteral: toLiteral(toOverview(params.summary)),
    ExampleLiteral: toExampleLiteral(params.exampleCode),
    JSDocExampleCommentBlock: toJSDocExampleCommentBlock(params.exampleCode),
  };
};

export const renderExportFileFromTemplate = (params: RenderExportTemplateParams): string => {
  const template = loadTemplate(kindToTemplate(params.exportKind));
  return template(toTemplateContext(params));
};
