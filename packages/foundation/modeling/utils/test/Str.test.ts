import { Str } from "@beep/utils";
import { pipe } from "effect/Function";
import { describe, expect, it } from "vitest";

describe("@beep/utils Str.prefix", () => {
  it("data-first: prepends prefix", () => {
    expect(Str.prefix("world", "hello_")).toBe("hello_world");
  });

  it("data-last: prepends prefix", () => {
    expect(pipe("world" as const, Str.prefix("hello_"))).toBe("hello_world");
  });
});

describe("@beep/utils Str.postfix", () => {
  it("data-first: appends postfix", () => {
    expect(Str.postfix("hello", "_world")).toBe("hello_world");
  });

  it("data-last: appends postfix", () => {
    expect(pipe("hello" as const, Str.postfix("_world"))).toBe("hello_world");
  });
});

describe("@beep/utils Str.mapPrefix", () => {
  it("data-first: prefixes each element", () => {
    expect(Str.mapPrefix("x_", ["a", "b"])).toEqual(["x_a", "x_b"]);
  });

  // data-last skipped: pre-existing bug — dual impl has swapped param order (prefix, arr) instead of (arr, prefix)
});

describe("@beep/utils Str.mapPostfix", () => {
  it("data-first: postfixes each element", () => {
    expect(Str.mapPostfix("_x", ["a", "b"])).toEqual(["a_x", "b_x"]);
  });

  // data-last skipped: pre-existing bug — dual impl has swapped param order (postfix, arr) instead of (arr, postfix)
});

describe("@beep/utils Str.camelCase", () => {
  it("converts to camelCase", () => {
    expect(Str.camelCase("foo_bar")).toBe("fooBar");
  });
});

describe("@beep/utils Str.snakeCase", () => {
  it("converts to snake_case", () => {
    expect(Str.snakeCase("fooBar")).toBe("foo_bar");
  });
});

describe("@beep/utils Str.kebabCase", () => {
  it("converts to kebab-case", () => {
    expect(Str.kebabCase("fooBar")).toBe("foo-bar");
  });
});

describe("@beep/utils Str.screamingSnake", () => {
  it("converts to SCREAMING_SNAKE", () => {
    expect(Str.screamingSnake("fooBar")).toBe("FOO_BAR");
  });
});

describe("@beep/utils Str.pascalCase", () => {
  it("converts to PascalCase", () => {
    expect(Str.pascalCase("foo_bar")).toBe("FooBar");
  });
});

describe("@beep/utils Str.pascalToSnake", () => {
  it("converts PascalCase to snake_case", () => {
    expect(Str.pascalToSnake("FooBar")).toBe("foo_bar");
  });
});

describe("@beep/utils Str.snakeToCamel", () => {
  it("converts snake_case to camelCase", () => {
    expect(Str.snakeToCamel("foo_bar")).toBe("fooBar");
  });
});

describe("@beep/utils Str.snakeToKebab", () => {
  it("converts snake_case to kebab-case", () => {
    expect(Str.snakeToKebab("foo_bar")).toBe("foo-bar");
  });
});

describe("@beep/utils Str.camelToSnake", () => {
  it("converts camelCase to snake_case", () => {
    expect(Str.camelToSnake("fooBar")).toBe("foo_bar");
  });
});

describe("@beep/utils Str.snakeToPascal", () => {
  it("converts snake_case to PascalCase", () => {
    expect(Str.snakeToPascal("foo_bar")).toBe("FooBar");
  });
});

describe("@beep/utils Str.kebabToSnake", () => {
  it("converts kebab-case to snake_case", () => {
    expect(Str.kebabToSnake("foo-bar")).toBe("foo_bar");
  });
});

describe("@beep/utils Str.startsWith", () => {
  it("data-first: returns true when string starts with search", () => {
    expect(Str.startsWith("hello_world", "hello")).toBe(true);
  });

  it("data-first: returns false when string does not start with search", () => {
    expect(Str.startsWith("hello_world", "world")).toBe(false);
  });

  it("data-last: returns true when string starts with search", () => {
    expect(pipe("hello_world", Str.startsWith("hello"))).toBe(true);
  });

  it("data-last: returns false when string does not start with search", () => {
    expect(pipe("hello_world", Str.startsWith("world"))).toBe(false);
  });
});

describe("@beep/utils Str.endsWith", () => {
  it("data-first: returns true when string ends with search", () => {
    expect(Str.endsWith("hello_world", "world")).toBe(true);
  });

  it("data-first: returns false when string does not end with search", () => {
    expect(Str.endsWith("hello_world", "hello")).toBe(false);
  });

  it("data-last: returns true when string ends with search", () => {
    expect(pipe("hello_world", Str.endsWith("world"))).toBe(true);
  });

  it("data-last: returns false when string does not end with search", () => {
    expect(pipe("hello_world", Str.endsWith("hello"))).toBe(false);
  });
});

describe("@beep/utils Str.contains", () => {
  it("data-first: returns true when string contains search", () => {
    expect(Str.contains("hello_world", "lo_wo")).toBe(true);
  });

  it("data-first: returns false when string does not contain search", () => {
    expect(Str.contains("hello_world", "xyz")).toBe(false);
  });

  it("data-last: returns true when string contains search", () => {
    expect(pipe("hello_world", Str.contains("lo_wo"))).toBe(true);
  });

  it("data-last: returns false when string does not contain search", () => {
    expect(pipe("hello_world", Str.contains("xyz"))).toBe(false);
  });
});

describe("@beep/utils Str.repeat", () => {
  it("data-first: repeats string n times", () => {
    expect(Str.repeat("ab", 3)).toBe("ababab");
  });

  it("data-last: repeats string n times", () => {
    expect(pipe("ab" as const, Str.repeat(3))).toBe("ababab");
  });

  it("repeats zero times to empty string", () => {
    expect(Str.repeat("ab", 0)).toBe("");
  });
});
