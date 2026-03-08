import { Effect, Layer, ServiceMap } from "effect"
import type { CommandInvocationContext } from "../command/CommandTypes.js"
import type {
  FileEditRequest,
  FilePlan,
  FileRequest,
  FileResult,
  ResolvedFilePath
} from "./FileTypes.js"
import type { FileExecutionError, FileHookError } from "./FileErrors.js"

export interface FileHook {
  readonly id: string
  readonly beforeRead?: (args: {
    readonly context: CommandInvocationContext
    readonly path: string
    readonly resolvedPath: ResolvedFilePath
  }) => Effect.Effect<void, FileHookError>
  readonly afterRead?: (args: {
    readonly context: CommandInvocationContext
    readonly path: string
    readonly resolvedPath: ResolvedFilePath
    readonly result: FileResult
  }) => Effect.Effect<void>
  readonly beforeWrite?: (args: {
    readonly context: CommandInvocationContext
    readonly request: FileRequest
    readonly plan: FilePlan
    readonly resolvedPath: ResolvedFilePath
  }) => Effect.Effect<void, FileHookError>
  readonly afterWrite?: (args: {
    readonly context: CommandInvocationContext
    readonly request: FileRequest
    readonly plan: FilePlan
    readonly resolvedPath: ResolvedFilePath
    readonly result: FileResult
  }) => Effect.Effect<void>
  readonly beforeEdit?: (args: {
    readonly context: CommandInvocationContext
    readonly request: FileEditRequest
    readonly plan: FilePlan
    readonly resolvedPath: ResolvedFilePath
  }) => Effect.Effect<void, FileHookError>
  readonly afterEdit?: (args: {
    readonly context: CommandInvocationContext
    readonly request: FileEditRequest
    readonly plan: FilePlan
    readonly resolvedPath: ResolvedFilePath
    readonly result: FileResult
  }) => Effect.Effect<void>
  readonly onError?: (args: {
    readonly context: CommandInvocationContext
    readonly operation: "read" | "write" | "edit"
    readonly plan: FilePlan | null
    readonly error: FileExecutionError
  }) => Effect.Effect<void>
}

export interface FileHooksService {
  readonly hooks: ReadonlyArray<FileHook>
}

export class FileHooks extends ServiceMap.Service<FileHooks>()(
  "server/tools/file/FileHooks",
  {
    make: Effect.succeed({
      hooks: [] as ReadonlyArray<FileHook>
    } satisfies FileHooksService)
  }
) {
  static layer = Layer.effect(this, this.make)

  static fromHooks = (
    hooks: ReadonlyArray<FileHook>
  ): Layer.Layer<FileHooks> =>
    Layer.succeed(this, {
      hooks
    } satisfies FileHooksService)
}

export const makeFileHook = (hook: FileHook): FileHook => hook
