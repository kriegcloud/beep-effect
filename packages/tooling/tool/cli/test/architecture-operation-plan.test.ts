import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyCanonicalSliceOperationPlan,
  architectureCommand,
  CanonicalSliceOperationPlan,
  checkCanonicalSliceOperationPlan,
  decodeCanonicalSliceOperationPlanJson,
  encodeCanonicalSliceOperationPlanJson,
  makeArchitectureOperationPlan,
  makeArchitecturePackageOperationPlan,
  makeCanonicalSliceOperationPlan,
  WriteFileOperation,
  WritePackageJsonOperation,
} from "@beep/repo-cli/commands/Architecture/index";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Order, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";

const repoRoot = fileURLToPath(new URL("../../../../..", import.meta.url));
const architectureFixtureManifestPath = join(
  repoRoot,
  "packages/tooling/tool/cli/test/fixtures/architecture-operation-plan/accepted-work-item-manifest.json"
);
const architectureProofRoots = [
  "packages/architecture-lab",
  "apps/architecture-lab-proof",
  "packages/_internal/db-admin",
] as const;
const architectureGeneratedSurfaceSegments = ["/dist/", "/docs/", "/.turbo/", "/node_modules/"] as const;
const sliceTopLevelManifestFiles = [
  "AGENTS.md",
  "LICENSE",
  "README.md",
  "docgen.json",
  "package.json",
  "tsconfig.json",
  "vitest.config.ts",
] as const;
const dbAdminTopLevelManifestFiles = [
  "AGENTS.md",
  "LICENSE",
  "README.md",
  "docgen.json",
  "drizzle.config.ts",
  "package.json",
  "tsconfig.json",
  "tsconfig.drizzle.json",
  "vitest.config.ts",
] as const;
const CommandTestLayer = Layer.mergeAll(NodeServices.layer, TestConsole.layer);
const runArchitectureCommand = Command.runWith(architectureCommand, { version: "0.0.0" });

const PackageJsonPublishConfig = S.Struct({
  exports: S.Record(S.String, S.NullOr(S.String)),
  publishConfig: S.Struct({
    exports: S.Record(S.String, S.NullOr(S.String)),
  }),
});
const decodePackageJsonPublishConfig = S.decodeUnknownEffect(S.fromJsonString(PackageJsonPublishConfig));
const ArchitectureFixtureManifest = S.Struct({
  schemaVersion: S.Literal("architecture-fixture-manifest/v1"),
  acceptedOracle: S.String,
  includedSurfaces: S.Array(S.String),
  excludedSurfaces: S.Array(S.String),
});
const decodeArchitectureFixtureManifest = S.decodeUnknownEffect(S.fromJsonString(ArchitectureFixtureManifest));

const isGeneratedArchitectureSurface = (repoPath: string): boolean =>
  pipe(
    architectureGeneratedSurfaceSegments,
    A.some((segment) => Str.includes(segment)(repoPath))
  ) || Str.endsWith("JSDOC_ANALYSIS.md")(repoPath);

const isManifestIncludedRelativeFile = (
  repoPath: string,
  topLevelFiles: ReadonlyArray<string>,
  includeDrizzle = false
): boolean =>
  pipe(topLevelFiles, A.contains(repoPath)) ||
  Str.startsWith("src/")(repoPath) ||
  Str.startsWith("test/")(repoPath) ||
  Str.startsWith("dtslint/")(repoPath) ||
  (includeDrizzle && Str.startsWith("drizzle/")(repoPath));

const isManifestIncludedArchitectureProofFile = (repoPath: string): boolean => {
  if (Str.startsWith("packages/architecture-lab/")(repoPath)) {
    const relativePath = pipe(
      Str.replace("packages/architecture-lab/", "")(repoPath),
      Str.split("/"),
      A.drop(1),
      A.join("/")
    );
    return isManifestIncludedRelativeFile(relativePath, sliceTopLevelManifestFiles);
  }
  if (Str.startsWith("apps/architecture-lab-proof/")(repoPath)) {
    return isManifestIncludedRelativeFile(
      Str.replace("apps/architecture-lab-proof/", "")(repoPath),
      sliceTopLevelManifestFiles
    );
  }
  if (Str.startsWith("packages/_internal/db-admin/")(repoPath)) {
    return isManifestIncludedRelativeFile(
      Str.replace("packages/_internal/db-admin/", "")(repoPath),
      dbAdminTopLevelManifestFiles,
      true
    );
  }
  return false;
};

