import { DateTime, Deferred, Duration, Effect, Layer, Option, Ref, Schedule, Stream } from "effect"
import * as ChildProcess from "effect/unstable/process/ChildProcess"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import {
  CliExecutionFailed,
  CliIdleTimeout,
  CliSpawnFailed,
  CliTimeout,
  CliValidationError,
  type CliRuntimeError
} from "./CliErrors.js"
import { CliRuntime, type CliRuntimeService } from "./CliRuntime.js"
import {
  CLI_TRUNCATED_OUTPUT_MARKER,
  type CliRunRequest
} from "./CliTypes.js"

interface BoundedOutputState {
  readonly text: string
  readonly bytes: number
  readonly truncated: boolean
}

interface BoundedOutputResult {
  readonly text: string
  readonly truncated: boolean
}

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const emptyBoundedOutputState: BoundedOutputState = {
  text: "",
  bytes: 0,
  truncated: false
}

const toErrorMessage = (error: unknown): string =>
  typeof error === "object" && error !== null && "message" in error
    ? String((error as { readonly message?: unknown }).message)
    : String(error)

const appendBoundedText = (
  state: BoundedOutputState,
  chunk: string,
  limitBytes: number
): BoundedOutputState => {
  if (state.bytes >= limitBytes) {
    return state.truncated ? state : { ...state, truncated: true }
  }

  const encodedChunk = textEncoder.encode(chunk)
  const nextBytes = state.bytes + encodedChunk.length

  if (nextBytes <= limitBytes) {
    return {
      text: state.text + chunk,
      bytes: nextBytes,
      truncated: state.truncated
    }
  }

  const available = Math.max(limitBytes - state.bytes, 0)
  const partial = textDecoder.decode(encodedChunk.subarray(0, available))

  return {
    text: state.text + partial,
    bytes: limitBytes,
    truncated: true
  }
}

const finalizeBoundedOutput = (state: BoundedOutputState): BoundedOutputResult => ({
  text: state.truncated ? `${state.text}${CLI_TRUNCATED_OUTPUT_MARKER}` : state.text,
  truncated: state.truncated
})

const collectBoundedOutput = (
  stream: Stream.Stream<Uint8Array, unknown, never>,
  limitBytes: number,
  onChunk?: () => Effect.Effect<void, never>
): Effect.Effect<BoundedOutputResult, never> =>
  Effect.gen(function*() {
    const stateRef = yield* Ref.make(emptyBoundedOutputState)

    yield* stream.pipe(
      Stream.decodeText(),
      Stream.runForEach((chunk) =>
        Ref.update(stateRef, (state) => appendBoundedText(state, chunk, limitBytes)).pipe(
          Effect.andThen(onChunk === undefined ? Effect.void : onChunk())
        )
      ),
      Effect.catch(() => Effect.void)
    )

    const state = yield* Ref.get(stateRef)
    return finalizeBoundedOutput(state)
  })

const validateRequest = (
  request: CliRunRequest
): Effect.Effect<CliRunRequest, CliValidationError> =>
  Effect.gen(function*() {
    if (request.command.trim().length === 0) {
      return yield* new CliValidationError({
        reason: "command must be a non-empty string"
      })
    }

    if (!Number.isFinite(request.timeoutMs) || request.timeoutMs <= 0) {
      return yield* new CliValidationError({
        reason: "timeoutMs must be greater than 0"
      })
    }

    if (
      request.idleTimeoutMs !== undefined
      && (!Number.isFinite(request.idleTimeoutMs) || request.idleTimeoutMs <= 0)
    ) {
      return yield* new CliValidationError({
        reason: "idleTimeoutMs must be greater than 0 when provided"
      })
    }

    if (!Number.isFinite(request.outputLimitBytes) || request.outputLimitBytes <= 0) {
      return yield* new CliValidationError({
        reason: "outputLimitBytes must be greater than 0"
      })
    }

    if (request.mode === "Argv" && request.args !== undefined) {
      for (const arg of request.args) {
        if (typeof arg !== "string") {
          return yield* new CliValidationError({
            reason: "all argv arguments must be strings"
          })
        }
      }
    }

    return request
  })

const makeCommand = (request: CliRunRequest): ChildProcess.Command => {
  const options = {
    cwd: request.cwd,
    env: request.env,
    extendEnv: true,
    stdout: "pipe" as const,
    stderr: "pipe" as const
  }

  if (request.mode === "Argv") {
    return ChildProcess.make(request.command, request.args ?? [], options)
  }

  return ChildProcess.make(request.command, {
    ...options,
    shell: true
  })
}

const terminateHandle = (
  handle: ChildProcessSpawner.ChildProcessHandle
): Effect.Effect<void> =>
  handle.isRunning.pipe(
    Effect.catch(() => Effect.succeed(false)),
    Effect.flatMap((isRunning) =>
      isRunning
        ? handle.kill({
            killSignal: "SIGTERM",
            forceKillAfter: Duration.millis(250)
          })
        : Effect.void
    ),
    Effect.catch(() => Effect.void)
  )

