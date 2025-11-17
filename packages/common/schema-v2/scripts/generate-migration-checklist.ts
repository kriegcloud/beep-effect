import { promises as fs } from "node:fs";
// @ts-expect-error
import path from "node:path";
// @ts-expect-error
import ts from "typescript";

const projectRoot = "/home/elpresidank/YeeBois/projects/beep-effect";
const sourceRoot = path.join(projectRoot, "packages/common/schema/src");
const schemaV2Root = path.join(projectRoot, "packages/common/schema-v2");
const outputFile = path.join(schemaV2Root, "MIGRATION_CHECKLIST.md");

type Entry = {
  readonly oldPath: string;
  readonly newRelativePath: string;
  readonly exportNames: ReadonlyArray<string>;
  readonly milestoneId: string;
};

type Milestone = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
};

const milestoneOrder: ReadonlyArray<Milestone> = [
  {
    id: "foundation",
    title: "Milestone 1 – Core Foundations",
    description:
      "Annotations, generics, utilities, variance, types, and regex catalogs required by every other module.",
  },
  {
    id: "primitives-text",
    title: "Milestone 2 – Primitives: Text & Formats",
    description: "Email, domains, semantics, slugs, UUIDs, and other string-centric schemas.",
  },
  {
    id: "primitives-structure",
    title: "Milestone 3 – Primitives: Collections & Scalar Types",
    description:
      "Arrays, buffers, numbers, booleans, durations, JSON helpers, nullable kits, and Fn/Transform utilities.",
  },
  {
    id: "primitives-geo",
    title: "Milestone 4 – Primitives: Network, Locale & Location",
    description: "Network/location schemas (IP, URL paths, postal codes) plus locale/person helpers.",
  },
  {
    id: "identity-derived",
    title: "Milestone 5 – Identity & Derived Kits",
    description: "EntityId factories, derived collection helpers, and kit builders.",
  },
  {
    id: "builders",
    title: "Milestone 6 – Builders & Schema System",
    description: "Form builders, JSON Schema derivation, and schema-system introspection utilities.",
  },
  {
    id: "integrations",
    title: "Milestone 7 – Integrations & Contracts",
    description: "Config/CSP, HTTP helpers, SQL annotations, and experimental contract glue.",
  },
  {
    id: "surface",
    title: "Milestone 8 – Namespace & Entry Points",
    description: "index.ts namespace, BS export surface, and other barrels that stitch the package together.",
  },
  {
    id: "backlog",
    title: "Milestone 9 – Review Backlog",
    description: "Anything the script could not categorize—triage manually before migration.",
  },
];

const isTsFile = (entry: string) => entry.endsWith(".ts");

