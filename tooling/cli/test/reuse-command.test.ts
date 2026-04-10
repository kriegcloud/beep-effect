import {
  FsUtilsLive,
  ReuseFindResult,
  ReuseInventory,
  ReusePacket,
  ReusePartitionPlan,
  TSMorphServiceLive,
} from "@beep/repo-utils";
import { NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";
import { reuseCommand } from "../src/commands/Reuse/index.js";
import { CodexSmokeResult } from "../src/commands/Reuse/internal/CodexRunner.js";

const runReuseCommand = Command.runWith(reuseCommand, { version: "0.0.0" });
const TOOLING_UTILS_SCOPE = "packages/common/utils";
const CommandTestLayer = Layer.mergeAll(
  NodeServices.layer,
  TestConsole.layer,
  FsUtilsLive.pipe(Layer.provideMerge(NodeServices.layer)),
  TSMorphServiceLive.pipe(Layer.provideMerge(NodeServices.layer))
);

const decodePartitionPlanJson = S.decodeUnknownSync(S.fromJsonString(ReusePartitionPlan));
const decodeInventoryJson = S.decodeUnknownSync(S.fromJsonString(ReuseInventory));
const decodePacketJson = S.decodeUnknownSync(S.fromJsonString(ReusePacket));
const decodeFindResultJson = S.decodeUnknownSync(S.fromJsonString(ReuseFindResult));
const decodeCodexSmokeResultJson = S.decodeUnknownSync(S.fromJsonString(CodexSmokeResult));

const parseLoggedJson = Effect.fn(function* <A>(decodeJson: (value: string) => A) {
  const logLines = yield* TestConsole.logLines;
  const rendered = logLines.join("\n");
  return decodeJson(rendered);
});

describe("reuse command", () => {
  it("emits machine-readable partitions for the tooling pilot scope", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand(["partitions", "--scope", TOOLING_UTILS_SCOPE, "--json"]);

        const plan = yield* parseLoggedJson(decodePartitionPlanJson);

        expect(plan.scopeSelector).toBe(TOOLING_UTILS_SCOPE);
        expect(plan.catalogEntryCount).toBeGreaterThan(0);
        expect(plan.scoutUnits.map((unit) => unit.scopeSelector)).toEqual([TOOLING_UTILS_SCOPE]);
        expect(plan.specialistUnits.length).toBeGreaterThan(0);
      }).pipe(Effect.provide(CommandTestLayer))
    );
  }, 120_000);

  it("canonicalizes dot-prefixed scope selectors before emitting partitions", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand(["partitions", "--scope", "./packages/common/utils", "--json"]);

        const plan = yield* parseLoggedJson(decodePartitionPlanJson);

        expect(plan.scopeSelector).toBe(TOOLING_UTILS_SCOPE);
        expect(plan.scoutUnits.map((unit) => unit.scopeSelector)).toEqual([TOOLING_UTILS_SCOPE]);
      }).pipe(Effect.provide(CommandTestLayer))
    );
  }, 120_000);

  it("emits a stable machine-readable inventory for the tooling pilot scope", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand(["inventory", "--scope", TOOLING_UTILS_SCOPE, "--json"]);

        const inventory = yield* parseLoggedJson(decodeInventoryJson);

        expect(inventory.scopeSelector).toBe(TOOLING_UTILS_SCOPE);
        expect(inventory.catalogEntryCount).toBeGreaterThan(0);
        expect(inventory.candidateCount).toBe(inventory.candidates.length);
        expect(inventory.candidates.length).toBeGreaterThan(0);
      }).pipe(Effect.provide(CommandTestLayer))
    );
  }, 120_000);

  it("emits a packet for a discovered candidate id", async () => {
    const firstCandidateId = await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand(["inventory", "--scope", TOOLING_UTILS_SCOPE, "--json"]);

        const inventory = yield* parseLoggedJson(decodeInventoryJson);
        return inventory.candidates[0]?.candidateId;
      }).pipe(Effect.provide(CommandTestLayer))
    );

    expect(firstCandidateId).toBeTruthy();
    if (firstCandidateId === undefined) {
      return;
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand(["packet", "--candidate-id", firstCandidateId, "--scope", TOOLING_UTILS_SCOPE, "--json"]);

        const packet = yield* parseLoggedJson(decodePacketJson);

        expect(packet.candidate.candidateId).toBe(firstCandidateId);
        expect(packet.catalogMatches.length).toBeGreaterThan(0);
      }).pipe(Effect.provide(CommandTestLayer))
    );
  }, 120_000);

  it("emits a machine-readable find result", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand([
          "find",
          "--file",
          "packages/common/utils/src/Glob.ts",
          "--query",
          "glob",
          "--json",
        ]);

        const result = yield* parseLoggedJson(decodeFindResultJson);

        expect(result.filePath).toBe("packages/common/utils/src/Glob.ts");
        expect(O.isSome(result.query)).toBe(true);
        expect(result.matches.length).toBeGreaterThan(0);
      }).pipe(Effect.provide(CommandTestLayer))
    );
  }, 120_000);

  it("canonicalizes dot-prefixed file paths in machine-readable find results", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand([
          "find",
          "--file",
          "./packages/common/utils/src/Glob.ts",
          "--query",
          "glob",
          "--json",
        ]);

        const result = yield* parseLoggedJson(decodeFindResultJson);

        expect(result.filePath).toBe("packages/common/utils/src/Glob.ts");
        expect(result.matches.length).toBeGreaterThan(0);
      }).pipe(Effect.provide(CommandTestLayer))
    );
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
