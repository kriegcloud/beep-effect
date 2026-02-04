/**
 * Service: AgentCoordinator
 *
 * Orchestrates multiple agents in configurable pipeline patterns.
 * Supports sequential, loop, and parallel execution modes with
 * event streaming for real-time monitoring.
 *
 * ## Pipeline Modes
 * 1. **Sequential**: Agent1 → Agent2 → Agent3
 * 2. **Loop**: Extract → Validate → Correct → Validate (until conformant)
 * 3. **Parallel**: Run independent agents concurrently
 *
 * ## Event Streaming
 * All pipeline executions emit `AgentEvent` streams for:
 * - Progress monitoring
 * - SSE streaming to frontends
 * - Checkpoint/resume support
 *
 * @example
 * ```typescript
 * Effect.gen(function*() {
 *   const coordinator = yield* AgentCoordinator
 *
 *   // Register agents
 *   yield* coordinator.register(extractorAgent)
 *   yield* coordinator.register(validatorAgent)
 *
 *   // Execute sequential pipeline
 *   const result = yield* coordinator.executeSequential(
 *     task,
 *     ["extractor", "validator"]
 *   )
 *
 *   console.log(`Completed: ${result.state.completedAgents.length} agents`)
 * })
 * ```
 *
 * @since 2.0.0
 * @module Service/Agent/AgentCoordinator
 */

import { Clock, Deferred, Effect, HashMap, Option, Ref } from "effect"

import {
  type Agent,
  AgentCompleted,
  type AgentEvent,
  AgentFailed,
  AgentId,
  type AgentId as AgentIdType,
  AgentMetadata,
  AgentProgress,
  AgentStarted,
  type AgentType,
  IntermediateResult,
  PipelineCheckpoint,
  PipelineState,
  TerminationCondition
} from "../../Domain/Model/Agent.js"
import { ConfigService, ConfigServiceDefault } from "../Config.js"
import {
  AgentExecutionError,
  AgentNotFoundError,
  type AgentTask,
  type PipelineConfig,
  PipelineExecutionError,
  type RefinementConfig,
  RefinementResult,
  type RefinementStatus,
  type RegisteredAgent
} from "./types.js"

// =============================================================================
// Coordinator Types
// =============================================================================

/**
 * Options for pipeline execution
 *
 * @since 2.0.0
 * @category Types
 */
export interface ExecutionOptions {
  /**
   * Maximum time per agent in milliseconds
   */
  readonly agentTimeoutMs?: number

  /**
   * Whether to continue on agent failure
   */
  readonly continueOnError?: boolean

  /**
   * Callback for checkpoint events
   */
  readonly onCheckpoint?: (state: PipelineState) => Effect.Effect<void>

  /**
   * Callback for agent events
   */
  readonly onEvent?: (event: AgentEvent) => Effect.Effect<void>
}

/**
 * Result of pipeline execution
 *
 * @since 2.0.0
 * @category Types
 */
export interface ExecutionResult {
  readonly state: PipelineState
  readonly events: ReadonlyArray<AgentEvent>
  readonly outputs: ReadonlyMap<AgentIdType, unknown>
}

// =============================================================================
// Service Definition
// =============================================================================

/**
 * AgentCoordinator - Multi-agent pipeline orchestrator
 *
 * Coordinates the execution of multiple agents in configurable patterns.
 * Manages agent registration, pipeline execution, and event collection.
 *
 * @since 2.0.0
 * @category Services
 */
