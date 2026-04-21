#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const SNAPSHOT_SCHEMA_VERSION = 1;
export const NORMALIZATION_RULES_VERSION = "2026-03-01-v1";

export const SOURCE_URLS = {
  jsdoc3: "https://jsdoc.app/index.html",
  tsdoc: "https://tsdoc.org/pages/tags/alpha/",
  typescript: "https://raw.githubusercontent.com/microsoft/TypeScript-Website/v2/packages/documentation/copy/en/javascript/JSDoc%20Reference.md",
  closure: "https://raw.githubusercontent.com/wiki/google/closure-compiler/Annotating-JavaScript-for-the-Closure-Compiler.md",
  typedoc: "https://typedoc.org/documents/Tags.html"
};

export const TYPESCRIPT_ADDENDA_SOURCES = [
  {
    url: "https://raw.githubusercontent.com/microsoft/TypeScript-Website/v2/packages/documentation/copy/en/release-notes/TypeScript%205.0.md",
    tags: ["overload"],
    rationale: "TypeScript 5.0 introduced @overload for JSDoc overload docs in .js files."
  }
];

const stableSortedUnique = (values) => [...new Set(values.map((value) => String(value)))].sort((a, b) => a.localeCompare(b));
const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");

const fetchText = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch '${url}' (status ${response.status}).`);
  }
  return response.text();
};

const extractJSDocTags = (html) => {
  const rawTags = [];
  for (const match of html.matchAll(/href="\/tags-([a-z0-9-]+)"/g)) {
    rawTags.push(match[1]);
  }
  const normalizedTags = rawTags.map((tag) => {
    if (tag === "inline-link") {
      return "link";
    }
    if (tag === "inline-tutorial") {
      return "tutorial";
    }
    return tag;
  });
  return {
    rawTags: stableSortedUnique(rawTags),
    normalizedTags: stableSortedUnique(normalizedTags),
    extractionStrategy: "Parse /tags-* links from jsdoc index and normalize inline pages (inline-link->link, inline-tutorial->tutorial)."
  };
};

const extractTSDocTags = (html) => {
  const slugToTag = {
    defaultvalue: "defaultValue",
    eventproperty: "eventProperty",
    inheritdoc: "inheritDoc",
    packagedocumentation: "packageDocumentation",
    privateremarks: "privateRemarks",
    typeparam: "typeParam"
  };
  const rawTags = [];
  for (const match of html.matchAll(/href="\/pages\/tags\/([a-z0-9]+)\//g)) {
    rawTags.push(match[1]);
  }
  const normalizedTags = rawTags.map((slug) => slugToTag[slug] ?? slug);
  return {
    rawTags: stableSortedUnique(rawTags),
    normalizedTags: stableSortedUnique(normalizedTags),
    extractionStrategy: "Parse /pages/tags/* sidebar links from TSDoc alpha page and normalize known slug casing."
  };
};

const extractTypeScriptPrimaryListTags = (markdown) => {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.trim() === "#### Types");
  const end = lines.findIndex((line, index) => index > start && line.startsWith("The meaning is usually"));
  if (start < 0 || end < 0 || end <= start) {
    throw new Error("Unable to locate TypeScript JSDoc Reference list section.");
  }

  const rawTags = [];
  for (const line of lines.slice(start, end)) {
    if (!line.trim().startsWith("- ")) {
      continue;
    }
    for (const match of line.matchAll(/`@([A-Za-z][A-Za-z0-9_]*)`/g)) {
      rawTags.push(match[1]);
    }
  }

  const aliasToCanonical = {
    arg: "param",
    argument: "param",
    return: "returns"
  };
  const normalizedTags = rawTags.map((tag) =>
    Object.prototype.hasOwnProperty.call(aliasToCanonical, tag) ? aliasToCanonical[tag] : tag
  );

  return {
    rawTags,
    normalizedTags,
    extractionStrategy:
      "Parse list-item tags from the TypeScript JSDoc Reference Types/Classes/Documentation/Other sections; normalize aliases arg|argument->param and return->returns."
  };
};

const extractClosureTags = (markdown) => {
  const rawTags = [];
  for (const line of markdown.split("\n")) {
    if (!line.startsWith("### `@")) {
      continue;
    }
    const match = line.match(/@([A-Za-z][A-Za-z0-9_]*)/);
    if (match) {
      rawTags.push(match[1]);
    }
  }
  return {
    rawTags: stableSortedUnique(rawTags),
    normalizedTags: stableSortedUnique(rawTags),
    extractionStrategy: "Parse first tag token from each Closure heading formatted as ### `@tag`..."
  };
};

