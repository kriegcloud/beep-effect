import { Complete, Suspended } from "@effect/workflow/Workflow"
import { Cause, Effect, Exit, Option } from "effect"
import { expect, test } from "vitest"
import { WorkflowNotFoundError, WorkflowSuspendedError } from "../../src/Domain/Error/Workflow.js"
import { handleWorkflowResult } from "../../src/Service/WorkflowOrchestrator.js"

test("handleWorkflowResult unwraps successful completion", async () => {
  const result = new Complete({ exit: Exit.succeed("ok") })

  const value = await Effect.runPromise(handleWorkflowResult("exec-1", result))
  expect(value).toBe("ok")
})

test("handleWorkflowResult rejects suspended and missing workflows", async () => {
  const suspended = new Suspended({ cause: undefined })

  const suspendedExit = await Effect.runPromiseExit(handleWorkflowResult("exec-2", suspended))
  expect(suspendedExit._tag).toBe("Failure")
  const suspendedError = Cause.failureOption((suspendedExit as Exit.Failure<unknown, unknown>).cause)
  expect(Option.isSome(suspendedError)).toBe(true)
  if (Option.isSome(suspendedError)) {
    expect(suspendedError.value).toBeInstanceOf(WorkflowSuspendedError)
  }

  const missingExit = await Effect.runPromiseExit(handleWorkflowResult("exec-3", undefined))
  expect(missingExit._tag).toBe("Failure")
  const missingError = Cause.failureOption((missingExit as Exit.Failure<unknown, unknown>).cause)
  expect(Option.isSome(missingError)).toBe(true)
  if (Option.isSome(missingError)) {
    expect(missingError.value).toBeInstanceOf(WorkflowNotFoundError)
  }
})
