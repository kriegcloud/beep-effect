/**
 * Git patch sync-out for isolated sandbox providers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Effect, FileSystem, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { buildRecoveryMessage, type FailedStep, RecoveryInput } from "./RecoveryMessage.ts";
import { SyncError } from "./Sandbox.errors.ts";
import { profileSandboxPhase, redactSensitiveText } from "./Sandbox.observability.ts";
import { ProcessCommand, SandboxProcess } from "./Sandbox.process.ts";
import { type IsolatedSandboxHandle, SandboxExecOptions } from "./Sandbox.provider.ts";

const $I = $SandboxId.create("SyncOut");

const shellEscape = (value: string): string => `'${value.replaceAll("'", "'\\''")}'`;
const pad2 = (value: number): string => value.toString().padStart(2, "0");
const formatTimestamp = (date: Date): string =>
  `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}-${pad2(date.getHours())}${pad2(
    date.getMinutes()
  )}${pad2(date.getSeconds())}`;

/**
 * Optional sync-out recovery settings.
 *
 * @category models
 * @since 0.0.0
 */
export class SyncOutOptions extends S.Class<SyncOutOptions>($I`SyncOutOptions`)(
  {
    branch: S.optionalKey(S.String),
  },
  $I.annote("SyncOutOptions", {
    description: "Optional sync-out recovery settings.",
  })
) {}

/**
 * Result returned after sandbox changes have been applied to the host.
 *
 * @category models
 * @since 0.0.0
 */
export class SyncOutResult extends S.Class<SyncOutResult>($I`SyncOutResult`)(
  {
    applied: S.Boolean,
    hasCommits: S.Boolean,
    hasDiff: S.Boolean,
    hasUntracked: S.Boolean,
  },
  $I.annote("SyncOutResult", {
    description: "Result returned after sandbox changes have been applied to the host.",
  })
) {}

const profileSyncOut = (action: string) =>
  profileSandboxPhase({
    attributes: {
      action,
    },
    phase: `sandbox.syncOut.${action}`,
  });

const hostGitCommandLabel = (args: ReadonlyArray<string>): string => `git ${args.join(" ")}`;

const runHostGitResult = Effect.fn("SyncOut.runHostGitResult")(function* (args: ReadonlyArray<string>, cwd: string) {
  const process = yield* SandboxProcess;

  return yield* process
    .run(
      new ProcessCommand({
        args: [...args],
        command: "git",
        cwd,
      })
    )
    .pipe(
      SyncError.mapError(`Failed to run host git command: ${hostGitCommandLabel(args)}`),
      profileSyncOut("host.git")
    );
});

const runHostGit = Effect.fn("SyncOut.runHostGit")(function* (args: ReadonlyArray<string>, cwd: string) {
  const result = yield* runHostGitResult(args, cwd);

  if (result.exitCode !== 0) {
    const detail = redactSensitiveText(result.stderr || result.stdout);

    return yield* SyncError.new(
      detail,
      `Host git command failed with exit code ${result.exitCode}: ${hostGitCommandLabel(args)}\n${detail}`
    );
  }

  return result.stdout;
});

const execSandbox = Effect.fn("SyncOut.execSandbox")(function* <R>(
  handle: IsolatedSandboxHandle<R>,
  command: string,
  options?: SandboxExecOptions
) {
  return yield* handle
    .exec(command, options)
    .pipe(SyncError.mapError(`Sandbox exec failed: ${command}`), profileSyncOut("sandbox.exec"));
});

