import { reuseCommand } from "@beep/repo-cli/commands/Reuse";
import { CodexSmokeResult } from "@beep/repo-cli/test/Reuse";
import { RepoCodegraphLookupResult } from "@beep/repo-codegraph";
import {
  FsUtilsLive,
  ReuseDiscoveryService,
  ReuseInventoryService,
  ReusePartitionPlannerService,
  ReuseServiceSuiteLive,
  TSMorphServiceLive,
} from "@beep/repo-utils";
import { A } from "@beep/utils";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import { Effect, Exit, Layer, Scope } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Context } from "effect";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const runReuseCommand = Command.runWith(reuseCommand, { version: "0.0.0" });
const TOOLING_CLI_SCOPE = "packages/tooling/tool/cli";
const TOOLING_CLI_DOT_SCOPE = "./packages/tooling/tool/cli";
const TOOLING_CLI_FILE = "packages/tooling/tool/cli/src/commands/Docgen/index.ts";

const CommandTestLayer = Layer.mergeAll(
  NodeServices.layer,
  NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(NodeServices.layer)),
  TestConsole.layer,
  FsUtilsLive.pipe(Layer.provideMerge(NodeServices.layer)),
  TSMorphServiceLive.pipe(Layer.provideMerge(NodeServices.layer))
);

const decodeCodexSmokeResultJson = S.decodeUnknownSync(S.fromJsonString(CodexSmokeResult));
const decodeRepoCodegraphLookupResultJson = S.decodeUnknownSync(S.fromJsonString(RepoCodegraphLookupResult));
const isString = (value: unknown): value is string => typeof value === "string";

const parseLoggedJson = Effect.fn(function* <A>(decodeJson: (value: string) => A) {
  const logLines = A.filter(yield* TestConsole.logLines, isString);
  return decodeJson(A.join(logLines, "\n"));
});

const sharedReuseScope = Scope.makeUnsafe();
let sharedReuseContextPromise: Promise<
  Context.Context<ReuseDiscoveryService | ReuseInventoryService | ReusePartitionPlannerService>
>;

beforeAll(() => {
  sharedReuseContextPromise = Effect.runPromise(
    Layer.buildWithScope(ReuseServiceSuiteLive, sharedReuseScope).pipe(provideScopedLayer(CommandTestLayer))
  );
});

afterAll(() => Effect.runPromise(Scope.close(sharedReuseScope, Exit.void)));

const runWithReuseContext = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  sharedReuseContextPromise.then((context) =>
    Effect.runPromise(effect.pipe(Effect.provide(context as Context.Context<R>)))
  );

