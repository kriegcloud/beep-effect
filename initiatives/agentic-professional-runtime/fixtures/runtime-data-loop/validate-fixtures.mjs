import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const scenarios = ["law-patent-intake", "wealth-cash-request"];

const requiredJsonFiles = [
  "seed.json",
  "input.email.json",
  "expected.claims.json",
  "expected.tasks.json",
  "expected.drafts.json",
  "expected.approval-gates.json",
  "expected.context-packet.json"
];

const parseJson = async (filePath) => {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const extractSpanIds = (body) => {
  const matches = body.matchAll(/\[span:([a-z0-9-]+)]/g);
  return new Set(Array.from(matches, (match) => match[1]));
};

const collectSpanRefs = (value, refs = []) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectSpanRefs(item, refs);
    }
    return refs;
  }

  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key === "spanId" && typeof child === "string") {
        refs.push(child);
        continue;
      }

      if (key === "spanIds" && Array.isArray(child)) {
        for (const spanId of child) {
          if (typeof spanId === "string") {
            refs.push(spanId);
          }
        }
        continue;
      }

      if (key === "spanRefs" && Array.isArray(child)) {
        for (const spanRef of child) {
          if (spanRef && typeof spanRef === "object" && typeof spanRef.spanId === "string") {
            refs.push(spanRef.spanId);
          }
        }
        continue;
      }

      collectSpanRefs(child, refs);
    }
  }

  return refs;
};

for (const scenario of scenarios) {
  const scenarioRoot = join(root, scenario);
  const body = await readFile(join(scenarioRoot, "body.md"), "utf8");
  const spanIds = extractSpanIds(body);

  if (spanIds.size === 0) {
    throw new Error(`${scenario}: body.md does not define any spans`);
  }

  for (const fileName of requiredJsonFiles) {
    await parseJson(join(scenarioRoot, fileName));
  }

  for (const fileName of requiredJsonFiles.filter((fileName) => fileName.startsWith("expected."))) {
    const json = await parseJson(join(scenarioRoot, fileName));
    const refs = collectSpanRefs(json);
    const missing = refs.filter((spanId) => !spanIds.has(spanId));

    if (missing.length > 0) {
      throw new Error(`${scenario}/${fileName}: unknown span refs: ${missing.join(", ")}`);
    }
  }
}

console.log(`Validated ${scenarios.length} runtime data loop fixture scenarios.`);
