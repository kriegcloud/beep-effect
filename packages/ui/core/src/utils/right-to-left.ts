import * as Str from "effect/String";

/**
 * Prevents automatic RTL (right-to-left) flipping of a CSS declaration
 * by appending the `/* @noflip *\/` comment.
 *
 * @param {string} cssValue - A CSS declaration string (e.g., "margin-left: 10px;").
 * @returns {string} The same declaration string with the `/* @noflip *\/` comment appended.
 *
 * @example
 * noRtlFlip('margin-left: 10px;')  // 'margin-left: 10px; /* @noflip *\/'
 */
export function noRtlFlip(cssValue: unknown): string {
  if (typeof cssValue !== "string") {
    console.warn("Invalid CSS value provided");
    return "";
  }

  const trimmed = Str.trim(cssValue);

  if (!trimmed) {
    console.warn("Empty CSS value provided");
    return "";
  }

  if (Str.includes("/* @noflip */")(trimmed)) {
    return trimmed;
  }

  return `${trimmed} /* @noflip */`;
}
