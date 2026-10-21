// Port of Node v26.10.0 lib/internal/tty.js getColorDepth (MIT). Differences: the win32 branch reads OS=Windows_NT
// rather than process.platform and the OS release, no warning side effect, TTY gate applied here.
/**
 * The colour-depth decision for one stream, ported from Node's `getColorDepth`.
 *
 * **Details**
 *
 * `FORCE_COLOR` decides alone when present; otherwise a stream that is not a TTY has no colour; otherwise an ordered
 * rule table (disable variables, Windows, tmux, Azure, CI vendors, TeamCity, `TERM_PROGRAM`, `COLORTERM`, `TERM`)
 * decides, each rule a pure function of the environment record.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { ColorLevel } from "../ColorLevel.ts";
import type { Env } from "./types.ts";

// Some entries were taken from `dircolors`. The corresponding terminals might
// support more than 16 colours, but this was not tested for.
const TERM_ENVS = HashMap.fromIterable<string, ColorLevel>([
  ["eterm", "basic"],
  ["cons25", "basic"],
  ["console", "basic"],
  ["cygwin", "basic"],
  ["dtterm", "basic"],
  ["gnome", "basic"],
  ["hurd", "basic"],
  ["jfbterm", "basic"],
  ["konsole", "basic"],
  ["kterm", "basic"],
  ["mlterm", "basic"],
  ["mosh", "truecolor"],
  ["putty", "basic"],
  ["st", "basic"],
  ["rxvt-unicode-24bit", "truecolor"],
  ["terminator", "truecolor"],
  ["xterm-kitty", "truecolor"],
]);

// Iteration order is the precedence order, as in Node.
const CI_ENVS: ReadonlyArray<readonly [string, ColorLevel]> = [
  ["APPVEYOR", "256"],
  ["BUILDKITE", "256"],
  ["CIRCLECI", "truecolor"],
  ["DRONE", "256"],
  ["GITEA_ACTIONS", "truecolor"],
  ["GITHUB_ACTIONS", "truecolor"],
  ["GITLAB_CI", "256"],
  ["TRAVIS", "256"],
];

const TERM_ENVS_REG_EXP: ReadonlyArray<RegExp> = [
  /ansi/,
  /color/,
  /linux/,
  /direct/,
  /^con[0-9]*x[0-9]/,
  /^rxvt/,
  /^screen/,
  /^xterm/,
  /^vt100/,
  /^vt220/,
];

const isSet = (value: string | undefined): value is string => value !== undefined && value !== "";

/** A rule that decides the level when it applies and passes to the next rule otherwise. */
type ColorRule = (env: Env) => O.Option<ColorLevel>;

const when = (applies: boolean, level: ColorLevel): O.Option<ColorLevel> => (applies ? O.some(level) : O.none());

const disabled: ColorRule = (env) =>
  when(isSet(env.NODE_DISABLE_COLORS) || isSet(env.NO_COLOR) || env.TERM === "dumb", "none");

// Where Node's win32 branch sits: after the disable checks, before every TMUX, CI and TERM row.
const windows: ColorRule = (env) => when(env.OS === "Windows_NT", "truecolor");

const tmux: ColorRule = (env) => when(isSet(env.TMUX), "truecolor");

// Azure DevOps
const azure: ColorRule = (env) => when(env.TF_BUILD !== undefined && env.AGENT_NAME !== undefined, "basic");

// Under CI, the first vendor row present decides, then Codeship; any other CI has no colour.
const ci: ColorRule = (env) =>
  env.CI === undefined
    ? O.none()
    : O.some(
        O.getOrElse(
          A.findFirst(CI_ENVS, ([name, level]) => when(env[name] !== undefined, level)),
          (): ColorLevel => (env.CI_NAME === "codeship" ? "256" : "none")
        )
      );

const teamcity: ColorRule = (env) =>
  O.map(
    O.fromUndefinedOr(env.TEAMCITY_VERSION),
    (version): ColorLevel => (/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(version) ? "basic" : "none")
  );

const iTermLevel = (version: string | undefined): ColorLevel =>
  !isSet(version) || /^[0-2]\./.test(version) ? "256" : "truecolor";

const termProgram: ColorRule = (env) =>
  Match.value(env.TERM_PROGRAM).pipe(
    Match.when("iTerm.app", () => O.some(iTermLevel(env.TERM_PROGRAM_VERSION))),
    Match.whenOr("HyperTerm", "MacTerm", () => O.some<ColorLevel>("truecolor")),
    Match.when("Apple_Terminal", () => O.some<ColorLevel>("256")),
    Match.orElse(O.none<ColorLevel>)
  );

