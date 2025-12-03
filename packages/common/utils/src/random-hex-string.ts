import * as Str from "effect/String";

export const randomHexString = (() => {
  const characters = "abcdef0123456789";
  const charactersLength = Str.length(characters);
  return (length: number) => {
    let result = Str.empty;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
})();
