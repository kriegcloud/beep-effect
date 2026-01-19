#!/usr/bin/env bun
import { readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const BASE = "/home/elpresidank/YeeBois/projects/beep-effect";

function findPackagesRecursive(dir: string): string[] {
  const packages: string[] = [];

  try {
    const entries = readdirSync(dir);

    // Check if current dir has package.json
    if (entries.includes("package.json")) {
      packages.push(dir);
    }

    // Recursively search subdirectories
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory() && entry !== "node_modules" && entry !== ".git" && entry !== "dist" && entry !== "build") {
          packages.push(...findPackagesRecursive(fullPath));
        }
      } catch (e) {
        // Skip inaccessible directories
      }
    }
  } catch (e) {
    // Skip inaccessible directories
  }

  return packages;
}

const packagesDir = join(BASE, "packages");
const appsDir = join(BASE, "apps");
const toolingDir = join(BASE, "tooling");

const allPackages = [
  ...findPackagesRecursive(packagesDir),
  ...findPackagesRecursive(appsDir),
  ...findPackagesRecursive(toolingDir),
];

const missingAgentsMd: string[] = [];
const missingReadme: string[] = [];

for (const pkg of allPackages) {
  const agentsMd = join(pkg, "AGENTS.md");
  const readme = join(pkg, "README.md");

  if (!existsSync(agentsMd)) {
    missingAgentsMd.push(pkg.replace(BASE + "/", ""));
  }

  if (!existsSync(readme)) {
    missingReadme.push(pkg.replace(BASE + "/", ""));
  }
}

console.log("## Missing AGENTS.md Files\n");
if (missingAgentsMd.length === 0) {
  console.log("None - all packages have AGENTS.md files!\n");
} else {
  missingAgentsMd.forEach(pkg => console.log(`- ${pkg}`));
  console.log();
}

console.log("## Missing README.md Files\n");
if (missingReadme.length === 0) {
  console.log("None - all packages have README.md files!\n");
} else {
  missingReadme.forEach(pkg => console.log(`- ${pkg}`));
  console.log();
}

console.log(`\n## Summary`);
console.log(`- Total packages found: ${allPackages.length}`);
console.log(`- Missing AGENTS.md: ${missingAgentsMd.length}`);
console.log(`- Missing README.md: ${missingReadme.length}`);
