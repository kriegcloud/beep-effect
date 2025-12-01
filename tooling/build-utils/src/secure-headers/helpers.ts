import * as A from "effect/Array";
export const encodeStrictURI = (uri: string | URL) => new URL(uri.toString()).toString();

export const wrapArray = <T>(value: T | T[]): T[] => (A.isArray(value) ? value : A.make(value));
