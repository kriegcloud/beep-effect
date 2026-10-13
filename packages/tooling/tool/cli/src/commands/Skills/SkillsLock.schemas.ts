/**
 * `skills-lock/v2` document and lock-migration plan schemas.
 *
 * **Details**
 *
 * The v2 lock keeps one file with one entry per installed skill, as a tagged
 * union:
 *
 * - `vendored`: a skill with a ratified upstream. It carries the full
 *   immutable-origin, snapshot, license, provenance, patch, and effective-tree
 *   record (`SkillLockV2Entry`'s fields).
 * - `local`: a repo-authored skill. It carries only its installed targets and
 *   their mode-aware tree hash, which is the same drift oracle the v1
 *   `computedHash` provided.
 *
 * Migration from v1 is plan-first: {@link SkillsLockMigrationPlan} reports,
 * per skill, the disposition, the computed v2 entry, and every drifted path
 * classified as `upstream-advanced` or `local` against the tracking ref's
 * current upstream head (recorded as `upstreamHead`, the pin-bump target),
 * without writing anything.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit, Sha256Hex } from "@beep/schema";
import * as S from "effect/Schema";
import {
  SkillEffective,
  SkillGitRevision,
  SkillLicense,
  SkillPatches,
  SkillProvenance,
  SkillSnapshot,
  SkillSourceType,
  SkillUpstream,
} from "./Skills.schemas.ts";

const $I = $RepoCliId.create("commands/Skills/SkillsLock.schemas");

/**
 * A skill with a ratified upstream: the full warehouse record.
 *
 * **Example** (Inspect the tag)
 *
 * ```ts
 * import { VendoredSkillLockEntry } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 *
 * console.log(typeof VendoredSkillLockEntry.make) // "function"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class VendoredSkillLockEntry extends S.TaggedClass<VendoredSkillLockEntry>($I`VendoredSkillLockEntry`)(
  "vendored",
  {
    sourceType: SkillSourceType,
    upstream: SkillUpstream,
    snapshot: SkillSnapshot,
    license: SkillLicense,
    provenance: SkillProvenance,
    patches: SkillPatches,
    effective: SkillEffective,
  },
  $I.annote("VendoredSkillLockEntry", {
    description: "A ratified-upstream skill with snapshot, license, provenance, patch, and effective-tree identity.",
  })
) {}

/**
 * A repo-authored skill: installed targets and their tree hash.
 *
 * **Example** (Record a local skill)
 *
 * ```ts
 * import { LocalSkillLockEntry } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 *
 * const entry = LocalSkillLockEntry.make({
 *   installedTargets: [".claude/skills/yeet", ".agents/skills/yeet"],
 *   installedTreeHash: "0".repeat(64),
 * })
 * console.log(entry._tag) // "local"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class LocalSkillLockEntry extends S.TaggedClass<LocalSkillLockEntry>($I`LocalSkillLockEntry`)(
  "local",
  {
    installedTargets: S.Array(S.String),
    installedTreeHash: Sha256Hex,
  },
  $I.annote("LocalSkillLockEntry", {
    description: "A repo-authored skill identified by its installed targets' mode-aware tree hash.",
  })
) {}

/**
 * One `skills-lock/v2` entry: vendored or local.
 *
 * **Example** (Narrow an entry)
 *
 * ```ts
 * import { SkillsLockEntry } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 * import * as S from "effect/Schema"
 *
 * console.log(S.isSchema(SkillsLockEntry)) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SkillsLockEntry = S.Union([VendoredSkillLockEntry, LocalSkillLockEntry]).pipe(
  $I.annoteSchema("SkillsLockEntry", {
    description: "A skills-lock/v2 entry, tagged vendored or local.",
  })
);

/**
 * One `skills-lock/v2` entry: vendored or local.
 *
 * **Example** (Annotate an entry)
 *
 * ```ts
 * import type { SkillsLockEntry } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 *
 * const describe = (entry: SkillsLockEntry): string => entry._tag
 * console.log(typeof describe) // "function"
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type SkillsLockEntry = typeof SkillsLockEntry.Type;

/**
 * The canonical `skills-lock/v2` document, keyed by installed skill name.
 *
 * **Example** (Construct an empty document)
 *
 * ```ts
 * import { SkillsLockDocument } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 *
 * const lock = SkillsLockDocument.make({ version: 2, skills: {} })
 * console.log(lock.version) // 2
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SkillsLockDocument extends S.Class<SkillsLockDocument>($I`SkillsLockDocument`)(
  {
    version: S.Literal(2),
    skills: S.Record(S.String, SkillsLockEntry),
  },
  $I.annote("SkillsLockDocument", {
    description: "Canonical skills-lock/v2 document with vendored and local entries.",
  })
) {}

/**
 * How a skill moves from the v1 lock to v2.
 *
 * **Details**
 *
 * `vendored` has a ratified seed and becomes a full warehouse entry; `local`
 * stays repo-authored; `unresolved` is a v1 `github` entry without a ratified
 * seed. It stays local and is reported, never guessed.
 *
 * **Example** (Check a disposition)
 *
 * ```ts
 * import { SkillMigrationDisposition } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 *
 * console.log(SkillMigrationDisposition.is.unresolved("unresolved")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SkillMigrationDisposition = LiteralKit(["vendored", "local", "unresolved"]).pipe(
  $I.annoteSchema("SkillMigrationDisposition", {
    description: "Whether a skill migrates as vendored, local, or an unresolved upstream.",
  })
);

/**
 * How a skill moves from the v1 lock to v2.
 *
 * **Example** (Annotate a disposition)
 *
 * ```ts
 * import type { SkillMigrationDisposition } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 *
 * const disposition: SkillMigrationDisposition = "vendored"
 * console.log(disposition)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type SkillMigrationDisposition = typeof SkillMigrationDisposition.Type;

/**
 * Why an installed file differs from its pinned upstream.
 *
 * **Details**
 *
 * `upstream-advanced`: the installed bytes equal the same path at the
 * tracking ref's current upstream head, so the floating updater pulled newer
 * upstream content; the remedy is a pin bump, not a patch. `local`: no observed
 * upstream revision matches, so the delta is a repo customization and
 * becomes a patch.
 *
 * **Example** (Check a drift class)
 *
 * ```ts
 * import { SkillDriftClass } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 *
 * console.log(SkillDriftClass.is.local("local")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SkillDriftClass = LiteralKit(["upstream-advanced", "local"]).pipe(
  $I.annoteSchema("SkillDriftClass", {
    description: "Whether a drifted installed file matches newer upstream content or is a local customization.",
  })
);

/**
 * Why an installed file differs from its pinned upstream.
 *
 * **Example** (Annotate a drift class)
 *
 * ```ts
 * import type { SkillDriftClass } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 *
 * const drift: SkillDriftClass = "upstream-advanced"
 * console.log(drift)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type SkillDriftClass = typeof SkillDriftClass.Type;

/**
 * One drifted path of a vendored skill, classified.
 *
 * **Example** (Record a local customization)
 *
 * ```ts
 * import { SkillDriftRow } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 *
 * const row = SkillDriftRow.make({ path: "SKILL.md", driftClass: "local" })
 * console.log(row.driftClass)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SkillDriftRow extends S.Class<SkillDriftRow>($I`SkillDriftRow`)(
  {
    path: S.String,
    driftClass: SkillDriftClass,
  },
  $I.annote("SkillDriftRow", {
    description: "One installed path that differs from the pinned upstream snapshot, with its drift class.",
  })
) {}

/**
 * The migration outcome for one installed skill.
 *
 * **Example** (Record an unresolved skill)
 *
 * ```ts
 * import { LocalSkillLockEntry, SkillMigrationRow } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 *
 * const row = SkillMigrationRow.make({
 *   skill: "adhd",
 *   disposition: "unresolved",
 *   entry: LocalSkillLockEntry.make({ installedTargets: [], installedTreeHash: "0".repeat(64) }),
 *   drift: [],
 *   note: "v1 github entry without a ratified resolution seed",
 * })
 * console.log(row.disposition)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SkillMigrationRow extends S.Class<SkillMigrationRow>($I`SkillMigrationRow`)(
  {
    skill: S.String,
    disposition: SkillMigrationDisposition,
    entry: SkillsLockEntry,
    drift: S.Array(SkillDriftRow),
    upstreamHead: S.optionalKey(SkillGitRevision),
    note: S.optionalKey(S.String),
  },
  $I.annote("SkillMigrationRow", {
    description: "One skill's v1-to-v2 disposition, computed entry, and classified drift.",
  })
) {}

/**
 * `skills-lock-migration-plan/v1`: the read-only v1-to-v2 lock migration report.
 *
 * **Example** (Construct an empty plan)
 *
 * ```ts
 * import { SkillsLockMigrationPlan } from "@beep/repo-cli/commands/Skills/SkillsLock.schemas"
 *
 * const plan = SkillsLockMigrationPlan.make({ rows: [] })
 * console.log(plan.schemaVersion) // "skills-lock-migration-plan/v1"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SkillsLockMigrationPlan extends S.Class<SkillsLockMigrationPlan>($I`SkillsLockMigrationPlan`)(
  {
    schemaVersion: S.tag("skills-lock-migration-plan/v1"),
    rows: S.Array(SkillMigrationRow),
  },
  $I.annote("SkillsLockMigrationPlan", {
    description: "Read-only per-skill v1-to-v2 lock migration report, sorted by skill name.",
  })
) {}
