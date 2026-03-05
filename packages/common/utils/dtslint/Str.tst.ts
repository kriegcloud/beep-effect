import { type A, Str } from "@beep/utils";
import { pipe } from "effect/Function";
import { describe, expect, it } from "tstyche";

describe("prefix", () => {
  it("data-first returns template literal", () => {
    expect(Str.prefix("world", "hello_")).type.toBe<"hello_world">();
  });

  it("data-last returns template literal", () => {
    expect(pipe("world" as const, Str.prefix("hello_"))).type.toBe<"hello_world">();
  });
});

describe("postfix", () => {
  it("data-first returns template literal", () => {
    expect(Str.postfix("hello", "_world")).type.toBe<"hello_world">();
  });

  it("data-last returns template literal", () => {
    expect(pipe("hello" as const, Str.postfix("_world"))).type.toBe<"hello_world">();
  });
});

describe("mapPrefix", () => {
  it("data-first returns prefixed array", () => {
    const arr = ["a", "b"] as const;
    expect(Str.mapPrefix("x_", arr)).type.toBe<A.NonEmptyReadonlyArray<"x_a" | "x_b">>();
  });

  it("data-last returns prefixed array", () => {
    const arr = ["a", "b"] as const;
    expect(pipe(arr, Str.mapPrefix("x_"))).type.toBe<A.NonEmptyReadonlyArray<"x_a" | "x_b">>();
  });
});

describe("mapPostfix", () => {
  it("data-first returns postfixed array", () => {
    const arr = ["a", "b"] as const;
    expect(Str.mapPostfix("_x", arr)).type.toBe<A.NonEmptyReadonlyArray<"a_x" | "b_x">>();
  });

  it("data-last returns postfixed array", () => {
    const arr = ["a", "b"] as const;
    expect(pipe(arr, Str.mapPostfix("_x"))).type.toBe<A.NonEmptyReadonlyArray<"a_x" | "b_x">>();
  });
});

describe("camelCase", () => {
  it("returns CamelCase type", () => {
    expect(Str.camelCase("foo_bar")).type.toBe<"fooBar">();
  });
});

describe("snakeCase", () => {
  it("returns SnakeCase type", () => {
    expect(Str.snakeCase("fooBar")).type.toBe<"foo_bar">();
  });
});

describe("kebabCase", () => {
  it("returns KebabCase type", () => {
    expect(Str.kebabCase("fooBar")).type.toBe<"foo-bar">();
  });
});

describe("screamingSnake", () => {
  it("returns ScreamingSnakeCase type", () => {
    expect(Str.screamingSnake("fooBar")).type.toBe<"FOO_BAR">();
  });
});

describe("pascalCase", () => {
  it("returns PascalCase type", () => {
    expect(Str.pascalCase("foo_bar")).type.toBe<"FooBar">();
  });
});

describe("pascalToSnake", () => {
  it("returns SnakeCase type", () => {
    expect(Str.pascalToSnake("FooBar")).type.toBe<"foo_bar">();
  });
});

describe("snakeToCamel", () => {
  it("returns CamelCase type", () => {
    expect(Str.snakeToCamel("foo_bar")).type.toBe<"fooBar">();
  });
});

describe("snakeToKebab", () => {
  it("returns KebabCase type", () => {
    expect(Str.snakeToKebab("foo_bar")).type.toBe<"foo-bar">();
  });
});

describe("camelToSnake", () => {
  it("returns SnakeCase type", () => {
    expect(Str.camelToSnake("fooBar")).type.toBe<"foo_bar">();
  });
});

describe("snakeToPascal", () => {
  it("returns PascalCase type", () => {
    expect(Str.snakeToPascal("foo_bar")).type.toBe<"FooBar">();
  });
});

describe("kebabToSnake", () => {
  it("returns SnakeCase type", () => {
    expect(Str.kebabToSnake("foo-bar")).type.toBe<"foo_bar">();
  });
});

describe("startsWith", () => {
  it("data-first narrows to intersection", () => {
    const str = "hello_world" as string;
    if (Str.startsWith(str, "hello")) {
      expect(str).type.toBe<string & `hello${string}`>();
    }
  });

  it("data-last returns type guard function", () => {
    expect(Str.startsWith("hello")).type.toBe<
      <const TStr extends string>(str: TStr) => str is TStr & `hello${string}`
    >();
  });

  it("preserves literal type in narrowing", () => {
    const str = "hello_world" as const;
    if (Str.startsWith(str, "hello")) {
      expect(str).type.toBe<"hello_world" & `hello${string}`>();
    }
  });
});

describe("endsWith", () => {
  it("data-first narrows to intersection", () => {
    const str = "hello_world" as string;
    if (Str.endsWith(str, "world")) {
      expect(str).type.toBe<string & `${string}world`>();
    }
  });

  it("data-last returns type guard function", () => {
    expect(Str.endsWith("world")).type.toBe<<const TStr extends string>(str: TStr) => str is TStr & `${string}world`>();
  });

  it("preserves literal type in narrowing", () => {
    const str = "hello_world" as const;
    if (Str.endsWith(str, "world")) {
      expect(str).type.toBe<"hello_world" & `${string}world`>();
    }
  });
});

describe("contains", () => {
  it("data-first narrows to intersection", () => {
    const str = "hello_world" as string;
    if (Str.contains(str, "lo_wo")) {
      expect(str).type.toBe<string & `${string}lo_wo${string}`>();
    }
  });

  it("data-last returns type guard function", () => {
    expect(Str.contains("lo_wo")).type.toBe<
      <const TStr extends string>(str: TStr) => str is TStr & `${string}lo_wo${string}`
    >();
  });

  it("preserves literal type in narrowing", () => {
    const str = "hello_world" as const;
    if (Str.contains(str, "lo_wo")) {
      expect(str).type.toBe<"hello_world" & `${string}lo_wo${string}`>();
    }
  });
});

describe("repeat", () => {
  it("data-first returns StringRepeat type", () => {
    expect(Str.repeat("ab", 3)).type.toBe<"ababab">();
  });

  it("data-last returns StringRepeat type", () => {
    expect(pipe("ab" as const, Str.repeat(3))).type.toBe<"ababab">();
  });
});
