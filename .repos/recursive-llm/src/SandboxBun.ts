import { Worker as EffectWorker } from "@effect/platform"
import { BunWorker } from "@effect/platform-bun"
import { Clock, Data, Deferred, Duration, Effect, Exit, Fiber, FiberSet, Layer, Match, Option, Queue, Ref, Runtime, Scope, Stream } from "effect"
import * as nodeFs from "node:fs"
import * as nodePath from "node:path"
import { BridgeHandler } from "./BridgeHandler"
import { SandboxError } from "./RlmError"
import { SandboxConfig, SandboxFactory, type SandboxInstance, type VariableMetadata } from "./Sandbox"
import { checkFrameSize, decodeWorkerToHost, type WorkerToHost } from "./SandboxProtocol"
import {
  RunnerBridgeFailedRequest,
  RunnerBridgeResultRequest,
  RunnerExecRequest,
  RunnerGetVarRequest,
  RunnerInitRequest,
  RunnerListVarsRequest,
  RunnerSetVarRequest,
  RunnerShutdownRequest,
  SandboxWorkerRunnerRequest
} from "./SandboxWorkerRunnerProtocol"
import type { CallId } from "./RlmTypes"

// --- Local error for precise catchTag on timeout ---

class SandboxTimeoutError extends Data.TaggedClass("SandboxTimeoutError")<{
  readonly requestId: string
}> {}

// --- Types ---

type HealthState = "alive" | "shuttingDown" | "dead"

interface SandboxProcess {
  readonly send: (message: unknown) => void
  readonly kill: (signal: number | NodeJS.Signals) => unknown
  readonly exited: Promise<number>
}

interface SandboxState {
  readonly proc: SandboxProcess
  readonly health: Ref.Ref<HealthState>
  readonly pendingRequests: Ref.Ref<Map<string, Deferred.Deferred<unknown, SandboxError>>>
  readonly config: SandboxConfig["Type"]
  readonly callId: CallId
  readonly executeDeadline: Ref.Ref<number>
}

// --- Helpers ---

const trySend = (proc: SandboxProcess, message: unknown) =>
  Effect.try({
    try: () => proc.send(message),
    catch: (err) => new SandboxError({ message: `IPC send failed: ${err}` })
  })

const failAllPending = (
  pendingRequests: Ref.Ref<Map<string, Deferred.Deferred<unknown, SandboxError>>>,
  message: string
) =>
  Effect.gen(function*() {
    const pending = yield* Ref.getAndSet(pendingRequests, new Map())
    yield* Effect.forEach([...pending.values()], (d) =>
      Deferred.fail(d, new SandboxError({ message })),
      { discard: true }
    )
  })

const waitForExitWithin = (
  proc: SandboxProcess,
  timeoutMs: number
) =>
  Effect.promise(() =>
    Promise.race([
      proc.exited.then((code) => Option.some(code)),
      Bun.sleep(timeoutMs).then(() => Option.none<number>())
    ]).catch(() => Option.none<number>())
  )

const killProcess = (
  proc: SandboxProcess,
  signal: number | NodeJS.Signals
) =>
  Effect.try({
    try: () => proc.kill(signal),
    catch: () => undefined
  }).pipe(Effect.ignore)

const forceTerminateProcess = (
  proc: SandboxProcess,
  graceMs: number
) =>
  Effect.gen(function*() {
    yield* killProcess(proc, 15)
    const terminated = yield* waitForExitWithin(proc, graceMs)
    if (Option.isSome(terminated)) return

    yield* killProcess(proc, 9)
    yield* waitForExitWithin(proc, graceMs).pipe(Effect.ignore)
  })

const executeDeadlineWatchdog = (deadlineRef: Ref.Ref<number>): Effect.Effect<void> =>
  Effect.suspend(() =>
    Effect.gen(function*() {
      const deadline = yield* Ref.get(deadlineRef)
      const now = yield* Clock.currentTimeMillis
      const remaining = deadline - now
      if (remaining <= 0) return
      yield* Effect.sleep(Duration.millis(remaining))
      yield* executeDeadlineWatchdog(deadlineRef)
    })
  )

