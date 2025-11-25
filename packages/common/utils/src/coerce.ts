export type CoercedTrue<T extends boolean | undefined> = T extends undefined ? true : T;
export type CoercedFalse<T extends boolean | undefined> = T extends undefined ? false : T;

export const coerceTrue = <T extends boolean | undefined>(value: T): CoercedTrue<T> => {
  return (value ?? true) as CoercedTrue<T>;
};

export const coerceFalse = <T extends boolean | undefined>(value: T): CoercedFalse<T> => {
  return (value ?? false) as CoercedFalse<T>;
};
