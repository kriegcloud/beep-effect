import { hashPublicTextSha256 } from "@beep/repo-ai-metrics/privacy";
import {
  captureTrialInventory,
  collectTrialMountGuard,
  collectTrialTrackedInventory,
  deriveTrialRuntimeControlsDigest,
  executeTrialCheck,
  finalizeTrial,
  hashTrialInput,
  inspectTrialGit,
  parseTrialTrackedRoots,
  parseTrialUsage,
  prepareTrialBunCache,
  restoreTrialInventoryLinks,
  retainTrialCandidate,
  TrialAcceptance,
  TrialAcceptanceJson,
  TrialArtifact,
  TrialAttempt,
  TrialAttemptJson,
  TrialBootstrapFile,
  TrialBrokerControl,
  TrialCollectRequest,
  TrialCollectRequestJson,
  TrialCommittedSource,
  TrialCommittedSourceJson,
  TrialEvaluatorCheck,
  TrialFinalizationJson,
  TrialGitRefGuard,
  TrialInputInventory,
  TrialInputMetadata,
  TrialMount,
  TrialMountGuardEvidence,
  TrialNativeRuntimeEvidence,
  TrialNativeYeetRuntime,
  TrialPlan,
  TrialPlanJson,
  TrialProof,
  TrialProofJson,
  trialArtifact,
  trialCheckContractDigest,
  trialEvaluatorInputRoots,
  trialEvaluatorInventoryBindings,
  trialInventoryDigest,
  trialMountGuardPaths,
  trialPlanSystem,
  trialSystemBindings,
  validateTrialBunCacheEvidence,
  validateTrialIgnoreCensus,
  validateTrialInventory,
  validateTrialMountGuardEvidence,
  validateTrialNativeRuntime,
  validateTrialRequestChecks,
} from "@beep/repo-cli/test/AgentEffectiveness";
import { repoRunOutputBound, runCaptured } from "@beep/repo-cli/test/Process";
import { YeetVerdict, YeetVerdictJson, YeetVerdictLane } from "@beep/repo-cli/test/Yeet";
import { Sha256Hex } from "@beep/schema/Sha256";
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import { NodeServices } from "@effect/platform-node";
import { expect, it, layer } from "@effect/vitest";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Tuple from "effect/Tuple";

const zero = Sha256Hex.make(Str.repeat(64)("0"));
const one = Sha256Hex.make(Str.repeat(64)("1"));
const artifact = { path: "/owned/file", digest: zero };
const inventory = TrialInputInventory.make({
  root: "/owned/runtime",
  digest: zero,
  files: {},
  symlinks: {},
  directories: [],
  metadata: {},
});
const runtime = TrialNativeYeetRuntime.make({
  schemaVersion: "agent-trial-native-yeet-runtime/v1",
  system: inventory,
  nix: inventory,
  nixStorePaths: ["/nix/store/fixture"],
  oci: inventory,
  crun: inventory,
  image: `ghcr.io/google/osv-scanner-action@sha256:${zero}`,
  certificateBundle: artifact,
  bunInstallCache: inventory,
  bootstrap: [
    TrialBootstrapFile.make({ artifact, metadata: TrialInputMetadata.make({ mode: 0o100755, uid: 1000, gid: 1000 }) }),
  ],
  broker: TrialBrokerControl.make({
    program: artifact,
    interpreter: artifact,
    relay: artifact,
    policy: artifact,
    canaries: artifact,
    authorities: ["api.osv.dev:443", "registry.npmjs.org:443"],
    maxSeconds: 10,
  }),
});
const check = TrialEvaluatorCheck.make({
  id: "native",
  kind: "yeet",
  commandTemplate: ["/runtime/bin/bun", "run", "beep"],
  environmentTemplate: {},
  input: inventory,
  expectedCases: ["check"],
  expectedPackage: O.none(),
  reportRelativePath: O.none(),
  writableCacheTargets: [],
  compilerOverlay: O.none(),
  timeoutMs: 1000,
  nativeRuntime: runtime,
});
it.effect("invalidates v4 contracts with the v5 fixed trusted-ref policy", () =>
  Effect.gen(function* () {
    const value = yield* trialCheckContractDigest(TrialEvaluatorCheck.make({ ...check, nativeRuntime: undefined }));
    expect(value).toBe("9b9f9f3cb34f35fabde06062152b0b2c46026a45de062a0b6094919ddd07ab39");
    expect(value).not.toBe("82bc549744975361dad549de52e2dd410cf619026b4fca299bfcc951ca4ee90c");
    expect(value).not.toBe("b30fa15be2aaf0a784350838fc186fae3f85ebab2c6e545b7009f401d25af944");
  })
);

it.effect("freezes ordered runtime and projection controls in every evaluator contract", () =>
  Effect.gen(function* () {
    const mount = TrialMount.make({ source: "/owned/bin", target: "/runtime/bin", access: "readonly", digest: zero });
    const projection = { target: "/workspace/node_modules", inventory };
    const original = yield* deriveTrialRuntimeControlsDigest([mount], [projection]);
    const mutations = [
      yield* deriveTrialRuntimeControlsDigest([{ ...mount, source: "/other/bin" }], [projection]),
      yield* deriveTrialRuntimeControlsDigest([{ ...mount, target: "/runtime/other" }], [projection]),
      yield* deriveTrialRuntimeControlsDigest([{ ...mount, access: "resettable" }], [projection]),
      yield* deriveTrialRuntimeControlsDigest([{ ...mount, digest: one }], [projection]),
      yield* deriveTrialRuntimeControlsDigest([mount], [{ ...projection, target: "/workspace/infra/node_modules" }]),
      yield* deriveTrialRuntimeControlsDigest(
        [mount],
        [{ ...projection, inventory: TrialInputInventory.make({ ...inventory, root: "/other/runtime" }) }]
      ),
      yield* deriveTrialRuntimeControlsDigest(
        [mount],
        [{ ...projection, inventory: TrialInputInventory.make({ ...inventory, digest: one }) }]
      ),
      yield* deriveTrialRuntimeControlsDigest([mount], [projection, projection]),
    ];
    const otherProjection = { ...projection, target: "/workspace/infra/node_modules" };
    expect(yield* deriveTrialRuntimeControlsDigest([mount], [projection, otherProjection])).not.toBe(
      yield* deriveTrialRuntimeControlsDigest([mount], [otherProjection, projection])
    );
    const frozen = yield* trialCheckContractDigest(
      TrialEvaluatorCheck.make({ ...check, runtimeControlsDigest: original })
    );
    expect(yield* trialCheckContractDigest(check)).not.toBe(frozen);
    for (const digest of mutations) {
      expect(digest).not.toBe(original);
      expect(
        yield* trialCheckContractDigest(TrialEvaluatorCheck.make({ ...check, runtimeControlsDigest: digest }))
      ).not.toBe(frozen);
    }
  })
);
it.effect("rejects duplicate, extra, reordered and moved collection check slots", () =>
  Effect.gen(function* () {
    const first = TrialEvaluatorCheck.make({ ...check, id: "first", kind: "framework" });
    const second = TrialEvaluatorCheck.make({ ...check, id: "second", kind: "vitest" });
    const spec = Effect.fn(function* (value: TrialEvaluatorCheck) {
      return {
        id: value.id,
        commandTemplate: value.commandTemplate,
        inputBundleDigest: value.input.digest,
        contractDigest: yield* trialCheckContractDigest(value),
      };
    });
    const plan = {
      requiredTaskCheckIds: A.make(first.id, second.id),
      requiredCheckSpecs: A.make(yield* spec(first), yield* spec(second)),
      fullYeetCheckSpec: yield* spec(check),
    };
    expect(yield* validateTrialRequestChecks(plan, [first, second], check)).toBe(true);
    for (const values of [
      [first, first],
      [first, second, second],
      [second, first],
      [first, check],
    ])
      expect(yield* validateTrialRequestChecks(plan, values, check)).toBe(false);
    expect(yield* validateTrialRequestChecks(plan, [first, second], first)).toBe(false);
    expect(
      yield* validateTrialRequestChecks(plan, [first, second], TrialEvaluatorCheck.make({ ...check, timeoutMs: 1234 }))
    ).toBe(false);
  })
);
it("protects embedded native seed roots and excludes writable output copies", () => {
  const value = TrialEvaluatorCheck.make({
    ...check,
    compilerOverlay: O.some(TrialArtifact.make({ path: "/owned/compiler", digest: zero })),
    sparseSystem: TrialInputInventory.make({ ...inventory, root: "/owned/system" }),
    nativeRuntime: TrialNativeYeetRuntime.make({
      ...runtime,
      nix: TrialInputInventory.make({ ...inventory, root: "/owned/nix" }),
      oci: TrialInputInventory.make({ ...inventory, root: "/owned/oci" }),
    }),
    writableCacheTargets: ["/workspace/.cache"],
  });
  const roots = trialEvaluatorInputRoots(
    value,
    [{ source: "/owned/bun", target: "/runtime/bin/bun", access: "readonly", digest: zero }],
    [
      {
        inventory: TrialInputInventory.make({ ...inventory, root: "/owned/dependencies" }),
        target: "/workspace/node_modules",
      },
    ]
  );
  for (const root of [
    "/owned/nix",
    "/owned/oci",
    "/owned/system",
    "/owned/compiler",
    "/owned/bun",
    "/owned/dependencies",
    artifact.path,
  ])
    expect(roots).toContain(root);
  expect(roots).not.toContain("/workspace/.cache");
  expect(roots).not.toContain("/output/compiler-owned");
  const bindings = trialEvaluatorInventoryBindings(value, []);
  expect(trialEvaluatorInventoryBindings([])(value)).toEqual(bindings);
  for (const [root, target] of [
    ["/owned/nix", "/nix"],
    ["/owned/oci", "/runtime/oci"],
    ["/owned/system", "/runtime/system"],
    [value.input.root, "/sealed"],
  ])
    expect(A.some(bindings, (binding) => binding.inventory.root === root && binding.target === target)).toBe(true);
});

