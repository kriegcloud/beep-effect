/**
 * XDG env matrix for the repo-cli sites 4-X-A moves onto `@beep/xdg`
 * `XdgBase`: the beep cache root, the Fleet scanner cache, the HarnessLedger
 * hook-pulse directory, the ai-metrics command data root and the person-match
 * cache. `before` is the hand-written resolution, `after` the adopted one;
 * `null` means nothing resolves (none, or a failure).
 */

import { AiMetricsDeployTarget } from "@beep/repo-ai-metrics";
import { resolveDataRoot } from "@beep/repo-cli/commands/AIMetrics/internal/Programs";
import { resolveHookPulseDir } from "@beep/repo-cli/commands/HarnessLedger";
import { fleetScannerCacheRoot } from "@beep/repo-cli/commands/Worktree";
import { selectPersonMatchCacheRoot } from "@beep/repo-cli/test/Files";
import { resolveBeepCacheRoot } from "@beep/repo-cli/test/RepoRun";
import { assert, it } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as Str from "effect/String";

type Env = Readonly<Record<string, string>>;
type Row = readonly [name: string, env: Env, expected: string | null];
type DivergentRow = readonly [name: string, env: Env, before: string | null, after: string | null];
type Resolved = string | O.Option<string>;

const inEnv =
  (env: Env) =>
  <E>(self: Effect.Effect<Resolved, E, Path.Path>): Effect.Effect<string | null, never, Path.Path> =>
    self.pipe(
      Effect.map((value) => (O.isOption(value) ? O.getOrNull(value) : value)),
      Effect.orElseSucceed((): string | null => null),
      Effect.provideService(ConfigProvider.ConfigProvider, ConfigProvider.fromUnknown(env))
    );

/** An expected value resolved against the working directory, as `path.resolve` does. */
const fromCwd = (relative: string) => `cwd:${relative}`;

const expectedIn = (expected: string | null) =>
  Effect.map(Path.Path, (path) =>
    pipe(
      O.fromNullishOr(expected),
      O.filter(Str.startsWith("cwd:")),
      O.match({ onNone: () => expected, onSome: (relative) => path.resolve(Str.slice(4)(relative)) })
    )
  );

const matrix = (
  title: string,
  resolve: (env: Env) => Effect.Effect<string | null, never, Path.Path>,
  rows: ReadonlyArray<Row>,
  divergent: ReadonlyArray<DivergentRow>
) =>
  it.layer(Path.layer)(title, (it) => {
    for (const [name, env, expected] of rows) {
      it.effect(name, () =>
        Effect.gen(function* () {
          assert.strictEqual(yield* resolve(env), yield* expectedIn(expected));
        })
      );
    }
    for (const [name, env, before] of divergent) {
      it.effect(`${name} (hand-written resolution)`, () =>
        Effect.gen(function* () {
          assert.strictEqual(yield* resolve(env), yield* expectedIn(before));
        })
      );
    }
  });

const noFlag = O.none<string>();

matrix(
  "resolveBeepCacheRoot",
  (env) => resolveBeepCacheRoot().pipe(inEnv(env)),
  [
    ["XDG_CACHE_HOME", { XDG_CACHE_HOME: "/x", HOME: "/h" }, "/x"],
    ["a trailing slash on XDG_CACHE_HOME", { XDG_CACHE_HOME: "/x/" }, "/x"],
    ["the HOME default", { HOME: "/h" }, "/h/.cache"],
    ["an empty XDG_CACHE_HOME", { XDG_CACHE_HOME: "", HOME: "/h" }, "/h/.cache"],
    ["a trailing slash on HOME", { HOME: "/h/" }, "/h/.cache"],
    ["the TMPDIR rung", { TMPDIR: "/t" }, "/t"],
    ["the /tmp default", {}, "/tmp"],
    ["an empty HOME", { HOME: "", TMPDIR: "/t" }, "/t"],
  ],
  [
    ["a relative XDG_CACHE_HOME", { XDG_CACHE_HOME: "relative", HOME: "/h" }, fromCwd("relative"), "/h/.cache"],
    ["a padded XDG_CACHE_HOME", { XDG_CACHE_HOME: " /x", HOME: "/h" }, fromCwd(" /x"), "/h/.cache"],
    ["a relative HOME", { HOME: "relative", TMPDIR: "/t" }, fromCwd("relative/.cache"), "/t"],
  ]
);

const fleetOf = (env: Env) =>
  Effect.succeed(
    fleetScannerCacheRoot({
      xdgCacheHome: O.fromUndefinedOr(env.XDG_CACHE_HOME),
      homeDir: O.fromUndefinedOr(env.HOME),
    }).pipe(O.getOrNull)
  );

