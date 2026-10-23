/**
 * What the real-filesystem integration suites share: the Node platform
 * services their fixture steps run on, temporary directories that live until
 * the suite closes them, and git over a fixture repository.
 *
 * @packageDocumentation
 */
import { Run } from "@beep/commands";
import * as NodeServices from "@effect/platform-node/NodeServices";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as FileSystem from "effect/FileSystem";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as ChildProcess from "effect/process/ChildProcess";
import * as Scope from "effect/Scope";
import type * as PlatformError from "effect/PlatformError";

/** A suite's fixture: the Node runtime its `beforeAll` steps run on, and the scope its directories live in. */
export interface NodeFixture {
  /** Removes every directory the fixture made and disposes the runtime. */
  readonly close: () => Promise<void>;
  readonly runtime: ManagedRuntime.ManagedRuntime<NodeServices.NodeServices, never>;
  /** A fresh temporary directory, removed when {@link NodeFixture.close} runs. */
  readonly tempDirectory: (prefix: string) => Effect.Effect<string, PlatformError.PlatformError, FileSystem.FileSystem>;
}

/** Builds a {@link NodeFixture} for one suite. */
export const makeNodeFixture = (): NodeFixture => {
  const runtime = ManagedRuntime.make(NodeServices.layer);
  const scope = Scope.makeUnsafe();
  const tempDirectory = Effect.fnUntraced(function* (prefix: string) {
    const fs = yield* FileSystem.FileSystem;
    const dir = yield* fs.makeTempDirectory({ prefix });
    yield* Scope.addFinalizer(scope, Effect.ignore(fs.remove(dir, { recursive: true, force: true })));
    return dir;
  });
  return {
    runtime,
    tempDirectory,
    close: () => runtime.runPromise(Scope.close(scope, Exit.void)).then(() => runtime.dispose()),
  };
};

/** A git command in `cwd`, with a stable locale and no prompts; resolves to its trimmed stdout. */
export const gitIn =
  (cwd: string) =>
  (...args: ReadonlyArray<string>) =>
    Run.text(ChildProcess.make("git", args, { cwd, env: { LC_ALL: "C", GIT_TERMINAL_PROMPT: "0" }, extendEnv: true }));
