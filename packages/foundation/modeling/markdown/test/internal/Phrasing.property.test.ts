import { parsePhrasingText } from "@beep/markdown/internal/phrasing";
import { Paragraph, Root } from "@beep/markdown/MarkdownNode";
import * as Effect from "effect/Effect";
import { describePropertyFloor } from "./inlines/propertyFloor.ts";

// The phrasing surface parses a fragment as one paragraph's inline content,
// so its round trip wraps the phrasing run in a paragraph under a root.
describePropertyFloor({
  name: "phrasing",
  templates: ["  {w}  ", "{w}\n\nnext", "[{w}](/url)", "~~{w}~~", "\\*{w}\\*"],
  parse: (source, dialect) =>
    Effect.sync(() => Root.make({ children: [Paragraph.make({ children: [...parsePhrasingText(source, dialect)] })] })),
});
