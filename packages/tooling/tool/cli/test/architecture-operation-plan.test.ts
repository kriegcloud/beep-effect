import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  applyCanonicalSliceOperationPlan,
  CanonicalSliceOperationPlan,
  checkCanonicalSliceOperationPlan,
  decodeCanonicalSliceOperationPlanJson,
  encodeCanonicalSliceOperationPlanJson,
  makeArchitectureOperationPlan,
  makeCanonicalSliceOperationPlan,
} from "@beep/repo-cli/commands/Architecture/index";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

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
      const repoRoot = process.cwd();
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
});
