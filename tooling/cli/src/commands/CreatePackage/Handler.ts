/**
 * Package creation command - scaffold new packages following Effect v4 conventions.
 *
 * Generates package files via reusable services:
 * - TemplateService for template rendering
 * - FileGenerationPlanService for deterministic plan/execute
 * - Shared repo config synchronization after scaffolding
 *
 * @module
 * @since 0.0.0
 */

import { fileURLToPath } from "node:url";
import { $RepoCliId } from "@beep/identity/packages";
import {
  DomainError,
  decodePackageJsonEffect,
  encodePackageJsonCanonicalPrettyEffect,
  findRepoRoot,
  TSMorphService,
} from "@beep/repo-utils";
import { LiteralKit } from "@beep/schema";
import { Str as CommonStr, Text, thunkFalse } from "@beep/utils";
import { Console, DateTime, Effect, FileSystem, flow, Path, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Argument, Command, Flag } from "effect/unstable/cli";
import * as jsonc from "jsonc-parser";
import { SyntaxKind } from "ts-morph";
import { syncTsconfigAtRoot } from "../TsconfigSync.js";
import {
  createFileGenerationPlanService,
  FileGenerationPlanInput,
  PlannedFile,
  PlannedSymlink,
} from "./FileGenerationPlanService.js";
import { createTemplateService, TemplateRenderRequest, TemplateSpec } from "./TemplateService.js";

const $I = $RepoCliId.create("commands/CreatePackage/Handler");

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Build ordered template directory candidates for create-package execution.
 *
 * @param baseDir - Directory of the currently executing command module.
 * @param path - Path service used to compose normalized candidate paths.
 * @returns Candidate directories in preferred lookup order.
 * @category DomainModel
 * @since 0.0.0
 */

const templateDirCandidates = (baseDir: string, path: Path.Path): ReadonlyArray<string> => {
  const join = (...on: A.NonEmptyArray<string>) => path.join(baseDir, ...on);
  return A.make(join("..", "..", "..", "src", "commands", "CreatePackage", "templates"), join("templates"));
};

/**
 * Resolve create-package template directory for both src and dist runtimes.
 *
 * In source execution (`bun run src/bin.ts`), templates live beside this file.
 * In built execution (`dist/bin.js`), template resolution prefers packaged
 * source templates under `src/.../templates`.
 * A legacy dist fallback is retained so existing copied templates still work
 * in environments that already have them on disk.
 *
 * @param baseDir - Optional command module directory override (defaults to current module directory).
 * @returns Resolved template directory path.
 * @category DomainModel
 * @since 0.0.0
 */
export const resolveCreatePackageTemplateDir = Effect.fn(function* (
  baseDir: string = fileURLToPath(new URL(".", import.meta.url))
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const candidates = templateDirCandidates(baseDir, path);

  for (const candidate of candidates) {
    const exists = yield* fs.exists(candidate).pipe(Effect.orElseSucceed(thunkFalse));
    if (exists) {
      return candidate;
    }
  }

  return yield* new DomainError({
    message: `Unable to resolve create-package templates. Checked:\n${Text.joinLines(
      A.map(candidates, (candidate) => `  - ${candidate}`)
    )}`,
  });
});

/**
 * Valid package types.
 *
 * @category Configuration
 * @since 0.0.0
 */
const VALID_TYPES = ["library", "tool", "app"] as const;
const PACKAGE_NAME_PATTERN = /^[a-z_][a-z0-9._-]*$/;
const PARENT_DIR_PATTERN = /^(?!.*\/\/)(?!.*\/$)(?!.*(?:^|\/)\.{1,2}(?:\/|$))[a-z0-9][a-z0-9/_-]*$/;

const PackageType = LiteralKit(VALID_TYPES).annotate(
  $I.annote("PackageType", {
    description: "Supported package scaffold type.",
  })
);
type PackageType = typeof PackageType.Type;
const isPackageType = S.is(PackageType);
const decodePackageType = S.decodeUnknownSync(PackageType);
const packageTypeEquivalence = S.toEquivalence(PackageType);
const stringEquivalence = S.toEquivalence(S.String);

