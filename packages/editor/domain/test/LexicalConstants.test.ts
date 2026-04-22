import * as LC from "@beep/editor-domain/Domain/LexicalConstants";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const rtlValue = "\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC";
const ltrValue =
  "A-Za-z\u00C0-\u00D6\u00D8-\u00F6" +
  "\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u200E\u2C00-\uFB1C" +
  "\uFE00-\uFE6F\uFEFD-\uFFFF";
const upstreamDetailTypeTypo = ["u", "n", "m", "e", "r", "g", "a", "b", "l", "e"].join("");

describe("LexicalConstants", () => {
  it("decodes representative literal constants and rejects neighboring values", () => {
    const cases = [
      { decode: S.decodeUnknownSync(LC.NodeStateKey), valid: "$", invalid: "$config" },
      { decode: S.decodeUnknownSync(LC.DOMElementType), valid: 1, invalid: 2 },
      { decode: S.decodeUnknownSync(LC.DOMDocumentType), valid: 9, invalid: 8 },
      { decode: S.decodeUnknownSync(LC.NoDirtyNodes), valid: 0, invalid: 1 },
      { decode: S.decodeUnknownSync(LC.FullReconcile), valid: 2, invalid: 3 },
      { decode: S.decodeUnknownSync(LC.IsItalic), valid: 2, invalid: 1 },
      { decode: S.decodeUnknownSync(LC.IsCapitalize), valid: 1024, invalid: 512 },
      { decode: S.decodeUnknownSync(LC.IsAllFormatting), valid: 2047, invalid: 2046 },
      { decode: S.decodeUnknownSync(LC.IsUnmergeable), valid: 2, invalid: 1 },
      { decode: S.decodeUnknownSync(LC.IsAlignEnd), valid: 6, invalid: 5 },
      { decode: S.decodeUnknownSync(LC.NonBreakingSpace), valid: "\u00A0", invalid: "\u200b" },
      { decode: S.decodeUnknownSync(LC.DoubleLineBreak), valid: "\n\n", invalid: "\n" },
      { decode: S.decodeUnknownSync(LC.PrototypeConfigMethod), valid: "$config", invalid: "$" },
    ] as const;

    for (const { decode, valid, invalid } of cases) {
      expect(decode(valid)).toBe(valid);
      expect(() => decode(invalid)).toThrow();
    }
  });

  it("preserves LiteralKit helpers for the exported literal domains", () => {
    expect(LC.TextFormatType.Options).toEqual([
      "bold",
      "underline",
      "strikethrough",
      "italic",
      "highlight",
      "code",
      "subscript",
      "superscript",
      "lowercase",
      "uppercase",
      "capitalize",
    ]);
    expect(LC.TextModeType.Enum.normal).toBe("normal");
    expect(LC.ElementFormatType.Enum.justify).toBe("justify");
    expect(LC.TextDetailType.is.unmergeable("unmergeable")).toBe(true);
  });

  it("uses the runtime detail key spelling instead of the upstream typo", () => {
    const decodeTextDetailType = S.decodeUnknownSync(LC.TextDetailType);

    expect(decodeTextDetailType("directionless")).toBe("directionless");
    expect(decodeTextDetailType("unmergeable")).toBe("unmergeable");
    expect(() => decodeTextDetailType(upstreamDetailTypeTypo)).toThrow();
  });

  it("accepts only the allowed composition helper characters", () => {
    const decodeCompositionSuffix = S.decodeUnknownSync(LC.CompositionSuffix);
    const decodeCompositionStartChar = S.decodeUnknownSync(LC.CompositionStartChar);

    for (const value of ["\u00A0", "\u200b"] as const) {
      expect(decodeCompositionSuffix(value)).toBe(value);
      expect(decodeCompositionStartChar(value)).toBe(value);
    }

    expect(() => decodeCompositionSuffix("x")).toThrow();
    expect(() => decodeCompositionStartChar("x")).toThrow();
  });

  it("accepts only the exact Lexical direction-detection regexes", () => {
    const decodeRTLRegex = S.decodeUnknownSync(LC.RTLRegex);
    const decodeLTRRegex = S.decodeUnknownSync(LC.LTRRegex);

    expect(decodeRTLRegex(new RegExp(`^[^${ltrValue}]*[${rtlValue}]`)).source).toBe(`^[^${ltrValue}]*[${rtlValue}]`);
    expect(decodeLTRRegex(new RegExp(`^[^${rtlValue}]*[${ltrValue}]`)).source).toBe(`^[^${rtlValue}]*[${ltrValue}]`);

    expect(() => decodeRTLRegex(/rtl/)).toThrow("Expected the exact Lexical RTL regular expression.");
    expect(() => decodeLTRRegex(/ltr/)).toThrow("Expected the exact Lexical LTR regular expression.");
  });

  it("decodes the exact text and detail lookup tables", () => {
    const decodeTextTypeToFormat = S.decodeUnknownSync(LC.TextTypeToFormat);
    const decodeDetailTypeToDetail = S.decodeUnknownSync(LC.DetailTypeToDetail);

    expect(
      decodeTextTypeToFormat({
        bold: 1,
        capitalize: 1024,
        code: 16,
        highlight: 128,
        italic: 2,
        lowercase: 256,
        strikethrough: 4,
        subscript: 32,
        superscript: 64,
        underline: 8,
        uppercase: 512,
      })
    ).toEqual({
      bold: 1,
      capitalize: 1024,
      code: 16,
      highlight: 128,
      italic: 2,
      lowercase: 256,
      strikethrough: 4,
      subscript: 32,
      superscript: 64,
      underline: 8,
      uppercase: 512,
    });

    expect(
      decodeDetailTypeToDetail({
        directionless: 1,
        unmergeable: 2,
      })
    ).toEqual({
      directionless: 1,
      unmergeable: 2,
    });

    expect(() =>
      decodeTextTypeToFormat({
        bold: 1,
        capitalize: 1024,
        code: 16,
        highlight: 128,
        italic: 2,
        lowercase: 256,
        strikethrough: 4,
        subscript: 32,
        superscript: 64,
        underline: 8,
        uppercase: 1,
      })
    ).toThrow();
    expect(() =>
      decodeDetailTypeToDetail({
        directionless: 1,
        [upstreamDetailTypeTypo]: 2,
      })
    ).toThrow();
  });

  it("decodes the exact element and mode lookup tables", () => {
    const decodeElementTypeToFormat = S.decodeUnknownSync(LC.ElementTypeToFormat);
    const decodeElementFormatToType = S.decodeUnknownSync(LC.ElementFormatToType);
    const decodeTextModeToType = S.decodeUnknownSync(LC.TextModeToType);
    const decodeTextTypeToMode = S.decodeUnknownSync(LC.TextTypeToMode);

    expect(
      decodeElementTypeToFormat({
        center: 2,
        end: 6,
        justify: 4,
        left: 1,
        right: 3,
        start: 5,
      })
    ).toEqual({
      center: 2,
      end: 6,
      justify: 4,
      left: 1,
      right: 3,
      start: 5,
    });

    expect(
      decodeElementFormatToType({
        1: "left",
        2: "center",
        3: "right",
        4: "justify",
        5: "start",
        6: "end",
      })
    ).toEqual({
      1: "left",
      2: "center",
      3: "right",
      4: "justify",
      5: "start",
      6: "end",
    });

    expect(
      decodeTextModeToType({
        normal: 0,
        segmented: 2,
        token: 1,
      })
    ).toEqual({
      normal: 0,
      segmented: 2,
      token: 1,
    });

    expect(
      decodeTextTypeToMode({
        0: "normal",
        1: "token",
        2: "segmented",
      })
    ).toEqual({
      0: "normal",
      1: "token",
      2: "segmented",
    });

    expect(() =>
      decodeElementFormatToType({
        1: "left",
        2: "center",
        3: "right",
        4: "justify",
        5: "start",
        6: "",
      })
    ).toThrow();
    expect(() =>
      decodeTextTypeToMode({
        0: "normal",
        1: "token",
        2: "token",
      })
    ).toThrow();
  });
});
