/**
 * Agent session path and transfer helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Context, Effect, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";
import { SessionCaptureError } from "./Sandbox.errors.ts";
import type { BindMountSandboxHandle } from "./Sandbox.provider.ts";
import { SandboxExecOptions } from "./Sandbox.provider.ts";

const $I = $SandboxId.create("Session");

/**
 * Session path service shape.
 *
 * @category services
 * @since 0.0.0
 */
export interface SessionPathsShape {
  readonly hostProjectsDir: string;
  readonly sandboxProjectsDir: string;
}

/**
 * Session path service.
 *
 * @category services
 * @since 0.0.0
 */
export class SessionPaths extends Context.Service<SessionPaths, SessionPathsShape>()($I`SessionPaths`) {}

/**
 * Session file store.
 *
 * @category services
 * @since 0.0.0
 */
export interface SessionStore<R = never> {
  readonly read: (sessionId: string) => Effect.Effect<string, SessionCaptureError, R>;
  readonly sessionFilePath: (sessionId: string) => string;
  readonly write: (sessionId: string, content: string) => Effect.Effect<void, SessionCaptureError, R>;
}

/**
 * Encoded project path used by Claude session directories.
 *
 * @category utilities
 * @since 0.0.0
 */
export const encodeProjectPath = (cwd: string): string => cwd.replaceAll("/", "-");

/**
 * Create a configured session-path layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const sessionPathsLayer = (paths: SessionPathsShape): Layer.Layer<SessionPaths> =>
  Layer.succeed(SessionPaths, SessionPaths.of(paths));

/**
 * Default session-path layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const defaultSessionPathsLayer: Layer.Layer<SessionPaths> = sessionPathsLayer({
  hostProjectsDir: ".claude/projects",
  sandboxProjectsDir: ".claude/projects",
});

/**
 * Session transfer summary.
 *
 * @category models
 * @since 0.0.0
 */
export class SessionTransferResult extends S.Class<SessionTransferResult>($I`SessionTransferResult`)(
  {
    sessionId: S.String,
  },
  $I.annote("SessionTransferResult", {
    description: "Session transfer summary.",
  })
) {}

/**
 * Create a host-backed session store.
 *
 * @category constructors
 * @since 0.0.0
 */
export const hostSessionStore = (
  repoDir: string,
  projectsDir = ".claude/projects"
): SessionStore<FileSystem.FileSystem | Path.Path> => ({
  read: Effect.fn("Session.hostSessionStore.read")(function* (sessionId: string) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const file = path.join(repoDir, projectsDir, `${sessionId}.jsonl`);

    return yield* fs.readFileString(file).pipe(
      SessionCaptureError.mapError(`Failed to read session ${sessionId}`, {
        sessionId,
      })
    );
  }),
  sessionFilePath: (sessionId) => `${repoDir}/${projectsDir}/${sessionId}.jsonl`,
  write: Effect.fn("Session.hostSessionStore.write")(function* (sessionId: string, content: string) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const file = path.join(repoDir, projectsDir, `${sessionId}.jsonl`);
    yield* fs.makeDirectory(path.dirname(file), { recursive: true }).pipe(
      SessionCaptureError.mapError(`Failed to create session directory for ${sessionId}`, {
        sessionId,
      })
    );
    yield* fs.writeFileString(file, content).pipe(
      SessionCaptureError.mapError(`Failed to write session ${sessionId}`, {
        sessionId,
      })
    );
  }),
});

/**
 * Create a sandbox-backed session store for bind-mount handles.
 *
 * @category constructors
 * @since 0.0.0
 */
export const sandboxSessionStore = (
  repoDir: string,
  handle: BindMountSandboxHandle,
  projectsDir = ".claude/projects"
): SessionStore => ({
  read: (sessionId) =>
    handle.exec(`cat ${repoDir}/${projectsDir}/${sessionId}.jsonl`).pipe(
      Effect.map((result) => result.stdout),
      SessionCaptureError.mapError(`Failed to read sandbox session ${sessionId}`, { sessionId })
    ),
  sessionFilePath: (sessionId) => `${repoDir}/${projectsDir}/${sessionId}.jsonl`,
  write: (sessionId, content) =>
    handle
      .exec(
        `mkdir -p ${repoDir}/${projectsDir} && cat > ${repoDir}/${projectsDir}/${sessionId}.jsonl`,
        new SandboxExecOptions({
          stdin: content,
        })
      )
      .pipe(Effect.asVoid, SessionCaptureError.mapError(`Failed to write sandbox session ${sessionId}`, { sessionId })),
});

/**
 * Transfer a session between stores.
 *
 * @category combinators
 * @since 0.0.0
 */
export const transferSession = Effect.fn("Session.transferSession")(function* (
  from: SessionStore,
  to: SessionStore,
  sessionId: string
) {
  const content = yield* from.read(sessionId);
  yield* to.write(sessionId, content);

  return new SessionTransferResult({ sessionId });
});
