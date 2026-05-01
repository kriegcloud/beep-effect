import { Markdown, type Markdown as MarkdownType } from "@beep/schema";
import type { Effect } from "effect";
import type * as Brand from "effect/Brand";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

declare const markdown: MarkdownType;

describe("Markdown", () => {
  it("preserves the branded schema surface", () => {
    expect<typeof Markdown.Type>().type.toBe<string & Brand.Brand<"Markdown">>();
    expect<typeof Markdown.Encoded>().type.toBe<string>();
    expect<MarkdownType>().type.toBe<string & Brand.Brand<"Markdown">>();
  });

  it("exposes effectful decode and encode helpers with the expected types", () => {
    const decode = S.decodeUnknownEffect(Markdown);
    const encode = S.encodeEffect(Markdown);

    expect(decode("# Hello")).type.toBe<Effect.Effect<MarkdownType, S.SchemaError, never>>();
    expect(encode(markdown)).type.toBe<Effect.Effect<string, S.SchemaError, never>>();
  });
});
