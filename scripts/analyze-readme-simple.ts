#!/usr/bin/env bun
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

interface PackageInfo {
  path: string;
  packageName: string | null;
  description: string | null;
  hasReadme: boolean;
  hasAgentsMd: boolean;
  readme: ReadmeAnalysis | null;
}

interface ReadmeAnalysis {
  lineCount: number;
  titleMatch: boolean;
  hasInstallSection: boolean;
  hasUsageSection: boolean;
  hasKeyExportsSection: boolean;
  hasDependenciesSection: boolean;
  hasEffectImports: boolean;
  hasBeepImports: boolean;
  hasNativeArrayMethods: boolean;
  hasAsyncAwait: boolean;
}

function analyzeReadme(content: string, packageName: string | null): ReadmeAnalysis {
  const lines = content.split("\n");
  const lineCount = lines.length;

  // Check for title match
  const firstLine = lines[0] || "";
  const titleMatch = packageName ? firstLine.includes(packageName) : false;

  // Check for required sections
  const hasInstallSection = content.includes("## Installation");
  const hasUsageSection = content.includes("## Usage");
  const hasKeyExportsSection = content.includes("## Key Exports");
  const hasDependenciesSection = content.includes("## Dependencies");

  // Check for Effect patterns
  const hasEffectImports =
    /import \* as Effect from "effect\/Effect"/.test(content) ||
    /import \* as A from "effect\/Array"/.test(content) ||
    /import \* as F from "effect\/Function"/.test(content);

  const hasBeepImports = /@beep\//.test(content) || /import.*from "@beep\//.test(content);

  // Check for anti-patterns
  const hasNativeArrayMethods = /\.map\(/.test(content) || /\.filter\(/.test(content) || /\.reduce\(/.test(content);

  const hasAsyncAwait = /async function/.test(content) || /await /.test(content);

  return {
    lineCount,
    titleMatch,
    hasInstallSection,
    hasUsageSection,
    hasKeyExportsSection,
    hasDependenciesSection,
    hasEffectImports,
    hasBeepImports,
    hasNativeArrayMethods,
    hasAsyncAwait,
  };
}

function findPackages(baseDir: string, packages: PackageInfo[] = []): PackageInfo[] {
  const searchDirs = [join(baseDir, "packages"), join(baseDir, "apps"), join(baseDir, "tooling")];

  for (const searchDir of searchDirs) {
    if (!existsSync(searchDir)) continue;

    const entries = readdirSync(searchDir);

    for (const entry of entries) {
      const entryPath = join(searchDir, entry);
      if (!statSync(entryPath).isDirectory()) continue;
      if (entry === "node_modules" || entry === "dist") continue;

      const packageJsonPath = join(entryPath, "package.json");

      if (existsSync(packageJsonPath)) {
        // Direct package
        packages.push(analyzePackage(entryPath));
      } else {
        // Check for nested packages
        const nestedEntries = readdirSync(entryPath);
        for (const nestedEntry of nestedEntries) {
          const nestedPath = join(entryPath, nestedEntry);
          if (!statSync(nestedPath).isDirectory()) continue;
          if (nestedEntry === "node_modules" || nestedEntry === "dist") continue;

          const nestedPackageJsonPath = join(nestedPath, "package.json");
          if (existsSync(nestedPackageJsonPath)) {
            packages.push(analyzePackage(nestedPath));
          }
        }
      }
    }
  }

  return packages;
}

function analyzePackage(packagePath: string): PackageInfo {
  const packageJsonPath = join(packagePath, "package.json");
  const readmePath = join(packagePath, "README.md");
  const agentsPath = join(packagePath, "AGENTS.md");

  let packageName: string | null = null;
  let description: string | null = null;

  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    packageName = packageJson.name || null;
    description = packageJson.description || null;
  }

  const hasReadme = existsSync(readmePath);
  const hasAgentsMd = existsSync(agentsPath);

  let readme: ReadmeAnalysis | null = null;

  if (hasReadme) {
    const content = readFileSync(readmePath, "utf-8");
    readme = analyzeReadme(content, packageName);
  }

  return {
    path: packagePath.replace(/^\/home\/elpresidank\/YeeBois\/projects\/beep-effect\//, ""),
    packageName,
    description,
    hasReadme,
    hasAgentsMd,
    readme,
  };
}

function generateReport(packages: PackageInfo[]): string {
  const totalPackages = packages.length;
  const withReadme = packages.filter((p) => p.hasReadme).length;
  const withAgents = packages.filter((p) => p.hasAgentsMd).length;
  const missingReadme = totalPackages - withReadme;

  const totalLines = packages
    .filter((p) => p.readme)
    .reduce((acc, p) => acc + (p.readme?.lineCount || 0), 0);

  const compliantReadmes = packages.filter(
    (p) =>
      p.readme &&
      p.readme.titleMatch &&
      p.readme.hasInstallSection &&
      p.readme.hasUsageSection &&
      p.readme.hasEffectImports &&
      !p.readme.hasNativeArrayMethods &&
      !p.readme.hasAsyncAwait
  ).length;

  const compliancePercent = withReadme > 0 ? ((compliantReadmes / withReadme) * 100).toFixed(1) : "0.0";

  const sectionsPerFile = packages
    .filter((p) => p.readme)
    .reduce((acc, p) => {
      const r = p.readme!;
      return (
        acc +
        [r.hasInstallSection, r.hasUsageSection, r.hasKeyExportsSection, r.hasDependenciesSection].filter(Boolean)
          .length
      );
    }, 0);

  const avgSections = withReadme > 0 ? (sectionsPerFile / withReadme).toFixed(1) : "0.0";

  let report = `# README.md Files Inventory

## Summary
- Total Packages Scanned: ${totalPackages}
- README Files Exist: ${withReadme}
- README Files Missing: ${missingReadme}
- Files with AGENTS.md: ${withAgents}
- Total Lines (all READMEs): ${totalLines}
- Average Sections per File: ${avgSections}
- Effect Compliant: ${compliancePercent}%

## Inventory Table

| Path | Package | Lines | package.json | AGENTS.md | Sections | Title Match | Effect Imports | Compliant |
|------|---------|-------|--------------|-----------|----------|-------------|----------------|-----------|
`;

  const sortedPackages = packages.sort((a, b) => a.path.localeCompare(b.path));

  for (const pkg of sortedPackages) {
    const packageName = pkg.packageName || "N/A";
    const lines = pkg.readme ? String(pkg.readme.lineCount) : "-";

    const sections = pkg.readme
      ? [
          pkg.readme.hasInstallSection ? "Install" : null,
          pkg.readme.hasUsageSection ? "Usage" : null,
          pkg.readme.hasKeyExportsSection ? "Exports" : null,
          pkg.readme.hasDependenciesSection ? "Deps" : null,
        ]
          .filter(Boolean)
          .join(", ")
      : "-";

    const titleMatch = pkg.readme ? (pkg.readme.titleMatch ? "Yes" : "No") : "-";
    const effectImports = pkg.readme ? (pkg.readme.hasEffectImports ? "Yes" : "No") : "-";

    const compliant =
      pkg.readme &&
      pkg.readme.titleMatch &&
      pkg.readme.hasEffectImports &&
      !pkg.readme.hasNativeArrayMethods &&
      !pkg.readme.hasAsyncAwait
        ? "Yes"
        : pkg.readme
          ? "No"
          : "-";

    report += `| ${pkg.path} | ${packageName} | ${lines} | ${pkg.packageName ? "Yes" : "No"} | ${pkg.hasAgentsMd ? "Yes" : "No"} | ${sections} | ${titleMatch} | ${effectImports} | ${compliant} |\n`;
  }

  // Gap Analysis
  const missingReadmePackages = packages
    .filter((p) => !p.hasReadme && p.packageName)
    .map((p) => p.packageName || p.path);

  const missingSections = packages
    .filter((p) => p.readme)
    .map((p) => ({
      name: p.packageName || p.path,
      missing: [
        !p.readme!.hasInstallSection ? "Installation" : null,
        !p.readme!.hasUsageSection ? "Usage" : null,
        !p.readme!.hasKeyExportsSection ? "Key Exports" : null,
        !p.readme!.hasDependenciesSection ? "Dependencies" : null,
      ].filter(Boolean),
    }))
    .filter((item) => item.missing.length > 0);

  const nonCompliantPatterns = packages
    .filter((p) => p.readme)
    .map((p) => ({
      name: p.packageName || p.path,
      issues: [
        p.readme!.hasNativeArrayMethods ? "Native array methods" : null,
        p.readme!.hasAsyncAwait ? "async/await" : null,
        !p.readme!.hasEffectImports ? "Missing Effect imports" : null,
        !p.readme!.titleMatch ? "Title mismatch" : null,
      ].filter(Boolean),
    }))
    .filter((item) => item.issues.length > 0);

  report += `\n## Gap Analysis

### Packages Missing README.md
${missingReadmePackages.length > 0 ? missingReadmePackages.map((name) => `- ${name}`).join("\n") : "None"}

### READMEs Missing Required Sections
${missingSections.length > 0 ? missingSections.map((item) => `- **${item.name}**: ${item.missing.join(", ")}`).join("\n") : "None"}

### READMEs with Non-Compliant Patterns
${nonCompliantPatterns.length > 0 ? nonCompliantPatterns.map((item) => `- **${item.name}**: ${item.issues.join(", ")}`).join("\n") : "None"}

## Recommendations

1. **Missing READMEs**: Create ${missingReadme} missing README.md files using the template from \`.claude/agents/readme-updater.md\`
2. **Missing Sections**: Add required sections (Installation, Usage, Key Exports, Dependencies) to ${missingSections.length} packages
3. **Pattern Compliance**: Update ${nonCompliantPatterns.length} packages to use Effect patterns (namespace imports, Effect utilities instead of native methods)
4. **Title Matching**: Ensure README titles match package.json names for clarity

## Next Steps

1. Run the readme-updater agent to create missing README files
2. Update existing READMEs to include all required sections
3. Fix pattern compliance issues (replace native methods with Effect utilities)
4. Verify all README titles match their respective package.json names
`;

  return report;
}

function main() {
  const baseDir = "/home/elpresidank/YeeBois/projects/beep-effect";

  console.log("Discovering packages...");
  const packages = findPackages(baseDir);

  console.log(`Found ${packages.length} packages`);

  console.log("Generating report...");
  const report = generateReport(packages);

  const outputPath = join(baseDir, "specs/agent-config-optimization/outputs/inventory-readme.md");

  // Ensure output directory exists
  const outputDir = join(baseDir, "specs/agent-config-optimization/outputs");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  writeFileSync(outputPath, report);

  console.log(`Report written to: ${outputPath}`);
  console.log("\n" + report);
}

main();
