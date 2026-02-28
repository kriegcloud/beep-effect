import { LiteralKit, LiteralNotInSetError, type LiteralToKey } from "@beep/schema";
import type * as A from "effect/Array";
import * as S from "effect/Schema";
import type { LiteralValue } from "effect/SchemaAST";
import { describe, expect, it } from "tstyche";

describe("LiteralToKey", () => {
  it("maps booleans to 'true' | 'false'", () => {
    expect<LiteralToKey<true>>().type.toBe<"true">();
    expect<LiteralToKey<false>>().type.toBe<"false">();
  });

  it("maps bigints to 'bigint${N}n'", () => {
    expect<LiteralToKey<20n>>().type.toBe<"bigint20n">();
    expect<LiteralToKey<0n>>().type.toBe<"bigint0n">();
  });

  it("maps numbers to 'number${N}'", () => {
    expect<LiteralToKey<1>>().type.toBe<"number1">();
    expect<LiteralToKey<200>>().type.toBe<"number200">();
  });

  it("passes strings through as-is", () => {
    expect<LiteralToKey<"hello">>().type.toBe<"hello">();
    expect<LiteralToKey<"pending">>().type.toBe<"pending">();
  });
});

describe("LiteralKit", () => {
  const Status = LiteralKit([1, 20n, true, false, "hello"] as const);

  it("preserves the literal tuple on Options", () => {
    expect<typeof Status.Options>().type.toBe<readonly [1, 20n, true, false, "hello"]>();
  });

  it("builds Enum members keyed by LiteralToKey", () => {
    expect(Status.Enum.number1).type.toBe<1>();
    expect(Status.Enum.bigint20n).type.toBe<20n>();
    expect(Status.Enum.true).type.toBe<true>();
    expect(Status.Enum.false).type.toBe<false>();
    expect(Status.Enum.hello).type.toBe<"hello">();
  });

  it("exposes per-literal guard functions keyed by LiteralToKey", () => {
    expect(Status.is.number1).type.toBe<(i: unknown) => i is 1>();
    expect(Status.is.bigint20n).type.toBe<(i: unknown) => i is 20n>();
    expect(Status.is.true).type.toBe<(i: unknown) => i is true>();
    expect(Status.is.false).type.toBe<(i: unknown) => i is false>();
    expect(Status.is.hello).type.toBe<(i: unknown) => i is "hello">();
  });

  it("pickOptions preserves the provided subset tuple", () => {
    expect(Status.pickOptions([1, "hello"] as const)).type.toBe<readonly [1, "hello"]>();
    expect(Status.pickOptions([true, false] as const)).type.toBe<readonly [true, false]>();
  });

  it("omitOptions excludes selected literals", () => {
    expect(Status.omitOptions([1, 20n, true] as const)).type.toBe<A.NonEmptyReadonlyArray<false | "hello">>();
  });

  it("$match uncurried returns union of case return types", () => {
    expect(
      Status.$match(1, {
        number1: () => "N" as const,
        bigint20n: () => "B" as const,
        true: () => "T" as const,
        false: () => "F" as const,
        hello: () => "H" as const,
      })
    ).type.toBe<"N" | "B" | "T" | "F" | "H">();
  });

  it("$match curried returns a function from value to union of return types", () => {
    const matcher = Status.$match({
      number1: () => 1 as const,
      bigint20n: () => 2 as const,
      true: () => 3 as const,
      false: () => 4 as const,
      hello: () => 5 as const,
    });

    expect(matcher).type.toBe<(value: 1 | 20n | true | false | "hello") => 1 | 2 | 3 | 4 | 5>();
  });

  it("$match narrows value types in case callbacks", () => {
    Status.$match(1, {
      number1: (v) => {
        expect(v).type.toBe<1>();
      },
      bigint20n: (v) => {
        expect(v).type.toBe<20n>();
      },
      true: (v) => {
        expect(v).type.toBe<true>();
      },
      false: (v) => {
        expect(v).type.toBe<false>();
      },
      hello: (v) => {
        expect(v).type.toBe<"hello">();
      },
    });
  });

  it("does not expose toTaggedUnion when literals include non-property-key values", () => {
    expect(Status.toTaggedUnion).type.toBe<never>();
  });
});