const sendExecuteRequest = (
  state: SandboxState,
  message: unknown,
  requestId: string
): Effect.Effect<string, SandboxError> =>
  Effect.gen(function*() {
    const h = yield* Ref.get(state.health)
    if (h !== "alive") return yield* new SandboxError({ message: "Sandbox is dead" })

    if (!checkFrameSize(message, state.config.maxFrameBytes)) {
      return yield* new SandboxError({ message: "Request exceeds max frame size" })
    }

    const deferred = yield* Deferred.make<string, SandboxError>()
    yield* Ref.update(state.pendingRequests, (m) =>
      new Map([...m, [requestId, deferred as Deferred.Deferred<unknown, SandboxError>]])
    )

    yield* trySend(state.proc, message)

    // Set initial deadline
    const now = yield* Clock.currentTimeMillis
    yield* Ref.set(state.executeDeadline, now + state.config.executeTimeoutMs)

    // Fork watchdog — when it completes (deadline expired), fail the deferred and kill sandbox
    const watchdog = yield* Effect.fork(
      executeDeadlineWatchdog(state.executeDeadline).pipe(
        Effect.andThen(
          Effect.uninterruptible(
            Effect.gen(function*() {
              yield* Deferred.fail(deferred, new SandboxError({ message: `Request ${requestId} timed out` }))
              yield* Ref.set(state.health, "dead")
              yield* failAllPending(state.pendingRequests, "Sandbox killed after timeout")
              yield* forceTerminateProcess(state.proc, state.config.shutdownGraceMs)
            })
          )
        )
      )
    )

    return yield* Deferred.await(deferred).pipe(
      Effect.ensuring(Fiber.interrupt(watchdog))
    )
  }).pipe(
    Effect.ensuring(
      Ref.update(state.pendingRequests, (m) => {
        const n = new Map(m)
        n.delete(requestId)
        return n
      })
    )
  )

const sendRequest = <A>(
  state: SandboxState,
  message: unknown,
  requestId: string,
  timeoutMs: number
) =>
  Effect.gen(function*() {
    const h = yield* Ref.get(state.health)
    if (h !== "alive") return yield* new SandboxError({ message: "Sandbox is dead" })

    if (!checkFrameSize(message, state.config.maxFrameBytes)) {
      return yield* new SandboxError({ message: "Request exceeds max frame size" })
    }

    const deferred = yield* Deferred.make<A, SandboxError>()
    yield* Ref.update(state.pendingRequests, (m) =>
      new Map([...m, [requestId, deferred as Deferred.Deferred<unknown, SandboxError>]])
    )

    return yield* Effect.gen(function*() {
      yield* trySend(state.proc, message)

      return yield* Deferred.await(deferred).pipe(
        Effect.timeoutFail({
          duration: Duration.millis(timeoutMs),
          onTimeout: () => new SandboxTimeoutError({ requestId })
        }),
        Effect.catchTag("SandboxTimeoutError", () =>
          Effect.gen(function*() {
            yield* Ref.set(state.health, "dead")
            yield* failAllPending(state.pendingRequests, "Sandbox killed after timeout")
            yield* forceTerminateProcess(state.proc, state.config.shutdownGraceMs)
            return yield* new SandboxError({ message: `Request ${requestId} timed out` })
          })
        )
      )
    }).pipe(
      Effect.ensuring(
        Ref.update(state.pendingRequests, (m) => {
          const n = new Map(m)
          n.delete(requestId)
          return n
        })
      )
    )
  })

// --- Frame dispatch ---

const resolveRequest = <A>(
  pendingRequests: Ref.Ref<Map<string, Deferred.Deferred<unknown, SandboxError>>>,
  requestId: string,
  tag: string,
  callerCallId: CallId,
  resolve: (deferred: Deferred.Deferred<unknown, SandboxError>) => Effect.Effect<void>
): Effect.Effect<void> =>
  Effect.gen(function*() {
    const pending = yield* Ref.get(pendingRequests)
    const deferred = pending.get(requestId)
    if (deferred) {
      yield* resolve(deferred)
    } else {
      yield* Effect.logDebug(`[sandbox:${callerCallId}] Stale ${tag} for request ${requestId.slice(0, 8)} (likely timed out)`)
    }
  })

