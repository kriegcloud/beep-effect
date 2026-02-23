import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
export const formValuesAnnotation = (defaultValues: Record<string, UnsafeTypes.UnsafeAny>) =>
  [undefined, { [BS.DefaultFormValuesAnnotationId]: defaultValues }, undefined] as const;