const ParentDir = S.String.check(S.isPattern(PARENT_DIR_PATTERN)).pipe(
  S.brand("ParentDir"),
  S.annotate(
    $I.annote("ParentDir", {
      description: "Validated repo-relative parent directory for package scaffolding.",
    })
  )
);
const isParentDir = S.is(ParentDir);

const PackageName = S.String.check(S.isPattern(PACKAGE_NAME_PATTERN)).pipe(
  S.brand("PackageName"),
  S.annotate(
    $I.annote("PackageName", {
      description: "Package name segment used for @beep scoped package creation.",
    })
  )
);
const isPackageName = S.is(PackageName);

/**
 * Mapping from template source to output path.
 *
 * @category Configuration
 * @since 0.0.0
 */
const TEMPLATE_SPECS: ReadonlyArray<TemplateSpec> = [
  new TemplateSpec({ templateName: "tsconfig.json.hbs", outputPath: "tsconfig.json" }),
  new TemplateSpec({ templateName: "src-index.ts.hbs", outputPath: "src/index.ts" }),
  new TemplateSpec({ templateName: "LICENSE.hbs", outputPath: "LICENSE" }),
  new TemplateSpec({ templateName: "README.md.hbs", outputPath: "README.md" }),
  new TemplateSpec({ templateName: "AGENTS.md.hbs", outputPath: "AGENTS.md" }),
  new TemplateSpec({ templateName: "ai-context.md.hbs", outputPath: "ai-context.md" }),
  new TemplateSpec({ templateName: "docgen.json.hbs", outputPath: "docgen.json" }),
  new TemplateSpec({ templateName: "vitest.config.ts.hbs", outputPath: "vitest.config.ts" }),
  new TemplateSpec({ templateName: "docs-index.md.hbs", outputPath: "docs/index.md" }),
];

/**
 * Ordered list of all generated files for dry-run and summary output.
 *
 * @category Configuration
 * @since 0.0.0
 */
const ALL_FILES = [
  "package.json",
  "tsconfig.json",
  "src/index.ts",
  "test/.gitkeep",
  "dtslint/.gitkeep",
  "LICENSE",
  "README.md",
  "AGENTS.md",
  "ai-context.md",
  "CLAUDE.md -> AGENTS.md (symlink)",
  "docgen.json",
  "vitest.config.ts",
  "docs/index.md",
] as const;

/**
 * Root-relative directories created for each package.
 *
 * @category Configuration
 * @since 0.0.0
 */
const PACKAGE_DIRECTORIES = ["src", "test", "dtslint", "docs"] as const;

const templateService = createTemplateService();
const fileGenerationPlanService = createFileGenerationPlanService();
const FORMATTING_OPTIONS: jsonc.FormattingOptions = {
  tabSize: 2,
  insertSpaces: true,
};
const IDENTITY_PACKAGES_FILE_PATH = "packages/common/identity/src/packages.ts" as const;

// ── Template context ──────────────────────────────────────────────────────────

/**
 * Variables passed into every template during package scaffolding.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TemplateContext extends S.Class<TemplateContext>($I`TemplateContext`)(
  {
    name: S.String,
    scopedName: S.String,
    type: PackageType,
    description: S.String,
    year: S.String,
    parentDir: ParentDir,
    packagePath: S.String,
    rootRelative: S.String,
    isTool: S.Boolean,
    isApp: S.Boolean,
    isLibrary: S.Boolean,
  },
  $I.annote("TemplateContext", {
    description: "Variables passed into every template during package scaffolding.",
  })
) {}

/**
 * Validate an optional parent directory override like `packages/common`.
 *
 * Must be repo-relative, normalized, and free of traversal segments.
 *
 * @param value - Parent directory override to validate.
 * @returns True when the override is safe and repo-relative.
 */
