import { CodeBlock, HeadingBlock, ParagraphBlock, TextInline } from "@beep/agents-domain/values/AssistantContent";
import {
  AgentTurnKernel,
  AssistantTurnHistoryItem,
  TurnHistoryItem,
  UserTurnHistoryItem,
} from "@beep/agents-use-cases/public";
import { FixtureTurnKernel, fixtureBlocksFor } from "@beep/agents-use-cases/test";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Stream } from "effect";
import * as S from "effect/Schema";

const userItem = (text: string) => UserTurnHistoryItem.make({ text });
const assistantItem = (text: string) => AssistantTurnHistoryItem.make({ text });

describe("@beep/agents-use-cases AssistantTurn", () => {
  it("models history as a role-tagged union of user and assistant items", () => {
    const decoded = S.decodeUnknownSync(TurnHistoryItem)({ role: "user", text: "hello" });
    const user = userItem("hello");
    const assistant = assistantItem("hi");

    expect(decoded).toBeInstanceOf(UserTurnHistoryItem);
    expect(user.role).toBe("user");
    expect(assistant.role).toBe("assistant");
    expect(
      TurnHistoryItem.match(decoded, {
        assistant: (item) => `assistant:${item.text}`,
        user: (item) => `user:${item.text}`,
      })
    ).toBe("user:hello");
  });

  it("derives the deterministic scripted block sequence from the last user prompt", () => {
    const blocks = fixtureBlocksFor([assistantItem("ignored"), userItem("hello world")]);

    expect(blocks).toHaveLength(4);
    expect(blocks.map((block) => block.type)).toEqual(["heading", "paragraph", "list", "code"]);

    const [heading, paragraph, list, code] = blocks;
    expect(heading).toStrictEqual(HeadingBlock.make({ level: "h2", children: [TextInline.make({ text: "Echo" })] }));
    expect(paragraph).toStrictEqual(
      ParagraphBlock.make({ children: [TextInline.make({ text: "You said: hello world" })] })
    );
    expect(list.type).toBe("list");
    expect(code).toStrictEqual(CodeBlock.make({ language: "text", code: "hello world" }));
  });

  it("emits a single 'No input.' paragraph when there is no user prompt", () => {
    expect(fixtureBlocksFor([])).toEqual(fixtureBlocksFor([userItem("")]));

    const blocks = fixtureBlocksFor([assistantItem("only assistant")]);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toStrictEqual(ParagraphBlock.make({ children: [TextInline.make({ text: "No input." })] }));
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
