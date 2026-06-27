import * as Schema from "effect/Schema";

export const ModelFamily = Schema.Literals(["qwen3.6-uncensored:35b", "llama3.2"]);
export type ModelFamily = typeof ModelFamily.Type;
