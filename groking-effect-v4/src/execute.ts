import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { generateModuleSurface, generatePackageSurface, generateRepositorySurface } from "./generator/generate.ts";

interface CliFlags {
  readonly packageName: string | undefined;
  readonly packageNames: ReadonlyArray<string> | undefined;
  readonly moduleName: string | undefined;
  readonly effectSmolRoot: string | undefined;
  readonly outputRoot: string | undefined;
  readonly manifestPath: string | undefined;
  readonly allPackages: boolean;
  readonly resolvableOnly: boolean;
  readonly formatWrite: boolean;
  readonly dryRun: boolean;
}

type Command = "generate" | "bootstrap";

const parseFlags = (rawFlags: ReadonlyArray<string>): CliFlags => {
  let packageName: string | undefined;
  let packageNames: ReadonlyArray<string> | undefined;
  let moduleName: string | undefined;
  let effectSmolRoot: string | undefined;
  let outputRoot: string | undefined;
  let manifestPath: string | undefined;
  let allPackages = false;
  let resolvableOnly = true;
  let formatWrite = true;
  let dryRun = false;

  const requireValue = (index: number, flag: string): string => {
    const value = rawFlags[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for ${flag}`);
    }
    return value;
  };

  for (let index = 0; index < rawFlags.length; index++) {
    const flag = rawFlags[index];
    if (flag === "--package") {
      packageName = requireValue(index, flag);
      index++;
      continue;
    }
    if (flag === "--module") {
      moduleName = requireValue(index, flag);
      index++;
      continue;
    }
    if (flag === "--packages") {
      packageNames = requireValue(index, flag)
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
      index++;
      continue;
    }
    if (flag === "--effect-smol-root") {
      effectSmolRoot = requireValue(index, flag);
      index++;
      continue;
    }
    if (flag === "--output-root") {
      outputRoot = requireValue(index, flag);
      index++;
      continue;
    }
    if (flag === "--manifest") {
      manifestPath = requireValue(index, flag);
      index++;
      continue;
    }
    if (flag === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (flag === "--all-packages") {
      allPackages = true;
      continue;
    }
    if (flag === "--no-resolvable-filter") {
      resolvableOnly = false;
      continue;
    }
    if (flag === "--no-format") {
      formatWrite = false;
      continue;
    }

    throw new Error(`Unknown flag: ${flag}`);
  }

  return {
    packageName,
    packageNames,
    moduleName,
    effectSmolRoot,
    outputRoot,
    manifestPath,
    allPackages,
    resolvableOnly,
    formatWrite,
    dryRun,
  };
};

const resolveRoots = (
  flags: CliFlags
): {
  repoRoot: string;
  packageRoot: string;
  effectSmolRoot: string;
  outputRoot: string;
  manifestPath: string | undefined;
} => {
  const thisFile = fileURLToPath(import.meta.url);
  const packageRoot = path.resolve(path.dirname(thisFile), "..");
  const repoRoot = path.resolve(packageRoot, "..");

  const effectSmolRoot =
    flags.effectSmolRoot === undefined
      ? path.join(repoRoot, ".repos/effect-smol")
      : path.resolve(process.cwd(), flags.effectSmolRoot);

  const outputRoot =
    flags.outputRoot === undefined ? path.join(packageRoot, "src") : path.resolve(process.cwd(), flags.outputRoot);

  const manifestPath = flags.manifestPath === undefined ? undefined : path.resolve(process.cwd(), flags.manifestPath);

  return {
    repoRoot,
    packageRoot,
    effectSmolRoot,
    outputRoot,
    manifestPath,
  };
};

const detectCommand = (
  args: ReadonlyArray<string>
): {
  command: Command;
  flagArgs: ReadonlyArray<string>;
} => {
  const first = args[0];
  if (first === "generate" || first === "bootstrap") {
    return {
      command: first,
      flagArgs: args.slice(1),
    };
  }

  return {
    command: "generate",
    flagArgs: args,
  };
};

const verifyRepositoryOutput = (
  outputRoot: string
): {
  moduleCount: number;
  invalidModules: ReadonlyArray<string>;
} => {
  const moduleDirectories = new Set<string>();

  const walk = (directory: string): void => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name === "SURFACE.md") {
        moduleDirectories.add(path.dirname(entryPath));
      }
    }
  };

  if (fs.existsSync(outputRoot)) {
    walk(outputRoot);
  }

  const invalid: Array<string> = [];
  for (const moduleDirectory of moduleDirectories) {
    const readmePath = path.join(moduleDirectory, "README.md");
    const surfacePath = path.join(moduleDirectory, "SURFACE.md");
    const exportsPath = path.join(moduleDirectory, "exports");

    if (!fs.existsSync(readmePath) || !fs.existsSync(surfacePath)) {
      invalid.push(moduleDirectory);
      continue;
    }

    if (!fs.existsSync(exportsPath) || !fs.statSync(exportsPath).isDirectory()) {
      invalid.push(moduleDirectory);
    }
  }

  return {
    moduleCount: moduleDirectories.size,
    invalidModules: invalid.sort((a, b) => a.localeCompare(b)),
  };
};

const runBiomeWrite = (targetPath: string, cwd: string): void => {
  execFileSync("bunx", ["biome", "check", targetPath, "--write"], {
    cwd,
    stdio: "inherit",
  });
};

const runGenerateCommand = (flags: CliFlags): void => {
  const resolved = resolveRoots(flags);
  const packageName = flags.packageName ?? "effect";

  if (flags.moduleName !== undefined) {
    const result = generateModuleSurface({
      packageName,
      moduleName: flags.moduleName,
      effectSmolRoot: resolved.effectSmolRoot,
      outputRoot: resolved.outputRoot,
      repoRoot: resolved.repoRoot,
      dryRun: flags.dryRun,
    });

    console.log(
      [
        `Generated module: ${result.packageName}/${result.moduleName}`,
        `Exports: ${result.exportFiles.length}`,
        `README: ${result.moduleReadmePath}`,
        `SURFACE: ${result.moduleSurfacePath}`,
        `Parser (AST/TS-Morph/Merged): ${result.parserDiagnostics.astExportCount}/${result.parserDiagnostics.tsMorphExportCount}/${result.parserDiagnostics.mergedExportCount}`,
      ].join("\n")
    );
    return;
  }

  const packageResult = generatePackageSurface({
    packageName,
    effectSmolRoot: resolved.effectSmolRoot,
    outputRoot: resolved.outputRoot,
    repoRoot: resolved.repoRoot,
    resolvableImportsOnly: flags.resolvableOnly,
    dryRun: flags.dryRun,
  });

  const exportCount = packageResult.moduleResults.reduce((total, result) => total + result.exportFiles.length, 0);

  console.log(
    [
      `Generated package: ${packageResult.packageName}`,
      `Modules: ${packageResult.moduleResults.length}`,
      `Exports: ${exportCount}`,
    ].join("\n")
  );
};

const runBootstrapCommand = (flags: CliFlags): void => {
  const resolved = resolveRoots(flags);

  const packageNames =
    flags.allPackages === true
      ? undefined
      : flags.packageNames !== undefined
        ? flags.packageNames
        : flags.packageName === undefined
          ? ["effect"]
          : undefined;

  const repositoryResult = generateRepositorySurface({
    effectSmolRoot: resolved.effectSmolRoot,
    outputRoot: resolved.outputRoot,
    repoRoot: resolved.repoRoot,
    ...(flags.packageName === undefined ? {} : { packageName: flags.packageName }),
    ...(packageNames === undefined ? {} : { packageNames }),
    ...(resolved.manifestPath === undefined ? {} : { manifestPath: resolved.manifestPath }),
    resolvableImportsOnly: flags.resolvableOnly,
    cleanPackageRoots: true,
    dryRun: flags.dryRun,
  });

  if (flags.dryRun === false && flags.formatWrite === true) {
    runBiomeWrite(resolved.packageRoot, resolved.repoRoot);
  }

  const verification = verifyRepositoryOutput(resolved.outputRoot);
  const parityDiffModules = repositoryResult.manifest.packages.flatMap((packageEntry) =>
    packageEntry.modules
      .filter(
        (moduleEntry) =>
          moduleEntry.parserDiagnostics.missingInAst.length > 0 ||
          moduleEntry.parserDiagnostics.missingInTsMorph.length > 0
      )
      .map((moduleEntry) => `${packageEntry.packageName}/${moduleEntry.moduleName}`)
  );

  console.log(
    [
      "Bootstrapped groking-effect-v4 from effect-smol",
      `Packages: ${repositoryResult.manifest.packageCount}`,
      `Modules: ${repositoryResult.manifest.moduleCount}`,
      `Exports: ${repositoryResult.manifest.exportCount}`,
      `Manifest: ${repositoryResult.manifestPath}`,
      `Verified module folders: ${verification.moduleCount}`,
      `Invalid module folders: ${verification.invalidModules.length}`,
      `Parser parity differences: ${parityDiffModules.length}`,
    ].join("\n")
  );

  if (verification.invalidModules.length > 0) {
    console.log("\nInvalid module folders:");
    for (const invalidModule of verification.invalidModules.slice(0, 30)) {
      console.log(`- ${invalidModule}`);
    }
  }

  if (parityDiffModules.length > 0) {
    console.log("\nParser parity differences (sample):");
    for (const moduleName of parityDiffModules.slice(0, 30)) {
      console.log(`- ${moduleName}`);
    }
  }
};

const main = (): void => {
  const args = process.argv.slice(2);
  const { command, flagArgs } = detectCommand(args);
  const flags = parseFlags(flagArgs);

  if (command === "generate") {
    runGenerateCommand(flags);
    return;
  }

  runBootstrapCommand(flags);
};

main();
