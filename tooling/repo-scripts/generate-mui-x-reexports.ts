#!/usr/bin/env bun
/**
 * Script to generate re-export files for @mui/x-data-grid and @mui/x-date-pickers
 * Each top-level directory in those packages gets a corresponding .ts file that re-exports the module.
 */

import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = join(import.meta.dir, "../../");
const NODE_MODULES = join(ROOT, "node_modules");
const MUI_PACKAGE_DIR = join(ROOT, "packages/ui/mui/src");

interface PackageConfig {
  source: string;
  target: string;
  packageName: string;
}

const packages: PackageConfig[] = [
  {
    source: join(NODE_MODULES, "@mui/x-data-grid"),
    target: join(MUI_PACKAGE_DIR, "x-data-grid"),
    packageName: "@mui/x-data-grid",
  },
  {
    source: join(NODE_MODULES, "@mui/x-date-pickers"),
    target: join(MUI_PACKAGE_DIR, "x-date-pickers"),
    packageName: "@mui/x-date-pickers",
  },
];

function getDirectories(sourcePath: string): string[] {
  const entries = readdirSync(sourcePath);
  return entries.filter((entry) => {
    const fullPath = join(sourcePath, entry);
    try {
      const stat = statSync(fullPath);
      // Skip esm directory and non-directories
      return stat.isDirectory() && entry !== "esm";
    } catch {
      return false;
    }
  });
}

function generateReExportContent(packageName: string, moduleName: string): string {
  return `export { default } from "${packageName}/${moduleName}";
export * from "${packageName}/${moduleName}";
`;
}

function generateIndexContent(packageName: string, modules: string[]): string {
  const exports = modules.map((mod) => `export * from "${packageName}/${mod}";`).join("\n");
  return `// Re-export all modules from ${packageName}
export * from "${packageName}";

// Individual module re-exports
${exports}
`;
}

function main() {
  for (const pkg of packages) {
    console.log(`\nProcessing ${pkg.packageName}...`);

    // Ensure target directory exists
    if (!existsSync(pkg.target)) {
      mkdirSync(pkg.target, { recursive: true });
      console.log(`  Created directory: ${pkg.target}`);
    }

    // Get all directories from source
    const directories = getDirectories(pkg.source);
    console.log(`  Found ${directories.length} modules: ${directories.join(", ")}`);

    // Generate individual module files
    for (const dir of directories) {
      const content = generateReExportContent(pkg.packageName, dir);
      const filePath = join(pkg.target, `${dir}.ts`);
      writeFileSync(filePath, content);
      console.log(`  Created: ${basename(filePath)}`);
    }

    // Generate index.ts
    const indexContent = generateIndexContent(pkg.packageName, directories);
    const indexPath = join(pkg.target, "index.ts");
    writeFileSync(indexPath, indexContent);
    console.log(`  Created: index.ts`);
  }

  console.log("\nDone!");
}

main();
