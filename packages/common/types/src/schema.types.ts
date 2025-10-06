import type { UnsafeAny } from "@beep/types/unsafe.types";
import type * as S from "effect/Schema";
export type AnySchema = S.Schema<UnsafeAny, UnsafeAny, UnsafeAny>;

export type AnySchemaNoContext = S.Schema<UnsafeAny, UnsafeAny>;
