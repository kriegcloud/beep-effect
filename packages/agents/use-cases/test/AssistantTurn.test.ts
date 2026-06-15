import { Turn } from "@beep/agents-domain";
import { AgentTurnKernel, TurnHistoryItem } from "@beep/agents-use-cases/public";
import { FixtureTurnKernel, fixtureBlocksFor } from "@beep/agents-use-cases/test";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Stream } from "effect";

const userItem = (text: string) => TurnHistoryItem.make({ role: "user", text });
const assistantItem = (text: string) => TurnHistoryItem.make({ role: "assistant", text });

describe("@beep/agents-use-cases AssistantTurn", () => {
  it("derives the deterministic scripted block sequence from the last user prompt", () => {
    const blocks = fixtureBlocksFor([assistantItem("ignored"), userItem("hello world")]);

    expect(blocks).toHaveLength(4);
    expect(blocks.map((block) => block.type)).toEqual(["heading", "paragraph", "list", "code"]);

    const [heading, paragraph, list, code] = blocks;
    expect(heading).toStrictEqual(
      Turn.HeadingBlock.make({ level: "h2", children: [Turn.TextInline.make({ text: "Echo" })] })
    );
    expect(paragraph).toStrictEqual(
      Turn.ParagraphBlock.make({ children: [Turn.TextInline.make({ text: "You said: hello world" })] })
    );
    expect(list.type).toBe("list");
    expect(code).toStrictEqual(Turn.CodeBlock.make({ language: "text", code: "hello world" }));
  });

  it("emits a single 'No input.' paragraph when there is no user prompt", () => {
    expect(fixtureBlocksFor([])).toEqual(fixtureBlocksFor([userItem("")]));

    const blocks = fixtureBlocksFor([assistantItem("only assistant")]);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toStrictEqual(
      Turn.ParagraphBlock.make({ children: [Turn.TextInline.make({ text: "No input." })] })
    );
  });

  // The fixture kernel layer is provided through the @effect/vitest test
  // harness (the test entry point), not via Effect.provide in the effect body,
  // which keeps scope lifetimes correct and satisfies effect(strictEffectProvide).
  it.layer(FixtureTurnKernel)("through the fixture kernel", (it) => {
    it.effect(
      "streams the scripted sequence as indexed blocks",
      Effect.fnUntraced(function* () {
        const kernel = yield* AgentTurnKernel;
        const history = [userItem("ping")];
        const emitted = yield* Stream.runCollect(kernel.streamTurn(history));
        const expected = fixtureBlocksFor(history);

        expect(emitted.map((indexed) => indexed.index)).toEqual([0, 1, 2, 3]);
        expect(emitted.map((indexed) => indexed.block)).toStrictEqual([...expected]);
      })
    );
  });
});
