import type { ReactNode } from "react";

export type FieldType = "string" | "number" | "boolean";

export interface AdditionalField {
  readonly description?: undefined | ReactNode;
  readonly instructions?: undefined | ReactNode;
  readonly label: ReactNode;
  readonly placeholder?: undefined | string;
  readonly required?: undefined | boolean;
  readonly type: FieldType;
  /**
   * Render a multi-line textarea for string fields
   */
  readonly multiline?: undefined | boolean;
  readonly validate?: undefined | ((value: string) => Promise<boolean>);
}

export interface AdditionalFields {
  readonly [key: string]: AdditionalField;
}
