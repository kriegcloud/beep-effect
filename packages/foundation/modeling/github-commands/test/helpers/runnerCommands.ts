import * as A from "effect/Array";
import * as Str from "effect/String";

/**
 * What the GitHub Actions runner reads as a workflow command, written from the runner's own source and imported by
 * nothing in `src/`: `actions/runner`, `src/Runner.Common/ActionCommand.cs` and
 * `src/Runner.Worker/ActionCommandManager.cs` (`TryProcessCommand`). The runner tries two parsers on every line:
 *
 * - V2 (`TryParseV2`): `message.TrimStart()` with .NET's whitespace, then `StartsWith("::")`.
 * - legacy (`TryParse`): `message.IndexOf("##[")`, the `Prefix` constant, so `##[` is a command WHEREVER it occurs in
 *   the line. A bare `##`, with no `[` straight after it, is not a command.
 *
 * Lines are what .NET reading a stream gives: split at CRLF, CR or LF.
 */

/** The runner's line breaks. */
export const LINE_BREAK = /\r\n|\r|\n/;

const DOT_NET_WHITESPACE = /^[\u0009-\u000d\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/;

/**
 * .NET's `Char.IsWhiteSpace`, which is what `TrimStart` removes. Note U+0085 is in it and U+200B and U+FEFF are not.
 */
export const isDotNetWhitespace = (ch: string): boolean => DOT_NET_WHITESPACE.test(ch);

/** Would the runner read this one line as a command, by either parser. */
export const isCommand = (line: string): boolean => {
  let i = 0;
  while (i < line.length && isDotNetWhitespace(line[i] ?? "")) i++;
  return Str.slice(i, i + 2)(line) === "::" || Str.includes("##[")(line);
};

/** The lines of `text` the runner would read as a command. */
export const commandLines = (text: string): ReadonlyArray<string> => A.filter(Str.split(LINE_BREAK)(text), isCommand);