const toKebab = (value: string) =>
  value
    .replace(/\.schema$/i, "")
    .replace(/\.schemas$/i, "")
    .replace(/\./g, "-")
    .replace(/_/g, "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/-{2,}/g, "-")
    .toLowerCase();

const normalizeFileName = (segment: string) => {
  const withoutExt = segment.replace(/\.ts$/i, "");
  const normalized = toKebab(withoutExt);
  if (normalized === "index") {
    return "index.ts";
  }
  return `${normalized}.ts`;
};

const normalizeDirSegments = (segments: ReadonlyArray<string>) => segments.map((segment) => toKebab(segment));

const convertRest = (segments: ReadonlyArray<string>) => {
  if (segments.length === 0) {
    return "index.ts";
  }
  if (segments.length === 1) {
    return normalizeFileName(segments[0] ?? "index.ts");
  }
  const dirSegments = normalizeDirSegments(segments.slice(0, -1));
  const fileName = normalizeFileName(segments[segments.length - 1] ?? "index.ts");
  return path.join(...dirSegments, fileName);
};

const customFileTargets: Record<string, string> = {
  array: "derived/collections",
  "array-buffer": "primitives/binary",
  bool: "primitives/misc",
  "currency-code": "primitives/string",
  domain: "primitives/network",
  duration: "primitives/temporal",
  email: "primitives/string",
  "file-extension": "primitives/string",
  graph: "derived/collections",
  hex: "primitives/string",
  ip: "primitives/network",
  json: "primitives/misc",
  literal: "derived/kits",
  "mime-type": "primitives/network",
  "name-attribute": "primitives/string",
  nullables: "derived/kits",
  number: "primitives/number",
  password: "primitives/string",
  "pg-serial": "integrations/sql",
  phone: "primitives/string",
  regex: "internal/regex",
  rgb: "primitives/string",
  "semantic-version": "primitives/string",
  slug: "primitives/string",
  string: "primitives/string",
  transformations: "derived/kits",
  "uint8-array": "primitives/binary",
  url: "primitives/network",
  "url-path": "primitives/network",
  uuid: "identity/entity-id",
};

const mapCustomPath = (segments: ReadonlyArray<string>) => {
  const [first, ...rest] = segments;
  if (!first) {
    return "primitives/index.ts";
  }

  const normalizedFirst = toKebab(first.replace(/\.ts$/i, ""));

  if (normalizedFirst === "dates") {
    return path.join("primitives/temporal/dates", convertRest(rest));
  }
  if (normalizedFirst === "fn") {
    return path.join("primitives/misc/fn", convertRest(rest));
  }
  if (normalizedFirst === "locales") {
    return path.join("primitives/misc/locales", convertRest(rest));
  }
  if (normalizedFirst === "location") {
    return path.join("primitives/network/location", convertRest(rest));
  }
  if (normalizedFirst === "person") {
    return path.join("primitives/misc/person", convertRest(rest));
  }

  const base = toKebab(first.replace(/\.ts$/i, "").replace(/\.schema(s)?$/i, ""));
  const targetDir = customFileTargets[base];
  if (targetDir) {
    const fileName = normalizeFileName(`${base}.ts`);
    return path.join(targetDir, fileName);
  }

  return path.join("primitives/misc", convertRest([first, ...rest]));
};

const mapPath = (relativePath: string) => {
  const segments = relativePath.split(path.sep);
  const [top, ...rest] = segments;
  const normalizedTop = top?.toLowerCase() ?? "";

  switch (normalizedTop) {
    case "annotations":
      return path.join("core/annotations", convertRest(rest));
    case "annotations.ts":
      return "core/annotations/index.ts";
    case "config":
      return path.join("integrations/config", convertRest(rest));
    case "config.ts":
      return "integrations/config/index.ts";
    case "custom":
      return mapCustomPath(rest);
    case "custom.ts":
      return "primitives/index.ts";
    case "entityid":
      return path.join("identity/entity-id", convertRest(rest));
    case "extended-schemas.ts":
      return "core/extended/extended-schemas.ts";
    case "form":
      return path.join("builders/form", convertRest(rest));
    case "form.ts":
      return "builders/form/index.ts";
    case "generics":
      return path.join("core/generics", convertRest(rest));
    case "generics.ts":
      return "core/generics/index.ts";
    case "http":
      return path.join("integrations/http", convertRest(rest));
    case "jsonschema.ts":
      return "builders/json-schema/index.ts";
    case "kits":
      return path.join("derived/kits", convertRest(rest));
    case "kits.ts":
      return "derived/kits/index.ts";
    case "regexes.ts":
      return "internal/regex/regexes.ts";
    case "schema-system":
      return path.join("builders/introspection", convertRest(rest));
    case "schema-system.ts":
      return "builders/introspection/index.ts";
    case "sql":
      return path.join("integrations/sql", convertRest(rest));
    case "sql.ts":
      return "integrations/sql/index.ts";
    case "types.ts":
      return "core/types.ts";
    case "utils":
      return path.join("core/utils", convertRest(rest));
    case "utils.ts":
      return "core/utils/index.ts";
    case "variance.ts":
      return "core/variance.ts";
    case "index.ts":
      return "index.ts";
    case "schema.ts":
      return "schema.ts";
    case "contract":
      return path.join("experimental/contract", convertRest(rest));
    default:
      if (relativePath === "JsonSchema.ts") {
        return "builders/json-schema/index.ts";
      }
      if (relativePath === "extended-schemas.ts") {
        return "core/extended/extended-schemas.ts";
      }
      if (relativePath === "regexes.ts") {
        return "internal/regex/regexes.ts";
      }
      if (relativePath === "types.ts") {
        return "core/types.ts";
      }
      if (relativePath === "variance.ts") {
        return "core/variance.ts";
      }
      return path.join("backlog", convertRest(segments));
  }
};

const determineMilestone = (newRelativePath: string) => {
  const normalized = newRelativePath.toLowerCase();
  if (normalized.startsWith("core/") || normalized.startsWith("internal/")) {
    return "foundation";
  }
  if (normalized.startsWith("primitives/string")) {
    return "primitives-text";
  }
  const isLocale = normalized.startsWith("primitives/misc/locales");
  const isPerson = normalized.startsWith("primitives/misc/person");
  if (
    normalized.startsWith("primitives/temporal") ||
    normalized.startsWith("primitives/number") ||
    normalized.startsWith("primitives/binary") ||
    normalized.startsWith("primitives/misc/fn") ||
    (normalized.startsWith("primitives/misc") && !isLocale && !isPerson)
  ) {
    return "primitives-structure";
  }
  if (normalized.startsWith("primitives/network") || isLocale || isPerson) {
    return "primitives-geo";
  }
  if (normalized.startsWith("identity/") || normalized.startsWith("derived/")) {
    return "identity-derived";
  }
  if (normalized.startsWith("builders/")) {
    return "builders";
  }
  if (normalized.startsWith("integrations/") || normalized.startsWith("experimental/")) {
    return "integrations";
  }
  if (normalized === "index.ts" || normalized === "schema.ts" || normalized.startsWith("primitives/index")) {
    return "surface";
  }
  return "backlog";
};

const getOldImportPath = (relativePath: string) => `@beep/schema/${relativePath.replace(/\.ts$/, "")}`;
const getNewDisplayPath = (relativePath: string) => `packages/common/schema-v2/src/${relativePath}`.replace(/\\/g, "/");

const collectExports = (filePath: string) => {
  const content = ts.sys.readFile(filePath);
  if (!content) {
    return [];
  }
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const exportNames = new Set<string>();

  const hasExportModifier = (node: ts.Node) =>
    Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));

  const recordName = (name: ts.BindingName | undefined) => {
    if (!name || !ts.isIdentifier(name)) {
      return;
    }
    exportNames.add(name.text);
  };

  const visit = (node: ts.Node) => {
    if (ts.isVariableStatement(node) && hasExportModifier(node)) {
      node.declarationList.declarations.forEach((declaration) => recordName(declaration.name));
    } else if (ts.isFunctionDeclaration(node) && hasExportModifier(node) && node.name) {
      recordName(node.name);
    } else if (ts.isClassDeclaration(node) && hasExportModifier(node) && node.name) {
      recordName(node.name);
    } else if (ts.isInterfaceDeclaration(node) && hasExportModifier(node)) {
      recordName(node.name);
    } else if (ts.isTypeAliasDeclaration(node) && hasExportModifier(node)) {
      recordName(node.name);
    } else if (ts.isEnumDeclaration(node) && hasExportModifier(node)) {
      recordName(node.name);
    } else if (ts.isModuleDeclaration(node) && hasExportModifier(node)) {
      recordName(node.name as ts.Identifier);
    } else if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamespaceExport(node.exportClause)) {
      recordName(node.exportClause.name);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return Array.from(exportNames).sort();
};

const walkFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath)));
    } else if (entry.isFile() && isTsFile(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
};

const formatEntrySection = (entry: Entry) => {
  const header = `### \`${getOldImportPath(entry.oldPath)}\` → \`${getNewDisplayPath(entry.newRelativePath)}\``;
  const checklist = entry.exportNames.map((name) => `- [ ] \`${name}\``).join("\n");
  return `${header}\n${checklist}`;
};

const buildPromptBlock = (milestone: Milestone, entries: ReadonlyArray<Entry>) => {
  const moduleList = entries
    .map((entry) => `- \`${getOldImportPath(entry.oldPath)}\` → \`${getNewDisplayPath(entry.newRelativePath)}\``)
    .join("\n");
  return `### ${milestone.title}\n\`\`\`text\nYou are migrating ${milestone.title} for @beep/schema → schema-v2.\nScope:\n${moduleList}\n\nInstructions:\n1. Move each module into the target path, preserving annotations, brands, and tests.\n2. Mirror namespace exports under the new structured BS surface (core/primitives/identity/etc.).\n3. Update or add tests/docs if schemas change; follow Effect collection/string guardrails outlined in AGENTS.md.\n4. Run \`bun run docs:lint\` (or \`bun run docs:lint:file -- <relative-path>\`) and review \`jsdoc-analysis-results.json\` before marking items complete.\n5. Run \`bun run docgen\` to refresh \`packages/common/schema-v2/docs\`; follow up with \`bun run docs:site\` if the published docs need to sync into \`docs/schema-v2\`.\n6. Mark the corresponding checkboxes in MIGRATION_CHECKLIST.md when each symbol is migrated.\n7. Keep changes focused on this milestone; do not touch modules outside the listed scope.\n\`\`\``;
};

const main = async () => {
  const files = await walkFiles(sourceRoot);
  const entries: Entry[] = [];

  for (const filePath of files) {
    const relativePath = path.relative(sourceRoot, filePath).replace(/\\/g, "/");
    const exportNames = collectExports(filePath);
    if (!exportNames.length) {
      continue;
    }
    const newRelativePath = mapPath(relativePath);
    const milestoneId = determineMilestone(newRelativePath);
    entries.push({
      oldPath: relativePath,
      newRelativePath,
      exportNames,
      milestoneId,
    });
  }

  entries.sort((a, b) => a.oldPath.localeCompare(b.oldPath));

  const buckets = new Map<string, Entry[]>();
  milestoneOrder.forEach((milestone) => buckets.set(milestone.id, []));
  entries.forEach((entry) => {
    const bucket = buckets.get(entry.milestoneId);
    if (bucket) {
      bucket.push(entry);
    } else {
      buckets.set(entry.milestoneId, [entry]);
    }
  });

  const intro = `# Schema v2 Migration Checklist

Use this checklist to coordinate the incremental migration from \`@beep/schema\` into the schema-v2 layout.
Modules are grouped into milestone-sized chunks so multiple agents can work in parallel without overlapping context.
`;

  const overview = milestoneOrder
    .map((milestone) => `- [${milestone.title}](#${milestone.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")})`)
    .join("\n");

  const milestoneSections = milestoneOrder.map((milestone) => {
    const bucketEntries = (buckets.get(milestone.id) ?? []).sort((a, b) => a.oldPath.localeCompare(b.oldPath));
    if (!bucketEntries.length) {
      return `## ${milestone.title}\n${milestone.description}\n\n_No modules assigned yet._`;
    }
    const entrySections = bucketEntries.map(formatEntrySection).join("\n\n");
    return `## ${milestone.title}\n${milestone.description}\n\n${entrySections}`;
  });

  const promptBlocks = milestoneOrder
    .filter((milestone) => (buckets.get(milestone.id) ?? []).length > 0)
    .map((milestone) => buildPromptBlock(milestone, buckets.get(milestone.id) ?? []));

  const promptsSection = `## Agent Prompts\n${promptBlocks.join("\n\n")}`;

  const fileContents = [intro, "## Milestone Overview", overview, ...milestoneSections, promptsSection].join("\n\n");

  await fs.writeFile(outputFile, `${fileContents}\n`);
};

// @ts-expect-error
await main();
