import type { PrimitiveTypes } from "./primitive.types.ts";

export type Builtin = PrimitiveTypes | Function | Date | Error | RegExp;
