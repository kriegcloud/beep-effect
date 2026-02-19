import { $WorkspacesDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";
import * as DocumentVersion from "../DocumentVersion.model";

const $I = $WorkspacesDomainId.create("entities/DocumentVersion/schemas/VersionWithAuthor.schema");

export const VersionWithAuthor = S.Struct({
  ...DocumentVersion.Model.json.fields,
  author: User.Model.select.pick("id", "_rowId", "name", "image"),
}).annotations(
  $I.annotations("VersionWithAuthor", {
    description: "Document version with author information for version history display.",
  })
);

export type VersionWithAuthor = typeof VersionWithAuthor.Type;
