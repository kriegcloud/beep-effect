import { $SharedIntegrationsId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Encoding from "effect/Encoding";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SharedIntegrationsId.create("google/gmail/common/build-raw-email");

export class RawEmail extends S.Class<RawEmail>($I`RawEmail`)(
  {
    to: S.Array(S.String),
    subject: S.String,
    body: S.String,
    cc: S.optional(S.Array(S.String)),
    bcc: S.optional(S.Array(S.String)),
  },
  $I.annotations("RawEmail", {
    description: "Raw Email",
  })
) {
  readonly raw = () =>
    F.pipe(
      A.make(
        `To: ${A.join(", ")(this.to)}`,
        O.fromNullable(this.cc).pipe(
          O.flatMap(O.liftPredicate(A.isNonEmptyReadonlyArray)),
          O.map(A.join(", ")),
          O.map((ccStr) => `Cc: ${ccStr}`),
          O.getOrNull
        ),
        O.fromNullable(this.bcc).pipe(
          O.flatMap(O.liftPredicate(A.isNonEmptyReadonlyArray)),
          O.map(A.join(", ")),
          O.map((bccStr) => `Cc: ${bccStr}`),
          O.getOrNull
        ),
        `Subject: ${this.subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=utf-8",
        "Content-Transfer-Encoding: 7bit",
        "",
        this.body
      ),
      A.filter(P.isNotNullable),
      A.join("\r\n"),
      Encoding.encodeBase64Url
    );
}
