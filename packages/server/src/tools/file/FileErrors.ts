import { Schema } from "effect"
import { SandboxViolation } from "@template/domain/errors"
import type { FileOperation, FileVersionStamp } from "./FileTypes.js"

export class FileValidationError extends Schema.ErrorClass<FileValidationError>("FileValidationError")({
  _tag: Schema.tag("FileValidationError"),
  reason: Schema.String
}) {}

export class FileWorkspaceViolation extends Schema.ErrorClass<FileWorkspaceViolation>("FileWorkspaceViolation")({
  _tag: Schema.tag("FileWorkspaceViolation"),
  reason: Schema.String,
  requestedPath: Schema.String,
  lexicalPath: Schema.String,
  canonicalPath: Schema.String
}) {}

export class FileNotFound extends Schema.ErrorClass<FileNotFound>("FileNotFound")({
  _tag: Schema.tag("FileNotFound"),
  path: Schema.String
}) {}

export class FileStaleRead extends Schema.ErrorClass<FileStaleRead>("FileStaleRead")({
  _tag: Schema.tag("FileStaleRead"),
  path: Schema.String,
  trackedStamp: Schema.Struct({
    modTimeMs: Schema.Number,
    sizeBytes: Schema.Number
  }),
  currentStamp: Schema.Struct({
    modTimeMs: Schema.Number,
    sizeBytes: Schema.Number
  })
}) {}

export class FileEditNotFound extends Schema.ErrorClass<FileEditNotFound>("FileEditNotFound")({
  _tag: Schema.tag("FileEditNotFound"),
  path: Schema.String
}) {}

export class FileEditAmbiguous extends Schema.ErrorClass<FileEditAmbiguous>("FileEditAmbiguous")({
  _tag: Schema.tag("FileEditAmbiguous"),
  path: Schema.String,
  matchCount: Schema.Number,
  lineNumbers: Schema.Array(Schema.Number)
}) {}

export class FileTooLarge extends Schema.ErrorClass<FileTooLarge>("FileTooLarge")({
  _tag: Schema.tag("FileTooLarge"),
  sizeBytes: Schema.Number,
  limitBytes: Schema.Number
}) {}

export class FileWriteFailed extends Schema.ErrorClass<FileWriteFailed>("FileWriteFailed")({
  _tag: Schema.tag("FileWriteFailed"),
  operation: Schema.Literals(["read", "write", "edit"]),
  reason: Schema.String
}) {}

export class FileHookError extends Schema.ErrorClass<FileHookError>("FileHookError")({
  _tag: Schema.tag("FileHookError"),
  reason: Schema.String
}) {}

export class FileHookRejected extends Schema.ErrorClass<FileHookRejected>("FileHookRejected")({
  _tag: Schema.tag("FileHookRejected"),
  hookId: Schema.String,
  reason: Schema.String
}) {}

export type FileExecutionError =
  | FileValidationError
  | FileWorkspaceViolation
  | FileNotFound
  | FileStaleRead
  | FileEditNotFound
  | FileEditAmbiguous
  | FileTooLarge
  | FileWriteFailed
  | FileHookRejected
  | SandboxViolation

const asRecord = (input: unknown): Record<string, unknown> | null =>
  typeof input === "object" && input !== null
    ? input as Record<string, unknown>
    : null

const readStringField = (
  input: unknown,
  field: string
): string | undefined => {
  const record = asRecord(input)
  if (record === null) {
    return undefined
  }
  const value = record[field]
  return typeof value === "string" ? value : undefined
}

const readNestedTag = (
  input: unknown,
  field: string
): string | undefined => {
  const record = asRecord(input)
  if (record === null) {
    return undefined
  }
  const nested = asRecord(record[field])
  if (nested === null) {
    return undefined
  }
  const nestedTag = nested._tag
  return typeof nestedTag === "string" ? nestedTag : undefined
}

const readNestedStringField = (
  input: unknown,
  firstField: string,
  secondField: string
): string | undefined => {
  const record = asRecord(input)
  if (record === null) {
    return undefined
  }

  const nested = asRecord(record[firstField])
  if (nested === null) {
    return undefined
  }

  const value = nested[secondField]
  return typeof value === "string" ? value : undefined
}

const messageIncludes = (error: unknown, fragment: string): boolean => {
  const message = readStringField(error, "message")
  if (message !== undefined && message.toLowerCase().includes(fragment.toLowerCase())) {
    return true
  }

  const reason = readStringField(error, "reason")
  if (reason !== undefined && reason.toLowerCase().includes(fragment.toLowerCase())) {
    return true
  }

  const causeMessage = readNestedStringField(error, "cause", "message")
  if (causeMessage !== undefined && causeMessage.toLowerCase().includes(fragment.toLowerCase())) {
    return true
  }

  const reasonCauseMessage = (() => {
    const reason = asRecord(error)?.reason
    const reasonRecord = asRecord(reason)
    const reasonCause = reasonRecord === null ? null : asRecord(reasonRecord.cause)
    if (reasonCause === null) {
      return undefined
    }
    const nestedMessage = reasonCause.message
    return typeof nestedMessage === "string" ? nestedMessage : undefined
  })()
  if (reasonCauseMessage !== undefined && reasonCauseMessage.toLowerCase().includes(fragment.toLowerCase())) {
    return true
  }

  return false
}

