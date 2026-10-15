/**
 * The since-last-check parcel: its spec and the pure reducer from a session's
 * read cursor, the session ledger and the checkout inbox to what changed.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import { Freshness } from "./Freshness.ts";
import { plural } from "./internal/Plural.ts";
import { ParcelSpec } from "./Parcel.models.ts";
import { makeParcelEnvelope, ParcelDraft } from "./ParcelEnvelope.models.ts";
import { redactText } from "./Redaction.ts";
import { SessionChange } from "./SinceLastCheck.models.ts";
import type { InboxRowInput } from "./LaneReds.models.ts";
import type { ParcelBudget } from "./Parcel.models.ts";
import type { ParcelEnvelope } from "./ParcelEnvelope.models.ts";
import type { LedgerRowInput, SinceLastCheckInput } from "./SinceLastCheck.models.ts";

/**
 * Spec of the since-last-check parcel: keyed by session and event-sourced,
 * so it has no time bound (`Duration.infinity`).
 *
 * **Example** (The bound is infinite)
 *
 * ```ts
 * import { SinceLastCheckSpec } from "@beep/palantiri/SinceLastCheck"
 * import * as Duration from "effect/Duration"
 *
 * console.log(Duration.isFinite(SinceLastCheckSpec.freshnessBound)) // false
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SinceLastCheckSpec = ParcelSpec.make({
  id: "since-last-check",
  key: "session",
  freshnessBound: Duration.infinity,
  sources: ["session-ledger", "yeet-inbox", "session-cursor"],
});

/**
 * The moment changes are counted from: the session's cursor, else the
 * newest ledger row the session wrote itself, else `None` (everything).
 *
 * **Example** (No cursor and no own rows)
 *
 * ```ts
 * import { sinceLastCheckBaseline } from "@beep/palantiri/SinceLastCheck"
 * import { SinceLastCheckInput } from "@beep/palantiri/SinceLastCheck.models"
 * import * as O from "effect/Option"
 *
 * const input = SinceLastCheckInput.make({ cursor: O.none(), lane: "main", ledger: [], inbox: [], inboxReadable: true })
 * console.log(O.isNone(sinceLastCheckBaseline(input))) // true
 * ```
 *
 * @param input - The session's cursor and ledger rows.
 * @returns The baseline, if any.
 * @category utilities
 * @since 0.0.0
 */
export const sinceLastCheckBaseline = (input: SinceLastCheckInput): O.Option<DateTime.Utc> =>
  O.orElse(input.cursor, () =>
    A.match(
      A.map(
        A.filter(input.ledger, (row) => row.ownSession),
        (row) => row.recordedAt
      ),
      { onEmpty: O.none, onNonEmpty: (times) => O.some(A.max(times, DateTime.Order)) }
    )
  );

const isAfter =
  (baseline: O.Option<DateTime.Utc>) =>
  (at: DateTime.Utc): boolean =>
    O.match(baseline, { onNone: () => true, onSome: (since) => DateTime.isGreaterThan(at, since) });

const ledgerChange = (row: LedgerRowInput): SessionChange =>
  SessionChange.make({
    source: "ledger",
    lane: row.lane,
    branch: O.some(row.branch),
    state: O.some(row.state),
    kind: O.none(),
    severity: O.none(),
    prNumber: row.pr,
    text: redactText(O.getOrElse(row.summary, () => row.next)),
    at: row.recordedAt,
    freshness: Freshness.cases.Fresh.make({ asOf: row.recordedAt }),
  });

const inboxChange =
  (lane: string) =>
  (row: InboxRowInput, at: DateTime.Utc): SessionChange =>
    SessionChange.make({
      source: "inbox",
      lane,
      branch: O.none(),
      state: O.none(),
      kind: O.some(row.kind),
      severity: O.some(row.severity),
      prNumber: row.prNumber,
      text: redactText(row.summary),
      at,
      freshness: Freshness.cases.Fresh.make({ asOf: at }),
    });

const newestFirst: Order.Order<SessionChange> = Order.flip(
  Order.mapInput(DateTime.Order, (change: SessionChange) => change.at)
);

