import { $SharedAiId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SharedAiId.create("models/skills");

export class SkillMetadata extends S.Class<SkillMetadata>($I`SkillMetadata`)(
  {
    name: S.String,
    description: S.String,
    path: S.String,
  },
  $I.annotations("SkillMetadata", {
    description: "Metadata for a skill.",
  })
) {}

export class SkillContent extends S.Class<SkillContent>($I`SkillContent`)(
  {
    metadata: SkillMetadata,
    core: S.String,
    sections: S.HashMap({
      key: S.String,
      value: S.String,
    }),
  },
  $I.annotations("SkillContent", {
    description: "Metadata for a skill.",
  })
) {}