const dispatchFrame = (
  frame: WorkerToHost,
  pendingRequests: Ref.Ref<Map<string, Deferred.Deferred<unknown, SandboxError>>>,
  proc: SandboxProcess,
  bridgeHandler: BridgeHandler["Type"],
  bridgeSemaphore: Effect.Semaphore,
  config: SandboxConfig["Type"],
  callerCallId: CallId,
  bridgeFibers: FiberSet.FiberSet<void, SandboxError>,
  executeDeadline: Ref.Ref<number>
): Effect.Effect<void, never, never> => {
  const extendDeadline = Clock.currentTimeMillis.pipe(
    Effect.flatMap((now) => Ref.set(executeDeadline, now + config.executeTimeoutMs))
  )

  return Match.value(frame).pipe(
    Match.tagsExhaustive({
      ExecResult: (f) =>
        resolveRequest(pendingRequests, f.requestId, "ExecResult", callerCallId,
          (d) => Deferred.succeed(d, f.output)),
      ExecError: (f) =>
        resolveRequest(pendingRequests, f.requestId, "ExecError", callerCallId,
          (d) => Deferred.fail(d, new SandboxError({ message: f.message }))),
      SetVarAck: (f) =>
        resolveRequest(pendingRequests, f.requestId, "SetVarAck", callerCallId,
          (d) => Deferred.succeed(d, undefined)),
      SetVarError: (f) =>
        resolveRequest(pendingRequests, f.requestId, "SetVarError", callerCallId,
          (d) => Deferred.fail(d, new SandboxError({ message: f.message }))),
      GetVarResult: (f) =>
        resolveRequest(pendingRequests, f.requestId, "GetVarResult", callerCallId,
          (d) => Deferred.succeed(d, f.value)),
      ListVarsResult: (f) =>
        resolveRequest(pendingRequests, f.requestId, "ListVarsResult", callerCallId,
          (d) => Deferred.succeed(d, f.variables)),
      BridgeCall: (f) => {
        if (config.sandboxMode === "strict") {
          return trySend(proc, {
            _tag: "BridgeFailed",
            requestId: f.requestId,
            message: "Bridge disabled in strict sandbox mode"
          }).pipe(Effect.ignore)
        }

        // Extend deadline — sandbox is alive and requesting bridge work
        return Effect.flatMap(
          extendDeadline,
          () =>
            // Fork bridge call handling into FiberSet for automatic cleanup on scope close
            FiberSet.run(bridgeFibers)(
              bridgeSemaphore.withPermits(1)(
                bridgeHandler.handle({
                  method: f.method,
                  args: f.args,
                  callerCallId
                }).pipe(
                  Effect.flatMap((result) => {
                    const response = { _tag: "BridgeResult" as const, requestId: f.requestId, result }
                    if (!checkFrameSize(response, config.maxFrameBytes)) {
                      return trySend(proc, { _tag: "BridgeFailed", requestId: f.requestId, message: "Result too large" })
                    }
                    return trySend(proc, response)
                  }),
                  Effect.catchAll((err) =>
                    trySend(proc, { _tag: "BridgeFailed", requestId: f.requestId, message: String(err) }).pipe(
                      Effect.ignore
                    )
                  ),
                  // Extend deadline after bridge handler completes — sandbox is about to resume
                  Effect.ensuring(extendDeadline)
                )
              )
            )
        ).pipe(Effect.asVoid)
      },
      WorkerLog: (f) =>
        Effect.sync(() => {
          // Route worker logs to stderr for diagnostics
          console.error(`[sandbox:${callerCallId}] [${f.level}] ${f.message}`)
        })
    })
  )
}

// --- Shutdown ---

