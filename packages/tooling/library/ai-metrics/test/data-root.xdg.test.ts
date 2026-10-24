/**
 * XDG env matrix for the ai-metrics state home and the forwarder's hook
 * evidence root (4-X-A parity). `before` is the hand-written resolution, `after`
 * is `@beep/xdg` `XdgBase`; `null` means nothing resolves (none, or a failure).
 *
 * Divergent rows assert `after`; `before` stays as the record of the old answer
 * (committed and green against the hand-written body first).
 */
import { AiMetricsStateHomeInput, aiMetricsStateHome, resolveForwarderEvidenceRoot } from "@beep/repo-ai-metrics";
import { assert, describe, it } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";

type StateHomeInput = { readonly homeDir?: string; readonly stateHome?: string };
type Row<I> = readonly [name: string, input: I, expected: string | null];
type DivergentRow<I> = readonly [name: string, input: I, before: string | null, after: string | null];

const stateHomeOf = (input: StateHomeInput) =>
  Effect.map(S.decodeEffect(AiMetricsStateHomeInput)(input), (decoded) => O.getOrNull(aiMetricsStateHome(decoded)));

/** Rows the adoption leaves unchanged. */
const stateHomeRows: ReadonlyArray<Row<StateHomeInput>> = [
  ["the HOME default", { homeDir: "/h" }, "/h/.local/state"],
  ["XDG_STATE_HOME wins over HOME", { homeDir: "/h", stateHome: "/x" }, "/x"],
  ["XDG_STATE_HOME without HOME", { stateHome: "/x" }, "/x"],
  ["a trailing slash on XDG_STATE_HOME is trimmed", { stateHome: "/x/" }, "/x"],
  ["a trailing slash on HOME is trimmed", { homeDir: "/h/" }, "/h/.local/state"],
  ["a padded XDG_STATE_HOME is trimmed", { homeDir: "/h", stateHome: "  /x  " }, "/x"],
  ["a blank XDG_STATE_HOME is unset", { homeDir: "/h", stateHome: "  " }, "/h/.local/state"],
  ["nothing set", {}, null],
  ["a blank HOME", { homeDir: "   " }, null],
  // Windows roots: AiMetricsAbsoluteDataRoot admits drive and UNC paths, so the state home keeps them.
  ["a Windows drive HOME", { homeDir: "C:\\Users\\dev" }, "C:\\Users\\dev/.local/state"],
  ["a forward-slash drive HOME", { homeDir: "C:/Users/dev/" }, "C:/Users/dev/.local/state"],
  ["a UNC HOME", { homeDir: "\\\\srv\\home\\dev" }, "\\\\srv\\home\\dev/.local/state"],
  ["a Windows drive XDG_STATE_HOME", { homeDir: "/h", stateHome: "D:\\state" }, "D:\\state"],
  ["a UNC XDG_STATE_HOME without HOME", { stateHome: "\\\\srv\\state" }, "\\\\srv\\state"],
  ["a POSIX XDG_STATE_HOME beside a Windows HOME", { homeDir: "C:\\Users\\dev", stateHome: "/x" }, "/x"],
];

/** Rows where the hand-written body broke the spec: a relative value counted, HOME was not normalized. */
const stateHomeDivergent: ReadonlyArray<DivergentRow<StateHomeInput>> = [
  ["a relative XDG_STATE_HOME", { homeDir: "/h", stateHome: "relative" }, "relative", "/h/.local/state"],
  ["a relative XDG_STATE_HOME without HOME", { stateHome: "relative" }, "relative", null],
  ["a relative HOME", { homeDir: "relative" }, "relative/.local/state", null],
  ["a root HOME", { homeDir: "/" }, "//.local/state", "/.local/state"],
  ["an unnormalized HOME", { homeDir: "/h/./a" }, "/h/./a/.local/state", "/h/a/.local/state"],
];

type EvidenceInput = { readonly homeDir: string; readonly env: Readonly<Record<string, string>> };

