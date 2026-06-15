import { Div, ELEMENT_META, HtmlNode, Input, Marquee, Script, Span, Text } from "@beep/html";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const decode = S.decodeUnknownSync(HtmlNode);
const encode = S.encodeSync(HtmlNode);

describe("HtmlNode AST — structure & nodes", () => {
  it("decodes and re-encodes a nested tree (JSON identity)", () => {
    const json = {
      _tag: "div",
      id: "root",
      class: "wrap",
      children: [
        { _tag: "span", children: [{ _tag: "#text", value: "hi" }] },
        { _tag: "img", src: "x.png", alt: "logo" },
      ],
    };
    const node = decode(json);
    expect(node._tag).toBe("div");
    expect(encode(node)).toStrictEqual(json);
  });

  it("provides .make constructors that auto-inject _tag", () => {
    expect(Div.make({ children: [] })._tag).toBe("div");
    expect(Span.make({ children: [] })._tag).toBe("span");
    expect(Text.make({ value: "x" })._tag).toBe("#text");
    expect(Marquee.make({ children: [] })._tag).toBe("marquee");
  });

  it("discriminates union members by _tag and rejects unknown tags", () => {
    expect(decode({ _tag: "span", children: [] })._tag).toBe("span");
    expect(() => decode({ _tag: "not-a-real-element", children: [] })).toThrow();
  });

  it("treats void elements as childless", () => {
    const img = decode({ _tag: "img", src: "a.png" });
    expect(img._tag).toBe("img");
    expect("children" in img).toBe(false);
  });

  it("models raw-text elements with a content field", () => {
    const script = Script.make({ content: "console.log(1)" });
    expect(script._tag).toBe("script");
    expect(script.content).toBe("console.log(1)");
    expect(encode(decode({ _tag: "style", content: ".a{}" }))).toStrictEqual({ _tag: "style", content: ".a{}" });
  });
});

describe("HtmlNode AST — attributes", () => {
  it("enforces enumerated attribute values (input[type])", () => {
    // `as const` keeps each value at its literal type, so `Input.make` actually
    // exercises that the `S.Literals` input-type union accepts every keyword.
    const types = [
      "button",
      "checkbox",
      "color",
      "date",
      "datetime-local",
      "email",
      "file",
      "hidden",
      "image",
      "month",
      "number",
      "password",
      "radio",
      "range",
      "reset",
      "search",
      "submit",
      "tel",
      "text",
      "time",
      "url",
      "week",
    ] as const;
    for (const type of types) {
      expect(() => Input.make({ type })).not.toThrow();
    }
    expect(() => decode({ _tag: "input", type: "not-a-type" })).toThrow();
  });

  it("accepts global, ARIA, event-handler, and data-* attributes on any element", () => {
    const json = {
      _tag: "button",
      id: "b",
      "aria-label": "Save",
      onclick: "save()",
      dataset: { testid: "save-btn" },
      children: [],
    };
    expect(encode(decode(json))).toStrictEqual(json);
  });
});

describe("ELEMENT_META", () => {
  it("covers every WHATWG element from the pinned dataset (conforming + obsolete)", () => {
    // Snapshot guard tied to the version-pinned webref dataset: a deliberate
    // re-pin / `bun run generate` that changes the element set should update this.
    expect(Object.keys(ELEMENT_META)).toHaveLength(142);
  });

  it("tags conformance, void, and raw-text correctly", () => {
    expect(ELEMENT_META.div?.conformance).toBe("conforming");
    expect(ELEMENT_META.img?.void).toBe(true);
    expect(ELEMENT_META.script?.rawText).toBe(true);
    expect(ELEMENT_META.a?.categories).toContain("flow");
  });

  it("includes obsolete elements as non-conforming", () => {
    for (const tag of ["marquee", "font", "frame", "frameset", "center", "big", "blink", "applet"]) {
      expect(ELEMENT_META[tag]?.conformance).toBe("non-conforming");
    }
  });
});
