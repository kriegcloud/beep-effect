import {
  FsUtilsLive,
  ReuseDiscoveryService,
  ReuseInventoryService,
  ReusePartitionPlannerService,
  ReuseServiceSuiteLive,
  TSMorphServiceLive,
} from "@beep/repo-utils";
import { NodeServices } from "@effect/platform-node";
import { Effect, Exit, Layer, Scope } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { reuseCommand } from "../src/commands/Reuse/index.js";
import { CodexSmokeResult } from "../src/commands/Reuse/internal/CodexRunner.js";

const runReuseCommand = Command.runWith(reuseCommand, { version: "0.0.0" });
const TOOLING_CLI_SCOPE = "tooling/cli";
const TOOLING_CLI_DOT_SCOPE = "./tooling/cli";
const TOOLING_CLI_FILE = "tooling/cli/src/commands/Docgen/index.ts";

const CommandTestLayer = Layer.mergeAll(
  NodeServices.layer,
  TestConsole.layer,
  FsUtilsLive.pipe(Layer.provideMerge(NodeServices.layer)),
  TSMorphServiceLive.pipe(Layer.provideMerge(NodeServices.layer))
);

const decodeCodexSmokeResultJson = S.decodeUnknownSync(S.fromJsonString(CodexSmokeResult));

const parseLoggedJson = Effect.fn(function* <A>(decodeJson: (value: string) => A) {
  const logLines = yield* TestConsole.logLines;
  return decodeJson(logLines.join("\n"));
});

const sharedReuseScope = Scope.makeUnsafe();
let sharedReuseContextPromise: Promise<unknown>;

beforeAll(() => {
  sharedReuseContextPromise = Effect.runPromise(
    Layer.buildWithScope(ReuseServiceSuiteLive, sharedReuseScope).pipe(Effect.provide(CommandTestLayer))
  );
});

afterAll(async () => {
  await Effect.runPromise(Scope.close(sharedReuseScope, Exit.void));
});

const runWithReuseContext = async <A, E, R>(effect: Effect.Effect<A, E, R>) => {
  const context = (await sharedReuseContextPromise) as never;
  return Effect.runPromise(effect.pipe(Effect.provide(context)) as Effect.Effect<A, E, never>);
};

describe("reuse command", () => {
  it("emits machine-readable partitions for the tooling pilot scope", async () => {
    const plan = await runWithReuseContext(
      Effect.gen(function* () {
        const planner = yield* ReusePartitionPlannerService;
        return yield* planner.buildPartitions(O.some(TOOLING_CLI_SCOPE));
      })
    );

    expect(plan.scopeSelector).toBe(TOOLING_CLI_SCOPE);
    expect(plan.catalogEntryCount).toBeGreaterThan(0);
    expect(plan.scoutUnits.map((unit) => unit.scopeSelector)).toEqual([TOOLING_CLI_SCOPE]);
    expect(plan.specialistUnits.length).toBeGreaterThan(0);
  }, 120_000);

  it("canonicalizes dot-prefixed scope selectors before emitting partitions", async () => {
    const plan = await runWithReuseContext(
      Effect.gen(function* () {
        const planner = yield* ReusePartitionPlannerService;
        return yield* planner.buildPartitions(O.some(TOOLING_CLI_DOT_SCOPE));
      })
    );

    expect(plan.scopeSelector).toBe(TOOLING_CLI_SCOPE);
    expect(plan.scoutUnits.map((unit) => unit.scopeSelector)).toEqual([TOOLING_CLI_SCOPE]);
  }, 120_000);

  it("emits a stable machine-readable inventory for the tooling pilot scope", async () => {
    const inventory = await runWithReuseContext(
      Effect.gen(function* () {
        const inventoryService = yield* ReuseInventoryService;
        return yield* inventoryService.buildInventory(O.some(TOOLING_CLI_SCOPE));
      })
    );

    expect(inventory.scopeSelector).toBe(TOOLING_CLI_SCOPE);
    expect(inventory.catalogEntryCount).toBeGreaterThan(0);
    expect(inventory.candidateCount).toBe(inventory.candidates.length);
    expect(inventory.candidates.length).toBeGreaterThan(0);
  }, 120_000);

  it("emits a packet for a discovered candidate id", async () => {
    const inventory = await runWithReuseContext(
      Effect.gen(function* () {
        const inventoryService = yield* ReuseInventoryService;
        return yield* inventoryService.buildInventory(O.some(TOOLING_CLI_SCOPE));
      })
    );

    const firstCandidateId = inventory.candidates[0]?.candidateId;
    expect(firstCandidateId).toBeTruthy();
    if (firstCandidateId === undefined) {
      return;
    }

    const packet = await runWithReuseContext(
      Effect.gen(function* () {
        const inventoryService = yield* ReuseInventoryService;
        return yield* inventoryService.buildPacket(firstCandidateId, O.some(TOOLING_CLI_SCOPE));
      })
    );

    expect(packet.candidate.candidateId).toBe(firstCandidateId);
    expect(packet.catalogMatches.length).toBeGreaterThan(0);
  }, 120_000);

  it("emits a machine-readable find result", async () => {
    const result = await runWithReuseContext(
      Effect.gen(function* () {
        const discovery = yield* ReuseDiscoveryService;
        return yield* discovery.findReuseOptions({
          filePath: TOOLING_CLI_FILE,
          query: O.some("json"),
          symbolId: O.none(),
        });
      })
    );

    expect(result.filePath).toBe(TOOLING_CLI_FILE);
    expect(O.isSome(result.query)).toBe(true);
    expect(result.matches.length).toBeGreaterThan(0);
  }, 120_000);

  it("canonicalizes dot-prefixed file paths in machine-readable find results", async () => {
    const result = await runWithReuseContext(
      Effect.gen(function* () {
        const discovery = yield* ReuseDiscoveryService;
        return yield* discovery.findReuseOptions({
          filePath: `./${TOOLING_CLI_FILE}`,
          query: O.some("json"),
          symbolId: O.none(),
        });
      })
    );

    expect(result.filePath).toBe(TOOLING_CLI_FILE);
    expect(result.matches.length).toBeGreaterThan(0);
  }, 120_000);

  it("validates the Codex SDK smoke adapter contract", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand(["codex-smoke", "--json"]);

        const result = yield* parseLoggedJson(decodeCodexSmokeResultJson);

        expect(result.sdkPackage).toBe("@openai/codex-sdk");
        expect(result.threadCreated).toBe(true);
        expect(result.threadRunMethodAvailable).toBe(true);
      }).pipe(Effect.provide(CommandTestLayer))
    );
  }, 120_000);
});