const shutdownWorker = (
  proc: SandboxProcess,
  config: SandboxConfig["Type"],
  health: Ref.Ref<HealthState>,
  pendingRequests: Ref.Ref<Map<string, Deferred.Deferred<unknown, SandboxError>>>,
  incomingFrames: Queue.Queue<WorkerToHost>,
  sandboxWorkDir?: string
) =>
  Effect.gen(function*() {
    yield* Ref.set(health, "shuttingDown")
    yield* trySend(proc, { _tag: "Shutdown" }).pipe(Effect.ignore)

    const exitedGracefully = yield* waitForExitWithin(proc, config.shutdownGraceMs)
    if (Option.isNone(exitedGracefully)) {
      yield* forceTerminateProcess(proc, config.shutdownGraceMs)
    }

    yield* Ref.set(health, "dead")
    yield* failAllPending(pendingRequests, "Sandbox shut down")
    yield* Queue.shutdown(incomingFrames)

    // Host-side cleanup of temp dir (survives SIGKILL of worker)
    if (sandboxWorkDir !== undefined) {
      yield* Effect.sync(() => {
        try { nodeFs.rmSync(sandboxWorkDir, { recursive: true, force: true }) } catch {}
      })
    }
  })

// --- Instance creation ---

import type { ToolDescriptorForSandbox } from "./Sandbox"

