#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  JSDOC3_TAGS,
  TSDOC_STANDARD_TAGS,
  TYPESCRIPT_JSDOC_TAGS,
  CLOSURE_TAGS,
  TYPEDOC_TAGS
} from "./canonical-tag-lists.ts";
import { JSDOC_TAG_DATABASE } from "./jsdoc-tags-database.ts";
import { HAS_JSDOC_TO_APPLICABLE_TO_MAP, APPLICABLE_TO_VALUES } from "./hasjsdoc-to-applicableto-map.ts";
import { SYNTAXKIND_JSDOC_TAG_MAP } from "./syntaxkind-jsdoc-tag-map.ts";
import { buildSourceTagSnapshot, SNAPSHOT_SCHEMA_VERSION } from "./extract-source-tags.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const parseArgs = (argv) => {
  let verifyLive = false;
  let snapshotPath = resolve(__dirname, "./source-tag-snapshots.json");

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--verify-live") {
      verifyLive = true;
      continue;
    }
    if (arg === "--snapshot") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("Missing value for --snapshot.");
      }
      snapshotPath = resolve(next);
      index += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log("Usage: bun validate-jsdoc-exhaustiveness.mjs [--snapshot <path>] [--verify-live]");
      process.exit(0);
    }
    throw new Error(`Unknown argument '${arg}'.`);
  }

  return { verifyLive, snapshotPath };
};

const lower = (s) => s.toLowerCase();
const stableSortedUnique = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b));

const setDifference = (left, right) => {
  const rightSet = new Set(right);
  return stableSortedUnique(left.filter((item) => !rightSet.has(item)));
};

const canonicalLists = {
  jsdoc3: [...JSDOC3_TAGS],
  tsdoc: [...TSDOC_STANDARD_TAGS],
  typescript: [...TYPESCRIPT_JSDOC_TAGS],
  closure: [...CLOSURE_TAGS],
  typedoc: [...TYPEDOC_TAGS]
};

const expectedCounts = {
  jsdoc3: 67,
  tsdoc: 25,
  typescript: 25,
  closure: 39,
  typedoc: 51
};

const requiredSpecsByCanonicalSource = {
  jsdoc3: {
    label: "jsdoc3",
    predicate: (specifications) => specifications.includes("jsdoc3")
  },
  tsdoc: {
    label: "tsdoc-*",
    predicate: (specifications) => specifications.some((spec) => spec.startsWith("tsdoc-"))
  },
  typescript: {
    label: "typescript",
    predicate: (specifications) => specifications.includes("typescript")
  },
  closure: {
    label: "closure",
    predicate: (specifications) => specifications.includes("closure")
  },
  typedoc: {
    label: "typedoc",
    predicate: (specifications) => specifications.includes("typedoc")
  }
};

const parseSnapshot = (snapshotPath, failures) => {
  try {
    const text = readFileSync(snapshotPath, "utf8");
    return JSON.parse(text);
  } catch (error) {
    failures.push(`Unable to read snapshot '${snapshotPath}': ${String(error)}`);
    return null;
  }
};

const validateSnapshotStructure = (snapshot, failures) => {
  if (!snapshot) {
    return;
  }
  if (snapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    failures.push(
      `Snapshot schema version mismatch: found=${String(snapshot.schemaVersion)}, expected=${String(SNAPSHOT_SCHEMA_VERSION)}.`
    );
  }
  if (!snapshot.sources || typeof snapshot.sources !== "object") {
    failures.push("Snapshot is missing top-level 'sources' object.");
    return;
  }

  for (const sourceName of Object.keys(canonicalLists)) {
    const source = snapshot.sources[sourceName];
    if (!source || typeof source !== "object") {
      failures.push(`Snapshot missing source entry '${sourceName}'.`);
      continue;
    }
    for (const field of ["url", "retrievedAt", "contentSha256", "rawTags", "normalizedTags", "normalizationRulesVersion", "extractionStrategy"]) {
      if (!(field in source)) {
        failures.push(`Snapshot source '${sourceName}' missing field '${field}'.`);
      }
    }
    if (!Array.isArray(source.rawTags)) {
      failures.push(`Snapshot source '${sourceName}' has non-array 'rawTags'.`);
    }
    if (!Array.isArray(source.normalizedTags)) {
      failures.push(`Snapshot source '${sourceName}' has non-array 'normalizedTags'.`);
    }
  }
};

