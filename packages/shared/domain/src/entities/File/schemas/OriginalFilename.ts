import { FileExtension, type FileInstance } from "@beep/schema/integrations";
import * as S from "effect/Schema";

export class OriginalFilename extends S.TemplateLiteral(S.String, ".", FileExtension as S.Schema<string>) {
  static readonly fromFileInstance = (fileInstance: FileInstance.Type) =>
    S.decodeUnknown(OriginalFilename)(fileInstance);
}

export declare namespace OriginalFilename {
  export type Type = typeof OriginalFilename.Type;
  export type Encoded = typeof OriginalFilename.Encoded;
}
