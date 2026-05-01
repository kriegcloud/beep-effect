import { Md } from "@beep/md";
import { blockquote, h1 } from "@beep/md/Md";
import type { Block, Document, H1 } from "@beep/md/Md.model";
import { MarkdownAdapter, type RenderError, renderEffectWith, renderWith } from "@beep/md/Md.render";
import { escapeMarkdownText } from "@beep/md/Md.utils";
import type { Markdown } from "@beep/schema";
import type { Result } from "effect";
import { Effect } from "effect";
import { describe, expect, it } from "tstyche";

describe("@beep/md package exports", () => {
  it("resolves root and explicit subpath exports through the package map", () => {
    const document = Md.make([h1`Hello`, blockquote`${Md.h2("Nested")}`]);
    const effectAdapter = {
      name: "bytes",
      render: () => Effect.succeed(new Uint8Array()),
    };

    expect(document).type.toBe<Document>();
    expect(h1`Hello`).type.toBe<H1>();
    expect(blockquote`${Md.h2("Nested")}`).type.toBeAssignableTo<Block>();
    expect(renderWith(MarkdownAdapter, document)).type.toBe<Result.Result<Markdown, RenderError>>();
    expect(renderEffectWith(effectAdapter, document)).type.toBeAssignableTo<
      Effect.Effect<Uint8Array, RenderError, never>
    >();
    expect(escapeMarkdownText("#")).type.toBe<string>();
  });
});
