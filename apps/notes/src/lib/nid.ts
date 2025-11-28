import { generateRandomString, type RandomReader } from "@oslojs/crypto/random";

const random: RandomReader = {
  read(bytes: Uint8Array): void {
    crypto.getRandomValues(bytes);
  },
};

/**
 * Generates a unique identifier with an optional prefix. Use custom alphabet
 * without special chars for less chaotic, copy-able URLs Will not collide for a
 * long time: https://zelark.github.io/nano-id-cc/
 *
 * @param {string} [prefix] - The prefix to include in the identifier.
 */
export const nid = () => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";

  return generateRandomString(random, alphabet, 15);
};