/**
 * Cross-platform matcher for file-not-found failures produced by Effect
 * platform and host runtimes (bun/node).
 */
export const isFileNotFoundError = (error: unknown): boolean => {
  const tag = readStringField(error, "_tag")
  if (tag === "PlatformError") {
    const reasonTag = readNestedTag(error, "reason")
    if (reasonTag === "NotFound") {
      return true
    }
  }

  if (tag === "SystemError") {
    const reason = readStringField(error, "reason")
    if (reason === "NotFound") {
      return true
    }
  }

  const code = readStringField(error, "code")
  const causeCode = readNestedStringField(error, "cause", "code")
  const reasonCauseCode = readNestedStringField(error, "reason", "code")
  const reasonNestedCauseCode = (() => {
    const reason = asRecord(error)?.reason
    const reasonRecord = asRecord(reason)
    const reasonCause = reasonRecord === null ? null : asRecord(reasonRecord.cause)
    if (reasonCause === null) {
      return undefined
    }
    const nestedCode = reasonCause.code
    return typeof nestedCode === "string" ? nestedCode : undefined
  })()

  if (code === "ENOENT" || causeCode === "ENOENT" || reasonCauseCode === "ENOENT" || reasonNestedCauseCode === "ENOENT") {
    return true
  }

  return messageIncludes(error, "notfound")
    || messageIncludes(error, "enoent")
    || messageIncludes(error, "no such file")
}

/**
 * Best-effort matcher for readLink failures that mean "this path is not a
 * symlink" rather than a policy violation.
 */
export const isReadLinkUnsupportedError = (error: unknown): boolean => {
  const tag = readStringField(error, "_tag")
  if (tag === "PlatformError") {
    const reasonTag = readNestedTag(error, "reason")
    if (reasonTag === "BadResource" || reasonTag === "InvalidData") {
      return true
    }
  }

  if (tag === "SystemError") {
    const reason = readStringField(error, "reason")
    if (reason === "InvalidData" || reason === "BadResource") {
      return true
    }
  }

  const code = readStringField(error, "code")
  const causeCode = readNestedStringField(error, "cause", "code")
  const reasonCauseCode = (() => {
    const reason = asRecord(error)?.reason
    const reasonRecord = asRecord(reason)
    const reasonCause = reasonRecord === null ? null : asRecord(reasonRecord.cause)
    if (reasonCause === null) {
      return undefined
    }
    const nestedCode = reasonCause.code
    return typeof nestedCode === "string" ? nestedCode : undefined
  })()

  if (
    code === "EINVAL"
    || code === "ENOTSUP"
    || code === "ENOSYS"
    || causeCode === "EINVAL"
    || causeCode === "ENOTSUP"
    || causeCode === "ENOSYS"
    || reasonCauseCode === "EINVAL"
    || reasonCauseCode === "ENOTSUP"
    || reasonCauseCode === "ENOSYS"
  ) {
    return true
  }

  return messageIncludes(error, "not a symbolic link")
    || messageIncludes(error, "invalid argument")
}

export const toFileHookReason = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "reason" in error) {
    const reason = (error as { readonly reason?: unknown }).reason
    if (typeof reason === "string" && reason.length > 0) {
      return reason
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export const isFileExecutionError = (error: unknown): error is FileExecutionError =>
  typeof error === "object"
  && error !== null
  && "_tag" in error
  && (
    (error as { readonly _tag: string })._tag === "FileValidationError"
    || (error as { readonly _tag: string })._tag === "FileWorkspaceViolation"
    || (error as { readonly _tag: string })._tag === "FileNotFound"
    || (error as { readonly _tag: string })._tag === "FileStaleRead"
    || (error as { readonly _tag: string })._tag === "FileEditNotFound"
    || (error as { readonly _tag: string })._tag === "FileEditAmbiguous"
    || (error as { readonly _tag: string })._tag === "FileTooLarge"
    || (error as { readonly _tag: string })._tag === "FileWriteFailed"
    || (error as { readonly _tag: string })._tag === "FileHookRejected"
    || (error as { readonly _tag: string })._tag === "SandboxViolation"
  )

export const mapFileErrorToToolFailureCode = (error: unknown): string => {
  if (!isFileExecutionError(error)) {
    return "FileExecutionFailed"
  }

  switch (error._tag) {
    case "FileValidationError":
      return error.reason.includes("maxBytes")
        ? "InvalidFileLimit"
        : "InvalidFileRequest"
    case "FileWorkspaceViolation":
      return "PathOutsideWorkspace"
    case "FileNotFound":
      return "FileNotFound"
    case "FileStaleRead":
      return "FileStaleRead"
    case "FileEditNotFound":
      return "FileEditNotFound"
    case "FileEditAmbiguous":
      return "FileEditAmbiguous"
    case "FileTooLarge":
      return "FileTooLarge"
    case "FileHookRejected":
      return "FileHookRejected"
    case "FileWriteFailed":
      return "FileWriteFailed"
    case "SandboxViolation":
      return "SandboxViolation"
  }
}

export const fileStampsEqual = (
  left: FileVersionStamp,
  right: FileVersionStamp
): boolean => left.modTimeMs === right.modTimeMs && left.sizeBytes === right.sizeBytes

export const fileOperationLiteral = (operation: FileOperation): FileOperation => operation
