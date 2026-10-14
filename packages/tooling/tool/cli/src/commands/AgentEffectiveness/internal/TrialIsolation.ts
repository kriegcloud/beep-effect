/**
 * Protected disposable trial TrialIsolation operations.
 * @packageDocumentation
 * @since 0.0.0
 */
import { hashPublicTextSha256 } from "@beep/repo-ai-metrics/privacy";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as HashSet from "effect/HashSet";
import * as MutableList from "effect/MutableList";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Path from "effect/Path";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { hashFileSha256 } from "../../../internal/cli/FsGuards.ts";
import { repoRunOutputBound, runCaptured } from "../../../internal/process/StepExec.ts";
import { AgentTrialError } from "../AgentEffectiveness.errors.ts";
import {
  TrialArtifact,
  TrialBootstrapFile,
  TrialInputInventory,
  TrialInputMetadata,
  TrialNativeInvocation,
  TrialNativeYeetRuntime,
  TrialRuntimeClosure,
} from "./TrialProfile.schemas.ts";
import type { Sha256Hex } from "@beep/schema/Sha256";
import type { TrialCandidateControls, TrialPlan } from "../AgentEffectiveness.trials.schemas.ts";
import type { TrialEvaluatorCheck, TrialMount } from "./TrialProfile.schemas.ts";

const fail = (message: string) => Effect.fail(AgentTrialError.make({ stage: "isolation", message }));
const sameMetadata = S.toEquivalence(TrialInputMetadata);

