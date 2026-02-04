import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/thread-summary/thread-summary.model");

export class Model extends M.Class<Model>($I`ThreadSummaryModel`)(
  makeFields(CommsEntityIds.ThreadSummaryId, {
    connectionId: CommsEntityIds.ConnectionId.annotations({
      description: "ID of the email connection this summary belongs to",
    }),

    threadId: S.String.annotations({
      description: "Provider's thread ID (Gmail/Outlook thread identifier)",
    }),

    summary: S.String.annotations({
      description: "AI-generated summary text of the email thread",
    }),

    keyPoints: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "JSON array of key points extracted from the thread",
      })
    ),

    sentiment: S.optional(S.Literal("positive", "negative", "neutral")).annotations({
      description: "Overall sentiment of the email thread",
    }),

    actionItems: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "JSON array of action items extracted from the thread",
      })
    ),

    generatedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "When this summary was generated",
    }),
  }),
  $I.annotations("ThreadSummaryModel", {
    title: "Thread Summary Model",
    description: "AI-generated email thread summary cache",
  })
) {
  static readonly utils = modelKit(Model);
}
