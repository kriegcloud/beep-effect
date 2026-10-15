/**
 * The account-headroom parcel: its spec and the pure reducer from an accounts
 * report to anonymized per-account headroom.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import { dual } from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import { AccountHeadroom, AccountsReportOutcome, HeadroomWindow } from "./AccountHeadroom.models.ts";
import { checkFreshness, Freshness } from "./Freshness.ts";
import { ParcelSpec } from "./Parcel.models.ts";
import { makeParcelEnvelope, ParcelDraft } from "./ParcelEnvelope.models.ts";
import type * as DateTime from "effect/DateTime";
import type { AccountsReportInput, AccountsReportRow, AccountsReportWindow } from "./AccountHeadroom.models.ts";
import type { Freshness as FreshnessType } from "./Freshness.ts";
import type { ParcelBudget } from "./Parcel.models.ts";
import type { ParcelEnvelope } from "./ParcelEnvelope.models.ts";

/**
 * Spec of the account-headroom parcel: keyed by account, fresh for 5 minutes.
 *
 * **Example** (Read the freshness bound)
 *
 * ```ts
 * import { AccountHeadroomSpec } from "@beep/palantiri/AccountHeadroom"
 * import * as Duration from "effect/Duration"
 *
 * console.log(Duration.toMinutes(AccountHeadroomSpec.freshnessBound)) // 5
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const AccountHeadroomSpec = ParcelSpec.make({
  id: "account-headroom",
  key: "account",
  freshnessBound: Duration.minutes(5),
  sources: ["accounts-poll", "accounts-retained"],
});

const byLabel: Order.Order<AccountsReportRow> = Order.mapInput(Order.String, (row) => row.usage.account.label);

const toWindow = (window: AccountsReportWindow): HeadroomWindow =>
  HeadroomWindow.make({
    kind: window.kind,
    scope: window.scope,
    remainingPercent: Num.clamp(100 - window.usedPercent, { minimum: 0, maximum: 100 }),
    resetsAt: window.resetsAt,
  });

const toItem =
  (generatedAt: DateTime.Utc, provider: string) =>
  (row: AccountsReportRow, index: number): AccountHeadroom =>
    AccountsReportOutcome.match(row.usage.outcome, {
      Ok: (ok) =>
        AccountHeadroom.make({
          provider,
          account: index + 1,
          state: "ok",
          windows: A.map(ok.windows, toWindow),
          asOf: O.some(O.getOrElse(ok.asOf, () => generatedAt)),
          sources: [O.isSome(ok.asOf) ? "accounts-retained" : "accounts-poll"],
        }),
      NeedsLogin: () =>
        AccountHeadroom.make({
          provider,
          account: index + 1,
          state: "needs-login",
          windows: [],
          asOf: O.none(),
          sources: ["accounts-poll"],
        }),
      Failed: () =>
        AccountHeadroom.make({
          provider,
          account: index + 1,
          state: "failed",
          windows: [],
          asOf: O.none(),
          sources: ["accounts-poll"],
        }),
    });

/**
 * Every account of a report as an anonymized headroom item, ordered by
 * provider then ordinal.
 *
 * **Details**
 *
 * Each provider's accounts are numbered from 1 in label order. The label is
 * read only for that ordering. A live reading's `asOf` is the report's
 * `generatedAt`; a retained reading keeps its own.
 *
 * **Example** (No accounts, no items)
 *
 * ```ts
 * import { accountHeadroomItems } from "@beep/palantiri/AccountHeadroom"
 * import { AccountsReportInput } from "@beep/palantiri/AccountHeadroom.models"
 * import * as DateTime from "effect/DateTime"
 *
 * const report = AccountsReportInput.make({
 *   schemaVersion: "accounts-status/v2",
 *   generatedAt: DateTime.makeUnsafe("2026-10-14T12:00:00Z"),
 *   groups: []
 * })
 * console.log(accountHeadroomItems(report).length) // 0
 * ```
 *
 * @param report - The decoded accounts report.
 * @returns One item per account.
 * @category mapping
 * @since 0.0.0
 */
