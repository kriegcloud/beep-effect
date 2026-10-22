// Agent and CI detection from a pure env record. The agent table is transcribed, in order, from std-env 4.3.0
// (dist/index.mjs); CI detection is deliberately narrower than std-env's provider table.
/**
 * Agent and CI detection from a pure environment record.
 *
 * **Details**
 *
 * `AI_AGENT` names the agent family when set; otherwise std-env's agent table decides in its declared order. CI is
 * `github-actions` for an explicit provider signal and `generic` for any other truthy CI variable.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RuntimeEnvId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema/LiteralKit";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { Env } from "./types.ts";

const $I = $RuntimeEnvId.create("internal/agentCi");

const CiNameBase = LiteralKit(["github-actions", "generic"]);

/**
 * Names the CI providers recognized by the environment detector.
 *
 * **Example** (Validate a CI provider name)
 *
 * ```ts
 * import { CiName } from "@beep/runtime-env/internal/agentCi";
 * import * as S from "effect/Schema";
 *
 * console.log(S.is(CiName)("github-actions")) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const CiName = CiNameBase.pipe(
  $I.annoteSchema("CiName", {
    description: "GitHub Actions for its explicit provider signal, or generic for any other CI signal.",
    message: `Expected ${A.join(
      A.map(CiNameBase.literals, (name) => `"${name}"`),
      " | "
    )}`,
  })
);

/**
 * CI provider name accepted by the {@link CiName} schema.
 *
 * @category type-level
 * @since 0.0.0
 */
export type CiName = typeof CiName.Type;

type AgentRule =
  | readonly [name: string, keys: ReadonlyArray<string>]
  | readonly [name: string, test: (env: Env) => boolean];

const isSet = (value: string | undefined): value is string => value !== undefined && value !== "";

const matches: {
  (value: string | undefined, pattern: RegExp): boolean;
  (pattern: RegExp): (value: string | undefined) => boolean;
} = dual(2, (value: string | undefined, pattern: RegExp): boolean => isSet(value) && pattern.test(value));

// std-env's order decides between two matching rows. `pi` and `devin` match a pattern on a variable every
// shell sets, so they test the value rather than its presence.
//
// `kiro` (TERM_PROGRAM=kiro) is omitted: std-env gates it on a non-TTY stdout, and this detector is Config-only
// and never touches a stream.
const AGENT_RULES: ReadonlyArray<AgentRule> = [
  ["claude", ["CLAUDECODE", "CLAUDE_CODE"]],
  ["replit", ["REPL_ID"]],
  ["gemini", ["GEMINI_CLI"]],
  ["codex", ["CODEX_SANDBOX", "CODEX_THREAD_ID"]],
  ["opencode", ["OPENCODE"]],
  ["pi", (env) => matches(env.PATH, /\.pi[\\/]agent/)],
  ["auggie", ["AUGMENT_AGENT"]],
  ["goose", ["GOOSE_PROVIDER"]],
  ["junie", ["JUNIE_DATA", "JUNIE_SHIM_PATH"]],
  ["copilot", ["COPILOT_AGENT", "COPILOT_CLI"]],
  ["devin", (env) => matches(env.EDITOR, /devin/)],
  ["cursor", ["CURSOR_AGENT"]],
];

// The family names a free-form AI_AGENT value is folded into: every table row, plus `kiro`, which the table
// omits (see above) but which an agent can still announce through AI_AGENT.
const AGENT_FAMILIES: ReadonlyArray<string> = [...A.map(AGENT_RULES, ([name]) => name), "kiro"];

const COPILOT_ALIASES: ReadonlyArray<string> = ["github_copilot_vscode_agent", "github_copilot_cloud_agent"];

/** The family a lower-cased `AI_AGENT` value belongs to: equal to it, or starting with it then `-` or `_`. */
const familyOf = (value: string): string =>
  O.getOrElse(
    A.findFirst(
      AGENT_FAMILIES,
      (family) => value === family || Str.startsWith(`${family}-`)(value) || Str.startsWith(`${family}_`)(value)
    ),
    () => value
  );

/** The agent `AI_AGENT` announces, folded into its family, or `None` when it is unset. */
const announcedAgent = (env: Env): O.Option<string> =>
  O.map(O.liftPredicate(env.AI_AGENT, isSet), (raw) => {
    const name = Str.toLowerCase(raw);
    return A.contains(COPILOT_ALIASES, name) ? "copilot" : familyOf(name);
  });

const ruleMatches = (env: Env, rule: AgentRule[1]): boolean =>
  P.isFunction(rule) ? rule(env) : A.some(rule, (key) => isSet(env[key]));

/** The first std-env table row the environment matches. */
const tableAgent = (env: Env): O.Option<string> =>
  O.map(
    A.findFirst(AGENT_RULES, ([, rule]) => ruleMatches(env, rule)),
    ([name]) => name
  );

/**
 * The name of the AI agent running this process, if any, as its family: `claude`, not the
 * `claude-code_2-1-285_agent` Claude Code puts in `AI_AGENT`.
 *
 * **Details**
 *
 * `AI_AGENT` wins over every table row. It is lower-cased, the two `github_copilot_*` names collapse to
 * `copilot`, and a value that is a known family or starts with one followed by `-` or `_` becomes that family.
 * An unrecognized value is returned as it was lower-cased.
 *
 * **Example** (Normalize an explicit agent family)
 *
 * ```ts
 * import { detectAgent } from "@beep/runtime-env/internal/agentCi";
 * import * as O from "effect/Option";
 *
 * console.log(O.getOrNull(detectAgent({ AI_AGENT: "CLAUDE-code_2-1-285_agent" }))) // claude
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const detectAgent = (env: Env): O.Option<string> => O.orElse(announcedAgent(env), () => tableAgent(env));

// "" is falsy, as in detectAgent and std-env: an empty variable is an unset one.
const isTruthy = (value: string | undefined): boolean =>
  isSet(value) && Str.toLowerCase(value) !== "false" && value !== "0";

/**
 * The CI this process runs in: `github-actions` when `GITHUB_ACTIONS` is truthy (even under `CI=false`, since the
 * provider signal is explicit), else `generic` when `CI` or `CONTINUOUS_INTEGRATION` is truthy.
 *
 * **Example** (Prefer an explicit CI provider signal)
 *
 * ```ts
 * import { detectCi } from "@beep/runtime-env/internal/agentCi";
 * import * as O from "effect/Option";
 *
 * console.log(O.getOrNull(detectCi({ GITHUB_ACTIONS: "true", CI: "false" }))) // github-actions
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const detectCi = (env: Env): O.Option<CiName> => {
  if (isTruthy(env.GITHUB_ACTIONS)) return O.some("github-actions");
  if (isTruthy(env.CI) || isTruthy(env.CONTINUOUS_INTEGRATION)) return O.some("generic");
  return O.none();
};

/**
 * Every environment variable name the detectors read.
 *
 * **Example** (Locate the explicit agent override key)
 *
 * ```ts
 * import { agentCiKeys } from "@beep/runtime-env/internal/agentCi";
 * import * as A from "effect/Array";
 *
 * console.log(A.contains(agentCiKeys, "AI_AGENT")) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const agentCiKeys: ReadonlyArray<string> = [
  "AI_AGENT",
  ...A.flatMap(AGENT_RULES, ([, rule]) => (P.isFunction(rule) ? [] : rule)),
  "PATH",
  "EDITOR",
  "GITHUB_ACTIONS",
  "CI",
  "CONTINUOUS_INTEGRATION",
];