const checkSnapshotCanonicalParity = (snapshot, failures) => {
  const coverage = {};

  if (!snapshot?.sources) {
    return coverage;
  }

  for (const [sourceName, canonicalTags] of Object.entries(canonicalLists)) {
    const snapshotSource = snapshot.sources[sourceName];
    if (!snapshotSource || !Array.isArray(snapshotSource.normalizedTags)) {
      continue;
    }

    const canonicalLower = stableSortedUnique(canonicalTags.map((tag) => lower(tag)));
    const snapshotLower = stableSortedUnique(snapshotSource.normalizedTags.map((tag) => lower(String(tag))));
    const canonicalMinusSnapshot = setDifference(canonicalLower, snapshotLower);
    const snapshotMinusCanonical = setDifference(snapshotLower, canonicalLower);

    if (canonicalMinusSnapshot.length > 0 || snapshotMinusCanonical.length > 0) {
      failures.push(
        `Snapshot parity mismatch for '${sourceName}': canonical-only=${canonicalMinusSnapshot.join(", ") || "<none>"}; snapshot-only=${snapshotMinusCanonical.join(", ") || "<none>"}.`
      );
    }

    const expected = expectedCounts[sourceName];
    if (canonicalTags.length !== expected) {
      failures.push(`Canonical list '${sourceName}' count mismatch: found=${canonicalTags.length}, expected=${expected}.`);
    }
    if (snapshotLower.length !== expected) {
      failures.push(`Snapshot list '${sourceName}' count mismatch: found=${snapshotLower.length}, expected=${expected}.`);
    }

    coverage[sourceName] = {
      total: expected,
      missing: canonicalMinusSnapshot.length,
      extra: snapshotMinusCanonical.length
    };
  }

  return coverage;
};

const checkLiveDrift = (snapshot, liveSnapshot, failures) => {
  const coverage = {};

  for (const sourceName of Object.keys(canonicalLists)) {
    const snapshotSource = snapshot?.sources?.[sourceName];
    const liveSource = liveSnapshot?.sources?.[sourceName];

    if (!snapshotSource || !liveSource) {
      failures.push(`Live drift check missing source '${sourceName}' in snapshot or live result.`);
      continue;
    }

    const snapshotTags = stableSortedUnique(snapshotSource.normalizedTags.map((tag) => lower(String(tag))));
    const liveTags = stableSortedUnique(liveSource.normalizedTags.map((tag) => lower(String(tag))));

    const snapshotMinusLive = setDifference(snapshotTags, liveTags);
    const liveMinusSnapshot = setDifference(liveTags, snapshotTags);

    if (snapshotMinusLive.length > 0 || liveMinusSnapshot.length > 0) {
      failures.push(
        `Live tag drift for '${sourceName}': snapshot-only=${snapshotMinusLive.join(", ") || "<none>"}; live-only=${liveMinusSnapshot.join(", ") || "<none>"}.`
      );
    }

    if (snapshotSource.contentSha256 !== liveSource.contentSha256) {
      failures.push(`Live content hash drift for '${sourceName}' detected.`);
    }

    if (sourceName === "typescript") {
      const snapshotAddenda = Array.isArray(snapshotSource.addendaSources) ? snapshotSource.addendaSources : [];
      const liveAddenda = Array.isArray(liveSource.addendaSources) ? liveSource.addendaSources : [];
      if (snapshotAddenda.length !== liveAddenda.length) {
        failures.push(`TypeScript addenda source count drift: snapshot=${snapshotAddenda.length}, live=${liveAddenda.length}.`);
      } else {
        for (let index = 0; index < snapshotAddenda.length; index += 1) {
          const left = snapshotAddenda[index];
          const right = liveAddenda[index];
          if (left.url !== right.url) {
            failures.push(`TypeScript addenda URL drift at index ${index}: snapshot='${left.url}', live='${right.url}'.`);
          }
          const leftTags = stableSortedUnique((left.normalizedTags ?? []).map((tag) => lower(String(tag))));
          const rightTags = stableSortedUnique((right.normalizedTags ?? []).map((tag) => lower(String(tag))));
          const leftMinusRight = setDifference(leftTags, rightTags);
          const rightMinusLeft = setDifference(rightTags, leftTags);
          if (leftMinusRight.length > 0 || rightMinusLeft.length > 0) {
            failures.push(
              `TypeScript addenda tag drift at index ${index}: snapshot-only=${leftMinusRight.join(", ") || "<none>"}; live-only=${rightMinusLeft.join(", ") || "<none>"}.`
            );
          }
          if (left.contentSha256 !== right.contentSha256) {
            failures.push(`TypeScript addenda content hash drift at index ${index}.`);
          }
        }
      }
    }

    coverage[sourceName] = {
      total: snapshotTags.length,
      missing: snapshotMinusLive.length,
      extra: liveMinusSnapshot.length
    };
  }

  return coverage;
};

