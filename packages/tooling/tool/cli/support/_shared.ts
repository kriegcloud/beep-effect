import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { $RepoCliId } from "@beep/identity/packages";
import { A, Str } from "@beep/utils";
import { Result } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import * as jsonc from "jsonc-parser";
import { Node } from "ts-morph";

const $I = $RepoCliId.create("support/_shared");

export type JsonRecord = Record<string, unknown>;

export class PackageJson extends S.Class<PackageJson>($I`PackageJson`)(
  {
    name: S.String,
    workspaces: S.optionalKey(S.Unknown),
    exports: S.optionalKey(S.Unknown),
  },
  $I.annote("PackageJson", {
    description: "Package manifest fields used by repo CLI support scripts.",
  })
) {}

export class WorkspacePackageInfo extends S.Class<WorkspacePackageInfo>($I`WorkspacePackageInfo`)(
  {
    name: S.String,
    path: S.String,
    absolutePath: S.String,
    packageJson: PackageJson,
  },
  $I.annote("WorkspacePackageInfo", {
    description: "Discovered workspace package metadata used by repo CLI support scripts.",
  })
) {}

const decodePackageJsonResult = S.decodeUnknownResult(PackageJson);

const schemaIssueToError = (cause: S.SchemaError["issue"]): S.SchemaError => new S.SchemaError(cause);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

export const rootDir = path.resolve(scriptDir, "../../../../..");

export const sourceExtensions = new Set([".ts", ".tsx"]);

export const ignoredSourceSuffixes = [".d.ts"];

export const readText = (filePath: string): string => readFileSync(filePath, "utf8");

export const readJsonc = (filePath: string): JsonRecord => {
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

export const formatJsonc = (value: unknown): string => {
  const encoded = JSON.stringify(value, null, 2);
  return `${jsonc.applyEdits(
    encoded,
    jsonc.format(encoded, undefined, {
      insertSpaces: true,
      tabSize: 2,
    })
  )}\n`;
};

export const normalizeSlashes = (value: string): string => Str.replaceAll(path.sep, "/")(value);

export const repoRelative = (absolutePath: string): string =>
  normalizeSlashes(path.relative(rootDir, absolutePath) || ".");

export const escapeRegExp = (value: string): string => Str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")(value);

export const readPackageJson = (filePath: string): PackageJson =>
  Result.getOrThrowWith(decodePackageJsonResult(readJsonc(filePath)), schemaIssueToError);

export const readRootPackage = (): PackageJson => readPackageJson(path.join(rootDir, "package.json"));

export const workspacePatternsFrom = (workspaces: unknown): ReadonlyArray<string> => {
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

export const expandWorkspacePattern = (pattern: string): ReadonlyArray<string> => {
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

export const discoverWorkspacePackages = (): Map<string, WorkspacePackageInfo> => {
  const rootPackage = readRootPackage();
  const packages = new Map<string, WorkspacePackageInfo>();

  packages.set(
    rootPackage.name,
    WorkspacePackageInfo.make({
      name: rootPackage.name,
      path: ".",
      absolutePath: rootDir,
      packageJson: rootPackage,
    })
  );

  for (const pattern of workspacePatternsFrom(rootPackage.workspaces)) {
    for (const packagePath of expandWorkspacePattern(pattern)) {
      const packageJson = readPackageJson(path.join(packagePath, "package.json"));
      packages.set(
        packageJson.name,
        WorkspacePackageInfo.make({
          name: packageJson.name,
          path: repoRelative(packagePath),
          absolutePath: packagePath,
          packageJson,
        })
      );
    }
  }

  return packages;
};

export const topoSortPackageNames = (
  includeLine: (line: string) => boolean = (line) => line.length > 0
): ReadonlyArray<string> => {
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
        includeLine
      ),
      (line) => Str.split(/\s+/u)(line)[0]
    ),
    (packageName): packageName is string => packageName !== undefined
  );
};

export const listSourceFiles = (directory: string): ReadonlyArray<string> => {
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
  return A.sortInPlace(files, (left, right) => Str.localeCompare(right)(left));
};

export const stripCommentFraming = (commentText: string): ReadonlyArray<string> =>
  A.map(Str.split(/\r?\n/)(Str.replace(/\*\/$/, "")(Str.replace(/^\/\*\*/, "")(commentText))), (line) =>
    Str.trimEnd(Str.replace(/^\s*\*\s?/, "")(line))
  );

export const summaryFromComment = (commentText: string): string | undefined => {
  for (const line of stripCommentFraming(commentText)) {
    const trimmed = Str.trim(line);
    if (trimmed.length === 0 || Str.startsWith("@")(trimmed) || Str.startsWith("```")(trimmed)) {
      continue;
    }
    return trimmed;
  }
  return undefined;
};

export const tagsFromComment = (commentText: string): ReadonlyArray<string> => {
  const tags: Array<string> = [];
  for (const line of stripCommentFraming(commentText)) {
    const match = /^\s*@([A-Za-z][\w-]*)\b/.exec(line);
    if (match !== null) {
      A.appendInPlace(tags, `@${match[1]}`);
    }
  }
  return [...new Set(tags)];
};

export const valuesForTag: {
  (tagName: string): (commentText: string) => ReadonlyArray<string>;
  (commentText: string, tagName: string): ReadonlyArray<string>;
} = dual(2, (commentText: string, tagName: string): ReadonlyArray<string> => {
  const values: Array<string> = [];
  const pattern = new RegExp(`^\\s*${escapeRegExp(tagName)}\\b\\s*(.*)$`);

  for (const line of stripCommentFraming(commentText)) {
    const match = pattern.exec(line);
    if (match !== null) {
      A.appendInPlace(values, Str.trim(match[1] ?? ""));
    }
  }

  return values;
});

export const getDocNode = (node: Node): Node => {
  if (Node.isVariableDeclaration(node)) {
    return node.getVariableStatement() ?? node;
  }
  if (Node.isExportSpecifier(node)) {
    return node.getParent();
  }
  return node;
};

export const getJsDocText = (node: Node): string => {
  const docNode = getDocNode(node);
  if (Node.isJSDocable(docNode)) {
    const docs = docNode.getJsDocs();
    return docs.at(-1)?.getText() ?? "";
  }
  return "";
};

export const declarationKind = (node: Node): string => {
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