describe("LiteralKit (string-only)", () => {
  const Dir = LiteralKit(["up", "down"] as const);
  const EventKind = LiteralKit(["created", "deleted"] as const);

  it("uses string values directly as keys", () => {
    expect(Dir.Enum.up).type.toBe<"up">();
    expect(Dir.Enum.down).type.toBe<"down">();
  });

  it("toTaggedUnion preserves per-case literal narrowing", () => {
    const Event = EventKind.toTaggedUnion("kind")({
      created: {
        value: S.Literal(1),
      },
      deleted: {
        value: S.Literal(2),
      },
    });

    expect(Event).type.toBe<
      S.toTaggedUnion<
        "kind",
        readonly [
          S.Struct<{ readonly kind: S.tag<"created">; readonly value: S.Literal<1> }>,
          S.Struct<{ readonly kind: S.tag<"deleted">; readonly value: S.Literal<2> }>,
        ]
      >
    >();

    expect(Event.cases.created).type.toBe<
      S.Struct<{ readonly kind: S.tag<"created">; readonly value: S.Literal<1> }>
    >();
    expect(Event.cases.deleted).type.toBe<
      S.Struct<{ readonly kind: S.tag<"deleted">; readonly value: S.Literal<2> }>
    >();
    expect(Event.guards.created).type.toBe<(u: unknown) => u is { readonly kind: "created"; readonly value: 1 }>();
    expect(Event.guards.deleted).type.toBe<(u: unknown) => u is { readonly kind: "deleted"; readonly value: 2 }>();
  });

  it("toTaggedUnion enforces exhaustive keys and disallows extras", () => {
    // @ts-expect-error!
    EventKind.toTaggedUnion("kind")({
      created: {
        value: S.Literal(1),
      },
    });

    EventKind.toTaggedUnion("kind")({
      created: {
        value: S.Literal(1),
      },
      deleted: {
        value: S.Literal(2),
      },
      // @ts-expect-error!
      updated: {
        value: S.Literal(3),
      },
    });
  });

  it("toTaggedUnion disallows defining the discriminator field in cases", () => {
    EventKind.toTaggedUnion("kind")({
      created: {
        // @ts-expect-error!
        kind: S.String,
        // @ts-expect-error!
        value: S.Literal(1),
      },
      deleted: {
        value: S.Literal(2),
      },
    });
  });
});

describe("LiteralKit toTaggedUnion (number keys)", () => {
  const NumberKind = LiteralKit([1, 2] as const);

  it("uses LiteralToKey for case object keys", () => {
    const NumberEvent = NumberKind.toTaggedUnion("kind")({
      number1: {
        value: S.Literal("one"),
      },
      number2: {
        value: S.Literal("two"),
      },
    });

    expect(NumberEvent.guards[1]).type.toBe<(u: unknown) => u is { readonly kind: 1; readonly value: "one" }>();
    expect(NumberEvent.guards[2]).type.toBe<(u: unknown) => u is { readonly kind: 2; readonly value: "two" }>();
  });
});

describe("LiteralNotInSetError", () => {
  it("is constructible and exposes its tagged shape", () => {
    const error = new LiteralNotInSetError({
      literals: [1, "hello", true],
      input: [],
    });

    expect<LiteralNotInSetError["_tag"]>().type.toBe<"LiteralNotInSetError">();
    expect<LiteralNotInSetError["literals"]>().type.toBe<ReadonlyArray<LiteralValue>>();
    expect<LiteralNotInSetError["input"]>().type.toBe<ReadonlyArray<LiteralValue>>();
    expect(error).type.toBeAssignableTo<LiteralNotInSetError>();
  });
});
// bench
