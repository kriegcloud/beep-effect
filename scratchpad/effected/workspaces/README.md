# Workspace repo-shape checks (lab)

The `testing` cluster of the `@effected/workspaces` port stays in this lab module after wave 4-W-a of `goals/effected-promotion` promoted the core and config-dependency half to `@beep/repo-workspaces`. It imports the package's public leaves. The section below is the upstream documentation for this cluster.

## Repo-shape checks (`@effected/workspaces/testing`)

A monorepo's shape drifts in ways no unit test sees: a package that should stay platform-free starts reading `process`, a low-level package grows an edge up into an application, or a bin resolves fine inside the workspace and is missing once installed from its tarball. The `@effected/workspaces/testing` subpath holds three checks you run from your own test suite to catch each one. The main entry never re-exports it, so a consumer of `.` never loads a scanner or package-manager orchestration it does not use.

Every check refuses to pass vacuously, so every example below pairs "nothing wrong" with "something was checked".

### Layering

`WorkspaceLayering` holds the discovered package graph to a committed `layers.json`. `layers` is top-down: a package may depend only on a layer below its own, or on `tooling`. `unconstrained` globs name packages whose own edges are not checked, such as the private root, which must be classified like any other package. Every entry matches a package's `name`, never its `relativePath`: `layers` and `tooling` list exact names, and `unconstrained` globs match names. So a private root named `my-monorepo` at `relativePath` `.` is classified as `"my-monorepo"`, and an entry of `"."` or `"packages/*"` classifies nothing. `fields` picks the dependency maps that count, and `requiredEdges` lists edges that must exist, so a discovery that silently drops edges fails. Decoding is strict: any other key fails `LayerPolicyError` naming the key, so a typo such as `requiredEdge` cannot silently drop that guard. `$schema` is always accepted, and keys a policy file carries for its own use go in `LayerPolicy.load(path, { allowKeys: [...] })`.

```json
{
  "layers": [["my-tool"], ["my-tool-cli", "my-tool-mcp"], ["my-tool-engine"]],
  "tooling": [],
  "unconstrained": ["my-monorepo"],
  "fields": ["dependencies", "peerDependencies", "optionalDependencies"],
  "requiredEdges": ["my-tool-mcp -> my-tool-engine"]
}
```

```ts
// __test__/layering.test.ts, one level below the workspace root
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NodeServices } from "@effect/platform-node";
import { assert, describe, layer } from "@effect/vitest";
import { Workspaces } from "@beep/repo-workspaces";
import { LayerPolicy, WorkspaceLayering } from "@beep/scratchpad/effected/workspaces/testing";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const Live = Workspaces.layer({ cwd: ROOT }).pipe(Layer.provideMerge(NodeServices.layer));

describe("package layering", () => {
  layer(Live)((it) => {
    it.effect("the workspace honours layers.json, over real edges", () =>
      Effect.gen(function* () {
        const policy = yield* LayerPolicy.load(join(ROOT, "layers.json"));
        const report = yield* WorkspaceLayering.checkWorkspace(policy);
        assert.deepStrictEqual(report.violations, []);
        assert.isAbove(report.edgeCount, 0, "the check read real edges");
      }),
    );
  });
});
```

An edge is drawn wherever a dependency's name is a workspace package, whatever its specifier, and once per declaring field. A cycle closed only by a devDependency is therefore invisible to a policy that checks runtime fields only: pin acyclicity across every field separately, with `DependencyGraph.make({ packages }).hasCycle`.

### Source boundaries

`SourceBoundary.scan` walks a source tree and reports every read of the global `process`, forbidden import, `stdout.write` or console write. It lexes each file first, so the word `process` in a comment, a string, template text or a regex is never a read, and a `/*` inside a string never hides the code after it. Assert `verifyFixtures()` beside your scan: it proves the scanner still flags and spares what its shipped fixtures say.

```ts
// __test__/boundary.test.ts, one level below the package root
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NodeServices } from "@effect/platform-node";
import { assert, describe, layer } from "@effect/vitest";
import { SourceBoundary } from "@beep/scratchpad/effected/workspaces/testing";
import * as Effect from "effect/Effect";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

describe("source boundary", () => {
  layer(NodeServices.layer)((it) => {
    it.effect("the scanner still flags and spares what its fixtures say", () =>
      Effect.sync(() => assert.deepStrictEqual(SourceBoundary.verifyFixtures(), [])),
    );

    it.effect("no module reads process, writes to the console, or imports node: or a platform package", () =>
      Effect.gen(function* () {
        const scan = yield* SourceBoundary.scan({
          root: SRC,
          rules: ["process", "node:process", "console", { forbidImports: ["node:*", "@effect/platform*"] }],
        });
        assert.isNotEmpty(scan.files, "the scan read the tree");
        assert.deepStrictEqual(scan.violations, []);
      }),
    );
  });
});
```

