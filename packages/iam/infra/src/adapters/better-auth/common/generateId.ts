import { createRandomStringGenerator } from "@better-auth/utils/random";

export const generateId = (size?: number | undefined) => {
  return createRandomStringGenerator("a-z", "A-Z", "0-9")(size || 32);
};
