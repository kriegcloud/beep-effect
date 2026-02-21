import type * as A from "effect/Array";
import { describe, expect, it } from "tstyche";
import { NotInLiteralsError, StringLiteralKit } from "../src/index.js";

describe("StringLiteralKit", () => {
  const WaveformMode = StringLiteralKit(["static", "scrolling"] as const);

  it("preserves the literal tuple on Options", () => {
    expect<typeof WaveformMode.Options>().type.toBe<readonly ["static", "scrolling"]>();
  });

  it("builds identity enum members", () => {
    expect(WaveformMode.Enum.static).type.toBe<"static">();
    expect(WaveformMode.Enum.scrolling).type.toBe<"scrolling">();
  });

  it("exposes per-literal guard functions", () => {
    expect(WaveformMode.is.static).type.toBe<(i: unknown) => i is "static">();
    expect(WaveformMode.is.scrolling).type.toBe<(i: unknown) => i is "scrolling">();
  });

  it("pickOptions preserves the provided subset tuple", () => {
    expect(WaveformMode.pickOptions(["scrolling"] as const)).type.toBe<readonly ["scrolling"]>();
    expect(WaveformMode.pickOptions(["static", "scrolling"] as const)).type.toBe<readonly ["static", "scrolling"]>();
  });

  it("omitOptions excludes selected literals", () => {
    expect(WaveformMode.omitOptions(["static"] as const)).type.toBe<A.NonEmptyReadonlyArray<"scrolling">>();
    expect(WaveformMode.omitOptions(["scrolling"] as const)).type.toBe<A.NonEmptyReadonlyArray<"static">>();
  });

  it("$match supports uncurried and curried signatures", () => {
    expect(
      WaveformMode.$match("static", {
        static: () => "S" as const,
        scrolling: () => "R" as const,
      })
    ).type.toBe<"S" | "R">();

    const matcher = WaveformMode.$match({
      static: () => 1 as const,
      scrolling: () => 2 as const,
    });

    expect(matcher).type.toBe<(value: "static" | "scrolling") => 1 | 2>();
  });
});

describe("NotInLiteralsError", () => {
  it("is constructible and exposes its tagged shape", () => {
    const error = new NotInLiteralsError({
      literals: ["static", "scrolling"],
      input: [],
    });

    expect<NotInLiteralsError["_tag"]>().type.toBe<"NotInLiteralsError">();
    expect<NotInLiteralsError["literals"]>().type.toBe<ReadonlyArray<string>>();
    expect<NotInLiteralsError["input"]>().type.toBe<ReadonlyArray<string>>();
    expect(error).type.toBeAssignableTo<NotInLiteralsError>();
  });
});
