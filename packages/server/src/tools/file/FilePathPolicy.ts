import { Cause, Effect, Exit, Layer, Option, ServiceMap } from "effect"
import { FileSystem, Path } from "effect"
import {
  isFileNotFoundError,
  isReadLinkUnsupportedError,
  FileValidationError,
  FileWorkspaceViolation
} from "./FileErrors.js"
import type { ResolvedFilePath } from "./FileTypes.js"

type PathPolicyOperation = "read" | "write" | "edit"

export interface FilePathPolicyService {
  readonly resolveForRead: (
    inputPath: string
  ) => Effect.Effect<ResolvedFilePath, FileValidationError | FileWorkspaceViolation>
  readonly resolveForWrite: (
    inputPath: string
  ) => Effect.Effect<ResolvedFilePath, FileValidationError | FileWorkspaceViolation>
  readonly resolveForEdit: (
    inputPath: string
  ) => Effect.Effect<ResolvedFilePath, FileValidationError | FileWorkspaceViolation>
}

const toErrorMessage = (error: unknown): string =>
  typeof error === "object" && error !== null && "message" in error
    ? String((error as { readonly message?: unknown }).message)
    : String(error)

export class FilePathPolicy extends ServiceMap.Service<FilePathPolicy>()(
  "server/tools/file/FilePathPolicy",
  {
    make: Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path

      const workspaceRootLexical = path.resolve(process.cwd())
      const workspaceRootExit = yield* fs.realPath(workspaceRootLexical).pipe(Effect.exit)
      const workspaceRoot = Exit.isSuccess(workspaceRootExit)
        ? workspaceRootExit.value
        : workspaceRootLexical

      const isInsideWorkspace = (targetPath: string): boolean => {
        const rel = path.relative(workspaceRoot, targetPath)
        return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel))
      }

      const isInsideWorkspaceLexical = (targetPath: string): boolean => {
        const rel = path.relative(workspaceRootLexical, targetPath)
        return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel))
      }

      const resolveRealPathWithNotFoundFallback = (
        resolvedPath: string,
        requestedPath: string
      ): Effect.Effect<string, FileWorkspaceViolation> =>
        Effect.gen(function*() {
          const realPathExit = yield* fs.realPath(resolvedPath).pipe(Effect.exit)
          if (Exit.isSuccess(realPathExit)) {
            return realPathExit.value
          }

          const realPathError = Option.getOrNull(Cause.findErrorOption(realPathExit.cause))
          if (!isFileNotFoundError(realPathError)) {
            return yield* new FileWorkspaceViolation({
              reason: toErrorMessage(realPathError),
              requestedPath,
              lexicalPath: resolvedPath,
              canonicalPath: resolvedPath
            })
          }

          let cursor = resolvedPath
          const suffix: Array<string> = []

          while (true) {
            const parent = path.dirname(cursor)
            if (parent === cursor) {
              return yield* new FileWorkspaceViolation({
                reason: "path does not exist",
                requestedPath,
                lexicalPath: resolvedPath,
                canonicalPath: resolvedPath
              })
            }

            suffix.unshift(path.basename(cursor))
            cursor = parent

            const parentExit = yield* fs.realPath(cursor).pipe(Effect.exit)
            if (Exit.isSuccess(parentExit)) {
              return path.join(parentExit.value, ...suffix)
            }

            const parentError = Option.getOrNull(Cause.findErrorOption(parentExit.cause))
            if (!isFileNotFoundError(parentError)) {
              return yield* new FileWorkspaceViolation({
                reason: toErrorMessage(parentError),
                requestedPath,
                lexicalPath: resolvedPath,
                canonicalPath: cursor
              })
            }
          }
        })

      const resolveSymlinkTarget = (
        linkPath: string,
        requestedPath: string,
        lexicalPath: string
      ): Effect.Effect<string | null, FileWorkspaceViolation> =>
        fs.readLink(linkPath).pipe(
          Effect.flatMap((target) => {
            const absoluteTarget = path.isAbsolute(target)
              ? target
              : path.resolve(path.dirname(linkPath), target)
            return resolveRealPathWithNotFoundFallback(absoluteTarget, linkPath)
          }),
          Effect.map((target) => target as string | null),
          Effect.catch((error) =>
            isFileNotFoundError(error) || isReadLinkUnsupportedError(error)
              ? Effect.succeed(null)
              : Effect.fail(
                  new FileWorkspaceViolation({
                    reason: toErrorMessage(error),
                    requestedPath,
                    lexicalPath,
                    canonicalPath: linkPath
                  })
                )
          )
        )

      const validateSymlinkHops = (
        lexicalPath: string,
        requestedPath: string
      ): Effect.Effect<void, FileWorkspaceViolation> =>
        Effect.gen(function*() {
          const relative = path.relative(workspaceRootLexical, lexicalPath)
          const segments = relative
            .split(path.sep)
            .filter((segment) => segment.length > 0)

          let cursor = workspaceRootLexical
          for (const segment of segments) {
            cursor = path.join(cursor, segment)
            const symlinkTarget = yield* resolveSymlinkTarget(
              cursor,
              requestedPath,
              lexicalPath
            )
            if (symlinkTarget === null) {
              continue
            }

            if (!isInsideWorkspace(symlinkTarget)) {
              return yield* new FileWorkspaceViolation({
                reason: "symlink hop resolves outside workspace",
                requestedPath,
                lexicalPath,
                canonicalPath: symlinkTarget
              })
            }
          }
        })

      const applyHardlinkPolicy = (params: {
        readonly operation: PathPolicyOperation
        readonly requestedPath: string
        readonly lexicalPath: string
        readonly canonicalPath: string
      }): Effect.Effect<void, FileWorkspaceViolation> =>
        fs.stat(params.canonicalPath).pipe(
          Effect.flatMap((info) => {
            if (info.type === "Directory") {
              return Effect.fail(
                new FileWorkspaceViolation({
                  reason: "path points to a directory",
                  requestedPath: params.requestedPath,
                  lexicalPath: params.lexicalPath,
                  canonicalPath: params.canonicalPath
                })
              )
            }

            const linkCount = info.nlink ?? 1
            if (linkCount > 1) {
              return Effect.fail(
                new FileWorkspaceViolation({
                  reason: `hardlink count ${linkCount} is not allowed for ${params.operation}`,
                  requestedPath: params.requestedPath,
                  lexicalPath: params.lexicalPath,
                  canonicalPath: params.canonicalPath
                })
              )
            }

            return Effect.void
          }),
          Effect.catch((error) =>
            isFileNotFoundError(error)
              ? Effect.void
              : Effect.fail(
                  new FileWorkspaceViolation({
                    reason: toErrorMessage(error),
                    requestedPath: params.requestedPath,
                    lexicalPath: params.lexicalPath,
                    canonicalPath: params.canonicalPath
                  })
                )
          )
        )

      const resolvePath = (
        operation: PathPolicyOperation,
        inputPath: string
      ): Effect.Effect<ResolvedFilePath, FileValidationError | FileWorkspaceViolation> =>
        Effect.gen(function*() {
          if (inputPath.trim().length === 0) {
            return yield* new FileValidationError({
              reason: "path must be a non-empty string"
            })
          }

          if (inputPath.includes("\u0000")) {
            return yield* new FileValidationError({
              reason: "path contains an invalid null byte"
            })
          }

          const lexicalPath = path.resolve(
            workspaceRootLexical,
            path.normalize(inputPath)
          )

          if (!isInsideWorkspaceLexical(lexicalPath)) {
            return yield* new FileWorkspaceViolation({
              reason: "path is outside workspace",
              requestedPath: inputPath,
              lexicalPath,
              canonicalPath: lexicalPath
            })
          }

          yield* validateSymlinkHops(lexicalPath, inputPath)

          const canonicalPath = yield* resolveRealPathWithNotFoundFallback(
            lexicalPath,
            inputPath
          )

          if (!isInsideWorkspace(canonicalPath)) {
            return yield* new FileWorkspaceViolation({
              reason: "path resolves outside workspace",
              requestedPath: inputPath,
              lexicalPath,
              canonicalPath
            })
          }

          yield* applyHardlinkPolicy({
            operation,
            requestedPath: inputPath,
            lexicalPath,
            canonicalPath
          })

          return {
            requestedPath: inputPath,
            lexicalPath,
            canonicalPath,
            workspaceRoot
          } satisfies ResolvedFilePath
        })

      const resolveForRead: FilePathPolicyService["resolveForRead"] = (inputPath) =>
        resolvePath("read", inputPath)
      const resolveForWrite: FilePathPolicyService["resolveForWrite"] = (inputPath) =>
        resolvePath("write", inputPath)
      const resolveForEdit: FilePathPolicyService["resolveForEdit"] = (inputPath) =>
        resolvePath("edit", inputPath)

      return {
        resolveForRead,
        resolveForWrite,
        resolveForEdit
      } satisfies FilePathPolicyService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
