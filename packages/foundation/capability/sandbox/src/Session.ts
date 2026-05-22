/**
 * Agent session path and transfer helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Str } from "@beep/utils";
import { Context, Effect, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";
import { SessionCaptureError } from "./Sandbox.errors.ts";
import type { BindMountSandboxHandle } from "./Sandbox.provider.ts";
import { SandboxExecOptions } from "./Sandbox.provider.ts";

const $I = $SandboxId.create("Session");
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]+$/u;

const shellEscape = (value: string): string => `'${Str.replaceAll("'", "'\\''")(value)}'`;

/**
 * Session path service shape.
 *
 * @category models
 * @since 0.0.0
 */
export class SessionPathsShape extends S.Class<SessionPathsShape>($I`SessionPathsShape`)(
  {
    hostProjectsDir: S.String,
    sandboxProjectsDir: S.String,
  },
  $I.annote("SessionPathsShape", {
    description: "Session path service shape.",
  })
) {}

/**
 * Filename-safe agent session identifier.
 *
 * @category schemas
 * @since 0.0.0
 */
export const SessionId = S.String.check(
  S.isPattern(SESSION_ID_PATTERN, {
    message: "Session IDs may only contain letters, numbers, underscores, and dashes.",
  })
).pipe(
  $I.annoteSchema("SessionId", {
    description: "Filename-safe agent session identifier.",
  })
);

/**
 * Runtime type for {@link SessionId}.
 *
 * @category models
 * @since 0.0.0
 */
export type SessionId = typeof SessionId.Type;

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
export const encodeProjectPath = (cwd: string): string => Str.replaceAll("/", "-")(cwd);

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

const decodeSessionId = S.decodeUnknownEffect(SessionId);

const validateSessionId = Effect.fn("Session.validateSessionId")(function* (sessionId: string) {
  return yield* decodeSessionId(sessionId).pipe(
    Effect.mapError((cause) =>
      SessionCaptureError.make({
        cause,
        message: `Invalid session id: ${sessionId}`,
        sessionId,
      })
    )
  );
});

const sessionFilePath = (repoDir: string, projectsDir: string, sessionId: string): string =>
  `${repoDir}/${projectsDir}/${sessionId}.jsonl`;

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
    const safeSessionId = yield* validateSessionId(sessionId);
    const file = path.join(repoDir, projectsDir, `${safeSessionId}.jsonl`);

    return yield* fs.readFileString(file).pipe(
      SessionCaptureError.mapError(`Failed to read session ${sessionId}`, {
        sessionId,
      })
    );
  }),
  sessionFilePath: (sessionId) => sessionFilePath(repoDir, projectsDir, sessionId),
  write: Effect.fn("Session.hostSessionStore.write")(function* (sessionId: string, content: string) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const safeSessionId = yield* validateSessionId(sessionId);
    const file = path.join(repoDir, projectsDir, `${safeSessionId}.jsonl`);
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
  read: Effect.fn("Session.sandboxSessionStore.read")(function* (sessionId: string) {
    const safeSessionId = yield* validateSessionId(sessionId);
    const file = shellEscape(sessionFilePath(repoDir, projectsDir, safeSessionId));

    return yield* handle.exec(`cat ${file}`).pipe(
      Effect.map((result) => result.stdout),
      SessionCaptureError.mapError(`Failed to read sandbox session ${sessionId}`, { sessionId })
    );
  }),
  sessionFilePath: (sessionId) => sessionFilePath(repoDir, projectsDir, sessionId),
  write: Effect.fn("Session.sandboxSessionStore.write")(function* (sessionId: string, content: string) {
    const safeSessionId = yield* validateSessionId(sessionId);
    const dir = shellEscape(`${repoDir}/${projectsDir}`);
    const file = shellEscape(sessionFilePath(repoDir, projectsDir, safeSessionId));

    yield* handle
      .exec(`mkdir -p ${dir} && cat > ${file}`, SandboxExecOptions.make({ stdin: content }))
      .pipe(Effect.asVoid, SessionCaptureError.mapError(`Failed to write sandbox session ${sessionId}`, { sessionId }));
  }),
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

  return SessionTransferResult.make({ sessionId });
});