/**
 * Hash a complete narrow input tree, rejecting links that escape its root.
 * **Example** (Inspect the digest operation)
 * ```ts
 * import { hashTrialInput } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(hashTrialInput)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const hashTrialInput = Effect.fn("AgentEffectiveness.hashTrialInput")(function* (root: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const canonical = yield* fs.realPath(root);
  if (!path.isAbsolute(root) || canonical !== root) return yield* fail("Input root is a symlink or noncanonical path");
  const info = yield* fs.stat(root);
  if (info.type === "File")
    return yield* hashFileSha256(root, (cause) =>
      AgentTrialError.make({ stage: "isolation", message: "Cannot hash frozen input", cause })
    );
  if (info.type !== "Directory") return yield* fail("Input must be a file or directory");
  const entries = yield* fs.readDirectory(root, { recursive: true });
  const rows = yield* Effect.forEach(A.sort(entries, Str.Order), (relative) =>
    Effect.gen(function* () {
      const full = path.join(root, relative);
      const link = yield* fs.readLink(full).pipe(Effect.option);
      if (O.isSome(link)) {
        const resolved = yield* fs.realPath(full);
        if (!Str.startsWith(`${root}/`)(resolved)) return yield* fail("Input symlink escapes frozen tree");
        return `${relative}\u0000link\u0000${link.value}`;
      }
      const stat = yield* fs.stat(full);
      if (stat.type === "Directory") return `${relative}\u0000directory`;
      if (stat.type !== "File") return yield* fail("Special files are forbidden in frozen inputs");
      const digest = yield* hashFileSha256(full, (cause) =>
        AgentTrialError.make({ stage: "isolation", message: "Cannot hash frozen input", cause })
      );
      return `${relative}\u0000file\u0000${stat.mode}\u0000${digest}`;
    })
  );
  return yield* hashPublicTextSha256(A.join(rows, "\n"));
});

/**
 * Derive the canary identity from every invocation control except its own receipt.
 * **Details**
 * JSON property order is normalized recursively. The declared config digest and
 * attestation path/digest are excluded to avoid a self-referential hash.
 * **Example** (Inspect the control binding)
 * ```ts
 * import { trialControlsDigest } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(trialControlsDigest)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const trialControlsDigest = Effect.fn("AgentEffectiveness.trialControlsDigest")(function* (
  plan: TrialCandidateControls | TrialPlan
) {
  const canonical = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(canonical);
    if (typeof value === "object" && value !== null)
      return Object.fromEntries(
        Object.entries(value)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, child]) => [key, canonical(child)])
      );
    return value;
  };
  const {
    configDigest: _config,
    isolationAttestationPath: _path,
    isolationAttestationDigest: _receipt,
    ...controls
  } = { configDigest: undefined, isolationAttestationPath: undefined, isolationAttestationDigest: undefined, ...plan };
  const path = yield* Path.Path;
  const boundaryFiles = yield* Effect.forEach(
    [
      new URL("./TrialIsolation.ts", import.meta.url),
      new URL("./TrialSandbox.ts", import.meta.url),
      new URL("./TrialIsolationQualification.ts", import.meta.url),
      new URL("./TrialProfile.schemas.ts", import.meta.url),
      new URL("./TrialCollector.ts", import.meta.url),
      new URL("./TrialUsage.ts", import.meta.url),
      new URL("./TrialProof.ts", import.meta.url),
      new URL("./TrialExecutor.ts", import.meta.url),
      new URL("../AgentEffectiveness.trials.schemas.ts", import.meta.url),
      new URL("../../../internal/process/StepExec.ts", import.meta.url),
    ],
    (url) =>
      Effect.gen(function* () {
        return yield* hashTrialInput(yield* path.fromFileUrl(url));
      })
  );
  return yield* hashPublicTextSha256(
    yield* S.encodeEffect(S.fromJsonString(S.Unknown))(
      canonical({
        controls: {
          ...controls,
          productiveProfile:
            controls.productiveProfile === undefined
              ? undefined
              : (() => {
                  const { profileCanaries: _canaries, ...profileControls } = controls.productiveProfile;
                  return profileControls;
                })(),
        },
        boundaryFiles,
      })
    )
  );
});

/**
 * Construct an offline evaluator view containing only the owned trial state.
 * **Details**
 * Git metadata remains untrusted after coding. Every inspection and export runs
 * inside this empty-root namespace; metadata pointers cannot reach host paths.
 * **Example** (Inspect the evaluator boundary)
 * ```ts
 * import { trialGitSandbox } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(trialGitSandbox)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const trialGitSandbox = Effect.fn("AgentEffectiveness.trialGitSandbox")(function* (
  workspace: string,
  gitArgs: ReadonlyArray<string>,
  system?: TrialInputInventory,
  requireSystem?: boolean
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const state = path.dirname(workspace);
  if ((yield* fs.realPath(state)) !== state || (yield* fs.realPath(workspace)) !== workspace)
    return yield* fail("Evaluator trial roots are not canonical");
  const args = [
    "--die-with-parent",
    "--new-session",
    "--unshare-all",
    "--tmpfs",
    "/",
    "--proc",
    "/proc",
    "--dev",
    "/dev",
    "--tmpfs",
    "/tmp",
    "--dir",
    "/state",
    "--bind",
    workspace,
    "/workspace",
  ];
  if (yield* fs.exists(path.join(state, "repository.git")))
    args.push("--bind", path.join(state, "repository.git"), "/state/repository.git");
  args.push(...(yield* trialSystemBindings(system, requireSystem)));
  args.push(
    "--clearenv",
    "--setenv",
    "HOME",
    "/nonexistent",
    "--setenv",
    "PATH",
    "/usr/bin:/bin",
    "--setenv",
    "GIT_CONFIG_NOSYSTEM",
    "1",
    "--setenv",
    "GIT_CONFIG_GLOBAL",
    "/dev/null",
    "--chdir",
    "/workspace"
  );
  if (yield* fs.exists(path.join(state, "repository.git")))
    args.push(
      "--setenv",
      "GIT_DIR",
      "/state/repository.git/worktrees/worktree",
      "--setenv",
      "GIT_WORK_TREE",
      "/workspace"
    );
  args.push(
    "--",
    "/usr/bin/git",
    "-c",
    "core.hooksPath=/dev/null",
    "-c",
    "core.fsmonitor=false",
    "-c",
    "credential.helper=",
    "-c",
    "core.pager=cat",
    ...gitArgs
  );
  return args;
});

/**
 * Inspect untrusted trial Git state without running host Git against it.
 * **Example** (Inspect a protected operation)
 * ```ts
 * import { inspectTrialGit } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(inspectTrialGit)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const inspectTrialGit = Effect.fn("AgentEffectiveness.inspectTrialGit")(function* (
  workspace: string,
  args: ReadonlyArray<string>,
  system?: TrialInputInventory,
  requireSystem?: boolean
) {
  return yield* runCaptured({
    command: "/usr/bin/bwrap",
    args: yield* trialGitSandbox(workspace, args, system, requireSystem),
    extendEnv: false,
    env: {},
    source: "stdout",
    bound: repoRunOutputBound,
    timeout: "30 seconds",
    forceKillAfter: "1 second",
  });
});

/**
 * Validate the actual native argv selection independently of stream observations.
 * **Details**
 * Every explicit pin must agree. Missing effort stays an admission error rather
 * than being inferred from a token field or a provider's effort-active boolean.
 * **Example** (Inspect native pin validation)
 * ```ts
 * import { deriveTrialInvocation } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(deriveTrialInvocation)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const deriveTrialInvocation = Effect.fn("AgentEffectiveness.deriveTrialInvocation")(function* (plan: TrialPlan) {
  const values = (flags: ReadonlyArray<string>) =>
    A.getSomes(
      A.map(plan.args, (arg, index) => {
        if (A.contains(flags, arg)) return A.get(plan.args, index + 1);
        const flag = A.findFirst(flags, (flag) => Str.startsWith(`${flag}=`)(arg));
        return O.map(flag, (flag) => Str.replace(`${flag}=`, "")(arg));
      })
    );
  const config = values(["-c", "--config"]);
  const configValues = (key: string) =>
    A.map(
      A.filter(config, (value) => Str.startsWith(`${key}=`)(value)),
      (value) => Str.replaceAll("'", "")(Str.replaceAll('"', "")(Str.replace(`${key}=`, "")(value)))
    );
  const models = [...values(["--model", "-m"]), ...(plan.provider === "codex" ? configValues("model") : [])];
  const efforts = plan.provider === "codex" ? configValues("model_reasoning_effort") : values(["--effort"]);
  if (
    A.isReadonlyArrayEmpty(models) ||
    A.isReadonlyArrayEmpty(efforts) ||
    !A.every(models, (model) => model === plan.model) ||
    !A.every(efforts, (effort) => effort === plan.effort)
  )
    return yield* fail("Actual native argv does not establish the frozen model and medium effort");
  const configurations = A.map(
    A.filter(plan.mounts, (mount) => Str.startsWith("/home/trial/")(mount.target)),
    (mount) => TrialArtifact.make({ path: mount.source, digest: mount.digest })
  );
  return TrialNativeInvocation.make({
    schemaVersion: "agent-trial-native-invocation/v1",
    provider: plan.provider,
    command: plan.command,
    commandDigest: plan.commandDigest,
    args: plan.args,
    environment: plan.environment,
    controlsDigest: plan.configDigest,
    requestedModel: plan.model,
    requestedEffort: plan.effort,
    mechanism:
      plan.provider === "codex"
        ? "codex-cli-config"
        : plan.provider === "claude"
          ? "claude-cli-flags"
          : "grok-cli-flags",
    provenance: "requested-native-argv-config",
    configuration: configurations,
  });
});

const readTrialInputMetadata = Effect.fn("AgentEffectiveness.readTrialInputMetadata")(function* (
  full: string,
  link: O.Option<string>
) {
  const fs = yield* FileSystem.FileSystem;
  let observed: O.Option<TrialInputMetadata>;
  if (O.isSome(link)) {
    const result = yield* runCaptured({
      command: "/usr/bin/stat",
      args: ["--printf=%f,%u,%g", full],
      extendEnv: false,
      env: {},
      source: "stdout",
      timeout: "10 seconds",
    });
    const parts = Str.split(",")(result.output);
    const fields = O.all({
      mode: O.flatMap(A.get(parts, 0), (hex) => Num.parse(`0x${hex}`)),
      uid: O.flatMap(A.get(parts, 1), Num.parse),
      gid: O.flatMap(A.get(parts, 2), Num.parse),
    });
    observed =
      result.exitCode === 0 && !result.truncated
        ? O.flatMap(fields, S.decodeUnknownOption(TrialInputMetadata))
        : O.none();
  } else {
    const info = yield* fs.stat(full);
    observed = O.map(O.all({ uid: info.uid, gid: info.gid }), (ids) =>
      TrialInputMetadata.make({ mode: info.mode, ...ids })
    );
  }
  return observed;
});

/**
 * Validate a complete sealed inventory without following namespace-only links.
 * **Details**
 * Absolute symlinks may resolve only inside the future evaluator namespace.
 * Their literal targets are hashed; host resolution is never used. All files
 * must be enumerated and all directory entries must belong to that inventory.
 * **Example** (Inspect frozen inventory validation)
 * ```ts
 * import { validateTrialInventory } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(validateTrialInventory)
 * ```
 * @category execution
 * @since 0.0.0
 */