const trueColorTerm: ColorRule = (env) => when(env.COLORTERM === "truecolor" || env.COLORTERM === "24bit", "truecolor");

// A HashMap lookup, so a TERM such as "constructor" cannot reach Object.prototype.
const termLevel = (raw: string): O.Option<ColorLevel> => {
  if (/truecolor/.test(raw)) return O.some("truecolor");
  if (/^xterm-256/.test(raw)) return O.some("256");
  const term = Str.toLowerCase(raw);
  return O.orElse(HashMap.get(TERM_ENVS, term), () =>
    when(
      A.some(TERM_ENVS_REG_EXP, (re) => re.test(term)),
      "basic"
    )
  );
};

const term: ColorRule = (env) => (isSet(env.TERM) ? termLevel(env.TERM) : O.none());

// Move 16 colour COLORTERM below 16m and 256
const anyColorTerm: ColorRule = (env) => when(isSet(env.COLORTERM), "basic");

// The precedence order of Node's getColorDepth after its FORCE_COLOR branch.
const TABLE: ReadonlyArray<ColorRule> = [
  disabled,
  windows,
  tmux,
  azure,
  ci,
  teamcity,
  termProgram,
  trueColorTerm,
  term,
  anyColorTerm,
];

/**
 * The table: Node's getColorDepth with the FORCE_COLOR branch and warning removed, and its win32 branch keyed on
 * `OS=Windows_NT`.
 *
 * **Details**
 *
 * Node's win32 branch reads `process.platform` and the OS release: truecolor from Windows 10 build 14931, 256 colours
 * from build 10586, 16 before. Here the environment is read only through `Config`, so `OS=Windows_NT`, which Windows
 * sets system-wide and Git Bash keeps, stands in for the platform, and the branch gives truecolor. That approximates
 * Node on Windows 10 build 14931 and later; an older build gets more colour than Node would give it.
 */
const fromTable = (env: Env): ColorLevel =>
  O.getOrElse(
    A.findFirst(TABLE, (rule) => rule(env)),
    (): ColorLevel => "none"
  );

const forced = (value: string): ColorLevel =>
  Match.value(value).pipe(
    Match.whenOr("", "1", "true", (): ColorLevel => "basic"),
    Match.when("2", (): ColorLevel => "256"),
    Match.when("3", (): ColorLevel => "truecolor"),
    Match.orElse((): ColorLevel => "none")
  );

/**
 * The colour level of one stream. `FORCE_COLOR`, when present, decides alone (it beats `NO_COLOR`, as in
 * Node); otherwise a stream that is not a TTY has none; otherwise the terminal table decides, which gives a Windows
 * terminal (`OS=Windows_NT`) truecolor unless colour is disabled.
 *
 * **Example** (Force truecolor on a non-TTY stream)
 *
 * ```ts
 * import { colorDepth } from "@beep/runtime-env/internal/colorDepth";
 *
 * console.log(colorDepth({ FORCE_COLOR: "3", NO_COLOR: "1" }, false)) // truecolor
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const colorDepth: {
  (isTTY: boolean): (env: Env) => ColorLevel;
  (env: Env, isTTY: boolean): ColorLevel;
} = dual(2, (env: Env, isTTY: boolean): ColorLevel => {
  if (env.FORCE_COLOR !== undefined) return forced(env.FORCE_COLOR);
  return isTTY ? fromTable(env) : "none";
});

/**
 * Every environment variable name {@link colorDepth} reads, including the CI provider table.
 *
 * **Example** (Include the Windows platform signal)
 *
 * ```ts
 * import { colorKeys } from "@beep/runtime-env/internal/colorDepth";
 * import * as A from "effect/Array";
 *
 * console.log(A.contains(colorKeys, "OS")) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const colorKeys: ReadonlyArray<string> = [
  "FORCE_COLOR",
  "NO_COLOR",
  "NODE_DISABLE_COLORS",
  "OS",
  "TERM",
  "TMUX",
  "TF_BUILD",
  "AGENT_NAME",
  "CI",
  "CI_NAME",
  "TEAMCITY_VERSION",
  "TERM_PROGRAM",
  "TERM_PROGRAM_VERSION",
  "COLORTERM",
  ...A.map(CI_ENVS, ([name]) => name),
];
