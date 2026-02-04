import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/get-thread/contract");

export const ThreadFormat = S.Literal("full", "metadata", "minimal");
export type ThreadFormat = S.Schema.Type<typeof ThreadFormat>;

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    threadId: S.String,
    format: S.optionalWith(ThreadFormat, { default: () => "full" as const }),
  },
  $I.annotations("PayloadFrom", {
    description: "GetThread payload input.",
  })
) {}

export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersThreadsGet, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    return GmailSchemas.GmailParamsResourceUsersThreadsGet.make({
      userId: "me",
      id: from.threadId,
      format: from.format,
    });
  }),
  encode: Effect.fnUntraced(function* (_to, _options, ast) {
    return yield* Effect.fail(
      new ParseResult.Type(ast, _to, "Encoding from Gmail API params to PayloadFrom is not supported")
    );
  }),
});

export type Payload = S.Schema.Type<typeof Payload>;

export class ThreadMessage extends Models.Email.extend<ThreadMessage>($I`ThreadMessage`)(
  {},
  $I.annotations("ThreadMessage", {
    description: "A message within a thread.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    id: S.String,
    historyId: S.optionalWith(S.String, { as: "Option" }),
    messages: S.Array(ThreadMessage),
  },
  $I.annotations("Success", {
    description: "GetThread success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("GetThread", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