const createSpawnSandboxInstance = (
  options: {
    callId: CallId
    depth: number
    tools?: ReadonlyArray<ToolDescriptorForSandbox>
    hasMediaAttachments?: boolean
  },
  bridgeHandler: BridgeHandler["Type"],
  config: SandboxConfig["Type"]
) =>
  Effect.gen(function*() {
    const bunExecutable = Bun.which("bun") ?? "bun"
    const strictSandboxCwd = Bun.env.TMPDIR ?? process.env.TMPDIR ?? "/tmp"
    const strictMode = config.sandboxMode === "strict"

    // Host creates temp dir so it can clean up even if worker is SIGKILLed
    const hostSandboxWorkDir = !strictMode
      ? nodeFs.mkdtempSync(
          nodePath.join(nodeFs.realpathSync(Bun.env.TMPDIR ?? process.env.TMPDIR ?? "/tmp"), `rlm-sandbox-${options.callId}-`)
        )
      : undefined
    const health = yield* Ref.make<HealthState>("alive")
    const pendingRequests = yield* Ref.make(new Map<string, Deferred.Deferred<unknown, SandboxError>>())
    const incomingFrames = yield* Queue.bounded<WorkerToHost>(config.incomingFrameQueueCapacity)
    const bridgeSemaphore = yield* Effect.makeSemaphore(config.maxBridgeConcurrency)
    const bridgeFibers = yield* FiberSet.make<void, SandboxError>()
    const executeDeadline = yield* Ref.make<number>(0)
    const runtime = yield* Effect.runtime<never>()
    const runFork = Runtime.runFork(runtime)

    const markDead = (message: string) =>
      Effect.gen(function*() {
        const currentHealth = yield* Ref.get(health)
        if (currentHealth === "dead") return
        yield* Ref.set(health, "dead")
        yield* failAllPending(pendingRequests, message)
        yield* Queue.shutdown(incomingFrames)
      })

    // Mutable ref for proc — callbacks need it but Bun.spawn returns proc after callbacks are registered.
    // Safe because IPC callbacks only fire after spawn completes and messages arrive (post-Init).
    let procHandle: SandboxProcess | null = null

    // Spawn subprocess (acquireRelease in caller's scope)
    const proc = yield* Effect.acquireRelease(
      Effect.sync(() => {
        const p = Bun.spawn([bunExecutable, "run", config.workerPath], {
          ipc(rawMessage) {
            try {
              if (!checkFrameSize(rawMessage, config.maxFrameBytes)) {
                console.error(`[sandbox:${options.callId}] Fatal: oversized frame from worker, killing sandbox`)
                runFork(markDead("Worker sent oversized frame"))
                procHandle?.kill(9)
                return
              }

              const frame = decodeWorkerToHost(rawMessage)
              const offered = Queue.unsafeOffer(incomingFrames, frame)
              if (!offered) {
                console.error(`[sandbox:${options.callId}] Fatal: incoming frame queue overflow, killing sandbox`)
                runFork(markDead("Worker overwhelmed frame queue"))
                procHandle?.kill(9)
              }
            } catch (err) {
              console.error(`[sandbox:${options.callId}] Fatal: malformed frame from worker, killing sandbox`, err)
              runFork(markDead("Worker sent malformed frame"))
              procHandle?.kill(9)
            }
          },
          onDisconnect() {
            runFork(
              Effect.gen(function*() {
                const h = yield* Ref.get(health)
                if (h === "alive") {
                  yield* markDead("Worker IPC disconnected")
                }
              })
            )
          },
          serialization: "json",
          ...(strictMode ? { cwd: strictSandboxCwd, env: {} } : {}),
          stdin: "ignore",
          stdout: "ignore",
          stderr: strictMode ? "ignore" : "inherit"
        })
        procHandle = p
        return p
      }),
      (p) => shutdownWorker(p, config, health, pendingRequests, incomingFrames, hostSandboxWorkDir)
    )

    // Exit watcher — detect unexpected exits
    yield* Effect.forkScoped(
      Effect.gen(function*() {
        yield* Effect.tryPromise(() => proc.exited)
        const currentHealth = yield* Ref.get(health)
        if (currentHealth === "alive") {
          yield* Ref.set(health, "dead")
          yield* failAllPending(pendingRequests, "Worker exited unexpectedly")
          yield* Queue.shutdown(incomingFrames)
        }
      }).pipe(Effect.catchAll(() => Effect.void))
    )

    // Frame dispatcher fiber
    yield* Effect.forkScoped(
      Stream.fromQueue(incomingFrames).pipe(
        Stream.runForEach((frame) =>
          dispatchFrame(frame, pendingRequests, proc, bridgeHandler, bridgeSemaphore, config, options.callId, bridgeFibers, executeDeadline)
        )
      )
    )

    // Send Init
    yield* trySend(proc, {
      _tag: "Init",
      callId: options.callId,
      depth: options.depth,
      sandboxMode: config.sandboxMode,
      hasMediaAttachments: options.hasMediaAttachments === true,
      maxFrameBytes: config.maxFrameBytes,
      ...(options.tools !== undefined && options.tools.length > 0
        ? { tools: options.tools }
        : {}),
      ...(hostSandboxWorkDir !== undefined ? { sandboxWorkDir: hostSandboxWorkDir } : {})
    })

    const state: SandboxState = { proc, health, pendingRequests, config, callId: options.callId, executeDeadline }

    return {
      ...(hostSandboxWorkDir !== undefined ? { workDir: hostSandboxWorkDir } : {}),
      execute: (code: string) => {
        const requestId = crypto.randomUUID()
        return sendExecuteRequest(
          state,
          { _tag: "ExecRequest", requestId, code },
          requestId
        )
      },
      setVariable: (name: string, value: unknown) => {
        const requestId = crypto.randomUUID()
        return sendRequest<void>(
          state,
          { _tag: "SetVar", requestId, name, value },
          requestId,
          config.setVarTimeoutMs
        )
      },
      getVariable: (name: string) => {
        const requestId = crypto.randomUUID()
        return sendRequest<unknown>(
          state,
          { _tag: "GetVarRequest", requestId, name },
          requestId,
          config.getVarTimeoutMs
        )
      },
      listVariables: () => {
        const requestId = crypto.randomUUID()
        return sendRequest<ReadonlyArray<VariableMetadata>>(
          state,
          { _tag: "ListVarsRequest", requestId },
          requestId,
          config.listVarTimeoutMs
        )
      }
    } satisfies SandboxInstance
  })

