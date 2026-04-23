import { HtmlFragment, Markdown } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Md } from "../src/index.ts";
import { Block, Document, Inline, Pre, Text } from "../src/Md.model.ts";
import {
  DocumentToHtmlFragment,
  DocumentToMarkdown,
  HtmlFragmentAdapter,
  MarkdownAdapter,
  renderHtmlBlock,
  renderHtmlBlocks,
  renderHtmlInline,
  renderMarkdownBlock,
  renderMarkdownBlocks,
  renderMarkdownInline,
  renderWith,
} from "../src/Md.render.ts";
import {
  escapeMarkdownDestination,
  escapeMarkdownText,
  isStringArray,
  joinBlocks,
  maxBackticks,
  prefixLines,
  renderFencedCode,
  renderInlineCode,
} from "../src/Md.utils.ts";

describe("@beep/md", () => {
  it("renders the intended lowercase block-constructor document shape", () => {
    const markdown = Md.make([
      Md.h1`Heading 1`,
      Md.h2`Heading 2`,
      Md.p`Some text`,
      Md.ul(["List Item 1", "List Item 2"]),
      Md.ol(["Ordered List Item 1", "Ordered List Item 2"]),
      Md.taskList([Md.taskItem("Task List Item 1", { checked: true }), Md.taskItem("Task List Item 2")]),
      Md.pre(`console.log("beep")`, { language: "ts" }),
      Md.blockquote`Hello World!`,
    ]);

    expect(Md.render(markdown)).toBe(`# Heading 1

## Heading 2

Some text

- List Item 1
- List Item 2

1. Ordered List Item 1
2. Ordered List Item 2

- [x] Task List Item 1
- [ ] Task List Item 2

\`\`\`ts
console.log("beep")
\`\`\`

> Hello World!`);
  });

  it("builds and validates schema-first AST nodes", () => {
    const text = Md.text("Hello");
    const pre = Md.pre("code");
    const doc = Md.make([Md.p([text]), pre]);

    expect(S.decodeUnknownSync(Inline)(text)).toEqual(text);
    expect(S.decodeUnknownSync(Block)(pre)).toEqual(pre);
    expect(S.decodeUnknownSync(Document)(doc)).toEqual(doc);
    expect(S.decodeUnknownSync(Pre)(Pre.make({ value: "x", language: O.some("ts") }))).toEqual(
      Pre.make({ value: "x", language: O.some("ts") })
    );
    expect(S.decodeUnknownSync(Text)(Text.make({ value: "Hello" }))).toEqual(text);
  });

  it("renders inline Markdown and HTML variants with escaped text by default", () => {
    expect(renderMarkdownInline(Md.text("# title <tag>."))).toBe("\\# title \\<tag\\>\\.");
    expect(renderMarkdownInline(Md.rawMarkdown("**trusted**"))).toBe("**trusted**");
    expect(renderMarkdownInline(Md.rawHtml("<b>trusted</b>"))).toBe("\\<b\\>trusted\\</b\\>");
    expect(renderMarkdownInline(Md.strong("strong"))).toBe("**strong**");
    expect(renderMarkdownInline(Md.em("em"))).toBe("*em*");
    expect(renderMarkdownInline(Md.del("del"))).toBe("~~del~~");
    expect(renderMarkdownInline(Md.code("`tick`"))).toBe("`` `tick` ``");
    expect(renderMarkdownInline(Md.a("https://example.com/a)b", "Example"))).toBe(
      "[Example](https://example.com/a\\)b)"
    );
    expect(renderMarkdownInline(Md.img("/a)b.png", "Alt #"))).toBe("![Alt \\#](/a\\)b.png)");
    expect(renderMarkdownInline(Md.br)).toBe("<br/>");

    expect(renderHtmlInline(Md.text("<script>&'"))).toBe("&lt;script&gt;&amp;&#39;");
    expect(renderHtmlInline(Md.rawMarkdown("<not-html>"))).toBe("&lt;not-html&gt;");
    expect(renderHtmlInline(Md.rawHtml("<strong>trusted</strong>"))).toBe("<strong>trusted</strong>");
    expect(renderHtmlInline(Md.strong("strong"))).toBe("<strong>strong</strong>");
    expect(renderHtmlInline(Md.em("em"))).toBe("<em>em</em>");
    expect(renderHtmlInline(Md.del("del"))).toBe("<del>del</del>");
    expect(renderHtmlInline(Md.code("<code>"))).toBe("<code>&lt;code&gt;</code>");
    expect(renderHtmlInline(Md.a('https://example.com?a="b"', "Example"))).toBe(
      '<a href="https://example.com?a=&quot;b&quot;">Example</a>'
    );
    expect(renderHtmlInline(Md.img("/logo.png"))).toBe('<img src="/logo.png" alt="" />');
    expect(renderHtmlInline(Md.img("/logo.png", '"Logo"'))).toBe('<img src="/logo.png" alt="&quot;Logo&quot;" />');
    expect(renderHtmlInline(Md.br)).toBe("<br />");
  });

  it("supports template interpolation for inline and block containers", () => {
    const paragraph = Md.p`Hello ${Md.strong("world")}!`;
    const emptyLeadingTemplate = Md.p`${Md.code("x")}`;
    const quote = Md.blockquote([Md.h3("Inside"), "plain block"]);
    const singleBlockQuote = Md.blockquote(Md.p("Solo"));
    const templateQuote = Md.blockquote`Quoted ${Md.em("inline")}`;

    expect(Md.render(Md.make([paragraph, emptyLeadingTemplate]))).toBe("Hello **world**!\n\n`x`");
    expect(renderMarkdownBlock(quote)).toBe("> ### Inside\n> \n> plain block");
    expect(renderMarkdownBlock(singleBlockQuote)).toBe("> Solo");
    expect(renderHtmlBlock(templateQuote)).toBe("<blockquote><p>Quoted <em>inline</em></p></blockquote>");
  });

  it("renders every block variant to Markdown and HTML", () => {
    expect(renderMarkdownBlock(Md.h1("H1"))).toBe("# H1");
    expect(renderMarkdownBlock(Md.h2("H2"))).toBe("## H2");
    expect(renderMarkdownBlock(Md.h3("H3"))).toBe("### H3");
    expect(renderMarkdownBlock(Md.h4("H4"))).toBe("#### H4");
    expect(renderMarkdownBlock(Md.h5("H5"))).toBe("##### H5");
    expect(renderMarkdownBlock(Md.h6("H6"))).toBe("###### H6");
    expect(renderMarkdownBlock(Md.p("Body"))).toBe("Body");
    expect(renderMarkdownBlock(Md.li("Item"))).toBe("Item");
    expect(renderMarkdownBlock(Md.ul([Md.li("One"), ["Two", Md.code("2")]]))).toBe("- One\n- Two`2`");
    expect(renderMarkdownBlock(Md.ol(["One", "Two"]))).toBe("1. One\n2. Two");
    expect(renderMarkdownBlock(Md.taskList(["Todo", { text: "Done", checked: true }, { text: "Maybe" }]))).toBe(
      "- [ ] Todo\n- [x] Done\n- [ ] Maybe"
    );
    expect(renderMarkdownBlock(Md.pre("plain"))).toBe("```\nplain\n```");
    expect(renderMarkdownBlock(Md.hr)).toBe("---");

    expect(renderHtmlBlock(Md.h1("H1"))).toBe("<h1>H1</h1>");
    expect(renderHtmlBlock(Md.h2("H2"))).toBe("<h2>H2</h2>");
    expect(renderHtmlBlock(Md.h3("H3"))).toBe("<h3>H3</h3>");
    expect(renderHtmlBlock(Md.h4("H4"))).toBe("<h4>H4</h4>");
    expect(renderHtmlBlock(Md.h5("H5"))).toBe("<h5>H5</h5>");
    expect(renderHtmlBlock(Md.h6("H6"))).toBe("<h6>H6</h6>");
    expect(renderHtmlBlock(Md.p("Body"))).toBe("<p>Body</p>");
    expect(renderHtmlBlock(Md.li("Item"))).toBe("<li>Item</li>");
    expect(renderHtmlBlock(Md.ul(["One", "Two"]))).toBe("<ul><li>One</li><li>Two</li></ul>");
    expect(renderHtmlBlock(Md.ol(["One", "Two"]))).toBe("<ol><li>One</li><li>Two</li></ol>");
    expect(renderHtmlBlock(Md.taskList([Md.taskItem("Done", { checked: true }), "Todo"]))).toBe(
      '<ul class="contains-task-list"><li><input type="checkbox" disabled checked /> Done</li><li><input type="checkbox" disabled /> Todo</li></ul>'
    );
    expect(renderHtmlBlock(Md.pre("<x>", { language: "ts" }))).toBe(
      '<pre><code class="language-ts">&lt;x&gt;</code></pre>'
    );
    expect(renderHtmlBlock(Md.pre("<x>"))).toBe("<pre><code>&lt;x&gt;</code></pre>");
    expect(renderHtmlBlock(Md.hr)).toBe("<hr />");
  });

  it.effect("exposes pure adapters and schema transformations for Markdown and HTML", () =>
    Effect.gen(function* () {
      const doc = Md.make([Md.h1("Hello"), Md.p("World")]);

      expect(renderWith(MarkdownAdapter, doc)).toBe("# Hello\n\nWorld");
      expect(Md.renderWith(MarkdownAdapter, doc)).toBe("# Hello\n\nWorld");
      expect(Md.renderWith(HtmlFragmentAdapter, doc)).toBe("<h1>Hello</h1>\n<p>World</p>");
      expect(Md.renderHtml(doc)).toBe("<h1>Hello</h1>\n<p>World</p>");
      expect(S.decodeUnknownSync(DocumentToMarkdown)(doc)).toBe(Markdown.make("# Hello\n\nWorld"));
      expect(S.decodeUnknownSync(DocumentToHtmlFragment)(doc)).toBe(HtmlFragment.make("<h1>Hello</h1>\n<p>World</p>"));

      const markdownEncode = yield* Effect.exit(S.encodeEffect(DocumentToMarkdown)(Markdown.make("# Hello")));
      const htmlEncode = yield* Effect.exit(
        S.encodeEffect(DocumentToHtmlFragment)(HtmlFragment.make("<h1>Hello</h1>"))
      );

      expect(Exit.isFailure(markdownEncode)).toBe(true);
      expect(Exit.isFailure(htmlEncode)).toBe(true);
      if (Exit.isFailure(markdownEncode)) {
        expect(Cause.pretty(markdownEncode.cause)).toContain(
          "Encoding Markdown output back into a Markdown document AST is not supported."
        );
      }
      if (Exit.isFailure(htmlEncode)) {
        expect(Cause.pretty(htmlEncode.cause)).toContain(
          "Encoding HTML fragment output back into a Markdown document AST is not supported."
        );
      }
    })
  );

  it("provides focused rendering utilities", () => {
    expect(joinBlocks("\nOne\n")).toBe("One");
    expect(joinBlocks(["\nOne\n", "", "\nTwo\n"])).toBe("One\n\nTwo");
    expect(renderMarkdownBlocks([Md.h1("One"), Md.p("Two")])).toBe("# One\n\nTwo");
    expect(renderHtmlBlocks([Md.h1("One"), Md.p("Two")])).toBe("<h1>One</h1>\n<p>Two</p>");
    expect(prefixLines("alpha\nbeta", "> ")).toBe("> alpha\n> beta");
    expect(escapeMarkdownText("a*b")).toBe("a\\*b");
    expect(escapeMarkdownDestination("\\()")).toBe("\\\\\\(\\)");
    expect(maxBackticks("`one` and ```three```")).toBe(3);
    expect(renderInlineCode("plain")).toBe("`plain`");
    expect(renderInlineCode("`edge`")).toBe("`` `edge` ``");
    expect(renderFencedCode("```", "ts")).toBe("````ts\n```\n````");
    expect(isStringArray(["a", "b"])).toBe(true);
    expect(isStringArray(["a", 1])).toBe(false);
  });
});
