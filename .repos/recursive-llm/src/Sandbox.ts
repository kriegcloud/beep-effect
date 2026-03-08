import { Context, Effect, Layer, Scope } from "effect"
import { SandboxError } from "./RlmError"
import type { CallId } from "./RlmTypes"
import { resolveWorkerPath } from "./WorkerPath"

export interface SandboxConfigService {
  readonly sandboxMode: "permissive" | "strict"
  readonly sandboxTransport: "auto" | "worker" | "spawn"
  readonly executeTimeoutMs: number
  readonly setVarTimeoutMs: number
  readonly getVarTimeoutMs: number
  readonly listVarTimeoutMs: number
  readonly shutdownGraceMs: number
  readonly maxFrameBytes: number
  readonly maxBridgeConcurrency: number
  readonly incomingFrameQueueCapacity: number
  readonly workerPath: string
}

export interface VariableMetadata {
  readonly name: string
  readonly type: string
  readonly size?: number
  readonly preview: string
}

export interface SandboxInstance {
  readonly workDir?: string
  readonly execute: (code: string) => Effect.Effect<string, SandboxError>
  readonly setVariable: (name: string, value: unknown) => Effect.Effect<void, SandboxError>
  readonly getVariable: (name: string) => Effect.Effect<unknown, SandboxError>
  readonly listVariables: () => Effect.Effect<ReadonlyArray<VariableMetadata>, SandboxError>
}

export interface ToolDescriptorForSandbox {
  readonly name: string
  readonly parameterNames: ReadonlyArray<string>
  readonly description: string
}

export class SandboxFactory extends Context.Tag("@recursive-llm/SandboxFactory")<
  SandboxFactory,
  {
    readonly create: (options: {
      readonly callId: CallId
      readonly depth: number
      readonly tools?: ReadonlyArray<ToolDescriptorForSandbox>
      readonly hasMediaAttachments?: boolean
    }) => Effect.Effect<SandboxInstance, SandboxError, Scope.Scope>
  }
>() {}

export class SandboxConfig extends Context.Reference<SandboxConfig>()(
  "@recursive-llm/SandboxConfig",
  {
    defaultValue: (): SandboxConfigService => ({
      sandboxMode: "permissive",
      sandboxTransport: "auto",
      executeTimeoutMs: 300_000,
      setVarTimeoutMs: 5_000,
      getVarTimeoutMs: 5_000,
      listVarTimeoutMs: 5_000,
      shutdownGraceMs: 2_000,
      maxFrameBytes: 32 * 1024 * 1024,
      maxBridgeConcurrency: 4,
      incomingFrameQueueCapacity: 2_048,
      workerPath: resolveWorkerPath()
    })
  }
) {}

export const noopSandboxFactoryLayer = Layer.succeed(
  SandboxFactory,
  SandboxFactory.of({
    create: () =>
      Effect.succeed({
        execute: () => Effect.succeed(""),
        setVariable: () => Effect.void,
        getVariable: () => Effect.void,
        listVariables: () => Effect.succeed([])
      })
  })
)