const createWorkerSandboxInstance = (
  options: {
    callId: CallId
    depth: number
    tools?: ReadonlyArray<ToolDescriptorForSandbox>
    hasMediaAttachments?: boolean
  },
  bridgeHandler: BridgeHandler["Type"],
  config: SandboxConfig["Type"]
) =>
  Effect.gen(function*() {
    const strictMode = config.sandboxMode === "strict"

    // Host creates temp dir so it can clean up even if worker is SIGKILLed
    const hostSandboxWorkDir = !strictMode
      ? nodeFs.mkdtempSync(
          nodePath.join(nodeFs.realpathSync(Bun.env.TMPDIR ?? process.env.TMPDIR ?? "/tmp"), `rlm-sandbox-${options.callId}-`)
        )
      : undefined

    const health = yield* Ref.make<HealthState>("alive")
    const pendingRequests = yield* Ref.make(new Map<string, Deferred.Deferred<unknown, SandboxError>>())
    const incomingFrames = yield* Queue.bounded<WorkerToHost>(config.incomingFrameQueueCapacity)
    const bridgeSemaphore = yield* Effect.makeSemaphore(config.maxBridgeConcurrency)
    const bridgeFibers = yield* FiberSet.make<void, SandboxError>()
    const executeDeadline = yield* Ref.make<number>(0)
    const runtime = yield* Effect.runtime<never>()
    const runFork = Runtime.runFork(runtime)

    const markDead = (message: string) =>
      Effect.gen(function*() {
        const currentHealth = yield* Ref.get(health)
        if (currentHealth === "dead") return
        yield* Ref.set(health, "dead")
        yield* failAllPending(pendingRequests, message)
        yield* Queue.shutdown(incomingFrames)
      })

    const proc = yield* Effect.acquireRelease(
      Effect.gen(function*() {
        const workerScope = yield* Scope.make()
        const initReady = yield* Deferred.make<void, SandboxError>()

        let settled = false
        let settleExited = (_code: number) => {}
        const exited = new Promise<number>((resolve) => {
          settleExited = (code: number) => {
            if (settled) return
            settled = true
            resolve(code)
          }
        })

        const failInit = (message: string) =>
          Deferred.fail(initReady, new SandboxError({ message })).pipe(Effect.ignore)

        const closeWorkerScope = (exitCode: number) =>
          Scope.close(workerScope, Exit.void).pipe(
            Effect.catchAllCause(() => Effect.void),
            Effect.andThen(failInit("Worker closed before initialization completed")),
            Effect.andThen(Effect.sync(() => settleExited(exitCode)))
          )

        const emitFrame = (frame: WorkerToHost) =>
          Effect.try({
            try: () => {
              if (!checkFrameSize(frame, config.maxFrameBytes)) {
                throw new Error("Worker sent oversized frame")
              }
              const offered = Queue.unsafeOffer(incomingFrames, frame)
              if (!offered) {
                throw new Error("Worker overwhelmed frame queue")
              }
            },
            catch: (err) => new SandboxError({ message: String(err) })
          })

        const waitForInit = Deferred.await(initReady).pipe(
          Effect.mapError(() => new SandboxError({ message: "Worker initialization failed" }))
        )

        const worker = yield* EffectWorker.makeSerialized<SandboxWorkerRunnerRequest>({}).pipe(
          Effect.provide(
            BunWorker.layer((workerId) => {
              const workerInstance = new Worker(config.workerPath, {
                type: "module",
                smol: true,
                name: `recursive-llm-${options.callId}-${workerId}`
              })
              workerInstance.addEventListener("close", (event: Event) => {
                const maybeCode = (event as Event & { code?: unknown }).code
                settleExited(typeof maybeCode === "number" ? maybeCode : 0)
              })
              workerInstance.addEventListener("error", () => {
                settleExited(1)
              })
              return workerInstance
            })
          ),
          Effect.mapError((err) => new SandboxError({ message: `Worker spawn failed: ${String(err)}` })),
          Scope.extend(workerScope)
        )

        const runRequest = (effect: Effect.Effect<void, never, never>) => {
          runFork(effect)
        }

        const procLike: SandboxProcess = {
          send: (message: unknown) => {
            runRequest(
              Effect.gen(function*() {
                if (typeof message !== "object" || message === null || !("_tag" in message)) {
                  yield* failInit("Malformed host frame for worker transport")
                  yield* markDead("Malformed host frame for worker transport")
                  yield* closeWorkerScope(1)
                  return
                }

                const msg = message as Record<string, unknown>

                switch (msg._tag) {
                  case "Init": {
                    const tools =
                      Array.isArray(msg.tools)
                        ? (msg.tools as ReadonlyArray<{
                            readonly name: string
                            readonly parameterNames: ReadonlyArray<string>
                            readonly description: string
                          }>)
                        : undefined

                    yield* worker.executeEffect(
                      new RunnerInitRequest({
                        callId: String(msg.callId ?? "unknown"),
                        depth: Number(msg.depth ?? 0),
                        sandboxMode:
                          msg.sandboxMode === "strict"
                            ? "strict"
                            : msg.sandboxMode === "permissive"
                            ? "permissive"
                            : undefined,
                        hasMediaAttachments: msg.hasMediaAttachments === true,
                        maxFrameBytes:
                          typeof msg.maxFrameBytes === "number" ? msg.maxFrameBytes : undefined,
                        ...(tools !== undefined ? { tools } : {}),
                        ...(typeof msg.sandboxWorkDir === "string" ? { sandboxWorkDir: msg.sandboxWorkDir } : {})
                      })
                    ).pipe(
                      Effect.mapError((err) => new SandboxError({ message: `Worker init failed: ${String(err)}` }))
                    )

                    yield* Deferred.succeed(initReady, undefined).pipe(Effect.ignore)
                    return
                  }

                  case "ExecRequest": {
                    const requestId = String(msg.requestId)
                    const code = String(msg.code)

                    yield* waitForInit
                    yield* worker.execute(new RunnerExecRequest({ requestId, code })).pipe(
                      Stream.runForEach((frame) => emitFrame(frame as WorkerToHost)),
                      Effect.catchAll((err) =>
                        emitFrame({
                          _tag: "ExecError",
                          requestId,
                          message: String(err)
                        })
                      )
                    )
                    return
                  }

                  case "SetVar": {
                    const requestId = String(msg.requestId)
                    yield* waitForInit
                    yield* worker.executeEffect(
                      new RunnerSetVarRequest({
                        requestId,
                        name: String(msg.name),
                        value: msg.value
                      })
                    ).pipe(
                      Effect.flatMap((frame) => emitFrame(frame as WorkerToHost)),
                      Effect.catchAll((err) =>
                        emitFrame({
                          _tag: "SetVarError",
                          requestId,
                          message: String(err)
                        })
                      )
                    )
                    return
                  }

                  case "GetVarRequest": {
                    yield* waitForInit
                    const frame = yield* worker.executeEffect(
                      new RunnerGetVarRequest({
                        requestId: String(msg.requestId),
                        name: String(msg.name)
                      })
                    )
                    yield* emitFrame(frame as WorkerToHost)
                    return
                  }

                  case "ListVarsRequest": {
                    yield* waitForInit
                    const frame = yield* worker.executeEffect(
                      new RunnerListVarsRequest({
                        requestId: String(msg.requestId)
                      })
                    )
                    yield* emitFrame(frame as WorkerToHost)
                    return
                  }

                  case "BridgeResult": {
                    yield* waitForInit
                    yield* worker.executeEffect(
                      new RunnerBridgeResultRequest({
                        requestId: String(msg.requestId),
                        result: msg.result
                      })
                    )
                    return
                  }

                  case "BridgeFailed": {
                    yield* waitForInit
                    yield* worker.executeEffect(
                      new RunnerBridgeFailedRequest({
                        requestId: String(msg.requestId),
                        message: String(msg.message)
                      })
                    )
                    return
                  }

                  case "Shutdown": {
                    yield* worker.executeEffect(new RunnerShutdownRequest({})).pipe(Effect.ignore)
                    yield* closeWorkerScope(0)
                    return
                  }

                  default: {
                    yield* failInit(`Unknown worker request tag: ${String(msg._tag)}`)
                    yield* markDead(`Unknown worker request tag: ${String(msg._tag)}`)
                    yield* closeWorkerScope(1)
                    return
                  }
                }
              }).pipe(
                Effect.catchAll((err) =>
                  Effect.gen(function*() {
                    const message = `Worker transport failure: ${String(err)}`
                    yield* failInit(message)
                    yield* markDead(message)
                    yield* closeWorkerScope(1)
                  })
                ),
                Effect.catchAllCause((cause) =>
                  Effect.gen(function*() {
                    const message = `Worker transport defect: ${cause}`
                    yield* failInit(message)
                    yield* markDead(message)
                    yield* closeWorkerScope(1)
                  })
                ),
                Effect.ignore
              )
            )
          },
          kill: (_signal: number | NodeJS.Signals) => {
            runRequest(closeWorkerScope(1).pipe(Effect.ignore))
            return true
          },
          exited
        }

        return procLike
      }),
      (p) => shutdownWorker(p, config, health, pendingRequests, incomingFrames, hostSandboxWorkDir)
    )

    yield* Effect.forkScoped(
      Effect.gen(function*() {
        yield* Effect.tryPromise(() => proc.exited)
        const currentHealth = yield* Ref.get(health)
        if (currentHealth === "alive") {
          yield* Ref.set(health, "dead")
          yield* failAllPending(pendingRequests, "Worker exited unexpectedly")
          yield* Queue.shutdown(incomingFrames)
        }
      }).pipe(Effect.catchAll(() => Effect.void))
    )

    yield* Effect.forkScoped(
      Stream.fromQueue(incomingFrames).pipe(
        Stream.runForEach((frame) =>
          dispatchFrame(frame, pendingRequests, proc, bridgeHandler, bridgeSemaphore, config, options.callId, bridgeFibers, executeDeadline)
        )
      )
    )

    yield* trySend(proc, {
      _tag: "Init",
      callId: options.callId,
      depth: options.depth,
      sandboxMode: config.sandboxMode,
      hasMediaAttachments: options.hasMediaAttachments === true,
      maxFrameBytes: config.maxFrameBytes,
      ...(options.tools !== undefined && options.tools.length > 0
        ? { tools: options.tools }
        : {}),
      ...(hostSandboxWorkDir !== undefined ? { sandboxWorkDir: hostSandboxWorkDir } : {})
    })

    const state: SandboxState = { proc, health, pendingRequests, config, callId: options.callId, executeDeadline }

    return {
      ...(hostSandboxWorkDir !== undefined ? { workDir: hostSandboxWorkDir } : {}),
      execute: (code: string) => {
        const requestId = crypto.randomUUID()
        return sendExecuteRequest(
          state,
          { _tag: "ExecRequest", requestId, code },
          requestId
        )
      },
      setVariable: (name: string, value: unknown) => {
        const requestId = crypto.randomUUID()
        return sendRequest<void>(
          state,
          { _tag: "SetVar", requestId, name, value },
          requestId,
          config.setVarTimeoutMs
        )
      },
      getVariable: (name: string) => {
        const requestId = crypto.randomUUID()
        return sendRequest<unknown>(
          state,
          { _tag: "GetVarRequest", requestId, name },
          requestId,
          config.getVarTimeoutMs
        )
      },
      listVariables: () => {
        const requestId = crypto.randomUUID()
        return sendRequest<ReadonlyArray<VariableMetadata>>(
          state,
          { _tag: "ListVarsRequest", requestId },
          requestId,
          config.listVarTimeoutMs
        )
      }
    } satisfies SandboxInstance
  })