describe("reuse command", () => {
  it(
    "emits machine-readable partitions for the tooling pilot scope",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const plan = yield* Effect.promise(() =>
            Promise.resolve(
              runWithReuseContext(
                Effect.gen(function* () {
                  const planner = yield* ReusePartitionPlannerService;
                  return yield* planner.buildPartitions(O.some(TOOLING_CLI_SCOPE));
                })
              )
            )
          );

          expect(plan.scopeSelector).toBe(TOOLING_CLI_SCOPE);
          expect(plan.catalogEntryCount).toBeGreaterThan(0);
          expect(A.map(plan.scoutUnits, (unit) => unit.scopeSelector)).toEqual([TOOLING_CLI_SCOPE]);
          expect(plan.specialistUnits.length).toBeGreaterThan(0);
        })
      ),
    120_000
  );

  it(
    "canonicalizes dot-prefixed scope selectors before emitting partitions",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const plan = yield* Effect.promise(() =>
            Promise.resolve(
              runWithReuseContext(
                Effect.gen(function* () {
                  const planner = yield* ReusePartitionPlannerService;
                  return yield* planner.buildPartitions(O.some(TOOLING_CLI_DOT_SCOPE));
                })
              )
            )
          );

          expect(plan.scopeSelector).toBe(TOOLING_CLI_SCOPE);
          expect(A.map(plan.scoutUnits, (unit) => unit.scopeSelector)).toEqual([TOOLING_CLI_SCOPE]);
        })
      ),
    120_000
  );

  it(
    "emits a stable machine-readable inventory for the tooling pilot scope",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const inventory = yield* Effect.promise(() =>
            Promise.resolve(
              runWithReuseContext(
                Effect.gen(function* () {
                  const inventoryService = yield* ReuseInventoryService;
                  return yield* inventoryService.buildInventory(O.some(TOOLING_CLI_SCOPE));
                })
              )
            )
          );

          expect(inventory.scopeSelector).toBe(TOOLING_CLI_SCOPE);
          expect(inventory.catalogEntryCount).toBeGreaterThan(0);
          expect(inventory.candidateCount).toBe(inventory.candidates.length);
          expect(inventory.candidates.length).toBeGreaterThan(0);
        })
      ),
    120_000
  );

  it(
    "emits a packet for a discovered candidate id",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const inventory = yield* Effect.promise(() =>
            Promise.resolve(
              runWithReuseContext(
                Effect.gen(function* () {
                  const inventoryService = yield* ReuseInventoryService;
                  return yield* inventoryService.buildInventory(O.some(TOOLING_CLI_SCOPE));
                })
              )
            )
          );

          const firstCandidateId = inventory.candidates[0]?.candidateId;
          expect(firstCandidateId).toBeTruthy();
          if (firstCandidateId === undefined) {
            return;
          }

          const packet = yield* Effect.promise(() =>
            Promise.resolve(
              runWithReuseContext(
                Effect.gen(function* () {
                  const inventoryService = yield* ReuseInventoryService;
                  return yield* inventoryService.buildPacket(firstCandidateId, O.some(TOOLING_CLI_SCOPE));
                })
              )
            )
          );

          expect(packet.candidate.candidateId).toBe(firstCandidateId);
          expect(packet.catalogMatches.length).toBeGreaterThan(0);
        })
      ),
    120_000
  );

  it(
    "emits a machine-readable find result",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const result = yield* Effect.promise(() =>
            Promise.resolve(
              runWithReuseContext(
                Effect.gen(function* () {
                  const discovery = yield* ReuseDiscoveryService;
                  return yield* discovery.findReuseOptions({
                    filePath: TOOLING_CLI_FILE,
                    query: O.some("json"),
                    symbolId: O.none(),
                  });
                })
              )
            )
          );

          expect(result.filePath).toBe(TOOLING_CLI_FILE);
          expect(O.isSome(result.query)).toBe(true);
          expect(result.matches.length).toBeGreaterThan(0);
        })
      ),
    120_000
  );

  it(
    "canonicalizes dot-prefixed file paths in machine-readable find results",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const result = yield* Effect.promise(() =>
            Promise.resolve(
              runWithReuseContext(
                Effect.gen(function* () {
                  const discovery = yield* ReuseDiscoveryService;
                  return yield* discovery.findReuseOptions({
                    filePath: `./${TOOLING_CLI_FILE}`,
                    query: O.some("json"),
                    symbolId: O.none(),
                  });
                })
              )
            )
          );

          expect(result.filePath).toBe(TOOLING_CLI_FILE);
          expect(result.matches.length).toBeGreaterThan(0);
        })
      ),
    120_000
  );

  it(
    "validates the Codex SDK smoke adapter contract",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          yield* runReuseCommand(["codex-smoke", "--json"]);

          const result = yield* parseLoggedJson(decodeCodexSmokeResultJson);

          expect(result.sdkPackage).toBe("@openai/codex-sdk");
          expect(result.threadCreated).toBe(true);
          expect(result.threadRunMethodAvailable).toBe(true);
        }).pipe(provideScopedLayer(CommandTestLayer))
      ),
    120_000
  );

  it(
    "emits machine-readable lookup results for existing public exports",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          yield* runReuseCommand(["lookup", "--query", "UnknownRecord", "--json"]);

          const result = yield* parseLoggedJson(decodeRepoCodegraphLookupResultJson);

          expect(result.query).toBe("UnknownRecord");
          expect(result.freshnessStatus).toBe("unchecked");
          expect(
            A.some(
              result.matches,
              (match) => match.packageName === "@beep/schema" && match.symbolName === "UnknownRecord"
            )
          ).toBe(true);
        }).pipe(provideScopedLayer(CommandTestLayer))
      ),
    120_000
  );

  it(
    "strips terminal control sequences from human-readable lookup output",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          yield* runReuseCommand([
            "lookup",
            "--query",
            "UnknownRecord\u001b]52;c;clipboard\u0007\rspoof",
            "--from",
            "packages/missing\u001b[31m/domain",
          ]);

          const output = A.join(A.filter(yield* TestConsole.logLines, isString), "\n");

          expect(output).toContain("Query: UnknownRecordspoof");
          expect(output).toContain('Warning: Caller package selector "packages/missing/domain"');
          expect(output).not.toContain("\u001b");
          expect(output).not.toContain("\u0007");
          expect(output).not.toContain("\r");
        }).pipe(provideScopedLayer(CommandTestLayer))
      ),
    120_000
  );

  it(
    "keeps machine-readable lookup JSON unsanitized for control-sequence input",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const query = "UnknownRecord\u001b]52;c;clipboard\u0007\rspoof";
          const caller = "packages/missing\u001b[31m/domain";
          yield* runReuseCommand(["lookup", "--query", query, "--from", caller, "--json"]);

          const result = yield* parseLoggedJson(decodeRepoCodegraphLookupResultJson);
          const output = A.join(A.filter(yield* TestConsole.logLines, isString), "\n");

          expect(result.query).toBe(query);
          expect(result.warnings.join("\n")).toContain(caller);
          expect(output).toContain("\\u001b");
          expect(output).toContain("\\u0007");
          expect(output).toContain("\\r");
        }).pipe(provideScopedLayer(CommandTestLayer))
      ),
    120_000
  );

  it(
    "runs strict lookup through the command child-process spawner",
    () =>
      Effect.runPromise(
        Effect.gen(function* () {
          yield* runReuseCommand(["lookup", "--query", "UnknownRecord", "--strict", "--json"]);

          const result = yield* parseLoggedJson(decodeRepoCodegraphLookupResultJson);

          expect(result.query).toBe("UnknownRecord");
          expect(result.freshnessStatus).toBe("current");
          expect(result.warnings).toEqual([]);
        }).pipe(provideScopedLayer(CommandTestLayer))
      ),
    360_000
  );
});
