#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const strict = process.argv.includes("--strict");
const manifestPath = path.resolve(process.cwd(), ".beep/manifests/managed-files.json");

if (!fs.existsSync(manifestPath)) {
  console.log(`[agents-check] manifest missing: ${manifestPath}`);
  process.exit(strict ? 1 : 0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const files = Array.isArray(manifest.files) ? manifest.files : [];
const agentPaths = files
  .map((file) => file.path)
  .filter((value) => typeof value === "string" && value.endsWith("AGENTS.md"));

const missing = agentPaths.filter((relativePath) => !fs.existsSync(path.resolve(process.cwd(), relativePath)));

console.log(`[agents-check] expected=${agentPaths.length} missing=${missing.length}`);
for (const relativePath of missing) {
  console.log(`  - ${relativePath}`);
}

if (strict && missing.length > 0) {
  process.exit(1);
}
