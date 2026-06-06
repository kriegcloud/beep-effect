/**
 * Provider contracts for sandbox runtimes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Fn, LiteralKit } from "@beep/schema";
import { Effect } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import { CopyError } from "./Sandbox.errors.ts";
import type { SandboxError } from "./Sandbox.errors.ts";

const $I = $SandboxId.create("Sandbox.provider");

/**
 * Sandbox provider kind.
 *
 * @example
 * ```ts
 * import { SandboxProviderKind } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(SandboxProviderKind)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const SandboxProviderKind = LiteralKit(["BindMount", "Isolated", "None"]).pipe(
  $I.annoteSchema("SandboxProviderKind", {
    description: "Sandbox provider kind.",
  })
);

/**
 * Runtime type for {@link SandboxProviderKind}.
 *
 * @category models
 * @since 0.0.0
 */
export type SandboxProviderKind = typeof SandboxProviderKind.Type;

/**
 * Result of executing a command inside a sandbox.
 *
 * @example
 * ```ts
 * import { ExecResult } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(ExecResult)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExecResult extends S.Class<ExecResult>($I`ExecResult`)(
  {
    exitCode: S.Finite,
    stderr: S.String,
    stdout: S.String,
  },
  $I.annote("ExecResult", {
    description: "Result of executing a command inside a sandbox.",
  })
) {}

/**
 * Options for non-interactive sandbox command execution.
 *
 * @example
 * ```ts
 * import { SandboxExecOptions } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(SandboxExecOptions)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SandboxExecOptions extends S.Class<SandboxExecOptions>($I`SandboxExecOptions`)(
  {
    cwd: S.optionalKey(S.String),
    onLine: S.optionalKey(Fn({ input: S.String, output: S.Void })),
    stdin: S.optionalKey(S.String),
    sudo: S.Boolean.pipe(S.withConstructorDefault(Effect.succeed(false))),
  },
  $I.annote("SandboxExecOptions", {
    description: "Options for non-interactive sandbox command execution.",
  })
) {}

/**
 * Result of an interactive sandbox command.
 *
 * @example
 * ```ts
 * import { InteractiveExecResult } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(InteractiveExecResult)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InteractiveExecResult extends S.Class<InteractiveExecResult>($I`InteractiveExecResult`)(
  {
    exitCode: S.Finite,
  },
  $I.annote("InteractiveExecResult", {
    description: "Result of an interactive sandbox command.",
  })
) {}

/**
 * Options for interactive sandbox command execution.
 *
 * @example
 * ```ts
 * import type { InteractiveExecOptions } from "@beep/sandbox/Sandbox.provider"
 *
 * const value = {} as InteractiveExecOptions
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface InteractiveExecOptions {
  readonly cwd?: string;
  readonly stderr: NodeJS.WritableStream;
  readonly stdin: NodeJS.ReadableStream;
  readonly stdout: NodeJS.WritableStream;
}

/**
 * A host-to-sandbox mount declaration.
 *
 * @example
 * ```ts
 * import { MountEntry } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(MountEntry)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class MountEntry extends S.Class<MountEntry>($I`MountEntry`)(
  {
    hostPath: S.String,
    readonly: S.Boolean.pipe(S.withConstructorDefault(Effect.succeed(false))),
    sandboxPath: S.String,
  },
  $I.annote("MountEntry", {
    description: "A host-to-sandbox mount declaration.",
  })
) {}

/**
 * Options passed when creating a bind-mount sandbox.
 *
 * @example
 * ```ts
 * import { BindMountCreateOptions } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(BindMountCreateOptions)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class BindMountCreateOptions extends S.Class<BindMountCreateOptions>($I`BindMountCreateOptions`)(
  {
    env: S.Record(S.String, S.String),
    hostRepoPath: S.String,
    mounts: S.Array(MountEntry),
    worktreePath: S.String,
  },
  $I.annote("BindMountCreateOptions", {
    description: "Options passed when creating a bind-mount sandbox.",
  })
) {}

/**
 * Options passed when creating an isolated sandbox.
 *
 * @example
 * ```ts
 * import { IsolatedCreateOptions } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(IsolatedCreateOptions)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class IsolatedCreateOptions extends S.Class<IsolatedCreateOptions>($I`IsolatedCreateOptions`)(
  {
    env: S.Record(S.String, S.String),
  },
  $I.annote("IsolatedCreateOptions", {
    description: "Options passed when creating an isolated sandbox.",
  })
) {}

/**
 * Branch strategy that runs against the current working tree.
 *
 * @example
 * ```ts
 * import { HeadBranchStrategy } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(HeadBranchStrategy)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HeadBranchStrategy extends S.TaggedClass<HeadBranchStrategy>($I`HeadBranchStrategy`)(
  "Head",
  {},
  $I.annote("HeadBranchStrategy", {
    description: "Branch strategy that runs against the current working tree.",
  })
) {}

/**
 * Branch strategy that merges a temporary branch back to the host branch.
 *
 * @example
 * ```ts
 * import { MergeToHeadBranchStrategy } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(MergeToHeadBranchStrategy)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class MergeToHeadBranchStrategy extends S.TaggedClass<MergeToHeadBranchStrategy>($I`MergeToHeadBranchStrategy`)(
  "MergeToHead",
  {},
  $I.annote("MergeToHeadBranchStrategy", {
    description: "Branch strategy that merges a temporary branch back to the host branch.",
  })
) {}

/**
 * Branch strategy that writes changes to a named branch.
 *
 * @example
 * ```ts
 * import { NamedBranchStrategy } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(NamedBranchStrategy)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NamedBranchStrategy extends S.TaggedClass<NamedBranchStrategy>($I`NamedBranchStrategy`)(
  "Branch",
  {
    baseBranch: S.optionalKey(S.String),
    branch: S.String,
  },
  $I.annote("NamedBranchStrategy", {
    description: "Branch strategy that writes changes to a named branch.",
  })
) {}

/**
 * Branch strategy for a sandbox run.
 *
 * @example
 * ```ts
 * import { BranchStrategy } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(BranchStrategy)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const BranchStrategy = S.Union([HeadBranchStrategy, MergeToHeadBranchStrategy, NamedBranchStrategy]).pipe(
  $I.annoteSchema("BranchStrategy", {
    description: "Branch strategy for a sandbox run.",
  })
);

/**
 * Runtime type for {@link BranchStrategy}.
 *
 * @category models
 * @since 0.0.0
 */
