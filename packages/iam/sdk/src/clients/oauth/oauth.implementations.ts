import { client } from "@beep/iam-sdk/adapters";
import { OAuthContractSet } from "@beep/iam-sdk/clients/oauth/oauth.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contractkit";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { OAuthRegisterPayload } from "./oauth.contracts";

const OAuthRegisterHandler = Effect.fn("OAuthRegisterHandler")(function* (payload: OAuthRegisterPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "OAuthRegisterContract",
    metadata: () => ({
      plugin: "oauth2",
      method: "register",
    }),
  });

  const encoded = yield* S.encode(OAuthRegisterPayload)(payload).pipe(
    Effect.catchTag("ParseError", (e) => Effect.dieMessage(e.message))
  );

  const result = yield* continuation.run(() => client.oauth2.register(encoded));

  yield* continuation.raiseResult(result);
});

export const OAuthImplementations = OAuthContractSet.of({
  OAuthRegisterContract: OAuthRegisterHandler,
});