export const validateTrialInventory = Effect.fn("AgentEffectiveness.validateTrialInventory")(function* (
  input: TrialInputInventory,
  namespaceRoot = "/sealed",
  requireMetadata?: boolean
) {
  if (
    requireMetadata === true &&
    (input.metadata === undefined ||
      !A.makeEquivalence(Str.Equivalence)(
        A.sort(R.keys(input.metadata), Str.Order),
        A.sort([...R.keys(input.files), ...R.keys(input.symlinks), ...(input.directories ?? [])], Str.Order)
      ))
  )
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Native runtime requires complete mode and ownership metadata",
    });
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  if ((yield* fs.realPath(input.root)) !== input.root)
    return yield* AgentTrialError.make({ stage: "proof", message: "Sealed inventory root must be canonical" });
  const names = A.sort(
    [...Object.keys(input.files), ...Object.keys(input.symlinks), ...(input.directories ?? [])],
    Str.Order
  );
  if (A.dedupe(names).length !== names.length)
    return yield* AgentTrialError.make({ stage: "proof", message: "Duplicate sealed inventory file/link" });
  const directories = HashSet.fromIterable(input.directories ?? []);
  for (const name of names) {
    if (path.isAbsolute(name) || path.normalize(name) !== name || name === ".." || Str.startsWith("../")(name))
      return yield* AgentTrialError.make({ stage: "proof", message: "Sealed inventory contains an escaping path" });
    const full = path.join(input.root, name);
    const link = yield* fs.readLink(full).pipe(Effect.option);
    if (O.isSome(link)) {
      const target = input.symlinks[name];
      const projected = path.resolve(namespaceRoot, path.dirname(name), link.value);
      const nativeRoots =
        namespaceRoot === "/nix"
          ? ["/nix/store/"]
          : namespaceRoot === "/runtime/oci"
            ? ["/bin/", "/sbin/", "/usr/", "/lib/", "/lib64/", "/etc/", "/proc/", "/dev/"]
            : [];
      if (
        target !== link.value ||
        !(namespaceRoot === "/runtime/bun-cache" || namespaceRoot === "/output/bun-cache"
          ? projected === namespaceRoot || Str.startsWith(`${namespaceRoot}/`)(projected)
          : A.some(["/workspace/", "/runtime/", "/sealed/", ...nativeRoots], (root) => Str.startsWith(root)(projected)))
      )
        return yield* AgentTrialError.make({
          stage: "proof",
          message: "Sealed link differs or escapes evaluator namespace",
        });
    } else if (HashSet.has(directories, name)) {
      if ((yield* fs.stat(full)).type !== "Directory" || (yield* fs.realPath(full)) !== full)
        return yield* AgentTrialError.make({
          stage: "proof",
          message: "Runtime scaffold is not a canonical directory",
        });
    } else if (input.files[name] === undefined || (yield* hashTrialInput(full)) !== input.files[name])
      return yield* AgentTrialError.make({ stage: "proof", message: "Sealed input file changed" });
    const metadata = input.metadata?.[name];
    if (metadata !== undefined) {
      const observed = yield* readTrialInputMetadata(full, link);
      if (!O.exists(observed, (value) => sameMetadata(metadata, value)))
        return yield* AgentTrialError.make({ stage: "proof", message: "Sealed input ownership or mode changed" });
    }
  }
  const pending = MutableList.make<string>();
  const actual = MutableList.make<string>();
  MutableList.append(pending, "");
  for (
    let directory = MutableList.take(pending);
    directory !== MutableList.Empty;
    directory = MutableList.take(pending)
  ) {
    for (const entry of yield* fs.readDirectory(path.join(input.root, directory))) {
      const relative = path.join(directory, entry);
      MutableList.append(actual, relative);
      const full = path.join(input.root, relative);
      if (O.isNone(yield* fs.readLink(full).pipe(Effect.option)) && (yield* fs.stat(full)).type === "Directory")
        MutableList.append(pending, relative);
    }
  }
  const declared = HashSet.fromIterable(names);
  for (const name of MutableList.toArray(actual)) {
    if (!HashSet.has(declared, name) && !A.some(names, (entry) => Str.startsWith(name + "/")(entry)))
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Unlisted sealed input would enter evaluator namespace",
        cause: { unlisted: name },
      });
  }
  if ((yield* trialInventoryDigest(input)) !== input.digest)
    return yield* AgentTrialError.make({
      stage: "proof",
      message: "Sealed inventory digest differs from frozen controls",
    });
});