| Rule | Flags |
| --- | --- |
| `"process"` | a read of the global `process`; `process.env.__PACKAGE_VERSION__` is exempt |
| `"node:process"` | an import of `node:process` or `process` |
| `"stdout-write"` | a `stdout.write`, or a `stdout.end` passing a final chunk, on anything named `stdout`; a renamed receiver is left to `"process"` |
| `"console"` | any reference to the global `console` |
| `"console-stdout"` | a reference to the global `console`, except a member access to a method Node writes to stderr: `error`, `warn`, `trace`, `assert`. A bare or aliased reference (`const c = console`, `f(console)`, `console[m]`) is flagged, since it can reach `log` |
| `{ forbidImports }` | an import equal to an entry, a subpath of one, or starting with an entry's text before a trailing `*` |
| `{ forbidTokens }` | an entry's exact text in code (never in a comment, string, template text or regex), as whole text: not inside a longer identifier |

Neither console rule flags core's `Console` service. `"console-stdout"` suits a stdio server that must keep stdout for its protocol but may log to stderr.

`allow` globs exempt a file from every rule, and the file is listed in `scan.allowed`. To exempt a file from one rule only, use `allowRules`, keyed by the rule (`"forbidImports"` covers every `{ forbidImports }` rule). The file is still checked against every other rule, and each offence a per-rule glob waives lands in `scan.waived` rather than disappearing, so a stale or over-broad waiver fails an assertion:

```ts
const scan = yield* SourceBoundary.scan({
  root: SRC,
  rules: ["process", "stdout-write"],
  // main.ts hands process.stdout to a transport, but must never write to it itself.
  allowRules: { process: ["main.ts"] },
});
assert.deepStrictEqual(scan.violations, []);
assert.deepStrictEqual([...new Set(scan.waived.map((offence) => offence.file))], ["main.ts"]);
```

Both kinds of glob compile with `@effected/glob` and match the scan's relative, `/`-separated path; an uncompilable one fails the scan with `GlobPatternError`.

To confine a token to named files rather than forbid it everywhere, forbid it with `{ forbidTokens }` and waive that rule for those files. The `"process"` rule exempts the build-time version define everywhere; this holds it to `version.ts`, and `waived` proves the confinement still matches something:

```ts
const TOKEN = "process.env.__PACKAGE_VERSION__";
const scan = yield* SourceBoundary.scan({
  root: SRC,
  rules: ["process", { forbidTokens: [TOKEN] }],
  allowRules: { forbidTokens: ["version.ts"] },
});
assert.deepStrictEqual(scan.violations, []);
assert.deepStrictEqual(
  scan.waived.map((offence) => offence.file),
  ["version.ts"],
);
```

`version.ts` names the file at the root; `**/version.ts` names one at any depth. One `"forbidTokens"` key covers every `{ forbidTokens }` rule in a scan, so two tokens with different homes take two scans.

The scanner is a lexer, not a type checker. Its known limits:

- There is no scope analysis, so any local binding named `process` or `console` is flagged like the global: a parameter (`(process: Handle) => process.kill()`), a variable, a label, or an unannotated class field (`process = 1`). An annotated class field (`process: T`) reads as a type member and is spared. Prefer renaming the binding; failing that, waive that one rule for the file with `allowRules` and assert `scan.waived` names exactly it.
- `globalThis["process"]` and `const { process: p } = globalThis` are not seen.
- A regex literal directly after a block-closing `}` reads as a division.
- A variable named `yield` or `await` in a sloppy-mode script reads as the keyword, so a `/` after it opens a regex. Module and strict code reserve both words, so a module never hits this.
- JSX text reads as code, which is why `.tsx` and `.jsx` are not scanned by default.
- `forbidImports: ["node:*"]` matches only the `node:` spelling, not a bare `"fs"`. To forbid both, spread Node's list in the test file: `{ forbidImports: ["node:*", ...builtinModules] }`, with `builtinModules` from `node:module`. That also forbids npm packages named like a built-in (`events`, `buffer`).

### Packed install

