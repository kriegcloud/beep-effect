// @effect-diagnostics globalConsole:skip-file strictEffectProvide:skip-file
/**
 * Render the review page from fully synthetic cases, for UI checks that must
 * never see client data.
 *
 * Usage: bun scratchpad/party/scripts/review-page-demo.ts <out.html>
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { BunRuntime } from "@effect/platform-bun";
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import * as BunServices from "@effect/platform-bun/BunServices";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { IdentifierId } from "../Ids.ts";
import { UtcInstant } from "../Time.ts";
import { CollisionCase, mailboxParty, sealCase } from "../adapters/ReviewLoop.ts";
import { renderReviewPage } from "./ReviewPage.ts";

const mailbox = (email: string, domain: string, from: string, to: string) => {
  const identifiers = [IdentifierId.make(`ident:email:${encodeURIComponent(email)}`)] as const;
  return {
    party: mailboxParty(identifiers),
    identifiers,
    domains: [domain],
    firstSeen: O.some(UtcInstant.make(`${from}-01-01T00:00:00Z`)),
    lastSeen: O.some(UtcInstant.make(`${to}-01-01T00:00:00Z`)),
  };
};

const demo = Effect.fn("review-page-demo")(function* (out: string) {
  const cases = yield* Effect.forEach(
    [
      {
        name: "chris morgan",
        orgLead: "different-orgs-concurrent" as const,
        mailboxes: [
          mailbox("chris.morgan@acme.example", "acme.example", "2019", "2023"),
          mailbox("chris@acme.example", "acme.example", "2020", "2022"),
          mailbox("cmorgan@other.example", "other.example", "2019", "2024"),
        ],
      },
      {
        name: "dana brooks",
        orgLead: "same-org-alias" as const,
        mailboxes: [
          mailbox("dana@acme.example", "acme.example", "2018", "2024"),
          mailbox("dbrooks@acme.example", "acme.example", "2021", "2024"),
        ],
      },
      {
        name: "sam rivera",
        orgLead: "different-orgs-sequential" as const,
        mailboxes: [
          mailbox("sam@oldco.example", "oldco.example", "2015", "2018"),
          mailbox("sam.rivera@acme.example", "acme.example", "2019", "2025"),
        ],
      },
    ],
    (c) => sealCase({ ...c, shape: "full-name", outcome: "unresolved" })
  );
  const fs = yield* FileSystem.FileSystem;
  const json = yield* S.encodeEffect(CollisionCase.pipe(S.Array, S.fromJsonString))(cases);
  yield* fs.writeFileString(out, renderReviewPage(json));
  yield* Effect.log(`demo page with ${A.length(cases)} synthetic cases: ${out}`);
});

const [out] = A.drop(process.argv, 2);
if (out === undefined) {
  console.error("usage: review-page-demo.ts <out.html>");
  process.exit(2);
}
demo(out).pipe(Effect.provide(Layer.mergeAll(BunServices.layer, BunCrypto.layer)), BunRuntime.runMain);
