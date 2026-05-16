import {
  FsUtilsLive,
  ReuseAnalysisError,
  ReuseDiscoveryService,
  ReuseInventoryService,
  ReusePartitionPlannerService,
  ReuseServiceSuiteLive,
  TSMorphServiceLive,
} from "@beep/repo-utils";
import { A, Str } from "@beep/utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as O from "effect/Option";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const InfrastructureLayer = Layer.mergeAll(
  PlatformLayer,
  FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer)),
  TSMorphServiceLive.pipe(Layer.provideMerge(PlatformLayer))
);
const makeTestLayer = () => ReuseServiceSuiteLive.pipe(Layer.provideMerge(InfrastructureLayer));
const TOOLING_SCOPE = O.some("packages/tooling/tool/cli,packages/tooling/library/repo-utils");

describe("Reuse services", () => {
  describe("buildPartitions", () => {
    it.effect(
      "emits scout and specialist work units for the tooling pilot scope",
      () =>
        Effect.gen(function* () {
          const planner = yield* ReusePartitionPlannerService;
          const plan = yield* planner.buildPartitions(TOOLING_SCOPE);

          expect(plan.scopeSelector).toBe("packages/tooling/tool/cli,packages/tooling/library/repo-utils");
          expect(plan.catalogEntryCount).toBeGreaterThan(0);
          expect(A.map(plan.scoutUnits, (unit) => unit.scopeSelector)).toEqual([
            "packages/tooling/library/repo-utils",
            "packages/tooling/tool/cli",
          ]);
          expect(plan.specialistUnits.length).toBeGreaterThan(0);
        }).pipe(provideScopedLayer(makeTestLayer())),
      180_000
    );

    it.effect(
      "canonicalizes repo-relative scope selectors before matching workspace scopes",
      () =>
        Effect.gen(function* () {
          const planner = yield* ReusePartitionPlannerService;
          const plan = yield* planner.buildPartitions(
            O.some("./packages/tooling/tool/cli,./packages/tooling/library/repo-utils")
          );

          expect(plan.scopeSelector).toBe("packages/tooling/tool/cli,packages/tooling/library/repo-utils");
          expect(A.map(plan.scoutUnits, (unit) => unit.scopeSelector)).toEqual([
            "packages/tooling/library/repo-utils",
            "packages/tooling/tool/cli",
          ]);
        }).pipe(provideScopedLayer(makeTestLayer())),
      180_000
    );

    it.effect(
      "promotes cross-package hotspots into specialist work units",
      () =>
        Effect.gen(function* () {
          const planner = yield* ReusePartitionPlannerService;
          const plan = yield* planner.buildPartitions(TOOLING_SCOPE);

          expect(
            A.some(
              plan.specialistUnits,
              (unit) => unit.scopeSelector === "packages/tooling/library/repo-utils,packages/tooling/tool/cli"
            )
          ).toBe(true);
        }).pipe(provideScopedLayer(makeTestLayer())),
      180_000
    );

    it.effect(
      "does not match raw substrings when filtering workspace scopes",
      () =>
        Effect.gen(function* () {
          const planner = yield* ReusePartitionPlannerService;
          const plan = yield* planner.buildPartitions(O.some("repo"));

          expect(plan.scopeSelector).toBe("repo");
          expect(plan.scoutUnits.length).toBe(0);
          expect(plan.specialistUnits.length).toBe(0);
        }).pipe(provideScopedLayer(makeTestLayer())),
      180_000
    );
  });

  describe("buildInventory and buildPacket", () => {
    it.effect(
      "materializes a consistent inventory and packet for the same candidate",
      () =>
        Effect.gen(function* () {
          const inventoryService = yield* ReuseInventoryService;
          const inventory = yield* inventoryService.buildInventory(TOOLING_SCOPE);
          const candidateIds = A.map(inventory.candidates, (candidate) => candidate.candidateId);
          const firstCandidate = inventory.candidates[0];

          expect(inventory.scopeSelector).toBe("packages/tooling/tool/cli,packages/tooling/library/repo-utils");
          expect(inventory.catalogEntryCount).toBeGreaterThan(0);
          expect(inventory.candidateCount).toBe(inventory.candidates.length);
          expect(candidateIds.length).toBeGreaterThan(0);
          expect(new Set(candidateIds).size).toBe(candidateIds.length);

          const packet = yield* inventoryService.buildPacket(firstCandidate.candidateId, TOOLING_SCOPE);

          expect(packet.candidate.candidateId).toBe(firstCandidate.candidateId);
          expect(Str.startsWith("@beep/")(packet.candidate.proposedDestinationPackage)).toBe(true);
          expect(packet.candidate.implementationSteps.length).toBeGreaterThan(0);
          expect(packet.candidate.verificationCommands.length).toBeGreaterThan(0);
        }).pipe(provideScopedLayer(makeTestLayer())),
      180_000
    );
  });

  describe("findReuseOptions", () => {
    it.effect(
      "returns ranked catalog matches for a local JSON-oriented tooling file query",
      () =>
        Effect.gen(function* () {
          const discovery = yield* ReuseDiscoveryService;
          const result = yield* discovery.findReuseOptions({
            filePath: "packages/tooling/tool/cli/src/commands/Docgen/index.ts",
            query: O.some("json"),
            symbolId: O.none(),
          });

          expect(result.filePath).toBe("packages/tooling/tool/cli/src/commands/Docgen/index.ts");
          expect(O.isSome(result.query)).toBe(true);
          expect(O.getOrElse(result.query, () => "")).toBe("json");
          expect(result.matches.length).toBeGreaterThan(0);
          expect(
            A.some(
              result.matches,
              (match) => match.packageName === "effect" || Str.startsWith("@beep/")(match.packageName)
            )
          ).toBe(true);
        }).pipe(provideScopedLayer(makeTestLayer())),
      180_000
    );

    it.effect(
      "canonicalizes repo-relative file paths before resolving owning workspace scopes",
      () =>
        Effect.gen(function* () {
          const discovery = yield* ReuseDiscoveryService;
          const result = yield* discovery.findReuseOptions({
            filePath: "./packages/tooling/tool/cli/src/commands/Docgen/index.ts",
            query: O.some("json"),
            symbolId: O.none(),
          });

          expect(result.filePath).toBe("packages/tooling/tool/cli/src/commands/Docgen/index.ts");
          expect(result.matches.length).toBeGreaterThan(0);
        }).pipe(provideScopedLayer(makeTestLayer())),
      180_000
    );

    it.effect(
      "rejects repo-root or out-of-repo file inputs before scope resolution",
      () =>
        Effect.gen(function* () {
          const discovery = yield* ReuseDiscoveryService;
          const error = yield* discovery
            .findReuseOptions({
              filePath: ".",
              query: O.some("json"),
              symbolId: O.none(),
            })
            .pipe(Effect.flip);

          expect(error).toBeInstanceOf(ReuseAnalysisError);
          expect(error.operation).toBe("findReuseOptions");
          expect(error.message).toContain("repo-relative path inside the repository");
        }).pipe(provideScopedLayer(makeTestLayer())),
      180_000
    );
  });
});
