/**
 * @module @beep/md/Md.block
 * @since 0.0.0
 */

import { $MdId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { pipe, Tuple } from "effect";
import * as S from "effect/Schema";

const $I = $MdId.create("Md.model");

export const HeadingKind = LiteralKit(["H1", "H2", "H3", "H4", "H5", "H6"]).pipe(
  $I.annoteSchema("HeadingKind", {
    description: "",
  })
);
export type HeadingKind = typeof HeadingKind.Type;

export const Heading = HeadingKind.mapMembers((members) => {
  const commonTemplateParts = [" ", S.String] as const;
  const make = <T extends HeadingKind>(tag: S.Literal<T>) =>
    HeadingKind.$match(tag.literal, {
      H1: () =>
        S.TaggedStruct(tag.literal, {
          value: S.TemplateLiteral(["#", ...commonTemplateParts]),
        }),
      H2: () =>
        S.TaggedStruct(tag.literal, {
          value: S.TemplateLiteral(["##", ...commonTemplateParts]),
        }),
      H3: () =>
        S.TaggedStruct(tag.literal, {
          value: S.TemplateLiteral(["###", ...commonTemplateParts]),
        }),
      H4: () =>
        S.TaggedStruct(tag.literal, {
          value: S.TemplateLiteral(["####", ...commonTemplateParts]),
        }),
      H5: () =>
        S.TaggedStruct(tag.literal, {
          value: S.TemplateLiteral(["#####", ...commonTemplateParts]),
        }),
      H6: () =>
        S.TaggedStruct(tag.literal, {
          value: S.TemplateLiteral(["######", ...commonTemplateParts]),
        }),
    });

  return pipe(members, Tuple.evolve([make, make, make, make, make, make]));
}).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("Heading", {
    description: "Represents a Markdown heading with different levels (h1 to h6).",
  })
);

export type Heading = typeof Heading.Type;

export class BlockQoute extends S.TaggedClass<BlockQoute>($I`BlockQoute`)(
  "BlockQoute",
  {
    value: S.TemplateLiteral(["> ", S.String]),
  },
  $I.annote("BlockQoute", {
    description: "Represents a Markdown block quote with '>' prefix.",
  })
) {}

export class CodeBlock extends S.TaggedClass<CodeBlock>($I`CodeBlock`)(
  "CodeBlock",
  {
    value: S.TemplateLiteral(["```", S.String, S.String, "```"]),
  },
  $I.annote("CodeBlock", {
    description: "",
  })
) {}

export class ListItem extends S.TaggedClass<ListItem>($I`ListItem`)(
  "ListItem",
  {
    value: S.TemplateLiteral(["- ", S.String, "\n"]),
  },
  $I.annote("ListItem", {
    description: "",
  })
) {}

export class OrderedListItem extends S.TaggedClass<OrderedListItem>($I`OrderedListItem`)(
  "OrderedListItem",
  {
    value: S.TemplateLiteral([S.Number, ". ", S.String, "\n"]),
  },
  $I.annote("OrderedListItem", {
    description: "",
  })
) {}

export class TaskListItem extends S.TaggedClass<TaskListItem>($I`TaskListItem`)(
  "TaskListItem",
  {
    value: S.TemplateLiteral(["- [", S.Literals(["x", " "]), "] ", S.String]),
  },
  $I.annote("TaskListItem", {
    description: "",
  })
) {}

export const Block = S.Union([...Heading.members, ListItem, OrderedListItem, TaskListItem]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("Block", {
    description:
      "Represents a Markdown block element, which can be a heading, list item, ordered list item, or task list item.",
  })
);
