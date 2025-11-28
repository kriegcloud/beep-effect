import { generate } from "canihazusername";
import { customAlphabet } from "nanoid";

export const generateFromUsername = (username: string, size = 4) => {
  username = username.toLowerCase().replaceAll(/[^\d_a-z]/g, "");

  return username + customAlphabet("0123456789", size)();
};

export const generateUsername = () => {
  return generate();
};