/**
 * Hash the canonical inventory fields independently of a live filesystem root.
 * **Details**
 * This codec binds retained cache snapshots after their rebuildable directory is
 * gone. Files, link literals, directories and metadata preserve validation order.
 * **Example** (Compose a retained inventory digest)
 * ```ts
 * import { TrialInputInventory, trialInventoryDigest } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * const digest = S.decodeUnknownEffect(TrialInputInventory)({}).pipe(Effect.flatMap(trialInventoryDigest))
 * console.log(Effect.isEffect(digest)) // true: malformed inventories remain failures.
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const trialInventoryDigest = Effect.fn("AgentEffectiveness.trialInventoryDigest")(function* (
  input: TrialInputInventory
) {
  const canonical = {
    files: R.fromEntries(A.map(A.sort(R.keys(input.files), Str.Order), (key) => [key, input.files[key]])),
    symlinks: R.fromEntries(A.map(A.sort(R.keys(input.symlinks), Str.Order), (key) => [key, input.symlinks[key]])),
    ...(input.directories === undefined ? {} : { directories: A.sort(input.directories, Str.Order) }),
    ...(input.metadata === undefined
      ? {}
      : {
          metadata: R.fromEntries(
            A.sort(
              R.toEntries(input.metadata),
              Order.mapInput(Str.Order, ([name]: readonly [string, unknown]) => name)
            )
          ),
        }),
  };
  return yield* hashPublicTextSha256(yield* S.encodeEffect(S.fromJsonString(S.Unknown))(canonical));
});

/**
 * Capture an owned cache without traversing directory symlinks.
 * **Details**
 * The snapshot records complete metadata and literal links. It does not follow
 * outputs into other roots, and its digest can be checked after cache retirement.
 * **Example** (Keep cache capture inside the filesystem service boundary)
 * ```ts
 * import { captureTrialInventory } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(captureTrialInventory("/owned/cache"))) // true
 * ```
 * @category execution
 * @since 0.0.0
 */
