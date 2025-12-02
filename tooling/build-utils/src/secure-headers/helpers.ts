import * as A from "effect/Array";
export const encodeStrictURI = (uri: string | URL) => new URL(uri.toString()).toString();

export const wrapArray = <T>(value: T | readonly T[]): readonly T[] => (A.isArray(value) ? value as readonly T[] : A.make(value) as readonly T[]);
