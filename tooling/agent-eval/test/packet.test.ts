import { buildRetrievalPacket } from "@beep/agent-eval/benchmark/packet";
import { describe, expect, it } from "vitest";

describe("retrieval packet", () => {
  it("deduplicates facts", () => {
    const packet = buildRetrievalPacket(["a", "a", "b"], 10, 100);
    expect(packet.facts).toEqual(["a", "b"]);
  });

  it("caps by count", () => {
    const packet = buildRetrievalPacket(["a", "b", "c"], 2, 100);
    expect(packet.facts).toEqual(["a", "b"]);
  });

  it("caps by character budget", () => {
    const packet = buildRetrievalPacket(["alpha", "beta", "gamma"], 10, 9);
    expect(packet.facts).toEqual(["alpha", "beta"]);
  });
});