export const captureTrialInventory = Effect.fn("AgentEffectiveness.captureTrialInventory")(function* (root: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  if (!path.isAbsolute(root) || (yield* fs.realPath(root)) !== root)
    return yield* AgentTrialError.make({ stage: "proof", message: "Cache snapshot root must be canonical" });
  const files: Record<string, Sha256Hex> = {};
  const symlinks: Record<string, string> = {};
  const directories = MutableList.make<string>();
  const metadata: Record<string, TrialInputMetadata> = {};
  const pending = MutableList.make<string>();
  MutableList.append(pending, "");
  for (let parent = MutableList.take(pending); parent !== MutableList.Empty; parent = MutableList.take(pending)) {
    for (const name of yield* fs.readDirectory(path.join(root, parent))) {
      const relative = path.join(parent, name);
      const full = path.join(root, relative);
      const link = yield* fs.readLink(full).pipe(Effect.option);
      if (O.isSome(link)) symlinks[relative] = link.value;
      else {
        const info = yield* fs.stat(full);
        if (info.type === "Directory") {
          MutableList.append(directories, relative);
          MutableList.append(pending, relative);
        } else if (info.type === "File") files[relative] = yield* hashTrialInput(full);
        else
          return yield* AgentTrialError.make({ stage: "proof", message: "Cache contains a special filesystem input" });
      }
      const observed = yield* readTrialInputMetadata(full, link);
      if (O.isNone(observed))
        return yield* AgentTrialError.make({ stage: "proof", message: "Cannot capture cache ownership or mode" });
      metadata[relative] = observed.value;
    }
  }
  const input = TrialInputInventory.make({
    root,
    files,
    symlinks,
    directories: MutableList.toArray(directories),
    metadata,
    digest: yield* hashPublicTextSha256(""),
  });
  return TrialInputInventory.make({ ...input, digest: yield* trialInventoryDigest(input) });
});

const trialAccountBindings = Effect.fn("AgentEffectiveness.trialAccountBindings")(function* (
  system: TrialInputInventory,
  requireAccounts?: boolean
) {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const bindings: Array<string> = [];
  const names = ["etc/passwd", "etc/group", "etc/nsswitch.conf"];
  const declared = A.filter(names, (name) => R.has(system.files, name));
  if (A.isReadonlyArrayEmpty(declared) && requireAccounts !== true) return [];
  if (A.length(declared) !== A.length(names))
    return yield* fail("Sealed account inputs require the exact three-file census");
  for (const name of names) {
    const full = path.join(system.root, name);
    const info = yield* fs.stat(full);
    const metadata = O.fromUndefinedOr(system.metadata?.[name]);
    if (
      R.has(system.symlinks, name) ||
      O.isNone(metadata) ||
      info.type !== "File" ||
      (yield* fs.realPath(full)) !== full ||
      (yield* hashTrialInput(full)) !== system.files[name] ||
      info.mode !== metadata.value.mode ||
      !O.contains(info.uid, metadata.value.uid) ||
      !O.contains(info.gid, metadata.value.gid)
    )
      return yield* fail("Sealed account input is not a canonical metadata-bound regular file");
    bindings.push("--ro-bind", full, `/${name}`);
  }
  return bindings;
});

/**
 * Project a declared sparse system into the evaluator namespace.
 * **Details**
 * Omission retains legacy diagnostic mounts. Admitted evaluator contracts must
 * supply an inventory with metadata for every executable and library input.
 * **Example** (Keep filesystem work in a computation)
 * ```ts
 * import { trialSystemBindings } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(trialSystemBindings())) // true
 * ```
 * @category execution
 * @since 0.0.0
 */
export const trialSystemBindings = Effect.fn("AgentEffectiveness.trialSystemBindings")(function* (
  system?: TrialInputInventory,
  requireSystem?: boolean
) {
  const path = yield* Path.Path;
  if (requireSystem === true && system === undefined)
    return yield* fail("Productive namespace requires a declared sealed system");
  if (system !== undefined) yield* validateTrialInventory(system, "/runtime/system", requireSystem);
  return [
    ...A.flatMap(["/usr", "/bin", "/lib", "/lib64"], (target) => [
      "--ro-bind",
      system === undefined ? target : path.join(system.root, path.relative("/", target)),
      target,
    ]),
    ...(system === undefined ? [] : yield* trialAccountBindings(system, requireSystem)),
  ];
});