const extractTypeDocTags = (html) => {
  const rawTags = [];
  for (const match of html.matchAll(/href=\"Tags\._([A-Za-z][A-Za-z0-9_]*)\.html(?:#[^\"]*)?\"/g)) {
    rawTags.push(match[1]);
  }
  return {
    rawTags: stableSortedUnique(rawTags),
    normalizedTags: stableSortedUnique(rawTags),
    extractionStrategy: "Parse canonical TypeDoc _tag pages from Tags._*.html links in Tags.html."
  };
};

/**
 * Build the full source-tag snapshot from authoritative upstream sources.
 */
export const buildSourceTagSnapshot = async () => {
  const generatedAt = new Date().toISOString();

  const jsdocContent = await fetchText(SOURCE_URLS.jsdoc3);
  const tsdocContent = await fetchText(SOURCE_URLS.tsdoc);
  const typeScriptPrimaryContent = await fetchText(SOURCE_URLS.typescript);
  const closureContent = await fetchText(SOURCE_URLS.closure);
  const typeDocContent = await fetchText(SOURCE_URLS.typedoc);

  const jsdoc = extractJSDocTags(jsdocContent);
  const tsdoc = extractTSDocTags(tsdocContent);
  const typeScriptPrimary = extractTypeScriptPrimaryListTags(typeScriptPrimaryContent);
  const closure = extractClosureTags(closureContent);
  const typeDoc = extractTypeDocTags(typeDocContent);

  const addendaSources = [];
  const addendaRawTags = [];
  const addendaNormalizedTags = [];
  for (const addendum of TYPESCRIPT_ADDENDA_SOURCES) {
    const addendumContent = await fetchText(addendum.url);
    const contentSha = sha256(addendumContent);
    addendaSources.push({
      url: addendum.url,
      retrievedAt: generatedAt,
      contentSha256: contentSha,
      rawTags: stableSortedUnique(addendum.tags),
      normalizedTags: stableSortedUnique(addendum.tags),
      rationale: addendum.rationale
    });
    addendaRawTags.push(...addendum.tags);
    addendaNormalizedTags.push(...addendum.tags);
  }

  const typeScriptRaw = stableSortedUnique([...typeScriptPrimary.rawTags, ...addendaRawTags]);
  const typeScriptNormalized = stableSortedUnique([...typeScriptPrimary.normalizedTags, ...addendaNormalizedTags]);

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    generatedAt,
    normalizationRulesVersion: NORMALIZATION_RULES_VERSION,
    sources: {
      jsdoc3: {
        url: SOURCE_URLS.jsdoc3,
        retrievedAt: generatedAt,
        contentSha256: sha256(jsdocContent),
        rawTags: jsdoc.rawTags,
        normalizedTags: jsdoc.normalizedTags,
        normalizationRulesVersion: NORMALIZATION_RULES_VERSION,
        extractionStrategy: jsdoc.extractionStrategy
      },
      tsdoc: {
        url: SOURCE_URLS.tsdoc,
        retrievedAt: generatedAt,
        contentSha256: sha256(tsdocContent),
        rawTags: tsdoc.rawTags,
        normalizedTags: tsdoc.normalizedTags,
        normalizationRulesVersion: NORMALIZATION_RULES_VERSION,
        extractionStrategy: tsdoc.extractionStrategy
      },
      typescript: {
        url: SOURCE_URLS.typescript,
        retrievedAt: generatedAt,
        contentSha256: sha256(typeScriptPrimaryContent),
        rawTags: typeScriptRaw,
        normalizedTags: typeScriptNormalized,
        normalizationRulesVersion: NORMALIZATION_RULES_VERSION,
        extractionStrategy: `${typeScriptPrimary.extractionStrategy} + explicit addenda tags from release notes.`,
        addendaSources
      },
      closure: {
        url: SOURCE_URLS.closure,
        retrievedAt: generatedAt,
        contentSha256: sha256(closureContent),
        rawTags: closure.rawTags,
        normalizedTags: closure.normalizedTags,
        normalizationRulesVersion: NORMALIZATION_RULES_VERSION,
        extractionStrategy: closure.extractionStrategy
      },
      typedoc: {
        url: SOURCE_URLS.typedoc,
        retrievedAt: generatedAt,
        contentSha256: sha256(typeDocContent),
        rawTags: typeDoc.rawTags,
        normalizedTags: typeDoc.normalizedTags,
        normalizationRulesVersion: NORMALIZATION_RULES_VERSION,
        extractionStrategy: typeDoc.extractionStrategy
      }
    }
  };
};

const parseCliArgs = (argv) => {
  const defaultOutputPath = resolve(__dirname, "./source-tag-snapshots.json");
  let outputPath = defaultOutputPath;
  let writeOutput = true;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--output") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --output.");
      }
      outputPath = resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--stdout") {
      writeOutput = false;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log("Usage: bun extract-source-tags.mjs [--output <path>] [--stdout]");
      process.exit(0);
    }
    throw new Error(`Unknown argument '${arg}'.`);
  }

  return { outputPath, writeOutput };
};

const maybeRunAsCli = async () => {
  const selfPath = fileURLToPath(import.meta.url);
  const processPath = process.argv[1] ? resolve(process.argv[1]) : "";
  if (selfPath !== processPath) {
    return;
  }

  const { outputPath, writeOutput } = parseCliArgs(process.argv.slice(2));
  const snapshot = await buildSourceTagSnapshot();
  const json = `${JSON.stringify(snapshot, null, 2)}\n`;

  if (writeOutput) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, json, "utf8");
    console.log(`Wrote snapshot: ${outputPath}`);
    return;
  }

  process.stdout.write(json);
};

await maybeRunAsCli();
