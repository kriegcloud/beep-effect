import type * as Gmail from "@googleapis/gmail";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { GmailMethodError } from "../errors.ts";
import { GmailClient } from "./GmailClient.ts";

interface WrapGmailCallParams<A> {
  readonly operation: (client: Gmail.gmail_v1.Gmail) => Promise<A>;
  readonly failureMessage: string;
}

export const wrapGmailCall = Effect.fn("wrapGmailCall")(
  function* <A>(params: WrapGmailCallParams<A>) {
    const { client } = yield* GmailClient;
    return yield* Effect.tryPromise({
      try: async () => params.operation(client),
      catch: GmailMethodError.fromUnknown(params.failureMessage),
    });
  },
  Effect.tapErrorCause((cause) => F.pipe(cause, Cause.pretty, Effect.logError))
);
