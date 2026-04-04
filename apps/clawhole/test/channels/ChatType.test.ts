import * as O from "effect/Option";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";
import { ChatType, normalizeChatType } from "../../src/channels/ChatType.ts";

const decodeChatTypeOption = S.decodeUnknownOption(ChatType);

describe("normalizeChatType", () => {
  it.each([
    { name: "normalizes direct", value: "direct", expected: "direct" },
    { name: "normalizes dm alias", value: "dm", expected: "direct" },
    { name: "normalizes group", value: "group", expected: "group" },
    { name: "normalizes channel", value: "channel", expected: "channel" },
    { name: "returns undefined for undefined", value: undefined, expected: undefined },
    { name: "returns undefined for empty", value: "", expected: undefined },
    { name: "returns undefined for unknown value", value: "nope", expected: undefined },
    { name: "returns undefined for unsupported room", value: "room", expected: undefined },
  ] satisfies Array<{ name: string; value: string | undefined; expected: ChatType | undefined }>)("$name", ({
    value,
    expected,
  }) => {
    expect(normalizeChatType(value)).toBe(expected);
  });

  it("accepts legacy dm value shape variants and normalizes to direct", () => {
    expect(normalizeChatType("DM")).toBe("direct");
    expect(normalizeChatType(" dm ")).toBe("direct");
  });
});

describe("ChatType schema", () => {
  it("accepts canonical chat type literals", () => {
    expect(O.getOrUndefined(decodeChatTypeOption("direct"))).toBe("direct");
    expect(O.getOrUndefined(decodeChatTypeOption("group"))).toBe("group");
    expect(O.getOrUndefined(decodeChatTypeOption("channel"))).toBe("channel");
  });

  it("rejects aliases and unsupported values", () => {
    expect(O.getOrUndefined(decodeChatTypeOption("dm"))).toBeUndefined();
    expect(O.getOrUndefined(decodeChatTypeOption("DM"))).toBeUndefined();
    expect(O.getOrUndefined(decodeChatTypeOption("room"))).toBeUndefined();
  });
});
