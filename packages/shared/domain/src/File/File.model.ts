import { makeFields } from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain/EntityIds";
import * as M from "@effect/sql/Model";
import type * as S from "effect/Schema";

export class Model extends M.Class<Model>(`FileModel`)(
  makeFields(SharedEntityIds.FileId, {
    /** Organization ID Reference */
    organizationId: SharedEntityIds.OrganizationId,
  })
) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
