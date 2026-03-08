import { DateTime, Effect, FileSystem, Layer, Path, ServiceMap } from "effect"
import type { CommandInvocationContext } from "../command/CommandTypes.js"
import { SandboxRuntime } from "../../safety/SandboxRuntime.js"
import {
  FileEditAmbiguous,
  FileEditNotFound,
  FileHookRejected,
  FileNotFound,
  FileStaleRead,
  FileTooLarge,
  FileValidationError,
  FileWriteFailed,
  fileStampsEqual,
  isFileNotFoundError,
  isFileExecutionError,
  toFileHookReason,
  type FileExecutionError
} from "./FileErrors.js"
import { applyEditRange, findEditCandidates, generateUnifiedDiff } from "./FileEditMatcher.js"
import { FileHooks } from "./FileHooks.js"
import { FilePathPolicy } from "./FilePathPolicy.js"
import { FileReadTracker } from "./FileReadTracker.js"
import {
  DEFAULT_FILE_MAX_BYTES,
  type FileEditRequest,
  type FileOperation,
  type FilePlan,
  type FileRequest,
  type FileResult,
  type FileVersionStamp,
  type ResolvedFilePath
} from "./FileTypes.js"
import { stableJsonStringify } from "../../json/CanonicalJson.js"

const textEncoder = new TextEncoder()

const toErrorMessage = (error: unknown): string =>
  typeof error === "object" && error !== null && "message" in error
    ? String((error as { readonly message?: unknown }).message)
    : String(error)

const contentBytes = (content: string): number => textEncoder.encode(content).length

const computePlanFingerprint = (
  plan: Omit<FilePlan, "fingerprint">
): Effect.Effect<string> =>
  Effect.promise(() =>
    crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(stableJsonStringify(plan))
    )
  ).pipe(
    Effect.map((buffer) =>
      Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("")
    )
  )

const toMtimeMs = (mtime: unknown): number => {
  if (mtime instanceof Date) {
    return mtime.getTime()
  }

  if (typeof mtime === "object" && mtime !== null && "_tag" in mtime) {
    const tagged = mtime as { readonly _tag: string; readonly value?: unknown }
    if (tagged._tag === "Some" && tagged.value instanceof Date) {
      return tagged.value.getTime()
    }
  }

  return 0
}

const stampFromInfo = (info: {
  readonly mtime?: unknown
  readonly size: unknown
}): FileVersionStamp => ({
  modTimeMs: toMtimeMs(info.mtime),
  sizeBytes: Number(info.size)
})

export const resolveFileScopeKey = (
  context: CommandInvocationContext
): string => {
  if (context.sessionId !== undefined) {
    return `session:${String(context.sessionId)}`
  }

  const fallbackParts = [`source:${context.source}`]
  if (context.agentId !== undefined) {
    fallbackParts.push(`agent:${String(context.agentId)}`)
  }
  if (context.channelId !== undefined) {
    fallbackParts.push(`channel:${String(context.channelId)}`)
  }
  if (context.turnId !== undefined) {
    fallbackParts.push(`turn:${String(context.turnId)}`)
  }
  return fallbackParts.join("|")
}

export interface FileRuntimeService {
  readonly read: (params: {
    readonly context: CommandInvocationContext
    readonly path: string
  }) => Effect.Effect<FileResult, FileExecutionError>
  readonly write: (params: {
    readonly context: CommandInvocationContext
    readonly request: FileRequest
  }) => Effect.Effect<FileResult, FileExecutionError>
  readonly edit: (params: {
    readonly context: CommandInvocationContext
    readonly request: FileEditRequest
  }) => Effect.Effect<FileResult, FileExecutionError>
}