const checkCoverage = (name, list, nameToCanonical, failures) => {
  const missing = list.filter((tag) => !nameToCanonical.has(lower(tag)));
  if (missing.length > 0) {
    failures.push(`${name} missing tags (${missing.length}): ${missing.join(", ")}`);
  }
  return { total: list.length, missing: missing.length };
};

const checkRequiredSpecification = (name, list, requirement, nameToCanonical, tagsByCanonical, failures) => {
  const missingSpecification = [];
  for (const rawTag of list) {
    const canonicalName = nameToCanonical.get(lower(rawTag));
    if (!canonicalName) {
      continue;
    }
    const canonicalDefinition = tagsByCanonical.get(canonicalName);
    if (!canonicalDefinition) {
      failures.push(`${name} canonical lookup failed for '${rawTag}' -> '${canonicalName}'.`);
      continue;
    }
    if (!requirement.predicate(canonicalDefinition.specifications)) {
      missingSpecification.push(`${rawTag}->${canonicalName}`);
    }
  }
  if (missingSpecification.length > 0) {
    failures.push(
      `${name} tags missing required specification '${requirement.label}' (${missingSpecification.length}): ${missingSpecification.join(", ")}`
    );
  }
  return { total: list.length, missing: missingSpecification.length };
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  /** @type {Array<string>} */
  const failures = [];
  /** @type {Array<string>} */
  const warnings = [];

  const snapshot = parseSnapshot(options.snapshotPath, failures);
  validateSnapshotStructure(snapshot, failures);
  const snapshotParityCoverage = checkSnapshotCanonicalParity(snapshot, failures);

  const tagsByCanonical = new Map(JSDOC_TAG_DATABASE.map((tag) => [tag._tag, tag]));

  const nameToCanonical = new Map();
  for (const tag of JSDOC_TAG_DATABASE) {
    const names = [tag._tag, ...tag.synonyms];
    for (const rawName of names) {
      const key = lower(rawName);
      const previous = nameToCanonical.get(key);
      if (previous && previous !== tag._tag) {
        failures.push(`Synonym collision: '${rawName}' resolves to both '${previous}' and '${tag._tag}'.`);
      } else {
        nameToCanonical.set(key, tag._tag);
      }
    }
  }

  const canonicalNames = JSDOC_TAG_DATABASE.map((tag) => tag._tag);
  const uniqueCanonicalNames = new Set(canonicalNames);
  if (uniqueCanonicalNames.size !== canonicalNames.length) {
    failures.push(`Duplicate _tag entries found (${canonicalNames.length - uniqueCanonicalNames.size} duplicates).`);
  }

  for (const entry of SYNTAXKIND_JSDOC_TAG_MAP) {
    if (entry.syntaxKind === 328) {
      continue;
    }
    if (entry.tags.length === 0) {
      failures.push(`SyntaxKind ${entry.syntaxKind} (${entry.node}) has no mapped tags.`);
      continue;
    }
    for (const mappedTag of entry.tags) {
      if (!nameToCanonical.has(lower(mappedTag))) {
        failures.push(`SyntaxKind ${entry.syntaxKind} (${entry.node}) maps to unknown tag '${mappedTag}'.`);
      }
    }
  }

  const hasJSDocFile = resolve(__dirname, "./typescript-hasjsdoc-type.ts");
  const hasJSDocText = readFileSync(hasJSDocFile, "utf8");
  const hasJSDocMembers = [...hasJSDocText.matchAll(/\|\s*([A-Za-z0-9_]+)\s*/g)].map((match) => match[1]);
  const hasJSDocUnique = [...new Set(hasJSDocMembers)];

  if (HAS_JSDOC_TO_APPLICABLE_TO_MAP.length !== hasJSDocUnique.length) {
    failures.push(`HasJSDoc mapping length mismatch: map=${HAS_JSDOC_TO_APPLICABLE_TO_MAP.length}, expected=${hasJSDocUnique.length}.`);
  }

  const mappedMembers = new Set();
  for (const entry of HAS_JSDOC_TO_APPLICABLE_TO_MAP) {
    if (mappedMembers.has(entry.member)) {
      failures.push(`Duplicate HasJSDoc mapping entry for '${entry.member}'.`);
    }
    mappedMembers.add(entry.member);
    if (entry.applicableTo === "any") {
      failures.push(`HasJSDoc member '${entry.member}' must not map to 'any'.`);
    }
    if (!APPLICABLE_TO_VALUES.includes(entry.applicableTo)) {
      failures.push(`HasJSDoc member '${entry.member}' maps to unknown ApplicableTo '${entry.applicableTo}'.`);
    }
  }

  for (const member of hasJSDocUnique) {
    if (!mappedMembers.has(member)) {
      failures.push(`Missing HasJSDoc mapping for '${member}'.`);
    }
  }

  const jsdocCoverage = checkCoverage("JSDoc3", canonicalLists.jsdoc3, nameToCanonical, failures);
  const tsdocCoverage = checkCoverage("TSDoc", canonicalLists.tsdoc, nameToCanonical, failures);
  const tsCoverage = checkCoverage("TypeScript", canonicalLists.typescript, nameToCanonical, failures);
  const closureCoverage = checkCoverage("Closure", canonicalLists.closure, nameToCanonical, failures);
  const typedocCoverage = checkCoverage("TypeDoc", canonicalLists.typedoc, nameToCanonical, failures);

  const jsdocSpecCoverage = checkRequiredSpecification(
    "JSDoc3",
    canonicalLists.jsdoc3,
    requiredSpecsByCanonicalSource.jsdoc3,
    nameToCanonical,
    tagsByCanonical,
    failures
  );
  const tsdocSpecCoverage = checkRequiredSpecification(
    "TSDoc",
    canonicalLists.tsdoc,
    requiredSpecsByCanonicalSource.tsdoc,
    nameToCanonical,
    tagsByCanonical,
    failures
  );
  const tsSpecCoverage = checkRequiredSpecification(
    "TypeScript",
    canonicalLists.typescript,
    requiredSpecsByCanonicalSource.typescript,
    nameToCanonical,
    tagsByCanonical,
    failures
  );
  const closureSpecCoverage = checkRequiredSpecification(
    "Closure",
    canonicalLists.closure,
    requiredSpecsByCanonicalSource.closure,
    nameToCanonical,
    tagsByCanonical,
    failures
  );
  const typedocSpecCoverage = checkRequiredSpecification(
    "TypeDoc",
    canonicalLists.typedoc,
    requiredSpecsByCanonicalSource.typedoc,
    nameToCanonical,
    tagsByCanonical,
    failures
  );

  const specs = [
    "jsdoc3",
    "tsdoc-core",
    "tsdoc-extended",
    "tsdoc-discretionary",
    "typescript",
    "closure",
    "api-extractor",
    "typedoc"
  ];

  for (const spec of specs) {
    const count = JSDOC_TAG_DATABASE.filter((tag) => tag.specifications.includes(spec)).length;
    if (count === 0) {
      failures.push(`Specification '${spec}' has no tag entries.`);
    }
  }

  const expectDerivability = {
    none: ["name", "deprecated", "see", "internal", "virtual", "link", "fires", "listens", "hideconstructor", "variation"],
    partial: [
      "throws",
      "param",
      "returns",
      "template",
      "typeParam",
      "type",
      "typedef",
      "callback",
      "class",
      "enum",
      "yields",
      "public",
      "readonly",
      "constant",
      "default",
      "defaultValue",
      "exports",
      "module",
      "namespace",
      "memberof",
      "member",
      "property",
      "function",
      "requires",
      "global",
      "inner",
      "instance",
      "kind",
      "overload"
    ]
  };

  for (const tagName of expectDerivability.none) {
    const tag = tagsByCanonical.get(tagName);
    if (!tag) {
      failures.push(`Guardrail tag missing from database: '${tagName}'.`);
      continue;
    }
    if (tag.astDerivable !== "none") {
      failures.push(`Guardrail mismatch: '${tagName}' must be 'none', found '${tag.astDerivable}'.`);
    }
  }

  for (const tagName of expectDerivability.partial) {
    const tag = tagsByCanonical.get(tagName);
    if (!tag) {
      failures.push(`Guardrail tag missing from database: '${tagName}'.`);
      continue;
    }
    if (tag.astDerivable !== "partial") {
      failures.push(`Guardrail mismatch: '${tagName}' must be 'partial', found '${tag.astDerivable}'.`);
    }
  }

  let liveParityCoverage = null;
  if (options.verifyLive) {
    const liveSnapshot = await buildSourceTagSnapshot();
    liveParityCoverage = checkLiveDrift(snapshot, liveSnapshot, failures);
  }

  const derivabilityCounts = JSDOC_TAG_DATABASE.reduce(
    (accumulator, tag) => {
      accumulator[tag.astDerivable] += 1;
      return accumulator;
    },
    /** @type {{ full: number; partial: number; none: number }} */ ({ full: 0, partial: 0, none: 0 })
  );

  console.log("JSDoc exhaustiveness audit\n");
  console.log(`- Snapshot: ${options.snapshotPath}`);
  console.log(`- Database tag count: ${JSDOC_TAG_DATABASE.length}`);
  console.log(`- SyntaxKind JSDoc tag mapping entries: ${SYNTAXKIND_JSDOC_TAG_MAP.length}`);
  console.log(`- HasJSDoc mapping: ${HAS_JSDOC_TO_APPLICABLE_TO_MAP.length}/${hasJSDocUnique.length}`);
  console.log(`- Coverage JSDoc3: ${jsdocCoverage.total - jsdocCoverage.missing}/${jsdocCoverage.total}`);
  console.log(`- Coverage TSDoc: ${tsdocCoverage.total - tsdocCoverage.missing}/${tsdocCoverage.total}`);
  console.log(`- Coverage TypeScript: ${tsCoverage.total - tsCoverage.missing}/${tsCoverage.total}`);
  console.log(`- Coverage Closure: ${closureCoverage.total - closureCoverage.missing}/${closureCoverage.total}`);
  console.log(`- Coverage TypeDoc: ${typedocCoverage.total - typedocCoverage.missing}/${typedocCoverage.total}`);
  console.log(`- Specification Attribution JSDoc3(jsdoc3): ${jsdocSpecCoverage.total - jsdocSpecCoverage.missing}/${jsdocSpecCoverage.total}`);
  console.log(`- Specification Attribution TSDoc(tsdoc-*): ${tsdocSpecCoverage.total - tsdocSpecCoverage.missing}/${tsdocSpecCoverage.total}`);
  console.log(`- Specification Attribution TypeScript(typescript): ${tsSpecCoverage.total - tsSpecCoverage.missing}/${tsSpecCoverage.total}`);
  console.log(`- Specification Attribution Closure(closure): ${closureSpecCoverage.total - closureSpecCoverage.missing}/${closureSpecCoverage.total}`);
  console.log(`- Specification Attribution TypeDoc(typedoc): ${typedocSpecCoverage.total - typedocSpecCoverage.missing}/${typedocSpecCoverage.total}`);
  console.log(
    `- Snapshot Parity JSDoc3: ${(snapshotParityCoverage.jsdoc3?.total ?? 0) - (snapshotParityCoverage.jsdoc3?.missing ?? 0)}/${snapshotParityCoverage.jsdoc3?.total ?? 0}`
  );
  console.log(
    `- Snapshot Parity TSDoc: ${(snapshotParityCoverage.tsdoc?.total ?? 0) - (snapshotParityCoverage.tsdoc?.missing ?? 0)}/${snapshotParityCoverage.tsdoc?.total ?? 0}`
  );
  console.log(
    `- Snapshot Parity TypeScript: ${(snapshotParityCoverage.typescript?.total ?? 0) - (snapshotParityCoverage.typescript?.missing ?? 0)}/${snapshotParityCoverage.typescript?.total ?? 0}`
  );
  console.log(
    `- Snapshot Parity Closure: ${(snapshotParityCoverage.closure?.total ?? 0) - (snapshotParityCoverage.closure?.missing ?? 0)}/${snapshotParityCoverage.closure?.total ?? 0}`
  );
  console.log(
    `- Snapshot Parity TypeDoc: ${(snapshotParityCoverage.typedoc?.total ?? 0) - (snapshotParityCoverage.typedoc?.missing ?? 0)}/${snapshotParityCoverage.typedoc?.total ?? 0}`
  );

  if (options.verifyLive && liveParityCoverage) {
    console.log(
      `- Live Drift Check JSDoc3: ${(liveParityCoverage.jsdoc3?.total ?? 0) - (liveParityCoverage.jsdoc3?.missing ?? 0)}/${liveParityCoverage.jsdoc3?.total ?? 0}`
    );
    console.log(
      `- Live Drift Check TSDoc: ${(liveParityCoverage.tsdoc?.total ?? 0) - (liveParityCoverage.tsdoc?.missing ?? 0)}/${liveParityCoverage.tsdoc?.total ?? 0}`
    );
    console.log(
      `- Live Drift Check TypeScript: ${(liveParityCoverage.typescript?.total ?? 0) - (liveParityCoverage.typescript?.missing ?? 0)}/${liveParityCoverage.typescript?.total ?? 0}`
    );
    console.log(
      `- Live Drift Check Closure: ${(liveParityCoverage.closure?.total ?? 0) - (liveParityCoverage.closure?.missing ?? 0)}/${liveParityCoverage.closure?.total ?? 0}`
    );
    console.log(
      `- Live Drift Check TypeDoc: ${(liveParityCoverage.typedoc?.total ?? 0) - (liveParityCoverage.typedoc?.missing ?? 0)}/${liveParityCoverage.typedoc?.total ?? 0}`
    );
  }

  console.log(`- astDerivable counts: full=${derivabilityCounts.full}, partial=${derivabilityCounts.partial}, none=${derivabilityCounts.none}`);

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
  }

  if (failures.length > 0) {
    console.error("\nFAILURES:");
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  console.log("\nPASS: 100% exhaustive baseline and parity checks passed.");
};

await main();