const waitForIdleTimeout = (params: {
  readonly handle: ChildProcessSpawner.ChildProcessHandle
  readonly lastOutputAtRef: Ref.Ref<number>
  readonly idleTimeoutMs: number
}): Effect.Effect<never, CliIdleTimeout> =>
  Effect.gen(function*() {
    const pollIntervalMs = Math.min(Math.max(Math.floor(params.idleTimeoutMs / 4), 50), 250)
    const timeoutSignal = yield* Deferred.make<void, CliIdleTimeout>()

    const checkIdleTimeout = Effect.gen(function*() {
      const isRunning = yield* params.handle.isRunning.pipe(
        Effect.catch(() => Effect.succeed(false))
      )
      if (!isRunning) {
        return
      }

      const lastOutputAt = yield* Ref.get(params.lastOutputAtRef)
      if (Date.now() - lastOutputAt >= params.idleTimeoutMs) {
        yield* terminateHandle(params.handle).pipe(Effect.forkScoped)
        yield* Deferred.fail(timeoutSignal, new CliIdleTimeout({
          idleTimeoutMs: params.idleTimeoutMs
        }))
      }
    })

    return yield* Effect.raceFirst(
      Deferred.await(timeoutSignal).pipe(
        Effect.flatMap(() => Effect.never)
      ),
      checkIdleTimeout.pipe(
        Effect.repeat(Schedule.spaced(Duration.millis(pollIntervalMs))),
        Effect.flatMap(() => Effect.never)
      )
    )
  })

const runLocal = (
  spawner: ChildProcessSpawner.ChildProcessSpawner
): CliRuntimeService["run"] => (request) =>
  validateRequest(request).pipe(
    Effect.flatMap((validated) =>
      Effect.scoped(
        Effect.gen(function*() {
          const startedAt = yield* DateTime.now
          const command = makeCommand(validated)

          const handle = yield* Effect.acquireRelease(
            spawner.spawn(command).pipe(
              Effect.mapError((error) =>
                new CliSpawnFailed({
                  reason: toErrorMessage(error)
                })
              )
            ),
            terminateHandle
          )

          const stdoutDeferred = yield* Deferred.make<BoundedOutputResult>()
          const stderrDeferred = yield* Deferred.make<BoundedOutputResult>()
          const lastOutputAtRef = yield* Ref.make(Date.now())

          const startCollector = (
            stream: Stream.Stream<Uint8Array, unknown, never>,
            deferred: Deferred.Deferred<BoundedOutputResult>
          ) =>
            collectBoundedOutput(
              stream,
              validated.outputLimitBytes,
              () => Ref.set(lastOutputAtRef, Date.now())
            ).pipe(
              Effect.flatMap((output) => Deferred.succeed(deferred, output)),
              Effect.forkScoped,
              Effect.asVoid
            )

          yield* startCollector(handle.stdout, stdoutDeferred)
          yield* startCollector(handle.stderr, stderrDeferred)

          const exitCodeOption = yield* Effect.raceFirst(
            handle.exitCode.pipe(
              Effect.timeoutOption(Duration.millis(validated.timeoutMs)),
              Effect.mapError((error) =>
                new CliExecutionFailed({
                  reason: toErrorMessage(error)
                })
              )
            ),
            validated.idleTimeoutMs === undefined
              ? Effect.never
              : waitForIdleTimeout({
                  handle,
                  lastOutputAtRef,
                  idleTimeoutMs: validated.idleTimeoutMs
                })
          )

          if (Option.isNone(exitCodeOption)) {
            yield* terminateHandle(handle)
            return yield* new CliTimeout({
              timeoutMs: validated.timeoutMs
            })
          }

          const [stdoutResult, stderrResult] = yield* Effect.all([
            Deferred.await(stdoutDeferred),
            Deferred.await(stderrDeferred)
          ])

          const completedAt = yield* DateTime.now

          return {
            pid: Number(handle.pid),
            exitCode: Number(exitCodeOption.value),
            stdout: stdoutResult.text,
            stderr: stderrResult.text,
            truncatedStdout: stdoutResult.truncated,
            truncatedStderr: stderrResult.truncated,
            startedAt,
            completedAt
          } as const
        })
      )
    )
  )

const makeLocalService = Effect.gen(function*() {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner

  return {
    run: runLocal(spawner)
  } satisfies CliRuntimeService
})

export const layer = Layer.effect(CliRuntime, makeLocalService)

export const mapCliRuntimeErrorMessage = (error: CliRuntimeError): string => {
  switch (error._tag) {
    case "CliValidationError":
    case "CliRuntimeUnavailable":
    case "CliSpawnFailed":
    case "CliExecutionFailed":
      return error.reason
    case "CliTimeout":
      return `cli command timed out after ${error.timeoutMs}ms`
    case "CliIdleTimeout":
      return `cli command reached idle timeout after ${error.idleTimeoutMs}ms`
  }
}
