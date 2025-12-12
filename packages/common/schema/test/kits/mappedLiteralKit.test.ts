import { describe, expect, it } from "bun:test";
import { MappedLiteralKit } from "@beep/schema/derived/kits/mapped-literal-kit";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";

describe("MappedLiteralKit", () => {
  describe("with string to string mapping", () => {
    const StatusMapping = MappedLiteralKit(["pending", "PENDING"], ["active", "ACTIVE"], ["archived", "ARCHIVED"]);

    it("exposes Pairs as the original tuples", () => {
      expect(StatusMapping.Pairs).toEqual([
        ["pending", "PENDING"],
        ["active", "ACTIVE"],
        ["archived", "ARCHIVED"],
      ]);
    });

    it("provides From kit with source literals", () => {
      expect(StatusMapping.From.Options).toEqual(["pending", "active", "archived"]);
      expect(StatusMapping.From.Enum.pending).toBe("pending");
      expect(StatusMapping.From.Enum.active).toBe("active");
      expect(StatusMapping.From.Enum.archived).toBe("archived");
    });

    it("provides To kit with target literals", () => {
      expect(StatusMapping.To.Options).toEqual(["PENDING", "ACTIVE", "ARCHIVED"]);
      expect(StatusMapping.To.Enum.PENDING).toBe("PENDING");
      expect(StatusMapping.To.Enum.ACTIVE).toBe("ACTIVE");
      expect(StatusMapping.To.Enum.ARCHIVED).toBe("ARCHIVED");
    });

    it("provides DecodedEnum mapping from keys to decoded values", () => {
      expect(StatusMapping.DecodedEnum.pending).toBe("PENDING");
      expect(StatusMapping.DecodedEnum.active).toBe("ACTIVE");
      expect(StatusMapping.DecodedEnum.archived).toBe("ARCHIVED");
    });

    it("provides EncodedEnum mapping to keys to encoded values", () => {
      expect(StatusMapping.EncodedEnum.PENDING).toBe("pending");
      expect(StatusMapping.EncodedEnum.ACTIVE).toBe("active");
      expect(StatusMapping.EncodedEnum.ARCHIVED).toBe("archived");
    });

    it("decodes encoded values to decoded values", () => {
      expect(S.decodeSync(StatusMapping)("pending")).toBe("PENDING");
      expect(S.decodeSync(StatusMapping)("active")).toBe("ACTIVE");
      expect(S.decodeSync(StatusMapping)("archived")).toBe("ARCHIVED");
    });

    it("encodes decoded values to encoded values", () => {
      expect(S.encodeSync(StatusMapping)("PENDING")).toBe("pending");
      expect(S.encodeSync(StatusMapping)("ACTIVE")).toBe("active");
      expect(S.encodeSync(StatusMapping)("ARCHIVED")).toBe("archived");
    });

    it("rejects invalid values when decoding", () => {
      // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(StatusMapping)("PENDING")).toThrow();
      // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(StatusMapping)("unknown")).toThrow();
    });

    it("provides decodeMap for programmatic lookups", () => {
      expect(StatusMapping.decodeMap.get("pending")).toBe("PENDING");
      expect(StatusMapping.decodeMap.get("active")).toBe("ACTIVE");
      // @ts-expect-error - testing invalid input returns undefined
      expect(StatusMapping.decodeMap.get("unknown")).toBeUndefined();
    });

    it("provides encodeMap for reverse lookups", () => {
      expect(StatusMapping.encodeMap.get("PENDING")).toBe("pending");
      expect(StatusMapping.encodeMap.get("ACTIVE")).toBe("active");
      // @ts-expect-error - testing invalid input returns undefined
      expect(StatusMapping.encodeMap.get("UNKNOWN")).toBeUndefined();
    });

    it("provides Effect HashMap for immutable lookups", () => {
      expect(HashMap.get(StatusMapping.Map, "pending")).toEqual(O.some("PENDING"));
      expect(HashMap.get(StatusMapping.Map, "active")).toEqual(O.some("ACTIVE"));
      // @ts-expect-error - testing invalid input returns none
      expect(HashMap.get(StatusMapping.Map, "unknown")).toEqual(O.none());
    });
  });

  describe("with string to number mapping (HTTP status codes)", () => {
    const HttpStatus = MappedLiteralKit(
      ["OK", 200],
      ["CREATED", 201],
      ["NOT_FOUND", 404],
      ["INTERNAL_SERVER_ERROR", 500]
    );

    it("exposes Pairs correctly", () => {
      expect(HttpStatus.Pairs).toEqual([
        ["OK", 200],
        ["CREATED", 201],
        ["NOT_FOUND", 404],
        ["INTERNAL_SERVER_ERROR", 500],
      ]);
    });

    it("provides From kit with string literals", () => {
      expect(HttpStatus.From.Options).toEqual(["OK", "CREATED", "NOT_FOUND", "INTERNAL_SERVER_ERROR"]);
      expect(HttpStatus.From.Enum.OK).toBe("OK");
      expect(HttpStatus.From.Enum.NOT_FOUND).toBe("NOT_FOUND");
    });

    it("provides To kit with number literals using n-prefix", () => {
      expect(HttpStatus.To.Options).toEqual([200, 201, 404, 500]);
      expect(HttpStatus.To.Enum.n200).toBe(200);
      expect(HttpStatus.To.Enum.n404).toBe(404);
    });

    it("provides DecodedEnum mapping string keys to number values", () => {
      expect(HttpStatus.DecodedEnum.OK).toBe(200);
      expect(HttpStatus.DecodedEnum.CREATED).toBe(201);
      expect(HttpStatus.DecodedEnum.NOT_FOUND).toBe(404);
      expect(HttpStatus.DecodedEnum.INTERNAL_SERVER_ERROR).toBe(500);
    });

    it("provides EncodedEnum mapping n-prefixed keys to string values", () => {
      expect(HttpStatus.EncodedEnum.n200).toBe("OK");
      expect(HttpStatus.EncodedEnum.n201).toBe("CREATED");
      expect(HttpStatus.EncodedEnum.n404).toBe("NOT_FOUND");
      expect(HttpStatus.EncodedEnum.n500).toBe("INTERNAL_SERVER_ERROR");
    });

    it("decodes string to number", () => {
      expect(S.decodeSync(HttpStatus)("OK")).toBe(200);
      expect(S.decodeSync(HttpStatus)("NOT_FOUND")).toBe(404);
    });

    it("encodes number to string", () => {
      expect(S.encodeSync(HttpStatus)(200)).toBe("OK");
      expect(S.encodeSync(HttpStatus)(404)).toBe("NOT_FOUND");
    });

    it("rejects invalid values", () => {
      // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(HttpStatus)(200)).toThrow();
      // @ts-expect-error - testing invalid input
      expect(() => S.decodeSync(HttpStatus)("UNKNOWN")).toThrow();
    });
  });

  describe("with number to string mapping", () => {
    const ErrorCodeMapping = MappedLiteralKit([1001, "INVALID_INPUT"], [1002, "NOT_FOUND"], [1003, "UNAUTHORIZED"]);

    it("provides DecodedEnum with n-prefixed keys", () => {
      expect(ErrorCodeMapping.DecodedEnum.n1001).toBe("INVALID_INPUT");
      expect(ErrorCodeMapping.DecodedEnum.n1002).toBe("NOT_FOUND");
      expect(ErrorCodeMapping.DecodedEnum.n1003).toBe("UNAUTHORIZED");
    });

    it("provides EncodedEnum with string keys", () => {
      expect(ErrorCodeMapping.EncodedEnum.INVALID_INPUT).toBe(1001);
      expect(ErrorCodeMapping.EncodedEnum.NOT_FOUND).toBe(1002);
      expect(ErrorCodeMapping.EncodedEnum.UNAUTHORIZED).toBe(1003);
    });

    it("decodes numbers to strings", () => {
      expect(S.decodeSync(ErrorCodeMapping)(1001)).toBe("INVALID_INPUT");
      expect(S.decodeSync(ErrorCodeMapping)(1002)).toBe("NOT_FOUND");
    });

    it("encodes strings to numbers", () => {
      expect(S.encodeSync(ErrorCodeMapping)("INVALID_INPUT")).toBe(1001);
      expect(S.encodeSync(ErrorCodeMapping)("NOT_FOUND")).toBe(1002);
    });
  });

  describe("with boolean mappings", () => {
    const BoolMapping = MappedLiteralKit([true, "yes"], [false, "no"]);

    it("provides From kit with boolean literals", () => {
      expect(BoolMapping.From.Options).toEqual([true, false]);
      expect(BoolMapping.From.Enum.true).toBe(true);
      expect(BoolMapping.From.Enum.false).toBe(false);
    });

    it("provides To kit with string literals", () => {
      expect(BoolMapping.To.Options).toEqual(["yes", "no"]);
      expect(BoolMapping.To.Enum.yes).toBe("yes");
      expect(BoolMapping.To.Enum.no).toBe("no");
    });

    it("provides DecodedEnum with 'true' and 'false' keys", () => {
      expect(BoolMapping.DecodedEnum.true).toBe("yes");
      expect(BoolMapping.DecodedEnum.false).toBe("no");
    });

    it("provides EncodedEnum with string keys", () => {
      expect(BoolMapping.EncodedEnum.yes).toBe(true);
      expect(BoolMapping.EncodedEnum.no).toBe(false);
    });

    it("decodes booleans to strings", () => {
      expect(S.decodeSync(BoolMapping)(true)).toBe("yes");
      expect(S.decodeSync(BoolMapping)(false)).toBe("no");
    });

    it("encodes strings to booleans", () => {
      expect(S.encodeSync(BoolMapping)("yes")).toBe(true);
      expect(S.encodeSync(BoolMapping)("no")).toBe(false);
    });
  });

  describe("with null mappings", () => {
    const NullMapping = MappedLiteralKit([null, "NULL_VALUE"], ["value", "REAL_VALUE"]);

    it("provides From kit with null literal", () => {
      expect(NullMapping.From.Options).toEqual([null, "value"]);
      expect(NullMapping.From.Enum.null).toBe(null);
      expect(NullMapping.From.Enum.value).toBe("value");
    });

    it("provides DecodedEnum with 'null' key", () => {
      expect(NullMapping.DecodedEnum.null).toBe("NULL_VALUE");
      expect(NullMapping.DecodedEnum.value).toBe("REAL_VALUE");
    });

    it("provides EncodedEnum mapping to null", () => {
      expect(NullMapping.EncodedEnum.NULL_VALUE).toBe(null);
      expect(NullMapping.EncodedEnum.REAL_VALUE).toBe("value");
    });

    it("decodes null to string", () => {
      expect(S.decodeSync(NullMapping)(null)).toBe("NULL_VALUE");
      expect(S.decodeSync(NullMapping)("value")).toBe("REAL_VALUE");
    });

    it("encodes string to null", () => {
      expect(S.encodeSync(NullMapping)("NULL_VALUE")).toBe(null);
      expect(S.encodeSync(NullMapping)("REAL_VALUE")).toBe("value");
    });
  });

  describe("with bigint mappings", () => {
    const BigIntMapping = MappedLiteralKit([1n, "ONE"], [2n, "TWO"], [3n, "THREE"]);

    it("provides From kit with bigint literals", () => {
      expect(BigIntMapping.From.Options).toEqual([1n, 2n, 3n]);
      expect(BigIntMapping.From.Enum["1n"]).toBe(1n);
      expect(BigIntMapping.From.Enum["2n"]).toBe(2n);
    });

    it("provides DecodedEnum with bigint-suffixed keys", () => {
      expect(BigIntMapping.DecodedEnum["1n"]).toBe("ONE");
      expect(BigIntMapping.DecodedEnum["2n"]).toBe("TWO");
      expect(BigIntMapping.DecodedEnum["3n"]).toBe("THREE");
    });

    it("provides EncodedEnum with string keys", () => {
      expect(BigIntMapping.EncodedEnum.ONE).toBe(1n);
      expect(BigIntMapping.EncodedEnum.TWO).toBe(2n);
      expect(BigIntMapping.EncodedEnum.THREE).toBe(3n);
    });

    it("decodes bigints to strings", () => {
      expect(S.decodeSync(BigIntMapping)(1n)).toBe("ONE");
      expect(S.decodeSync(BigIntMapping)(2n)).toBe("TWO");
    });

    it("encodes strings to bigints", () => {
      expect(S.encodeSync(BigIntMapping)("ONE")).toBe(1n);
      expect(S.encodeSync(BigIntMapping)("TWO")).toBe(2n);
    });
  });

  describe("with single pair", () => {
    const Single = MappedLiteralKit(["only", "ONLY"]);

    it("works with a single pair", () => {
      expect(Single.Pairs).toEqual([["only", "ONLY"]]);
      expect(Single.DecodedEnum.only).toBe("ONLY");
      expect(Single.EncodedEnum.ONLY).toBe("only");
      expect(S.decodeSync(Single)("only")).toBe("ONLY");
      expect(S.encodeSync(Single)("ONLY")).toBe("only");
    });
  });

  describe("with number to number mapping", () => {
    const NumberMapping = MappedLiteralKit([1, 100], [2, 200], [3, 300]);

    it("provides DecodedEnum with n-prefixed from keys", () => {
      expect(NumberMapping.DecodedEnum.n1).toBe(100);
      expect(NumberMapping.DecodedEnum.n2).toBe(200);
      expect(NumberMapping.DecodedEnum.n3).toBe(300);
    });

    it("provides EncodedEnum with n-prefixed to keys", () => {
      expect(NumberMapping.EncodedEnum.n100).toBe(1);
      expect(NumberMapping.EncodedEnum.n200).toBe(2);
      expect(NumberMapping.EncodedEnum.n300).toBe(3);
    });

    it("decodes and encodes numbers", () => {
      expect(S.decodeSync(NumberMapping)(1)).toBe(100);
      expect(S.encodeSync(NumberMapping)(100)).toBe(1);
    });
  });

  describe("annotations", () => {
    it("supports adding annotations", () => {
      const Annotated = MappedLiteralKit(["a", "A"], ["b", "B"]).annotations({
        identifier: "LetterMapping",
        description: "Maps lowercase to uppercase letters",
      });

      expect(Annotated.Pairs).toEqual([
        ["a", "A"],
        ["b", "B"],
      ]);
      expect(Annotated.DecodedEnum.a).toBe("A");
      expect(Annotated.EncodedEnum.A).toBe("a");
      expect(S.decodeSync(Annotated)("a")).toBe("A");
    });

    it("preserves all properties after annotation", () => {
      const Annotated = MappedLiteralKit(["x", 1], ["y", 2]).annotations({
        identifier: "CoordinateMapping",
      });

      // All properties should still work
      expect(Annotated.From.Options).toEqual(["x", "y"]);
      expect(Annotated.To.Options).toEqual([1, 2]);
      expect(Annotated.DecodedEnum.x).toBe(1);
      expect(Annotated.DecodedEnum.y).toBe(2);
      expect(Annotated.EncodedEnum.n1).toBe("x");
      expect(Annotated.EncodedEnum.n2).toBe("y");
      expect(Annotated.decodeMap.get("x")).toBe(1);
      expect(Annotated.encodeMap.get(1)).toBe("x");
    });
  });

  describe("type safety", () => {
    const TypedMapping = MappedLiteralKit(["success", 200], ["error", 500]);

    it("DecodedEnum values have correct types", () => {
      const successCode: 200 = TypedMapping.DecodedEnum.success;
      const errorCode: 500 = TypedMapping.DecodedEnum.error;
      expect(successCode).toBe(200);
      expect(errorCode).toBe(500);
    });

    it("EncodedEnum values have correct types", () => {
      const successName: "success" = TypedMapping.EncodedEnum.n200;
      const errorName: "error" = TypedMapping.EncodedEnum.n500;
      expect(successName).toBe("success");
      expect(errorName).toBe("error");
    });

    it("From and To kits have correct types", () => {
      const fromOptions: readonly ["success", "error"] = TypedMapping.From.Options;
      const toOptions: readonly [200, 500] = TypedMapping.To.Options;
      expect(fromOptions).toEqual(["success", "error"]);
      expect(toOptions).toEqual([200, 500]);
    });
  });

  describe("comprehensive HTTP status code example", () => {
    const HttpStatusCode = MappedLiteralKit(
      ["OK", 200],
      ["CREATED", 201],
      ["ACCEPTED", 202],
      ["NO_CONTENT", 204],
      ["BAD_REQUEST", 400],
      ["UNAUTHORIZED", 401],
      ["FORBIDDEN", 403],
      ["NOT_FOUND", 404],
      ["INTERNAL_SERVER_ERROR", 500],
      ["BAD_GATEWAY", 502],
      ["SERVICE_UNAVAILABLE", 503]
    );

    it("provides complete bidirectional mapping", () => {
      // Forward lookups (DecodedEnum)
      expect(HttpStatusCode.DecodedEnum.OK).toBe(200);
      expect(HttpStatusCode.DecodedEnum.NOT_FOUND).toBe(404);
      expect(HttpStatusCode.DecodedEnum.INTERNAL_SERVER_ERROR).toBe(500);

      // Reverse lookups (EncodedEnum)
      expect(HttpStatusCode.EncodedEnum.n200).toBe("OK");
      expect(HttpStatusCode.EncodedEnum.n404).toBe("NOT_FOUND");
      expect(HttpStatusCode.EncodedEnum.n500).toBe("INTERNAL_SERVER_ERROR");
    });

    it("works as schema for HTTP response handling", () => {
      // Decoding: API key → status code
      const statusCode = S.decodeSync(HttpStatusCode)("OK");
      expect(statusCode).toBe(200);

      // Encoding: status code → API key
      const statusName = S.encodeSync(HttpStatusCode)(404);
      expect(statusName).toBe("NOT_FOUND");
    });

    it("provides all access patterns", () => {
      // From kit for encoded values
      expect(HttpStatusCode.From.is.OK("OK")).toBe(true);
      expect(HttpStatusCode.From.is.NOT_FOUND("NOT_FOUND")).toBe(true);

      // To kit for decoded values
      expect(HttpStatusCode.To.is.n200(200)).toBe(true);
      expect(HttpStatusCode.To.is.n404(404)).toBe(true);

      // Map lookups
      expect(HttpStatusCode.decodeMap.get("UNAUTHORIZED")).toBe(401);
      expect(HttpStatusCode.encodeMap.get(403)).toBe("FORBIDDEN");

      // HashMap lookups
      expect(HashMap.get(HttpStatusCode.Map, "BAD_GATEWAY")).toEqual(O.some(502));
    });
  });

  describe("edge cases", () => {
    it("handles special characters in string literals", () => {
      const SpecialMapping = MappedLiteralKit(
        ["with space", "WITH_SPACE"],
        ["with-dash", "WITH_DASH"],
        ["with.dot", "WITH_DOT"]
      );

      expect(SpecialMapping.DecodedEnum["with space"]).toBe("WITH_SPACE");
      expect(SpecialMapping.DecodedEnum["with-dash"]).toBe("WITH_DASH");
      expect(SpecialMapping.DecodedEnum["with.dot"]).toBe("WITH_DOT");
    });

    it("handles negative numbers", () => {
      const NegativeMapping = MappedLiteralKit(["neg_one", -1], ["neg_two", -2], ["zero", 0]);

      expect(NegativeMapping.DecodedEnum.neg_one).toBe(-1);
      expect(NegativeMapping.DecodedEnum.neg_two).toBe(-2);
      expect(NegativeMapping.DecodedEnum.zero).toBe(0);

      // Note: negative numbers become "n-1", "n-2" etc
      expect(NegativeMapping.EncodedEnum["n-1"]).toBe("neg_one");
      expect(NegativeMapping.EncodedEnum["n-2"]).toBe("neg_two");
      expect(NegativeMapping.EncodedEnum.n0).toBe("zero");
    });

    it("handles floating point numbers", () => {
      const FloatMapping = MappedLiteralKit(["half", 0.5], ["quarter", 0.25], ["tenth", 0.1]);

      expect(FloatMapping.DecodedEnum.half).toBe(0.5);
      expect(FloatMapping.DecodedEnum.quarter).toBe(0.25);

      // Floating point keys
      expect(FloatMapping.EncodedEnum["n0.5"]).toBe("half");
      expect(FloatMapping.EncodedEnum["n0.25"]).toBe("quarter");
      expect(FloatMapping.EncodedEnum["n0.1"]).toBe("tenth");
    });
  });
});
