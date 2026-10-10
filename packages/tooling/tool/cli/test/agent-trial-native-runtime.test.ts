import { hashPublicTextSha256 } from "@beep/repo-ai-metrics/privacy";
import {
  executeTrialCheck,
  TrialArtifact,
  TrialBootstrapFile,
  TrialBrokerControl,
  TrialCommittedSource,
  TrialCommittedSourceJson,
  TrialEvaluatorCheck,
  TrialInputInventory,
  TrialInputMetadata,
  TrialNativeYeetRuntime,
  trialArtifact,
  trialCheckContractDigest,
  trialEvaluatorInputRoots,
  trialEvaluatorInventoryBindings,
  validateTrialInventory,
  validateTrialNativeRuntime,
} from "@beep/repo-cli/test/AgentEffectiveness";
import { repoRunOutputBound, runCaptured } from "@beep/repo-cli/test/Process";
import { Sha256Hex } from "@beep/schema/Sha256";
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import { NodeServices } from "@effect/platform-node";
import { expect, it, layer } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

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
      { system: TrialInputInventory.make({ ...inventory, digest: one }) },
      { nix: TrialInputInventory.make({ ...inventory, digest: one }) },
      { oci: TrialInputInventory.make({ ...inventory, digest: one }) },
      { crun: TrialInputInventory.make({ ...inventory, digest: one }) },
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
    ])
      expect(yield* changed(yield* S.decodeUnknownEffect(TrialNativeYeetRuntime)({ ...runtime, ...patch }))).not.toBe(
        frozen
      );
    const { nativeRuntime: _native, ...legacy } = check;
    expect(yield* trialCheckContractDigest(TrialEvaluatorCheck.make(legacy))).not.toBe(frozen);
  })
);

layer(Layer.merge(NodeServices.layer, BunCrypto.layer), { excludeTestServices: true })(
  "native runtime metadata",
  (test) => {
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
                schemaVersion: "agent-trial-committed-source/v1",
                workspace,
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
            expect(masked.failure.message).toBe("Evaluator runtime projection would cover tracked or unignored source");
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
    test.effect("requires complete native metadata and revalidates standalone asset bytes", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const root = yield* fs.makeTempDirectoryScoped();
          const inputs = `${root}/inputs`;
          yield* fs.makeDirectory(inputs);
          const empty = { files: {}, symlinks: {}, directories: [], metadata: {} };
          const digest = yield* hashPublicTextSha256(yield* S.encodeEffect(S.fromJsonString(S.Unknown))(empty));
          const sealed = TrialInputInventory.make({ root: inputs, digest, ...empty });
          const bootstrap = [];
          for (const path of [
            "/usr/bin/podman",
            "/usr/bin/bwrap",
            "/usr/bin/newuidmap",
            "/usr/bin/newgidmap",
            "/usr/bin/runc",
            "/usr/bin/stat",
          ]) {
            const info = yield* fs.stat(path);
            bootstrap.push(
              TrialBootstrapFile.make({
                artifact: yield* trialArtifact(path),
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
            yield* S.encodeEffect(S.fromJsonString(S.Unknown))({ "api.osv.dev:443": {}, "registry.npmjs.org:443": {} })
          );
          const asset = yield* trialArtifact(program);
          const native = TrialNativeYeetRuntime.make({
            ...runtime,
            system: sealed,
            nix: sealed,
            oci: sealed,
            crun: sealed,
            bootstrap,
            certificateBundle: yield* trialArtifact(certificate),
            broker: TrialBrokerControl.make({
              ...runtime.broker,
              program: asset,
              relay: asset,
              canaries: asset,
              policy: yield* trialArtifact(policy),
              interpreter: yield* trialArtifact("/usr/bin/stat"),
            }),
          });
          yield* validateTrialNativeRuntime(native);
          const { metadata: _metadata, ...legacy } = sealed;
          const absent = yield* validateTrialNativeRuntime(
            TrialNativeYeetRuntime.make({ ...native, system: TrialInputInventory.make(legacy) })
          ).pipe(Effect.result);
          expect(absent._tag).toBe("Failure");
          if (absent._tag === "Failure")
            expect(absent.failure.message).toBe("Native runtime requires complete mode and ownership metadata");
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
      )
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
