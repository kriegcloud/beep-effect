import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { wrapGmailCall } from "../../common/wrap-gmail-call.ts";
import { Models } from "../../models";
import { DraftItem, Success, Wrapper } from "./contract";

export const Handler = Wrapper.implement(
  Effect.fn(
    function* (payload) {
      const listResp = yield* wrapGmailCall({
        operation: (client) => client.users.drafts.list(payload),
        failureMessage: "Failed to list drafts",
      });

      const drafts = listResp.data.drafts || [];
      if (A.isEmptyReadonlyArray(drafts)) {
        return yield* S.decodeUnknown(Success)({
          drafts: A.empty<DraftItem>(),
          nextPageToken: listResp.data.nextPageToken,
        });
      }

      const draftsWithIds = A.filterMap(drafts, (draft) =>
        O.fromNullable(draft.id).pipe(O.map((id) => ({ id, draft })))
      );

      const draftItems = yield* Effect.forEach(
        draftsWithIds,
        ({ id: draftId }) =>
          Effect.gen(function* () {
            const full = yield* wrapGmailCall({
              operation: (client) =>
                client.users.drafts.get({
                  userId: "me",
                  id: draftId,
                  format: "metadata",
                }),
              failureMessage: "Failed to fetch draft metadata",
            });

            const email = Models.parseMessageToEmail(full.data.message || {});
            return { id: draftId, message: email };
          }),
        { concurrency: "unbounded" }
      );

      return yield* S.decodeUnknown(Success)({
        drafts: draftItems,
        nextPageToken: listResp.data.nextPageToken,
      });
    },
    Effect.catchTag("ParseError", Effect.die)
  )
);