matrix(
  "fleetScannerCacheRoot",
  fleetOf,
  [
    ["the HOME default", { HOME: "/h" }, "/h/.cache"],
    ["XDG_CACHE_HOME wins", { XDG_CACHE_HOME: "/x", HOME: "/h" }, "/x"],
    ["XDG_CACHE_HOME without HOME", { XDG_CACHE_HOME: "/x" }, "/x"],
    ["nothing set", {}, null],
  ],
  [
    ["an empty XDG_CACHE_HOME", { XDG_CACHE_HOME: "", HOME: "/h" }, "", "/h/.cache"],
    ["a relative XDG_CACHE_HOME", { XDG_CACHE_HOME: "relative", HOME: "/h" }, "relative", "/h/.cache"],
    ["a relative HOME", { HOME: "relative" }, "relative/.cache", null],
    ["a trailing slash on HOME", { HOME: "/h/" }, "/h//.cache", "/h/.cache"],
    ["an empty HOME", { HOME: "" }, "/.cache", null],
  ]
);

const hooks = "beep/agent-evidence/hook-events";

matrix(
  "resolveHookPulseDir",
  (env) => resolveHookPulseDir.pipe(inEnv(env)),
  [
    ["the override wins", { BEEP_AGENT_EVIDENCE_ROOT: "/e", HOME: "/h" }, "/e/hook-events"],
    ["the HOME default", { HOME: "/h" }, `/h/.local/state/${hooks}`],
    ["XDG_STATE_HOME", { XDG_STATE_HOME: "/x", HOME: "/h" }, `/x/${hooks}`],
    ["XDG_STATE_HOME without HOME", { XDG_STATE_HOME: "/x" }, `/x/${hooks}`],
    ["a blank override falls through", { BEEP_AGENT_EVIDENCE_ROOT: "  ", HOME: "/h" }, `/h/.local/state/${hooks}`],
    ["nothing set", {}, null],
  ],
  [
    [
      "a relative XDG_STATE_HOME",
      { XDG_STATE_HOME: "relative", HOME: "/h" },
      `relative/${hooks}`,
      `/h/.local/state/${hooks}`,
    ],
    ["a relative HOME", { HOME: "relative" }, `relative/.local/state/${hooks}`, null],
  ]
);

matrix(
  "resolveDataRoot (local target)",
  (env) => resolveDataRoot(noFlag, AiMetricsDeployTarget.Enum.local).pipe(inEnv(env)),
  [
    ["the HOME default", { HOME: "/h" }, "/h/.local/state/beep/ai-metrics"],
    ["XDG_STATE_HOME without HOME", { XDG_STATE_HOME: "/x" }, "/x/beep/ai-metrics"],
    ["the environment root wins", { BEEP_AI_METRICS_DATA_ROOT: "/d", HOME: "/h" }, "/d"],
    ["nothing set", {}, null],
    ["a relative HOME", { HOME: "relative" }, null],
  ],
  [["a relative XDG_STATE_HOME", { XDG_STATE_HOME: "relative", HOME: "/h" }, null, "/h/.local/state/beep/ai-metrics"]]
);

const photoFace = "beep/photo-face";

matrix(
  "selectPersonMatchCacheRoot",
  (env) => selectPersonMatchCacheRoot(noFlag).pipe(inEnv(env)),
  [
    ["XDG_CACHE_HOME", { XDG_CACHE_HOME: "/x", HOME: "/h" }, `/x/${photoFace}`],
    ["the HOME default", { HOME: "/h" }, `/h/.cache/${photoFace}`],
    ["a trailing slash on HOME", { HOME: "/h/" }, `/h/.cache/${photoFace}`],
    ["a blank XDG_CACHE_HOME", { XDG_CACHE_HOME: "  ", HOME: "/h" }, `/h/.cache/${photoFace}`],
    ["a padded XDG_CACHE_HOME is trimmed", { XDG_CACHE_HOME: " /x ", HOME: "/h" }, `/x/${photoFace}`],
    ["the USERPROFILE branch", { USERPROFILE: "C:\\Users\\ada" }, `C:\\Users\\ada/.cache/${photoFace}`],
    ["nothing set", {}, null],
  ],
  [
    [
      "a relative XDG_CACHE_HOME",
      { XDG_CACHE_HOME: "relative", HOME: "/h" },
      `relative/${photoFace}`,
      `/h/.cache/${photoFace}`,
    ],
    ["a relative HOME", { HOME: "relative" }, `relative/.cache/${photoFace}`, null],
    [
      "a relative HOME beside USERPROFILE",
      { HOME: "relative", USERPROFILE: "C:\\Users\\ada" },
      `relative/.cache/${photoFace}`,
      `C:\\Users\\ada/.cache/${photoFace}`,
    ],
  ]
);

const explicitCacheDir = O.some("/c");

it.layer(Path.layer)("selectPersonMatchCacheRoot --cache-dir", (it) => {
  it.effect("an explicit --cache-dir wins over the environment", () =>
    Effect.gen(function* () {
      const selected = yield* selectPersonMatchCacheRoot(explicitCacheDir).pipe(
        inEnv({ XDG_CACHE_HOME: "/x", HOME: "/h" })
      );
      assert.strictEqual(selected, "/c");
    })
  );
});
