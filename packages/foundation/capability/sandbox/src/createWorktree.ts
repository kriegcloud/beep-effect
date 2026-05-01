/**
 * Programmatic managed-worktree helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Effect, type FileSystem, type Path } from "effect";
import * as S from "effect/Schema";
import type { AgentProvider } from "./Agent.provider.ts";
import type { AgentStreamEmitter } from "./AgentStreamEmitter.ts";
import type { Display } from "./Display.ts";
import { type RunOptions, type RunResult, run } from "./Run.ts";
import type { SandboxError } from "./Sandbox.errors.ts";
import type { SandboxProcess } from "./Sandbox.process.ts";
import { NamedBranchStrategy, type SandboxProvider } from "./Sandbox.provider.ts";
import { CreateWorktreeInfoOptions, createWorktreeInfo, type WorktreeInfo } from "./Worktree.ts";

const $I = $SandboxId.create("createWorktree");

/**
 * Options for creating a managed worktree.
 *
 * @category services
 * @since 0.0.0
 */
export interface CreateWorktreeOptions {
  readonly baseBranch?: string;
  readonly branch?: string;
  readonly name?: string;
  readonly repoDir: string;
}

/**
 * Programmatic worktree wrapper.
 *
 * @category services
 * @since 0.0.0
 */
export interface Worktree<R = never> {
  readonly branch: string;
  readonly path: string;
  readonly run: (
    options: Omit<RunOptions<R>, "agent" | "branchStrategy" | "sandbox"> & {
      readonly agent: AgentProvider;
      readonly sandbox: SandboxProvider<R>;
    }
  ) => Effect.Effect<
    RunResult,
    SandboxError,
    R | SandboxProcess | FileSystem.FileSystem | Path.Path | Display | AgentStreamEmitter
  >;
}

/**
 * Worktree creation summary.
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
 * @category constructors
 * @since 0.0.0
 */
export const createWorktree = <R>(
  options: CreateWorktreeOptions
): Effect.Effect<Worktree<R>, SandboxError, Path.Path | SandboxProcess> =>
  Effect.gen(function* () {
    const info: WorktreeInfo = yield* createWorktreeInfo(
      new CreateWorktreeInfoOptions({
        ...(options.baseBranch === undefined ? {} : { baseBranch: options.baseBranch }),
        ...(options.branch === undefined ? {} : { branch: options.branch }),
        ...(options.name === undefined ? {} : { name: options.name }),
        repoDir: options.repoDir,
      })
    );

    return {
      branch: info.branch,
      path: info.path,
      run: (runOptions) =>
        run({
          ...runOptions,
          branchStrategy: new NamedBranchStrategy({ branch: info.branch }),
        }),
    };
  });
