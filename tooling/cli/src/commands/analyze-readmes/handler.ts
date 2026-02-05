/**
 * @file analyze-readmes Command Handler
 *
 * Main handler for the analyze-readmes command. Discovers workspace packages
 * via RepoUtils.RepoWorkspaceMap, analyzes README.md files for compliance
 * with project standards, and generates reports in multiple formats.
 *
 * @module analyze-readmes/handler
 * @since 1.0.0
 */

import { FsUtils, RepoUtils } from "@beep/tooling-utils";
import { FileSystem } from "@effect/platform";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import color from "picocolors";

import { AnalyzeReadmesError } from "./errors.js";
import { type AnalyzeReadmesInput, PackageInfo, ReadmeAnalysis } from "./schemas.js";

// ─────────────────────────────────────────────────────────────────────────────
// README Analysis
// ─────────────────────────────────────────────────────────────────────────────

const EFFECT_IMPORT_RE = /import \* as Effect from "effect\/Effect"/;
const ARRAY_IMPORT_RE = /import \* as A from "effect\/Array"/;
const FUNCTION_IMPORT_RE = /import \* as F from "effect\/Function"/;
const BEEP_IMPORT_RE = /@beep\//;
const BEEP_IMPORT_FROM_RE = /import.*from "@beep\//;
const NATIVE_ARRAY_MAP_RE = /\.map\(/;
const NATIVE_ARRAY_FILTER_RE = /\.filter\(/;
const NATIVE_ARRAY_REDUCE_RE = /\.reduce\(/;
const ASYNC_FUNCTION_RE = /async function/;
const AWAIT_RE = /await /;

const analyzeReadmeContent = (content: string, packageName: O.Option<string>): ReadmeAnalysis => {
  const lines = Str.split(content, "\n");
  const lineCount = A.length(lines);

  const firstLine = F.pipe(
    A.head(lines),
    O.getOrElse(() => "")
  );
  const titleMatch = F.pipe(
    packageName,
    O.map((name) => F.pipe(firstLine, Str.includes(name))),
    O.getOrElse(() => false)
  );

  const hasInstallSection = F.pipe(content, Str.includes("## Installation"));
  const hasUsageSection = F.pipe(content, Str.includes("## Usage"));
  const hasKeyExportsSection = F.pipe(content, Str.includes("## Key Exports"));
  const hasDependenciesSection = F.pipe(content, Str.includes("## Dependencies"));

  const hasEffectImports =
    EFFECT_IMPORT_RE.test(content) || ARRAY_IMPORT_RE.test(content) || FUNCTION_IMPORT_RE.test(content);

  const hasBeepImports = BEEP_IMPORT_RE.test(content) || BEEP_IMPORT_FROM_RE.test(content);

  const hasNativeArrayMethods =
    NATIVE_ARRAY_MAP_RE.test(content) || NATIVE_ARRAY_FILTER_RE.test(content) || NATIVE_ARRAY_REDUCE_RE.test(content);

  const hasAsyncAwait = ASYNC_FUNCTION_RE.test(content) || AWAIT_RE.test(content);

  return new ReadmeAnalysis({
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
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Package Analysis
// ─────────────────────────────────────────────────────────────────────────────

const analyzePackage = (packageDir: string, repoRoot: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path_ = yield* Path.Path;
    const fsUtils = yield* FsUtils;

    const readmePath = path_.join(packageDir, "README.md");
    const agentsPath = path_.join(packageDir, "AGENTS.md");
    const packageJsonPath = path_.join(packageDir, "package.json");

    const hasReadme = yield* fs.exists(readmePath);
    const hasAgentsMd = yield* fs.exists(agentsPath);

    let packageName: string | undefined;
    let description: string | undefined;

    const hasPackageJson = yield* fs.exists(packageJsonPath);
    if (hasPackageJson) {
      const pkgJson = yield* fsUtils.readJson(packageJsonPath);
      packageName = pkgJson.name ?? undefined;
      description = pkgJson.description ?? undefined;
    }

    let readme: ReadmeAnalysis | undefined;
    if (hasReadme) {
      const content = yield* fs.readFileString(readmePath);
      readme = analyzeReadmeContent(content, O.fromNullable(packageName));
    }

    const relativePath = path_.relative(repoRoot, packageDir);

    return new PackageInfo({
      path: relativePath,
      packageName,
      description,
      hasReadme,
      hasAgentsMd,
      readme,
    });
  }).pipe(
    Effect.mapError(
      (cause) =>
        new AnalyzeReadmesError({
          message: `Failed to analyze package at ${packageDir}`,
          underlyingCause: cause,
          operation: "analyzePackage",
        })
    )
  );

// ─────────────────────────────────────────────────────────────────────────────
// Report Generation
// ─────────────────────────────────────────────────────────────────────────────

const isCompliant = (pkg: PackageInfo): boolean =>
  (pkg.readme?.titleMatch &&
    pkg.readme.hasInstallSection &&
    pkg.readme.hasUsageSection &&
    pkg.readme.hasEffectImports &&
    !pkg.readme.hasNativeArrayMethods &&
    !pkg.readme.hasAsyncAwait) ??
  false;

const countSections = (readme: ReadmeAnalysis): number =>
  A.length(
    A.filter(
      [readme.hasInstallSection, readme.hasUsageSection, readme.hasKeyExportsSection, readme.hasDependenciesSection],
      F.identity
    )
  );

const packagePathOrder: Order.Order<PackageInfo> = Order.mapInput(Order.string, (pkg: PackageInfo) => pkg.path);

const generateTableReport = (packages: ReadonlyArray<PackageInfo>): string => {
  const totalPackages = A.length(packages);
  const withReadme = A.length(A.filter(packages, (p) => p.hasReadme));
  const withAgents = A.length(A.filter(packages, (p) => p.hasAgentsMd));
  const missingReadme = totalPackages - withReadme;

  const packagesWithReadme = A.filter(packages, (p) => p.readme !== undefined);

  const totalLines = A.reduce(packagesWithReadme, 0, (acc, p) => acc + (p.readme?.lineCount ?? 0));

  const compliantReadmes = A.length(A.filter(packages, isCompliant));

  const compliancePercent = withReadme > 0 ? ((compliantReadmes / withReadme) * 100).toFixed(1) : "0.0";

  const sectionsTotal = A.reduce(packagesWithReadme, 0, (acc, p) =>
    p.readme !== undefined ? acc + countSections(p.readme) : acc
  );

  const avgSections = withReadme > 0 ? (sectionsTotal / withReadme).toFixed(1) : "0.0";

  const sorted = A.sort(packages, packagePathOrder);

  const headerLines = [
    "# README.md Files Inventory",
    "",
    "## Summary",
    `- Total Packages Scanned: ${totalPackages}`,
    `- README Files Exist: ${withReadme}`,
    `- README Files Missing: ${missingReadme}`,
    `- Files with AGENTS.md: ${withAgents}`,
    `- Total Lines (all READMEs): ${totalLines}`,
    `- Average Sections per File: ${avgSections}`,
    `- Effect Compliant: ${compliancePercent}%`,
    "",
    "## Inventory Table",
    "",
    "| Path | Package | Lines | package.json | AGENTS.md | Sections | Title Match | Effect Imports | Compliant |",
    "|------|---------|-------|--------------|-----------|----------|-------------|----------------|-----------|",
  ];

  const rowLines = A.map(sorted, (pkg) => {
    const name = pkg.packageName ?? "N/A";
    const lines = pkg.readme !== undefined ? String(pkg.readme.lineCount) : "-";

    const sections =
      pkg.readme !== undefined
        ? F.pipe(
            A.filter(
              [
                pkg.readme.hasInstallSection ? "Install" : undefined,
                pkg.readme.hasUsageSection ? "Usage" : undefined,
                pkg.readme.hasKeyExportsSection ? "Exports" : undefined,
                pkg.readme.hasDependenciesSection ? "Deps" : undefined,
              ],
              (s): s is string => s !== undefined
            ),
            A.join(", ")
          )
        : "-";

    const titleMatch = pkg.readme !== undefined ? (pkg.readme.titleMatch ? "Yes" : "No") : "-";
    const effectImports = pkg.readme !== undefined ? (pkg.readme.hasEffectImports ? "Yes" : "No") : "-";
    const compliant = pkg.readme !== undefined ? (isCompliant(pkg) ? "Yes" : "No") : "-";

    return `| ${pkg.path} | ${name} | ${lines} | ${pkg.packageName !== undefined ? "Yes" : "No"} | ${pkg.hasAgentsMd ? "Yes" : "No"} | ${sections} | ${titleMatch} | ${effectImports} | ${compliant} |`;
  });

  const missingReadmePackages = F.pipe(
    A.filter(packages, (p) => !p.hasReadme && p.packageName !== undefined),
    A.map((p) => p.packageName ?? p.path)
  );

  const packagesWithReadmeForGap = A.filterMap(packages, (p) =>
    p.readme !== undefined ? O.some({ pkg: p, readme: p.readme }) : O.none()
  );

  const missingSections = F.pipe(
    packagesWithReadmeForGap,
    A.map(({ pkg, readme }) => ({
      name: pkg.packageName ?? pkg.path,
      missing: A.filter(
        [
          !readme.hasInstallSection ? "Installation" : undefined,
          !readme.hasUsageSection ? "Usage" : undefined,
          !readme.hasKeyExportsSection ? "Key Exports" : undefined,
          !readme.hasDependenciesSection ? "Dependencies" : undefined,
        ],
        (s): s is string => s !== undefined
      ),
    })),
    A.filter((item) => A.isNonEmptyReadonlyArray(item.missing))
  );

  const nonCompliantPatterns = F.pipe(
    packagesWithReadmeForGap,
    A.map(({ pkg, readme }) => ({
      name: pkg.packageName ?? pkg.path,
      issues: A.filter(
        [
          readme.hasNativeArrayMethods ? "Native array methods" : undefined,
          readme.hasAsyncAwait ? "async/await" : undefined,
          !readme.hasEffectImports ? "Missing Effect imports" : undefined,
          !readme.titleMatch ? "Title mismatch" : undefined,
        ],
        (s): s is string => s !== undefined
      ),
    })),
    A.filter((item) => A.isNonEmptyReadonlyArray(item.issues))
  );

  const gapLines = [
    "",
    "## Gap Analysis",
    "",
    "### Packages Missing README.md",
    A.isNonEmptyReadonlyArray(missingReadmePackages)
      ? A.join(
          A.map(missingReadmePackages, (name) => `- ${name}`),
          "\n"
        )
      : "None",
    "",
    "### READMEs Missing Required Sections",
    A.isNonEmptyReadonlyArray(missingSections)
      ? A.join(
          A.map(missingSections, (item) => `- **${item.name}**: ${A.join(item.missing, ", ")}`),
          "\n"
        )
      : "None",
    "",
    "### READMEs with Non-Compliant Patterns",
    A.isNonEmptyReadonlyArray(nonCompliantPatterns)
      ? A.join(
          A.map(nonCompliantPatterns, (item) => `- **${item.name}**: ${A.join(item.issues, ", ")}`),
          "\n"
        )
      : "None",
    "",
    "## Recommendations",
    "",
    `1. **Missing READMEs**: Create ${missingReadme} missing README.md files using the template from \`.claude/agents/readme-updater.md\``,
    `2. **Missing Sections**: Add required sections (Installation, Usage, Key Exports, Dependencies) to ${A.length(missingSections)} packages`,
    `3. **Pattern Compliance**: Update ${A.length(nonCompliantPatterns)} packages to use Effect patterns (namespace imports, Effect utilities instead of native methods)`,
    "4. **Title Matching**: Ensure README titles match package.json names for clarity",
    "",
    "## Next Steps",
    "",
    "1. Run the readme-updater agent to create missing README files",
    "2. Update existing READMEs to include all required sections",
    "3. Fix pattern compliance issues (replace native methods with Effect utilities)",
    "4. Verify all README titles match their respective package.json names",
  ];

  return A.join([...headerLines, ...rowLines, ...gapLines], "\n");
};

const generateSummaryReport = (packages: ReadonlyArray<PackageInfo>): string => {
  const totalPackages = A.length(packages);
  const withReadme = A.length(A.filter(packages, (p) => p.hasReadme));
  const withAgents = A.length(A.filter(packages, (p) => p.hasAgentsMd));
  const missingReadme = totalPackages - withReadme;
  const compliantReadmes = A.length(A.filter(packages, isCompliant));
  const compliancePercent = withReadme > 0 ? ((compliantReadmes / withReadme) * 100).toFixed(1) : "0.0";

  return A.join(
    [
      "README Analysis Summary",
      "=======================",
      `Total Packages:    ${totalPackages}`,
      `With README:       ${withReadme}`,
      `Missing README:    ${missingReadme}`,
      `With AGENTS.md:    ${withAgents}`,
      `Fully Compliant:   ${compliantReadmes}`,
      `Compliance Rate:   ${compliancePercent}%`,
    ],
    "\n"
  );
};

const generateJsonReport = (packages: ReadonlyArray<PackageInfo>): string => JSON.stringify(packages, null, 2);

// ─────────────────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main handler for the analyze-readmes command.
 *
 * @since 0.1.0
 * @category handlers
 */
export const analyzeReadmesHandler = (input: AnalyzeReadmesInput) =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const fs = yield* FileSystem.FileSystem;
    const repoRoot = repo.REPOSITORY_ROOT;

    yield* Console.log(color.cyan("Discovering workspace packages..."));

    const workspaceEntries = F.pipe(HashMap.toEntries(repo.RepoWorkspaceMap), A.fromIterable);

    const filterPattern = input.filter;
    const filteredEntries =
      filterPattern !== undefined
        ? A.filter(workspaceEntries, ([pkgName]) => F.pipe(pkgName, Str.includes(filterPattern)))
        : workspaceEntries;

    yield* Console.log(color.green(`Found ${A.length(filteredEntries)} packages`));

    yield* Console.log(color.cyan("Analyzing README files..."));

    const packages = yield* Effect.forEach(filteredEntries, ([_pkgName, pkgDir]) => analyzePackage(pkgDir, repoRoot), {
      concurrency: 10,
    });

    const report = F.pipe(input.format, (format) => {
      if (format === "json") return generateJsonReport(packages);
      if (format === "summary") return generateSummaryReport(packages);
      return generateTableReport(packages);
    });

    if (input.output !== undefined) {
      yield* fs.writeFileString(input.output, report);
      yield* Console.log(color.green(`Report written to: ${input.output}`));
    } else {
      yield* Console.log(report);
    }
  }).pipe(Effect.withSpan("analyzeReadmesHandler"));