const collectFiles = (rootDir: string, repoPath: string): ReadonlyArray<string> => {
  const absolutePath = join(rootDir, repoPath);
  if (!existsSync(absolutePath)) return [];
  const entries = readdirSync(absolutePath, { withFileTypes: true });
  const files: Array<string> = [];
  for (const entry of entries) {
    const childRepoPath = `${repoPath}/${entry.name}`;
    if (isGeneratedArchitectureSurface(childRepoPath)) continue;
    if (entry.isDirectory()) {
      files.push(...collectFiles(rootDir, childRepoPath));
    } else if (isManifestIncludedArchitectureProofFile(childRepoPath)) {
      files.push(childRepoPath);
    }
  }
  return files;
};

const collectAcceptedArchitectureProofFiles = Effect.fn(function* () {
  const manifest = yield* decodeArchitectureFixtureManifest(readFileSync(architectureFixtureManifestPath, "utf8"));
  expect(manifest.acceptedOracle).toBe("live architecture-lab WorkItem proof");
  return pipe(
    architectureProofRoots,
    A.flatMap((proofRoot) => collectFiles(repoRoot, proofRoot)),
    A.sort(Order.String)
  );
});

describe("architecture operation plan", () => {
  it.effect("round-trips as schema-decoded JSON", () =>
    Effect.gen(function* () {
      const plan = makeCanonicalSliceOperationPlan();
      const json = yield* encodeCanonicalSliceOperationPlanJson(plan);
      const decoded = yield* decodeCanonicalSliceOperationPlanJson(json);

      expect(decoded.slice).toEqual({
        boundedContext: "architecture-lab",
        aggregate: "WorkItem",
        aggregatePath: "aggregates/WorkItem",
      });
      expect(decoded.roles.map((role) => role.path)).toContain("packages/architecture-lab/domain");
      expect(decoded.operations.map((operation) => operation.path)).toContain(
        "packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.model.ts"
      );
      expect(decoded.operations[0]?.operationId).toContain(":");
      expect(decoded.operations[0]?.operationSource).toBe("accepted-proof");
    })
  );

  it.effect("decodes older v1 operation JSON with metadata defaults", () =>
    Effect.gen(function* () {
      const rootDir = join(tmpdir(), `beep-architecture-legacy-plan-${Date.now()}`);
      const operationPath = "packages/architecture-lab/domain/src/index.ts";
      const legacyJson = `{
  "schemaVersion": "architecture-operation-plan/v1",
  "target": {
    "boundedContext": "architecture-lab",
    "concept": "WorkItem",
    "domainKind": "aggregates",
    "conceptPath": "aggregates/WorkItem",
    "stage": "full"
  },
  "roles": [
    {
      "role": "domain",
      "packageName": "@beep/architecture-lab-domain",
      "path": "packages/architecture-lab/domain",
      "exports": ["."]
    }
  ],
  "operations": [
    {
      "kind": "write-file",
      "role": "domain",
      "path": "${operationPath}",
      "writer": "template",
      "content": "export {}\\n",
      "description": "Legacy v1 write."
    }
  ]
}`;
      mkdirSync(join(rootDir, "packages/architecture-lab/domain/src"), { recursive: true });
      writeFileSync(join(rootDir, operationPath), "export {}\n");

      const decoded = yield* decodeCanonicalSliceOperationPlanJson(legacyJson);
      const result = yield* checkCanonicalSliceOperationPlan(rootDir, decoded).pipe(Effect.provide(NodeServices.layer));

      rmSync(rootDir, { force: true, recursive: true });
      expect(decoded.operations[0]?.operationId).toBe("legacy-operation");
      expect(decoded.operations[0]?.operationSource).toBe("legacy-plan");
      expect(decoded.operations[0]?.writeMode).toBe("write-if-missing");
      expect(result.operationStatuses[0]).toMatchObject({
        operationId: `write-file:${operationPath}`,
        status: "matching",
      });
    })
  );

  it.effect("reports idempotency from the decoded operation list", () =>
    Effect.gen(function* () {
      const rootDir = join(tmpdir(), `beep-architecture-plan-${Date.now()}`);
      const requiredFile = "packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.model.ts";
      mkdirSync(join(rootDir, "packages/architecture-lab/domain/src/aggregates/WorkItem"), { recursive: true });
      writeFileSync(join(rootDir, requiredFile), "export {}\n");

      const plan = makeCanonicalSliceOperationPlan();
      const result = yield* checkCanonicalSliceOperationPlan(
        rootDir,
        new CanonicalSliceOperationPlan({
          ...plan,
          operations: plan.operations.filter((operation) => operation.path === requiredFile),
        })
      ).pipe(Effect.provide(NodeServices.layer));

      rmSync(rootDir, { force: true, recursive: true });
      expect(result.idempotent).toBe(true);
    })
  );

  it.effect("generates every manifest-included WorkItem proof file and second apply is a no-op", () =>
    Effect.gen(function* () {
      const tempRoot = join(tmpdir(), `beep-architecture-generated-${Date.now()}`);
      const acceptedFiles = yield* collectAcceptedArchitectureProofFiles();

      const proof = yield* Effect.gen(function* () {
        const plan = yield* makeArchitectureOperationPlan(repoRoot).pipe(Effect.provide(NodeServices.layer));
        const firstApply = yield* applyCanonicalSliceOperationPlan(tempRoot, plan).pipe(
          Effect.provide(NodeServices.layer)
        );
        const check = yield* checkCanonicalSliceOperationPlan(tempRoot, plan).pipe(Effect.provide(NodeServices.layer));
        const secondApply = yield* applyCanonicalSliceOperationPlan(tempRoot, plan).pipe(
          Effect.provide(NodeServices.layer)
        );
        const plannedWritePaths = pipe(
          plan.operations,
          A.filter((operation) => operation.kind === "write-file" || operation.kind === "write-package-json"),
          A.map((operation) => operation.path),
          A.sort(Order.String)
        );
        const generatedComparisons = pipe(
          acceptedFiles,
          A.map((acceptedPath) => ({
            accepted: readFileSync(join(repoRoot, acceptedPath), "utf8"),
            acceptedPath,
            generated: readFileSync(join(tempRoot, acceptedPath), "utf8"),
          }))
        );

        return { check, firstApply, generatedComparisons, plan, plannedWritePaths, secondApply };
      }).pipe(Effect.ensuring(Effect.sync(() => rmSync(tempRoot, { force: true, recursive: true }))));

      for (const { accepted, acceptedPath, generated } of proof.generatedComparisons) {
        expect(generated, acceptedPath).toBe(accepted);
      }
      expect(proof.plannedWritePaths).toEqual(acceptedFiles);
      expect(pipe(proof.firstApply.writtenPaths, A.sort(Order.String))).toEqual(acceptedFiles);
      expect(proof.check.idempotent).toBe(true);
      expect(proof.check.operationStatuses.length).toBe(proof.plan.operations.length);
      expect(proof.secondApply.writtenPaths).toEqual([]);
      expect(proof.secondApply.skippedPaths.length).toBeGreaterThan(0);
    })
  );

  it.effect("generates a complete non-default aggregate slice plan with package scaffolds", () =>
    Effect.gen(function* () {
      const tempRoot = join(tmpdir(), `beep-architecture-demo-generated-${Date.now()}`);

      const plan = yield* makeArchitectureOperationPlan(repoRoot, {
        boundedContext: "research-lab",
        concept: "Ticket",
        domainKind: "aggregates",
        stage: "core",
      }).pipe(Effect.provide(NodeServices.layer));
      const firstApply = yield* applyCanonicalSliceOperationPlan(tempRoot, plan).pipe(
        Effect.provide(NodeServices.layer)
      );
      const check = yield* checkCanonicalSliceOperationPlan(tempRoot, plan).pipe(Effect.provide(NodeServices.layer));

      rmSync(tempRoot, { force: true, recursive: true });
      expect(firstApply.writtenPaths).toContain("packages/research-lab/domain/package.json");
      expect(firstApply.writtenPaths).toContain("packages/research-lab/domain/src/index.ts");
      expect(firstApply.writtenPaths).toContain("packages/research-lab/domain/src/identity/ResearchLab.ts");
      expect(firstApply.writtenPaths).toContain("packages/research-lab/domain/src/aggregates/Ticket/Ticket.model.ts");
      expect(check.idempotent).toBe(true);
    })
  );

  it.effect("rejects operation paths that escape the repository root before writing files", () =>
    Effect.gen(function* () {
      const rootName = `beep-architecture-escape-${Date.now()}`;
      const tempRoot = join(tmpdir(), rootName);
      const outsideFileName = `${rootName}-outside.txt`;
      const outsidePath = join(tmpdir(), outsideFileName);
      const plan = makeCanonicalSliceOperationPlan();
      const escapedPlan = new CanonicalSliceOperationPlan({
        ...plan,
        operations: [
          new WriteFileOperation({
            kind: "write-file",
            role: "domain",
            path: `../${outsideFileName}`,
            writer: "template",
            content: "escaped\n",
            description: "Escaping write must be rejected.",
          }),
        ],
      });

      const error = yield* applyCanonicalSliceOperationPlan(tempRoot, escapedPlan).pipe(
        Effect.provide(NodeServices.layer),
        Effect.flip
      );
      const outsideExists = existsSync(outsidePath);

      rmSync(tempRoot, { force: true, recursive: true });
      rmSync(outsidePath, { force: true });
      expect(error.message).toContain("Architecture operation path escapes repository root");
      expect(outsideExists).toBe(false);
    })
  );

  it.effect("keeps global db-admin state out of non-default persistence slice plans", () =>
    Effect.gen(function* () {
      const tempRoot = join(tmpdir(), `beep-architecture-persistence-generated-${Date.now()}`);

      const plan = yield* makeArchitectureOperationPlan(repoRoot, {
        boundedContext: "research-lab",
        concept: "Ticket",
        domainKind: "aggregates",
        stage: "persistence",
      }).pipe(Effect.provide(NodeServices.layer));
      const checkAfterApply = yield* applyCanonicalSliceOperationPlan(tempRoot, plan).pipe(
        Effect.flatMap(() => checkCanonicalSliceOperationPlan(tempRoot, plan)),
        Effect.provide(NodeServices.layer)
      );
      const plannedPaths = plan.operations.map((operation) => operation.path);

      rmSync(tempRoot, { force: true, recursive: true });
      expect(plannedPaths.every((operationPath) => !operationPath.startsWith("packages/_internal/db-admin/"))).toBe(
        true
      );
      expect(plannedPaths.every((operationPath) => !operationPath.includes("architecture_lab_work_item"))).toBe(true);
      expect(checkAfterApply.idempotent).toBe(true);
    })
  );

  it.effect("generates the accepted Worker entity archetype without aggregate-only roles", () =>
    Effect.gen(function* () {
      const tempRoot = join(tmpdir(), `beep-architecture-worker-generated-${Date.now()}`);
      const acceptedPath = "packages/architecture-lab/domain/src/entities/Worker/Worker.model.ts";

      const plan = yield* makeArchitectureOperationPlan(
        repoRoot,
        {
          boundedContext: "architecture-lab",
          concept: "Worker",
          domainKind: "entities",
          stage: "full",
        },
        O.none()
      ).pipe(Effect.provide(NodeServices.layer));
      const firstApply = yield* applyCanonicalSliceOperationPlan(tempRoot, plan).pipe(
        Effect.provide(NodeServices.layer)
      );

      const generated = readFileSync(join(tempRoot, acceptedPath), "utf8");
      const accepted = readFileSync(join(repoRoot, acceptedPath), "utf8");
      const plannedRoles = plan.roles.map((role) => role.role);

      rmSync(tempRoot, { force: true, recursive: true });
      expect(firstApply.writtenPaths).toContain(acceptedPath);
      expect(generated).toBe(accepted);
      expect(plannedRoles).toEqual(["domain", "use-cases", "server", "tables", "db-admin"]);
      expect(plan.operations.map((operation) => operation.path)).not.toContain(
        "packages/architecture-lab/ui/src/aggregates/WorkItem/WorkItem.view-model.ts"
      );
    })
  );

  it.effect("keeps existing entity and value archetype plans idempotent against the accepted checkout", () =>
    Effect.gen(function* () {
      const workerPlan = yield* makeArchitectureOperationPlan(repoRoot, {
        boundedContext: "architecture-lab",
        concept: "Worker",
        domainKind: "entities",
        stage: "full",
      }).pipe(Effect.provide(NodeServices.layer));
      const priorityPlan = yield* makeArchitectureOperationPlan(repoRoot, {
        boundedContext: "architecture-lab",
        concept: "WorkPriority",
        domainKind: "values",
        stage: "full",
      }).pipe(Effect.provide(NodeServices.layer));
      const workerCheck = yield* checkCanonicalSliceOperationPlan(repoRoot, workerPlan).pipe(
        Effect.provide(NodeServices.layer)
      );
      const priorityCheck = yield* checkCanonicalSliceOperationPlan(repoRoot, priorityPlan).pipe(
        Effect.provide(NodeServices.layer)
      );

      expect(workerCheck.idempotent).toBe(true);
      expect(priorityCheck.idempotent).toBe(true);
    })
  );

  it.effect("generates the accepted WorkPriority value archetype as domain-only", () =>
    Effect.gen(function* () {
      const tempRoot = join(tmpdir(), `beep-architecture-priority-generated-${Date.now()}`);
      const acceptedPath = "packages/architecture-lab/domain/src/values/WorkPriority/WorkPriority.model.ts";

      const plan = yield* makeArchitectureOperationPlan(repoRoot, {
        boundedContext: "architecture-lab",
        concept: "WorkPriority",
        domainKind: "values",
        stage: "full",
      }).pipe(Effect.provide(NodeServices.layer));
      const firstApply = yield* applyCanonicalSliceOperationPlan(tempRoot, plan).pipe(
        Effect.provide(NodeServices.layer)
      );

      const generated = readFileSync(join(tempRoot, acceptedPath), "utf8");
      const accepted = readFileSync(join(repoRoot, acceptedPath), "utf8");

      rmSync(tempRoot, { force: true, recursive: true });
      expect(firstApply.writtenPaths).toContain(acceptedPath);
      expect(generated).toBe(accepted);
      expect(plan.roles.map((role) => role.role)).toEqual(["domain"]);
      expect(plan.operations.every((operation) => operation.kind !== "write-file" || operation.role === "domain")).toBe(
        true
      );
    })
  );

  it.effect("rejects roles that are outside the selected domain-kind archetype", () =>
    Effect.gen(function* () {
      const error = yield* makeArchitectureOperationPlan(
        repoRoot,
        {
          boundedContext: "architecture-lab",
          concept: "WorkPriority",
          domainKind: "values",
          stage: "full",
        },
        O.some(["server"])
      ).pipe(Effect.provide(NodeServices.layer), Effect.flip);

      expect(error.message).toContain("values concepts do not support role(s): server");
    })
  );

  it.effect("creates a shell-only slice role package operation plan", () =>
    Effect.gen(function* () {
      const plan = yield* makeArchitecturePackageOperationPlan({
        boundedContext: "research-lab",
        role: "use-cases",
      });
      const json = yield* encodeCanonicalSliceOperationPlanJson(plan);
      const decoded = yield* decodeCanonicalSliceOperationPlanJson(json);
      const plannedPaths = decoded.operations.map((operation) => operation.path);
      const packageJsonOperation = decoded.operations.find((operation): operation is WritePackageJsonOperation =>
        S.is(WritePackageJsonOperation)(operation)
      );

      expect(decoded.roles.map((role) => role.role)).toEqual(["use-cases"]);
      expect(decoded.roles[0]?.exports).toEqual([
        ".",
        "./public",
        "./server",
        "./aggregates/*",
        "./aggregates/*/server",
        "./entities/*",
        "./entities/*/server",
      ]);
      expect(packageJsonOperation?.dependencies).toMatchObject({
        "@beep/research-lab-domain": "workspace:^",
        "@beep/identity": "workspace:^",
        "@beep/schema": "workspace:^",
      });
      expect(packageJsonOperation?.exports).toContain("./aggregates/*/server");
      expect(plannedPaths).toContain("packages/research-lab/use-cases/package.json");
      expect(plannedPaths).toContain("packages/research-lab/use-cases/src/index.ts");
      expect(plannedPaths).toContain("packages/research-lab/use-cases/src/public.ts");
      expect(plannedPaths).toContain("packages/research-lab/use-cases/src/server.ts");
      expect(plannedPaths.some((operationPath) => operationPath.includes("/WorkItem/"))).toBe(false);
      expect(plannedPaths.some((operationPath) => operationPath.includes("/PackageShell/"))).toBe(false);
    })
  );

  it.effect("applies a shell-only slice role package twice with a no-op second apply", () =>
    Effect.gen(function* () {
      const tempRoot = join(tmpdir(), `beep-architecture-package-shell-${Date.now()}`);
      const plan = yield* makeArchitecturePackageOperationPlan({
        boundedContext: "research-lab",
        role: "domain",
      });

      const firstApply = yield* applyCanonicalSliceOperationPlan(tempRoot, plan).pipe(
        Effect.provide(NodeServices.layer)
      );
      const check = yield* checkCanonicalSliceOperationPlan(tempRoot, plan).pipe(Effect.provide(NodeServices.layer));
      const secondApply = yield* applyCanonicalSliceOperationPlan(tempRoot, plan).pipe(
        Effect.provide(NodeServices.layer)
      );
      const packageJson = readFileSync(join(tempRoot, "packages/research-lab/domain/package.json"), "utf8");
      const parsedPackageJson = yield* decodePackageJsonPublishConfig(packageJson);
      const index = readFileSync(join(tempRoot, "packages/research-lab/domain/src/index.ts"), "utf8");

      rmSync(tempRoot, { force: true, recursive: true });
      expect(firstApply.writtenPaths).toContain("packages/research-lab/domain/package.json");
      expect(firstApply.writtenPaths).toContain("packages/research-lab/domain/src/aggregates/index.ts");
      expect(firstApply.writtenPaths).not.toContain("packages/research-lab/domain/src/aggregates/WorkItem/index.ts");
      expect(packageJson).toContain('"name": "@beep/research-lab-domain"');
      expect(packageJson).toContain('"@beep/shared-domain": "workspace:^"');
      expect(packageJson).toContain('"./aggregates": "./src/aggregates/index.ts"');
      expect(parsedPackageJson.exports["./aggregates/*"]).toBe("./src/aggregates/*/index.ts");
      expect(parsedPackageJson.publishConfig?.exports?.["."]).toBe("./dist/index.js");
      expect(parsedPackageJson.publishConfig?.exports?.["./aggregates/*"]).toBe("./dist/aggregates/*/index.js");
      expect(index).toContain('export * as Aggregates from "./aggregates/index.js";');
      expect(index).toContain('export * as Values from "./values/index.js";');
      expect(check.idempotent).toBe(true);
      expect(secondApply.writtenPaths).toEqual([]);
      expect(secondApply.skippedPaths.length).toBeGreaterThan(0);
    })
  );

  it.effect("architecture plan command emits decoded JSON with operation metadata", () =>
    Effect.gen(function* () {
      yield* runArchitectureCommand(["plan", "--stage", "core"]).pipe(Effect.provide(CommandTestLayer));
      const output = pipe(yield* TestConsole.logLines, A.join("\n"));
      const decoded = yield* decodeCanonicalSliceOperationPlanJson(output);

      expect(decoded.target.stage).toBe("core");
      expect(decoded.operations[0]?.operationId).toContain(":");
      expect(decoded.operations[0]?.operationSource).toBe("accepted-proof");
    })
  );

  it.effect("architecture create package dry-run prints a plan without writing files", () =>
    Effect.gen(function* () {
      const sliceName = `dry-run-lab-${Date.now()}`;
      const targetDir = join(repoRoot, "packages", sliceName);
      expect(existsSync(targetDir)).toBe(false);

      yield* runArchitectureCommand(["create", "package", sliceName, "domain", "--dry-run"]).pipe(
        Effect.provide(CommandTestLayer)
      );
      const output = pipe(yield* TestConsole.logLines, A.join("\n"));
      const decoded = yield* decodeCanonicalSliceOperationPlanJson(output);

      expect(decoded.target.boundedContext).toBe(sliceName);
      expect(decoded.operations[0]?.operationSource).toBe("package-shell");
      expect(decoded.operations.map((operation) => operation.path)).toContain(
        `packages/${sliceName}/domain/src/index.ts`
      );
      expect(existsSync(targetDir)).toBe(false);
    })
  );

  it.effect("architecture check command validates an operation-plan file", () =>
    Effect.gen(function* () {
      const planPath = join(tmpdir(), `beep-architecture-check-${Date.now()}.json`);
      const plan = makeCanonicalSliceOperationPlan();
      const json = yield* encodeCanonicalSliceOperationPlanJson(plan);
      writeFileSync(planPath, json);

      yield* runArchitectureCommand(["check", "--file", planPath]).pipe(Effect.provide(CommandTestLayer));
      const output = pipe(yield* TestConsole.logLines, A.join("\n"));

      rmSync(planPath, { force: true });
      expect(output).toContain("idempotent=true");
      expect(output).toContain(`operations=${plan.operations.length}`);
    })
  );
});
