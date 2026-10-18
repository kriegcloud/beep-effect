import { it } from "@beep/test-runner";
import { NodeChildProcessSpawner } from "@effect/platform-node";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as ChildProcess from "effect/process/ChildProcess";
import * as Stream from "effect/Stream";

const fixturePath = new URL("./fixtures/declaration-emit/AuditedRelease.machine.ts", import.meta.url).pathname;
const tscPath = new URL("../../../../node_modules/.bin/tsc", import.meta.url).pathname;

// The spawner only touches the filesystem to check an explicit `cwd`, which this test never sets.
const SpawnerLayer = NodeChildProcessSpawner.layer.pipe(
  Layer.provide(Layer.mergeAll(FileSystem.layerNoop({}), NodePath.layer))
);

const readText = <E, R>(stream: Stream.Stream<Uint8Array, E, R>) => stream.pipe(Stream.decodeText(), Stream.mkString);

describe("@xstate/effect declaration emit", () => {
  it.layer(SpawnerLayer, { timeout: "60 seconds" })("exported machines", (it) => {
    it.effect(
      "emits declarations for an exported machine that registers Effect actions",
      Effect.fnUntraced(function* () {
        const child = yield* ChildProcess.make(
          tscPath,
          [
            "--ignoreConfig",
            "--noEmit",
            "--declaration",
            "--strict",
            "--skipLibCheck",
            "--target",
            "es2022",
            "--module",
            "esnext",
            "--moduleResolution",
            "bundler",
            fixturePath,
          ],
          { stdin: "ignore", stdout: "pipe", stderr: "pipe" }
        );
        const [exitCode, stdout, stderr] = yield* Effect.all(
          [child.exitCode, readText(child.stdout), readText(child.stderr)],
          { concurrency: "unbounded" }
        );

        expect(`${stdout}${stderr}`).not.toContain("TS4023");
        expect(exitCode, `${stdout}${stderr}`).toBe(0);
      })
    );
  });
});
