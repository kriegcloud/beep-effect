/**
 * The append-only hunk ledger (`.agents/skill-patches/ledger.jsonl`, B20) and
 * the queries the review ritual and the replay report run over it.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { SkillsCommandError } from "../Skills.errors.ts";
import { SkillHunkLedgerRow } from "../SkillsReview.schemas.ts";
import { PATCH_ROOT } from "./PatchStaging.ts";

/**
 * File name of the ledger inside {@link PATCH_ROOT}.
 *
 * @internal
 * @category constants
 * @since 0.0.0
 */
export const HUNK_LEDGER_FILE = "ledger.jsonl";

/**
 * Repo-relative path of the hunk ledger.
 *
 * @internal
 * @category constants
 * @since 0.0.0
 */
export const HUNK_LEDGER_PATH = `${PATCH_ROOT}/${HUNK_LEDGER_FILE}`;

const LedgerRowJson = S.fromJsonString(SkillHunkLedgerRow);
const decodeLedgerRow = S.decodeUnknownEffect(LedgerRowJson);
const encodeLedgerRow = S.encodeEffect(LedgerRowJson);

/**
 * The fields that key a ledger row.
 *
 * @internal
 * @category models
 * @since 0.0.0
 */
export type HunkLedgerKey = Pick<
  SkillHunkLedgerRow,
  "skill" | "oldRevision" | "newRevision" | "patchSetHash" | "hunkHash"
>;

const sameKey = (left: HunkLedgerKey, right: HunkLedgerKey): boolean =>
  Str.Equivalence(left.skill, right.skill) &&
  Str.Equivalence(left.oldRevision, right.oldRevision) &&
  Str.Equivalence(left.newRevision, right.newRevision) &&
  Str.Equivalence(left.patchSetHash, right.patchSetHash) &&
  Str.Equivalence(left.hunkHash, right.hunkHash);

const sameHunk = (skill: string, hunkHash: string) => (row: SkillHunkLedgerRow) =>
  Str.Equivalence(row.skill, skill) && Str.Equivalence(row.hunkHash, hunkHash);

/**
 * Reads every ledger row in append order; a missing ledger is empty.
 *
 * **Details**
 *
 * Blank lines are skipped. A line that does not decode fails typed with its
 * line number, so a hand-mangled ledger never silently loses a decision.
 *
 * @internal
 * @category queries
 * @since 0.0.0
 */
export const readHunkLedger = Effect.fn("HunkLedger.read")(function* (
  repoRoot: string
): Effect.fn.Return<ReadonlyArray<SkillHunkLedgerRow>, SkillsCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolute = path.join(repoRoot, HUNK_LEDGER_PATH);
  const exists = yield* fs
    .exists(absolute)
    .pipe(SkillsCommandError.mapError(`Failed to inspect ${HUNK_LEDGER_PATH}.`, absolute));
  if (!exists) {
    return A.empty();
  }
  const text = yield* fs
    .readFileString(absolute)
    .pipe(SkillsCommandError.mapError(`Failed to read ${HUNK_LEDGER_PATH}.`, absolute));
  const lines = A.filter(
    A.map(Str.split("\n")(text), (line, index) => [index + 1, Str.trim(line)] as const),
    ([, line]) => Str.isNonEmpty(line)
  );
  return yield* Effect.forEach(lines, ([lineNumber, line]) =>
    decodeLedgerRow(line).pipe(
      SkillsCommandError.mapError(`${HUNK_LEDGER_PATH}:${lineNumber} is not a skills-hunk-ledger/v1 row.`, absolute)
    )
  );
});

/**
 * Appends rows to the ledger, one JSON object per line, creating it when absent.
 *
 * @internal
 * @category commands
 * @since 0.0.0
 */
export const appendHunkLedgerRows = Effect.fn("HunkLedger.append")(function* (
  repoRoot: string,
  rows: ReadonlyArray<SkillHunkLedgerRow>
): Effect.fn.Return<void, SkillsCommandError, FileSystem.FileSystem | Path.Path> {
  if (A.isReadonlyArrayEmpty(rows)) {
    return;
  }
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolute = path.join(repoRoot, HUNK_LEDGER_PATH);
  const lines = yield* Effect.forEach(rows, (row) =>
    encodeLedgerRow(row).pipe(SkillsCommandError.mapError(`Failed to encode a ${HUNK_LEDGER_PATH} row.`, absolute))
  );
  yield* fs
    .makeDirectory(path.dirname(absolute), { recursive: true })
    .pipe(SkillsCommandError.mapError(`Failed to create the parent of ${HUNK_LEDGER_PATH}.`, absolute));
  yield* fs
    .writeFileString(absolute, `${A.join(lines, "\n")}\n`, { flag: "a" })
    .pipe(SkillsCommandError.mapError(`Failed to append to ${HUNK_LEDGER_PATH}.`, absolute));
});

