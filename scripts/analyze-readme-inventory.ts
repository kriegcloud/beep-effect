#!/usr/bin/env bun
import { FileSystem } from "@effect/platform";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as F from "effect/Function";
import { BunFileSystem } from "@effect/platform-bun";
import * as Layer from "effect/Layer";

interface PackageInfo {
  path: string;
  packageJson: O.Option<{ name: string; description?: string }>;
  hasAgentsMd: boolean;
  readme: O.Option<ReadmeAnalysis>;
}

interface ReadmeAnalysis {
  path: string;
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

const analyzeReadme = (content: string, packageName: O.Option<string>) =>
  Effect.gen(function* () {
    const lines = F.pipe(content, Str.split("\n"));
    const lineCount = A.length(lines);

    // Check for title match
    const firstLine = A.head(lines);
    const titleMatch = F.pipe(
      O.zipWith(firstLine, packageName, (line, name) =>
        Str.includes(line, name)
      ),
      O.getOrElse(() => false)
    );

    // Check for required sections
    const hasInstallSection = Str.includes(content, "## Installation");
    const hasUsageSection = Str.includes(content, "## Usage");
    const hasKeyExportsSection = Str.includes(content, "## Key Exports");
    const hasDependenciesSection = Str.includes(content, "## Dependencies");

    // Check for Effect patterns
    const hasEffectImports = F.pipe(
      [
        /import \* as Effect from "effect\/Effect"/,
        /import \* as A from "effect\/Array"/,
        /import \* as F from "effect\/Function"/,
      ],
      A.some((regex) => regex.test(content))
    );

    const hasBeepImports = F.pipe(
      [/@beep\//, /import.*from "@beep\//],
      A.some((regex) => regex.test(content))
    );

    // Check for anti-patterns
    const hasNativeArrayMethods = F.pipe(
      [/\.map\(/, /\.filter\(/, /\.reduce\(/],
      A.some((regex) => regex.test(content))
    );

    const hasAsyncAwait = F.pipe(
      [/async function/, /await /],
      A.some((regex) => regex.test(content))
    );

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
  });

const analyzePackage = (dirPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // Check for package.json
    const packageJsonPath = `${dirPath}/package.json`;
    const hasPackageJson = yield* fs.exists(packageJsonPath);
    const packageJson = yield* hasPackageJson
      ? Effect.gen(function* () {
          const content = yield* fs.readFileString(packageJsonPath);
          const parsed = JSON.parse(content);
          return O.some({
            name: parsed.name,
            description: parsed.description,
          });
        })
      : Effect.succeed(O.none());

    // Check for AGENTS.md
    const agentsPath = `${dirPath}/AGENTS.md`;
    const hasAgentsMd = yield* fs.exists(agentsPath);

    // Check for README.md
    const readmePath = `${dirPath}/README.md`;
    const hasReadme = yield* fs.exists(readmePath);
    const readme = yield* hasReadme
      ? Effect.gen(function* () {
          const content = yield* fs.readFileString(readmePath);
          const packageName = F.pipe(
            packageJson,
            O.map((p) => p.name)
          );
          const analysis = yield* analyzeReadme(content, packageName);
          return O.some({
            path: readmePath,
            ...analysis,
          });
        })
      : Effect.succeed(O.none());

    return {
      path: dirPath,
      packageJson,
      hasAgentsMd,
      readme,
    };
  });

const discoverPackages = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  const searchDirs = [
    "/home/elpresidank/YeeBois/projects/beep-effect/packages",
    "/home/elpresidank/YeeBois/projects/beep-effect/apps",
    "/home/elpresidank/YeeBois/projects/beep-effect/tooling",
  ];

  const packages: PackageInfo[] = [];

  for (const dir of searchDirs) {
    const dirExists = yield* fs.exists(dir);
    if (!dirExists) {
      yield* Effect.log(`Directory not found: ${dir}`);
      continue;
    }

    const entries = yield* fs.readDirectory(dir);

    for (const entry of entries) {
      const entryPath = `${dir}/${entry.name}`;

      if (entry.type === "Directory" && entry.name !== "node_modules") {
        // Check if it's a direct package or contains subpackages
        const packageJsonExists = yield* fs.exists(`${entryPath}/package.json`);

        if (packageJsonExists) {
          const info = yield* analyzePackage(entryPath);
          packages.push(info);
        } else {
          // Check for nested packages (e.g., packages/iam/*)
          const nestedExists = yield* fs.exists(entryPath);
          if (nestedExists) {
            const nestedEntries = yield* fs.readDirectory(entryPath);
            for (const nestedEntry of nestedEntries) {
              if (
                nestedEntry.type === "Directory" &&
                nestedEntry.name !== "dist" &&
                nestedEntry.name !== "node_modules"
              ) {
                const nestedPath = `${entryPath}/${nestedEntry.name}`;
                const nestedPackageJsonExists = yield* fs.exists(
                  `${nestedPath}/package.json`
                );

                if (nestedPackageJsonExists) {
                  const info = yield* analyzePackage(nestedPath);
                  packages.push(info);
                }
              }
            }
          }
        }
      }
    }
  }

  return packages;
});

const generateReport = (packages: PackageInfo[]) =>
  Effect.gen(function* () {
    const totalPackages = A.length(packages);
    const withReadme = F.pipe(
      packages,
      A.filter((p) => O.isSome(p.readme)),
      A.length
    );
    const withAgents = F.pipe(
      packages,
      A.filter((p) => p.hasAgentsMd),
      A.length
    );
    const missingReadme = totalPackages - withReadme;

    const totalLines = F.pipe(
      packages,
      A.filterMap((p) => p.readme),
      A.reduce(0, (acc, r) => acc + r.lineCount)
    );

    const compliantReadmes = F.pipe(
      packages,
      A.filterMap((p) => p.readme),
      A.filter(
        (r) =>
          r.titleMatch &&
          r.hasInstallSection &&
          r.hasUsageSection &&
          r.hasEffectImports &&
          !r.hasNativeArrayMethods &&
          !r.hasAsyncAwait
      ),
      A.length
    );

    const compliancePercent =
      withReadme > 0
        ? ((compliantReadmes / withReadme) * 100).toFixed(1)
        : "0.0";

    // Calculate average sections
    const sectionsPerFile = F.pipe(
      packages,
      A.filterMap((p) => p.readme),
      A.map(
        (r) =>
          [
            r.hasInstallSection,
            r.hasUsageSection,
            r.hasKeyExportsSection,
            r.hasDependenciesSection,
          ].filter(Boolean).length
      ),
      A.reduce(0, (acc, n) => acc + n)
    );

    const avgSections =
      withReadme > 0 ? (sectionsPerFile / withReadme).toFixed(1) : "0.0";

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

    const sortedPackages = F.pipe(
      packages,
      A.sortBy((p) => p.path)
    );

    for (const pkg of sortedPackages) {
      const packageName = F.pipe(
        pkg.packageJson,
        O.map((p) => p.name),
        O.getOrElse(() => "N/A")
      );

      const lines = F.pipe(
        pkg.readme,
        O.map((r) => String(r.lineCount)),
        O.getOrElse(() => "-")
      );

      const sections = F.pipe(
        pkg.readme,
        O.map((r) =>
          F.pipe(
            [
              r.hasInstallSection ? "Install" : null,
              r.hasUsageSection ? "Usage" : null,
              r.hasKeyExportsSection ? "Exports" : null,
              r.hasDependenciesSection ? "Deps" : null,
            ],
            A.filterMap(O.fromNullable),
            A.join(", ")
          )
        ),
        O.getOrElse(() => "-")
      );

      const titleMatch = F.pipe(
        pkg.readme,
        O.map((r) => (r.titleMatch ? "Yes" : "No")),
        O.getOrElse(() => "-")
      );

      const effectImports = F.pipe(
        pkg.readme,
        O.map((r) => (r.hasEffectImports ? "Yes" : "No")),
        O.getOrElse(() => "-")
      );

      const compliant = F.pipe(
        pkg.readme,
        O.map((r) =>
          r.titleMatch &&
          r.hasEffectImports &&
          !r.hasNativeArrayMethods &&
          !r.hasAsyncAwait
            ? "Yes"
            : "No"
        ),
        O.getOrElse(() => "-")
      );

      report += `| ${pkg.path} | ${packageName} | ${lines} | ${O.isSome(pkg.packageJson) ? "Yes" : "No"} | ${pkg.hasAgentsMd ? "Yes" : "No"} | ${sections} | ${titleMatch} | ${effectImports} | ${compliant} |\n`;
    }

    // Gap Analysis
    const missingReadmePackages = F.pipe(
      packages,
      A.filter((p) => O.isNone(p.readme) && O.isSome(p.packageJson)),
      A.map((p) =>
        F.pipe(
          p.packageJson,
          O.map((pj) => pj.name),
          O.getOrElse(() => p.path)
        )
      )
    );

    const missingSections = F.pipe(
      packages,
      A.filterMap((p) =>
        F.pipe(
          O.zipWith(p.readme, p.packageJson, (r, pj) => ({
            name: pj.name,
            missing: [
              !r.hasInstallSection ? "Installation" : null,
              !r.hasUsageSection ? "Usage" : null,
              !r.hasKeyExportsSection ? "Key Exports" : null,
              !r.hasDependenciesSection ? "Dependencies" : null,
            ].filter(Boolean),
          })),
          O.filter((item) => item.missing.length > 0)
        )
      )
    );

    const nonCompliantPatterns = F.pipe(
      packages,
      A.filterMap((p) =>
        F.pipe(
          O.zipWith(p.readme, p.packageJson, (r, pj) => ({
            name: pj.name,
            issues: [
              r.hasNativeArrayMethods ? "Native array methods" : null,
              r.hasAsyncAwait ? "async/await" : null,
              !r.hasEffectImports ? "Missing Effect imports" : null,
              !r.titleMatch ? "Title mismatch" : null,
            ].filter(Boolean),
          })),
          O.filter((item) => item.issues.length > 0)
        )
      )
    );

    report += `\n## Gap Analysis

### Packages Missing README.md
${A.length(missingReadmePackages) > 0 ? F.pipe(missingReadmePackages, A.map((name) => `- ${name}`), A.join("\n")) : "None"}

### READMEs Missing Required Sections
${
  A.length(missingSections) > 0
    ? F.pipe(
        missingSections,
        A.map((item) => `- **${item.name}**: ${A.join(item.missing, ", ")}`),
        A.join("\n")
      )
    : "None"
}

### READMEs with Non-Compliant Patterns
${
  A.length(nonCompliantPatterns) > 0
    ? F.pipe(
        nonCompliantPatterns,
        A.map((item) => `- **${item.name}**: ${A.join(item.issues, ", ")}`),
        A.join("\n")
      )
    : "None"
}

## Recommendations

1. **Missing READMEs**: Create ${missingReadme} missing README.md files using the template from \`.claude/agents/readme-updater.md\`
2. **Missing Sections**: Add required sections (Installation, Usage, Key Exports, Dependencies) to ${A.length(missingSections)} packages
3. **Pattern Compliance**: Update ${A.length(nonCompliantPatterns)} packages to use Effect patterns (namespace imports, Effect utilities instead of native methods)
4. **Title Matching**: Ensure README titles match package.json names for clarity
`;

    return report;
  });

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("Discovering packages...");
  const packages = yield* discoverPackages;

  yield* Effect.log(`Found ${A.length(packages)} packages`);

  yield* Effect.log("Generating report...");
  const report = yield* generateReport(packages);

  const outputPath = "specs/agent-config-optimization/outputs/inventory-readme.md";

  // Ensure output directory exists
  yield* fs.makeDirectory("specs/agent-config-optimization/outputs", {
    recursive: true,
  });

  yield* fs.writeFileString(outputPath, report);

  yield* Effect.log(`Report written to: ${outputPath}`);

  console.log("\n" + report);
});

const MainLive = Layer.mergeAll(BunFileSystem.layer);

Effect.runPromise(main.pipe(Effect.provide(MainLive)));
