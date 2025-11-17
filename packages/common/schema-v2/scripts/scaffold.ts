import { access, mkdir, writeFile } from "node:fs/promises";
// @ts-expect-error
import path from "node:path";

import { fileURLToPath } from "node:url";

// @ts-expect-error
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(packageRoot, "src");

const directoryBlueprint = [
  "internal/builders",
  "internal/ids",
  "internal/regex",
  "internal/shared",
  "core/annotations",
  "core/generics",
  "core/extended",
  "core/utils",
  "primitives/string",
  "primitives/number",
  "primitives/network",
  "primitives/temporal",
  "primitives/binary",
  "primitives/misc",
  "identity/entity-id",
  "identity/columns",
  "derived/collections",
  "derived/kits",
  "builders/json-schema",
  "builders/form",
  "builders/introspection",
  "integrations/http",
  "integrations/config",
  "integrations/sql",
  "docs",
  "experimental/contract",
];

const fileBlueprint = [
  {
    relativePath: "index.ts",
    contents: `/**
 * Public surface for schema-v2.
 *
 * @since 0.0.1
 */
export * as Core from "./core";
export * as Primitives from "./primitives";
export * as Identity from "./identity";
export * as Derived from "./derived";
export * as Builders from "./builders";
export * as Integrations from "./integrations";

export const BS = {
  core: Core,
  primitives: Primitives,
  identity: Identity,
  derived: Derived,
  builders: Builders,
  integrations: Integrations,
} as const;
`,
  },
  {
    relativePath: "core/index.ts",
    contents: `/**
 * Core annotations, utilities, and shared helpers.
 *
 * @since 0.0.1
 */
export {};
`,
  },
  {
    relativePath: "primitives/index.ts",
    contents: `/**
 * Primitive schema placeholders (string, numbers, network types, etc).
 *
 * @since 0.0.1
 */
export {};
`,
  },
  {
    relativePath: "identity/index.ts",
    contents: `/**
 * Identity helpers (EntityId factories, columns, brands).
 *
 * @since 0.0.1
 */
export {};
`,
  },
  {
    relativePath: "derived/index.ts",
    contents: `/**
 * Derived kits and collection helpers.
 *
 * @since 0.0.1
 */
export {};
`,
  },
  {
    relativePath: "builders/index.ts",
    contents: `/**
 * JSON Schema, form, and introspection builders.
 *
 * @since 0.0.1
 */
export {};
`,
  },
  {
    relativePath: "integrations/index.ts",
    contents: `/**
 * Integration helpers (HTTP, SQL, CSP/config).
 *
 * @since 0.0.1
 */
export {};
`,
  },
  {
    relativePath: "docs/SCHEMA.md",
    contents: `# Schema v2 Notes

This document mirrors effect-smol's colocated design docs. Populate it with
decisions, invariants, and migration guides as modules move into schema-v2.
`,
  },
  {
    relativePath: "docs/primitives.md",
    contents: `# Primitive Schemas

Track naming conventions, annotations, and JSON Schema rules for primitive
schemas here during the migration.
`,
  },
];

const ensureDir = async (relativePath: string) => {
  const absolute = path.join(srcRoot, relativePath);
  await mkdir(absolute, { recursive: true });
  console.log(`[dir] ${path.relative(packageRoot, absolute)}`);
};

const ensureFile = async (relativePath: string, contents: string) => {
  const absolute = path.join(srcRoot, relativePath);
  try {
    await access(absolute);
    console.log(`[skip] ${path.relative(packageRoot, absolute)}`);
    return;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, contents);
  console.log(`[file] ${path.relative(packageRoot, absolute)}`);
};

const main = async () => {
  await Promise.all(directoryBlueprint.map((entry) => ensureDir(entry)));

  for (const file of fileBlueprint) {
    // Sequential writes provide easier-to-read logs for the created files.
    // eslint-disable-next-line no-await-in-loop
    await ensureFile(file.relativePath, file.contents);
  }
};
// @ts-expect-error
await main();
