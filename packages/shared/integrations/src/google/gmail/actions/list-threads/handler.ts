import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Success, ThreadListItem, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const response = yield* wrapGmailCall({
        operation: (client) => client.users.threads.list(payload),
        failureMessage: "Failed to list threads",
      });

      const data = response.data;
      const rawThreads = data.threads || [];

      const threads = A.map(rawThreads, (thread) => ({
        id: thread.id || "",
        snippet: thread.snippet ?? undefined,
        historyId: thread.historyId ?? undefined,
      }));

      return yield* S.decode(Success)({
        threads: yield* S.decode(S.Array(ThreadListItem))(threads),
        nextPageToken: data.nextPageToken ?? undefined,
        resultSizeEstimate: data.resultSizeEstimate ?? undefined,
      });
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
