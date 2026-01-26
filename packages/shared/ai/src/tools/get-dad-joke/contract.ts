import * as Tool from "@effect/ai/Tool";
import * as S from "effect/Schema";

export const Contract = Tool.make("GetDadJoke", {
  description: "Get a hilarious dad joke from the ICanHazDadJoke API",
  success: S.String,
  failure: S.Never,
  parameters: {
    searchTerm: S.String.annotations({
      description: "The search term to use to find dad jokes",
    }),
  },
});
