/**
 * Git bundle sync-in for isolated sandbox providers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Effect, FileSystem, Path } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { SyncError } from "./Sandbox.errors.ts";
import { profileSandboxPhase, redactSensitiveText } from "./Sandbox.observability.ts";
import { ProcessCommand, SandboxProcess } from "./Sandbox.process.ts";
import { type IsolatedSandboxHandle, SandboxExecOptions } from "./Sandbox.provider.ts";

const $I = $SandboxId.create("SyncIn");

const shellEscape = (value: string): string => `'${value.replaceAll("'", "'\\''")}'`;

/**
 * Result returned after a repository has been copied into an isolated sandbox.
 *
 * @category models
 * @since 0.0.0
 */
export class SyncInResult extends S.Class<SyncInResult>($I`SyncInResult`)(
  {
    branch: S.String,
  },
  $I.annote("SyncInResult", {
    description: "Result returned after a repository has been copied into an isolated sandbox.",
  })
) {}

const profileSyncIn = (action: string) =>
  profileSandboxPhase({
    attributes: {
      action,
    },
    phase: `sandbox.syncIn.${action}`,
  });

const hostGitCommandLabel = (args: ReadonlyArray<string>): string => `git ${args.join(" ")}`;

const runHostGit = Effect.fn("SyncIn.runHostGit")(function* (args: ReadonlyArray<string>, cwd: string) {
  const process = yield* SandboxProcess;
  const command = hostGitCommandLabel(args);
  const result = yield* process
    .run(
      new ProcessCommand({
        args: [...args],
        command: "git",
        cwd,
      })
    )
    .pipe(SyncError.mapError(`Failed to run host git command: ${command}`), profileSyncIn("host.git"));

  if (result.exitCode !== 0) {
    const detail = redactSensitiveText(result.stderr || result.stdout);

    return yield* SyncError.new(
      detail,
      `Host git command failed with exit code ${result.exitCode}: ${command}\n${detail}`
    );
  }

  return result.stdout;
});

const execSandbox = Effect.fn("SyncIn.execSandbox")(function* <R>(
  handle: IsolatedSandboxHandle<R>,
  command: string,
  options?: SandboxExecOptions
) {
  return yield* handle
    .exec(command, options)
    .pipe(SyncError.mapError(`Sandbox exec failed: ${command}`), profileSyncIn("sandbox.exec"));
});

const execSandboxOk = Effect.fn("SyncIn.execSandboxOk")(function* <R>(
  handle: IsolatedSandboxHandle<R>,
  command: string,
  options?: SandboxExecOptions
) {
  const result = yield* execSandbox(handle, command, options);

  if (result.exitCode !== 0) {
    const detail = redactSensitiveText(result.stderr || result.stdout);

    return yield* SyncError.new(
      detail,
      `Sandbox command failed with exit code ${result.exitCode}: ${command}\n${detail}`
    );
  }

  return result;
});

const copyBundleIntoSandbox = Effect.fn("SyncIn.copyBundleIntoSandbox")(function* <R>(
  handle: IsolatedSandboxHandle<R>,
  bundleHostPath: string,
  bundleSandboxPath: string
) {
  yield* handle
    .copyIn(bundleHostPath, bundleSandboxPath)
    .pipe(
      SyncError.mapError(`Failed to copy git bundle into sandbox: ${bundleSandboxPath}`),
      profileSyncIn("copy.bundle")
    );
});

const syncBundleToSandbox = Effect.fn("SyncIn.syncBundleToSandbox")(function* <R>(
  handle: IsolatedSandboxHandle<R>,
  path: Path.Path,
  bundleHostPath: string,
  sandboxTmpDir: string,
  branch: string,
  hostHead: string
) {
  const bundleSandboxPath = `${sandboxTmpDir}/repo.bundle`;
  const worktreePath = handle.worktreePath;
  const clonePath = `${worktreePath}-clone`;

  yield* copyBundleIntoSandbox(handle, bundleHostPath, bundleSandboxPath);
  yield* execSandboxOk(
    handle,
    [
      `mkdir -p ${shellEscape(path.dirname(worktreePath))}`,
      `rm -rf ${shellEscape(worktreePath)} ${shellEscape(clonePath)}`,
      `git clone ${shellEscape(bundleSandboxPath)} ${shellEscape(clonePath)}`,
      `mv ${shellEscape(clonePath)} ${shellEscape(worktreePath)}`,
    ].join(" && ")
  );
  yield* execSandboxOk(
    handle,
    branch === "HEAD" ? `git checkout --detach ${shellEscape(hostHead)}` : `git checkout ${shellEscape(branch)}`,
    new SandboxExecOptions({ cwd: worktreePath })
  );

  const sandboxHead = Str.trim(
    (yield* execSandboxOk(handle, "git rev-parse HEAD", new SandboxExecOptions({ cwd: worktreePath }))).stdout
  );

  if (hostHead !== sandboxHead) {
    return yield* SyncError.new(
      { hostHead, sandboxHead },
      `HEAD mismatch after sync-in: host=${hostHead} sandbox=${sandboxHead}`
    );
  }
});

const syncInWithBundle = Effect.fn("SyncIn.syncInWithBundle")(function* <R>(
  handle: IsolatedSandboxHandle<R>,
  path: Path.Path,
  hostRepoDir: string,
  bundleHostPath: string,
  branch: string,
  hostHead: string
) {
  yield* runHostGit(["bundle", "create", bundleHostPath, "--all"], hostRepoDir);

  const sandboxTmpDir = Str.trim((yield* execSandboxOk(handle, "mktemp -d -t beep-sandbox-XXXXXX")).stdout);

  yield* syncBundleToSandbox(handle, path, bundleHostPath, sandboxTmpDir, branch, hostHead).pipe(
    Effect.ensuring(execSandbox(handle, `rm -rf ${shellEscape(sandboxTmpDir)}`).pipe(Effect.ignore))
  );
});

/**
 * Sync a host git repository into an isolated sandbox by cloning from a git bundle.
 *
 * @category combinators
 * @since 0.0.0
 */
export const syncIn: {
  <R>(
    hostRepoDir: string,
    handle: IsolatedSandboxHandle<R>
  ): Effect.Effect<SyncInResult, SyncError, R | SandboxProcess | FileSystem.FileSystem | Path.Path>;
  <R>(
    handle: IsolatedSandboxHandle<R>
  ): (
    hostRepoDir: string
  ) => Effect.Effect<SyncInResult, SyncError, R | SandboxProcess | FileSystem.FileSystem | Path.Path>;
} = dual(
  (args) => P.isString(args[0]),
  Effect.fn("SyncIn.syncIn")(function* <R>(hostRepoDir: string, handle: IsolatedSandboxHandle<R>) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const branch = Str.trim(yield* runHostGit(["rev-parse", "--abbrev-ref", "HEAD"], hostRepoDir));
    const hostHead = Str.trim(yield* runHostGit(["rev-parse", "HEAD"], hostRepoDir));
    const bundleDir = yield* fs
      .makeTempDirectory({ prefix: "beep-sandbox-bundle-" })
      .pipe(SyncError.mapError("Failed to create host git bundle temp directory"));
    const bundleHostPath = path.join(bundleDir, "repo.bundle");

    yield* syncInWithBundle(handle, path, hostRepoDir, bundleHostPath, branch, hostHead).pipe(
      Effect.ensuring(fs.remove(bundleDir, { force: true, recursive: true }).pipe(Effect.ignore))
    );

    return new SyncInResult({ branch });
  })
);