const execSandboxOk = Effect.fn("SyncOut.execSandboxOk")(function* <R>(
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

const isNonEmptyPath = (value: string): boolean => value.length > 0;

const parseNulSeparatedPaths = (output: string): ReadonlyArray<string> =>
  pipe(output, Str.split("\u0000"), A.filter(isNonEmptyPath));

const parseLineSeparatedPaths = (output: string): ReadonlyArray<string> =>
  pipe(output, Str.trim, Str.split("\n"), A.filter(isNonEmptyPath));

const validateRepoRelativePath = Effect.fn("SyncOut.validateRepoRelativePath")(function* (
  relativePath: string,
  path: Path.Path
) {
  const normalized = path.normalize(relativePath);

  if (
    path.isAbsolute(relativePath) ||
    normalized === "." ||
    normalized === ".." ||
    Str.startsWith(`..${path.sep}`)(normalized)
  ) {
    return yield* SyncError.new(relativePath, `Refusing to sync a path outside the repository: ${relativePath}`);
  }

  return normalized;
});

const createPatchDir = Effect.fn("SyncOut.createPatchDir")(function* (hostRepoDir: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const base = formatTimestamp(new Date());
  const patchesRoot = path.join(hostRepoDir, ".sandcastle", "patches");

  yield* fs
    .makeDirectory(patchesRoot, { recursive: true })
    .pipe(SyncError.mapError(`Failed to create patch root directory: ${patchesRoot}`));

  let counter = 0;
  let dirName = base;
  let patchDir = path.join(patchesRoot, dirName);
  let exists = yield* fs.exists(patchDir).pipe(SyncError.mapError(`Failed to inspect patch directory: ${patchDir}`));

  while (exists) {
    counter += 1;
    dirName = `${base}-${counter}`;
    patchDir = path.join(patchesRoot, dirName);
    exists = yield* fs.exists(patchDir).pipe(SyncError.mapError(`Failed to inspect patch directory: ${patchDir}`));
  }

  yield* fs
    .makeDirectory(patchDir, { recursive: true })
    .pipe(SyncError.mapError(`Failed to create patch directory: ${patchDir}`));

  return patchDir;
});

const isEmptyPatch = Effect.fn("SyncOut.isEmptyPatch")(function* (patchPath: string) {
  const fs = yield* FileSystem.FileSystem;
  const content = yield* fs
    .readFileString(patchPath)
    .pipe(SyncError.mapError(`Failed to inspect generated patch: ${patchPath}`));

  return !Str.includes("diff --git")(content);
});

const copyCommittedPatchesFromSandbox = Effect.fn("SyncOut.copyCommittedPatchesFromSandbox")(function* <R>(
  handle: IsolatedSandboxHandle<R>,
  path: Path.Path,
  hostHead: string,
  patchDir: string,
  sandboxPatchDir: string,
  patches: Array<string>
) {
  yield* execSandboxOk(
    handle,
    `git format-patch ${shellEscape(`${hostHead}..HEAD`)} -o ${shellEscape(sandboxPatchDir)}`,
    new SandboxExecOptions({ cwd: handle.worktreePath })
  );

  const patchNames = parseLineSeparatedPaths(
    (yield* execSandboxOk(handle, `ls -1 ${shellEscape(sandboxPatchDir)}`)).stdout
  );

  yield* Effect.forEach(
    patchNames,
    Effect.fnUntraced(function* (patchName) {
      const sandboxPatchPath = `${sandboxPatchDir}/${patchName}`;
      const hostPatchPath = path.join(patchDir, patchName);

      yield* handle
        .copyFileOut(sandboxPatchPath, hostPatchPath)
        .pipe(SyncError.mapError(`Failed to copy generated patch out of sandbox: ${patchName}`));

      if (!(yield* isEmptyPatch(hostPatchPath))) {
        patches.push(hostPatchPath);
      }
    }),
    { concurrency: 1, discard: true }
  );
});

const saveCommittedPatches = Effect.fn("SyncOut.saveCommittedPatches")(function* <R>(
  handle: IsolatedSandboxHandle<R>,
  hostHead: string,
  patchDir: string
) {
  const path = yield* Path.Path;
  const sandboxPatchDir = Str.trim((yield* execSandboxOk(handle, "mktemp -d -t beep-sandbox-patches-XXXXXX")).stdout);
  const patches: Array<string> = [];

  yield* copyCommittedPatchesFromSandbox(handle, path, hostHead, patchDir, sandboxPatchDir, patches).pipe(
    Effect.ensuring(execSandbox(handle, `rm -rf ${shellEscape(sandboxPatchDir)}`).pipe(Effect.ignore))
  );

  return patches;
});

const saveUncommittedDiff = Effect.fn("SyncOut.saveUncommittedDiff")(function* (patchDir: string, diff: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const diffPath = path.join(patchDir, "changes.patch");

  yield* fs.writeFileString(diffPath, diff).pipe(SyncError.mapError(`Failed to write diff patch: ${diffPath}`));

  return diffPath;
});

const saveUntrackedFiles = Effect.fn("SyncOut.saveUntrackedFiles")(function* <R>(
  handle: IsolatedSandboxHandle<R>,
  patchDir: string,
  untrackedFiles: ReadonlyArray<string>
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const untrackedDir = path.join(patchDir, "untracked");

  yield* Effect.forEach(
    untrackedFiles,
    Effect.fnUntraced(function* (relativePath) {
      const safeRelativePath = yield* validateRepoRelativePath(relativePath, path);
      const sandboxFilePath = `${handle.worktreePath}/${safeRelativePath}`;
      const hostFilePath = path.join(untrackedDir, safeRelativePath);

      yield* fs
        .makeDirectory(path.dirname(hostFilePath), { recursive: true })
        .pipe(SyncError.mapError(`Failed to create untracked file artifact directory: ${safeRelativePath}`));
      yield* handle
        .copyFileOut(sandboxFilePath, hostFilePath)
        .pipe(SyncError.mapError(`Failed to save untracked file artifact: ${safeRelativePath}`));
    }),
    { concurrency: 1, discard: true }
  );
});

const copyUntrackedToHost = Effect.fn("SyncOut.copyUntrackedToHost")(function* (
  hostRepoDir: string,
  patchDir: string,
  untrackedFiles: ReadonlyArray<string>
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const untrackedDir = path.join(patchDir, "untracked");

  yield* Effect.forEach(
    untrackedFiles,
    Effect.fnUntraced(function* (relativePath) {
      const safeRelativePath = yield* validateRepoRelativePath(relativePath, path);
      const sourcePath = path.join(untrackedDir, safeRelativePath);
      const destinationPath = path.join(hostRepoDir, safeRelativePath);

      yield* fs
        .makeDirectory(path.dirname(destinationPath), { recursive: true })
        .pipe(SyncError.mapError(`Failed to create host directory for untracked file: ${safeRelativePath}`));
      yield* fs
        .copyFile(sourcePath, destinationPath)
        .pipe(SyncError.mapError(`Failed to copy untracked file to host: ${safeRelativePath}`));
    }),
    { concurrency: 1, discard: true }
  );
});

const cleanupPatchDir = Effect.fn("SyncOut.cleanupPatchDir")(function* (patchDir: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const patchesRoot = path.dirname(patchDir);
  const sandcastleDir = path.dirname(patchesRoot);

  yield* fs
    .remove(patchDir, { force: true, recursive: true })
    .pipe(SyncError.mapError("Failed to clean up patch directory"));

  const remainingPatches = yield* fs
    .readDirectory(patchesRoot)
    .pipe(Effect.catch(() => Effect.succeed(["preserve"] as Array<string>)));

  if (remainingPatches.length === 0) {
    yield* fs.remove(patchesRoot, { force: true, recursive: true }).pipe(Effect.ignore);
  }

  const remainingSandcastleEntries = yield* fs
    .readDirectory(sandcastleDir)
    .pipe(Effect.catch(() => Effect.succeed(["preserve"] as Array<string>)));

  if (remainingSandcastleEntries.length === 0) {
    yield* fs.remove(sandcastleDir, { force: true, recursive: true }).pipe(Effect.ignore);
  }
});

const markFailure = (step: FailedStep, setFailedStep: (step: FailedStep) => void) =>
  Effect.catch(() => Effect.sync(() => setFailedStep(step)));

/**
 * Sync committed, uncommitted, and untracked sandbox changes back to a host repository.
 *
 * @category combinators
 * @since 0.0.0
 */
export const syncOut: <R>(
  hostRepoDir: string,
  handle: IsolatedSandboxHandle<R>,
  options?: SyncOutOptions
) => Effect.Effect<SyncOutResult, SyncError, R | SandboxProcess | FileSystem.FileSystem | Path.Path> = Effect.fn(
  "SyncOut.syncOut"
)(function* <R>(
  hostRepoDir: string,
  handle: IsolatedSandboxHandle<R>,
  options: SyncOutOptions = new SyncOutOptions({})
) {
  const path = yield* Path.Path;
  const hostHead = Str.trim(yield* runHostGit(["rev-parse", "HEAD"], hostRepoDir));
  const sandboxHead = Str.trim(
    (yield* execSandboxOk(handle, "git rev-parse HEAD", new SandboxExecOptions({ cwd: handle.worktreePath }))).stdout
  );
  const hasCommits = hostHead !== sandboxHead;
  const diffResult = yield* execSandbox(handle, "git diff HEAD", new SandboxExecOptions({ cwd: handle.worktreePath }));
  const hasDiff = diffResult.exitCode === 0 && Str.trim(diffResult.stdout).length > 0;
  const untrackedResult = yield* execSandbox(
    handle,
    "git ls-files --others --exclude-standard -z",
    new SandboxExecOptions({ cwd: handle.worktreePath })
  );
  const untrackedFiles = untrackedResult.exitCode === 0 ? parseNulSeparatedPaths(untrackedResult.stdout) : [];
  const hasUntracked = untrackedFiles.length > 0;

  if (!hasCommits && !hasDiff && !hasUntracked) {
    return new SyncOutResult({
      applied: false,
      hasCommits,
      hasDiff,
      hasUntracked,
    });
  }

  const patchDir = yield* createPatchDir(hostRepoDir);
  const relativePatchDir = path.join(".sandcastle", "patches", path.basename(patchDir));
  const nonEmptyPatches = hasCommits ? yield* saveCommittedPatches(handle, hostHead, patchDir) : [];

  if (hasDiff) {
    yield* saveUncommittedDiff(patchDir, diffResult.stdout);
  }

  if (hasUntracked) {
    yield* saveUntrackedFiles(handle, patchDir, untrackedFiles);
  }

  let failedStep: FailedStep | undefined;
  const setFailedStep = (step: FailedStep): void => {
    failedStep = step;
  };

  if (nonEmptyPatches.length > 0) {
    yield* runHostGitResult(["am", "--abort"], hostRepoDir).pipe(Effect.ignore);
    yield* runHostGit(["am", "--3way", ...nonEmptyPatches], hostRepoDir).pipe(markFailure("commits", setFailedStep));
  }

  if (failedStep === undefined && hasDiff) {
    yield* runHostGit(["apply", path.join(patchDir, "changes.patch")], hostRepoDir).pipe(
      markFailure("diff", setFailedStep)
    );
  }

  if (failedStep === undefined && hasUntracked) {
    yield* copyUntrackedToHost(hostRepoDir, patchDir, untrackedFiles).pipe(markFailure("untracked", setFailedStep));
  }

  if (failedStep !== undefined) {
    const recoveryMessage = buildRecoveryMessage(
      new RecoveryInput({
        ...(options.branch === undefined ? {} : { branch: options.branch }),
        failedStep,
        hasCommits: nonEmptyPatches.length > 0,
        hasDiff,
        hasUntracked,
        patchDir: relativePatchDir,
      })
    );

    return yield* SyncError.new(
      recoveryMessage,
      `Sync-out patch application failed. Saved artifacts in ${relativePatchDir}.\n\n${recoveryMessage}`
    );
  }

  yield* cleanupPatchDir(patchDir);

  return new SyncOutResult({
    applied: true,
    hasCommits: nonEmptyPatches.length > 0,
    hasDiff,
    hasUntracked,
  });
});
