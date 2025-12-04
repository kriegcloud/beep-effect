import { FileExtension } from "@beep/schema/integrations/files/mime-types";
import { FileId } from "@beep/shared-domain/entity-ids/shared";
import * as S from "effect/Schema";

export class Filename extends S.TemplateLiteral(FileId, ".", FileExtension as S.Schema<string>) {
  static readonly decode = S.decode(Filename);
}

export declare namespace Filename {
  export type Type = typeof Filename.Type;
  export type Encoded = typeof Filename.Encoded;
}
