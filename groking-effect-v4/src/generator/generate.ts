import * as fs from "node:fs";
import { createRequire } from "node:module";
import * as path from "node:path";
import { Project } from "ts-morph";
import { extractModuleJsDoc } from "./doc.ts";
import { parseModuleExports } from "./module-parser.ts";
import { renderExportFileFromTemplate } from "./template-renderer.ts";
import type {
  BootstrapManifest,
  BootstrapManifestModuleEntry,
  BootstrapManifestPackageEntry,
  GeneratedExportFile,
  GeneratedModuleResult,
  GeneratedPackageResult,
  GeneratedRepositoryResult,
  GenerateModuleOptions,
  GeneratePackageOptions,
  GenerateRepositoryOptions,
} from "./types.ts";

interface DiscoveredPackage {
  readonly name: string;
  readonly directory: string;
}

const normalizePath = (value: string): string => value.split(path.sep).join("/");

const walkFiles = (directory: string): Array<string> => {
  const output: Array<string> = [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      output.push(...walkFiles(entryPath));
      continue;
    }
    if (entry.isFile()) {
      output.push(entryPath);
    }
  }
  return output;
};

export const discoverEffectPackages = (effectSmolRoot: string): ReadonlyArray<DiscoveredPackage> => {
  const packagesRoot = path.join(effectSmolRoot, "packages");
  if (!fs.existsSync(packagesRoot)) {
    throw new Error(`Could not find packages root: ${packagesRoot}`);
  }

  const packageJsonFiles = walkFiles(packagesRoot)
    .filter((filePath) => path.basename(filePath) === "package.json")
    .sort((a, b) => a.localeCompare(b));

  const packages: Array<DiscoveredPackage> = [];
  for (const packageJsonPath of packageJsonFiles) {
    const packageDirectory = path.dirname(packageJsonPath);
    const packageJsonRaw = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonRaw) as { readonly name?: string };
    if (typeof packageJson.name !== "string" || packageJson.name.length === 0) {
      continue;
    }
    packages.push({
      name: packageJson.name,
      directory: packageDirectory,
    });
  }

  return packages;
};

const findPackageDirectory = (effectSmolRoot: string, packageName: string): string => {
  const discovered = discoverEffectPackages(effectSmolRoot);
  const hit = discovered.find((pkg) => pkg.name === packageName);
  if (hit === undefined) {
    throw new Error(`Package "${packageName}" was not found under ${effectSmolRoot}`);
  }
  return hit.directory;
};

const writeFile = (filePath: string, content: string, dryRun: boolean | undefined): void => {
  if (dryRun === true) {
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
};

const resetExportDirectories = (
  moduleDirectory: string,
  exportsDirectory: string,
  dryRun: boolean | undefined
): void => {
  if (dryRun === true) {
    return;
  }

  fs.mkdirSync(moduleDirectory, { recursive: true });

  const moduleEntries = fs.readdirSync(moduleDirectory, { withFileTypes: true });
  for (const entry of moduleEntries) {
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.endsWith(".ts")) {
      continue;
    }
    fs.rmSync(path.join(moduleDirectory, entry.name), { force: true });
  }

  fs.rmSync(exportsDirectory, { recursive: true, force: true });
  fs.mkdirSync(exportsDirectory, { recursive: true });
};

const packageToFolderSegments = (packageName: string): Array<string> => packageName.split("/");

const packageOutputDirectory = (outputRoot: string, packageName: string): string =>
  path.join(outputRoot, ...packageToFolderSegments(packageName));

const moduleOutputDirectory = (outputRoot: string, packageName: string, moduleName: string): string => {
  return path.join(outputRoot, ...packageToFolderSegments(packageName), ...moduleName.split("/"));
};

const createImportResolver = (repoRoot: string): ((importPath: string) => boolean) => {
  const require = createRequire(path.join(repoRoot, "package.json"));
  return (importPath: string): boolean => {
    try {
      require.resolve(importPath);
      return true;
    } catch {
      return false;
    }
  };
};

const cleanGeneratedPackageDirectories = (
  outputRoot: string,
  packageNames: ReadonlyArray<string>,
  dryRun: boolean | undefined
): void => {
  if (dryRun === true) {
    return;
  }

  const packageRoots = [...new Set(packageNames.map((packageName) => packageOutputDirectory(outputRoot, packageName)))];
  packageRoots.sort((a, b) => b.length - a.length);

  for (const packageRoot of packageRoots) {
    fs.rmSync(packageRoot, { recursive: true, force: true });
  }
};