const evidenceRootOf = ({ env, homeDir }: EvidenceInput) =>
  resolveForwarderEvidenceRoot(homeDir).pipe(
    Effect.map((root): string | null => root),
    Effect.orElseSucceed((): string | null => null),
    Effect.provideService(ConfigProvider.ConfigProvider, ConfigProvider.fromUnknown(env))
  );

const evidenceRows: ReadonlyArray<Row<EvidenceInput>> = [
  ["the HOME default", { homeDir: "/h", env: {} }, "/h/.local/state/beep/agent-evidence"],
  ["XDG_STATE_HOME", { homeDir: "/h", env: { XDG_STATE_HOME: "/x" } }, "/x/beep/agent-evidence"],
  ["an empty XDG_STATE_HOME", { homeDir: "/h", env: { XDG_STATE_HOME: "" } }, "/h/.local/state/beep/agent-evidence"],
  ["a trailing slash on HOME", { homeDir: "/h/", env: {} }, "/h/.local/state/beep/agent-evidence"],
  ["the override wins", { homeDir: "/h", env: { BEEP_AGENT_EVIDENCE_ROOT: "/e", XDG_STATE_HOME: "/x" } }, "/e"],
  ["the override wins over a relative HOME", { homeDir: "relative", env: { BEEP_AGENT_EVIDENCE_ROOT: "/e" } }, "/e"],
  ["a Windows drive HOME", { homeDir: "C:\\Users\\dev", env: {} }, "C:\\Users\\dev/.local/state/beep/agent-evidence"],
  [
    "a Windows drive XDG_STATE_HOME",
    { homeDir: "/h", env: { XDG_STATE_HOME: "D:\\state" } },
    "D:\\state/beep/agent-evidence",
  ],
  [
    "an empty override falls through",
    { homeDir: "/h", env: { BEEP_AGENT_EVIDENCE_ROOT: "" } },
    "/h/.local/state/beep/agent-evidence",
  ],
];

const evidenceDivergent: ReadonlyArray<DivergentRow<EvidenceInput>> = [
  [
    "a relative XDG_STATE_HOME",
    { homeDir: "/h", env: { XDG_STATE_HOME: "relative" } },
    "relative/beep/agent-evidence",
    "/h/.local/state/beep/agent-evidence",
  ],
  [
    "a trailing slash on XDG_STATE_HOME",
    { homeDir: "/h", env: { XDG_STATE_HOME: "/x/" } },
    "/x//beep/agent-evidence",
    "/x/beep/agent-evidence",
  ],
  [
    "a padded XDG_STATE_HOME",
    { homeDir: "/h", env: { XDG_STATE_HOME: " /x " } },
    " /x /beep/agent-evidence",
    "/x/beep/agent-evidence",
  ],
  ["a relative HOME", { homeDir: "relative", env: {} }, "relative/.local/state/beep/agent-evidence", null],
  ["an empty HOME", { homeDir: "", env: {} }, ".local/state/beep/agent-evidence", null],
];

describe("aiMetricsStateHome env matrix", () => {
  for (const [name, input, expected] of stateHomeRows) {
    it.effect(name, () =>
      Effect.gen(function* () {
        assert.strictEqual(yield* stateHomeOf(input), expected);
      })
    );
  }
  for (const [name, input, , after] of stateHomeDivergent) {
    it.effect(`${name} (diverges on purpose: XDG absolute-only)`, () =>
      Effect.gen(function* () {
        assert.strictEqual(yield* stateHomeOf(input), after);
      })
    );
  }
});

it.layer(Path.layer, { timeout: "10 seconds" })("resolveForwarderEvidenceRoot env matrix", (it) => {
  for (const [name, input, expected] of evidenceRows) {
    it.effect(name, () =>
      Effect.gen(function* () {
        assert.strictEqual(yield* evidenceRootOf(input), expected);
      })
    );
  }
  for (const [name, input, , after] of evidenceDivergent) {
    it.effect(`${name} (diverges on purpose: XDG absolute-only)`, () =>
      Effect.gen(function* () {
        assert.strictEqual(yield* evidenceRootOf(input), after);
      })
    );
  }
});
