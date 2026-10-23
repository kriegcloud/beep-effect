import { Markdown } from "@beep/markdown/Markdown";
import { TableAlign } from "@beep/markdown/MarkdownNode";
import { assert, expectTypeOf, it } from "@effect/vitest";
import * as Result from "effect/Result";
import type { Table } from "@beep/markdown/MarkdownNode";

it("uses the named table-alignment domain from delimiter parsing through the table schema", () => {
  expectTypeOf<TableAlign>().toEqualTypeOf<"left" | "right" | "center">();
  expectTypeOf<Table["align"]>().toEqualTypeOf<ReadonlyArray<TableAlign | null> | undefined>();
  const root = Result.getOrThrow(Markdown.parseResult("| a | b | c | d |\n| :- | -: | :-: | - |\n"));
  const table = root.children[0];
  if (table?.type !== "table") assert.fail("expected a table");
  const align: ReadonlyArray<TableAlign | null> = table.align ?? [];
  assert.deepStrictEqual(align, ["left", "right", "center", null]);
  assert.isTrue(TableAlign.is.left(align[0]));
  assert.isTrue(TableAlign.is.right(align[1]));
  assert.isTrue(TableAlign.is.center(align[2]));
});