it.effect("binds every native capability, certificate, bootstrap and broker control in contract v2", () =>
  Effect.gen(function* () {
    const frozen = yield* trialCheckContractDigest(check);
    const changed = (value: TrialNativeYeetRuntime) =>
      trialCheckContractDigest(TrialEvaluatorCheck.make({ ...check, nativeRuntime: value }));
    for (const patch of [
      { bootstrap: [TrialBootstrapFile.make({ ...runtime.bootstrap[0], capability: O.none() })] },
      {
        bootstrap: [
          TrialBootstrapFile.make({
            ...runtime.bootstrap[0],
            capability: O.some("0100000280000000000000000000000000000000"),
          }),
        ],
      },
      { system: TrialInputInventory.make({ ...inventory, digest: one }) },
      { nix: TrialInputInventory.make({ ...inventory, digest: one }) },
      { oci: TrialInputInventory.make({ ...inventory, digest: one }) },
      { crun: TrialInputInventory.make({ ...inventory, digest: one }) },
      { bunInstallCache: TrialInputInventory.make({ ...inventory, digest: one }) },
      { certificateBundle: { ...artifact, digest: one } },
      {
        bootstrap: [
          TrialBootstrapFile.make({
            artifact,
            metadata: TrialInputMetadata.make({ mode: 0o100644, uid: 1000, gid: 1000 }),
          }),
        ],
      },
      { broker: TrialBrokerControl.make({ ...runtime.broker, policy: { ...artifact, digest: one } }) },
      { broker: TrialBrokerControl.make({ ...runtime.broker, relay: { ...artifact, digest: one } }) },
      { broker: TrialBrokerControl.make({ ...runtime.broker, program: { ...artifact, digest: one } }) },
      { broker: TrialBrokerControl.make({ ...runtime.broker, maxSeconds: 20 }) },
      { nixStorePaths: ["/nix/store/different"] },
      { image: `ghcr.io/google/osv-scanner-action@sha256:${one}` },
    ]) {
      const merged = { ...runtime, ...patch };
      if (!A.isReadonlyArrayNonEmpty(merged.bootstrap) || !A.isReadonlyArrayNonEmpty(merged.nixStorePaths))
        return yield* Effect.die("fixture mutation must remain nonempty");
      expect(
        yield* changed(
          TrialNativeYeetRuntime.make({ ...merged, bootstrap: merged.bootstrap, nixStorePaths: merged.nixStorePaths })
        )
      ).not.toBe(frozen);
    }
    const { nativeRuntime: _native, ...legacy } = check;
    expect(yield* trialCheckContractDigest(TrialEvaluatorCheck.make(legacy))).not.toBe(frozen);
  })
);

const makeNativeFixture = Effect.fn(function* () {
  const fs = yield* FileSystem.FileSystem;
  const home = yield* Config.String("HOME");
  const cache = `${home}/.cache/beep/runner-tests`;
  yield* fs.makeDirectory(cache, { recursive: true });
  const root = yield* fs.makeTempDirectoryScoped({ directory: cache });
  const inputs = `${root}/inputs`;
  yield* fs.makeDirectory(inputs);
  yield* fs.makeDirectory(`${inputs}/etc`);
  yield* fs.writeFileString(`${inputs}/etc/passwd`, "fixture:x:0:0:fixture:/output/native-home:/bin/sh\n");
  yield* fs.writeFileString(`${inputs}/etc/group`, "fixture:x:0:\n");
  yield* fs.writeFileString(`${inputs}/etc/nsswitch.conf`, "passwd: files\ngroup: files\n");
  for (const dir of ["usr/bin", "var/nix", "store", "bin", "lib", "lib64"])
    yield* fs.makeDirectory(`${inputs}/${dir}`, { recursive: true });
  const binaries = ["/usr/bin/git"];
  const libraries = yield* Effect.forEach(binaries, (binary) =>
    runCaptured({
      command: "/usr/bin/ldd",
      args: [binary],
      source: "stdout",
      timeout: "10 seconds",
    })
  );
  const paths = A.dedupe([
    ...binaries,
    ...A.flatMap(libraries, (result) =>
      A.flatMap(Str.split("\n")(result.output), (line) =>
        O.toArray(O.map(Str.match(/\/[^\s]+/)(line), (match) => match[0]))
      )
    ),
  ]);
  for (const original of paths) {
    const projected = Str.startsWith("/lib")(original) ? yield* fs.realPath(original) : original;
    const destination = `${inputs}${projected}`;
    const parent = (yield* Path.Path).dirname(destination);
    yield* fs.makeDirectory(parent, { recursive: true });
    yield* fs.copyFile(original, destination);
  }
  yield* fs.copyFile("/usr/lib/ld-linux-x86-64.so.2", `${inputs}/lib64/ld-linux-x86-64.so.2`);
  const sealed = yield* captureTrialInventory(inputs);
  const pythonResolution = yield* runCaptured({
    command: "python3",
    args: ["-I", "-B", "-c", "import os,sys; print(os.path.realpath(sys.executable))"],
    extendEnv: true,
    env: { PYTHONDONTWRITEBYTECODE: "1" },
    source: "stdout",
    timeout: "10 seconds",
  });
  expect(pythonResolution.exitCode).toBe(0);
  expect(pythonResolution.truncated).toBe(false);
  const python = yield* fs.realPath(Str.trim(pythonResolution.output));
  const bootstrap = [];
  for (const path of [
    "/usr/bin/podman",
    "/usr/bin/bwrap",
    "/usr/bin/newuidmap",
    "/usr/bin/newgidmap",
    "/usr/bin/runc",
    "/usr/bin/stat",
    python,
  ]) {
    const info = yield* fs.stat(path);
    const capability =
      path === "/usr/bin/newuidmap" || path === "/usr/bin/newgidmap"
        ? yield* runCaptured({
            command: python,
            args: [
              "-I",
              "-B",
              "-c",
              "import errno,json,os,sys\ntry: value=os.getxattr(sys.argv[1],'security.capability').hex()\nexcept OSError as error:\n if error.errno!=errno.ENODATA: raise\n value=None\nprint(json.dumps(value))",
              path,
            ],
            env: { PYTHONDONTWRITEBYTECODE: "1" },
            extendEnv: false,
            source: "stdout",
            timeout: "10 seconds",
          }).pipe(
            Effect.flatMap((result) => S.decodeEffect(S.fromJsonString(TrialBootstrapFile.Capability))(result.output))
          )
        : undefined;
    bootstrap.push(
      TrialBootstrapFile.make({
        artifact: yield* trialArtifact(path),
        capability,
        metadata: TrialInputMetadata.make({
          mode: info.mode,
          uid: O.getOrElse(info.uid, () => 0),
          gid: O.getOrElse(info.gid, () => 0),
        }),
      })
    );
  }
  const certificate = `${root}/certificate`;
  const program = `${root}/program`;
  const policy = `${root}/policy`;
  yield* fs.writeFileString(certificate, "certificate");
  yield* fs.writeFileString(program, "program");
  yield* fs.writeFileString(
    policy,
    yield* S.encodeEffect(S.fromJsonString(S.Unknown))({
      "api.osv.dev:443": {},
      "registry.npmjs.org:443": {},
    })
  );
  const asset = yield* trialArtifact(program);
  if (!A.isArrayNonEmpty(bootstrap)) return yield* Effect.die("fixture bootstrap must be nonempty");
  const native = TrialNativeYeetRuntime.make({
    ...runtime,
    system: sealed,
    nix: sealed,
    oci: sealed,
    crun: sealed,
    bunInstallCache: sealed,
    bootstrap,
    certificateBundle: yield* trialArtifact(certificate),
    broker: TrialBrokerControl.make({
      ...runtime.broker,
      program: asset,
      relay: asset,
      canaries: asset,
      policy: yield* trialArtifact(policy),
      interpreter: yield* trialArtifact(python),
    }),
  });
  return { fs, root, inputs, sealed, python, native, certificate, program };
});

