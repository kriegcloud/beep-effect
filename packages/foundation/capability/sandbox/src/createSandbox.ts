/**
 * Programmatic sandbox creation helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Effect, type FileSystem, type Path } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { MergeProviderEnvOptions, mergeProviderEnv, resolveEnv } from "./Env.ts";
import type { SandboxError } from "./Sandbox.errors.ts";
import {
  BindMountCreateOptions,
  IsolatedCreateOptions,
  type MountEntry,
  type SandboxHandle,
  type SandboxProvider,
} from "./Sandbox.provider.ts";

const $I = $SandboxId.create("createSandbox");

/**
 * Options for creating a sandbox handle directly.
 *
 * @category services
 * @since 0.0.0
 */
export interface CreateSandboxOptions<R = never> {
  readonly cwd: string;
  readonly env?: Readonly<Record<string, string>>;
  readonly mounts?: ReadonlyArray<MountEntry>;
  readonly sandbox: SandboxProvider<R>;
  readonly worktreePath: string;
}

/**
 * Result of direct sandbox creation.
 *
 * @category models
 * @since 0.0.0
 */
export class CreateSandboxResult extends S.Class<CreateSandboxResult>($I`CreateSandboxResult`)(
  {
    providerName: S.String,
    worktreePath: S.String,
  },
  $I.annote("CreateSandboxResult", {
    description: "Result of direct sandbox creation.",
  })
) {}

/**
 * Create a sandbox handle from a provider.
 *
 * @category constructors
 * @since 0.0.0
 */
export const createSandbox: <R>(
  options: CreateSandboxOptions<R>
) => Effect.Effect<SandboxHandle<R>, SandboxError, R | FileSystem.FileSystem | Path.Path> = Effect.fn(
  "createSandbox.createSandbox"
)(function* <R>(options: CreateSandboxOptions<R>) {
  const resolvedEnv = yield* resolveEnv(options.cwd);
  const env = yield* mergeProviderEnv(
    new MergeProviderEnvOptions({
      agentProviderEnv: {},
      resolvedEnv,
      sandboxProviderEnv: {
        ...options.sandbox.env,
        ...(options.env ?? {}),
      },
    })
  );

  if (P.isTagged(options.sandbox, "BindMount")) {
    return yield* options.sandbox.create(
      new BindMountCreateOptions({
        env,
        hostRepoPath: options.cwd,
        mounts: [...(options.mounts ?? [])],
        worktreePath: options.worktreePath,
      })
    );
  }

  if (P.isTagged(options.sandbox, "Isolated")) {
    return yield* options.sandbox.create(new IsolatedCreateOptions({ env }));
  }

  return yield* options.sandbox.create({
    env,
    worktreePath: options.worktreePath,
  });
});
