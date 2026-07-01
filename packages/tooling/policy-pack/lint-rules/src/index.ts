/**
 * \@beep/lint-rules
 *
 * Repo-local Biome GritQL lint rules for effect-smol-aligned quality enforcement.
 * This module is the canonical registry of the GritQL rules shipped by the package:
 * each rule's slug, `.grit` file, advisory/mandatory severity, the CLI check it
 * supersedes (if any), and a one-line summary. Tooling (presets, the biome.jsonc
 * drift check, and the parity harness) reads the registry instead of hardcoding paths.
 *
 * @packageDocumentation
 * @since 0.1.0
 */

/**
 * Package version for `@beep/lint-rules`.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert/strict"
 * import { VERSION } from "@beep/lint-rules"
 *
 * strictEqual(VERSION, "0.1.0")
 * ```
 * @category configuration
 * @since 0.1.0
 */
export const VERSION = "0.1.0" as const;

/**
 * Slugs of the GritQL rules shipped by this package (one `.grit` file each).
 *
 * @example
 * ```ts
 * import { deepStrictEqual } from "node:assert/strict"
 * import { RULE_NAMES } from "@beep/lint-rules"
 *
 * deepStrictEqual(RULE_NAMES, [
 *   "no-native-error",
 *   "no-bigint-literals",
 *   "no-empty-named-blocks",
 *   "prefer-array-flat-map"
 * ])
 * ```
 * @category configuration
 * @since 0.1.0
 */
export const RULE_NAMES = [
  "no-native-error",
  "no-bigint-literals",
  "no-empty-named-blocks",
  "prefer-array-flat-map",
] as const;

/**
 * The slug of a single GritQL rule shipped by this package.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert/strict"
 * import type { RuleName } from "@beep/lint-rules"
 *
 * const name: RuleName = "prefer-array-flat-map"
 *
 * strictEqual(name, "prefer-array-flat-map")
 * ```
 * @category type-level
 * @since 0.1.0
 */
export type RuleName = (typeof RULE_NAMES)[number];

/**
 * Diagnostic severity used to gate a rule. `warn` is advisory (Biome exits 0);
 * `error` is mandatory (Biome exits 1). The advisory-to-mandatory transition flips
 * this value in the rule's `.grit` file.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert/strict"
 * import type { RuleSeverity } from "@beep/lint-rules"
 *
 * const severity: RuleSeverity = "warn"
 *
 * strictEqual(severity, "warn")
 * ```
 * @category type-level
 * @since 0.1.0
 */
export type RuleSeverity = "warn" | "error";

/**
 * Static metadata describing one GritQL rule. Internal: the public surface is the
 * `RULES` record, whose values are inferred from this shape.
 */
type RuleMetadata = {
  /** Rule slug; matches the `.grit` filename stem. */
  readonly name: RuleName;
  /** Current diagnostic severity baked into the `.grit` file. */
  readonly severity: RuleSeverity;
  /** The `bun run beep ...` CLI check this rule supersedes, if any. */
  readonly replaces: string | null;
  /** One-line description of what the rule flags. */
  readonly summary: string;
  /**
   * Glob-ish path scope, when the rule is registered via biome.jsonc `overrides`
   * rather than the top-level `plugins` array. `null` means repo-wide.
   */
  readonly scope: string | null;
};

/**
 * Canonical registry of GritQL rule metadata, keyed by rule slug.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert/strict"
 * import { RULES } from "@beep/lint-rules"
 *
 * strictEqual(RULES["no-bigint-literals"].severity, "warn")
 * strictEqual(RULES["prefer-array-flat-map"].severity, "error")
 * ```
 * @category configuration
 * @since 0.1.0
 */
export const RULES: { readonly [K in RuleName]: RuleMetadata } = {
  "no-native-error": {
    name: "no-native-error",
    severity: "error",
    replaces: "lint tooling-tagged-errors",
    summary: "Disallow native Error construction in tooling source; use TaggedErrorClass.",
    scope: "packages/tooling/**/src/**",
  },
  "no-bigint-literals": {
    name: "no-bigint-literals",
    severity: "warn",
    replaces: null,
    summary: "Disallow bigint literals (1n, 0xFFn, ...); use BigInt(value).",
    scope: "**/src/**",
  },
  "no-empty-named-blocks": {
    name: "no-empty-named-blocks",
    severity: "error",
    replaces: null,
    summary: 'Disallow empty named import blocks: `import {} from "..."`.',
    scope: null,
  },
  "prefer-array-flat-map": {
    name: "prefer-array-flat-map",
    severity: "error",
    replaces: null,
    summary: "Prefer `.flatMap(f)` over `.map(f).flat()`.",
    scope: null,
  },
} as const;

/**
 * Absolute filesystem path to a rule's `.grit` file, resolved relative to this
 * module so it works from `src/` (dev) and `dist/` (published) alike.
 *
 * @param name - The rule slug whose `.grit` file path to resolve.
 * @returns The absolute filesystem path to `<name>.grit`.
 * @example
 * ```ts
 * import { ok } from "node:assert/strict"
 * import { rulePath } from "@beep/lint-rules"
 *
 * const grit = rulePath("no-bigint-literals")
 *
 * ok(grit.endsWith("/rules/no-bigint-literals.grit"))
 * ```
 * @category configuration
 * @since 0.1.0
 */
export const rulePath = (name: RuleName): string =>
  decodeURIComponent(new URL(`../rules/${name}.grit`, import.meta.url).pathname);

/**
 * Absolute filesystem path to the directory holding the `.grit` rule files.
 *
 * @returns The absolute filesystem path to the `rules/` directory.
 * @example
 * ```ts
 * import { ok } from "node:assert/strict"
 * import { rulesDir } from "@beep/lint-rules"
 *
 * const dir = rulesDir()
 *
 * ok(dir.endsWith("/rules/"))
 * ```
 * @category configuration
 * @since 0.1.0
 */
export const rulesDir = (): string => decodeURIComponent(new URL("../rules/", import.meta.url).pathname);