export type BranchStrategy = typeof BranchStrategy.Type;

/**
 * Common handle returned by a running sandbox provider.
 *
 * @example
 * ```ts
 * import type { SandboxHandle } from "@beep/sandbox/Sandbox.provider"
 *
 * const value = {} as SandboxHandle
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface SandboxHandle<R = never> {
  readonly close: Effect.Effect<void, SandboxError, R>;
  readonly copyFileOut: (sandboxPath: string, hostPath: string) => Effect.Effect<void, SandboxError, R>;
  readonly exec: (command: string, options?: SandboxExecOptions) => Effect.Effect<ExecResult, SandboxError, R>;
  readonly interactiveExec?: (
    args: ReadonlyArray<string>,
    options: InteractiveExecOptions
  ) => Effect.Effect<InteractiveExecResult, SandboxError, R>;
  readonly worktreePath: string;
}

/**
 * Handle returned by bind-mount providers.
 *
 * @example
 * ```ts
 * import type { BindMountSandboxHandle } from "@beep/sandbox/Sandbox.provider"
 *
 * const value = {} as BindMountSandboxHandle
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface BindMountSandboxHandle<R = never> extends SandboxHandle<R> {
  readonly copyFileIn: (hostPath: string, sandboxPath: string) => Effect.Effect<void, SandboxError, R>;
}

/**
 * Handle returned by isolated providers.
 *
 * @example
 * ```ts
 * import type { IsolatedSandboxHandle } from "@beep/sandbox/Sandbox.provider"
 *
 * const value = {} as IsolatedSandboxHandle
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface IsolatedSandboxHandle<R = never> extends SandboxHandle<R> {
  readonly copyIn: (hostPath: string, sandboxPath: string) => Effect.Effect<void, SandboxError, R>;
}

/**
 * Handle returned by the no-sandbox provider.
 *
 * @example
 * ```ts
 * import type { NoSandboxHandle } from "@beep/sandbox/Sandbox.provider"
 *
 * const value = {} as NoSandboxHandle
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface NoSandboxHandle<R = never> extends SandboxHandle<R> {}

/**
 * Bind-mount sandbox provider contract.
 *
 * @example
 * ```ts
 * import type { BindMountSandboxProvider } from "@beep/sandbox/Sandbox.provider"
 *
 * const value = {} as BindMountSandboxProvider
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface BindMountSandboxProvider<R = never> {
  readonly _tag: "BindMount";
  readonly create: (options: BindMountCreateOptions) => Effect.Effect<BindMountSandboxHandle<R>, SandboxError, R>;
  readonly env: Readonly<Record<string, string>>;
  readonly name: string;
  readonly sandboxHomedir: string | undefined;
}

/**
 * Isolated sandbox provider contract.
 *
 * @example
 * ```ts
 * import type { IsolatedSandboxProvider } from "@beep/sandbox/Sandbox.provider"
 *
 * const value = {} as IsolatedSandboxProvider
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface IsolatedSandboxProvider<R = never> {
  readonly _tag: "Isolated";
  readonly create: (options: IsolatedCreateOptions) => Effect.Effect<IsolatedSandboxHandle<R>, SandboxError, R>;
  readonly env: Readonly<Record<string, string>>;
  readonly name: string;
}

/**
 * Host-local no-sandbox provider contract.
 *
 * @example
 * ```ts
 * import type { NoSandboxProvider } from "@beep/sandbox/Sandbox.provider"
 *
 * const value = {} as NoSandboxProvider
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface NoSandboxProvider<R = never> {
  readonly _tag: "None";
  readonly create: (options: {
    readonly env: Readonly<Record<string, string>>;
    readonly worktreePath: string;
  }) => Effect.Effect<NoSandboxHandle<R>, SandboxError, R>;
  readonly env: Readonly<Record<string, string>>;
  readonly name: string;
}

/**
 * Any sandbox provider supported by the first programmatic port.
 *
 * @example
 * ```ts
 * import type { SandboxProvider } from "@beep/sandbox/Sandbox.provider"
 *
 * const value = {} as SandboxProvider
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export type SandboxProvider<R = never> =
  | BindMountSandboxProvider<R>
  | IsolatedSandboxProvider<R>
  | NoSandboxProvider<R>;

/**
 * Configuration for {@link createBindMountSandboxProvider}.
 *
 * @example
 * ```ts
 * import type { BindMountSandboxProviderConfig } from "@beep/sandbox/Sandbox.provider"
 *
 * const value = {} as BindMountSandboxProviderConfig
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface BindMountSandboxProviderConfig<R = never> {
  readonly create: (options: BindMountCreateOptions) => Effect.Effect<BindMountSandboxHandle<R>, SandboxError, R>;
  readonly env?: Readonly<Record<string, string>>;
  readonly name: string;
  readonly sandboxHomedir?: string;
}

/**
 * Configuration for {@link createIsolatedSandboxProvider}.
 *
 * @example
 * ```ts
 * import type { IsolatedSandboxProviderConfig } from "@beep/sandbox/Sandbox.provider"
 *
 * const value = {} as IsolatedSandboxProviderConfig
 * console.log(value)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface IsolatedSandboxProviderConfig<R = never> {
  readonly create: (options: IsolatedCreateOptions) => Effect.Effect<IsolatedSandboxHandle<R>, SandboxError, R>;
  readonly env?: Readonly<Record<string, string>>;
  readonly name: string;
}

/**
 * Create a bind-mount sandbox provider.
 *
 * @example
 * ```ts
 * import { createBindMountSandboxProvider } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(createBindMountSandboxProvider)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const createBindMountSandboxProvider = <R = never>(
  config: BindMountSandboxProviderConfig<R>
): BindMountSandboxProvider<R> => ({
  _tag: "BindMount",
  create: config.create,
  env: config.env ?? {},
  name: config.name,
  sandboxHomedir: config.sandboxHomedir,
});

/**
 * Create an isolated sandbox provider.
 *
 * @example
 * ```ts
 * import { createIsolatedSandboxProvider } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(createIsolatedSandboxProvider)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const createIsolatedSandboxProvider = <R = never>(
  config: IsolatedSandboxProviderConfig<R>
): IsolatedSandboxProvider<R> => ({
  _tag: "Isolated",
  create: config.create,
  env: config.env ?? {},
  name: config.name,
});

type PromiseBindMountProviderConfig = Omit<BindMountSandboxProviderConfig, "create"> & {
  readonly create: (options: BindMountCreateOptions) => Promise<BindMountSandboxHandle>;
};

type PromiseIsolatedProviderConfig = Omit<IsolatedSandboxProviderConfig, "create"> & {
  readonly create: (options: IsolatedCreateOptions) => Promise<IsolatedSandboxHandle>;
};

/**
 * Convert a Promise-based bind-mount provider into the Effect contract.
 *
 * @example
 * ```ts
 * import { fromPromiseBindMountSandboxProvider } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(fromPromiseBindMountSandboxProvider)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const fromPromiseBindMountSandboxProvider = (config: PromiseBindMountProviderConfig): BindMountSandboxProvider =>
  createBindMountSandboxProvider({
    ...config,
    create: Effect.fn("SandboxProvider.fromPromiseBindMount.create")((options) =>
      Effect.tryPromise({
        try: () => config.create(options),
        catch: (cause) =>
          CopyError.make({
            cause,
            message: `Failed to create bind-mount sandbox provider "${config.name}".`,
          }),
      })
    ),
  });

/**
 * Convert a Promise-based isolated provider into the Effect contract.
 *
 * @example
 * ```ts
 * import { fromPromiseIsolatedSandboxProvider } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(fromPromiseIsolatedSandboxProvider)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const fromPromiseIsolatedSandboxProvider = (config: PromiseIsolatedProviderConfig): IsolatedSandboxProvider =>
  createIsolatedSandboxProvider({
    ...config,
    create: Effect.fn("SandboxProvider.fromPromiseIsolated.create")((options) =>
      Effect.tryPromise({
        try: () => config.create(options),
        catch: (cause) =>
          CopyError.make({
            cause,
            message: `Failed to create isolated sandbox provider "${config.name}".`,
          }),
      })
    ),
  });

/**
 * Match a sandbox provider by provider kind.
 *
 * @example
 * ```ts
 * import { matchSandboxProvider } from "@beep/sandbox/Sandbox.provider"
 *
 * console.log(matchSandboxProvider)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const matchSandboxProvider: {
  <A>(cases: {
    readonly BindMount: (provider: BindMountSandboxProvider) => A;
    readonly Isolated: (provider: IsolatedSandboxProvider) => A;
    readonly None: (provider: NoSandboxProvider) => A;
  }): (provider: SandboxProvider) => A;
  <A>(
    provider: SandboxProvider,
    cases: {
      readonly BindMount: (provider: BindMountSandboxProvider) => A;
      readonly Isolated: (provider: IsolatedSandboxProvider) => A;
      readonly None: (provider: NoSandboxProvider) => A;
    }
  ): A;
} = dual(
  2,
  <A>(
    provider: SandboxProvider,
    cases: {
      readonly BindMount: (provider: BindMountSandboxProvider) => A;
      readonly Isolated: (provider: IsolatedSandboxProvider) => A;
      readonly None: (provider: NoSandboxProvider) => A;
    }
  ): A => {
    if (provider._tag === "BindMount") {
      return cases.BindMount(provider);
    }
    if (provider._tag === "Isolated") {
      return cases.Isolated(provider);
    }
    return cases.None(provider);
  }
);