const createSandboxInstance = (
  options: {
    callId: CallId
    depth: number
    tools?: ReadonlyArray<ToolDescriptorForSandbox>
    hasMediaAttachments?: boolean
  },
  bridgeHandler: BridgeHandler["Type"],
  config: SandboxConfig["Type"]
) => {
  const resolvedTransport =
    config.sandboxMode === "strict"
      ? "spawn"
      : config.sandboxTransport === "auto"
      ? "worker"
      : config.sandboxTransport

  if (resolvedTransport === "worker") {
    const workerPath = createWorkerSandboxInstance(options, bridgeHandler, config)
    if (config.sandboxTransport === "auto") {
      return workerPath.pipe(
        Effect.catchAll(() =>
          createSpawnSandboxInstance(options, bridgeHandler, config)
        )
      )
    }
    return workerPath
  }
  return createSpawnSandboxInstance(options, bridgeHandler, config)
}

// --- Layer ---

export const SandboxBunLive: Layer.Layer<SandboxFactory, never, BridgeHandler> =
  Layer.effect(
    SandboxFactory,
    Effect.gen(function*() {
      const bridgeHandler = yield* BridgeHandler
      const config = yield* SandboxConfig
      return SandboxFactory.of({
        create: (options) => createSandboxInstance(options, bridgeHandler, config)
      })
    })
  )
