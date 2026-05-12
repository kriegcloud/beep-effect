import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyCanonicalSliceOperationPlan,
  CanonicalSliceOperationPlan,
  checkCanonicalSliceOperationPlan,
  decodeCanonicalSliceOperationPlanJson,
  encodeCanonicalSliceOperationPlanJson,
  makeArchitectureOperationPlan,
  makeCanonicalSliceOperationPlan,
  WriteFileOperation,
} from "@beep/repo-cli/commands/Architecture/index";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as O from "effect/Option";

const repoRoot = fileURLToPath(new URL("../../../../..", import.meta.url));

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

  it.effect("generates the accepted WorkItem proof into a temp fixture and second apply is a no-op", () =>
    Effect.gen(function* () {
      const tempRoot = join(tmpdir(), `beep-architecture-generated-${Date.now()}`);
      const acceptedPath = "packages/architecture-lab/domain/src/aggregates/WorkItem/WorkItem.model.ts";

      const plan = yield* makeArchitectureOperationPlan(repoRoot).pipe(Effect.provide(NodeServices.layer));
      const firstApply = yield* applyCanonicalSliceOperationPlan(tempRoot, plan).pipe(
        Effect.provide(NodeServices.layer)
      );
      const check = yield* checkCanonicalSliceOperationPlan(tempRoot, plan).pipe(Effect.provide(NodeServices.layer));
      const secondApply = yield* applyCanonicalSliceOperationPlan(tempRoot, plan).pipe(
        Effect.provide(NodeServices.layer)
      );

      const generated = readFileSync(join(tempRoot, acceptedPath), "utf8");
      const accepted = readFileSync(join(repoRoot, acceptedPath), "utf8");

      rmSync(tempRoot, { force: true, recursive: true });
      expect(firstApply.writtenPaths).toContain(acceptedPath);
      expect(generated).toBe(accepted);
      expect(check.idempotent).toBe(true);
      expect(secondApply.writtenPaths).toEqual([]);
      expect(secondApply.skippedPaths.length).toBeGreaterThan(0);
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
});