/**
 * Every ledger note and inbox row newer than the session's baseline, newest
 * first.
 *
 * **Details**
 *
 * Ledger rows the session wrote itself are left out. Acknowledged inbox
 * rows, and rows with no observation time, are left out. Every change is
 * `Fresh` as of its own time.
 *
 * **Example** (Nothing new)
 *
 * ```ts
 * import { sinceLastCheckItems } from "@beep/palantiri/SinceLastCheck"
 * import { SinceLastCheckInput } from "@beep/palantiri/SinceLastCheck.models"
 * import * as O from "effect/Option"
 *
 * const input = SinceLastCheckInput.make({ cursor: O.none(), lane: "main", ledger: [], inbox: [], inboxReadable: true })
 * console.log(sinceLastCheckItems(input).length) // 0
 * ```
 *
 * @param input - The session's cursor, the ledger rows and the inbox rows.
 * @returns The changes.
 * @category mapping
 * @since 0.0.0
 */
export const sinceLastCheckItems = (input: SinceLastCheckInput): ReadonlyArray<SessionChange> => {
  const after = isAfter(sinceLastCheckBaseline(input));
  return A.sort(
    A.appendAll(
      A.map(
        A.filter(input.ledger, (row) => !row.ownSession && after(row.recordedAt)),
        ledgerChange
      ),
      A.flatMap(input.inbox, (row) =>
        row.acked
          ? A.empty()
          : A.fromOption(O.map(O.filter(row.observedAt, after), (at) => inboxChange(input.lane)(row, at)))
      )
    ),
    newestFirst
  );
};

const summarize = (input: SinceLastCheckInput, items: ReadonlyArray<SessionChange>): string => {
  const since = O.match(sinceLastCheckBaseline(input), {
    onNone: () => "the first check",
    onSome: DateTime.formatIso,
  });
  const notes = A.filter(items, (item) => item.source === "ledger");
  const lanes = A.dedupe(A.map(notes, (item) => item.lane));
  const unreadable = input.inboxReadable ? "" : "; inbox unreadable";
  return A.match(items, {
    onEmpty: () => `nothing new since ${since}${unreadable}`,
    onNonEmpty: (changes) =>
      `${plural(changes.length, "change")} since ${since}: ${plural(notes.length, "session note")}${
        A.isReadonlyArrayNonEmpty(lanes) ? ` (${A.join(lanes, ", ")})` : ""
      }, ${plural(changes.length - notes.length, "inbox row")}${unreadable}`,
  });
};

/**
 * Reduce a session's cursor, the session ledger and the checkout inbox to the
 * since-last-check parcel.
 *
 * **Details**
 *
 * The parcel is event-sourced: it has no time bound, and every change is
 * `Fresh`. The envelope is `Fresh` as of `now`, or
 * `Unknown{attribution-incomplete}` when the checkout's inbox could not be
 * read. Changes are newest first; at most `budget` are kept with an N-of-M
 * receipt. Advancing the cursor is the service's job, not the reducer's.
 *
 * **Example** (First check with nothing recorded)
 *
 * ```ts
 * import { reduceSinceLastCheck } from "@beep/palantiri/SinceLastCheck"
 * import { SinceLastCheckInput } from "@beep/palantiri/SinceLastCheck.models"
 * import * as DateTime from "effect/DateTime"
 * import * as O from "effect/Option"
 *
 * const input = SinceLastCheckInput.make({ cursor: O.none(), lane: "main", ledger: [], inbox: [], inboxReadable: true })
 * const parcel = reduceSinceLastCheck(input, DateTime.makeUnsafe("2026-10-15T12:00:00Z"), 20)
 * console.log(parcel.summary) // "nothing new since the first check"
 * ```
 *
 * @param input - The session's cursor, the ledger rows and the inbox rows.
 * @param now - The read time.
 * @param budget - The most changes to keep.
 * @returns The parcel envelope.
 * @category mapping
 * @since 0.0.0
 */
export const reduceSinceLastCheck: {
  (now: DateTime.Utc, budget: ParcelBudget): (input: SinceLastCheckInput) => ParcelEnvelope;
  (input: SinceLastCheckInput, now: DateTime.Utc, budget: ParcelBudget): ParcelEnvelope;
} = dual(3, (input: SinceLastCheckInput, now: DateTime.Utc, budget: ParcelBudget): ParcelEnvelope => {
  const items = sinceLastCheckItems(input);
  return makeParcelEnvelope(
    ParcelDraft.make({
      spec: SinceLastCheckSpec,
      readAt: now,
      freshness: input.inboxReadable
        ? Freshness.cases.Fresh.make({ asOf: now })
        : Freshness.cases.Unknown.make({
            reason: "attribution-incomplete",
            asOf: O.some(now),
            detail: O.some("the checkout inbox could not be read"),
          }),
      summary: summarize(input, items),
      items,
      budget,
    })
  );
});