export class AgentCoordinator extends Effect.Service<AgentCoordinator>()("AgentCoordinator", {
  effect: Effect.gen(function*() {
    const config = yield* ConfigService

    // Agent registry (mutable ref)
    const registryRef = yield* Ref.make<HashMap.HashMap<AgentIdType, RegisteredAgent>>(
      HashMap.empty()
    )

    /**
     * Register an agent with the coordinator
     */
    const register = <I, O, E, R>(
      agent: Agent<I, O, E, R>,
      agentType: AgentType = agent.metadata.type
    ): Effect.Effect<void> =>
      Effect.gen(function*() {
        const registered: RegisteredAgent<I, O, E, R> = {
          agent,
          registeredAt: yield* Clock.currentTimeMillis,
          agentType,
          enabled: true
        }

        yield* Ref.update(registryRef, (registry) =>
          HashMap.set(registry, agent.metadata.id, registered as RegisteredAgent))

        yield* Effect.logInfo("AgentCoordinator: Registered agent", {
          agentId: agent.metadata.id,
          type: agentType
        })
      })

    /**
     * Unregister an agent
     */
    const unregister = (agentId: AgentIdType): Effect.Effect<void> =>
      Effect.gen(function*() {
        yield* Ref.update(registryRef, (registry) => HashMap.remove(registry, agentId))

        yield* Effect.logInfo("AgentCoordinator: Unregistered agent", { agentId })
      })

    /**
     * Get a registered agent
     */
    const getAgent = (agentId: AgentIdType): Effect.Effect<RegisteredAgent, AgentNotFoundError> =>
      Effect.gen(function*() {
        const registry = yield* Ref.get(registryRef)
        const agent = HashMap.get(registry, agentId)

        if (Option.isNone(agent)) {
          const registeredIds = Array.from(HashMap.keys(registry))
          return yield* Effect.fail(
            new AgentNotFoundError({
              agentId,
              registeredAgents: registeredIds
            })
          )
        }

        return agent.value
      })

    /**
     * List all registered agents
     */
    const listAgents = (): Effect.Effect<ReadonlyArray<AgentMetadata>> =>
      Effect.gen(function*() {
        const registry = yield* Ref.get(registryRef)
        return Array.from(HashMap.values(registry)).map((r) => r.agent.metadata)
      })

    /**
     * Create initial pipeline state
     */
    const createPipelineState = (pipelineId: string): Effect.Effect<PipelineState> =>
      Effect.gen(function*() {
        const now = yield* Clock.currentTimeMillis
        return new PipelineState({
          pipelineId,
          completedAgents: [],
          intermediateResults: [],
          startedAt: now,
          status: "pending"
        })
      })

    /**
     * Execute a single agent and collect events
     */
    const executeAgent = <I, O, E>(
      agent: Agent<I, O, E, never>,
      input: I,
      eventsRef: Ref.Ref<Array<AgentEvent>>,
      options?: ExecutionOptions
    ): Effect.Effect<{ output: O; duration: number }, AgentExecutionError> =>
      Effect.gen(function*() {
        const agentId = agent.metadata.id
        const startTime = yield* Clock.currentTimeMillis

        // Emit started event
        const startedEvent = new AgentStarted({
          agentId,
          startedAt: startTime,
          inputSummary: summarizeInput(input)
        })
        yield* Ref.update(eventsRef, (events) => [...events, startedEvent])
        if (options?.onEvent) yield* options.onEvent(startedEvent)

        // Run validation if present
        if (agent.validate) {
          const validation = yield* agent.validate(input)
          if (!validation.valid) {
            const failedAt = yield* Clock.currentTimeMillis
            const failedEvent = new AgentFailed({
              agentId,
              failedAt,
              durationMs: failedAt - startTime,
              error: `Validation failed: ${validation.errors?.join(", ")}`,
              retryable: false
            })
            yield* Ref.update(eventsRef, (events) => [...events, failedEvent])
            if (options?.onEvent) yield* options.onEvent(failedEvent)

            return yield* Effect.fail(
              new AgentExecutionError({
                agentId,
                message: `Validation failed: ${validation.errors?.join(", ")}`,
                retryable: false
              })
            )
          }
        }

        // Execute agent with optional timeout
        const executeWithTimeout = options?.agentTimeoutMs
          ? agent.execute(input).pipe(Effect.timeout(options.agentTimeoutMs))
          : agent.execute(input)

        const result = yield* executeWithTimeout.pipe(
          Effect.catchAll((error) =>
            Effect.gen(function*() {
              const isTimeout = error && typeof error === "object" && "_tag" in error &&
                error._tag === "TimeoutException"
              const failedAt = yield* Clock.currentTimeMillis
              const failedEvent = new AgentFailed({
                agentId,
                failedAt,
                durationMs: failedAt - startTime,
                error: isTimeout ? "Agent execution timed out" : String(error),
                retryable: !isTimeout
              })
              yield* Ref.update(eventsRef, (events) => [...events, failedEvent])
              if (options?.onEvent) yield* options.onEvent(failedEvent)

              return yield* Effect.fail(
                new AgentExecutionError({
                  agentId,
                  message: isTimeout ? "Agent execution timed out" : String(error),
                  cause: error,
                  retryable: !isTimeout
                })
              )
            })
          )
        )

        const completedAt = yield* Clock.currentTimeMillis
        const duration = completedAt - startTime

        // Emit completed event
        const completedEvent = new AgentCompleted({
          agentId,
          completedAt,
          durationMs: duration,
          outputSummary: summarizeOutput(result)
        })
        yield* Ref.update(eventsRef, (events) => [...events, completedEvent])
        if (options?.onEvent) yield* options.onEvent(completedEvent)

        return { output: result, duration }
      }).pipe(
        Effect.catchAll((error) =>
          Effect.gen(function*() {
            if (error._tag === "AgentExecutionError") {
              return yield* Effect.fail(error)
            }
            const failedAt = yield* Clock.currentTimeMillis
            const failedEvent = new AgentFailed({
              agentId: agent.metadata.id,
              failedAt,
              durationMs: 0,
              error: String(error),
              retryable: false
            })
            yield* Ref.update(eventsRef, (events) => [...events, failedEvent])
            if (options?.onEvent) yield* options.onEvent(failedEvent)

            return yield* Effect.fail(
              new AgentExecutionError({
                agentId: agent.metadata.id,
                message: String(error),
                cause: error,
                retryable: false
              })
            )
          })
        )
      )

    /**
     * Execute agents sequentially
     */
    const executeSequential = (
      task: AgentTask,
      agentIds: ReadonlyArray<AgentIdType>,
      options?: ExecutionOptions
    ): Effect.Effect<ExecutionResult, PipelineExecutionError> =>
      Effect.gen(function*() {
        const pipelineId = `seq-${task.taskId}-${Date.now()}`
        let state = yield* createPipelineState(pipelineId)
        state = new PipelineState({ ...state, status: "running" })
        const eventsRef = yield* Ref.make<Array<AgentEvent>>([])
        const outputsMap = new Map<AgentIdType, unknown>()

        // Get all agents upfront
        const agents: Array<RegisteredAgent> = []
        for (const id of agentIds) {
          const agent = yield* getAgent(id).pipe(
            Effect.mapError((e) =>
              new PipelineExecutionError({
                pipelineId,
                message: `Agent not found: ${e.agentId}`,
                state
              })
            )
          )
          agents.push(agent)
        }

        let currentInput: unknown = task

        for (let i = 0; i < agents.length; i++) {
          const registered = agents[i]
          const agent = registered.agent as Agent<unknown, unknown, unknown, never>
          const agentId = agent.metadata.id

          // Update state
          state = new PipelineState({
            ...state,
            currentAgentId: agentId
          })

          const result = yield* executeAgent(agent, currentInput, eventsRef, options).pipe(
            Effect.mapError((e) =>
              new PipelineExecutionError({
                pipelineId,
                message: e.message,
                failedAgentId: agentId,
                state,
                cause: e
              })
            ),
            Effect.catchAll((error) => {
              if (options?.continueOnError) {
                return Effect.succeed({ output: null, duration: 0 })
              }
              state = new PipelineState({ ...state, status: "failed", error: error.message })
              return Effect.fail(error)
            })
          )

          if (result.output !== null) {
            // Store intermediate result
            const now = yield* Clock.currentTimeMillis
            const intermediateResult = new IntermediateResult({
              agentId,
              output: result.output,
              producedAt: now,
              durationMs: result.duration
            })

            state = new PipelineState({
              ...state,
              completedAgents: [...state.completedAgents, agentId],
              intermediateResults: [...state.intermediateResults, intermediateResult],
              currentAgentId: undefined
            })

            outputsMap.set(agentId, result.output)
            currentInput = result.output
          }
        }

        // Mark complete
        const completedAt = yield* Clock.currentTimeMillis
        state = new PipelineState({
          ...state,
          status: "completed",
          completedAt
        })

        // Emit checkpoint
        const checkpointEvent = new PipelineCheckpoint({
          state,
          reason: "agent-completed",
          timestamp: completedAt
        })
        yield* Ref.update(eventsRef, (events) => [...events, checkpointEvent])
        if (options?.onCheckpoint) yield* options.onCheckpoint(state)

        const events = yield* Ref.get(eventsRef)

        return {
          state,
          events,
          outputs: outputsMap
        }
      })

    /**
     * Execute agents in a loop until condition is met
     */
    const executeLoop = (
      task: AgentTask,
      agentIds: ReadonlyArray<AgentIdType>,
      termination: TerminationCondition,
      options?: ExecutionOptions
    ): Effect.Effect<ExecutionResult, PipelineExecutionError> =>
      Effect.gen(function*() {
        const pipelineId = `loop-${task.taskId}-${Date.now()}`
        let state = yield* createPipelineState(pipelineId)
        state = new PipelineState({ ...state, status: "running", iterationCount: 0 })
        const eventsRef = yield* Ref.make<Array<AgentEvent>>([])
        const outputsMap = new Map<AgentIdType, unknown>()

        // Get all agents upfront
        const agents: Array<RegisteredAgent> = []
        for (const id of agentIds) {
          const agent = yield* getAgent(id).pipe(
            Effect.mapError((e) =>
              new PipelineExecutionError({
                pipelineId,
                message: `Agent not found: ${e.agentId}`,
                state
              })
            )
          )
          agents.push(agent)
        }

        let iteration = 0
        let currentInput: unknown = task
        let shouldContinue = true

        while (shouldContinue && iteration < termination.maxIterations) {
          iteration++

          // Emit iteration progress
          const progressEvent = new AgentProgress({
            agentId: AgentId("coordinator"),
            progress: (iteration / termination.maxIterations) * 100,
            message: `Starting iteration ${iteration}`,
            timestamp: Date.now()
          })
          yield* Ref.update(eventsRef, (events) => [...events, progressEvent])
          if (options?.onEvent) yield* options.onEvent(progressEvent)

          // Execute each agent in sequence
          for (const registered of agents) {
            const agent = registered.agent as Agent<unknown, unknown, unknown, never>
            const agentId = agent.metadata.id

            state = new PipelineState({
              ...state,
              currentAgentId: agentId,
              iterationCount: iteration
            })

            const result = yield* executeAgent(agent, currentInput, eventsRef, options).pipe(
              Effect.mapError((e) =>
                new PipelineExecutionError({
                  pipelineId,
                  message: e.message,
                  failedAgentId: agentId,
                  state,
                  cause: e
                })
              ),
              Effect.catchAll((error) => {
                if (options?.continueOnError) {
                  return Effect.succeed({ output: null, duration: 0 })
                }
                state = new PipelineState({ ...state, status: "failed", error: error.message })
                return Effect.fail(error)
              })
            )

            if (result.output !== null) {
              outputsMap.set(agentId, result.output)

              // Check termination conditions
              if (termination.stopOnConformance) {
                const maybeReport = result.output as { conforms?: boolean }
                if (maybeReport?.conforms === true) {
                  shouldContinue = false
                  break
                }
              }

              currentInput = result.output
            }
          }

          // Checkpoint after each iteration
          const now = yield* Clock.currentTimeMillis
          state = new PipelineState({
            ...state,
            iterationCount: iteration,
            currentAgentId: undefined
          })

          const checkpointEvent = new PipelineCheckpoint({
            state,
            reason: "scheduled",
            timestamp: now
          })
          yield* Ref.update(eventsRef, (events) => [...events, checkpointEvent])

          // Check timeout
          if (termination.timeoutMs) {
            const elapsed = now - state.startedAt
            if (elapsed >= termination.timeoutMs) {
              shouldContinue = false
            }
          }
        }

        // Mark complete
        const completedAt = yield* Clock.currentTimeMillis
        state = new PipelineState({
          ...state,
          status: "completed",
          completedAt,
          iterationCount: iteration
        })

        const finalCheckpoint = new PipelineCheckpoint({
          state,
          reason: "agent-completed",
          timestamp: completedAt
        })
        yield* Ref.update(eventsRef, (events) => [...events, finalCheckpoint])
        if (options?.onCheckpoint) yield* options.onCheckpoint(state)

        const events = yield* Ref.get(eventsRef)

        return {
          state,
          events,
          outputs: outputsMap
        }
      })

    /**
     * Execute agents in parallel
     */
    const executeParallel = (
      task: AgentTask,
      agentIds: ReadonlyArray<AgentIdType>,
      options?: ExecutionOptions & { concurrency?: number }
    ): Effect.Effect<ExecutionResult, PipelineExecutionError> =>
      Effect.gen(function*() {
        const pipelineId = `par-${task.taskId}-${Date.now()}`
        let state = yield* createPipelineState(pipelineId)
        state = new PipelineState({ ...state, status: "running" })
        const eventsRef = yield* Ref.make<Array<AgentEvent>>([])
        const concurrency = options?.concurrency ?? config.runtime.concurrency

        // Get all agents upfront
        const agents: Array<RegisteredAgent> = []
        for (const id of agentIds) {
          const agent = yield* getAgent(id).pipe(
            Effect.mapError((e) =>
              new PipelineExecutionError({
                pipelineId,
                message: `Agent not found: ${e.agentId}`,
                state
              })
            )
          )
          agents.push(agent)
        }

        // Execute all agents in parallel
        const results = yield* Effect.all(
          agents.map((registered) => {
            const agent = registered.agent as Agent<unknown, unknown, unknown, never>
            return executeAgent(agent, task, eventsRef, options).pipe(
              Effect.map(({ duration, output }) => ({
                agentId: agent.metadata.id,
                output,
                duration,
                success: true as const
              })),
              Effect.catchAll((error) => {
                if (options?.continueOnError) {
                  return Effect.succeed({
                    agentId: agent.metadata.id,
                    output: null as unknown,
                    duration: 0,
                    success: false as const,
                    error
                  })
                }
                return Effect.fail(
                  new PipelineExecutionError({
                    pipelineId,
                    message: error.message,
                    failedAgentId: agent.metadata.id,
                    state,
                    cause: error
                  })
                )
              })
            )
          }),
          { concurrency }
        )

        // Build outputs map
        const outputsMap = new Map<AgentIdType, unknown>()
        const completedAgentIds: Array<AgentIdType> = []
        const intermediateResults: Array<IntermediateResult> = []
        const completedAt = yield* Clock.currentTimeMillis

        for (const r of results) {
          if (r.success && r.output !== null) {
            outputsMap.set(r.agentId, r.output)
            completedAgentIds.push(r.agentId)
            intermediateResults.push(
              new IntermediateResult({
                agentId: r.agentId,
                output: r.output,
                producedAt: completedAt,
                durationMs: r.duration
              })
            )
          }
        }

        state = new PipelineState({
          ...state,
          status: "completed",
          completedAt,
          completedAgents: completedAgentIds,
          intermediateResults
        })

        const checkpointEvent = new PipelineCheckpoint({
          state,
          reason: "agent-completed",
          timestamp: completedAt
        })
        yield* Ref.update(eventsRef, (events) => [...events, checkpointEvent])
        if (options?.onCheckpoint) yield* options.onCheckpoint(state)

        const events = yield* Ref.get(eventsRef)

        return {
          state,
          events,
          outputs: outputsMap
        }
      })

    /**
     * Execute pipeline based on configuration
     */
    const execute = (
      task: AgentTask,
      pipelineConfig: PipelineConfig,
      options?: ExecutionOptions
    ): Effect.Effect<ExecutionResult, PipelineExecutionError> => {
      const agentIds = (pipelineConfig.agentSequence ?? []).map(AgentId)

      switch (pipelineConfig.mode) {
        case "sequential":
          return executeSequential(task, agentIds, options)

        case "loop":
          return executeLoop(
            task,
            agentIds,
            pipelineConfig.termination ?? TerminationCondition.default(),
            options
          )

        case "parallel":
          return executeParallel(task, agentIds, {
            ...options,
            concurrency: pipelineConfig.concurrency
          })

        case "graph":
          // Graph mode not yet implemented - fall back to sequential
          return executeSequential(task, agentIds, options)
      }
    }

    /**
     * Run pipeline until a condition is met
     */
    const runUntil = (
      task: AgentTask,
      agentIds: ReadonlyArray<AgentIdType>,
      condition: (state: PipelineState) => boolean,
      maxIterations: number,
      options?: ExecutionOptions
    ): Effect.Effect<ExecutionResult, PipelineExecutionError> =>
      Effect.gen(function*() {
        const pipelineId = `until-${task.taskId}-${Date.now()}`
        let state = yield* createPipelineState(pipelineId)
        state = new PipelineState({ ...state, status: "running", iterationCount: 0 })
        const eventsRef = yield* Ref.make<Array<AgentEvent>>([])
        const outputsMap = new Map<AgentIdType, unknown>()

        // Get all agents upfront
        const agents: Array<RegisteredAgent> = []
        for (const id of agentIds) {
          const agent = yield* getAgent(id).pipe(
            Effect.mapError((e) =>
              new PipelineExecutionError({
                pipelineId,
                message: `Agent not found: ${e.agentId}`,
                state
              })
            )
          )
          agents.push(agent)
        }

        let iteration = 0
        let currentInput: unknown = task

        while (!condition(state) && iteration < maxIterations) {
          iteration++

          for (const registered of agents) {
            const agent = registered.agent as Agent<unknown, unknown, unknown, never>
            const agentId = agent.metadata.id

            state = new PipelineState({
              ...state,
              currentAgentId: agentId,
              iterationCount: iteration
            })

            const result = yield* executeAgent(agent, currentInput, eventsRef, options).pipe(
              Effect.mapError((e) =>
                new PipelineExecutionError({
                  pipelineId,
                  message: e.message,
                  failedAgentId: agentId,
                  state,
                  cause: e
                })
              )
            )

            outputsMap.set(agentId, result.output)
            currentInput = result.output

            // Update state for condition check
            const now = yield* Clock.currentTimeMillis
            state = new PipelineState({
              ...state,
              completedAgents: [...state.completedAgents, agentId],
              intermediateResults: [
                ...state.intermediateResults,
                new IntermediateResult({
                  agentId,
                  output: result.output,
                  producedAt: now,
                  durationMs: result.duration
                })
              ],
              currentAgentId: undefined
            })

            if (condition(state)) break
          }
        }

        const completedAt = yield* Clock.currentTimeMillis
        state = new PipelineState({
          ...state,
          status: "completed",
          completedAt
        })

        const events = yield* Ref.get(eventsRef)

        return {
          state,
          events,
          outputs: outputsMap
        }
      })

    /**
     * Validation-correction refinement loop
     *
     * Iteratively validates and corrects a knowledge graph until it conforms
     * to SHACL shapes or reaches termination conditions.
     *
     * Flow: validate → correct → validate → correct → ... → conformant
     *
     * @param graph - Initial knowledge graph (as RdfStore or similar)
     * @param refinementConfig - Configuration for the refinement loop
     * @param options - Execution options (callbacks, timeouts)
     * @returns RefinementResult with final graph, status, and metrics
     */
    const refineUntilConformant = (
      graph: unknown,
      refinementConfig: RefinementConfig,
      options?: ExecutionOptions
    ): Effect.Effect<RefinementResult, PipelineExecutionError> =>
      Effect.gen(function*() {
        const pipelineId = `refine-${Date.now()}`
        const startTime = yield* Clock.currentTimeMillis
        const eventsRef = yield* Ref.make<Array<AgentEvent>>([])

        // Determine validator and corrector agent IDs
        const validatorId = AgentId(refinementConfig.validatorId ?? "validator")
        const correctorId = AgentId(refinementConfig.correctorId ?? "corrector")

        // Get agents
        const validatorRegistered = yield* getAgent(validatorId).pipe(
          Effect.mapError(() =>
            new PipelineExecutionError({
              pipelineId,
              message: `Validator agent not found: ${validatorId}`,
              state: new PipelineState({
                pipelineId,
                completedAgents: [],
                intermediateResults: [],
                startedAt: startTime,
                status: "failed"
              })
            })
          )
        )

        const correctorRegistered = yield* getAgent(correctorId).pipe(
          Effect.mapError(() =>
            new PipelineExecutionError({
              pipelineId,
              message: `Corrector agent not found: ${correctorId}`,
              state: new PipelineState({
                pipelineId,
                completedAgents: [],
                intermediateResults: [],
                startedAt: startTime,
                status: "failed"
              })
            })
          )
        )

        const validator = validatorRegistered.agent as Agent<
          unknown,
          { conforms: boolean; violations?: Array<unknown> },
          unknown,
          never
        >
        const corrector = correctorRegistered.agent as Agent<
          unknown,
          { correctedGraph: unknown; confidence: number },
          unknown,
          never
        >

        let currentGraph = graph
        let iteration = 0
        let status: RefinementStatus = "max-iterations"
        let lastValidationReport: unknown = undefined
        const violationsFixed: Array<number> = []

        // Main refinement loop
        while (iteration < refinementConfig.maxIterations) {
          iteration++

          // Emit progress event
          const progressEvent = new AgentProgress({
            agentId: AgentId("refiner"),
            progress: (iteration / refinementConfig.maxIterations) * 100,
            message: `Refinement iteration ${iteration}/${refinementConfig.maxIterations}`,
            timestamp: Date.now()
          })
          yield* Ref.update(eventsRef, (events) => [...events, progressEvent])
          if (options?.onEvent) yield* options.onEvent(progressEvent)

          // Step 1: Validate
          const validationResult = yield* executeAgent(
            validator,
            { graph: currentGraph },
            eventsRef,
            options
          ).pipe(
            Effect.mapError((e) =>
              new PipelineExecutionError({
                pipelineId,
                message: `Validation failed: ${e.message}`,
                failedAgentId: validatorId,
                state: new PipelineState({
                  pipelineId,
                  completedAgents: [],
                  intermediateResults: [],
                  startedAt: startTime,
                  status: "failed",
                  iterationCount: iteration
                }),
                cause: e
              })
            )
          )

          const validationReport = validationResult.output as { conforms: boolean; violations?: Array<unknown> }
          lastValidationReport = validationReport

          // Check if conformant
          if (refinementConfig.stopOnConformance && validationReport.conforms) {
            status = "conformant"
            break
          }

          // Step 2: Correct violations
          const correctionResult = yield* executeAgent(
            corrector,
            { graph: currentGraph, validationReport },
            eventsRef,
            options
          ).pipe(
            Effect.mapError((e) =>
              new PipelineExecutionError({
                pipelineId,
                message: `Correction failed: ${e.message}`,
                failedAgentId: correctorId,
                state: new PipelineState({
                  pipelineId,
                  completedAgents: [],
                  intermediateResults: [],
                  startedAt: startTime,
                  status: "failed",
                  iterationCount: iteration
                }),
                cause: e
              })
            )
          )

          const correctionOutput = correctionResult.output as {
            correctedGraph: unknown
            confidence: number
            correctedCount?: number
          }
          currentGraph = correctionOutput.correctedGraph
          violationsFixed.push(correctionOutput.correctedCount ?? 0)

          // Check confidence threshold
          if (refinementConfig.minConfidence !== undefined) {
            if (correctionOutput.confidence < refinementConfig.minConfidence) {
              status = "confidence-threshold"
              break
            }
          }

          // Emit checkpoint at intervals
          if (refinementConfig.checkpointInterval && iteration % refinementConfig.checkpointInterval === 0) {
            const checkpointEvent = new PipelineCheckpoint({
              state: new PipelineState({
                pipelineId,
                completedAgents: [],
                intermediateResults: [],
                startedAt: startTime,
                status: "running",
                iterationCount: iteration
              }),
              reason: "scheduled",
              timestamp: Date.now()
            })
            yield* Ref.update(eventsRef, (events) => [...events, checkpointEvent])
            if (options?.onCheckpoint) {
              yield* options.onCheckpoint(checkpointEvent.state)
            }
          }

          // Check timeout
          if (refinementConfig.timeoutMs) {
            const elapsed = Date.now() - startTime
            if (elapsed >= refinementConfig.timeoutMs) {
              status = "timeout"
              break
            }
          }
        }

        const completedAt = yield* Clock.currentTimeMillis
        const durationMs = completedAt - startTime

        // Final checkpoint
        const finalState = new PipelineState({
          pipelineId,
          completedAgents: [validatorId, correctorId],
          intermediateResults: [],
          startedAt: startTime,
          completedAt,
          status: status === "conformant" ? "completed" : "completed",
          iterationCount: iteration
        })

        const finalCheckpoint = new PipelineCheckpoint({
          state: finalState,
          reason: "agent-completed",
          timestamp: completedAt
        })
        yield* Ref.update(eventsRef, (events) => [...events, finalCheckpoint])
        if (options?.onCheckpoint) {
          yield* options.onCheckpoint(finalState)
        }

        return new RefinementResult({
          graph: currentGraph,
          iterations: iteration,
          status,
          validationReport: lastValidationReport,
          durationMs,
          violationsFixed
        })
      })

    // Return service object
    return {
      /**
       * Register an agent with the coordinator
       */
      register,

      /**
       * Unregister an agent
       */
      unregister,

      /**
       * Get a registered agent by ID
       */
      getAgent,

      /**
       * List all registered agents
       */
      listAgents,

      /**
       * Execute agents sequentially
       */
      executeSequential,

      /**
       * Execute agents in a loop until termination condition
       */
      executeLoop,

      /**
       * Execute agents in parallel
       */
      executeParallel,

      /**
       * Execute pipeline based on configuration
       */
      execute,

      /**
       * Run pipeline until condition is met
       */
      runUntil,

      /**
       * Validation-correction refinement loop
       */
      refineUntilConformant,

      /**
       * Get coordinator metadata
       */
      get metadata(): AgentMetadata {
        return new AgentMetadata({
          id: AgentId("coordinator"),
          name: "Agent Coordinator",
          description: "Orchestrates multi-agent pipelines",
          type: "extractor",
          version: "1.0.0"
        })
      }
    }
  }),
  dependencies: [ConfigServiceDefault],
  accessors: true
}) {}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Summarize input for logging
 */
const summarizeInput = (input: unknown): string => {
  if (input === null || input === undefined) return "null"
  if (typeof input === "string") return input.slice(0, 100)
  if (typeof input === "object") {
    if ("taskId" in input) return `Task: ${(input as { taskId: string }).taskId}`
    return `Object with ${Object.keys(input).length} keys`
  }
  return String(input).slice(0, 50)
}

/**
 * Summarize output for logging
 */
const summarizeOutput = (output: unknown): string => {
  if (output === null || output === undefined) return "null"
  if (typeof output === "string") return output.slice(0, 100)
  if (typeof output === "object") {
    if ("entities" in output) {
      const kg = output as { entities: Array<unknown> }
      return `KnowledgeGraph: ${kg.entities.length} entities`
    }
    if ("conforms" in output) {
      const report = output as { conforms: boolean; violations?: Array<unknown> }
      return `ValidationReport: conforms=${report.conforms}, violations=${report.violations?.length ?? 0}`
    }
    if ("correctedCount" in output) {
      const batch = output as { correctedCount: number; totalViolations: number }
      return `BatchCorrection: ${batch.correctedCount}/${batch.totalViolations} fixed`
    }
    return `Object with ${Object.keys(output).length} keys`
  }
  return String(output).slice(0, 50)
}
