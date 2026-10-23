import { parseBlocks } from "@beep/markdown/internal/blockParser";
import { blockDialect } from "@beep/markdown/internal/blockRegistry";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";

const typesOf = (source: string): ReadonlyArray<string> =>
  A.map(parseBlocks(source, { dialect: "gfm" }).root.children, (child) => child.type);

describe("blockRegistry dialect contract", () => {
  it.effect("registers each construct under its own type and keeps the start order", () =>
    Effect.sync(() => {
      const coreStarts = [
        "blockquote",
        "atxHeading",
        "fencedCode",
        "htmlBlock",
        "setextHeading",
        "thematicBreak",
        "listItem",
        "indentedCode",
      ];
      for (const name of ["commonmark", "gfm"] as const) {
        const dialect = blockDialect(name);
        assert.strictEqual(dialect.constructs.length, name === "commonmark" ? 10 : 14);
        for (const construct of dialect.constructs) {
          assert.strictEqual(dialect.construct(construct.type), construct);
        }
        assert.deepStrictEqual(
          A.map(dialect.starts, (start) => start.name),
          name === "commonmark"
            ? coreStarts
            : [
                ...A.take(coreStarts, 6),
                "footnoteDefinition",
                ...A.drop(coreStarts, 6),
                "taskListItem",
                "tableHeader",
                "tableRow",
              ]
        );
      }
      assert.throws(
        () => blockDialect("commonmark").construct("table"),
        /no construct registered for block type table/
      );
      assert.strictEqual(blockDialect("commonmark").mayStartBlock, undefined);
    })
  );

  it.effect("lets the GFM starts see the lines the CommonMark fast path hides", () =>
    Effect.sync(() => {
      // `[`: a footnote definition.
      assert.deepStrictEqual(typesOf("[^a]: note\n"), ["footnoteDefinition"]);
      // `|`: a delimiter row that begins with a pipe.
      assert.deepStrictEqual(typesOf("a\n| - |\n"), ["table"]);
      // `:`: a delimiter row that begins with a colon.
      assert.deepStrictEqual(typesOf("a\n:-:\n"), ["table"]);
      // Any line under an open table is offered to the row start.
      const table = parseBlocks("| a |\n| - |\nplain\n", { dialect: "gfm" }).root.children[0];
      assert.strictEqual(table?.type === "table" ? table.children.length : 0, 2);
      // Plain text under a paragraph stays paragraph text.
      assert.deepStrictEqual(typesOf("a\nplain\n"), ["paragraph"]);
    })
  );
});

it.effect("reports an unknown runtime dialect as a programmer defect", () =>
  Effect.sync(() => {
    assert.throws(() => Reflect.apply(blockDialect, undefined, ["unknown"]), /unknown markdown dialect: unknown/);
  })
);
