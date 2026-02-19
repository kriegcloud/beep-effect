import { FsUtilsLive } from "@beep/repo-utils";
import { NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { TestConsole } from "effect/testing";
import { Command } from "effect/unstable/cli";
import { ChildProcessSpawner } from "effect/unstable/process";
import { topoSortCommand } from "../src/commands/topo-sort.js";

// ---------------------------------------------------------------------------
// Test layers
// ---------------------------------------------------------------------------

const BaseLayers = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  NodeTerminal.layer,
  TestConsole.layer,
  Layer.mock(ChildProcessSpawner.ChildProcessSpawner)({})
);

const TestLayers = FsUtilsLive.pipe(Layer.provideMerge(BaseLayers));
const withTestLayers =
  <A, E, R, Args extends ReadonlyArray<unknown>>(fn: (...args: Args) => Effect.Effect<A, E, R>) =>
  (...args: Args) =>
    fn(...args).pipe(Effect.provide(TestLayers));

const run = Command.runWith(topoSortCommand, { version: "0.0.0" });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("topo-sort command", () => {
  it.effect(
    "should output packages in dependency order",
    withTestLayers(
      Effect.fn(function* () {
        yield* run([]);

        const logs = yield* TestConsole.logLines;
        const output = logs.map(String);

        // Should contain known workspace packages
        expect(output).toContain("@beep/repo-utils");
        expect(output).toContain("@beep/repo-cli");

        // repo-utils should appear before repo-cli (since cli depends on utils)
        const utilsIdx = output.indexOf("@beep/repo-utils");
        const cliIdx = output.indexOf("@beep/repo-cli");
        expect(utilsIdx).toBeLessThan(cliIdx);
      })
    )
  );

  it.effect(
    "should output all workspace packages",
    withTestLayers(
      Effect.fn(function* () {
        yield* run([]);

        const logs = yield* TestConsole.logLines;
        const output = logs.map(String);

        // Should have at least the packages we know about
        expect(output.length).toBeGreaterThanOrEqual(2);
      })
    )
  );
});
