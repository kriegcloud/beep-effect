import { makeToken } from "@beep/markdown/internal";
import * as S from "effect/Schema";

export class BlockQoute extends S.Class<BlockQoute>("@beep/markdown/BlockQoute")(
  makeToken("blockqoute", {
    text: S.String,
    // tokens: Token[];
  })
) {}

export class Br extends S.Class<Br>("@beep/markdown/Br")(makeToken("br", {})) {}

export class Checkbox extends S.Class<Checkbox>("@beep/markdown/Checkbox")(
  makeToken("checkbox", {
    checked: S.Boolean,
  })
) {}

export class Code extends S.Class<Code>("@beep/markdown/Code")(
  makeToken("code", {
    codeBlockStyle: S.String.pipe(
      S.optional,
      S.withDefaults({
        decoding: () => "indented",
        constructor: () => "indented",
      })
    ),
    lang: S.optional(S.String),
    text: S.String,
    excaped: S.Boolean.pipe(
      S.optional,
      S.withDefaults({
        decoding: () => false,
        constructor: () => false,
      })
    ),
  })
) {}

export class Codespan extends S.Class<Codespan>("@beep/markdown/Codespan")(
  makeToken("codespan", {
    text: S.String,
  })
) {}

export class Def extends S.Class<Def>("@beep/markdown/Def")(
  makeToken("def", {
    href: S.String,
    tag: S.String,
    title: S.String,
  })
) {}

export class Del extends S.Class<Del>("@beep/markdown/Del")(
  makeToken("del", {
    text: S.String,
    // tokens: Token[];
  })
) {}

export class Em extends S.Class<Em>("@beep/markdown/Em")(
  makeToken("em", {
    text: S.String,
    // tokens: Token[];
  })
) {}

export class Escape extends S.Class<Escape>("@beep/markdown/Escape")(
  makeToken("escape", {
    text: S.String,
  })
) {}

export const Generic = S.Struct(
  {
    type: S.String,
    // tokens: S.optional
  },
  S.Record({
    key: S.String,
    value: S.Any,
  })
);

export class Heading extends S.Class<Heading>("@beep/markdown/Heading")(
  makeToken("heading", {
    depth: S.Number,
    text: S.String,
    // tokens: S.optional
  })
) {}

export class Hr extends S.Class<Hr>("@beep/markdown/Hr")(makeToken("hr", {})) {}

export class HTML extends S.Class<HTML>("@beep/markdown/HTML")(
  makeToken("html", {
    pre: S.Boolean,
    text: S.String,
    block: S.Boolean,
  })
) {}

export class Image extends S.Class<Image>("@beep/markdown/Image")(
  makeToken("image", {
    href: S.String,
    title: S.NullOr(S.String),
    text: S.String,
    // tokens: S.optional
  })
) {}

export class Link extends S.Class<Link>("@beep/markdown/Link")(
  makeToken("link", {
    href: S.String,
    title: S.optional(S.NullOr(S.String)),
    text: S.String,
    // tokens: S.optional
  })
) {}

export class ListItem extends S.Class<ListItem>("@beep/markdown/ListItem")(
  makeToken("list_item", {
    task: S.Boolean,
    checked: S.optional(S.Boolean),
    loose: S.Boolean,
    text: S.String,
    // tokens: S.optional
  })
) {}

export class List extends S.Class<List>("@beep/markdown/List")(
  makeToken("list", {
    ordered: S.Boolean,
    start: S.Union(S.Number, S.Literal("")),
    loose: S.Boolean,
    items: S.Array(ListItem),

    // tokens: S.optional
  })
) {}

export class Paragraph extends S.Class<Paragraph>("@beep/markdown/Paragraph")(
  makeToken("paragraph", {
    pre: S.optional(S.Boolean),
    text: S.String,
    // tokens: S.optional
  })
) {}

export class Space extends S.Class<Space>("@beep/markdown/Space")(makeToken("space", {})) {}

export class Strong extends S.Class<Strong>("@beep/markdown/Strong")(
  makeToken("strong", {
    text: S.String,
    // tokens
  })
) {}

export class TableCell extends S.Class<TableCell>("@beep/markdown/TableCell")({
  text: S.String,
  // tokens,
  header: S.Boolean,
  align: S.NullOr(S.Literal("center", "left", "right")),
}) {}

export class TableRow extends S.Class<TableRow>("@beep/markdown/TableRow")({
  text: S.String,
}) {}

export class Table extends S.Class<Table>("@beep/markdown/Table")(
  makeToken("table", {
    align: S.Array(S.NullOr(S.Literal("center", "left", "right"))),
    header: S.Array(TableCell),
    rows: S.Array(S.Array(TableCell)),
  })
) {}

export class Tag extends S.Class<Tag>("@beep/markdown/Tag")(
  makeToken("html", {
    inLink: S.Boolean,
    inRawBlock: S.Boolean,
    text: S.String,
    block: S.Boolean,
  })
) {}

export class Text extends S.Class<Text>("@beep/markdown/Text")(
  makeToken("text", {
    text: S.String,
    // tokens?:
    escaped: S.optional(S.Boolean),
  })
) {}

export class Links extends S.Record({
  key: S.String,
  value: S.Struct({
    href: Link.fields.href,
    title: Image.fields.title,
  }),
}) {}

// export class TokensList = S.Array()

export class MarkdownToken extends S.Union(
  BlockQoute,
  Br,
  Checkbox,
  Code,
  Codespan,
  Def,
  Del,
  Em,
  Escape,
  Heading,
  Hr,
  HTML,
  Image,
  Link,
  ListItem,
  List,
  Paragraph,
  Space,
  Strong,
  TableCell,
  TableRow,
  Table,
  Tag,
  Text
) {}

export class Token extends S.Union(MarkdownToken, Generic) {}
