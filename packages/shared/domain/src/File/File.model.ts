import * as Common from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain/EntityIds";
import * as M from "@effect/sql/Model";
import type * as S from "effect/Schema";
export class Model extends M.Class<Model>(`FileModel`)({
  /** Primary key identifier for the file */
  id: M.Generated(SharedEntityIds.FileId),
  _rowId: M.Generated(SharedEntityIds.FileId.privateSchema),
  ...Common.defaultColumns,
}) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
