import type * as S from "effect/Schema";
import type { UnsafeAny } from "./unsafe.types.js";
export type AnySchema = S.Schema<UnsafeAny, UnsafeAny, UnsafeAny>;

export type AnySchemaNoContext = S.Schema<UnsafeAny, UnsafeAny>;
