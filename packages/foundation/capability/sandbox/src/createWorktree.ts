/**
 * Programmatic managed-worktree helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import * as O from "@beep/utils/Option";
import { Effect, Ref } from "effect";
import * as S from "effect/Schema";
import { run } from "./Run.ts";
import { HeadBranchStrategy } from "./Sandbox.provider.ts";
import { CreateWorktreeInfoOptions, createWorktreeInfo, removeWorktree } from "./Worktree.ts";
import type { FileSystem, Path, Scope } from "effect";
import type { AgentProvider } from "./Agent.provider.ts";
import type { AgentStreamEmitter } from "./AgentStreamEmitter.ts";
import type { Display } from "./Display.ts";
import type { RunOptions, RunResult } from "./Run.ts";
import type { SandboxError } from "./Sandbox.errors.ts";
import type { SandboxProcess } from "./Sandbox.process.ts";
import type { SandboxProvider } from "./Sandbox.provider.ts";
import type { WorktreeInfo } from "./Worktree.ts";

const $I = $SandboxId.create("createWorktree");

/**
 * Options for creating a managed worktree.
 *
 * @example
 * ```ts
 * import { CreateWorktreeOptions } from "@beep/sandbox/createWorktree"
 *
 * console.log(CreateWorktreeOptions)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CreateWorktreeOptions extends S.Class<CreateWorktreeOptions>($I`CreateWorktreeOptions`)(
  {
    baseBranch: S.optionalKey(S.String),
    branch: S.optionalKey(S.String),
    name: S.optionalKey(S.String),
    repoDir: S.String,
  },
  $I.annote("CreateWorktreeOptions", {
    description: "Options for creating a managed worktree.",
  })
) {}

/**
 * Programmatic worktree wrapper.
 *
 * @example
 * ```ts
 * import type { Worktree } from "@beep/sandbox/createWorktree"
 *
 * const value = {} as Worktree
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface Worktree<R = never> {
  readonly branch: string;
  readonly close: Effect.Effect<void, SandboxError, Path.Path | SandboxProcess>;
  readonly path: string;
  readonly run: <RunEnv = R>(
    options: Omit<RunOptions<RunEnv>, "agent" | "branchStrategy" | "sandbox"> & {
      readonly agent: AgentProvider;
      readonly sandbox: SandboxProvider<RunEnv>;
    }
  ) => Effect.Effect<
    RunResult,
    SandboxError,
    RunEnv | SandboxProcess | FileSystem.FileSystem | Path.Path | Display | AgentStreamEmitter
  >;
}

/**
 * Worktree creation summary.
 *
 * @example
 * ```ts
 * import { CreateWorktreeResult } from "@beep/sandbox/createWorktree"
 *
 * console.log(CreateWorktreeResult)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CreateWorktreeResult extends S.Class<CreateWorktreeResult>($I`CreateWorktreeResult`)(
  {
    branch: S.String,
    path: S.String,
  },
  $I.annote("CreateWorktreeResult", {
    description: "Worktree creation summary.",
  })
) {}

/**
 * Create a managed worktree wrapper.
 *
 * @example
 * ```ts
 * import { createWorktree } from "@beep/sandbox/createWorktree"
 *
 * console.log(createWorktree)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const createWorktree = Effect.fn("createWorktree.createWorktree")(function* <R = never>(
  options: CreateWorktreeOptions
): Effect.fn.Return<Worktree<R>, SandboxError, Path.Path | SandboxProcess> {
  const info: WorktreeInfo = yield* createWorktreeInfo(
    CreateWorktreeInfoOptions.make({
      ...O.getSomesStruct({ baseBranch: O.fromUndefinedOr(options.baseBranch) }),
      ...O.getSomesStruct({ branch: O.fromUndefinedOr(options.branch) }),
      ...O.getSomesStruct({ name: O.fromUndefinedOr(options.name) }),
      repoDir: options.repoDir,
    })
  );
  const closedRef = yield* Ref.make(false);
  const close = Effect.gen(function* () {
    const alreadyClosed = yield* Ref.getAndSet(closedRef, true);

    if (alreadyClosed) {
      return;
    }

    yield* removeWorktree(info.path);
  }).pipe(Effect.withSpan("createWorktree.close"));

  return {
    branch: info.branch,
    close,
    path: info.path,
    run: (runOptions) =>
      run({
        ...runOptions,
        branchStrategy: HeadBranchStrategy.make({}),
        cwd: info.path,
      }),
  };
});

/**
 * Create a managed worktree whose lifetime is bound to the current Effect scope.
 *
 * @example
 * ```ts
 * import { createWorktreeScoped } from "@beep/sandbox/createWorktree"
 *
 * console.log(createWorktreeScoped)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const createWorktreeScoped = Effect.fn("createWorktree.createWorktreeScoped")(function* <R = never>(
  options: CreateWorktreeOptions
): Effect.fn.Return<Worktree<R>, SandboxError, Path.Path | SandboxProcess | Scope.Scope> {
  return yield* Effect.acquireRelease(createWorktree<R>(options), (worktree) => worktree.close.pipe(Effect.orDie));
});