const resolveModuleSourcePath = (packageDirectory: string, moduleName: string): string => {
  const srcRoot = path.join(packageDirectory, "src");
  const directPath = path.join(srcRoot, `${moduleName}.ts`);
  if (fs.existsSync(directPath)) {
    return directPath;
  }
  const nestedIndexPath = path.join(srcRoot, moduleName, "index.ts");
  if (fs.existsSync(nestedIndexPath)) {
    return nestedIndexPath;
  }
  throw new Error(`Module "${moduleName}" was not found in package directory ${packageDirectory}`);
};

const listModulesForPackage = (packageDirectory: string): Array<string> => {
  const srcRoot = path.join(packageDirectory, "src");
  if (!fs.existsSync(srcRoot)) {
    throw new Error(`Could not find src directory for package: ${packageDirectory}`);
  }

  const allFiles = walkFiles(srcRoot);
  const moduleNames = new Set<string>();

  for (const absoluteFilePath of allFiles) {
    if (!absoluteFilePath.endsWith(".ts")) {
      continue;
    }
    if (absoluteFilePath.endsWith(".d.ts")) {
      continue;
    }

    const relativePath = normalizePath(path.relative(srcRoot, absoluteFilePath));
    if (relativePath.includes("/internal/") || relativePath.startsWith("internal/")) {
      continue;
    }

    let moduleName = relativePath.slice(0, -3);
    if (moduleName === "index") {
      continue;
    }
    if (moduleName.endsWith("/index")) {
      moduleName = moduleName.slice(0, -"/index".length);
    }
    if (moduleName.length === 0) {
      continue;
    }

    moduleNames.add(moduleName);
  }

  return [...moduleNames].sort((a, b) => a.localeCompare(b));
};

const renderModuleReadme = (
  moduleImportPath: string,
  moduleSourcePath: string,
  moduleJSDoc: string | undefined,
  parserDiagnostics: GeneratedModuleResult["parserDiagnostics"]
): string => {
  const lines: Array<string> = [
    `# ${moduleImportPath}`,
    "",
    `Source: \`${moduleSourcePath}\``,
    "",
    "Exports directory: `./exports`",
    "",
    "Generated by `@beep/groking-effect-v4`.",
    "",
    "## Parser Pipeline",
    "",
    "This module was parsed deterministically with:",
    "- `jscodeshift` + `ast-types` for syntax-level export discovery",
    "- `ts-morph` for exported symbol resolution + JSDoc extraction",
    "",
    `AST export count: ${parserDiagnostics.astExportCount}`,
    `TS-Morph export count: ${parserDiagnostics.tsMorphExportCount}`,
    `Merged export count: ${parserDiagnostics.mergedExportCount}`,
  ];

  if (parserDiagnostics.jscodeshiftParseOk === false) {
    lines.push("", `AST parse fallback triggered: ${parserDiagnostics.parseError ?? "unknown parse error"}`);
  }

  if (parserDiagnostics.missingInAst.length > 0 || parserDiagnostics.missingInTsMorph.length > 0) {
    lines.push("", "### Parser Parity Notes");
    if (parserDiagnostics.missingInTsMorph.length > 0) {
      lines.push(`- Missing in TS-Morph set: ${parserDiagnostics.missingInTsMorph.join(", ")}`);
    }
    if (parserDiagnostics.missingInAst.length > 0) {
      lines.push(`- Missing in AST set: ${parserDiagnostics.missingInAst.join(", ")}`);
    }
  }

  if (moduleJSDoc !== undefined && moduleJSDoc.length > 0) {
    lines.push("", "## Module Notes", "", moduleJSDoc);
  }

  return `${lines.join("\n")}\n`;
};

const renderModuleSurface = (
  moduleImportPath: string,
  entries: ReadonlyArray<{
    readonly exportName: string;
    readonly exportKind: string;
    readonly summary: string | undefined;
  }>
): string => {
  const toOverview = (summary: string | undefined): string => {
    if (summary === undefined || summary.trim().length === 0) {
      return "No summary found in JSDoc.";
    }
    const oneLine = summary.replace(/\s+/g, " ").trim();
    if (oneLine.length <= 180) {
      return oneLine;
    }
    return `${oneLine.slice(0, 177)}...`;
  };

  const escapeCell = (value: string): string => value.replace(/\|/g, "\\|");

  const lines: Array<string> = [
    `# ${moduleImportPath} Surface`,
    "",
    `Total exports: ${entries.length}`,
    "",
    "| Export | Kind | Overview |",
    "|---|---|---|",
  ];

  for (const entry of entries) {
    lines.push(
      `| \`${escapeCell(entry.exportName)}\` | \`${escapeCell(
        entry.exportKind
      )}\` | ${escapeCell(toOverview(entry.summary))} |`
    );
  }

  return `${lines.join("\n")}\n`;
};