/**
 * Bind the ordered readonly mount and inventory projection census.
 * **Details**
 * Physical roots, namespace targets, access modes and complete inventory digests
 * are frozen with each evaluator check. Order and duplicate projections matter.
 * **Example** (Hash an empty diagnostic runtime census)
 * ```ts
 * import { deriveTrialRuntimeControlsDigest } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(deriveTrialRuntimeControlsDigest([], []))) // true
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const deriveTrialRuntimeControlsDigest = Effect.fn("AgentEffectiveness.deriveTrialRuntimeControlsDigest")(
  function* (runtime: ReadonlyArray<TrialMount>, projectedRuntime: ReadonlyArray<TrialRuntimeClosure>) {
    return yield* hashPublicTextSha256(
      yield* S.encodeEffect(S.fromJsonString(S.Unknown))({
        encoding: "trial-runtime-controls/v1",
        runtime: A.map(runtime, (mount) => ({
          source: mount.source,
          target: mount.target,
          access: mount.access,
          digest: mount.digest,
        })),
        projectedRuntime: A.map(projectedRuntime, (closure) => ({
          root: closure.inventory.root,
          target: closure.target,
          digest: closure.inventory.digest,
        })),
      })
    );
  }
);

/**
 * Bind every evaluator control using fixed field order and sorted environment entries.
 * **Example** (Inspect the frozen contract operation)
 * ```ts
 * import { trialCheckContractDigest } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(trialCheckContractDigest)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const trialCheckContractDigest = Effect.fn("trialCheckContractDigest")(function* (check: TrialEvaluatorCheck) {
  return yield* hashPublicTextSha256(
    yield* S.encodeEffect(S.fromJsonString(S.Unknown))({
      encoding: "trial-check-contract/v5",
      gitRefPolicy: "owned-base-refs-readonly/v1",
      runtimeControlsDigest: check.runtimeControlsDigest ?? null,
      id: check.id,
      kind: check.kind,
      commandTemplate: check.commandTemplate,
      environment: A.sort(
        R.toEntries(check.environmentTemplate),
        Order.mapInput(Str.Order, ([name]: readonly [string, string]) => name)
      ),
      inputBundleDigest: check.input.digest,
      expectedCases: check.expectedCases,
      expectedPackage: O.getOrNull(check.expectedPackage),
      reportRelativePath: O.getOrNull(check.reportRelativePath),
      writableCacheTargets: check.writableCacheTargets,
      compilerDigest: O.isSome(check.compilerOverlay) ? check.compilerOverlay.value.digest : null,
      timeoutMs: check.timeoutMs,
      rootWritePolicy: check.rootWritePolicy ?? "readonly",
      sparseSystem:
        check.sparseSystem === undefined ? null : yield* S.encodeEffect(TrialInputInventory)(check.sparseSystem),
      nativeRuntime:
        check.nativeRuntime === undefined ? null : yield* S.encodeEffect(TrialNativeYeetRuntime)(check.nativeRuntime),
    })
  );
});

/**
 * Preserve the namespace targets of native capability inventories.
 * **Details**
 * Absolute Nix and OCI links are evaluated in their declared namespaces. Both
 * native admission and retained custody use these bindings.
 * **Example** (Keep decoded native controls bound to their targets)
 * ```ts
 * import { TrialNativeYeetRuntime, trialNativeInventoryBindings } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * const bindings = S.decodeUnknownEffect(TrialNativeYeetRuntime)({}).pipe(Effect.map(trialNativeInventoryBindings))
 * console.log(Effect.isEffect(bindings)) // true: malformed controls remain a failing computation.
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const trialNativeInventoryBindings = (runtime: TrialNativeYeetRuntime): ReadonlyArray<TrialRuntimeClosure> => [
  TrialRuntimeClosure.make({ inventory: runtime.system, target: "/runtime/system" }),
  TrialRuntimeClosure.make({ inventory: runtime.nix, target: "/nix" }),
  TrialRuntimeClosure.make({ inventory: runtime.oci, target: "/runtime/oci" }),
  TrialRuntimeClosure.make({ inventory: runtime.crun, target: "/runtime/crun" }),
  ...O.fromUndefinedOr(runtime.bunInstallCache).pipe(
    O.map((inventory) => [TrialRuntimeClosure.make({ inventory, target: "/runtime/bun-cache" })]),
    O.getOrElse(() => [])
  ),
];

const readTrialBootstrapCapabilities = Effect.fn("AgentEffectiveness.readTrialBootstrapCapabilities")(function* (
  runtime: TrialNativeYeetRuntime
) {
  const result = yield* runCaptured({
    command: runtime.broker.interpreter.path,
    args: [
      "-I",
      "-B",
      "-c",
      A.join(
        [
          "import errno,json,os,sys",
          "rows=[]",
          "for path in sys.argv[1:]:",
          " try: capability=os.getxattr(path,'security.capability').hex()",
          " except OSError as error:",
          "  if error.errno!=errno.ENODATA: raise",
          "  capability=None",
          " rows.append({'path':path,'capability':capability})",
          "print(json.dumps(rows))",
        ],
        "\n"
      ),
      "/usr/bin/newuidmap",
      "/usr/bin/newgidmap",
    ],
    extendEnv: false,
    env: { PYTHONDONTWRITEBYTECODE: "1" },
    source: "stdout",
    timeout: "10 seconds",
  }).pipe(
    Effect.mapError(() => AgentTrialError.make({ stage: "proof", message: "Bootstrap capability reader failed" }))
  );
  if (result.exitCode !== 0 || result.truncated)
    return yield* AgentTrialError.make({ stage: "proof", message: "Bootstrap capability capture is incomplete" });
  return yield* S.decodeEffect(S.fromJsonString(TrialBootstrapFile.Capabilities))(result.output).pipe(
    Effect.mapError(() =>
      AgentTrialError.make({ stage: "proof", message: "Bootstrap capability observations are invalid" })
    )
  );
});

/**
 * Revalidate every native capability against its declared files and metadata.
 * **Details**
 * Both collection and finalization use this guard. Legacy inventory decoding
 * remains compatible; complete native metadata and standalone asset bindings
 * are required by this admission boundary.
 * **Example** (Compose validation after boundary decoding)
 * ```ts
 * import { TrialNativeYeetRuntime, validateTrialNativeRuntime } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * const validation = S.decodeUnknownEffect(TrialNativeYeetRuntime)({}).pipe(Effect.flatMap(validateTrialNativeRuntime))
 * console.log(Effect.isEffect(validation)) // true: invalid controls remain a failing computation.
 * ```
 * @category execution
 * @since 0.0.0
 */
