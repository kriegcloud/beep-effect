import { Effect, Layer, ServiceMap } from "effect"
import type { CommandExecutionError, CommandHookError } from "./CommandErrors.js"
import type {
  CommandInvocationContext,
  CommandPlan,
  CommandPlanPatch,
  CommandRequest,
  CommandResult
} from "./CommandTypes.js"

export interface CommandHook {
  readonly id: string
  readonly beforeExecute?: (args: {
    readonly context: CommandInvocationContext
    readonly request: CommandRequest
    readonly plan: CommandPlan
  }) => Effect.Effect<CommandPlanPatch | void, CommandHookError>
  readonly afterExecute?: (args: {
    readonly context: CommandInvocationContext
    readonly request: CommandRequest
    readonly plan: CommandPlan
    readonly result: CommandResult
  }) => Effect.Effect<void>
  readonly onError?: (args: {
    readonly context: CommandInvocationContext
    readonly request: CommandRequest
    readonly plan: CommandPlan | null
    readonly error: CommandExecutionError
  }) => Effect.Effect<void>
}

export interface CommandHooksService {
  readonly hooks: ReadonlyArray<CommandHook>
}

export class CommandHooks extends ServiceMap.Service<CommandHooks>()(
  "server/tools/command/CommandHooks",
  {
    make: Effect.succeed({
      hooks: [] as ReadonlyArray<CommandHook>
    } satisfies CommandHooksService)
  }
) {
  static layer = Layer.effect(this, this.make)

  static fromHooks = (
    hooks: ReadonlyArray<CommandHook>
  ): Layer.Layer<CommandHooks> =>
    Layer.succeed(this, {
      hooks
    } satisfies CommandHooksService)
}

export const makeCommandHook = (hook: CommandHook): CommandHook => hook
