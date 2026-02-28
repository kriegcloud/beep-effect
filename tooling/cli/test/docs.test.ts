import { docsCommand } from "@beep/repo-cli/commands/docs";
import { rootCommand } from "@beep/repo-cli/commands/root";
import { NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { TestConsole } from "effect/testing";
import { Command } from "effect/unstable/cli";
import { ChildProcessSpawner } from "effect/unstable/process";

const BaseLayers = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  NodeTerminal.layer,
  TestConsole.layer,
  Layer.mock(ChildProcessSpawner.ChildProcessSpawner)({
    streamString: () => Stream.empty,
    streamLines: () => Stream.empty,
  })
);

const withTestLayers =
  <A, E, R, Args extends ReadonlyArray<unknown>>(fn: (...args: Args) => Effect.Effect<A, E, R>) =>
  (...args: Args) =>
    fn(...args).pipe(Effect.provide(BaseLayers));

const run = Command.runWith(docsCommand, { version: "0.0.0" });

describe("docs command", () => {
  it.effect(
    "prints laws guidance",
    withTestLayers(
      Effect.fn(function* () {
        yield* run(["laws"]);

        const lines = yield* TestConsole.logLines;
        const output = lines.map(String).join("\n");

        expect(output.includes("Codebase Laws")).toBe(true);
        expect(output.includes("Run: bun run lint")).toBe(true);
      })
    )
  );

  it.effect(
    "prints fallback guidance for unknown topics",
    withTestLayers(
      Effect.fn(function* () {
        yield* run(["find", "nonexistent-topic"]);

        const lines = yield* TestConsole.logLines;
        const output = lines.map(String).join("\n");

        expect(output.includes('No direct docs match for "nonexistent-topic".')).toBe(true);
        expect(output.includes("bun run beep docs laws")).toBe(true);
      })
    )
  );

  it("is registered under the root command tree", () => {
    const subcommandNames = rootCommand.subcommands.flatMap((group) => group.commands.map((command) => command.name));
    expect(subcommandNames).toContain("docs");
  });
});