export const validateTrialNativeRuntime = Effect.fn("AgentEffectiveness.validateTrialNativeRuntime")(
  function* (runtime: TrialNativeYeetRuntime) {
    const fs = yield* FileSystem.FileSystem;
    if (runtime.bunInstallCache === undefined)
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Native full runtime requires an immutable Bun install cache",
      });
    if (
      !A.every(
        ["etc/passwd", "etc/group", "etc/nsswitch.conf"],
        (name) =>
          R.has(runtime.system.files, name) &&
          runtime.system.metadata?.[name] !== undefined &&
          !R.has(runtime.system.symlinks, name)
      )
    )
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Native system requires declared readonly account inputs",
      });
    const bootstrapPaths = A.map(runtime.bootstrap, (file) => file.artifact.path);
    if (
      !A.every(
        [
          "/usr/bin/podman",
          "/usr/bin/bwrap",
          "/usr/bin/newuidmap",
          "/usr/bin/newgidmap",
          "/usr/bin/runc",
          "/usr/bin/stat",
          runtime.broker.interpreter.path,
        ],
        (file) => A.contains(bootstrapPaths, file)
      )
    )
      return yield* AgentTrialError.make({ stage: "proof", message: "Native bootstrap input closure is incomplete" });
    const helperPaths = ["/usr/bin/newuidmap", "/usr/bin/newgidmap"];
    for (const helperPath of helperPaths) {
      const declarations = A.filter(runtime.bootstrap, (file) => file.artifact.path === helperPath);
      if (A.length(declarations) !== 1 || A.some(declarations, (file) => file.capability === undefined))
        return yield* AgentTrialError.make({
          stage: "proof",
          message: "Bootstrap helpers require unique explicit capability declarations",
        });
    }
    for (const { inventory, target } of trialNativeInventoryBindings(runtime)) {
      yield* validateTrialInventory(inventory, target, true);
    }
    yield* trialAccountBindings(runtime.system, true);
    for (const file of runtime.bootstrap) {
      const info = yield* fs.stat(file.artifact.path);
      if (A.contains(helperPaths, file.artifact.path) && info.type !== "File")
        return yield* AgentTrialError.make({
          stage: "proof",
          message: "Bootstrap privilege helper must be a regular file",
        });
      if (
        (yield* hashTrialInput(file.artifact.path)) !== file.artifact.digest ||
        info.mode !== file.metadata.mode ||
        !O.contains(info.uid, file.metadata.uid) ||
        !O.contains(info.gid, file.metadata.gid)
      )
        return yield* AgentTrialError.make({ stage: "proof", message: "Rootless bootstrap file changed" });
    }
    if (
      !A.makeEquivalence(Str.Equivalence)(A.sort(runtime.broker.authorities, Str.Order), [
        "api.osv.dev:443",
        "registry.npmjs.org:443",
      ]) ||
      (yield* hashTrialInput(runtime.certificateBundle.path)) !== runtime.certificateBundle.digest
    )
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Native advisory policy or certificate bytes differ",
      });
    for (const artifact of [
      runtime.broker.program,
      runtime.broker.interpreter,
      runtime.broker.relay,
      runtime.broker.policy,
      runtime.broker.canaries,
    ])
      if ((yield* hashTrialInput(artifact.path)) !== artifact.digest)
        return yield* AgentTrialError.make({ stage: "proof", message: "Native broker asset changed" });
    const policy = yield* S.decodeEffect(
      S.fromJsonString(S.Record(S.String, S.Struct({ fixture: S.optional(S.Boolean) })))
    )(yield* fs.readFileString(runtime.broker.policy.path));
    if (
      !A.makeEquivalence(Str.Equivalence)(
        A.sort(R.keys(policy), Str.Order),
        A.sort(runtime.broker.authorities, Str.Order)
      ) ||
      A.some(R.values(policy), (entry) => entry.fixture === true)
    )
      return yield* AgentTrialError.make({
        stage: "proof",
        message: "Native broker policy differs or permits private fixtures",
      });
    const observations = yield* readTrialBootstrapCapabilities(runtime);
    for (const observation of observations) {
      const declaration = A.findFirst(runtime.bootstrap, (file) => file.artifact.path === observation.path);
      if (
        O.isNone(declaration) ||
        declaration.value.capability === undefined ||
        !S.toEquivalence(TrialBootstrapFile.Capability)(declaration.value.capability, observation.capability)
      )
        return yield* AgentTrialError.make({ stage: "proof", message: "Bootstrap helper capability changed" });
      const info = yield* fs.stat(observation.path);
      if (
        info.type !== "File" ||
        (yield* fs.realPath(observation.path)) !== observation.path ||
        (yield* hashTrialInput(observation.path)) !== declaration.value.artifact.digest ||
        info.mode !== declaration.value.metadata.mode ||
        !O.contains(info.uid, declaration.value.metadata.uid) ||
        !O.contains(info.gid, declaration.value.metadata.gid)
      )
        return yield* AgentTrialError.make({
          stage: "proof",
          message: "Bootstrap helper identity changed during capability capture",
        });
    }
    return observations;
  },
  Effect.mapError((cause) =>
    S.is(AgentTrialError)(cause)
      ? cause
      : AgentTrialError.make({ stage: "proof", message: "Native runtime validation failed" })
  )
);

