import { getAlphaNodesForFact } from "@beep/rete/rete/get-alpha-nodes-for-fact";
import { insertFact } from "@beep/rete/rete/insert-fact";
import type { AlphaNode, Fact } from "@beep/rete/rete/types";
import { Field } from "@beep/rete/rete/types";
import { describe, expect, it } from "@effect/vitest";
import { type TestingSchema, testingSimpleSession } from "../testingUtils";

describe("getAlphaNodesForFact...", () => {
  it("A fact with the A attribute will have the one alpha node", () => {
    const session = testingSimpleSession();
    const fact: Fact<TestingSchema> = ["a", "A", 1];
    insertFact(session, fact);
    const nodes = new Set<AlphaNode<TestingSchema>>();
    getAlphaNodesForFact(session, session.alphaNode, fact, true, nodes);
    // console.log(vizOnlineUrl(session))
    expect(nodes.size).toBe(1);

    const alphaNode = [...nodes][0];
    expect(alphaNode?.testField).toBe(Field.Enum.ATTRIBUTE);
    expect(alphaNode?.testValue).toBe("A");
  });

  it("A fact with the B attribute will have no alpha nodes", () => {
    const session = testingSimpleSession();
    const fact: Fact<TestingSchema> = ["b", "B", 1];
    insertFact(session, fact);
    const nodes = new Set<AlphaNode<TestingSchema>>();
    getAlphaNodesForFact(session, session.alphaNode, fact, true, nodes);
    // console.log(vizOnlineUrl(session))
    expect(nodes.size).toBe(0);
  });
});