/**
 * Compute the path from a package directory back to repo root.
 *
 * Examples:
 * - `tooling/cli` maps to `../../`
 * - `packages/common/types` maps to `../../../`
 *
 * @param packagePath - Repo-relative package path.
 * @returns Relative path from the package directory to repo root.
 */
const toRootRelative = (packagePath: string): string => CommonStr.repeat("../", A.length(Str.split(packagePath, "/")));

const parseJsonDocument: {
  (content: string, filePath: string): Effect.Effect<unknown, DomainError, never>;
  (filePath: string): (content: string) => Effect.Effect<unknown, DomainError, never>;
} = dual(
  2,
  Effect.fn(function* (content: string, filePath: string) {
    return yield* S.decodeUnknownEffect(S.fromJsonString(S.Unknown))(content).pipe(
      Effect.mapError(
        (cause) =>
          new DomainError({
            message: `Failed to parse JSON in "${filePath}"`,
            cause,
          })
      )
    );
  })
);

const readRootPackageJsonDocument = Effect.fn(function* (repoRoot: string) {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const filePath = path.join(repoRoot, "package.json");
  const content = yield* fs
    .readFileString(filePath)
    .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to read "${filePath}"`, cause })));
  const parsed = yield* parseJsonDocument(content, filePath);
  const packageJson = yield* decodePackageJsonEffect(parsed).pipe(
    Effect.mapError(
      (cause) =>
        new DomainError({
          message: `Failed to decode package.json at "${filePath}"`,
          cause,
        })
    )
  );

  return {
    filePath,
    content,
    packageJson,
  } as const;
});

const workspacePatternsFromPackageJson = (
  workspaces: O.Option<ReadonlyArray<string> | { readonly packages?: ReadonlyArray<string> }>
): ReadonlyArray<string> => {
  if (O.isNone(workspaces)) {
    return A.empty();
  }

  const value: unknown = workspaces.value;
  if (A.isArray(value) && A.every(value, P.isString)) {
    return value;
  }

  if (
    P.isObject(value) &&
    P.hasProperty(value, "packages") &&
    A.isArray(value.packages) &&
    A.every(value.packages, P.isString)
  ) {
    return value.packages;
  }

  return A.empty();
};

const pathSegments: (value: string) => ReadonlyArray<string> = flow(Str.split("/"), A.filter(Str.isNonEmpty));

const matchesWorkspacePattern = (pattern: string, targetPath: string): boolean => {
  const patternSegments = pathSegments(pattern);
  const targetSegments = pathSegments(targetPath);

  if (A.length(patternSegments) !== A.length(targetSegments)) {
    return false;
  }

  return A.every(
    A.zip(patternSegments, targetSegments),
    ([patternSegment, targetSegment]) =>
      stringEquivalence(patternSegment, "*") || stringEquivalence(patternSegment, targetSegment)
  );
};

const isPathCoveredByWorkspacePatterns = (patterns: ReadonlyArray<string>, targetPath: string): boolean =>
  A.some(patterns, (pattern) => matchesWorkspacePattern(pattern, targetPath));

const applyJsoncModification = (
  content: string,
  path: jsonc.JSONPath,
  value: unknown,
  options?: jsonc.ModificationOptions
): string =>
  jsonc.applyEdits(
    content,
    jsonc.modify(content, path, value, {
      formattingOptions: FORMATTING_OPTIONS,
      ...options,
    })
  );

const appendWorkspaceEntry = (content: string, currentWorkspaces: unknown, packagePath: string): string => {
  if (P.isUndefined(currentWorkspaces)) {
    return applyJsoncModification(content, ["workspaces"], [packagePath]);
  }

  if (A.isArray(currentWorkspaces) && A.every(currentWorkspaces, P.isString)) {
    return applyJsoncModification(content, ["workspaces", A.length(currentWorkspaces)], packagePath, {
      isArrayInsertion: true,
    });
  }

  if (
    P.isObject(currentWorkspaces) &&
    P.hasProperty(currentWorkspaces, "packages") &&
    A.isArray(currentWorkspaces.packages) &&
    A.every(currentWorkspaces.packages, P.isString)
  ) {
    return applyJsoncModification(
      content,
      ["workspaces", "packages", A.length(currentWorkspaces.packages)],
      packagePath,
      {
        isArrayInsertion: true,
      }
    );
  }

  return P.isObject(currentWorkspaces)
    ? applyJsoncModification(content, ["workspaces", "packages"], [packagePath])
    : applyJsoncModification(content, ["workspaces"], [packagePath]);
};

const ensureRootWorkspaceEntry = Effect.fn(function* (repoRoot: string, packagePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const { content, filePath, packageJson } = yield* readRootPackageJsonDocument(repoRoot);
  const workspacePatterns = workspacePatternsFromPackageJson(packageJson.workspaces);

  if (isPathCoveredByWorkspacePatterns(workspacePatterns, packagePath)) {
    return false;
  }

  const currentWorkspaces: unknown = O.getOrUndefined(packageJson.workspaces);

  const nextContent = appendWorkspaceEntry(content, currentWorkspaces, packagePath);

  if (stringEquivalence(nextContent, content)) {
    return false;
  }

  yield* fs
    .writeFileString(filePath, nextContent)
    .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to write "${filePath}"`, cause })));
  return true;
});

