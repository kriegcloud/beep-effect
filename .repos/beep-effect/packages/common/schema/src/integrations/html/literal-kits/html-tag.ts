import { $SchemaId } from "@beep/identity/packages";
import { StringLiteralKit } from "@beep/schema/derived";

const $I = $SchemaId.create("integrations/html/literal-kits/html-tag");

export class HtmlTag extends StringLiteralKit(
  "a",
  "abbr",
  "acronym",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "basefont",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fencedframe",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "marquee",
  "math",
  "menu",
  "meta",
  "meter",
  "nav",
  "nobr",
  "noembed",
  "noframes",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "plaintext",
  "pre",
  "progress",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "search",
  "section",
  "select",
  "selectedcontent",
  "slot",
  "small",
  "source",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  "xmp"
).annotations(
  $I.annotations("HtmlTag", {
    description: "HTML tag",
  })
) {}

export declare namespace HtmlTag {
  export type Type = typeof HtmlTag.Type;
  export type Encoded = typeof HtmlTag.Encoded;
}

export class MediaTag extends HtmlTag.derive(
  "img",
  "audio",
  "video",
  "picture",
  "svg",
  "object",
  "map",
  "iframe",
  "embed"
).annotations(
  $I.annotations("MediaTag", {
    description: "Media tag",
  })
) {}

export declare namespace MediaTag {
  export type Type = typeof MediaTag.Type;
  export type Encoded = typeof MediaTag.Encoded;
}

export class VulnerarbleTag extends HtmlTag.derive("script", "style").annotations(
  $I.annotations("VulnerarbleTag", {
    description: "Vulnerarble tag",
  })
) {}

export declare namespace VulnerarbleTag {
  export type Type = typeof VulnerarbleTag.Type;
  export type Encoded = typeof VulnerarbleTag.Encoded;
}

export class NonTextTag extends HtmlTag.derive("script", "style", "textarea", "option").annotations(
  $I.annotations("NonTextTag", {
    description: "Non-text tag",
  })
) {}

export declare namespace NonTextTag {
  export type Type = typeof NonTextTag.Type;
  export type Encoded = typeof NonTextTag.Encoded;
}

export class ContentSectioningTag extends HtmlTag.derive(
  "address",
  "article",
  "aside",
  "footer",
  "header",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hgroup",
  "main",
  "nav",
  "section"
).annotations(
  $I.annotations("ContentSectioningTag", {
    description: "Content sectioning tag",
  })
) {}

export declare namespace ContentSectioningTag {
  export type Type = typeof ContentSectioningTag.Type;
  export type Encoded = typeof ContentSectioningTag.Encoded;
}

export class TextContentTag extends HtmlTag.derive(
  "blockquote",
  "dd",
  "div",
  "dl",
  "dt",
  "figcaption",
  "figure",
  "hr",
  "li",
  "menu",
  "ol",
  "p",
  "pre",
  "ul"
).annotations(
  $I.annotations("TextContentTag", {
    description: "Text content tag",
  })
) {}

export declare namespace TextContentTag {
  export type Type = typeof TextContentTag.Type;
  export type Encoded = typeof TextContentTag.Encoded;
}

export class InlineTextSemanticsTag extends HtmlTag.derive(
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr"
).annotations(
  $I.annotations("InlineTextSemanticsTag", {
    description: "Inline text semantics tag",
  })
) {}

export declare namespace InlineTextSemanticsTag {
  export type Type = typeof InlineTextSemanticsTag.Type;
  export type Encoded = typeof InlineTextSemanticsTag.Encoded;
}

export class TableContentTag extends HtmlTag.derive(
  "caption",
  "col",
  "colgroup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr"
).annotations(
  $I.annotations("TableContentTag", {
    description: "Table content tag",
  })
) {}

export declare namespace TableContentTag {
  export type Type = typeof TableContentTag.Type;
  export type Encoded = typeof TableContentTag.Encoded;
}

export class SelfClosing extends HtmlTag.derive(
  "img",
  "br",
  "hr",
  "area",
  "base",
  "basefont",
  "input",
  "link",
  "meta"
).annotations(
  $I.annotations("SelfClosing", {
    description: "Self-closing tag",
  })
) {}

export declare namespace SelfClosing {
  export type Type = typeof SelfClosing.Type;
  export type Encoded = typeof SelfClosing.Encoded;
}
