import { toastEffect } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { runtime } from "./layer";
import { Service } from "./service";

export const ConsentAtom = runtime.fn(
  F.flow(
    Service.lift("GrantOAuth2Consent"),
    toastEffect({
      onFailure: (e) =>
        Cause.failureOption(e.cause).pipe(
          O.match({
            onNone: O.none<string>,
            onSome: (e) => O.some(e.message),
          })
        ),
      onSuccess: "Consent granted successfully",
      onWaiting: "Granting consent...",
    }),
    Effect.ignore
  )
);

export const user = () => ({
  grantConsent: useAtomSet(ConsentAtom),
});
