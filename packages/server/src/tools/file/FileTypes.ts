import type { Instant } from "@template/domain/ports"
import type { CommandInvocationContext } from "../command/CommandTypes.js"

export const DEFAULT_FILE_MAX_BYTES = 256 * 1024

export type FileOperation = "read" | "write" | "edit"

export interface FileVersionStamp {
  readonly modTimeMs: number
  readonly sizeBytes: number
}

export interface FileRequest {
  readonly path: string
  readonly content: string
  readonly maxBytes?: number
}

export interface FileEditRequest {
  readonly path: string
  readonly oldString: string
  readonly newString: string
  readonly maxBytes?: number
}

export interface FileReadState {
  readonly canonicalPath: string
  readonly stamp: FileVersionStamp
  readonly readAt: Instant
}

export interface FilePlan {
  readonly operation: FileOperation
  readonly canonicalPath: string
  readonly contentBytes?: number
  readonly fingerprint: string
}

export interface FileResult {
  readonly operation: FileOperation
  readonly path: string
  readonly canonicalPath: string
  readonly stamp: FileVersionStamp
  readonly content?: string
  readonly bytesWritten?: number
  readonly diff?: string
}

export interface ResolvedFilePath {
  readonly requestedPath: string
  readonly lexicalPath: string
  readonly canonicalPath: string
  readonly workspaceRoot: string
}

export interface FileScopeContext {
  readonly context: CommandInvocationContext
}
