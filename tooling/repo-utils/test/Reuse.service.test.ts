import {
  FsUtilsLive,
  ReuseDiscoveryService,
  ReuseInventoryService,
  ReusePartitionPlannerService,
  ReuseServiceSuiteLive,
  TSMorphServiceLive,
} from "@beep/repo-utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as O from "effect/Option";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const InfrastructureLayer = Layer.mergeAll(
  PlatformLayer,
  FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer)),
  TSMorphServiceLive.pipe(Layer.provideMerge(PlatformLayer))
);
const makeTestLayer = () => ReuseServiceSuiteLive.pipe(Layer.provideMerge(InfrastructureLayer));
const TOOLING_SCOPE = O.some("tooling/cli,tooling/repo-utils");

describe("Reuse services", () => {
  describe("buildPartitions", () => {
    it.effect(
      "emits scout and specialist work units for the tooling pilot scope",
      () =>
        Effect.gen(function* () {
          const planner = yield* ReusePartitionPlannerService;
          const plan = yield* planner.buildPartitions(TOOLING_SCOPE);

          expect(plan.scopeSelector).toBe("tooling/cli,tooling/repo-utils");
          expect(plan.catalogEntryCount).toBeGreaterThan(0);
          expect(plan.scoutUnits.map((unit) => unit.scopeSelector)).toEqual(["tooling/cli", "tooling/repo-utils"]);
          expect(plan.specialistUnits.length).toBeGreaterThan(0);
        }).pipe(Effect.provide(makeTestLayer())),
      120_000
    );

    it.effect(
      "canonicalizes repo-relative scope selectors before matching workspace scopes",
      () =>
        Effect.gen(function* () {
          const planner = yield* ReusePartitionPlannerService;
          const plan = yield* planner.buildPartitions(O.some("./tooling/cli,./tooling/repo-utils"));

          expect(plan.scopeSelector).toBe("tooling/cli,tooling/repo-utils");
          expect(plan.scoutUnits.map((unit) => unit.scopeSelector)).toEqual(["tooling/cli", "tooling/repo-utils"]);
        }).pipe(Effect.provide(makeTestLayer())),
      120_000
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
        }).pipe(Effect.provide(makeTestLayer())),
      120_000
    );
  });

  describe("buildInventory and buildPacket", () => {
    it.effect(
      "materializes a consistent inventory and packet for the same candidate",
      () =>
        Effect.gen(function* () {
          const inventoryService = yield* ReuseInventoryService;
          const inventory = yield* inventoryService.buildInventory(TOOLING_SCOPE);
          const candidateIds = inventory.candidates.map((candidate) => candidate.candidateId);
          const firstCandidate = inventory.candidates[0];

          expect(inventory.scopeSelector).toBe("tooling/cli,tooling/repo-utils");
          expect(inventory.catalogEntryCount).toBeGreaterThan(0);
          expect(inventory.candidateCount).toBe(inventory.candidates.length);
          expect(candidateIds.length).toBeGreaterThan(0);
          expect(new Set(candidateIds).size).toBe(candidateIds.length);

          const packet = yield* inventoryService.buildPacket(firstCandidate.candidateId, TOOLING_SCOPE);

          expect(packet.candidate.candidateId).toBe(firstCandidate.candidateId);
          expect(packet.candidate.proposedDestinationPackage.startsWith("@beep/")).toBe(true);
          expect(packet.candidate.implementationSteps.length).toBeGreaterThan(0);
          expect(packet.candidate.verificationCommands.length).toBeGreaterThan(0);
        }).pipe(Effect.provide(makeTestLayer())),
      120_000
    );
  });

  describe("findReuseOptions", () => {
    it.effect(
      "returns ranked catalog matches for a local JSON-oriented tooling file query",
      () =>
        Effect.gen(function* () {
          const discovery = yield* ReuseDiscoveryService;
          const result = yield* discovery.findReuseOptions({
            filePath: "tooling/cli/src/commands/Docgen/index.ts",
            query: O.some("json"),
            symbolId: O.none(),
          });

          expect(result.filePath).toBe("tooling/cli/src/commands/Docgen/index.ts");
          expect(O.isSome(result.query)).toBe(true);
          expect(O.getOrElse(result.query, () => "")).toBe("json");
          expect(result.matches.length).toBeGreaterThan(0);
          expect(
            result.matches.some((match) => match.packageName === "effect" || match.packageName.startsWith("@beep/"))
          ).toBe(true);
        }).pipe(Effect.provide(makeTestLayer())),
      120_000
    );

    it.effect(
      "canonicalizes repo-relative file paths before resolving owning workspace scopes",
      () =>
        Effect.gen(function* () {
          const discovery = yield* ReuseDiscoveryService;
          const result = yield* discovery.findReuseOptions({
            filePath: "./tooling/cli/src/commands/Docgen/index.ts",
            query: O.some("json"),
            symbolId: O.none(),
          });

          expect(result.filePath).toBe("tooling/cli/src/commands/Docgen/index.ts");
          expect(result.matches.length).toBeGreaterThan(0);
        }).pipe(Effect.provide(makeTestLayer())),
      120_000
    );
  });
});
