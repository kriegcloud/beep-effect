import { FsUtilsLive, ReuseFindResult, ReuseInventory, ReusePacket, ReusePartitionPlan, TSMorphServiceLive } from "@beep/repo-utils";
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
const TOOLING_CLI_SCOPE = "tooling/cli";
const CommandTestLayer = Layer.mergeAll(
  NodeServices.layer,
  TestConsole.layer,
  FsUtilsLive.pipe(Layer.provideMerge(NodeServices.layer)),
  TSMorphServiceLive.pipe(Layer.provideMerge(NodeServices.layer))
);

const decodePartitionPlan = S.decodeUnknownSync(ReusePartitionPlan);
const decodeInventory = S.decodeUnknownSync(ReuseInventory);
const decodePacket = S.decodeUnknownSync(ReusePacket);
const decodeFindResult = S.decodeUnknownSync(ReuseFindResult);
const decodeCodexSmokeResult = S.decodeUnknownSync(CodexSmokeResult);

const parseLoggedJson = Effect.fn(function* <A>(decode: (value: unknown) => A) {
  const logLines = yield* TestConsole.logLines;
  const rendered = logLines.join("\n");
  return decode(JSON.parse(rendered));
});

describe("reuse command", () => {
  it("emits machine-readable partitions for the tooling pilot scope", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand(["partitions", "--scope", TOOLING_CLI_SCOPE, "--json"]);

        const plan = yield* parseLoggedJson(decodePartitionPlan);

        expect(plan.scopeSelector).toBe(TOOLING_CLI_SCOPE);
        expect(plan.catalogEntryCount).toBeGreaterThan(0);
        expect(plan.scoutUnits.map((unit) => unit.scopeSelector)).toEqual([TOOLING_CLI_SCOPE]);
        expect(plan.specialistUnits.length).toBeGreaterThan(0);
      }).pipe(Effect.provide(CommandTestLayer))
    );
  }, 60_000);

  it("emits a stable machine-readable inventory for the tooling pilot scope", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand(["inventory", "--scope", TOOLING_CLI_SCOPE, "--json"]);

        const inventory = yield* parseLoggedJson(decodeInventory);

        expect(inventory.scopeSelector).toBe(TOOLING_CLI_SCOPE);
        expect(inventory.catalogEntryCount).toBeGreaterThan(0);
        expect(inventory.candidateCount).toBe(inventory.candidates.length);
        expect(inventory.candidates.length).toBeGreaterThan(0);
      }).pipe(Effect.provide(CommandTestLayer))
    );
  }, 60_000);

  it("emits a packet for a discovered candidate id", async () => {
    const firstCandidateId = await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand(["inventory", "--scope", TOOLING_CLI_SCOPE, "--json"]);

        const inventory = yield* parseLoggedJson(decodeInventory);
        return inventory.candidates[0]?.candidateId;
      }).pipe(Effect.provide(CommandTestLayer))
    );

    expect(firstCandidateId).toBeTruthy();
    if (firstCandidateId === undefined) {
      return;
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand([
          "packet",
          "--candidate-id",
          firstCandidateId,
          "--scope", TOOLING_CLI_SCOPE,
          "--json",
        ]);

        const packet = yield* parseLoggedJson(decodePacket);

        expect(packet.candidate.candidateId).toBe(firstCandidateId);
        expect(packet.catalogMatches.length).toBeGreaterThan(0);
      }).pipe(Effect.provide(CommandTestLayer))
    );
  }, 60_000);

  it("emits a machine-readable find result", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand([
          "find",
          "--file",
          "tooling/cli/src/commands/Docgen/index.ts",
          "--query",
          "json",
          "--json",
        ]);

        const result = yield* parseLoggedJson(decodeFindResult);

        expect(result.filePath).toBe("tooling/cli/src/commands/Docgen/index.ts");
        expect(O.isSome(result.query)).toBe(true);
        expect(result.matches.length).toBeGreaterThan(0);
      }).pipe(Effect.provide(CommandTestLayer))
    );
  }, 60_000);

  it("validates the Codex SDK smoke adapter contract", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* runReuseCommand(["codex-smoke", "--json"]);

        const result = yield* parseLoggedJson(decodeCodexSmokeResult);

        expect(result.sdkPackage).toBe("@openai/codex-sdk");
        expect(result.threadCreated).toBe(true);
        expect(result.threadRunMethodAvailable).toBe(true);
      }).pipe(Effect.provide(CommandTestLayer))
    );
  }, 60_000);
});
