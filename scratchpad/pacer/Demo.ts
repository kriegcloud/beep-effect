/**
 * The shared PACER search demo: paginated `/cases/find` followed by
 * `/parties/find`, printed to the console. Used by both the mock and live
 * runners — only the provided transport differs.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Console, Effect, pipe, Stream } from "effect";
import * as O from "effect/Option";
import { CourtCaseSearchDto, PartySearchDto } from "./pcl/Pcl.models.ts";
import { PclClient } from "./pcl/PclClient.service.ts";
import type { PacerPclError } from "./Pacer.errors.ts";

const optionText = (value: O.Option<string>, fallback = ""): string => O.getOrElse(value, () => fallback);

/**
 * Run a case search (paginated) and a party search against whatever `PclClient`
 * transport is in context.
 *
 * @category programs
 * @since 0.0.0
 */
export const searchDemo: Effect.Effect<void, PacerPclError, PclClient> = Effect.gen(function* () {
  const pcl = yield* PclClient;

  yield* Console.log("→ POST /cases/find  (paginated via Stream.paginate over page=N)");
  const cases = yield* Stream.runCollect(
    pcl.streamCases(CourtCaseSearchDto.make({ caseNumberFull: O.some("1:2002bk20340") }))
  );
  yield* Console.log(`  ${cases.length} case(s) across all pages:`);
  yield* Effect.forEach(cases, (c) =>
    Console.log(`    • ${optionText(c.caseNumberFull, "?")}  "${optionText(c.caseTitle)}"  [${optionText(c.courtId)}]`)
  );

  yield* Console.log("→ POST /parties/find");
  const parties = yield* pcl.findParties(
    PartySearchDto.make({ lastName: O.some("Henderson"), firstName: O.some("Nicholas") })
  );
  const partyRows = pipe(parties.content, O.getOrElse(() => []));
  yield* Console.log(`  ${partyRows.length} part(y/ies):`);
  yield* Effect.forEach(partyRows, (p) =>
    Console.log(`    • ${optionText(p.lastName)}, ${optionText(p.firstName)}  (${optionText(p.caseNumberFull)})`)
  );

  yield* Console.log("→ batch: POST /cases/download → poll status → download → delete (Effect.ensuring)");
  const downloaded = yield* pcl.downloadCases(CourtCaseSearchDto.make({ caseNumberFull: O.some("1:2002bk20340") }));
  yield* Console.log(`  downloaded ${downloaded.length} case(s) via the batch lifecycle (report auto-deleted)`);
});
