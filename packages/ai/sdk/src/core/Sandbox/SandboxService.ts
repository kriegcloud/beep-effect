import { ServiceMap } from "effect";
import type * as Effect from "effect/Effect";
import type * as Scope from "effect/Scope";
import type { QueryHandle } from "../Query.js";
import type { Options } from "../Schema/Options.js";
import type { SandboxError } from "./SandboxError.js";

/**
 * @since 0.0.0
 */
export type SandboxProvider = "local" | "cloudflare";

/**
 * @since 0.0.0
 */
export type ExecResult = {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
};

/**
 * @since 0.0.0
 */
export class SandboxService extends ServiceMap.Service<
  SandboxService,
  {
    /** Which backend is active. */
    readonly provider: SandboxProvider;

    /** Whether execution is isolated from the host. */
    readonly isolated: boolean;

    /** Execute a shell command in the sandbox environment. */
    readonly exec: (command: string, args?: ReadonlyArray<string>) => Effect.Effect<ExecResult, SandboxError>;

    /** Write a file inside the sandbox. */
    readonly writeFile: (path: string, content: string) => Effect.Effect<void, SandboxError>;

    /** Read a file from the sandbox. */
    readonly readFile: (path: string) => Effect.Effect<string, SandboxError>;

    /**
     * Run a full agent session inside the sandbox.
     *
     * Returns a QueryHandle whose stream emits SDKMessage events
     * from the sandboxed agent. Hooks are applied by the caller
     * (AgentRuntime), not inside the sandbox.
     */
    readonly runAgent: (prompt: string, options?: Options) => Effect.Effect<QueryHandle, SandboxError, Scope.Scope>;

    /** Tear down the sandbox instance. Noop for local. */
    readonly destroy: Effect.Effect<void, SandboxError>;
  }
>()("@effect/claude-agent-sdk/SandboxService") {}
