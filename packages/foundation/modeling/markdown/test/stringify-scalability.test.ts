import { trustedNode } from "@beep/markdown/internal/nodes";
import { stringifyTree } from "@beep/markdown/internal/stringify";
import { Markdown } from "@beep/markdown/Markdown";
import { InlineCode, Paragraph, Position, Root, Table, TableCell, TableRow, Text } from "@beep/markdown/MarkdownNode";
import { assert, describe, it } from "@effect/vitest";
import { assertSuccess } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";

describe("stringify scalability", () => {
  it("serializes a schema-valid 150000-row shallow table under the Node vitest runner", () => {
    const row = TableRow.make({ children: [TableCell.make({ children: [] })] });
    const root = Root.make({ children: [Table.make({ children: A.makeBy(150_000, () => row) })] });
    assert.isTrue(S.is(Root)(root));
    const result = Markdown.stringifyResult(root);
    assertSuccess(
      Result.map(result, () => undefined),
      undefined
    );
    assert.strictEqual(Result.getOrThrow(result), `|  |\n| --- |\n${Str.repeat(149_999)("|  |\n")}`);
  });

  for (const size of [4_000, 8_000, 16_000]) {
    it(`reads adjacent text values linearly for ${size} siblings without merging nodes`, () => {
      let reads = 0;
      const children = A.makeBy(
        size,
        () =>
          new Proxy(Text.make({ value: "x" }), {
            get(target, key, receiver) {
              if (key === "value") reads += 1;
              return Reflect.get(target, key, receiver);
            },
          })
      );
      // `make` copies its input (D-22) and would drop the read-counting
      // proxies, so the tree is assembled the way the parser assembles it
      // (D-39) and the serializer reads the proxies themselves.
      const paragraph = trustedNode<Paragraph>({ type: "paragraph", children, position: Position.synthetic });
      const before = paragraph.children;
      const root = trustedNode<Root>({ type: "root", children: [paragraph], position: Position.synthetic });
      reads = 0;
      assert.strictEqual(Result.getOrThrow(Markdown.stringifyResult(root)), `${Str.repeat(size)("x")}\n`);
      assert.isAtMost(reads, size * 4);
      assert.isAtLeast(reads, size);
      assert.strictEqual(paragraph.children, before);
      assert.strictEqual(paragraph.children.length, size);
      for (let index = 0; index < size; index += 1) {
        assert.strictEqual(paragraph.children[index], children[index]);
      }
    });
  }
});

describe("inline emission scales linearly", () => {
  // Every inline child used to read the run's growing output (its last
  // characters, for marker choice and the `!` guard), and each read
  // flattened the output string: a long paragraph of mixed inline nodes was
  // quadratic (4x the input cost ~13x the time). The run now keeps its last
  // chunk pending and reads only that.
  it("a long paragraph of mixed inline nodes serializes in linear time", () => {
    const treeAt = (reps: number): Root =>
      Result.getOrThrow(Markdown.parseResult(Str.repeat(reps)("a_b &amp; www.x.com http://x *y* [z] ![w](u) # 1. ")));
    const timeAt = (tree: Root): number => {
      // Two passes, keep the faster: damps JIT and GC noise without
      // hiding an algorithmic blowup.
      let best = Number.POSITIVE_INFINITY;
      for (let pass = 0; pass < 2; pass += 1) {
        const started = performance.now();
        stringifyTree(tree);
        best = Math.min(best, performance.now() - started);
      }
      return best;
    };
    const [warm, smallTree, largeTree] = [treeAt(500), treeAt(2500), treeAt(10_000)];
    timeAt(warm);
    const small = timeAt(smallTree);
    const large = timeAt(largeTree);
    const ratio = large / Math.max(small, 1);
    assert.isBelow(
      ratio,
      8,
      `4x the input cost ${ratio.toFixed(1)}x the time (${small.toFixed(1)}ms -> ${large.toFixed(1)}ms); ` +
        "linear is ~4x, the per-child output read was ~13x"
    );
  }, 120_000);
});

describe("compiled serializer dispatch", () => {
  // The serializer's Match dispatchers are compiled once, at module load: a
  // `Match.type` or `Match.value` built per node would rebuild a matcher on
  // every child. Pinned on the module source — every `Match.type` is the
  // initializer of a module-level constant, and no `Match.value` exists.
  const source = O.getOrThrow(
    R.get(
      import.meta.glob<string>("../src/internal/stringify.ts", { query: "?raw", import: "default", eager: true }),
      "../src/internal/stringify.ts"
    )
  );

  it("builds every Match dispatcher once, at module level", () => {
    const built = A.length(A.fromIterable(Str.matchAll(/Match\.type</g)(source)));
    const moduleLevel = A.length(A.fromIterable(Str.matchAll(/^const \w+ = Match\.type</gm)(source)));
    assert.isAtLeast(built, 3);
    assert.strictEqual(moduleLevel, built);
    assert.isFalse(Str.includes("Match.value(")(source));
  });

  it("serializes 10000 inline-code siblings through the compiled dispatch", () => {
    const root = Root.make({
      children: [Paragraph.make({ children: A.makeBy(10_000, () => InlineCode.make({ value: "x" })) })],
    });
    for (let sample = 0; sample < 3; sample += 1) {
      assert.strictEqual(stringifyTree(root), `${Str.repeat(10_000)("`x`")}\n`);
    }
  });
});
