import { Duration, Effect, Ref, Schedule } from "effect"
import type { CallContext, VariableSnapshot } from "./CallContext"
import type { SandboxError } from "./RlmError"
import type { SandboxInstance } from "./Sandbox"

export interface VariableSpace {
  readonly inject: (name: string, value: unknown) => Effect.Effect<void, SandboxError>
  readonly injectAll: (variables: Record<string, unknown>) => Effect.Effect<void, SandboxError>
  readonly read: (name: string) => Effect.Effect<unknown, SandboxError>
  readonly cached: Effect.Effect<VariableSnapshot>
  readonly sync: Effect.Effect<VariableSnapshot, SandboxError>
}

export interface VariableSpaceOptions {
  readonly maxRetries?: number
  readonly retryBaseDelay?: Duration.DurationInput
}

const defaultRetryBaseDelay = "50 millis"
const defaultMaxRetries = 3

export const makeVariableSpace = (
  sandbox: SandboxInstance,
  snapshotRef: Ref.Ref<VariableSnapshot>,
  iterationRef: Ref.Ref<number>,
  options?: VariableSpaceOptions
): VariableSpace => {
  const maxRetries = options?.maxRetries ?? defaultMaxRetries
  const retryBaseDelay = options?.retryBaseDelay ?? defaultRetryBaseDelay

  const retryPolicy = Schedule.exponential(retryBaseDelay).pipe(
    Schedule.compose(Schedule.recurs(maxRetries))
  )

  const sync = Effect.gen(function*() {
    const variables = yield* sandbox.listVariables().pipe(Effect.retry(retryPolicy))
    const iteration = yield* Ref.get(iterationRef)
    const snapshot: VariableSnapshot = {
      variables,
      snapshotIteration: iteration,
      syncedAtMs: Date.now()
    }
    yield* Ref.set(snapshotRef, snapshot)
    return snapshot
  })

  return {
    inject: (name, value) => sandbox.setVariable(name, value),
    injectAll: (variables) =>
      Effect.forEach(
        Object.entries(variables),
        ([name, value]) => sandbox.setVariable(name, value),
        { discard: true }
      ),
    read: (name) => sandbox.getVariable(name),
    cached: Ref.get(snapshotRef),
    sync
  }
}

export const makeCallVariableSpace = (
  ctx: Pick<CallContext, "sandbox" | "variableSnapshot" | "iteration">,
  options?: VariableSpaceOptions
): VariableSpace =>
  makeVariableSpace(ctx.sandbox, ctx.variableSnapshot, ctx.iteration, options)