/**
 * The latest row recorded at exactly this key, if any: the resume check.
 *
 * @internal
 * @category queries
 * @since 0.0.0
 */
export const decisionAtKey: {
  (key: HunkLedgerKey): (rows: ReadonlyArray<SkillHunkLedgerRow>) => O.Option<SkillHunkLedgerRow>;
  (rows: ReadonlyArray<SkillHunkLedgerRow>, key: HunkLedgerKey): O.Option<SkillHunkLedgerRow>;
} = dual(
  2,
  (rows: ReadonlyArray<SkillHunkLedgerRow>, key: HunkLedgerKey): O.Option<SkillHunkLedgerRow> =>
    A.findLast(rows, (row) => sameKey(row, key))
);

/**
 * A hunk identity at one pin: what the two-strike query asks about.
 *
 * @internal
 * @category models
 * @since 0.0.0
 */
export type HunkAtPin = Pick<HunkLedgerKey, "skill" | "hunkHash" | "newRevision">;

/**
 * The two-strike query (B4): whether this hunk identity already had a
 * non-`applied` replay recorded at a different new revision.
 *
 * **Details**
 *
 * Clean bumps write no ledger rows, so "two consecutive bumps" is read as "a
 * recorded conflict at another pin, and a conflict again now". A hunk that is
 * re-cut gets a new identity, so the count restarts after a rebase.
 *
 * @internal
 * @category queries
 * @since 0.0.0
 */
export const isSecondStrike: {
  (hunk: HunkAtPin): (rows: ReadonlyArray<SkillHunkLedgerRow>) => boolean;
  (rows: ReadonlyArray<SkillHunkLedgerRow>, hunk: HunkAtPin): boolean;
} = dual(2, (rows: ReadonlyArray<SkillHunkLedgerRow>, hunk: HunkAtPin): boolean =>
  A.some(
    rows,
    (row) =>
      sameHunk(hunk.skill, hunk.hunkHash)(row) &&
      row.status !== "applied" &&
      !Str.Equivalence(row.newRevision, hunk.newRevision)
  )
);

/**
 * The earlier conflict decision `--ghost` would replay for a byte-identical hunk.
 *
 * **Details**
 *
 * The candidate is the latest non-`applied` row for the same skill and hunk
 * identity at the same new revision under a different key (the base pin or
 * the patch-set hash moved). A decision about a different pin never ghosts;
 * that recurrence is the two-strike case and goes to a human.
 *
 * @internal
 * @category queries
 * @since 0.0.0
 */
export const ghostCandidate: {
  (key: HunkLedgerKey): (rows: ReadonlyArray<SkillHunkLedgerRow>) => O.Option<SkillHunkLedgerRow>;
  (rows: ReadonlyArray<SkillHunkLedgerRow>, key: HunkLedgerKey): O.Option<SkillHunkLedgerRow>;
} = dual(
  2,
  (rows: ReadonlyArray<SkillHunkLedgerRow>, key: HunkLedgerKey): O.Option<SkillHunkLedgerRow> =>
    A.findLast(
      rows,
      (row) =>
        sameHunk(key.skill, key.hunkHash)(row) &&
        Str.Equivalence(row.newRevision, key.newRevision) &&
        !sameKey(row, key) &&
        row.status !== "applied"
    )
);

/**
 * The latest classifying row for a hunk identity: a labelled `keep` or a `drop`.
 *
 * @internal
 * @category queries
 * @since 0.0.0
 */
export const latestClassification: {
  (
    hunk: Pick<HunkLedgerKey, "skill" | "hunkHash">
  ): (rows: ReadonlyArray<SkillHunkLedgerRow>) => O.Option<SkillHunkLedgerRow>;
  (
    rows: ReadonlyArray<SkillHunkLedgerRow>,
    hunk: Pick<HunkLedgerKey, "skill" | "hunkHash">
  ): O.Option<SkillHunkLedgerRow>;
} = dual(
  2,
  (
    rows: ReadonlyArray<SkillHunkLedgerRow>,
    hunk: Pick<HunkLedgerKey, "skill" | "hunkHash">
  ): O.Option<SkillHunkLedgerRow> =>
    A.findLast(
      rows,
      (row) =>
        sameHunk(hunk.skill, hunk.hunkHash)(row) &&
        ((row.decision === "keep" && O.isSome(row.label)) || row.decision === "drop")
    )
);
