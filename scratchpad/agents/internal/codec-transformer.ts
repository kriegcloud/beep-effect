import { Struct } from "@beep/utils";
import { JsonSchema } from "effect";
import * as S from "effect/Schema";
import type { CodecTransformer } from "../LanguageModel.ts";
/** @internal */
export const defaultCodecTransformer: CodecTransformer = (codec) => {
  const document = JsonSchema.resolveTopLevel$ref(S.toJsonSchemaDocument(codec));
  const jsonSchema = { ...document.schema };
  if (Struct.keys(document.definitions).length > 0) {
    jsonSchema.$defs = document.definitions;
  }
  return { codec, jsonSchema };
};