const sanitizeFileSegment = (value: string): string => value.replace(/[^A-Za-z0-9_$-]/g, "_");

const resolveUniqueExportFilePath = (
  directory: string,
  fileStem: string,
  fileSuffix: string,
  usedPaths: Set<string>
): string => {
  let candidate = path.join(directory, `${fileStem}.${fileSuffix}.ts`);
  if (!usedPaths.has(candidate)) {
    usedPaths.add(candidate);
    return candidate;
  }

  let index = 2;
  for (;;) {
    candidate = path.join(directory, `${fileStem}_${index}.${fileSuffix}.ts`);
    if (!usedPaths.has(candidate)) {
      usedPaths.add(candidate);
      return candidate;
    }
    index++;
  }
};

const createProject = (): Project =>
  new Project({
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
    skipLoadingLibFiles: true,
    useInMemoryFileSystem: false,
  });

const generateModuleSurfaceWithProject = (options: GenerateModuleOptions, project: Project): GeneratedModuleResult => {
  const packageDirectory = findPackageDirectory(options.effectSmolRoot, options.packageName);
  const moduleSourcePathAbsolute = resolveModuleSourcePath(packageDirectory, options.moduleName);
  const moduleSourcePathRelative = normalizePath(path.relative(options.repoRoot, moduleSourcePathAbsolute));
  const moduleImportPath = `${options.packageName}/${options.moduleName}`;
  const sourceText = fs.readFileSync(moduleSourcePathAbsolute, "utf8");
  const moduleJSDoc = extractModuleJsDoc(sourceText);

  const parsed = parseModuleExports({
    moduleSourcePath: moduleSourcePathAbsolute,
    repoRoot: options.repoRoot,
    project,
  });

  const outputDirectory = moduleOutputDirectory(options.outputRoot, options.packageName, options.moduleName);
  const exportsDirectory = path.join(outputDirectory, "exports");
  const readmePath = path.join(outputDirectory, "README.md");
  const surfacePath = path.join(outputDirectory, "SURFACE.md");

  resetExportDirectories(outputDirectory, exportsDirectory, options.dryRun);

  writeFile(
    readmePath,
    renderModuleReadme(moduleImportPath, moduleSourcePathRelative, moduleJSDoc, parsed.diagnostics),
    options.dryRun
  );
  writeFile(surfacePath, renderModuleSurface(moduleImportPath, parsed.exports), options.dryRun);

  const usedPaths = new Set<string>();
  const exportFiles: Array<GeneratedExportFile> = [];
  for (const entry of parsed.exports) {
    const filePath = resolveUniqueExportFilePath(
      exportsDirectory,
      sanitizeFileSegment(entry.exportName),
      entry.exportKind,
      usedPaths
    );

    writeFile(
      filePath,
      renderExportFileFromTemplate({
        packageName: options.packageName,
        moduleName: options.moduleName,
        exportName: entry.exportName,
        exportKind: entry.exportKind,
        sourceRelativePath: entry.sourceRelativePath,
        summary: entry.summary,
        exampleCode: entry.exampleCode,
      }),
      options.dryRun
    );

    exportFiles.push({
      exportName: entry.exportName,
      exportKind: entry.exportKind,
      sourceRelativePath: entry.sourceRelativePath,
      summary: entry.summary,
      exampleCode: entry.exampleCode,
      filePath,
    });
  }

  return {
    packageName: options.packageName,
    moduleName: options.moduleName,
    moduleSourcePath: moduleSourcePathRelative,
    moduleReadmePath: readmePath,
    moduleSurfacePath: surfacePath,
    exportFiles,
    parserDiagnostics: parsed.diagnostics,
  };
};

const generatePackageSurfaceWithProject = (
  options: GeneratePackageOptions,
  project: Project,
  isImportResolvable: ((importPath: string) => boolean) | undefined
): GeneratedPackageResult => {
  const packageDirectory = findPackageDirectory(options.effectSmolRoot, options.packageName);
  const modules = listModulesForPackage(packageDirectory);
  const moduleResults: Array<GeneratedModuleResult> = [];

  for (const moduleName of modules) {
    if (options.resolvableImportsOnly === true) {
      const moduleImportPath = `${options.packageName}/${moduleName}`;
      if (isImportResolvable === undefined || isImportResolvable(moduleImportPath) === false) {
        continue;
      }
    }

    const result = generateModuleSurfaceWithProject(
      {
        ...options,
        moduleName,
      },
      project
    );
    moduleResults.push(result);
  }

  return {
    packageName: options.packageName,
    moduleResults,
  };
};