const rootWorkspaceEntryNeeded = Effect.fn(function* (repoRoot: string, packagePath: string) {
  const { packageJson } = yield* readRootPackageJsonDocument(repoRoot);
  return !isPathCoveredByWorkspacePatterns(workspacePatternsFromPackageJson(packageJson.workspaces), packagePath);
});

const toIdentityAccessorName = (packageName: string): string => `$${CommonStr.pascalCase(packageName)}Id`;

const typedIdentityExportBlock = (packageName: string): string => {
  const accessorName = toIdentityAccessorName(packageName);
  return Text.joinLines([
    "",
    "/**",
    " * @since 0.0.0",
    " * @category Configuration",
    ` * @type {Identity.IdentityComposer<"@beep/${packageName}">}`,
    " */",
    `export const ${accessorName}: Identity.IdentityComposer<"@beep/${packageName}"> = composers.${accessorName};`,
  ]);
};

const ensureIdentityPackageRegistration = Effect.fn(function* (packageName: string) {
  const tsMorphService = yield* TSMorphService;
  return yield* tsMorphService.updateSourceFile(IDENTITY_PACKAGES_FILE_PATH, (sourceFile) => {
    const composersDeclaration = sourceFile.getVariableDeclarationOrThrow("composers");
    const composersCall = composersDeclaration.getInitializerIfKindOrThrow(SyntaxKind.CallExpression);
    const existingSegments = pipe(
      composersCall.getArguments(),
      A.flatMap((argument) => pipe(O.fromNullishOr(argument.asKind(SyntaxKind.StringLiteral)), O.toArray)),
      A.map((literal) => literal.getLiteralText())
    );

    if (!A.some(existingSegments, (segment) => stringEquivalence(segment, packageName))) {
      composersCall.addArgument(`"${packageName}"`);
    }

    const accessorName = toIdentityAccessorName(packageName);
    if (sourceFile.getVariableDeclaration(accessorName) === undefined) {
      sourceFile.addStatements(typedIdentityExportBlock(packageName));
    }
  });
});

