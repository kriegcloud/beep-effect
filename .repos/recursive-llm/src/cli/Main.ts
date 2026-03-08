import * as ValidationError from "@effect/cli/ValidationError"
import { BunContext } from "@effect/platform-bun"
import { Effect } from "effect"
import { runCliCommand, type RunCliCommandOptions } from "./Command"
import { CliInputError } from "./Normalize"

const handleValidationError = (error: ValidationError.ValidationError) =>
  Effect.sync(() => {
    if (error._tag !== "HelpRequested") {
      process.exitCode = 1
    }
  })

const handleCliInputError = (error: CliInputError) =>
  Effect.sync(() => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })

export interface RunCliMainOptions extends RunCliCommandOptions {}

export const runCliMain = (
  argv: ReadonlyArray<string>,
  options: RunCliMainOptions = {}
) =>
  Effect.suspend(() => runCliCommand(argv, options)).pipe(
    Effect.provide(BunContext.layer),
    Effect.catchIf(ValidationError.isValidationError, handleValidationError),
    Effect.catchIf((error): error is CliInputError => error instanceof CliInputError, handleCliInputError)
  )
