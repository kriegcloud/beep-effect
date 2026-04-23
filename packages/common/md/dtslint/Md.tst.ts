import type {
  Block,
  BlockQuote,
  Document,
  DocumentToHtmlFragment,
  DocumentToMarkdown,
  EffectRenderAdapter,
  H1,
  Inline,
  P,
  PureRenderAdapter,
  TaskItem,
  TaskList,
  Ul,
} from "@beep/md";
import { Md } from "@beep/md";
import type { HtmlFragment, Markdown } from "@beep/schema";
import { describe, expect, it } from "tstyche";

describe("@beep/md", () => {
  it("keeps document, block, and inline constructors typed", () => {
    const document = Md.make([Md.h1("Hello"), Md.p`World ${Md.code("x")}`]);

    expect(document).type.toBe<Document>();
    expect(Md.h1("Hello")).type.toBe<H1>();
    expect(Md.p("Hello")).type.toBe<P>();
    expect(Md.p([Md.strong("Hello"), " world"])).type.toBe<P>();
    expect(Md.blockquote([Md.h2("Nested"), "plain"])).type.toBe<BlockQuote>();
    expect(Md.ul(["One", Md.li("Two"), [Md.strong("Three")]])).type.toBe<Ul>();
    expect(Md.taskItem("Done", { checked: true })).type.toBe<TaskItem>();
    expect(Md.taskList(["Todo", { text: "Done", checked: true }, Md.taskItem("Maybe")])).type.toBe<TaskList>();
    expect(Md.text("x")).type.toBeAssignableTo<Inline>();
    expect(Md.hr).type.toBeAssignableTo<Block>();
  });

  it("keeps render outputs branded by target", () => {
    const document = Md.make([Md.h1("Hello")]);

    expect(Md.render(document)).type.toBe<Markdown>();
    expect(Md.renderHtml(document)).type.toBe<HtmlFragment>();
    expect(Md.renderWith(Md.MarkdownAdapter, document)).type.toBe<Markdown>();
    expect(Md.MarkdownAdapter).type.toBe<PureRenderAdapter<Markdown>>();
    expect(Md.HtmlFragmentAdapter).type.toBe<PureRenderAdapter<HtmlFragment>>();
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
  });
});
