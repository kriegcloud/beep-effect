import { BS } from "@beep/schema";

export const formValuesAnnotation = (defaultValues: Record<string, any>) =>
  [undefined, { [BS.DefaultFormValuesAnnotationId]: defaultValues }, undefined] as const;