export class FileRuntime extends ServiceMap.Service<FileRuntime>()(
  "server/tools/file/FileRuntime",
  {
    make: Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const filePathPolicy = yield* FilePathPolicy
      const readTracker = yield* FileReadTracker
      const hooks = yield* FileHooks
      const sandboxRuntime = yield* SandboxRuntime

      const toRuntimeError = (params: {
        readonly operation: FileOperation
        readonly requestedPath: string
        readonly error: unknown
      }): FileExecutionError => {
        if (isFileExecutionError(params.error)) {
          return params.error
        }
        if (isFileNotFoundError(params.error)) {
          return new FileNotFound({
            path: params.requestedPath
          })
        }
        return new FileWriteFailed({
          operation: params.operation,
          reason: toErrorMessage(params.error)
        })
      }

      const makePlan = (params: {
        readonly operation: FileOperation
        readonly canonicalPath: string
        readonly contentBytes?: number
      }): Effect.Effect<FilePlan> =>
        Effect.gen(function*() {
          const draft = {
            operation: params.operation,
            canonicalPath: params.canonicalPath,
            ...(params.contentBytes !== undefined
              ? { contentBytes: params.contentBytes }
              : {})
          } as const
          const fingerprint = yield* computePlanFingerprint(draft)
          return {
            ...draft,
            fingerprint
          } satisfies FilePlan
        })

      const runBeforeReadHooks = (params: {
        readonly context: CommandInvocationContext
        readonly path: string
        readonly resolvedPath: ResolvedFilePath
      }): Effect.Effect<void, FileHookRejected> =>
        Effect.gen(function*() {
          for (const hook of hooks.hooks) {
            if (hook.beforeRead === undefined) {
              continue
            }
            yield* hook.beforeRead({
              context: params.context,
              path: params.path,
              resolvedPath: params.resolvedPath
            }).pipe(
              Effect.mapError((error) =>
                new FileHookRejected({
                  hookId: hook.id,
                  reason: toFileHookReason(error)
                })
              )
            )
          }
        })

      const runBeforeWriteHooks = (params: {
        readonly context: CommandInvocationContext
        readonly request: FileRequest
        readonly plan: FilePlan
        readonly resolvedPath: ResolvedFilePath
      }): Effect.Effect<void, FileHookRejected> =>
        Effect.gen(function*() {
          for (const hook of hooks.hooks) {
            if (hook.beforeWrite === undefined) {
              continue
            }
            yield* hook.beforeWrite({
              context: params.context,
              request: params.request,
              plan: params.plan,
              resolvedPath: params.resolvedPath
            }).pipe(
              Effect.mapError((error) =>
                new FileHookRejected({
                  hookId: hook.id,
                  reason: toFileHookReason(error)
                })
              )
            )
          }
        })

      const runBeforeEditHooks = (params: {
        readonly context: CommandInvocationContext
        readonly request: FileEditRequest
        readonly plan: FilePlan
        readonly resolvedPath: ResolvedFilePath
      }): Effect.Effect<void, FileHookRejected> =>
        Effect.gen(function*() {
          for (const hook of hooks.hooks) {
            if (hook.beforeEdit === undefined) {
              continue
            }
            yield* hook.beforeEdit({
              context: params.context,
              request: params.request,
              plan: params.plan,
              resolvedPath: params.resolvedPath
            }).pipe(
              Effect.mapError((error) =>
                new FileHookRejected({
                  hookId: hook.id,
                  reason: toFileHookReason(error)
                })
              )
            )
          }
        })

      const swallowHookError = (effect: Effect.Effect<void>): Effect.Effect<void> =>
        effect.pipe(
          Effect.catchCause(() => Effect.void)
        )

      const runAfterReadHooks = (params: {
        readonly context: CommandInvocationContext
        readonly path: string
        readonly resolvedPath: ResolvedFilePath
        readonly result: FileResult
      }): Effect.Effect<void> =>
        Effect.forEach(
          hooks.hooks,
          (hook) =>
            hook.afterRead === undefined
              ? Effect.void
              : swallowHookError(
                  hook.afterRead({
                    context: params.context,
                    path: params.path,
                    resolvedPath: params.resolvedPath,
                    result: params.result
                  })
                ),
          { discard: true }
        )

      const runAfterWriteHooks = (params: {
        readonly context: CommandInvocationContext
        readonly request: FileRequest
        readonly plan: FilePlan
        readonly resolvedPath: ResolvedFilePath
        readonly result: FileResult
      }): Effect.Effect<void> =>
        Effect.forEach(
          hooks.hooks,
          (hook) =>
            hook.afterWrite === undefined
              ? Effect.void
              : swallowHookError(
                  hook.afterWrite({
                    context: params.context,
                    request: params.request,
                    plan: params.plan,
                    resolvedPath: params.resolvedPath,
                    result: params.result
                  })
                ),
          { discard: true }
        )

      const runAfterEditHooks = (params: {
        readonly context: CommandInvocationContext
        readonly request: FileEditRequest
        readonly plan: FilePlan
        readonly resolvedPath: ResolvedFilePath
        readonly result: FileResult
      }): Effect.Effect<void> =>
        Effect.forEach(
          hooks.hooks,
          (hook) =>
            hook.afterEdit === undefined
              ? Effect.void
              : swallowHookError(
                  hook.afterEdit({
                    context: params.context,
                    request: params.request,
                    plan: params.plan,
                    resolvedPath: params.resolvedPath,
                    result: params.result
                  })
                ),
          { discard: true }
        )

      const runOnErrorHooks = (params: {
        readonly context: CommandInvocationContext
        readonly operation: FileOperation
        readonly plan: FilePlan | null
        readonly error: FileExecutionError
      }): Effect.Effect<void> =>
        Effect.forEach(
          hooks.hooks,
          (hook) =>
            hook.onError === undefined
              ? Effect.void
              : swallowHookError(
                  hook.onError({
                    context: params.context,
                    operation: params.operation,
                    plan: params.plan,
                    error: params.error
                  })
                ),
          { discard: true }
        )

      const statOrNotFound = (
        filePath: string
      ): Effect.Effect<FileVersionStamp, FileNotFound | FileWriteFailed> =>
        fs.stat(filePath).pipe(
          Effect.map(stampFromInfo),
          Effect.catch((error): Effect.Effect<never, FileNotFound | FileWriteFailed> =>
            isFileNotFoundError(error)
              ? Effect.fail(
                  new FileNotFound({
                    path: filePath
                  })
                )
              : Effect.fail(
                  new FileWriteFailed({
                    operation: "read",
                    reason: toErrorMessage(error)
                  })
                )
          )
        )

      const assertNotStale = (params: {
        readonly scopeKey: string
        readonly canonicalPath: string
      }): Effect.Effect<void, FileStaleRead | FileWriteFailed> =>
        Effect.gen(function*() {
          const tracked = yield* readTracker.getLastRead(
            params.scopeKey,
            params.canonicalPath
          )
          if (tracked === null) {
            return
          }

          const currentStamp = yield* fs.stat(params.canonicalPath).pipe(
            Effect.map(stampFromInfo),
            Effect.catch((error): Effect.Effect<never, FileStaleRead | FileWriteFailed> =>
              isFileNotFoundError(error)
                ? Effect.fail(
                    new FileStaleRead({
                      path: params.canonicalPath,
                      trackedStamp: tracked.stamp,
                      currentStamp: {
                        modTimeMs: -1,
                        sizeBytes: -1
                      }
                    })
                  )
                : Effect.fail(
                    new FileWriteFailed({
                      operation: "write",
                      reason: toErrorMessage(error)
                    })
                  )
            )
          )

          if (!fileStampsEqual(tracked.stamp, currentStamp)) {
            return yield* new FileStaleRead({
              path: params.canonicalPath,
              trackedStamp: tracked.stamp,
              currentStamp
            })
          }
        })

      const atomicWriteString = (params: {
        readonly canonicalPath: string
        readonly content: string
        readonly operation: "write" | "edit"
      }): Effect.Effect<void, FileWriteFailed> =>
        Effect.gen(function*() {
          const parentDirectory = path.dirname(params.canonicalPath)
          yield* fs.makeDirectory(parentDirectory, { recursive: true }).pipe(
            Effect.mapError((error) =>
              new FileWriteFailed({
                operation: params.operation,
                reason: toErrorMessage(error)
              })
            )
          )

          const tempPath = `${params.canonicalPath}.${crypto.randomUUID()}.tmp`
          yield* Effect.acquireUseRelease(
            Effect.succeed(tempPath),
            (acquiredTempPath) =>
              Effect.gen(function*() {
                yield* fs.writeFileString(acquiredTempPath, params.content).pipe(
                  Effect.mapError((error) =>
                    new FileWriteFailed({
                      operation: params.operation,
                      reason: toErrorMessage(error)
                    })
                  )
                )
                yield* fs.rename(acquiredTempPath, params.canonicalPath).pipe(
                  Effect.mapError((error) =>
                    new FileWriteFailed({
                      operation: params.operation,
                      reason: toErrorMessage(error)
                    })
                  )
                )
              }),
            (acquiredTempPath) =>
              fs.remove(acquiredTempPath, { force: true }).pipe(
                Effect.catch((): Effect.Effect<void> => Effect.void)
              )
          )
        })

      const read: FileRuntimeService["read"] = ({ context, path: filePath }) => {
        let activePlan: FilePlan | null = null
        return Effect.gen(function*() {
          yield* sandboxRuntime.require(context)
          const resolvedPath = yield* filePathPolicy.resolveForRead(filePath)
          activePlan = yield* makePlan({
            operation: "read",
            canonicalPath: resolvedPath.canonicalPath
          })

          yield* runBeforeReadHooks({
            context,
            path: filePath,
            resolvedPath
          })

          const stamp = yield* statOrNotFound(resolvedPath.canonicalPath)
          if (stamp.sizeBytes > DEFAULT_FILE_MAX_BYTES) {
            return yield* new FileTooLarge({
              sizeBytes: stamp.sizeBytes,
              limitBytes: DEFAULT_FILE_MAX_BYTES
            })
          }

          const content = yield* fs.readFileString(resolvedPath.canonicalPath).pipe(
            Effect.catch((error): Effect.Effect<never, FileNotFound | FileWriteFailed> =>
              isFileNotFoundError(error)
                ? Effect.fail(
                    new FileNotFound({
                      path: resolvedPath.requestedPath
                    })
                  )
                : Effect.fail(
                    new FileWriteFailed({
                      operation: "read",
                      reason: toErrorMessage(error)
                    })
                  )
            )
          )

          const readAt = yield* DateTime.now
          const scopeKey = resolveFileScopeKey(context)
          yield* readTracker.recordRead(scopeKey, {
            canonicalPath: resolvedPath.canonicalPath,
            stamp,
            readAt
          })

          const result: FileResult = {
            operation: "read",
            path: resolvedPath.requestedPath,
            canonicalPath: resolvedPath.canonicalPath,
            stamp,
            content
          }

          yield* runAfterReadHooks({
            context,
            path: filePath,
            resolvedPath,
            result
          })

          return result
        }).pipe(
          Effect.catch((error): Effect.Effect<never, FileExecutionError> => {
            const runtimeError = toRuntimeError({
              operation: "read",
              requestedPath: filePath,
              error
            })
            return runOnErrorHooks({
              context,
              operation: "read",
              plan: activePlan,
              error: runtimeError
            }).pipe(
              Effect.andThen(Effect.fail(runtimeError))
            )
          })
        )
      }

      const write: FileRuntimeService["write"] = ({ context, request }) => {
        let activePlan: FilePlan | null = null
        return Effect.gen(function*() {
          yield* sandboxRuntime.require(context)
          const maxBytes = request.maxBytes ?? DEFAULT_FILE_MAX_BYTES
          if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
            return yield* new FileValidationError({
              reason: "maxBytes must be greater than 0"
            })
          }

          const nextBytes = contentBytes(request.content)
          if (nextBytes > maxBytes) {
            return yield* new FileTooLarge({
              sizeBytes: nextBytes,
              limitBytes: maxBytes
            })
          }

          const resolvedPath = yield* filePathPolicy.resolveForWrite(request.path)
          const scopeKey = resolveFileScopeKey(context)
          yield* assertNotStale({
            scopeKey,
            canonicalPath: resolvedPath.canonicalPath
          })

          activePlan = yield* makePlan({
            operation: "write",
            canonicalPath: resolvedPath.canonicalPath,
            contentBytes: nextBytes
          })

          yield* runBeforeWriteHooks({
            context,
            request,
            plan: activePlan,
            resolvedPath
          })

          yield* atomicWriteString({
            canonicalPath: resolvedPath.canonicalPath,
            content: request.content,
            operation: "write"
          })

          const stamp = yield* statOrNotFound(resolvedPath.canonicalPath)
          const readAt = yield* DateTime.now
          yield* readTracker.recordRead(scopeKey, {
            canonicalPath: resolvedPath.canonicalPath,
            stamp,
            readAt
          })

          const result: FileResult = {
            operation: "write",
            path: resolvedPath.requestedPath,
            canonicalPath: resolvedPath.canonicalPath,
            stamp,
            bytesWritten: nextBytes
          }

          yield* runAfterWriteHooks({
            context,
            request,
            plan: activePlan,
            resolvedPath,
            result
          })

          return result
        }).pipe(
          Effect.catch((error): Effect.Effect<never, FileExecutionError> => {
            const runtimeError = toRuntimeError({
              operation: "write",
              requestedPath: request.path,
              error
            })
            return runOnErrorHooks({
              context,
              operation: "write",
              plan: activePlan,
              error: runtimeError
            }).pipe(
              Effect.andThen(Effect.fail(runtimeError))
            )
          })
        )
      }

      const edit: FileRuntimeService["edit"] = ({ context, request }) => {
        let activePlan: FilePlan | null = null
        return Effect.gen(function*() {
          yield* sandboxRuntime.require(context)
          if (request.oldString.length === 0) {
            return yield* new FileValidationError({
              reason: "oldString must be a non-empty string"
            })
          }

          const maxBytes = request.maxBytes ?? DEFAULT_FILE_MAX_BYTES
          if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
            return yield* new FileValidationError({
              reason: "maxBytes must be greater than 0"
            })
          }

          const resolvedPath = yield* filePathPolicy.resolveForEdit(request.path)
          const scopeKey = resolveFileScopeKey(context)
          yield* assertNotStale({
            scopeKey,
            canonicalPath: resolvedPath.canonicalPath
          })

          const currentStamp = yield* statOrNotFound(resolvedPath.canonicalPath)
          if (currentStamp.sizeBytes > maxBytes) {
            return yield* new FileTooLarge({
              sizeBytes: currentStamp.sizeBytes,
              limitBytes: maxBytes
            })
          }

          const currentContent = yield* fs.readFileString(resolvedPath.canonicalPath).pipe(
            Effect.catch((error): Effect.Effect<never, FileNotFound | FileWriteFailed> =>
              isFileNotFoundError(error)
                ? Effect.fail(
                    new FileNotFound({
                      path: resolvedPath.requestedPath
                    })
                  )
                : Effect.fail(
                    new FileWriteFailed({
                      operation: "edit",
                      reason: toErrorMessage(error)
                    })
                  )
            )
          )

          const matches = findEditCandidates(currentContent, request.oldString)
          if (matches.ranges.length === 0) {
            return yield* new FileEditNotFound({
              path: resolvedPath.requestedPath
            })
          }
          if (matches.ranges.length > 1) {
            return yield* new FileEditAmbiguous({
              path: resolvedPath.requestedPath,
              matchCount: matches.ranges.length,
              lineNumbers: matches.ranges.map((range) => range.line)
            })
          }

          const nextContent = applyEditRange(
            currentContent,
            matches.ranges[0]!,
            request.newString
          )
          if (nextContent === currentContent) {
            return yield* new FileValidationError({
              reason: "edit produced no content changes"
            })
          }

          const nextBytes = contentBytes(nextContent)
          if (nextBytes > maxBytes) {
            return yield* new FileTooLarge({
              sizeBytes: nextBytes,
              limitBytes: maxBytes
            })
          }

          activePlan = yield* makePlan({
            operation: "edit",
            canonicalPath: resolvedPath.canonicalPath,
            contentBytes: nextBytes
          })

          yield* runBeforeEditHooks({
            context,
            request,
            plan: activePlan,
            resolvedPath
          })

          yield* atomicWriteString({
            canonicalPath: resolvedPath.canonicalPath,
            content: nextContent,
            operation: "edit"
          })

          const stamp = yield* statOrNotFound(resolvedPath.canonicalPath)
          const readAt = yield* DateTime.now
          yield* readTracker.recordRead(scopeKey, {
            canonicalPath: resolvedPath.canonicalPath,
            stamp,
            readAt
          })

          const diff = generateUnifiedDiff({
            oldContent: currentContent,
            newContent: nextContent,
            path: resolvedPath.requestedPath
          })

          const result: FileResult = {
            operation: "edit",
            path: resolvedPath.requestedPath,
            canonicalPath: resolvedPath.canonicalPath,
            stamp,
            bytesWritten: nextBytes,
            diff
          }

          yield* runAfterEditHooks({
            context,
            request,
            plan: activePlan,
            resolvedPath,
            result
          })

          return result
        }).pipe(
          Effect.catch((error): Effect.Effect<never, FileExecutionError> => {
            const runtimeError = toRuntimeError({
              operation: "edit",
              requestedPath: request.path,
              error
            })
            return runOnErrorHooks({
              context,
              operation: "edit",
              plan: activePlan,
              error: runtimeError
            }).pipe(
              Effect.andThen(Effect.fail(runtimeError))
            )
          })
        )
      }

      return {
        read,
        write,
        edit
      } satisfies FileRuntimeService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
