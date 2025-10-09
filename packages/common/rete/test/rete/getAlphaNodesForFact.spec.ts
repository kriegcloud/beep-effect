import { describe, expect, it } from "bun:test";
import { getAlphaNodesForFact } from "../../src/network/get-alpha-nodes-for-fact";
import { insertFact } from "../../src/network/insert-fact";
import type { AlphaNode, Fact } from "../../src/network/types";
import { Field } from "../../src/network/types";
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
