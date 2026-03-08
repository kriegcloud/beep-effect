import { Cause, Effect, Exit, FileSystem, Layer, Option, Path, ServiceMap } from "effect"
import { CommandBackend } from "./CommandBackend.js"
import {
  CommandHookRejected,
  CommandValidationError,
  CommandWorkspaceViolation,
  type CommandExecutionError,
  toCommandHookReason
} from "./CommandErrors.js"
import { CommandHooks } from "./CommandHooks.js"
import {
  DEFAULT_COMMAND_OUTPUT_LIMIT_BYTES,
  DEFAULT_COMMAND_TIMEOUT_MS,
  type CommandInvocationContext,
  type CommandPlan,
  type CommandPlanPatch,
  type CommandRequest,
  type CommandResult
} from "./CommandTypes.js"
import { SandboxRuntime } from "../../safety/SandboxRuntime.js"
import { stableJsonStringify } from "../../json/CanonicalJson.js"
import { toErrorMessage } from "../../runtime/ErrorMessage.js"

export interface CommandRuntimeService {
  readonly prepare: (params: {
    readonly context: CommandInvocationContext
    readonly request: CommandRequest
  }) => Effect.Effect<CommandPlan, CommandExecutionError>
  readonly execute: (params: {
    readonly context: CommandInvocationContext
    readonly request: CommandRequest
  }) => Effect.Effect<CommandResult, CommandExecutionError>
}

const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/
const BLOCKED_ENV_KEYS = new Set([
  "PATH",
  "SHELL",
  "LD_PRELOAD",
  "LD_LIBRARY_PATH",
  "DYLD_INSERT_LIBRARIES",
  "DYLD_LIBRARY_PATH",
  "NODE_OPTIONS",
  "BUN_OPTIONS"
])
const BLOCKED_ENV_KEY_PREFIXES = ["BASH_FUNC_"]

