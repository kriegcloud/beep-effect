import {
  CanonicalRegressionRules,
  decodeChatRequestUnknown,
  extractGraphSnippet,
  LegacyPatternDenyList,
  SYSTEM_PROMPT,
} from "@beep/web/lib/effect/chat-handler";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Option, pipe } from "effect";
import * as A from "effect/Array";

describe("chat-handler", () => {
  it.effect("decodes valid chat request payload", () =>
    Effect.gen(function* () {
      const decoded = yield* decodeChatRequestUnknown({
        messages: [
          {
            role: "user",
            content: "How do I create a tagged service?",
          },
        ],
      });

      expect(decoded.messages).toHaveLength(1);
      expect(decoded.messages[0]?.role).toBe("user");
    })
  );

  it.effect("rejects empty messages array", () =>
    Effect.gen(function* () {
      const failure = yield* decodeChatRequestUnknown({
        messages: [],
      }).pipe(Effect.flip);

      expect(failure._tag).toBe("ChatRequestDecodeError");
    })
  );

  it("system prompt includes required Effect v4 and forbidden v3 guidance", () => {
    expect(SYSTEM_PROMPT).toContain("Effect v4 knowledge assistant");
    expect(SYSTEM_PROMPT).toContain("SearchGraph");
    expect(SYSTEM_PROMPT).toContain("GetFacts");

    pipe(
      LegacyPatternDenyList,
      A.forEach((pattern) => {
        expect(SYSTEM_PROMPT).toContain(pattern);
      })
    );
  });

  it.effect("extracts graph snippet from SearchGraph result", () =>
    Effect.gen(function* () {
      const snippet = extractGraphSnippet({
        toolName: "SearchGraph",
        result: {
          nodes: [
            {
              id: "node-1",
              name: "ServiceMap.Service",
              type: "Entity",
              summary: "service",
              val: 1,
            },
          ],
          links: [
            {
              source: "node-1",
              target: "node-2",
              label: "RELATED_TO",
              fact: "ServiceMap.Service wires services",
            },
          ],
        },
      });

      expect(Option.isSome(snippet)).toBe(true);

      yield* Option.match(snippet, {
        onNone: () => Effect.fail("expected snippet"),
        onSome: (value) =>
          Effect.sync(() => {
            expect(value.nodes).toHaveLength(1);
            expect(value.links).toHaveLength(1);
          }),
      });
    })
  );

  it.effect("extracts graph snippet from GetNode result with node + neighbors", () =>
    Effect.gen(function* () {
      const snippet = extractGraphSnippet({
        toolName: "GetNode",
        result: {
          node: {
            id: "node-1",
            name: "effect/Layer",
            type: "Entity",
            summary: "layer",
            val: 1,
          },
          neighbors: [
            {
              id: "node-2",
              name: "effect/ServiceMap",
              type: "Entity",
              summary: "service",
              val: 1,
            },
          ],
          links: [
            {
              source: "node-1",
              target: "node-2",
              label: "USES",
              fact: "Layer provides ServiceMap.Service",
            },
          ],
          facts: [
            {
              id: "fact-1",
              sourceNodeId: "node-1",
              targetNodeId: "node-2",
              relationship: "USES",
              fact: "Layer provides ServiceMap.Service",
            },
          ],
        },
      });

      expect(Option.isSome(snippet)).toBe(true);

      yield* Option.match(snippet, {
        onNone: () => Effect.fail("expected snippet"),
        onSome: (value) =>
          Effect.sync(() => {
            expect(value.nodes).toHaveLength(2);
            expect(value.links).toHaveLength(1);
          }),
      });
    })
  );

  it("contains canonical regression rules for all required query classes", () => {
    const lowerQueries = pipe(
      CanonicalRegressionRules,
      A.map((rule) => rule.query)
    );

    expect(lowerQueries).toContain("how do i create a tagged service?");
    expect(lowerQueries).toContain("how do i catch errors?");
    expect(lowerQueries).toContain("where is filesystem?");
    expect(lowerQueries).toContain("schema decoding methods?");
    expect(lowerQueries).toContain("how do i create a layer?");
  });
});
