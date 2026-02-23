export type OmitProps = "error" | "value" | "onChange" | "onBlur" | "defaultValue" | "id" | "name";
export type DefaultOmit<T> = Omit<T, OmitProps>;
