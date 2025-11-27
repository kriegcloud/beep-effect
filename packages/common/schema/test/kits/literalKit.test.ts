import { describe, expect, it } from "bun:test";
import { LiteralKit } from "@beep/schema/derived/kits/literal-kit";
import * as S from "effect/Schema";

describe("LiteralKit", () => {
  describe("with number literals", () => {
    const HttpStatus = LiteralKit(200, 201, 400, 404, 500);

    it("exposes Options as the literal values tuple", () => {
      expect(HttpStatus.Options).toEqual([200, 201, 400, 404, 500]);
    });

    it("creates an Enum object with n-prefixed keys for numbers", () => {
      expect(HttpStatus.Enum.n200).toBe(200);
      expect(HttpStatus.Enum.n201).toBe(201);
      expect(HttpStatus.Enum.n400).toBe(400);
      expect(HttpStatus.Enum.n404).toBe(404);
      expect(HttpStatus.Enum.n500).toBe(500);
    });

    it("provides type guards for each literal", () => {
      expect(HttpStatus.is.n200(200)).toBe(true);
      expect(HttpStatus.is.n200(201)).toBe(false);
      expect(HttpStatus.is.n404(404)).toBe(true);
      expect(HttpStatus.is.n404("404")).toBe(false);
    });

    it("works as a schema for decoding", () => {
      expect(S.decodeSync(HttpStatus)(200)).toBe(200);
      expect(S.decodeSync(HttpStatus)(404)).toBe(404);
    });

    it("rejects invalid values when decoding", () => {
      // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(HttpStatus)(999)).toThrow();
      // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(HttpStatus)("200")).toThrow();
    });

    it("pickOptions returns a subset of literals", () => {
      const successCodes = HttpStatus.pickOptions(200, 201);
      expect(successCodes).toEqual([200, 201]);
    });

    it("omitOptions excludes specified literals", () => {
      const nonSuccess = HttpStatus.omitOptions(200, 201);
      expect(nonSuccess).toEqual([400, 404, 500]);
    });

    it("derive creates a new LiteralKit from subset", () => {
      const SuccessStatus = HttpStatus.derive(200, 201);
      expect(SuccessStatus.Options).toEqual([200, 201]);
      expect(SuccessStatus.Enum.n200).toBe(200);
      expect(SuccessStatus.is.n201(201)).toBe(true);
      expect(S.decodeSync(SuccessStatus)(200)).toBe(200);
      // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(SuccessStatus)(404)).toThrow();
    });
  });

  describe("with string literals", () => {
    const Status = LiteralKit("pending", "active", "archived");

    it("exposes Options as the literal values tuple", () => {
      expect(Status.Options).toEqual(["pending", "active", "archived"]);
    });

    it("creates an Enum object", () => {
      expect(Status.Enum.pending).toBe("pending");
      expect(Status.Enum.active).toBe("active");
      expect(Status.Enum.archived).toBe("archived");
    });

    it("provides type guards", () => {
      expect(Status.is.pending("pending")).toBe(true);
      expect(Status.is.pending("active")).toBe(false);
    });

    it("works as a schema", () => {
      expect(S.decodeSync(Status)("pending")).toBe("pending");
      // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(Status)("unknown")).toThrow();
    });
  });

  describe("with boolean literals", () => {
    const Bool = LiteralKit(true, false);

    it("exposes Options", () => {
      expect(Bool.Options).toEqual([true, false]);
    });

    it("creates Enum with string keys 'true' and 'false'", () => {
      expect(Bool.Enum.true).toBe(true);
      expect(Bool.Enum.false).toBe(false);
    });

    it("provides type guards", () => {
      expect(Bool.is.true(true)).toBe(true);
      expect(Bool.is.true(false)).toBe(false);
      expect(Bool.is.false(false)).toBe(true);
      expect(Bool.is.false(true)).toBe(false);
    });

    it("works as a schema", () => {
      expect(S.decodeSync(Bool)(true)).toBe(true);
      expect(S.decodeSync(Bool)(false)).toBe(false);
      // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(Bool)("true")).toThrow();
    });
  });

  describe("with null literal", () => {
    const Nullable = LiteralKit(null, "value");

    it("exposes Options", () => {
      expect(Nullable.Options).toEqual([null, "value"]);
    });

    it("creates Enum with 'null' key", () => {
      expect(Nullable.Enum.null).toBe(null);
      expect(Nullable.Enum.value).toBe("value");
    });

    it("provides type guards", () => {
      expect(Nullable.is.null(null)).toBe(true);
      expect(Nullable.is.null(undefined)).toBe(false);
      expect(Nullable.is.value("value")).toBe(true);
    });

    it("works as a schema", () => {
      expect(S.decodeSync(Nullable)(null)).toBe(null);
      expect(S.decodeSync(Nullable)("value")).toBe("value");
      // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(Nullable)(undefined)).toThrow();
    });
  });

  describe("with bigint literals", () => {
    const BigNumbers = LiteralKit(1n, 2n, 3n);

    it("exposes Options", () => {
      expect(BigNumbers.Options).toEqual([1n, 2n, 3n]);
    });

    it("creates Enum with 'Xn' keys", () => {
      expect(BigNumbers.Enum["1n"]).toBe(1n);
      expect(BigNumbers.Enum["2n"]).toBe(2n);
      expect(BigNumbers.Enum["3n"]).toBe(3n);
    });

    it("provides type guards", () => {
      expect(BigNumbers.is["1n"](1n)).toBe(true);
      expect(BigNumbers.is["1n"](1)).toBe(false);
      expect(BigNumbers.is["2n"](2n)).toBe(true);
    });

    it("works as a schema", () => {
      expect(S.decodeSync(BigNumbers)(1n)).toBe(1n);
      expect(S.decodeSync(BigNumbers)(2n)).toBe(2n);
       // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(BigNumbers)(4n)).toThrow();
    });
  });

  describe("with single literal", () => {
    const Single = LiteralKit(42);

    it("works with a single literal", () => {
      expect(Single.Options).toEqual([42]);
      expect(Single.Enum.n42).toBe(42);
      expect(Single.is.n42(42)).toBe(true);
      expect(S.decodeSync(Single)(42)).toBe(42);
    });
  });

  describe("annotations", () => {
    it("supports adding annotations", () => {
      const Annotated = LiteralKit(1, 2, 3).annotations({
        identifier: "OneToThree",
        description: "Numbers 1 through 3",
      });

      expect(Annotated.Options).toEqual([1, 2, 3]);
      expect(S.decodeSync(Annotated)(1)).toBe(1);
    });
  });

  describe("derive chain", () => {
    it("supports chained derive calls", () => {
      const Numbers = LiteralKit(1, 2, 3, 4, 5);
      const SmallNumbers = Numbers.derive(1, 2, 3);
      const TinyNumbers = SmallNumbers.derive(1, 2);

      expect(TinyNumbers.Options).toEqual([1, 2]);
      expect(TinyNumbers.Enum.n1).toBe(1);
      expect(TinyNumbers.Enum.n2).toBe(2);
      expect(S.decodeSync(TinyNumbers)(1)).toBe(1);
      // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(TinyNumbers)(3)).toThrow();
    });
  });
});