`PackedInstall.run` packs a carrier and every workspace package it needs, then installs the carrier into a fresh project outside the workspace under each package manager that answers `--version`, and checks every expected bin is linked and executable. It carries the traps each manager sets: the parent run's `npm_*` and `pnpm_config_*` context is scrubbed, pnpm's overrides go in `pnpm-workspace.yaml`, Yarn Berry gets the `node-modules` linker, `packageManager` is pinned to the probed version, and lifecycle scripts are skipped. By default it packs each package's built `dist/prod/npm/pkg`, the artifact a release publishes; build first.

It does not run the bins; the test does, inside the same scope, because the scratch directory (`result.scratch`) is removed when the scope closes. `consumer.runBin(name, args, options?)` runs one to completion and returns `{ stdout, stderr, exitCode }`, with no direct `@effected/commands` dependency. `consumer.command(name, args?, options?)` returns the `ChildProcess` command `runBin` builds, same environment and working directory, with stdin left open, so a probe that writes to the bin can spawn it. `consumer.binProvenance(name)` names the package a `.bin` symlink resolves into. `PackedInstall.closure(carrier, options?)` names every package the run will pack before it runs, and `PackedInstall.timeoutBudget` sizes the outer timeout from those names and the run's own ceilings. For an MCP server bin, `McpProbe` from `@effected/mcp/testing` is the proof:

```ts
// __test__/e2e/packed-install.e2e.test.ts, two levels below the workspace root
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NodeServices } from "@effect/platform-node";
import { assert, describe, layer } from "@effect/vitest";
import { McpProbe } from "@beep/scratchpad/effected/mcp/testing";
import { Workspaces } from "@beep/repo-workspaces";
import { PackedInstall } from "@beep/scratchpad/effected/workspaces/testing";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const Live = Workspaces.layer({ cwd: ROOT }).pipe(Layer.provideMerge(NodeServices.layer));

const MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
const INSTALL_TIMEOUT = "2 minutes";
const PACK_TIMEOUT = "1 minute";
const BIN_TIMEOUT = "30 seconds";
// The packages the run will pack, known before the test is declared.
const PACKAGES = await Effect.runPromise(PackedInstall.closure("my-tool").pipe(Effect.provide(Live)));
// Every ceiling the run sets, plus the two bin runs per consumer. The vitest
// timeout sits above it, so a named PackedInstallError fires before either guard.
const BUDGET = PackedInstall.timeoutBudget({
  managers: MANAGERS,
  installTimeout: INSTALL_TIMEOUT,
  packTimeout: PACK_TIMEOUT,
  packages: PACKAGES,
  perConsumer: "1 minute",
});

describe("packed install", () => {
  // The real clock: installs and the probe are real processes.
  layer(Live, { excludeTestServices: true })((it) => {
    it.effect(
      "my-tool's bins work from a packed install under every available manager",
      () =>
        Effect.gen(function* () {
          const result = yield* PackedInstall.run({
            carrier: "my-tool",
            closure: "auto",
            managers: MANAGERS,
            bins: ["my-tool", "my-tool-mcp"],
            env: process.env,
            installTimeout: INSTALL_TIMEOUT,
            packTimeout: PACK_TIMEOUT,
          });
          assert.deepStrictEqual(Object.keys(result.tarballs), [...PACKAGES]);
          assert.isAbove(result.consumers.length, 0, `nothing installed; unavailable: ${result.unavailable.join(", ")}`);
          // The tool's data lives inside the scratch root and is removed with it.
          const env = { XDG_DATA_HOME: `${result.scratch}/xdg` };
          for (const consumer of result.consumers) {
            const version = yield* consumer.runBin("my-tool", ["--version"], { env, timeout: BIN_TIMEOUT });
            assert.strictEqual(version.exitCode, 0, `${consumer.manager}: ${version.stderr}`);
            // Only the carrier declares my-tool (the run fails BinConflict otherwise, unless
            // allowSharedBins), so the .bin link is the carrier's. pnpm's shims are not read: undefined.
            const provenance = yield* consumer.binProvenance("my-tool");
            if (consumer.manager !== "pnpm") assert.strictEqual(provenance?.package, "my-tool", consumer.manager);
            const probe = McpProbe.initialize(consumer.command("my-tool-mcp", [], { env }));
            const { response, stderr, exitCode } = yield* probe.pipe(Effect.timeout(BIN_TIMEOUT));
            assert.isUndefined(response.error, `${consumer.manager}: initialize was refused`);
            assert.strictEqual(stderr, "", `${consumer.manager}: stderr`);
            assert.strictEqual(exitCode, 0, `${consumer.manager}: exit code`);
          }
        }).pipe(Effect.timeout(BUDGET)),
      Duration.toMillis(BUDGET) + 60_000,
    );
  });
});
```

