/**
 * In-memory verdict-log store for tests, re-exported from the package's
 * `./test` surface.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import { VerdictLog } from "../ReviewQueue/ReviewQueue.ports.ts";
import type { VerdictRow } from "@beep/law-practice-domain";

/**
 * In-memory verdict-log store: an append-only chunk of rows held in a `Ref`.
 *
 * **Details**
 *
 * Each build of the layer starts from an empty log. It never fails, and its
 * appends are atomic, so concurrent writers inside one process cannot lose a
 * row. Meant for tests and examples; it keeps nothing across processes.
 *
 * **Example** (Append and read a row)
 *
 * ```ts
 * import { VerdictRow } from "@beep/law-practice-domain"
 * import { VerdictLog } from "@beep/law-practice-use-cases/ReviewQueue"
 * import { VerdictLogMemory } from "@beep/law-practice-use-cases/test"
 * import * as DateTime from "effect/DateTime"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const log = yield* VerdictLog
 *   yield* log.append(
 *     VerdictRow.make({
 *       itemId: "claim-finding:1",
 *       batchId: "sitting-1",
 *       verdict: "right",
 *       revision: 1,
 *       recordedAt: DateTime.makeUnsafe(0),
 *     })
 *   )
 *   console.log((yield* log.rows).length) // 1
 * }).pipe(Effect.provide(VerdictLogMemory))
 * ```
 *
 * @internal
 * @category layers
 * @since 0.0.0
 */
export const VerdictLogMemory: Layer.Layer<VerdictLog> = Layer.effect(
  VerdictLog,
  Effect.map(Ref.make(Chunk.empty<VerdictRow>()), (ref) =>
    VerdictLog.of({
      append: Effect.fn("VerdictLog.append")((row: VerdictRow) => Ref.update(ref, Chunk.append(row))),
      rows: Effect.map(Ref.get(ref), Chunk.toReadonlyArray),
    })
  )
);
