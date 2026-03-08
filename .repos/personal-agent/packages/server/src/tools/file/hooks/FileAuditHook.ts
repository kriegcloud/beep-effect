import { Effect } from "effect"
import type { FileHook } from "../FileHooks.js"

const formatContext = (source: string, toolName?: string): string =>
  toolName === undefined
    ? source
    : `${source}:${toolName}`

export const FileAuditHook: FileHook = {
  id: "audit-file",
  afterRead: ({ context, result }) =>
    Effect.log("file.read", {
      context: formatContext(context.source, context.toolName),
      path: result.path,
      bytes: result.stamp.sizeBytes
    }),
  afterWrite: ({ context, result }) =>
    Effect.log("file.write", {
      context: formatContext(context.source, context.toolName),
      path: result.path,
      bytesWritten: result.bytesWritten ?? result.stamp.sizeBytes
    }),
  afterEdit: ({ context, result }) =>
    Effect.log("file.edit", {
      context: formatContext(context.source, context.toolName),
      path: result.path,
      bytesWritten: result.bytesWritten ?? result.stamp.sizeBytes
    }),
  onError: ({ context, operation, error }) =>
    Effect.log("file.failed", {
      context: formatContext(context.source, context.toolName),
      operation,
      errorTag: error._tag
    })
}