const toManifestModuleEntry = (moduleResult: GeneratedModuleResult): BootstrapManifestModuleEntry => ({
  moduleName: moduleResult.moduleName,
  sourcePath: moduleResult.moduleSourcePath,
  exportCount: moduleResult.exportFiles.length,
  parserDiagnostics: moduleResult.parserDiagnostics,
});

const toManifestPackageEntry = (packageResult: GeneratedPackageResult): BootstrapManifestPackageEntry => ({
  packageName: packageResult.packageName,
  moduleCount: packageResult.moduleResults.length,
  exportCount: packageResult.moduleResults.reduce((total, moduleResult) => total + moduleResult.exportFiles.length, 0),
  modules: packageResult.moduleResults.map(toManifestModuleEntry),
});

const buildManifest = (params: {
  readonly packageResults: ReadonlyArray<GeneratedPackageResult>;
  readonly effectSmolRoot: string;
  readonly outputRoot: string;
}): BootstrapManifest => {
  const packages = params.packageResults.map(toManifestPackageEntry);
  const moduleCount = packages.reduce((total, packageEntry) => total + packageEntry.moduleCount, 0);
  const exportCount = packages.reduce((total, packageEntry) => total + packageEntry.exportCount, 0);

  return {
    generatedAt: new Date().toISOString(),
    effectSmolRoot: params.effectSmolRoot,
    outputRoot: params.outputRoot,
    packageCount: packages.length,
    moduleCount,
    exportCount,
    packages,
  };
};

export const generateModuleSurface = (options: GenerateModuleOptions): GeneratedModuleResult => {
  const project = createProject();
  return generateModuleSurfaceWithProject(options, project);
};

export const generatePackageSurface = (options: GeneratePackageOptions): GeneratedPackageResult => {
  const project = createProject();
  const isImportResolvable =
    options.resolvableImportsOnly === true ? createImportResolver(options.repoRoot) : undefined;
  return generatePackageSurfaceWithProject(options, project, isImportResolvable);
};

export const generateRepositorySurface = (options: GenerateRepositoryOptions): GeneratedRepositoryResult => {
  const project = createProject();
  const discoveredPackages = discoverEffectPackages(options.effectSmolRoot)
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  let packageNames: Array<string>;
  if (options.packageNames !== undefined && options.packageNames.length > 0) {
    const selected = new Set(options.packageNames);
    packageNames = discoveredPackages.filter((name) => selected.has(name));
  } else if (options.packageName !== undefined) {
    packageNames = discoveredPackages.filter((name) => name === options.packageName);
  } else {
    packageNames = discoveredPackages;
  }

  if (packageNames.length === 0) {
    if (options.packageNames !== undefined && options.packageNames.length > 0) {
      throw new Error(`None of the requested packages were discovered: ${options.packageNames.join(", ")}`);
    }
    throw new Error(
      options.packageName === undefined
        ? "No packages were discovered in effect-smol."
        : `Package "${options.packageName}" was not discovered in effect-smol.`
    );
  }

  if (options.cleanPackageRoots === true) {
    cleanGeneratedPackageDirectories(options.outputRoot, discoveredPackages, options.dryRun);
  }

  const packageResults: Array<GeneratedPackageResult> = [];
  const isImportResolvable =
    options.resolvableImportsOnly === true ? createImportResolver(options.repoRoot) : undefined;
  for (const packageName of packageNames) {
    const packageResult = generatePackageSurfaceWithProject(
      {
        ...options,
        packageName,
      },
      project,
      isImportResolvable
    );

    if (packageResult.moduleResults.length === 0) {
      continue;
    }
    packageResults.push(packageResult);
  }

  if (packageResults.length === 0) {
    throw new Error(
      "No modules were generated. Try disabling the resolvable import filter or selecting installed packages."
    );
  }

  const manifest = buildManifest({
    packageResults,
    effectSmolRoot: options.effectSmolRoot,
    outputRoot: options.outputRoot,
  });

  const manifestPath = options.manifestPath ?? path.join(path.dirname(options.outputRoot), "MANIFEST.json");

  writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, options.dryRun);

  return {
    packageResults,
    manifestPath,
    manifest,
  };
};
