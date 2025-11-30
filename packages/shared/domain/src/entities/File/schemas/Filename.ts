import { FileExtension } from "@beep/schema/integrations";
import { SharedEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

export class Filename extends S.TemplateLiteral(SharedEntityIds.FileId, ".", FileExtension as S.Schema<string>) {
  static readonly decode = S.decode(Filename);
}

export declare namespace Filename {
  export type Type = typeof Filename.Type;
  export type Encoded = typeof Filename.Encoded;
}
