import { pipe } from "effect/Function";
import * as Str from "effect/String";

/** What JavaScript's `.` does not match outside dotAll mode: the four line terminators. */
const isTerminator = (ch: string | undefined): boolean => ch === "\n" || ch === "\r" || ch === " " || ch === " ";

/** One UTF-16 unit of JavaScript's `\s`; every character `\s` matches is in the BMP. */
const isSpace = (ch: string | undefined): boolean => ch !== undefined && /\s/.test(ch);

const terminatorsOf = (text: string) => {
  let firstTerminator = -1;
  let lastTerminator = -1;
  for (let i = 0; i < text.length; i++) {
    if (!isTerminator(text[i])) continue;
    if (firstTerminator === -1) firstTerminator = i;
    lastTerminator = i;
  }
  return { firstTerminator, lastTerminator };
};

const spaceEnd = (text: string, start: number): number => {
  let end = start;
  while (isSpace(text[end])) end++;
  return end;
};

const isLocationStart = (text: string, at: number, lastTerminator: number): boolean =>
  text[at] === "(" && at <= text.length - 2 && lastTerminator < at;

/**
 * A frame text split as `fn (location)`: at the FIRST whitespace run followed by `(`, when the text ends with `)`.
 *
 * **Details**
 *
 * A linear scan with exactly the result of `/^(.*?)\s+\((.*)\)$/`, which backtracks polynomially on a long whitespace
 * run with no closing parenthesis. The split is the first one, not the last, because a location can hold parentheses
 * (an `eval` frame's `eval at <anonymous> (file:1:2), <anonymous>:1:1`). As with the regular expression, neither the
 * function nor the location may hold a line terminator, though the whitespace between them may.
 */
const terminatorBefore = (first: number, at: number): boolean => first !== -1 && first < at;

const wrappedFrame = (text: string): { readonly fn: string; readonly location: string } | undefined => {
  if (!Str.endsWith(")")(text)) return undefined;
  const { firstTerminator, lastTerminator } = terminatorsOf(text);
  let i = 0;
  while (i < text.length) {
    if (!isSpace(text[i])) {
      i++;
      continue;
    }
    // The function is everything before this run; once it would hold a terminator, every later one would too.
    if (terminatorBefore(firstTerminator, i)) return undefined;
    const j = spaceEnd(text, i);
    // `(` straight after the run, room for the closing `)`, and no terminator inside the location.
    if (isLocationStart(text, j, lastTerminator)) {
      return { fn: Str.slice(0, i)(text), location: Str.slice(j + 1, -1)(text) };
    }
    // Every later start inside this run reaches the same `j` and fails the same way.
    i = j;
  }
  return undefined;
};

/**
 * A frame's text without `at `, and its location: the part in parentheses, or the whole text when there are none.
 *
 * **Example** (Extract a stack frame location)
 *
 * ```ts
 * import { splitFrame } from "@beep/cli-kit/internal/splitFrame"
 * const frame = splitFrame("  at main (src/main.ts:4:2)  ")
 * console.log(frame.fn) // main
 * console.log(frame.location) // src/main.ts:4:2
 * ```
 *
 * @internal
 * @category parsing
 * @since 0.0.0
 */
export const splitFrame = (raw: string): { readonly text: string; readonly fn?: string; readonly location: string } => {
  const text = pipe(raw, Str.trim, Str.replace(/^at\s+/, ""));
  const wrapped = wrappedFrame(text);
  return {
    text,
    ...(wrapped === undefined || wrapped.fn === "" ? {} : { fn: wrapped.fn }),
    location: wrapped === undefined ? text : wrapped.location,
  };
};
