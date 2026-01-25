import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedAiId.create("sequential-thinking");

export class ThoughtData extends S.Class<ThoughtData>($I`ThoughtData`)(
  {
    thought: S.String,
    thoughtNumber: S.NonNegativeInt,
    totalThoughts: S.NonNegativeInt,
    isRevision: BS.OptionalAsOption(S.Boolean),
    revisesThought: BS.OptionalAsOption(S.NonNegativeInt),
    branchFromThought: BS.OptionalAsOption(S.NonNegativeInt),
    branchId: BS.OptionalAsOption(S.String),
    needsMoreThoughts: BS.OptionalAsOption(S.Boolean),
    nextThoughtNeeded: S.Boolean,
  },
  $I.annotations("ThoughtData", {
    description: "Data structure representing a single thought in sequential thinking",
  })
) {}

export declare namespace ThoughtData {
  export type Type = typeof ThoughtData.Type;
  export type Encoded = typeof ThoughtData.Encoded;
}

export class SequentialThinkingParams extends S.Class<SequentialThinkingParams>($I`SequentialThinkingParams`)(
  {
    thought: S.String,
    nextThoughtNeeded: S.Boolean,
    thoughtNumber: S.NonNegativeInt,
    totalThoughts: S.NonNegativeInt,
    isRevision: BS.OptionalAsOption(S.Boolean),
    revisesThought: BS.OptionalAsOption(S.NonNegativeInt),
    branchFromThought: BS.OptionalAsOption(S.NonNegativeInt),
    branchId: BS.OptionalAsOption(S.String),
    needsMoreThoughts: BS.OptionalAsOption(S.Boolean),
  },
  $I.annotations("SequentialThinkingParams", {
    description: "Parameters for sequential thinking operations",
  })
) {}

export declare namespace SequentialThinkingParams {
  export type Type = typeof SequentialThinkingParams.Type;
  export type Encoded = typeof SequentialThinkingParams.Encoded;
}
