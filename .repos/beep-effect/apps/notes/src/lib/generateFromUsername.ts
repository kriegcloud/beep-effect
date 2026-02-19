import { generate } from "canihazusername";
import { pipe } from "effect";
import * as Str from "effect/String";
import { customAlphabet } from "nanoid";
export const generateFromUsername = (username: string, size = 4) => {
  return pipe(username, Str.toLowerCase, Str.replaceAll(/[^\d_a-z]/g, "")) + customAlphabet("0123456789", size)();
};

export const generateUsername = () => {
  return generate();
};
