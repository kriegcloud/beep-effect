import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { thunkEmptyStr } from "@beep/utils";
import * as A from "effect/Array";
import * as Encoding from "effect/Encoding";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

const $I = $SharedIntegrationsId.create("google/gmail/common/build-raw-email");

export class RawEmail extends S.Class<RawEmail>($I`RawEmail`)(
  {
    to: S.Array(BS.Email),
    subject: S.String,
    body: S.optionalWith(S.String, { default: thunkEmptyStr }),
    cc: S.optionalWith(S.Array(BS.Email), { default: A.empty<BS.Email.Type> }),
    bcc: S.optionalWith(S.Array(BS.Email), { default: A.empty<BS.Email.Type> }),
  },
  $I.annotations("RawEmail", {
    description: "Raw Email",
  })
) {
  readonly ccString = () => {
    if (A.isEmptyReadonlyArray(this.cc)) {
      return O.none<string>();
    }
    return O.some(`Cc: ${F.pipe(this.cc, A.map(Redacted.value), A.join(", "))}`);
  };

  readonly bccString = () => {
    if (A.isEmptyReadonlyArray(this.bcc)) {
      return O.none<string>();
    }
    return O.some(`Bcc: ${F.pipe(this.bcc, A.map(Redacted.value), A.join(", "))}`);
  };
  readonly toRawString = () =>
    F.pipe(
      A.make(
        // A.join(", ")(this.to)
        `To: ${F.pipe(this.to, A.map(Redacted.value), A.join(", "))}`,
        this.ccString().pipe(O.getOrNull),
        this.bccString().pipe(O.getOrNull),
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