layer(Layer.merge(NodeServices.layer, BunCrypto.layer), { excludeTestServices: true })(
  "native runtime metadata",
  (test) => {
    test.effect("requires one metadata-complete productive system and never falls back to host Git", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          expect(O.isNone(yield* trialPlanSystem({ networkAdmission: "blocked-until-broker" }))).toBe(true);
          expect(
            (yield* trialPlanSystem({ networkAdmission: "exact-authority-broker" }).pipe(Effect.result))._tag
          ).toBe("Failure");
          const root = yield* fs.makeTempDirectoryScoped();
          const systemRoot = `${root}/system`;
          yield* fs.makeDirectory(`${systemRoot}/usr/bin`, { recursive: true });
          yield* fs.makeDirectory(`${systemRoot}/usr/lib`, { recursive: true });
          for (const [name, target] of A.make(
            Tuple.make("bin", "usr/bin"),
            Tuple.make("lib", "usr/lib"),
            Tuple.make("lib64", "usr/lib")
          ))
            yield* fs.symlink(target, `${systemRoot}/${name}`);
          yield* fs.makeDirectory(`${systemRoot}/etc`);
          for (const [name, contents] of A.make(
            Tuple.make("passwd", "fixture:x:0:0:fixture:/output/native-home:/bin/sh\n"),
            Tuple.make("group", "fixture:x:0:\n"),
            Tuple.make("nsswitch.conf", "passwd: files\ngroup: files\n")
          ))
            yield* fs.writeFileString(`${systemRoot}/etc/${name}`, contents);
          const system = yield* captureTrialInventory(systemRoot);
          const closure = { inventory: system, target: "/runtime/system" };
          expect(
            O.isSome(yield* trialPlanSystem({ networkAdmission: "exact-authority-broker", runtimeClosures: [closure] }))
          ).toBe(true);
          expect(
            (yield* trialPlanSystem({
              networkAdmission: "exact-authority-broker",
              runtimeClosures: [closure, closure],
            }).pipe(Effect.result))._tag
          ).toBe("Failure");
          expect(yield* trialSystemBindings(system, true)).toEqual([
            "--ro-bind",
            `${systemRoot}/usr`,
            "/usr",
            "--ro-bind",
            `${systemRoot}/bin`,
            "/bin",
            "--ro-bind",
            `${systemRoot}/lib`,
            "/lib",
            "--ro-bind",
            `${systemRoot}/lib64`,
            "/lib64",
            "--ro-bind",
            `${systemRoot}/etc/passwd`,
            "/etc/passwd",
            "--ro-bind",
            `${systemRoot}/etc/group`,
            "/etc/group",
            "--ro-bind",
            `${systemRoot}/etc/nsswitch.conf`,
            "/etc/nsswitch.conf",
          ]);
          expect((yield* trialSystemBindings(undefined, true).pipe(Effect.result))._tag).toBe("Failure");
          const legacy = TrialInputInventory.make({ ...system, metadata: undefined });
          const legacyBound = TrialInputInventory.make({ ...legacy, digest: yield* trialInventoryDigest(legacy) });
          expect(yield* S.decodeEffect(TrialInputInventory)(legacyBound)).toEqual(legacyBound);
          expect((yield* trialSystemBindings(legacyBound).pipe(Effect.result))._tag).toBe("Failure");
          expect((yield* trialSystemBindings(legacyBound, true).pipe(Effect.result))._tag).toBe("Failure");
          expect(
            (yield* trialSystemBindings(TrialInputInventory.make({ ...system, metadata: {} }), true).pipe(
              Effect.result
            ))._tag
          ).toBe("Failure");
          const workspace = `${root}/workspace`;
          const receipts = `${root}/receipts`;
          yield* fs.makeDirectory(workspace);
          yield* fs.makeDirectory(receipts);
          const init = yield* runCaptured({
            command: "/usr/bin/git",
            args: ["-C", workspace, "init"],
            env: {},
            extendEnv: false,
            bound: repoRunOutputBound,
          });
          expect(init.exitCode).toBe(0);
          expect(
            (yield* retainTrialCandidate(workspace, Str.repeat(40)("0"), receipts, O.none(), undefined, true).pipe(
              Effect.result
            ))._tag
          ).toBe("Failure");
          expect(
            (yield* retainTrialCandidate(workspace, Str.repeat(40)("0"), receipts, O.none(), system, true).pipe(
              Effect.result
            ))._tag
          ).toBe("Failure");
          expect(yield* fs.exists(`${receipts}/candidate.bundle`)).toBe(false);
        })
      )
    );
    test.effect("initializes a private cache, preserves literal aliases and binds changed output snapshots", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const root = yield* fs.makeTempDirectoryScoped();
          const seedRoot = `${root}/seed`;
          const outputRoot = `${root}/output`;
          yield* fs.makeDirectory(seedRoot);
          yield* fs.makeDirectory(outputRoot);
          yield* fs.writeFileString(`${seedRoot}/package`, "frozen", { mode: 0o600 });
          yield* fs.symlink("package", `${seedRoot}/alias`);
          const seed = yield* captureTrialInventory(seedRoot);
          const receipt = yield* prepareTrialBunCache(seed, outputRoot);
          const before = yield* S.decodeEffect(S.fromJsonString(TrialInputInventory))(
            yield* fs.readFileString(receipt.path)
          );
          expect(before.root).toBe(`${outputRoot}/bun-cache`);
          expect(before.digest).toBe(seed.digest);
          expect(yield* fs.readLink(`${before.root}/alias`)).toBe("package");
          yield* validateTrialInventory(before, "/output/bun-cache");
          yield* fs.writeFileString(`${before.root}/package`, "mutable");
          const after = yield* captureTrialInventory(before.root);
          expect(after.digest).not.toBe(before.digest);
          expect(yield* trialInventoryDigest(after)).toBe(after.digest);
          const afterPath = `${outputRoot}/bun-cache-after.json`;
          const afterText = yield* S.encodeEffect(S.fromJsonString(TrialInputInventory))(after);
          yield* fs.writeFileString(afterPath, afterText);
          const evidence = TrialNativeRuntimeEvidence.make({
            schemaVersion: "agent-trial-native-runtime-evidence/v1",
            runtimeDigest: zero,
            manifestBefore: zero,
            manifestAfter: zero,
            preserved: true,
            systemDigest: zero,
            nixDigest: zero,
            ociDigest: zero,
            image: runtime.image,
            bunCacheSeedDigest: seed.digest,
            bunCacheBefore: receipt,
            bunCacheAfter: yield* trialArtifact(afterPath),
            bunCacheTarget: "/output/bun-cache",
          });
          const env = { BUN_INSTALL_CACHE_DIR: "/output/bun-cache", BUN_TMPDIR: "/tmp" };
          expect(yield* validateTrialBunCacheEvidence(seed, evidence, outputRoot, env)).toBe(true);
          expect(
            yield* validateTrialBunCacheEvidence(
              seed,
              TrialNativeRuntimeEvidence.make({ ...evidence, bunCacheAfter: undefined }),
              outputRoot,
              env
            )
          ).toBe(false);
          expect(
            yield* validateTrialBunCacheEvidence(seed, evidence, outputRoot, { ...env, BUN_TMPDIR: "/host" })
          ).toBe(false);
          yield* fs.writeFileString(afterPath, `${afterText} `);
          expect(yield* validateTrialBunCacheEvidence(seed, evidence, outputRoot, env)).toBe(false);
          yield* fs.writeFileString(afterPath, afterText);
          const duplicate = yield* prepareTrialBunCache(seed, outputRoot).pipe(Effect.result);
          expect(duplicate._tag).toBe("Failure");
          yield* fs.remove(before.root, { recursive: true });
          expect(yield* validateTrialBunCacheEvidence(seed, evidence, outputRoot, env)).toBe(true);
          yield* fs.remove(afterPath);
          expect((yield* validateTrialBunCacheEvidence(seed, evidence, outputRoot, env).pipe(Effect.result))._tag).toBe(
            "Failure"
          );

          yield* validateTrialInventory(seed, "/runtime/bun-cache");

          const output3 = `${root}/output3`;
          yield* fs.makeDirectory(output3);
          const poisoned = yield* prepareTrialBunCache(seed, output3).pipe(
            Effect.provideService(FileSystem.FileSystem, {
              ...fs,
              copy: (from, to, options) =>
                fs.copy(from, to, options).pipe(Effect.andThen(fs.writeFileString(`${to}/package`, "copy drift"))),
            }),
            Effect.tap(() => fs.writeFileString(`${output3}/command-started`, "unexpected")),
            Effect.result
          );
          expect(poisoned._tag).toBe("Failure");
          if (poisoned._tag === "Failure")
            expect(poisoned.failure.message).toBe("Initial owned Bun cache differs from immutable seed");
          expect(yield* fs.exists(`${output3}/command-started`)).toBe(false);
          yield* fs.writeFileString(`${seedRoot}/package`, "drift");
          const output2 = `${root}/output2`;
          yield* fs.makeDirectory(output2);
          const drift = yield* prepareTrialBunCache(seed, output2).pipe(Effect.result);
          expect(drift._tag).toBe("Failure");
          expect(yield* fs.exists(`${output2}/bun-cache`)).toBe(false);
        })
      )
    );
    test.effect("batches complete ignored target coverage with duplicates and scalar negation parity", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const root = yield* fs.makeTempDirectoryScoped();
          const workspace = `${root}/workspace`;
          yield* fs.makeDirectory(workspace);
          const git = Effect.fn(function* (args: ReadonlyArray<string>) {
            const result = yield* runCaptured({
              command: "/usr/bin/git",
              args: ["-c", "core.hooksPath=/dev/null", "-C", workspace, ...args],
              env: {},
              extendEnv: false,
              bound: repoRunOutputBound,
            });
            expect(result.exitCode).toBe(0);
          });
          yield* git(["init"]);
          yield* fs.writeFileString(
            `${workspace}/.gitignore`,
            "node_modules/\ndist/\n!packages/unignored/dist/\n\\!literal/\n"
          );
          for (const root of [
            "infra",
            "infra/ci-runners/sdks/ghaRunners",
            "infra/lambda/turbo-cache",
            "scratchpad",
            "tools/tsgo-shim",
          ]) {
            expect(yield* trialMountGuardPaths("writable", [`/workspace/${root}/dist`])).toEqual([`${root}/dist`]);
          }
          expect(yield* trialMountGuardPaths("writable", ["/workspace/dist"])).toEqual(["dist"]);
          const exactOutputs = [
            "/workspace/apps/professional-desktop/src-tauri/binaries",
            "/workspace/apps/storybook/storybook-static",
          ];
          expect(yield* trialMountGuardPaths("writable", exactOutputs)).toEqual([
            "apps/professional-desktop/src-tauri/binaries",
            "apps/storybook/storybook-static",
          ]);
          for (const target of [
            "/workspace/apps/other/src-tauri/binaries",
            "/workspace/apps/professional-desktop/src-tauri/private",
            "/workspace/apps/professional-desktop/src-tauri/binaries/source",
            "/workspace/apps/todox/storybook-static",
            "/workspace/apps/storybook/storybook-static/source",
          ]) {
            expect((yield* trialMountGuardPaths("writable", [target]).pipe(Effect.result))._tag).toBe("Failure");
          }
          const nonIgnoredOutput = `${root}/exact-output-not-ignored`;
          yield* fs.makeDirectory(nonIgnoredOutput);
          expect(
            (yield* collectTrialMountGuard(workspace, nonIgnoredOutput, "writable", exactOutputs).pipe(Effect.result))
              ._tag
          ).toBe("Failure");
          const exactOutputProof = `${root}/exact-output`;
          yield* fs.makeDirectory(exactOutputProof);
          yield* fs.writeFileString(
            `${workspace}/.gitignore`,
            "node_modules/\ndist/\n!packages/unignored/dist/\n\\!literal/\napps/professional-desktop/src-tauri/binaries/\napps/storybook/storybook-static/\n"
          );
          expect(
            yield* validateTrialMountGuardEvidence(
              yield* collectTrialMountGuard(workspace, exactOutputProof, "writable", exactOutputs),
              "writable",
              exactOutputs,
              exactOutputProof
            )
          ).toBe(true);

          for (const target of [
            "/workspace/infra/private/dist",
            "/workspace/tools/tsgo-shim-private/dist",
            "/workspace/scratchpad/source",
            "/workspace/infra/ci-runners/sdks/other/dist",
          ]) {
            expect((yield* trialMountGuardPaths("writable", [target]).pipe(Effect.result))._tag).toBe("Failure");
          }
          yield* fs.makeDirectory(`${workspace}/apps/professional-desktop/src-tauri/binaries`, { recursive: true });
          yield* fs.writeFileString(`${workspace}/apps/professional-desktop/src-tauri/binaries/owned-source`, "source");
          yield* git(["add", "--force", "apps/professional-desktop/src-tauri/binaries/owned-source"]);
          const exactTrackedOutput = `${root}/exact-output-tracked`;
          yield* fs.makeDirectory(exactTrackedOutput);
          expect(
            (yield* collectTrialMountGuard(workspace, exactTrackedOutput, "writable", exactOutputs).pipe(Effect.result))
              ._tag
          ).toBe("Failure");
          expect(yield* fs.exists(`${exactTrackedOutput}/mount-guard-writable.ignored.nul`)).toBe(false);
          const goodTargets = [
            "/workspace/node_modules",
            "/workspace/packages/!literal/node_modules",
            "/workspace/node_modules",
          ];
          const output = `${root}/good`;
          yield* fs.makeDirectory(output);
          const evidence = yield* collectTrialMountGuard(workspace, output, "vendor", goodTargets);
          expect(yield* validateTrialMountGuardEvidence(evidence, "vendor", goodTargets, output)).toBe(true);
          const record = yield* S.decodeEffect(S.fromJsonString(TrialMountGuardEvidence))(
            yield* fs.readFileString(evidence.path)
          );
          expect(record.queriesIssued).toBe(2);
          expect(record.probePaths.length).toBe(3);
          const escapedScalar = yield* inspectTrialGit(workspace, [
            "check-ignore",
            "--quiet",
            "--no-index",
            "packages/!literal/node_modules/.runner-input-probe",
          ]);
          expect(escapedScalar.exitCode).toBe(0);
          const raw = yield* fs.readFileString(record.ignoredStdout.path);
          expect(yield* validateTrialIgnoreCensus(raw, record.probePaths)).toBe(true);
          expect(yield* validateTrialIgnoreCensus(Str.slice(0, -1)(raw), record.probePaths)).toBe(false);
          expect(yield* validateTrialIgnoreCensus(raw, A.append(record.probePaths, "extra/.probe"))).toBe(false);
          yield* fs.writeFileString(record.ignoredStdout.path, `${raw} `);
          expect(yield* validateTrialMountGuardEvidence(evidence, "vendor", goodTargets, output)).toBe(false);
          yield* fs.writeFileString(record.ignoredStdout.path, raw);
          const empty = `${root}/empty`;
          yield* fs.makeDirectory(empty);
          const noQueries = yield* collectTrialMountGuard("/nonexistent", empty, "vendor", []);
          const emptyRecord = yield* S.decodeEffect(S.fromJsonString(TrialMountGuardEvidence))(
            yield* fs.readFileString(noQueries.path)
          );
          expect(emptyRecord.queriesIssued).toBe(0);
          let badIndex = 0;
          for (const target of [
            "/workspace/packages/unignored/dist",
            "/workspace/packages/absent/build",
            "/workspace/packages/../escape/dist",
            "/workspace/packages/bad\0/dist",
          ]) {
            const out = `${root}/bad-${badIndex++}`;
            yield* fs.makeDirectory(out);
            const result = yield* collectTrialMountGuard(workspace, out, "writable", [target]).pipe(Effect.result);
            expect(result._tag).toBe("Failure");
          }
          const negated = yield* inspectTrialGit(workspace, [
            "check-ignore",
            "--quiet",
            "--no-index",
            "packages/unignored/dist/.runner-output-probe",
          ]);
          expect(negated.exitCode).toBe(1);
          yield* fs.makeDirectory(`${workspace}/packages/tracked/dist`, { recursive: true });
          yield* fs.writeFileString(`${workspace}/packages/tracked/dist/source`, "source");
          yield* git(["add", "--force", "packages/tracked/dist/source"]);
          const trackedOutput = `${root}/tracked`;
          yield* fs.makeDirectory(trackedOutput);
          expect(
            (yield* collectTrialMountGuard(workspace, trackedOutput, "writable", [
              "/workspace/packages/tracked/dist",
            ]).pipe(Effect.result))._tag
          ).toBe("Failure");
          expect(yield* fs.exists(`${trackedOutput}/mount-guard-writable.ignored.nul`)).toBe(false);
        })
      )
    );
    test.effect("spools a real tracked index beyond diagnostic bounds without dropping its final root", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const root = yield* fs.makeTempDirectoryScoped();
          const workspace = `${root}/workspace`;
          const output = `${root}/output`;
          yield* fs.makeDirectory(workspace);
          yield* fs.makeDirectory(output);
          const git = Effect.fn(function* (args: ReadonlyArray<string>) {
            const result = yield* runCaptured({
              command: "/usr/bin/git",
              args: ["-c", "core.hooksPath=/dev/null", "-C", workspace, ...args],
              env: {},
              extendEnv: false,
              bound: repoRunOutputBound,
            });
            expect(result.exitCode).toBe(0);
            return Str.trim(result.output);
          });
          yield* git(["init"]);
          const blob = yield* git(["hash-object", "-w", "--stdin"]);
          const paths = [
            ...A.map(A.range(0, 3500), (index) => `early-root/${index}-${Str.repeat(180)("x")}.ts`),
            "late-root/last.ts",
          ];
          const indexPath = `${root}/index-info`;
          yield* fs.writeFileString(
            indexPath,
            A.join(
              A.map(paths, (name) => `100644 ${blob}\t${name}\n`),
              ""
            )
          );
          const loaded = yield* runCaptured({
            command: "/bin/sh",
            args: ["-c", 'exec git -C "$1" update-index --index-info < "$2"', "fixture", workspace, indexPath],
            env: { PATH: "/usr/bin:/bin", GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null" },
            extendEnv: false,
            bound: repoRunOutputBound,
          });
          expect(loaded.exitCode).toBe(0);
          const capped = yield* inspectTrialGit(workspace, ["ls-files", "-z"]);
          expect(capped.exitCode).toBe(0);
          expect(capped.truncated).toBe(true);
          const artifact = yield* collectTrialTrackedInventory(workspace, output);
          const raw = yield* fs.readFileString(artifact.path);
          expect(Str.length(raw)).toBeGreaterThan(repoRunOutputBound.maxChars);
          expect(A.dropRight(Str.split("\0")(raw), 1)).toEqual(A.sort(paths, Str.Order));
          expect(yield* parseTrialTrackedRoots(raw)).toEqual(["early-root", "late-root"]);
          const duplicate = yield* collectTrialTrackedInventory(workspace, output).pipe(Effect.result);
          expect(duplicate._tag).toBe("Failure");
          for (const malformed of [
            "",
            "missing-terminator",
            "\0",
            "ok\0\0",
            "/absolute\0",
            "../escape\0",
            "a/../escape\0",
            ".\0",
            "a//b\0",
          ])
            expect((yield* parseTrialTrackedRoots(malformed).pipe(Effect.result))._tag).toBe("Failure");
          const empty = `${root}/not-a-repository`;
          const failedOutput = `${root}/failed`;
          yield* fs.makeDirectory(empty);
          yield* fs.makeDirectory(failedOutput);
          const failed = yield* collectTrialTrackedInventory(empty, failedOutput).pipe(Effect.result);
          expect(failed._tag).toBe("Failure");
          expect(yield* fs.exists(`${failedOutput}/tracked-roots.nul`)).toBe(true);
          expect(yield* fs.exists(`${failedOutput}/tracked-roots.stderr`)).toBe(true);
        })
      )
    );
    test.effect("restores the frozen OCI musl link inside its copied image root", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const root = yield* fs.makeTempDirectoryScoped();
          const source = `${root}/image`;
          const copy = `${root}/copy`;
          yield* fs.makeDirectory(`${source}/lib`, { recursive: true });
          yield* fs.writeFileString(`${source}/lib/ld-musl-x86_64.so.1`, "frozen ELF fixture");
          yield* fs.symlink("ld-musl-x86_64.so.1", `${source}/lib/libc.musl-x86_64.so.1`);
          const inventory = yield* captureTrialInventory(source);
          yield* fs.copy(source, copy);
          expect(yield* fs.readLink(`${copy}/lib/libc.musl-x86_64.so.1`)).toBe(`${source}/lib/ld-musl-x86_64.so.1`);
          yield* restoreTrialInventoryLinks(inventory, copy, "Copied OCI image link is missing");
          expect(yield* fs.readLink(`${copy}/lib/libc.musl-x86_64.so.1`)).toBe("ld-musl-x86_64.so.1");
          expect(yield* fs.realPath(`${copy}/lib/libc.musl-x86_64.so.1`)).toBe(`${copy}/lib/ld-musl-x86_64.so.1`);
          yield* validateTrialInventory(TrialInputInventory.make({ ...inventory, root: copy }), "/runtime/oci");
          yield* validateTrialInventory(inventory, "/runtime/oci");
          const forbidden = yield* restoreTrialInventoryLinks(inventory, source, "missing").pipe(Effect.result);
          expect(forbidden._tag).toBe("Failure");
        })
      )
    );
    test.effect("keeps host cache aliases rejected under both explicit cache targets", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const root = yield* fs.makeTempDirectoryScoped();
          yield* fs.symlink("/home/host/cache/package", `${root}/alias`);
          const input = yield* captureTrialInventory(root);
          for (const target of ["/runtime/bun-cache", "/output/bun-cache"]) {
            const result = yield* validateTrialInventory(input, target).pipe(Effect.result);
            expect(result._tag).toBe("Failure");
            if (result._tag === "Failure")
              expect(result.failure.message).toBe("Sealed link differs or escapes evaluator namespace");
          }
        })
      )
    );
    test.effect("admits only the two frozen infra vendor roots", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const root = yield* fs.makeTempDirectoryScoped();
          const workspace = `${root}/workspace`;
          const inputs = `${root}/inputs`;
          const dependencies = `${root}/dependencies`;
          for (const path of [workspace, inputs, dependencies]) yield* fs.makeDirectory(path);
          yield* fs.writeFileString(`${workspace}/.gitignore`, "node_modules/\n");
          const git = Effect.fn(function* (args: ReadonlyArray<string>) {
            const result = yield* runCaptured({
              command: "/usr/bin/git",
              args: [
                "-c",
                "core.hooksPath=/dev/null",
                "-c",
                "user.name=Runtime fixture",
                "-c",
                "user.email=fixture@example.invalid",
                "-C",
                workspace,
                ...args,
              ],
              env: {},
              extendEnv: false,
              bound: repoRunOutputBound,
            });
            expect(result.exitCode).toBe(0);
          });
          yield* git(["init"]);
          yield* git(["add", ".gitignore"]);
          yield* git(["commit", "-m", "fixture"]);
          const empty = { files: {}, symlinks: {} };
          const digest = yield* hashPublicTextSha256(yield* S.encodeEffect(S.fromJsonString(S.Unknown))(empty));
          const input = TrialInputInventory.make({ root: inputs, digest, ...empty });
          const inventory = TrialInputInventory.make({ root: dependencies, digest, ...empty });
          const seed = `${root}/seed`;
          yield* fs.writeFileString(seed, "seed");
          const artifact = yield* trialArtifact(seed);
          const receipt = `${root}/source.json`;
          yield* fs.writeFileString(
            receipt,
            yield* TrialCommittedSourceJson.encode(
              TrialCommittedSource.make({
                schemaVersion: "agent-trial-committed-source/v2",
                gitRefPolicy: "owned-base-refs-readonly/v1",
                workspace,
                baseCommit: Str.repeat(40)("0"),
                finalCommit: Str.repeat(40)("0"),
                tree: Str.repeat(40)("0"),
                bundle: artifact,
                baseBundle: O.none(),
                sourceArchive: artifact,
              })
            )
          );
          const source = yield* trialArtifact(receipt);
          const value = TrialEvaluatorCheck.make({
            ...check,
            kind: "typecheck",
            input,
            nativeRuntime: undefined,
            commandTemplate: ["/bin/true"],
          });
          let index = 0;
          for (const target of [
            "/workspace/infra/node_modules",
            "/workspace/infra/lambda/turbo-cache/node_modules",
            "/workspace/infra/lambda/private/node_modules",
            "/workspace/infra/.hidden/node_modules",
            "/workspace/source",
          ]) {
            const result = yield* executeTrialCheck(source, value, [], `${root}/output-${index++}`, [
              { inventory, target },
            ]).pipe(Effect.result);
            expect(result._tag).toBe("Failure");
            if (result._tag === "Failure")
              expect(result.failure.message).toBe(
                index <= 2
                  ? "Evaluator committed source changed before check"
                  : "Runtime projection target is not a vendor dependency root"
              );
          }
          const tracked = `${workspace}/infra/node_modules/tracked`;
          yield* fs.writeFileString(tracked, "tracked source");
          yield* git(["add", "--force", "infra/node_modules/tracked"]);
          const masked = yield* executeTrialCheck(source, value, [], `${root}/output-mask`, [
            { inventory, target: "/workspace/infra/node_modules" },
          ]).pipe(Effect.result);
          expect(masked._tag).toBe("Failure");
          if (masked._tag === "Failure")
            expect(masked.failure.message).toBe("Mount guard targets would cover tracked source");
        })
      )
    );
    test.effect("does not traverse declared directory symlinks", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const root = yield* fs.makeTempDirectoryScoped();
          yield* fs.makeDirectory(`${root}/real`);
          yield* fs.writeFileString(`${root}/real/file`, "fixture");
          yield* fs.symlink("real", `${root}/alias`);
          const files = { "real/file": yield* hashPublicTextSha256("fixture") };
          const symlinks = { alias: "real" };
          const directories = ["real"];
          const digest = yield* hashPublicTextSha256(
            yield* S.encodeEffect(S.fromJsonString(S.Unknown))({ files, symlinks, directories })
          );
          yield* validateTrialInventory(TrialInputInventory.make({ root, digest, files, symlinks, directories }));
          yield* fs.writeFileString(`${root}/real/unlisted`, "unlisted");
          const failure = yield* validateTrialInventory(
            TrialInputInventory.make({ root, digest, files, symlinks, directories })
          ).pipe(Effect.result);
          expect(failure._tag).toBe("Failure");
        })
      )
    );
    test.effect(
      "retains drained capture and refuses evidence publication after native postvalidation fails",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, root, native, python, certificate, program } = yield* makeNativeFixture();
            const workspace = `${root}/source`;
            yield* fs.makeDirectory(workspace);
            yield* fs.writeFileString(`${workspace}/package.json`, "{}\n");
            yield* fs.writeFileString(`${workspace}/.gitignore`, ".beep/\n");
            const git = Effect.fn(function* (args: ReadonlyArray<string>) {
              const result = yield* runCaptured({
                command: "/usr/bin/git",
                args: [
                  "-c",
                  "core.hooksPath=/dev/null",
                  "-c",
                  "user.name=Fixture",
                  "-c",
                  "user.email=fixture@localhost",
                  ...args,
                ],
                cwd: workspace,
                source: "stdout",
                timeout: "10 seconds",
              });
              expect(result.exitCode).toBe(0);
              return Str.trim(result.output);
            });
            yield* git(["init"]);
            yield* git(["add", "."]);
            yield* git(["commit", "-m", "fixture"]);
            const commit = yield* git(["rev-parse", "HEAD"]);
            yield* git(["update-ref", "refs/remotes/origin/main", commit]);
            yield* fs.writeFileString(
              `${workspace}/.git/packed-refs`,
              "# pack-refs with: peeled fully-peeled sorted\n"
            );
            yield* fs.writeFileString(
              program,
              "import argparse,socket\np=argparse.ArgumentParser()\np.add_argument('--socket');p.add_argument('--policy');p.add_argument('--events');p.add_argument('--max-seconds');a=p.parse_args()\ns=socket.socket(socket.AF_UNIX);s.bind(a.socket);s.listen()\nprint('ready',flush=True)\nwhile True:\n c,_=s.accept();c.recv(4096);c.sendall(b'HTTP/1.1 403 Forbidden\\r\\n\\r\\n');c.close()\n"
            );
            const brokerArtifact = yield* trialArtifact(program);
            const prepared = TrialNativeYeetRuntime.make({
              ...native,
              broker: TrialBrokerControl.make({
                ...native.broker,
                program: brokerArtifact,
                relay: brokerArtifact,
                canaries: brokerArtifact,
              }),
            });
            const environmentTemplate = {
              HOME: "/output/native-home",
              BUN_INSTALL_CACHE_DIR: "/output/bun-cache",
              BUN_TMPDIR: "/tmp",
              XDG_RUNTIME_DIR: "/output/native-run",
              DOCKER_HOST: "unix:///output/docker.sock",
              CONTAINERS_CONF: "/output/containers.conf",
              CONTAINERS_STORAGE_CONF: "/usr/share/containers/storage.conf",
              HTTPS_PROXY: "http://127.0.0.1:18080",
              HTTP_PROXY: "http://127.0.0.1:18080",
              NO_PROXY: "localhost,127.0.0.1",
              SSL_CERT_FILE: "/runtime/certificates.pem",
              NIX_REMOTE: "local",
              NIX_CONFIG:
                "experimental-features = nix-command flakes\nsandbox = false\nsubstitute = false\nmax-jobs = 0\n",
            };
            const artifact = yield* trialArtifact(program);
            const source = TrialCommittedSource.make({
              schemaVersion: "agent-trial-committed-source/v2",
              gitRefPolicy: "owned-base-refs-readonly/v1",
              workspace,
              baseCommit: commit,
              finalCommit: commit,
              tree: yield* git(["rev-parse", "HEAD^{tree}"]),
              bundle: artifact,
              baseBundle: O.none(),
              sourceArchive: artifact,
            });
            const sourcePath = `${root}/source.json`;
            yield* fs.writeFileString(sourcePath, yield* TrialCommittedSourceJson.encode(source));
            yield* fs.makeDirectory(`${root}/sealed`);
            const ownedCheck = TrialEvaluatorCheck.make({
              ...check,
              nativeRuntime: prepared,
              input: yield* captureTrialInventory(`${root}/sealed`),
              environmentTemplate,
              reportRelativePath: O.some("unused.json"),
              timeoutMs: 10000,
            });
            const child = `${root}/child.py`;
            yield* fs.writeFileString(
              child,
              "import pathlib,sys\npathlib.Path(sys.argv[1]).write_text('changed')\nprint('drained stdout',flush=True)\nprint('drained stderr',file=sys.stderr,flush=True)\n"
            );
            const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
            let nativeCommands = 0;
            const controlled = ChildProcessSpawner.make((command) => {
              if (command._tag === "StandardCommand" && command.command === "/usr/bin/podman") {
                nativeCommands += 1;
                return spawner.spawn(ChildProcess.make(python, ["-I", "-B", child, certificate], command.options));
              }
              return spawner.spawn(command);
            });
            const output = `${root}/postvalidation-output`;
            const result = yield* executeTrialCheck(yield* trialArtifact(sourcePath), ownedCheck, [], output).pipe(
              Effect.provideService(ChildProcessSpawner.ChildProcessSpawner, controlled),
              Effect.result
            );
            expect(nativeCommands).toBe(1);
            expect(result._tag).toBe("Failure");
            if (result._tag === "Failure")
              expect(result.failure.message).toBe("Native advisory policy or certificate bytes differ");
            expect(yield* fs.readFileString(`${output}/stdout.log`)).toBe("drained stdout\n");
            expect(yield* fs.readFileString(`${output}/stderr.log`)).toBe("drained stderr\n");
            expect(yield* fs.exists(`${output}/native-runtime-evidence.json`)).toBe(false);
            expect(yield* fs.exists(`${output}/bun-cache-after.json`)).toBe(false);
            // This is a deterministic process-service fixture, never a native qualification claim.
            // Establish a valid acceptance-evidence baseline before changing only capability observations.
            yield* fs.writeFileString(certificate, "certificate");
            const census = yield* deriveTrialRuntimeControlsDigest([], []);
            const acceptedCheck = TrialEvaluatorCheck.make({
              ...ownedCheck,
              runtimeControlsDigest: census,
              commandTemplate: [
                "/runtime/bin/bun",
                "run",
                "beep",
                "yeet",
                "verify",
                "--tier",
                "full",
                "--base",
                commit,
                "--head",
                "HEAD",
              ],
              rootWritePolicy: "native-temp-only",
              reportRelativePath: O.none(),
              writableCacheTargets: ["/workspace/.beep"],
            });
            const verdict = YeetVerdict.make({
              schemaVersion: "yeet-verdict/v2",
              base: commit,
              branch: "detached",
              committed: false,
              createdAt: "2026-10-13T00:00:00.000Z",
              head: commit,
              lanes: [
                YeetVerdictLane.make({ id: "check", label: "check", phase: "full", status: "passed", exitCode: 0 }),
              ],
              message: "deterministic syscall fixture; unqualified",
              mode: "verify",
              outcome: "success",
              packetPaths: [],
              pushed: false,
              runId: "fixture",
              resolvedHeadSha: O.some(commit),
              proofTier: O.some("full"),
              diffFingerprint: O.some(yield* hashPublicTextSha256("\u0000\u0000")),
            });
            const verdictText = yield* YeetVerdictJson.encode(verdict);
            const literal = yield* S.encodeEffect(S.fromJsonString(S.String))(verdictText);
            const acceptedOutput = `${root}/accepted-output`;
            yield* fs.writeFileString(
              child,
              `import pathlib,sys\np=pathlib.Path('cache-0/yeet/runs/fixture/verdict.json');p.parent.mkdir(parents=True);p.write_text(${literal})\nprint('[yeet] verdict written to /workspace/.beep/yeet/runs/fixture/verdict.json',flush=True)\n`
            );
            const collected = yield* executeTrialCheck(
              yield* trialArtifact(sourcePath),
              acceptedCheck,
              [],
              acceptedOutput
            ).pipe(Effect.provideService(ChildProcessSpawner.ChildProcessSpawner, controlled));
            expect(collected.passed).toBe(true);
            const full = acceptedCheck;
            const task = TrialEvaluatorCheck.make({
              ...acceptedCheck,
              id: "task",
              kind: "framework",
              nativeRuntime: undefined,
              sparseSystem: prepared.system,
              rootWritePolicy: "readonly",
              reportRelativePath: O.some("unused.json"),
            });
            const spec = Effect.fn(function* (value: TrialEvaluatorCheck) {
              return {
                id: value.id,
                commandTemplate: value.commandTemplate,
                inputBundleDigest: value.input.digest,
                contractDigest: yield* trialCheckContractDigest(value),
              };
            });
            const plan = TrialPlan.make({
              schemaVersion: "agent-trial-plan/v1",
              runId: "fixture",
              attemptId: "capabilities",
              provider: "codex",
              model: "gpt-6.1-sol",
              effort: "medium",
              baseCommit: commit,
              sourceDigest: artifact.digest,
              taskDigest: zero,
              acceptanceDigest: zero,
              configDigest: zero,
              toolId: "none",
              selectedToolNames: [],
              requiredYeetLaneIds: ["check"],
              requiredTaskCheckIds: [task.id],
              requiredCheckSpecs: [yield* spec(task)],
              fullYeetCheckSpec: yield* spec(full),
              sourceRepository: workspace,
              workspaceRoot: `${root}/arms`,
              receiptRoot: `${root}/receipts`,
              command: "/runtime/cli",
              commandDigest: zero,
              delegation: "disabled",
              networkAdmission: "blocked-until-broker",
              args: [],
              environment: {},
              mounts: [],
              promptPath: `${root}/prompt`,
              timeoutMs: 1000,
              isolationAttestationPath: `${root}/canaries`,
              isolationAttestationDigest: zero,
            });
            const persist = Effect.fn(function* (name: string, text: string) {
              const destination = `${root}/${name}`;
              yield* fs.writeFileString(destination, text, { flag: "wx", mode: 0o600 });
              return yield* trialArtifact(destination);
            });
            const planArtifact = yield* persist("plan.json", yield* TrialPlanJson.encode(plan));
            const attempt = TrialAttempt.make({
              schemaVersion: "agent-trial-attempt/v1",
              plan: planArtifact,
              sourceArchive: O.some(artifact),
              nativeInvocation: O.none(),
              runId: plan.runId,
              attemptId: plan.attemptId,
              baseCommit: commit,
              workspace,
              elapsedMs: 1,
              setupElapsedMs: O.some(0),
              codingElapsedMs: O.some(1),
              retentionElapsedMs: O.some(0),
              exitCode: O.some(0),
              stdout: collected.stdout,
              stderr: collected.stderr,
              diff: collected.stderr,
              bundle: O.some(artifact),
              indexStates: [],
              usage: yield* parseTrialUsage("codex", "", []),
              terminal: { status: "awaiting-proof", finalCommit: commit },
            });
            const retained = yield* persist("attempt.json", yield* TrialAttemptJson.encode(attempt));
            const request = TrialCollectRequest.make({
              schemaVersion: "agent-trial-collect-request/v1",
              attempt: retained,
              reconstructionRoot: `${root}/unused-reconstruction`,
              outputRoot: `${root}/unused-output`,
              runtime: [],
              projectedRuntime: [],
              checks: [task],
              yeet: full,
            });
            const requestArtifact = yield* persist("request.json", yield* TrialCollectRequestJson.encode(request));
            const taskContract = yield* persist(
              "task-contract.json",
              yield* S.encodeEffect(S.fromJsonString(TrialEvaluatorCheck))(task)
            );
            const taskOutcome = yield* persist(
              "task-outcome.json",
              yield* S.encodeEffect(S.fromJsonString(S.Unknown))({
                id: task.id,
                passed: true,
                collected: 1,
                passedCount: 1,
                failedCount: 0,
                collectionFailures: 0,
              })
            );
            // The task reporter is a synthetic fixture. All runtime native observations below are actual guarded reads.
            const taskResult = {
              ...collected,
              id: task.id,
              evaluatorContract: taskContract,
              parsedOutcome: taskOutcome,
              nativeRuntimeEvidence: undefined,
              collected: 1,
              passedCount: 1,
            };
            const observedEvidenceArtifact = collected.nativeRuntimeEvidence;
            if (observedEvidenceArtifact === undefined)
              return yield* Effect.die("fixture did not publish native evidence");
            const evidence = yield* S.decodeEffect(S.fromJsonString(TrialNativeRuntimeEvidence))(
              yield* fs.readFileString(observedEvidenceArtifact.path)
            );
            const observed = evidence.bootstrapCapabilitiesBefore;
            if (observed === undefined) return yield* Effect.die("fixture did not capture capabilities");
            const altered = yield* S.decodeEffect(TrialBootstrapFile.Capabilities)([
              {
                path: "/usr/bin/newuidmap",
                capability: O.isNone(observed[0].capability) ? "0100000280000000000000000000000000000000" : null,
              },
              { path: "/usr/bin/newgidmap", capability: O.getOrNull(observed[1].capability) },
            ]);
            const finalize = Effect.fn(function* (
              name: string,
              value: TrialNativeRuntimeEvidence,
              guard: O.Option<TrialArtifact> = O.fromUndefinedOr(collected.gitRefGuard),
              reconstruction: O.Option<TrialArtifact> = O.none()
            ) {
              const nativeEvidence = yield* persist(
                `${name}-native.json`,
                yield* S.encodeEffect(S.fromJsonString(TrialNativeRuntimeEvidence))(value)
              );
              if (!A.isReadonlyArrayNonEmpty(collected.resolvedArgv))
                return yield* Effect.die("fixture argv must be nonempty");
              const collection = TrialAcceptance.make({
                schemaVersion: "agent-trial-acceptance/v1",
                taskDigest: zero,
                acceptanceDigest: zero,
                finalCommit: commit,
                requiredChecks: [
                  {
                    ...collected,
                    namespaceBindings: { candidate: "/workspace", sealed: "/sealed", output: "/output" },
                    resolvedArgv: collected.resolvedArgv,
                    nativeRuntimeEvidence: nativeEvidence,
                    gitRefGuard: O.getOrUndefined(guard),
                  },
                ],
              });
              const acceptance = yield* persist(
                `${name}-collection.json`,
                yield* TrialAcceptanceJson.encode(collection)
              );
              if (collected.nativeReport === undefined) return yield* Effect.die("fixture report missing");
              const taskAcceptance = yield* persist(
                `${name}-task-acceptance.json`,
                yield* TrialAcceptanceJson.encode(
                  TrialAcceptance.make({
                    schemaVersion: "agent-trial-acceptance/v1",
                    taskDigest: zero,
                    acceptanceDigest: zero,
                    finalCommit: commit,
                    requiredChecks: [
                      {
                        ...taskResult,
                        gitRefGuard: O.getOrUndefined(guard),
                        resolvedArgv: collected.resolvedArgv,
                        namespaceBindings: { candidate: "/workspace", sealed: "/sealed", output: "/output" },
                      },
                    ],
                  })
                )
              );
              const proof = TrialProof.make({
                schemaVersion: "agent-trial-proof/v1",
                attempt: retained,
                finalCommit: commit,
                verdict: collected.nativeReport,
                acceptance: taskAcceptance,
                fullYeetCollection: acceptance,
                collectRequest: requestArtifact,
                reconstruction: O.getOrUndefined(reconstruction),
                requiredLaneIds: ["check"],
                yeetExitCode: 0,
              });
              const proofArtifact = yield* persist(`${name}-proof.json`, yield* TrialProofJson.encode(proof));
              const backend = yield* ChildProcessSpawner.ChildProcessSpawner;
              let capabilityReads = 0;
              const observing = ChildProcessSpawner.make((command) => {
                if (command._tag === "StandardCommand" && command.command === python && A.contains(command.args, "-c"))
                  capabilityReads += 1;
                return backend.spawn(command);
              });
              const result = yield* finalizeTrial(retained.path, proofArtifact.path).pipe(
                Effect.provideService(ChildProcessSpawner.ChildProcessSpawner, observing),
                Effect.result
              );
              if (result._tag === "Success") {
                const report = yield* TrialFinalizationJson.decode(yield* fs.readFileString(result.success));
                yield* fs.rename(result.success, `${root}/${name}-finalization.json`);
                return { result, report: O.some(report), capabilityReads };
              }
              return { result, report: O.none(), capabilityReads };
            });
            const baseline = yield* finalize("baseline", evidence);
            if (baseline.result._tag === "Failure") return yield* baseline.result.failure;
            expect(baseline.result._tag).toBe("Success");
            expect(baseline.capabilityReads).toBe(1);
            if (O.isSome(baseline.report)) {
              expect(baseline.report.value.failures).not.toContain("Task acceptance is missing, incomplete or failed");
              // Known synthetic capture/invocation/reconstruction provenance gates deliberately remain red.
              expect(baseline.report.value.failures).toEqual([
                "Native stream or process did not complete",
                "Trusted native invocation/config pin evidence is missing or inconsistent",
                "Fresh retained-commit reconstruction evidence is missing",
              ]);
              expect(O.isNone(baseline.report.value.benchmark)).toBe(true);
            }
            for (const [name, patch] of R.toEntries({
              "missing-before": { bootstrapCapabilitiesBefore: undefined },
              "missing-after": { bootstrapCapabilitiesAfter: undefined },
              "mutated-before": { bootstrapCapabilitiesBefore: altered },
              "mutated-after": { bootstrapCapabilitiesAfter: altered },
            })) {
              const value = TrialNativeRuntimeEvidence.make({
                ...evidence,
                ...patch,
              });
              const changed = yield* finalize(name, value);
              expect(changed.result._tag).toBe("Success");
              expect(changed.capabilityReads).toBe(1);
              if (O.isSome(changed.report)) {
                if (O.isSome(baseline.report))
                  expect(changed.report.value.failures).toEqual([
                    "Task acceptance is missing, incomplete or failed",
                    ...baseline.report.value.failures,
                  ]);
                expect(O.isNone(changed.report.value.benchmark)).toBe(true);
              }
            }
            if (O.isNone(baseline.report)) return yield* Effect.die("baseline report missing");
            const baselineFailures = baseline.report.value.failures;
            const acceptanceFailure = "Task acceptance is missing, incomplete or failed";
            const missingGuard = yield* finalize("ref-guard-missing", evidence, O.none());
            expect(missingGuard.result._tag).toBe("Success");
            expect(O.isSome(missingGuard.report)).toBe(true);
            if (O.isSome(missingGuard.report))
              expect(missingGuard.report.value.failures).toEqual([
                "Full Yeet invocation and contract collection are missing or differ",
                acceptanceFailure,
                ...baselineFailures,
              ]);
            const originalGuard = collected.gitRefGuard;
            if (originalGuard === undefined) return yield* Effect.die("fixture did not publish Git ref evidence");
            const guardText = yield* fs.readFileString(originalGuard.path);
            const guard = yield* S.decodeEffect(S.fromJsonString(TrialGitRefGuard))(guardText);
            expect(guard.before.refsDigest).not.toBe(zero);
            expect(originalGuard.digest).not.toBe(zero);
            for (const phase of A.make("before", "after", "both")) {
              const mutated = TrialGitRefGuard.make({
                ...guard,
                before: phase === "after" ? guard.before : { ...guard.before, refsDigest: zero },
                after: phase === "before" ? guard.after : { ...guard.after, refsDigest: zero },
              });
              yield* fs.writeFileString(
                originalGuard.path,
                yield* S.encodeEffect(S.fromJsonString(TrialGitRefGuard))(mutated)
              );
              const changed = yield* finalize(
                `ref-guard-rehashed-${phase}`,
                evidence,
                O.some(yield* trialArtifact(originalGuard.path))
              );
              expect(changed.result._tag).toBe("Success");
              expect(O.isSome(changed.report)).toBe(true);
              if (O.isSome(changed.report))
                expect(changed.report.value.failures).toEqual([acceptanceFailure, ...baselineFailures]);
              yield* fs.writeFileString(originalGuard.path, guardText);
            }
            const movedGuard = yield* persist("ref-guard-wrong-path.json", guardText);
            const moved = yield* finalize("ref-guard-wrong-path", evidence, O.some(movedGuard));
            expect(moved.result._tag).toBe("Success");
            expect(O.isSome(moved.report)).toBe(true);
            if (O.isSome(moved.report))
              expect(moved.report.value.failures).toEqual([acceptanceFailure, ...baselineFailures]);
            const wrongDigest = yield* finalize(
              "ref-guard-wrong-digest",
              evidence,
              O.some({ ...originalGuard, digest: zero })
            );
            expect(wrongDigest.result._tag).toBe("Failure");
            if (wrongDigest.result._tag === "Failure")
              expect(wrongDigest.result.failure.message).toBe("Retained artifact digest changed");
            expect(yield* fs.exists(`${root}/finalization.json`)).toBe(false);
            const directRef = `${workspace}/.git/refs/remotes/origin/main`;
            yield* fs.writeFileString(directRef, `${Str.repeat(40)("0")}\n`);
            expect(Str.trim((yield* inspectTrialGit(workspace, ["rev-parse", "HEAD"], prepared.system)).output)).toBe(
              commit
            );
            expect(
              Str.trim((yield* inspectTrialGit(workspace, ["status", "--porcelain"], prepared.system)).output)
            ).toBe("");
            const wrongCurrent = yield* finalize("ref-guard-current-wrong-base", evidence);
            expect(wrongCurrent.result._tag).toBe("Failure");
            if (wrongCurrent.result._tag === "Failure")
              expect(wrongCurrent.result.failure.message).toBe(
                "Trusted origin/main is not the direct unambiguous BASE"
              );
            expect(yield* fs.exists(`${root}/finalization.json`)).toBe(false);
            yield* fs.writeFileString(directRef, `${commit}\n`);
            const reconstructedWorkspace = `${root}/reconstructed-source`;
            yield* fs.makeDirectory(reconstructedWorkspace);
            for (const name of A.make(".git", ".gitignore", "package.json"))
              yield* fs.copy(`${workspace}/${name}`, `${reconstructedWorkspace}/${name}`);
            const reconstructedSource = TrialCommittedSource.make({ ...source, workspace: reconstructedWorkspace });
            const validSource = yield* persist(
              "ref-valid-reconstruction.json",
              yield* TrialCommittedSourceJson.encode(reconstructedSource)
            );
            const validReconstruction = yield* finalize(
              "ref-valid-reconstruction",
              evidence,
              O.some(originalGuard),
              O.some(validSource)
            );
            expect(validReconstruction.result._tag).toBe("Success");
            expect(O.isSome(validReconstruction.report)).toBe(true);
            if (O.isSome(validReconstruction.report))
              expect(validReconstruction.report.value.failures).toEqual([
                acceptanceFailure,
                ...A.filter(
                  baselineFailures,
                  (failure) => failure !== "Fresh retained-commit reconstruction evidence is missing"
                ),
              ]);
            const wrongSource = yield* persist(
              "ref-wrong-base-reconstruction.json",
              yield* TrialCommittedSourceJson.encode(
                TrialCommittedSource.make({ ...reconstructedSource, baseCommit: Str.repeat(40)("0") })
              )
            );
            const wrongSourceBase = yield* finalize(
              "ref-wrong-base-reconstruction",
              evidence,
              O.some(originalGuard),
              O.some(wrongSource)
            );
            expect(wrongSourceBase.result._tag).toBe("Failure");
            if (wrongSourceBase.result._tag === "Failure")
              expect(wrongSourceBase.result.failure.message).toBe(
                "Reconstruction is not an owned fresh tree bound to the retained candidate bundle"
              );
            expect(yield* fs.exists(`${root}/finalization.json`)).toBe(false);
            const restored = yield* finalize("ref-guard-restored", evidence);
            expect(restored.result._tag).toBe("Success");
            expect(O.isSome(restored.report)).toBe(true);
            if (O.isSome(restored.report)) expect(restored.report.value.failures).toEqual(baselineFailures);
            const changedJson = yield* S.encodeEffect(S.fromJsonString(TrialBootstrapFile.Capabilities))(altered);
            const changedLiteral = yield* S.encodeEffect(S.fromJsonString(S.String))(changedJson);
            const currentReader = ChildProcessSpawner.make((command) => {
              if (command._tag === "StandardCommand" && command.command === python && A.contains(command.args, "-c"))
                return spawner.spawn(
                  ChildProcess.make(python, ["-I", "-B", "-c", `print(${changedLiteral})`], command.options)
                );
              return spawner.spawn(command);
            });
            const current = yield* finalize("current-mutated", evidence).pipe(
              Effect.provideService(ChildProcessSpawner.ChildProcessSpawner, currentReader)
            );
            expect(current.result._tag).toBe("Failure");
            expect(current.capabilityReads).toBe(1);
            if (current.result._tag === "Failure") {
              expect(current.result.failure._tag).toBe("AgentTrialError");
              if (current.result.failure._tag === "AgentTrialError") {
                expect(current.result.failure.stage).toBe("proof");
                expect(current.result.failure.message).toBe("Bootstrap helper capability changed");
              }
            }
            expect(yield* fs.exists(`${root}/finalization.json`)).toBe(false);
            const currentDirectory = FileSystem.FileSystem.of({
              ...fs,
              stat: Effect.fn("fixture.stat")((input: string) =>
                fs
                  .stat(input)
                  .pipe(
                    Effect.map((info) =>
                      input === `${prepared.system.root}/etc/group` ? { ...info, type: "Directory" } : info
                    )
                  )
              ),
            });
            const directory = yield* finalize("current-account-directory", evidence).pipe(
              Effect.provideService(FileSystem.FileSystem, currentDirectory)
            );
            expect(directory.result._tag).toBe("Failure");
            expect(yield* fs.exists(`${root}/finalization.json`)).toBe(false);
          })
        ),
      { timeout: 120000 }
    );
    test.effect(
      "requires complete native metadata and revalidates standalone asset bytes",
      () =>
        Effect.scoped(
          Effect.gen(function* () {
            const { fs, root, inputs, sealed, python, native, certificate, program } = yield* makeNativeFixture();
            const originalGroup = yield* fs.readFileString(`${inputs}/etc/group`);
            yield* fs.remove(`${inputs}/etc/group`, { recursive: true });
            yield* fs.makeDirectory(`${inputs}/etc/group`);
            const directoryReplacement = yield* validateTrialNativeRuntime(native).pipe(Effect.result);
            expect(directoryReplacement._tag).toBe("Failure");
            yield* fs.remove(`${inputs}/etc/group`, { recursive: true });
            yield* fs.writeFileString(`${inputs}/etc/group`, originalGroup);
            const observed = yield* validateTrialNativeRuntime(native);
            expect(observed).toHaveLength(2);
            for (const encodedType of ["Directory", "SymbolicLink", "Socket"]) {
              const type = yield* S.decodeUnknownEffect(S.Literals(["Directory", "SymbolicLink", "Socket"]))(
                encodedType
              );
              const nonregular = yield* validateTrialNativeRuntime(native).pipe(
                Effect.provideService(
                  FileSystem.FileSystem,
                  FileSystem.FileSystem.of({
                    ...fs,
                    stat: Effect.fn("fixture.stat")((input: string) =>
                      input === "/usr/bin/newuidmap"
                        ? fs.stat(input).pipe(Effect.map((info) => ({ ...info, type })))
                        : fs.stat(input)
                    ),
                  })
                ),
                Effect.result
              );
              expect(nonregular._tag).toBe("Failure");
              if (nonregular._tag === "Failure")
                expect(nonregular.failure.message).toBe("Bootstrap privilege helper must be a regular file");
            }

            const reader = `${root}/capability-reader`;
            const observationsJson = yield* S.encodeEffect(S.fromJsonString(TrialBootstrapFile.Capabilities))(observed);
            const observationsLiteral = yield* S.encodeEffect(S.fromJsonString(S.String))(observationsJson);
            const interceptedReader = (errorNumber: number) =>
              `import errno,os,sys\ndef denied(*args): raise OSError(${errorNumber},'denied')\nos.getxattr=denied\ncode=sys.argv[4]\nsys.argv=[sys.argv[0],*sys.argv[5:]]\nexec(code)`;
            for (const body of [
              "raise SystemExit(1)",
              "print('[]')",
              "print('not JSON')",
              `print(${observationsLiteral})\nraise SystemExit(1)`,
              `print(${observationsLiteral})\nprint('x'*1048576)`,
              interceptedReader(13),
              interceptedReader(95),
              "import time; time.sleep(30)",
            ]) {
              yield* fs.writeFileString(reader, `#!${python} -B\n${body}\n`);
              yield* fs.chmod(reader, 0o755);
              const info = yield* fs.stat(reader);
              const readerBinding = TrialBootstrapFile.make({
                artifact: yield* trialArtifact(reader),
                metadata: TrialInputMetadata.make({
                  mode: info.mode,
                  uid: O.getOrElse(info.uid, () => 0),
                  gid: O.getOrElse(info.gid, () => 0),
                }),
              });
              const failedReader = yield* validateTrialNativeRuntime(
                TrialNativeYeetRuntime.make({
                  ...native,
                  bootstrap: [...native.bootstrap, readerBinding],
                  broker: TrialBrokerControl.make({ ...native.broker, interpreter: readerBinding.artifact }),
                })
              ).pipe(Effect.result);
              expect(failedReader._tag).toBe("Failure");
              if (failedReader._tag === "Failure") expect(failedReader.failure.stage).toBe("proof");
            }

            const omitted = yield* validateTrialNativeRuntime(
              TrialNativeYeetRuntime.make({
                ...native,
                bootstrap: A.map(native.bootstrap, (file) =>
                  TrialBootstrapFile.make({ ...file, capability: undefined })
                ),
              })
            ).pipe(Effect.result);
            expect(omitted._tag).toBe("Failure");
            const duplicates = yield* validateTrialNativeRuntime(
              TrialNativeYeetRuntime.make({
                ...native,
                bootstrap: [
                  ...native.bootstrap,
                  ...A.filter(native.bootstrap, (file) => file.artifact.path === "/usr/bin/newuidmap"),
                ],
              })
            ).pipe(Effect.result);
            expect(duplicates._tag).toBe("Failure");
            const changedCapabilities = yield* validateTrialNativeRuntime(
              TrialNativeYeetRuntime.make({
                ...native,
                bootstrap: A.map(native.bootstrap, (file) =>
                  file.artifact.path === "/usr/bin/newuidmap"
                    ? TrialBootstrapFile.make({
                        ...file,
                        capability: O.isNone(observed[0].capability)
                          ? O.some("0100000280000000000000000000000000000000")
                          : O.none(),
                      })
                    : file
                ),
              })
            ).pipe(Effect.result);
            expect(changedCapabilities._tag).toBe("Failure");
            const missingCache = yield* validateTrialNativeRuntime(
              TrialNativeYeetRuntime.make({ ...native, bunInstallCache: undefined })
            ).pipe(Effect.result);
            expect(missingCache._tag).toBe("Failure");
            if (missingCache._tag === "Failure")
              expect(missingCache.failure.message).toBe("Native full runtime requires an immutable Bun install cache");
            const { metadata: _metadata, ...legacy } = sealed;
            const absent = yield* validateTrialNativeRuntime(
              TrialNativeYeetRuntime.make({ ...native, system: TrialInputInventory.make(legacy) })
            ).pipe(Effect.result);
            expect(absent._tag).toBe("Failure");
            if (absent._tag === "Failure")
              expect(absent.failure.message).toBe("Native system requires declared readonly account inputs");
            yield* fs.writeFileString(program, "changed");
            const changed = yield* validateTrialNativeRuntime(native).pipe(Effect.result);
            expect(changed._tag).toBe("Failure");
            if (changed._tag === "Failure") expect(changed.failure.message).toBe("Native broker asset changed");
            yield* fs.writeFileString(program, "program");
            yield* fs.writeFileString(certificate, "changed");
            const cert = yield* validateTrialNativeRuntime(native).pipe(Effect.result);
            expect(cert._tag).toBe("Failure");
            if (cert._tag === "Failure")
              expect(cert.failure.message).toBe("Native advisory policy or certificate bytes differ");
          })
        ),
      { timeout: 60000 }
    );
    test.effect("rejects mode changes even when bytes and legacy inventory fields remain unchanged", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const root = yield* fs.makeTempDirectoryScoped();
          const file = `${root}/program`;
          yield* fs.writeFileString(file, "fixture", { mode: 0o600 });
          const meta = yield* fs.stat(file);
          const files = { program: yield* hashPublicTextSha256("fixture") };
          const metadata = {
            program: TrialInputMetadata.make({
              mode: meta.mode,
              uid: O.getOrElse(meta.uid, () => 0),
              gid: O.getOrElse(meta.gid, () => 0),
            }),
          };
          const symlinks = {};
          const digest = yield* hashPublicTextSha256(
            yield* S.encodeEffect(S.fromJsonString(S.Unknown))({ files, symlinks, metadata })
          );
          const tracked = TrialInputInventory.make({ root, digest, files, symlinks, metadata });
          yield* validateTrialInventory(tracked);
          yield* fs.chmod(file, 0o700);
          const result = yield* validateTrialInventory(tracked).pipe(Effect.result);
          expect(result._tag).toBe("Failure");
          if (result._tag === "Failure") expect(result.failure.message).toBe("Sealed input ownership or mode changed");
        })
      )
    );
  }
);