const computePlanFingerprint = (
  plan: Omit<CommandPlan, "fingerprint">
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

const isNotFoundError = (error: unknown): boolean =>
  typeof error === "object"
    && error !== null
    && "_tag" in error
    && (error as { readonly _tag: string })._tag === "SystemError"
    && "reason" in error
    && (error as { readonly reason?: unknown }).reason === "NotFound"

export class CommandRuntime extends ServiceMap.Service<CommandRuntime>()(
  "server/tools/command/CommandRuntime",
  {
    make: Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const hooks = yield* CommandHooks
      const backend = yield* CommandBackend
      const sandboxRuntime = yield* SandboxRuntime

      const workspaceRootLexical = path.resolve(process.cwd())
      const workspaceRootExit = yield* fs.realPath(workspaceRootLexical).pipe(Effect.exit)
      const workspaceRoot = Exit.isSuccess(workspaceRootExit)
        ? workspaceRootExit.value
        : workspaceRootLexical

      const isInsideWorkspace = (targetPath: string): boolean => {
        const rel = path.relative(workspaceRoot, targetPath)
        return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel))
      }

      const validateEnvRecord = (params: {
        readonly env: Readonly<Record<string, string>>
        readonly purpose: "request" | "hook"
        readonly allowExistingOverride: boolean
        readonly existingEnv?: Readonly<Record<string, string | undefined>>
      }): Effect.Effect<Readonly<Record<string, string>>, CommandValidationError> =>
        Effect.gen(function*() {
          const validated: Record<string, string> = {}

          for (const [key, value] of Object.entries(params.env)) {
            if (!ENV_KEY_PATTERN.test(key)) {
              return yield* new CommandValidationError({
                reason: `${params.purpose} env key is invalid: ${key}`
              })
            }

            if (BLOCKED_ENV_KEYS.has(key) || BLOCKED_ENV_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
              return yield* new CommandValidationError({
                reason: `${params.purpose} env key is not allowed: ${key}`
              })
            }

            if (typeof value !== "string") {
              return yield* new CommandValidationError({
                reason: `${params.purpose} env value for ${key} must be a string`
              })
            }

            if (value.includes("\u0000")) {
              return yield* new CommandValidationError({
                reason: `${params.purpose} env value for ${key} contains an invalid null byte`
              })
            }

            if (
              !params.allowExistingOverride
              && params.existingEnv !== undefined
              && Object.prototype.hasOwnProperty.call(params.existingEnv, key)
            ) {
              return yield* new CommandValidationError({
                reason: `${params.purpose} env key cannot override existing environment: ${key}`
              })
            }

            validated[key] = value
          }

          return validated
        })

      const resolveRealPathWithNotFoundFallback = (
        resolvedPath: string,
        requestedPath: string | null
      ): Effect.Effect<string, CommandWorkspaceViolation> =>
        Effect.gen(function*() {
          const realPathExit = yield* fs.realPath(resolvedPath).pipe(Effect.exit)
          if (Exit.isSuccess(realPathExit)) {
            return realPathExit.value
          }

          const realPathError = Option.getOrNull(Cause.findErrorOption(realPathExit.cause))
          if (!isNotFoundError(realPathError)) {
            return yield* new CommandWorkspaceViolation({
              reason: toErrorMessage(realPathError),
              requestedPath,
              resolvedPath
            })
          }

          let cursor = resolvedPath
          const suffix: Array<string> = []

          while (true) {
            const parent = path.dirname(cursor)
            if (parent === cursor) {
              return yield* new CommandWorkspaceViolation({
                reason: "path does not exist",
                requestedPath,
                resolvedPath
              })
            }

            suffix.unshift(path.basename(cursor))
            cursor = parent

            const parentExit = yield* fs.realPath(cursor).pipe(Effect.exit)
            if (Exit.isSuccess(parentExit)) {
              return path.join(parentExit.value, ...suffix)
            }

            const parentError = Option.getOrNull(Cause.findErrorOption(parentExit.cause))
            if (!isNotFoundError(parentError)) {
              return yield* new CommandWorkspaceViolation({
                reason: toErrorMessage(parentError),
                requestedPath,
                resolvedPath: cursor
              })
            }
          }
        })

      const resolveWorkspacePath = (inputPath?: string): Effect.Effect<string, CommandExecutionError> => {
        const resolved = inputPath === undefined
          ? workspaceRoot
          : path.resolve(workspaceRoot, path.normalize(inputPath))

        if (!isInsideWorkspace(resolved)) {
          return Effect.fail(
            new CommandWorkspaceViolation({
              reason: "path is outside workspace",
              requestedPath: inputPath ?? null,
              resolvedPath: resolved
            })
          )
        }

        return resolveRealPathWithNotFoundFallback(resolved, inputPath ?? null).pipe(
          Effect.flatMap((realResolved) =>
            isInsideWorkspace(realResolved)
              ? Effect.succeed(realResolved)
              : Effect.fail(
                  new CommandWorkspaceViolation({
                    reason: "path resolves outside workspace",
                    requestedPath: inputPath ?? null,
                    resolvedPath: realResolved
                  })
                )
          )
        )
      }

      const buildBasePlan = (
        request: CommandRequest
      ): Effect.Effect<CommandPlan, CommandExecutionError> =>
        Effect.gen(function*() {
          if (request.mode === "Shell") {
            if (request.command.trim().length === 0) {
              return yield* new CommandValidationError({
                reason: "command must be a non-empty string"
              })
            }
          } else {
            if (request.executable.trim().length === 0) {
              return yield* new CommandValidationError({
                reason: "executable must be a non-empty string"
              })
            }
            if (request.executable.includes("\u0000")) {
              return yield* new CommandValidationError({
                reason: "executable contains an invalid null byte"
              })
            }
            if (
              request.args !== undefined
              && request.args.some((arg) => arg.includes("\u0000"))
            ) {
              return yield* new CommandValidationError({
                reason: "args contain an invalid null byte"
              })
            }
          }

          const timeoutMs = request.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS
          if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
            return yield* new CommandValidationError({
              reason: "timeoutMs must be greater than 0"
            })
          }

          const outputLimitBytes = request.outputLimitBytes ?? DEFAULT_COMMAND_OUTPUT_LIMIT_BYTES
          if (!Number.isFinite(outputLimitBytes) || outputLimitBytes <= 0) {
            return yield* new CommandValidationError({
              reason: "outputLimitBytes must be greater than 0"
            })
          }

          const envOverrides = yield* validateEnvRecord({
            env: request.envOverrides ?? {},
            purpose: "request",
            allowExistingOverride: true
          })
          const cwd = yield* resolveWorkspacePath(request.cwd)

          const env: Readonly<Record<string, string | undefined>> = {
            ...(process.env as Record<string, string | undefined>),
            ...envOverrides
          }

          const draftPlan = request.mode === "Shell"
            ? {
                mode: "Shell" as const,
                command: request.command,
                cwd,
                timeoutMs,
                outputLimitBytes,
                env
              }
            : {
                mode: "Argv" as const,
                executable: request.executable,
                args: request.args ?? [],
                cwd,
                timeoutMs,
                outputLimitBytes,
                env
              }

          const fingerprint = yield* computePlanFingerprint(draftPlan)

          return {
            ...draftPlan,
            fingerprint
          }
        })

      const applyBeforeHooks = (params: {
        readonly context: CommandInvocationContext
        readonly request: CommandRequest
        readonly plan: CommandPlan
      }): Effect.Effect<CommandPlan, CommandExecutionError> =>
        Effect.gen(function*() {
          let nextPlan = params.plan

          for (const hook of hooks.hooks) {
            if (hook.beforeExecute === undefined) {
              continue
            }

            const patchOrVoid = yield* hook.beforeExecute({
              context: params.context,
              request: params.request,
              plan: nextPlan
            }).pipe(
              Effect.mapError((error) =>
                new CommandHookRejected({
                  hookId: hook.id,
                  reason: toCommandHookReason(error)
                })
              )
            )

            if (patchOrVoid === undefined) {
              continue
            }

            const patch: CommandPlanPatch = patchOrVoid

            if (
              patch.timeoutMs !== undefined
              && (!Number.isFinite(patch.timeoutMs) || patch.timeoutMs <= 0)
            ) {
              return yield* new CommandHookRejected({
                hookId: hook.id,
                reason: "hook timeoutMs must be greater than 0"
              })
            }

            if (
              patch.outputLimitBytes !== undefined
              && (!Number.isFinite(patch.outputLimitBytes) || patch.outputLimitBytes <= 0)
            ) {
              return yield* new CommandHookRejected({
                hookId: hook.id,
                reason: "hook outputLimitBytes must be greater than 0"
              })
            }

            if (
              patch.timeoutMs !== undefined
              && patch.timeoutMs > nextPlan.timeoutMs
            ) {
              return yield* new CommandHookRejected({
                hookId: hook.id,
                reason: "hooks cannot increase timeoutMs"
              })
            }

            if (
              patch.outputLimitBytes !== undefined
              && patch.outputLimitBytes > nextPlan.outputLimitBytes
            ) {
              return yield* new CommandHookRejected({
                hookId: hook.id,
                reason: "hooks cannot increase outputLimitBytes"
              })
            }

            const envAdditions = patch.envAdditions === undefined
              ? undefined
              : yield* validateEnvRecord({
                  env: patch.envAdditions,
                  purpose: "hook",
                  allowExistingOverride: false,
                  existingEnv: nextPlan.env
                }).pipe(
                  Effect.mapError((error) =>
                    new CommandHookRejected({
                      hookId: hook.id,
                      reason: toCommandHookReason(error)
                    })
                  )
                )

            const commonPlan = {
              cwd: patch.cwd ?? nextPlan.cwd,
              timeoutMs: patch.timeoutMs ?? nextPlan.timeoutMs,
              outputLimitBytes: patch.outputLimitBytes ?? nextPlan.outputLimitBytes,
              env: envAdditions === undefined
                ? nextPlan.env
                : {
                    ...nextPlan.env,
                    ...envAdditions
                  }
            } as const

            const draftPlan = nextPlan.mode === "Shell"
              ? {
                  ...commonPlan,
                  mode: "Shell" as const,
                  command: nextPlan.command
                }
              : {
                  ...commonPlan,
                  mode: "Argv" as const,
                  executable: nextPlan.executable,
                  args: nextPlan.args
                }

            const patchedCwd = yield* resolveWorkspacePath(draftPlan.cwd).pipe(
              Effect.mapError((error) =>
                new CommandHookRejected({
                  hookId: hook.id,
                  reason: toCommandHookReason(error)
                })
              )
            )

            const patchedDraft = {
              ...draftPlan,
              cwd: patchedCwd
            } as const
            const fingerprint = yield* computePlanFingerprint(patchedDraft).pipe(
              Effect.mapError((error) =>
                new CommandHookRejected({
                  hookId: hook.id,
                  reason: toCommandHookReason(error)
                })
              )
            )

            nextPlan = {
              ...patchedDraft,
              fingerprint
            }
          }

          return nextPlan
        })

      const swallowHookError = (effect: Effect.Effect<void>): Effect.Effect<void> =>
        effect.pipe(
          Effect.catchCause(() => Effect.void)
        )

      const runAfterHooks = (params: {
        readonly context: CommandInvocationContext
        readonly request: CommandRequest
        readonly plan: CommandPlan
        readonly result: CommandResult
      }): Effect.Effect<void> =>
        Effect.forEach(
          hooks.hooks,
          (hook) =>
            hook.afterExecute === undefined
              ? Effect.void
              : swallowHookError(
                  hook.afterExecute({
                    context: params.context,
                    request: params.request,
                    plan: params.plan,
                    result: params.result
                  })
                ),
          { discard: true }
        )

      const runOnErrorHooks = (params: {
        readonly context: CommandInvocationContext
        readonly request: CommandRequest
        readonly plan: CommandPlan | null
        readonly error: CommandExecutionError
      }): Effect.Effect<void> =>
        Effect.forEach(
          hooks.hooks,
          (hook) =>
            hook.onError === undefined
              ? Effect.void
              : swallowHookError(
                  hook.onError({
                    context: params.context,
                    request: params.request,
                    plan: params.plan,
                    error: params.error
                  })
                ),
          { discard: true }
        )

      const prepare: CommandRuntimeService["prepare"] = ({ context, request }) =>
        sandboxRuntime.require(context).pipe(
          Effect.andThen(buildBasePlan(request)),
          Effect.tapError((error) =>
            runOnErrorHooks({
              context,
              request,
              plan: null,
              error
            })
          ),
          Effect.flatMap((basePlan) =>
            applyBeforeHooks({
              context,
              request,
              plan: basePlan
            }).pipe(
              Effect.tapError((error) =>
                runOnErrorHooks({
                  context,
                  request,
                  plan: basePlan,
                  error
                })
              )
            )
          )
        )

      const execute: CommandRuntimeService["execute"] = ({ context, request }) =>
        prepare({
          context,
          request
        }).pipe(
          Effect.flatMap((finalPlan) =>
            backend.executePlan(finalPlan).pipe(
              Effect.tap((result) =>
                runAfterHooks({
                  context,
                  request,
                  plan: finalPlan,
                  result
                })
              ),
              Effect.tapError((error) =>
                runOnErrorHooks({
                  context,
                  request,
                  plan: finalPlan,
                  error
                })
              )
            )
          )
        )

      return {
        prepare,
        execute
      } satisfies CommandRuntimeService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
