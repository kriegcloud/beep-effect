import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { ReasoningProfile } from "./ReasoningProfile";

const $I = $KnowledgeDomainId.create("value-objects/reasoning/ReasoningConfig");

const PositiveInt = S.Int.pipe(
  S.positive(),
  S.annotations({
    title: "Positive Integer",
    description: "A positive integer greater than 0",
  })
);

export class ReasoningConfig extends S.Class<ReasoningConfig>($I`ReasoningConfig`)({
  maxDepth: S.propertySignature(PositiveInt).pipe(S.withConstructorDefault(() => 10)),

  maxInferences: S.propertySignature(PositiveInt).pipe(S.withConstructorDefault(() => 10_000)),

  profile: S.propertySignature(ReasoningProfile).pipe(S.withConstructorDefault(() => "RDFS" as const)),
}) {}

export const DefaultReasoningConfig = new ReasoningConfig({});
