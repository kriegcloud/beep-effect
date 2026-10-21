import { Footnote } from "@beep/law-practice-domain";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as A from "effect/Array";
import * as Str from "effect/String";

describe("Footnote.detectTextFootnotes", () => {
  it("detects supported markers and preserves their source spans", () => {
    const text = A.join(
      ["Body text.", "", "----------", "FN1. First footnote.", "[2] Second footnote.", "n.3 Third footnote."],
      "\n"
    );
    const zones = Footnote.detectTextFootnotes(text);

    expect(A.map(zones, ({ footnoteNumber }) => footnoteNumber)).toStrictEqual([1, 2, 3]);
    expect(A.map(zones, ({ start, end }) => ({ start, end }))).toStrictEqual([
      { start: 23, end: 44 },
      { start: 44, end: 65 },
      { start: 65, end: 84 },
    ]);
    expect(A.map(zones, ({ start, end }) => Str.slice(start, end)(text))).toStrictEqual([
      "FN1. First footnote.\n",
      "[2] Second footnote.\n",
      "n.3 Third footnote.",
    ]);
    expect(Str.slice(zones[0]?.start, zones[0]?.end)(text)).toContain("First footnote");
    expect(Str.slice(zones[2]?.start, zones[2]?.end)(text)).toContain("Third footnote");
  });

  it("ignores numbered body lists without a footnote separator", () => {
    const text = A.join(["The court considered:", "1. The first factor.", "2. The second factor."], "\n");

    expect(Footnote.detectTextFootnotes(text)).toStrictEqual([]);
  });

  it("caps the final footnote at a subsequent section heading", () => {
    const text = A.join(
      [
        "Body text.",
        "",
        "----------",
        "1. See 200 F.3d 100.",
        "",
        "GOVERNMENT BRIEF",
        "",
        "The court further holds that 400 F.3d 500 controls.",
      ],
      "\n"
    );
    const [zone] = Footnote.detectTextFootnotes(text);
    const footnoteText = Str.slice(zone?.start, zone?.end)(text);

    expect(footnoteText).toContain("200 F.3d 100");
    expect(footnoteText).not.toContain("GOVERNMENT BRIEF");
  });

  it("does not split indented numbered sub-lists into footnotes", () => {
    const text = A.join(
      [
        "Body text.",
        "",
        "----------",
        "1. The first footnote contains:",
        "  1. Sub-list item one.",
        "  2. Another sub-list item.",
        "2. The second real footnote.",
      ],
      "\n"
    );
    const zones = Footnote.detectTextFootnotes(text);

    expect(zones).toHaveLength(2);
    expect(Str.slice(zones[0]?.start, zones[0]?.end)(text)).toContain("Another sub-list item.");
  });
});