/**
 * Verify every collection check slot against the frozen ordered plan.
 * **Example** (Inspect independent request validation)
 * ```ts
 * import { validateTrialRequestChecks } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(validateTrialRequestChecks)
 * ```
 * @category validation
 * @since 0.0.0
 */
export const validateTrialRequestChecks = Effect.fn("AgentEffectiveness.validateTrialRequestChecks")(function* (
  plan: Pick<TrialPlan, "requiredTaskCheckIds" | "requiredCheckSpecs" | "fullYeetCheckSpec">,
  checks: ReadonlyArray<TrialEvaluatorCheck>,
  yeet: TrialEvaluatorCheck
) {
  if (
    !A.makeEquivalence(Str.Equivalence)(
      A.map(checks, (check) => check.id),
      plan.requiredTaskCheckIds
    ) ||
    plan.fullYeetCheckSpec === undefined ||
    yeet.id !== plan.fullYeetCheckSpec.id ||
    yeet.kind !== "yeet" ||
    A.some(checks, (check) => check.kind === "yeet")
  )
    return false;
  for (const requested of [...checks, yeet]) {
    const frozen = A.findFirst(
      [...plan.requiredCheckSpecs, plan.fullYeetCheckSpec],
      (spec) => spec.id === requested.id
    );
    if (
      O.isNone(frozen) ||
      frozen.value.inputBundleDigest !== requested.input.digest ||
      !A.makeEquivalence(Str.Equivalence)(frozen.value.commandTemplate, requested.commandTemplate) ||
      frozen.value.contractDigest !== (yield* trialCheckContractDigest(requested))
    )
      return false;
  }
  return true;
});

/**
 * Resolve the declared coding system while keeping legacy diagnostics decodable.
 * **Details**
 * Productive transport requires exactly one system projection. Namespace builders
 * independently validate its actual bytes and complete metadata at every boundary.
 * **Example** (Leave an old diagnostic plan without a system)
 * ```ts
 * import { trialPlanSystem } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(trialPlanSystem({ networkAdmission: "blocked-until-broker" }))) // true
 * ```
 * @category execution
 * @since 0.0.0
 */
export const trialPlanSystem = Effect.fn("AgentEffectiveness.trialPlanSystem")(function* (
  plan: Pick<TrialPlan, "networkAdmission" | "runtimeClosures">
) {
  const systems = A.filter(plan.runtimeClosures ?? [], (closure) => closure.target === "/runtime/system");
  if (systems.length > 1) return yield* fail("Coding system projection is ambiguous");
  const system = O.map(A.head(systems), (closure) => closure.inventory);
  if (plan.networkAdmission === "exact-authority-broker" && O.isNone(system))
    return yield* fail("Productive coding requires a declared sealed system");
  return system;
});
