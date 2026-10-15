/**
 * The app-error-classes parcel: its spec and the reducer that answers
 * honestly while no telemetry query adapter exists.
 *
 * **Details**
 *
 * App error classes would come from a query against the app telemetry store
 * (the Grafana datasource of the local dev sink). That sink exposes no query
 * API today, so there is no source port yet: the parcel is served as
 * `Unknown{no-source}` with no items, naming the missing adapter.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as Duration from "effect/Duration";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import { Freshness } from "./Freshness.ts";
import { ParcelSpec } from "./Parcel.models.ts";
import { makeParcelEnvelope, ParcelDraft } from "./ParcelEnvelope.models.ts";
import type * as DateTime from "effect/DateTime";
import type { ParcelBudget } from "./Parcel.models.ts";
import type { ParcelEnvelope } from "./ParcelEnvelope.models.ts";

/**
 * Spec of the app-error-classes parcel: keyed by app, fresh for 15 minutes
 * once a source exists.
 *
 * **Example** (Read the source)
 *
 * ```ts
 * import { AppErrorClassesSpec } from "@beep/palantiri/AppErrorClasses"
 *
 * console.log(AppErrorClassesSpec.sources) // ["grafana-query"]
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const AppErrorClassesSpec = ParcelSpec.make({
  id: "app-error-classes",
  key: "app",
  freshnessBound: Duration.minutes(15),
  sources: ["grafana-query"],
});

/**
 * Why the parcel has no source, carried as the envelope's freshness detail.
 *
 * **Example** (Read the detail)
 *
 * ```ts
 * import { AppErrorClassesMissingSource } from "@beep/palantiri/AppErrorClasses"
 *
 * console.log(AppErrorClassesMissingSource.startsWith("no telemetry query adapter")) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const AppErrorClassesMissingSource =
  "no telemetry query adapter: the local dev sink exposes no query API, so the grafana-query adapter is not built yet";

/**
 * Serve the app-error-classes parcel: `Unknown{no-source}`, no items, and a
 * summary saying why.
 *
 * **Example** (Read the parcel)
 *
 * ```ts
 * import { reduceAppErrorClasses } from "@beep/palantiri/AppErrorClasses"
 * import * as DateTime from "effect/DateTime"
 *
 * const parcel = reduceAppErrorClasses(DateTime.makeUnsafe("2026-10-15T12:00:00Z"), 20)
 * console.log(parcel.freshness._tag === "Unknown" ? parcel.freshness.reason : "fresh") // "no-source"
 * console.log(parcel.receipt.total) // 0
 * ```
 *
 * @param now - The read time.
 * @param budget - The most items to keep.
 * @returns The parcel envelope.
 * @category mapping
 * @since 0.0.0
 */
export const reduceAppErrorClasses: {
  (budget: ParcelBudget): (now: DateTime.Utc) => ParcelEnvelope;
  (now: DateTime.Utc, budget: ParcelBudget): ParcelEnvelope;
} = dual(
  2,
  (now: DateTime.Utc, budget: ParcelBudget): ParcelEnvelope =>
    makeParcelEnvelope(
      ParcelDraft.make({
        spec: AppErrorClassesSpec,
        readAt: now,
        freshness: Freshness.cases.Unknown.make({
          reason: "no-source",
          asOf: O.none(),
          detail: O.some(AppErrorClassesMissingSource),
        }),
        summary: "app error classes unavailable: no telemetry query adapter exists yet",
        items: [],
        budget,
      })
    )
);
