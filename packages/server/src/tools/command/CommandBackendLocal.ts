import { Effect, Layer } from "effect"
import {
  type CliRuntimeError
} from "../cli/CliErrors.js"
import { CliRuntime } from "../cli/CliRuntime.js"
import { CommandBackend, type CommandBackendService } from "./CommandBackend.js"
import {
  CommandExecutionFailed,
  CommandSpawnFailed,
  CommandTimeout
} from "./CommandErrors.js"
import {
  type CommandPlan,
  type CommandResult
} from "./CommandTypes.js"

const toErrorMessage = (error: unknown): string =>
  typeof error === "object" && error !== null && "message" in error
    ? String((error as { readonly message?: unknown }).message)
    : String(error)

const mapCliErrorToCommandError = (
  error: CliRuntimeError
): CommandExecutionFailed | CommandSpawnFailed | CommandTimeout => {
  switch (error._tag) {
    case "CliSpawnFailed":
      return new CommandSpawnFailed({
        reason: error.reason
      })
    case "CliTimeout":
      return new CommandTimeout({
        timeoutMs: error.timeoutMs
      })
    case "CliIdleTimeout":
      return new CommandTimeout({
        timeoutMs: error.idleTimeoutMs
      })
    case "CliValidationError":
    case "CliExecutionFailed":
    case "CliRuntimeUnavailable":
      return new CommandExecutionFailed({
        reason: toErrorMessage(error.reason)
      })
  }
}

export const layer = Layer.effect(
  CommandBackend,
  Effect.gen(function*() {
    const cliRuntime = yield* CliRuntime

    const executePlan: CommandBackendService["executePlan"] = (
      plan: CommandPlan
    ): Effect.Effect<CommandResult, CommandExecutionFailed | CommandSpawnFailed | CommandTimeout> =>
      cliRuntime.run(
        plan.mode === "Shell"
          ? {
              mode: "Shell",
              command: plan.command,
              cwd: plan.cwd,
              env: plan.env,
              timeoutMs: plan.timeoutMs,
              outputLimitBytes: plan.outputLimitBytes
            }
          : {
              mode: "Argv",
              command: plan.executable,
              args: plan.args,
              cwd: plan.cwd,
              env: plan.env,
              timeoutMs: plan.timeoutMs,
              outputLimitBytes: plan.outputLimitBytes
            }
      ).pipe(
        Effect.mapError(mapCliErrorToCommandError)
      )

    return {
      executePlan
    } satisfies CommandBackendService
  })
)