layer(Layer.merge(NodeServices.layer, BunCrypto.layer), { excludeTestServices: true })((test) =>
  test.effect("projects only exact declared readonly account files and rejects incomplete or linked inputs", () =>
    Effect.scoped(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const root = yield* fs.makeTempDirectoryScoped();
        yield* fs.makeDirectory(`${root}/etc`);
        for (const name of ["passwd", "group", "nsswitch.conf"])
          yield* fs.writeFileString(`${root}/etc/${name}`, `fixture-${name}`);
        const system = yield* captureTrialInventory(root);
        const args = yield* trialSystemBindings(system, true);
        expect(A.takeRight(args, 9)).toEqual([
          "--ro-bind",
          `${root}/etc/passwd`,
          "/etc/passwd",
          "--ro-bind",
          `${root}/etc/group`,
          "/etc/group",
          "--ro-bind",
          `${root}/etc/nsswitch.conf`,
          "/etc/nsswitch.conf",
        ]);
        const missing = { ...system, files: R.remove(system.files, "etc/group") };
        const incomplete = TrialInputInventory.make({ ...missing, digest: yield* trialInventoryDigest(missing) });
        expect((yield* trialSystemBindings(incomplete, true).pipe(Effect.result))._tag).toBe("Failure");
        yield* fs.remove(`${root}/etc/group`);
        yield* fs.symlink("passwd", `${root}/etc/group`);
        const linked = yield* captureTrialInventory(root);
        expect((yield* trialSystemBindings(linked, true).pipe(Effect.result))._tag).toBe("Failure");
        yield* fs.remove(`${root}/etc/group`);
        yield* fs.makeDirectory(`${root}/etc/group`);
        const directory = yield* captureTrialInventory(root);
        const forged = {
          ...directory,
          files: { ...directory.files, "etc/group": yield* hashTrialInput(`${root}/etc/group`) },
          directories: A.filter(directory.directories ?? [], (name) => name !== "etc/group"),
        };
        const claimedFile = TrialInputInventory.make({ ...forged, digest: yield* trialInventoryDigest(forged) });
        expect((yield* trialSystemBindings(claimedFile, true).pipe(Effect.result))._tag).toBe("Failure");
      })
    )
  )
);
