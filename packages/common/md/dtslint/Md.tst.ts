import type {
  Block,
  BlockContent,
  BlockContentBuilder,
  BlockInput,
  BlockQuote,
  BlockTemplateValue,
  Del,
  Document,
  DocumentToHtmlFragment,
  DocumentToMarkdown,
  EffectRenderAdapter,
  Em,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Inline,
  InlineContent,
  InlineContentBuilder,
  InlineInput,
  Li,
  ListItemInput,
  P,
  PureRenderAdapter,
  RenderError,
  Strong,
  TaskItem,
  TaskList,
  TaskListItemInput,
  Ul,
} from "@beep/md";
import { Md } from "@beep/md";
import type { HtmlFragment, Markdown } from "@beep/schema";
import type { Result } from "effect";
import { Effect } from "effect";
import { describe, expect, it } from "tstyche";

describe("@beep/md", () => {
  it("keeps document, block, and inline constructors typed", () => {
    const document = Md.make([Md.h1("Hello"), Md.p`World ${Md.code("x")}`]);

    expect(document).type.toBe<Document>();
    expect(Md.h1("Hello")).type.toBe<H1>();
    expect(Md.h1`Heading 1`).type.toBe<H1>();
    expect(Md.h2`Heading ${Md.code("2")}`).type.toBe<H2>();
    expect(Md.h3`Heading ${Md.em("3")}`).type.toBe<H3>();
    expect(Md.h4`Heading ${Md.strong("4")}`).type.toBe<H4>();
    expect(Md.h5`Heading ${Md.del("5")}`).type.toBe<H5>();
    expect(Md.h6`Heading ${Md.code("6")}`).type.toBe<H6>();
    expect(Md.p("Hello")).type.toBe<P>();
    expect(Md.p`Hello ${"world"}`).type.toBe<P>();
    expect(Md.p([Md.strong("Hello"), " world"])).type.toBe<P>();
    expect(Md.p`Hello ${[Md.strong("world"), "!"]}`).type.toBe<P>();
    expect(Md.strong`Hello ${Md.code("world")}`).type.toBe<Strong>();
    expect(Md.em`Hello ${Md.strong("world")}`).type.toBe<Em>();
    expect(Md.del`Hello ${Md.em("world")}`).type.toBe<Del>();
    expect(Md.li`Item ${Md.code("one")}`).type.toBe<Li>();
    expect(Md.blockquote([Md.h2("Nested"), "plain"])).type.toBe<BlockQuote>();
    expect(Md.blockquote`Quoted ${Md.strong("text")}`).type.toBe<BlockQuote>();
    expect(Md.blockquote`${Md.h2("Nested")}`).type.toBe<BlockQuote>();
    expect(Md.blockquote`${["a", "b"]}`).type.toBe<BlockQuote>();
    expect(Md.ul(["One", Md.li("Two"), [Md.strong("Three")]])).type.toBe<Ul>();
    expect(Md.taskItem("Done", { checked: true })).type.toBe<TaskItem>();
    expect(Md.taskList(["Todo", { text: "Done", checked: true }, Md.taskItem("Maybe")])).type.toBe<TaskList>();
    expect(Md.text("x")).type.toBeAssignableTo<Inline>();
    expect(Md.hr).type.toBeAssignableTo<Block>();
  });

  it("exposes constructor input helper types", () => {
    expect<string>().type.toBeAssignableTo<InlineInput>();
    expect<[InlineInput, InlineInput]>().type.toBeAssignableTo<InlineContent>();
    expect<Strong>().type.toBeAssignableTo<InlineContent>();
    expect<Block>().type.toBeAssignableTo<BlockInput>();
    expect<[BlockInput, BlockInput]>().type.toBeAssignableTo<BlockContent>();
    expect<H2>().type.toBeAssignableTo<BlockTemplateValue>();
    expect<["a", "b"]>().type.toBeAssignableTo<BlockTemplateValue>();
    expect<Li>().type.toBeAssignableTo<ListItemInput>();
    expect<{ readonly text: string; readonly checked?: boolean }>().type.toBeAssignableTo<TaskListItemInput>();

    const strongBuilder: InlineContentBuilder<Strong> = Md.strong;
    const blockquoteBuilder: BlockContentBuilder<BlockQuote> = Md.blockquote;

    expect(strongBuilder).type.toBe<InlineContentBuilder<Strong>>();
    expect(blockquoteBuilder).type.toBe<BlockContentBuilder<BlockQuote>>();
  });

  it("keeps render outputs branded by target", () => {
    const document = Md.make([Md.h1("Hello")]);
    type RenderPacket = {
      readonly body: Markdown;
      readonly format: "packet";
    };
    const packetAdapter: PureRenderAdapter<RenderPacket> = {
      name: "packet",
      render: (input) => ({
        body: Md.renderUnsafe(input),
        format: "packet",
      }),
    };

    expect(Md.render(document)).type.toBe<Result.Result<Markdown, RenderError>>();
    expect(Md.renderUnsafe(document)).type.toBe<Markdown>();
    expect(Md.renderHtml(document)).type.toBe<Result.Result<HtmlFragment, RenderError>>();
    expect(Md.renderHtmlUnsafe(document)).type.toBe<HtmlFragment>();
    expect(Md.renderWith(Md.MarkdownAdapter, document)).type.toBe<Result.Result<Markdown, RenderError>>();
    expect(Md.renderWithUnsafe(Md.MarkdownAdapter, document)).type.toBe<Markdown>();
    expect(Md.renderWith(packetAdapter, document)).type.toBe<Result.Result<RenderPacket, RenderError>>();
    expect(Md.renderWithUnsafe(packetAdapter, document)).type.toBe<RenderPacket>();
    expect(Md.MarkdownAdapter).type.toBe<PureRenderAdapter<Markdown>>();
    expect(Md.HtmlFragmentAdapter).type.toBe<PureRenderAdapter<HtmlFragment>>();

    const bytesAdapter: EffectRenderAdapter<Uint8Array, "pdf-error", "fonts"> = {
      name: "bytes",
      render: () => Effect.succeed(new Uint8Array()),
    };
    expect(Md.renderEffectWith(bytesAdapter, document)).type.toBe<
      Effect.Effect<Uint8Array, "pdf-error" | RenderError, "fonts">
    >();
    expect(Md.renderEffectWithUnsafe(bytesAdapter, document)).type.toBe<
      Effect.Effect<Uint8Array, "pdf-error", "fonts">
    >();
  });

  it("exposes schema transformation types and future effectful adapter shape", () => {
    expect<DocumentToMarkdown>().type.toBe<Markdown>();
    expect<DocumentToHtmlFragment>().type.toBe<HtmlFragment>();

    type BytesAdapter = EffectRenderAdapter<Uint8Array, Error, never>;
    expect<BytesAdapter["name"]>().type.toBe<string>();
  });

  it("rejects invalid builder shapes", () => {
    // @ts-expect-error!
    Md.make(Md.p("Hello"));

    // @ts-expect-error!
    Md.taskItem("Done", { checked: "yes" });

    // @ts-expect-error!
    Md.ul([1]);

    // @ts-expect-error!
    Md.p`Count ${1}`;

    // @ts-expect-error!
    Md.p`Count ${[Md.strong("ok"), 1]}`;

    // @ts-expect-error!
    Md.blockquote`${[Md.h2("Nested"), "plain"]}`;
  });
});