const identityPackageRegistrationNeeded = Effect.fn(function* (repoRoot: string, packageName: string) {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const filePath = path.join(repoRoot, IDENTITY_PACKAGES_FILE_PATH);
  const content = yield* fs
    .readFileString(filePath)
    .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to read "${filePath}"`, cause })));

  const accessorName = toIdentityAccessorName(packageName);
  return !Str.includes(`"${packageName}"`)(content) || !Str.includes(`export const ${accessorName}`)(content);
});

// ── Command ───────────────────────────────────────────────────────────────────

/**
 * CLI command that scaffolds a new package with templates, a Schema-validated
 * `package.json`, root workspace registration, identity registration, and shared repo config synchronization.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const createPackageCommand = Command.make(
  "create-package",
  {
    name: Argument.string("name").pipe(Argument.withDescription("Package name (e.g. my-utils)")),
    type: Flag.string("type").pipe(
      Flag.withDescription("Package type: library, tool, or app"),
      Flag.withDefault("library")
    ),
    parentDir: Flag.string("parent-dir").pipe(
      Flag.withDescription("Optional output parent directory relative to repo root (e.g. packages/common)"),
      Flag.withDefault("")
    ),
    dirName: Flag.string("dir-name").pipe(
      Flag.withDescription(
        "Override folder name (defaults to package name). E.g. --dir-name domain for packages/shared/domain"
      ),
      Flag.withDefault("")
    ),
    description: Flag.string("description").pipe(Flag.withDescription("Package description"), Flag.withDefault("")),
    dryRun: Flag.boolean("dry-run").pipe(Flag.withDescription("Preview changes without writing files")),
  },
  Effect.fn(function* (config) {
    const { name, type, parentDir: parentDirOverride, dirName: dirNameOverride, description, dryRun } = config;

    // ── Validate type ──────────────────────────────────────────────────
    if (P.not(isPackageType)(type)) {
      return yield* new DomainError({
        message: `Invalid package type "${type}". Must be one of: ${A.join(VALID_TYPES, ", ")}`,
      });
    }
    const packageType = decodePackageType(type);

    // ── Validate package name ─────────────────────────────────────────
    if (!isPackageName(name)) {
      return yield* new DomainError({
        message: `Invalid package name "${name}". Must start with a lowercase letter or underscore, contain only [a-z0-9._-].`,
      });
    }

    // ── Resolve directory name ─────────────────────────────────────────
    const dirName = Str.isNonEmpty(dirNameOverride) ? dirNameOverride : name;
    if (Str.isNonEmpty(dirNameOverride) && !isPackageName(dirName)) {
      return yield* new DomainError({
        message: `Invalid dir name "${dirName}". Must start with a lowercase letter or underscore, contain only [a-z0-9._-].`,
      });
    }

    // ── Resolve parent directory ───────────────────────────────────────
    const defaultParentDir = packageTypeEquivalence(packageType, "app") ? "apps" : "tooling";
    const parentDir = Str.isNonEmpty(parentDirOverride) ? parentDirOverride : defaultParentDir;
    if (!isParentDir(parentDir)) {
      return yield* new DomainError({
        message: `Invalid parent dir "${parentDir}". Use a repo-relative path like "tooling", "apps", or "packages/common".`,
      });
    }
    const packagePath = `${parentDir}/${dirName}`;

    // ── Resolve services ───────────────────────────────────────────────
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // ── Discover repo root ─────────────────────────────────────────────
    const repoRoot = yield* findRepoRoot();

    // ── Determine output directory ─────────────────────────────────────
    const outputDir = path.join(repoRoot, packagePath);

    // ── Check if directory already exists (skip for dry-run) ───────────
    if (!dryRun) {
      const alreadyExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(thunkFalse));
      if (alreadyExists) {
        return yield* new DomainError({
          message: `Directory already exists: ${outputDir}\nRemove it first or choose a different package name.`,
        });
      }
    }

    // ── Dry-run: preview output and bootstrap repo mutations ───────────
    if (dryRun) {
      const workspaceEntryNeeded = yield* rootWorkspaceEntryNeeded(repoRoot, packagePath);
      const identityRegistrationMissing = yield* identityPackageRegistrationNeeded(repoRoot, name);

      yield* Console.log(`[dry-run] Would create package @beep/${name} (type: ${type})`);
      if (dirName !== name) {
        yield* Console.log(`[dry-run] Directory name: ${dirName} (overridden from package name "${name}")`);
      }
      yield* Console.log(`[dry-run] Directory: ${outputDir}`);
      yield* Console.log(`[dry-run] Files:`);
      for (const file of ALL_FILES) {
        yield* Console.log(`  - ${file}`);
      }
      yield* Console.log(`[dry-run] Root bootstrap updates:`);
      yield* Console.log(
        `  - package.json workspaces: ${workspaceEntryNeeded ? `Add "${packagePath}"` : "SKIP (already covered by an existing workspace entry)"}`
      );
      yield* Console.log(
        `  - ${IDENTITY_PACKAGES_FILE_PATH}: ${identityRegistrationMissing ? `Register "${name}" and export ${toIdentityAccessorName(name)}` : "SKIP (already registered)"}`
      );
      yield* Console.log(
        `[dry-run] Derived repo configs: shared sync runs after scaffolding to update tsconfig references, aliases, tstyche, syncpack, and docgen`
      );
      return;
    }

    // ── Build template context ─────────────────────────────────────────
    const currentYear = `${DateTime.getPartUtc(DateTime.nowUnsafe(), "year")}`;
    const ctx = new TemplateContext({
      name,
      scopedName: `@beep/${name}`,
      type: packageType,
      description,
      year: currentYear,
      parentDir,
      packagePath,
      rootRelative: toRootRelative(packagePath),
      isTool: packageTypeEquivalence(packageType, "tool"),
      isApp: packageTypeEquivalence(packageType, "app"),
      isLibrary: packageTypeEquivalence(packageType, "library"),
    });

    // ── Render templates and generate plan ─────────────────────────────
    const templateDir = yield* resolveCreatePackageTemplateDir();
    const templateFiles = yield* templateService.renderTemplates(
      new TemplateRenderRequest({
        templateDir,
        templates: TEMPLATE_SPECS,
        context: { ...ctx },
      })
    );

    const packageJson = yield* generatePackageJson(name, packageType, description, packagePath);

    const plan = fileGenerationPlanService.createPlan(
      new FileGenerationPlanInput({
        outputDir,
        directories: PACKAGE_DIRECTORIES,
        files: pipe(
          A.make(
            A.of(new PlannedFile({ relativePath: "package.json", content: packageJson })),
            A.map(templateFiles, (file) => new PlannedFile({ relativePath: file.outputPath, content: file.content })),
            [
              new PlannedFile({ relativePath: "test/.gitkeep", content: "" }),
              new PlannedFile({ relativePath: "dtslint/.gitkeep", content: "" }),
            ]
          ),
          A.flatten
        ),
        symlinks: A.of(new PlannedSymlink({ relativePath: "CLAUDE.md", target: "AGENTS.md" })),
      })
    );

    // ── Execute plan and repo mutations ────────────────────────────────
    yield* fileGenerationPlanService.executePlan(plan);

    const workspaceUpdated = yield* ensureRootWorkspaceEntry(repoRoot, packagePath);
    const identityUpdated = yield* ensureIdentityPackageRegistration(name);
    const syncResult = yield* syncTsconfigAtRoot(repoRoot, {
      mode: "sync",
      filter: undefined,
      verbose: false,
    });

    // ── Print summary ──────────────────────────────────────────────────
    yield* Console.log(`Created package @beep/${name} at ${outputDir}`);
    yield* Console.log(`Files created:`);
    for (const file of ALL_FILES) {
      yield* Console.log(`  - ${file}`);
    }
    if (workspaceUpdated || identityUpdated || syncResult.changedFiles > 0) {
      yield* Console.log(`\nRepo registration and config sync:`);
      if (workspaceUpdated) {
        yield* Console.log(`  - package.json: added workspace "${packagePath}"`);
      }
      if (identityUpdated) {
        yield* Console.log(
          `  - ${IDENTITY_PACKAGES_FILE_PATH}: registered "${name}" as ${toIdentityAccessorName(name)}`
        );
      }
      for (const change of syncResult.changes) {
        yield* Console.log(`  - ${path.relative(repoRoot, change.filePath)} [${change.section}] ${change.summary}`);
      }
    }
    yield* Console.log(`\nNext steps:`);
    yield* Console.log(`  1. Run "bun install" to link the new package`);
    yield* Console.log(`  2. Start building in src/index.ts`);
  })
).pipe(Command.withDescription("Create a new package following Effect v4 conventions"));

// ── Template generators ────────────────────────────────────────────────────

/**
 * Build a pretty-printed `package.json` string for a new package.
 *
 * Constructs the package manifest object with standard scripts, exports map,
 * and publish configuration, then encodes it through the repo-utils canonical
 * package.json encoder to guarantee structural validity and stable formatting.
 *
 * @param name - The unscoped package name (e.g. `"my-utils"`). Will be prefixed with `@beep/`.
 * @param type - One of `"library"`, `"tool"`, or `"app"`. Tools receive an extra `@effect/platform-node` dependency.
 * @param description - Human-readable package description for the `"description"` field.
 * @param packagePath - Package path relative to repo root (e.g. `"tooling/my-utils"`).
 * @returns A JSON string (with trailing newline) ready to be written to disk.
 * @category Utility
 * @since 0.0.0
 */
const generatePackageJson: (
  name: string,
  type: PackageType,
  description: string,
  packagePath: string
) => Effect.Effect<string, DomainError | S.SchemaError> = Effect.fn(function* (name, type, description, packagePath) {
  const rootRelative = toRootRelative(packagePath);
  const babelScript = "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps";
  const dependencies: Record<string, string> = {
    effect: "catalog:",
  };

  if (packageTypeEquivalence(type, "tool")) {
    dependencies["@effect/platform-node"] = "catalog:";
  }

  const pkg = {
    name: `@beep/${name}`,
    version: "0.0.0",
    type: "module",
    private: true,
    license: "MIT",
    description,
    homepage: `https://github.com/kriegcloud/beep-effect/tree/main/${packagePath}`,
    repository: {
      type: "git",
      url: "git@github.com:kriegcloud/beep-effect.git",
      directory: packagePath,
    },
    sideEffects: [],
    exports: {
      "./package.json": "./package.json",
      ".": "./src/index.ts",
      "./*": "./src/*.ts",
      "./internal/*": null,
    },
    files: ["src/**/*.ts", "dist/**/*.js", "dist/**/*.js.map", "dist/**/*.d.ts", "dist/**/*.d.ts.map"],
    publishConfig: {
      access: "public",
      provenance: true,
      exports: {
        "./package.json": "./package.json",
        ".": "./dist/index.ts",
        "./*": "./dist/*.js",
        "./internal/*": null,
      },
    },
    scripts: {
      audit: "beep-cli audit",
      babel: babelScript,
      "beep:audit": "bun run beep:build && bun run beep:check && bun run beep:test && bun run beep:lint",
      "beep:build": "tsc -b tsconfig.json && bun run babel",
      "beep:check": "tsgo -b tsconfig.json",
      "beep:lint": "biome check .",
      "beep:lint:fix": "biome check . --write",
      "beep:test": "bunx --bun vitest run --passWithNoTests",
      build: "beep-cli build",
      check: "beep-cli check",
      coverage: "bunx --bun vitest run --coverage --passWithNoTests",
      docgen: `bun run ${rootRelative}tooling/docgen/src/bin.ts`,
      lint: "beep-cli lint",
      "lint:fix": "beep-cli lint --fix",
      test: "beep-cli test",
    },
    dependencies,
    devDependencies: {
      "@types/node": "catalog:",
      "@effect/vitest": "catalog:",
    },
  };

  const json = yield* encodePackageJsonCanonicalPrettyEffect(pkg);
  return `${json}\n`;
});
