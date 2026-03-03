import { describe, expect, it } from "vitest";
import { callRun, makeService } from "./derived";

describe("derived", () => {
  it("covers exported runtime", async () => {
    await callRun("abc");
    expect(makeService()).toBeDefined();
  });
});