export const accountHeadroomItems = (report: AccountsReportInput): ReadonlyArray<AccountHeadroom> =>
  A.flatMap(
    A.sort(
      R.toEntries(
        A.groupBy(
          A.flatMap(report.groups, (group) => group.rows),
          (row) => row.usage.account.provider
        )
      ),
      Order.mapInput(Order.String, ([provider]: readonly [string, unknown]) => provider)
    ),
    ([provider, rows]) => A.map(A.sort(rows, byLabel), toItem(report.generatedAt, provider))
  );

const isAccountWide = (window: HeadroomWindow): boolean => window.kind === "weekly" || window.kind === "cycle";

const bestAccountWide = (items: ReadonlyArray<AccountHeadroom>): O.Option<string> =>
  O.map(
    A.match(
      A.flatMap(items, (item) =>
        A.map(A.filter(item.windows, isAccountWide), (window) => ({ item, remaining: window.remainingPercent }))
      ),
      {
        onEmpty: O.none,
        onNonEmpty: (candidates) =>
          O.some(
            A.max(
              candidates,
              Order.mapInput(Num.Order, (candidate: { readonly remaining: number }) => candidate.remaining)
            )
          ),
      }
    ),
    ({ item, remaining }) => `; most weekly headroom: ${item.provider} #${item.account} at ${Num.round(remaining, 0)}%`
  );

const countState = (items: ReadonlyArray<AccountHeadroom>, state: AccountHeadroom["state"]): number =>
  A.filter(items, (item) => item.state === state).length;

const summarize = (items: ReadonlyArray<AccountHeadroom>): string =>
  `${items.length} accounts: ${countState(items, "ok")} readable, ${countState(items, "needs-login")} need login, ${countState(items, "failed")} failed${O.getOrElse(bestAccountWide(items), () => "")}`;

const freshnessOf = (now: DateTime.Utc, items: ReadonlyArray<AccountHeadroom>): FreshnessType => {
  const asOfs = A.getSomes(A.map(items, (item) => item.asOf));
  return A.isReadonlyArrayNonEmpty(items) && A.isReadonlyArrayEmpty(asOfs)
    ? Freshness.cases.Unknown.make({
        reason: "unreachable",
        asOf: O.none(),
        detail: O.some("no account returned usage"),
      })
    : checkFreshness(now, AccountHeadroomSpec.freshnessBound, asOfs);
};

/**
 * Reduce an accounts report to the account-headroom parcel.
 *
 * **Details**
 *
 * Freshness comes from the oldest usable reading: older than 5 minutes is
 * `Unknown{stale}`. A report whose every account failed or needs login is
 * `Unknown{unreachable}`; a report with no accounts is `Unknown{no-source}`.
 * At most `budget` items are kept, with an N-of-M receipt.
 *
 * **Example** (Reduce an empty report)
 *
 * ```ts
 * import { reduceAccountHeadroom } from "@beep/palantiri/AccountHeadroom"
 * import { AccountsReportInput } from "@beep/palantiri/AccountHeadroom.models"
 * import * as DateTime from "effect/DateTime"
 *
 * const now = DateTime.makeUnsafe("2026-10-14T12:00:00Z")
 * const report = AccountsReportInput.make({ schemaVersion: "accounts-status/v2", generatedAt: now, groups: [] })
 * const parcel = reduceAccountHeadroom(report, now, 20)
 * console.log(parcel.freshness._tag) // "Unknown"
 * console.log(parcel.receipt.total) // 0
 * ```
 *
 * @param report - The decoded accounts report.
 * @param now - The read time.
 * @param budget - The most items to keep.
 * @returns The parcel envelope.
 * @category mapping
 * @since 0.0.0
 */
export const reduceAccountHeadroom: {
  (now: DateTime.Utc, budget: ParcelBudget): (report: AccountsReportInput) => ParcelEnvelope;
  (report: AccountsReportInput, now: DateTime.Utc, budget: ParcelBudget): ParcelEnvelope;
} = dual(3, (report: AccountsReportInput, now: DateTime.Utc, budget: ParcelBudget): ParcelEnvelope => {
  const items = accountHeadroomItems(report);
  return makeParcelEnvelope(
    ParcelDraft.make({
      spec: AccountHeadroomSpec,
      readAt: now,
      freshness: freshnessOf(now, items),
      summary: summarize(items),
      items,
      budget,
    })
  );
});