Pass `process.env` in: nothing in the subpath reads `process` itself. `runBin` and `command` run under the environment the install ran under, with `options.env` layered over it after the parent manager's context is stripped, so an explicit entry such as `CI: "true"` wins and a key set to `undefined` removes a variable; a non-zero exit is a result, and a bin that cannot spawn or outlives its ceiling (one minute by default) fails `BinFailed`. `PackedInstall.scrubEnv(...)` returns the same scrubbed environment for any other spawn. A requested manager that is not installed lands in `result.unavailable`; pass `require: "all"` to make that a failure instead. Declare in `consumerDependencies` every package the consumer's own code imports besides the carrier: pnpm links only declared dependencies at a project's top level. An entry that names a packed package is written as its `file:` tarball whatever spec you pass, so any range will do; npm fails `EOVERRIDE` when a direct spec differs from its override.

By default only the carrier may declare its bins. If any other packed package declares one of the carrier's bin names, the run fails `BinConflict` before installing: under npm, bun and Yarn's flat layouts either package can take the `.bin` slot (npm and bun were observed to link the package whose name sorts first; Yarn 1 and 4 kept the carrier's, the consumer's direct dependency), so the bin that runs may carry no carrier identity, and the bin check and every bin run could pass on the wrong package. The check reads the `bin` field of the packed packages only (the carrier, the closure and `overrides`): it does not read `directories.bin`, and a registry dependency declaring the same name goes undetected.

Sharing bin names is a supported choice for a carrier whose front ends are also installed on their own: pass `allowSharedBins: true`. The expected bins are still verified present, but `runBin` may then run a front end's bin. `consumer.runCarrierBin(name, args?, options?)` runs the carrier's own bin whichever package took the slot: it resolves `name` through the carrier's installed `package.json` `bin` map and runs that file with `node`, under the same environment as `runBin`. Running through `node` assumes a Node script, drops any shebang flags, and bypasses the executable bit, so it proves the carrier's shim runs, not that it is executable. `consumer.carrierCommand(name, args?, options?)` returns that command, stdin open, for `McpProbe`.

When a closure member needs a dependency the registry does not have yet, for example a sibling checkout's unreleased build linked through a dogfood `file:` override, pass it in `overrides`: package name to a publish-ready package directory, which is `npm pack`ed, or to a `.tgz`, which is used as it is. A relative path resolves against the workspace root. Every consumer steers that package to its tarball through the same override field as the closure, so the carrier's transitive references install it whatever range they ask for, and it joins `result.tarballs`. `workspaceOverrides: true` also takes every `"<name>": "file:<path>"` entry of the root `pnpm-workspace.yaml`'s `overrides:`, which is the link shape a dogfood loop writes; an explicit `overrides` entry wins over one read there. An override naming the carrier or a closure member, a path that is neither a package directory nor a `.tgz`, or a tarball whose manifest has another name fails `InvalidOverride`.

The installs run one after another. `timeoutBudget` adds each manager's `--version` probe (30 seconds), install (`installTimeout`, four minutes by default) and `perConsumer` (one minute by default, one `runBin` at its default ceiling; add a minute per further bin run, or pass `"0 seconds"` for a test that only installs), each package's pack (`packTimeout`, two minutes by default) and manifest read (30 seconds), 30 seconds for the untimed steps, and one minute for cleanup (removing the scratch root when the scope closes, and killing a child after its ceiling interrupts it); a tighter outer guard fires first, as a `TimeoutError` that names no manager. `packages` is a count or the names `PackedInstall.closure` returns for the run's options: pass the run's own options object as the second argument when it sets `closure`, `overrides` or `workspaceOverrides`, and the names equal `Object.keys(result.tarballs)` in order. `PackedInstall.timeoutBudgetFor(runOptions, { perConsumer? })` does both in one Effect, reading `managers`, `installTimeout` and `packTimeout` from the same object. A vitest test's timeout is fixed when it is declared, so await either at module evaluation, as the example above does.

`binProvenance` reads the `.bin` entry as a symlink, which npm, bun and Yarn (under the `node-modules` linker the run configures) write, realpaths it, and walks up to the nearest `package.json` with a string `name`, inside the (realpath'd) consumer directory. `undefined` means only that the entry exists and is not a symlink, which is a pnpm shim. An entry that does not exist, or a link to nothing, fails `MissingBin`; a link into no named package inside the consumer fails `UnownedBin`; any other read failure fails `Io`. `PackedInstall` is POSIX-only and fails `UnsupportedPlatform` elsewhere.

## License

[MIT](LICENSE)
