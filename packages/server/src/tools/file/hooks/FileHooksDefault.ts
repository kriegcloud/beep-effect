import { Layer } from "effect"
import { FileHooks, type FileHook } from "../FileHooks.js"
import { FileAuditHook } from "./FileAuditHook.js"

export const DefaultFileHooks: ReadonlyArray<FileHook> = Object.freeze([
  FileAuditHook
])

export const FileHooksDefaultLayer: Layer.Layer<FileHooks> = FileHooks.fromHooks(
  DefaultFileHooks
)

export const withAdditionalFileHooks = (
  hooks: ReadonlyArray<FileHook>
): Layer.Layer<FileHooks> =>
  FileHooks.fromHooks([
    ...DefaultFileHooks,
    ...hooks
  ])
