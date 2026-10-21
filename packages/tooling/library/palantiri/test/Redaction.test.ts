import { redactText } from "@beep/palantiri";
import { describe, expect, it } from "@effect/vitest";
import * as Str from "effect/String";

describe("parcel redaction", () => {
  it.each([
    ["mail user@example.test now", "mail [email] now"],
    ["<a@b.test>,(c@d.test);'e@f.test'", "<[email]>,([email]);'[email]'"],
    ["a@b@c@d", "[email][email]"],
    ["a@@b @beep/palantiri", "ab beep/palantiri"],
    ["üser@例子.test", "[email]"],
    ["a@b\nc@d", "[email]\n[email]"],
    ["/home/alice/work /Users/bob/code /root/run", "$HOME/work $HOME/code $HOME/run"],
  ])("preserves redaction semantics for %s", (input, expected) => {
    expect(redactText(input)).toBe(expected);
  });

  it("handles long runs and failed domain matches without overlapping suffix scans", () => {
    const token = Str.repeat(128_000)("a");
    expect(redactText(token)).toBe(token);
    expect(redactText(`${token}@`)).toBe(token);
    expect(redactText(`@${token}`)).toBe(token);
    expect(redactText(`${token}@example.test`)).toBe("[email]");
    expect(redactText(`user@${token}`)).toBe("[email]");
    expect(redactText(`${token}@@${token}`)).toBe(`${token}${token}`);
    expect(redactText(`@beep/palantiri ${token} user@example.test`)).toBe(`beep/palantiri ${token} [email]`);
  });
});
