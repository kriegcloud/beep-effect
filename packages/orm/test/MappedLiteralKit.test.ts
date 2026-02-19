import * as S from "effect/Schema"
import { describe, expect, it } from "vitest"
import { MappedLiteralKit } from "../src/utils/MappedLiteralKit.js"

const Status = MappedLiteralKit(
  ["pending", "PENDING"],
  ["active", "ACTIVE"],
  ["archived", "ARCHIVED"],
)

const HttpStatus = MappedLiteralKit(
  ["OK", 200],
  ["CREATED", 201],
  ["NOT_FOUND", 404],
  ["INTERNAL_SERVER_ERROR", 500],
)

const ErrorCodes = MappedLiteralKit(
  [1001, "INVALID_INPUT"],
  [1002, "NOT_FOUND"],
  [1003, "UNAUTHORIZED"],
)

const BoolMapping = MappedLiteralKit([true, "yes"], [false, "no"])

const BigIntMapping = MappedLiteralKit([1n, "one"], [2n, "two"])

const Single = MappedLiteralKit(["a", "A"])

const NumMapping = MappedLiteralKit([1, 100], [2, 200])

describe("MappedLiteralKit", () => {
  describe("string to string mapping", () => {
    it("From.Options is the from-side literals", () => {
      expect(Status.From.Options).toEqual(["pending", "active", "archived"])
    })

    it("To.Options is the to-side literals", () => {
      expect(Status.To.Options).toEqual(["PENDING", "ACTIVE", "ARCHIVED"])
    })

    it("From.Enum has identity keys for strings", () => {
      expect(Status.From.Enum.pending).toBe("pending")
      expect(Status.From.Enum.active).toBe("active")
      expect(Status.From.Enum.archived).toBe("archived")
    })

    it("To.Enum has identity keys for strings", () => {
      expect(Status.To.Enum.PENDING).toBe("PENDING")
      expect(Status.To.Enum.ACTIVE).toBe("ACTIVE")
      expect(Status.To.Enum.ARCHIVED).toBe("ARCHIVED")
    })

    it("From.is guards return true for matching value", () => {
      expect(Status.From.is.pending("pending")).toBe(true)
      expect(Status.From.is.active("active")).toBe(true)
      expect(Status.From.is.archived("archived")).toBe(true)
    })

    it("From.is guards return false for non-matching value", () => {
      expect(Status.From.is.pending("active")).toBe(false)
      expect(Status.From.is.pending("PENDING")).toBe(false)
    })

    it("To.is guards return true for matching value", () => {
      expect(Status.To.is.PENDING("PENDING")).toBe(true)
      expect(Status.To.is.ACTIVE("ACTIVE")).toBe(true)
      expect(Status.To.is.ARCHIVED("ARCHIVED")).toBe(true)
    })

    it("To.is guards return false for non-matching value", () => {
      expect(Status.To.is.PENDING("pending")).toBe(false)
      expect(Status.To.is.PENDING("ACTIVE")).toBe(false)
    })

    it("DecodedEnum maps from-key to to-value", () => {
      expect(Status.DecodedEnum.pending).toBe("PENDING")
      expect(Status.DecodedEnum.active).toBe("ACTIVE")
      expect(Status.DecodedEnum.archived).toBe("ARCHIVED")
    })

    it("EncodedEnum maps to-key to from-value", () => {
      expect(Status.EncodedEnum.PENDING).toBe("pending")
      expect(Status.EncodedEnum.ACTIVE).toBe("active")
      expect(Status.EncodedEnum.ARCHIVED).toBe("archived")
    })

    it("decodeMap maps from-value to to-value", () => {
      expect(Status.decodeMap.get("pending")).toBe("PENDING")
      expect(Status.decodeMap.get("active")).toBe("ACTIVE")
      expect(Status.decodeMap.get("archived")).toBe("ARCHIVED")
    })

    it("encodeMap maps to-value to from-value", () => {
      expect(Status.encodeMap.get("PENDING")).toBe("pending")
      expect(Status.encodeMap.get("ACTIVE")).toBe("active")
      expect(Status.encodeMap.get("ARCHIVED")).toBe("archived")
    })

    it("Pairs deep equals the input tuples", () => {
      expect(Status.Pairs).toEqual([
        ["pending", "PENDING"],
        ["active", "ACTIVE"],
        ["archived", "ARCHIVED"],
      ])
    })

    it("schema decodes from-literals to to-literals", () => {
      const decode = S.decodeUnknownSync(Status)
      expect(decode("pending")).toBe("PENDING")
      expect(decode("active")).toBe("ACTIVE")
      expect(decode("archived")).toBe("ARCHIVED")
    })

    it("schema encodes to-literals back to from-literals", () => {
      const encode = S.encodeUnknownSync(Status)
      expect(encode("PENDING")).toBe("pending")
      expect(encode("ACTIVE")).toBe("active")
      expect(encode("ARCHIVED")).toBe("archived")
    })

    it("schema rejects unknown from-value on decode", () => {
      const decode = S.decodeUnknownSync(Status)
      expect(() => decode("UNKNOWN")).toThrow()
      expect(() => decode("PENDING")).toThrow()
      expect(() => decode(42)).toThrow()
      expect(() => decode(null)).toThrow()
    })

    it("schema rejects unknown to-value on encode", () => {
      const encode = S.encodeUnknownSync(Status)
      expect(() => encode("UNKNOWN")).toThrow()
      expect(() => encode("pending")).toThrow()
      expect(() => encode(42)).toThrow()
    })
  })

  describe("string to number mapping", () => {
    it("From.Enum has string identity keys", () => {
      expect(HttpStatus.From.Enum.OK).toBe("OK")
      expect(HttpStatus.From.Enum.CREATED).toBe("CREATED")
      expect(HttpStatus.From.Enum.NOT_FOUND).toBe("NOT_FOUND")
      expect(HttpStatus.From.Enum.INTERNAL_SERVER_ERROR).toBe(
        "INTERNAL_SERVER_ERROR",
      )
    })

    it("To.Enum has n-prefixed keys for numbers", () => {
      expect(HttpStatus.To.Enum.n200).toBe(200)
      expect(HttpStatus.To.Enum.n201).toBe(201)
      expect(HttpStatus.To.Enum.n404).toBe(404)
      expect(HttpStatus.To.Enum.n500).toBe(500)
    })

    it("From.Options includes all string literals", () => {
      expect(HttpStatus.From.Options).toEqual([
        "OK",
        "CREATED",
        "NOT_FOUND",
        "INTERNAL_SERVER_ERROR",
      ])
    })

    it("To.Options includes all number literals", () => {
      expect(HttpStatus.To.Options).toEqual([200, 201, 404, 500])
    })

    it("DecodedEnum maps from-key to number values", () => {
      expect(HttpStatus.DecodedEnum.OK).toBe(200)
      expect(HttpStatus.DecodedEnum.CREATED).toBe(201)
      expect(HttpStatus.DecodedEnum.NOT_FOUND).toBe(404)
      expect(HttpStatus.DecodedEnum.INTERNAL_SERVER_ERROR).toBe(500)
    })

    it("EncodedEnum maps n-prefixed number keys to string values", () => {
      expect(HttpStatus.EncodedEnum.n200).toBe("OK")
      expect(HttpStatus.EncodedEnum.n201).toBe("CREATED")
      expect(HttpStatus.EncodedEnum.n404).toBe("NOT_FOUND")
      expect(HttpStatus.EncodedEnum.n500).toBe("INTERNAL_SERVER_ERROR")
    })

    it("schema decodes string to number", () => {
      const decode = S.decodeUnknownSync(HttpStatus)
      expect(decode("OK")).toBe(200)
      expect(decode("CREATED")).toBe(201)
      expect(decode("NOT_FOUND")).toBe(404)
      expect(decode("INTERNAL_SERVER_ERROR")).toBe(500)
    })

    it("schema encodes number to string", () => {
      const encode = S.encodeUnknownSync(HttpStatus)
      expect(encode(200)).toBe("OK")
      expect(encode(201)).toBe("CREATED")
      expect(encode(404)).toBe("NOT_FOUND")
      expect(encode(500)).toBe("INTERNAL_SERVER_ERROR")
    })

    it("schema rejects invalid from-value on decode", () => {
      const decode = S.decodeUnknownSync(HttpStatus)
      expect(() => decode("UNKNOWN")).toThrow()
      expect(() => decode(200)).toThrow()
    })

    it("schema rejects invalid to-value on encode", () => {
      const encode = S.encodeUnknownSync(HttpStatus)
      expect(() => encode(999)).toThrow()
      expect(() => encode("OK")).toThrow()
    })
  })

  describe("number to string mapping", () => {
    it("DecodedEnum maps n-prefixed number keys to string values", () => {
      expect(ErrorCodes.DecodedEnum.n1001).toBe("INVALID_INPUT")
      expect(ErrorCodes.DecodedEnum.n1002).toBe("NOT_FOUND")
      expect(ErrorCodes.DecodedEnum.n1003).toBe("UNAUTHORIZED")
    })

    it("EncodedEnum maps string keys to number values", () => {
      expect(ErrorCodes.EncodedEnum.INVALID_INPUT).toBe(1001)
      expect(ErrorCodes.EncodedEnum.NOT_FOUND).toBe(1002)
      expect(ErrorCodes.EncodedEnum.UNAUTHORIZED).toBe(1003)
    })

    it("From.Options are numbers, To.Options are strings", () => {
      expect(ErrorCodes.From.Options).toEqual([1001, 1002, 1003])
      expect(ErrorCodes.To.Options).toEqual([
        "INVALID_INPUT",
        "NOT_FOUND",
        "UNAUTHORIZED",
      ])
    })

    it("schema decodes number to string", () => {
      const decode = S.decodeUnknownSync(ErrorCodes)
      expect(decode(1001)).toBe("INVALID_INPUT")
      expect(decode(1002)).toBe("NOT_FOUND")
      expect(decode(1003)).toBe("UNAUTHORIZED")
    })

    it("schema encodes string to number", () => {
      const encode = S.encodeUnknownSync(ErrorCodes)
      expect(encode("INVALID_INPUT")).toBe(1001)
      expect(encode("NOT_FOUND")).toBe(1002)
      expect(encode("UNAUTHORIZED")).toBe(1003)
    })

    it("schema rejects invalid values", () => {
      const decode = S.decodeUnknownSync(ErrorCodes)
      expect(() => decode(9999)).toThrow()
      expect(() => decode("INVALID_INPUT")).toThrow()
    })
  })

  describe("boolean mapping", () => {
    it("DecodedEnum maps boolean keys to string values", () => {
      expect(BoolMapping.DecodedEnum.true).toBe("yes")
      expect(BoolMapping.DecodedEnum.false).toBe("no")
    })

    it("EncodedEnum maps string keys to boolean values", () => {
      expect(BoolMapping.EncodedEnum.yes).toBe(true)
      expect(BoolMapping.EncodedEnum.no).toBe(false)
    })

    it("From.Options are booleans", () => {
      expect(BoolMapping.From.Options).toEqual([true, false])
    })

    it("To.Options are strings", () => {
      expect(BoolMapping.To.Options).toEqual(["yes", "no"])
    })

    it("schema decodes boolean to string", () => {
      const decode = S.decodeUnknownSync(BoolMapping)
      expect(decode(true)).toBe("yes")
      expect(decode(false)).toBe("no")
    })

    it("schema encodes string to boolean", () => {
      const encode = S.encodeUnknownSync(BoolMapping)
      expect(encode("yes")).toBe(true)
      expect(encode("no")).toBe(false)
    })

    it("schema rejects invalid from-value on decode", () => {
      const decode = S.decodeUnknownSync(BoolMapping)
      expect(() => decode("true")).toThrow()
      expect(() => decode(1)).toThrow()
      expect(() => decode(null)).toThrow()
    })

    it("schema rejects invalid to-value on encode", () => {
      const encode = S.encodeUnknownSync(BoolMapping)
      expect(() => encode("maybe")).toThrow()
      expect(() => encode(true)).toThrow()
    })
  })

  describe("bigint mapping", () => {
    it("DecodedEnum uses bigint key format (value + n suffix)", () => {
      expect(BigIntMapping.DecodedEnum["1n"]).toBe("one")
      expect(BigIntMapping.DecodedEnum["2n"]).toBe("two")
    })

    it("EncodedEnum maps string keys to bigint values", () => {
      expect(BigIntMapping.EncodedEnum.one).toBe(1n)
      expect(BigIntMapping.EncodedEnum.two).toBe(2n)
    })

    it("From.Options are bigints", () => {
      expect(BigIntMapping.From.Options).toEqual([1n, 2n])
    })

    it("To.Options are strings", () => {
      expect(BigIntMapping.To.Options).toEqual(["one", "two"])
    })

    it("schema decodes bigint to string", () => {
      const decode = S.decodeUnknownSync(BigIntMapping)
      expect(decode(1n)).toBe("one")
      expect(decode(2n)).toBe("two")
    })

    it("schema encodes string to bigint", () => {
      const encode = S.encodeUnknownSync(BigIntMapping)
      expect(encode("one")).toBe(1n)
      expect(encode("two")).toBe(2n)
    })

    it("schema rejects invalid from-value on decode", () => {
      const decode = S.decodeUnknownSync(BigIntMapping)
      expect(() => decode(3n)).toThrow()
      expect(() => decode(1)).toThrow()
      expect(() => decode("one")).toThrow()
    })

    it("schema rejects invalid to-value on encode", () => {
      const encode = S.encodeUnknownSync(BigIntMapping)
      expect(() => encode("three")).toThrow()
      expect(() => encode(1n)).toThrow()
    })
  })

  describe("single pair", () => {
    it("From.Options has length 1", () => {
      expect(Single.From.Options).toHaveLength(1)
      expect(Single.From.Options).toEqual(["a"])
    })

    it("To.Options has length 1", () => {
      expect(Single.To.Options).toHaveLength(1)
      expect(Single.To.Options).toEqual(["A"])
    })

    it("DecodedEnum maps the single pair", () => {
      expect(Single.DecodedEnum.a).toBe("A")
    })

    it("EncodedEnum maps the single pair in reverse", () => {
      expect(Single.EncodedEnum.A).toBe("a")
    })

    it("schema decodes the single from-value", () => {
      expect(S.decodeUnknownSync(Single)("a")).toBe("A")
    })

    it("schema encodes the single to-value", () => {
      expect(S.encodeUnknownSync(Single)("A")).toBe("a")
    })

    it("schema rejects non-member values", () => {
      expect(() => S.decodeUnknownSync(Single)("b")).toThrow()
      expect(() => S.encodeUnknownSync(Single)("B")).toThrow()
    })

    it("Pairs deep equals the single input tuple", () => {
      expect(Single.Pairs).toEqual([["a", "A"]])
    })
  })

  describe("number to number mapping", () => {
    it("DecodedEnum maps n-prefixed from-keys to to-values", () => {
      expect(NumMapping.DecodedEnum.n1).toBe(100)
      expect(NumMapping.DecodedEnum.n2).toBe(200)
    })

    it("EncodedEnum maps n-prefixed to-keys to from-values", () => {
      expect(NumMapping.EncodedEnum.n100).toBe(1)
      expect(NumMapping.EncodedEnum.n200).toBe(2)
    })

    it("From.Options and To.Options are numbers", () => {
      expect(NumMapping.From.Options).toEqual([1, 2])
      expect(NumMapping.To.Options).toEqual([100, 200])
    })

    it("schema decodes from-number to to-number", () => {
      const decode = S.decodeUnknownSync(NumMapping)
      expect(decode(1)).toBe(100)
      expect(decode(2)).toBe(200)
    })

    it("schema encodes to-number to from-number", () => {
      const encode = S.encodeUnknownSync(NumMapping)
      expect(encode(100)).toBe(1)
      expect(encode(200)).toBe(2)
    })

    it("schema rejects invalid values", () => {
      const decode = S.decodeUnknownSync(NumMapping)
      expect(() => decode(3)).toThrow()
      expect(() => decode(100)).toThrow()
    })
  })

  describe("type safety", () => {
    it("DecodedEnum values have correct literal types", () => {
      const _ok: 200 = HttpStatus.DecodedEnum.OK
      const _created: 201 = HttpStatus.DecodedEnum.CREATED
      const _notFound: 404 = HttpStatus.DecodedEnum.NOT_FOUND
      const _pending: "PENDING" = Status.DecodedEnum.pending
      const _active: "ACTIVE" = Status.DecodedEnum.active
      const _yes: "yes" = BoolMapping.DecodedEnum.true
      const _no: "no" = BoolMapping.DecodedEnum.false
      const _one: "one" = BigIntMapping.DecodedEnum["1n"]

      expect(_ok).toBe(200)
      expect(_created).toBe(201)
      expect(_notFound).toBe(404)
      expect(_pending).toBe("PENDING")
      expect(_active).toBe("ACTIVE")
      expect(_yes).toBe("yes")
      expect(_no).toBe("no")
      expect(_one).toBe("one")
    })

    it("EncodedEnum values have correct literal types", () => {
      const _ok: "OK" = HttpStatus.EncodedEnum.n200
      const _pending: "pending" = Status.EncodedEnum.PENDING
      const _yes: true = BoolMapping.EncodedEnum.yes
      const _no: false = BoolMapping.EncodedEnum.no
      const _one: 1n = BigIntMapping.EncodedEnum.one

      expect(_ok).toBe("OK")
      expect(_pending).toBe("pending")
      expect(_yes).toBe(true)
      expect(_no).toBe(false)
      expect(_one).toBe(1n)
    })
  })

  describe("edge cases", () => {
    it("negative numbers use n-prefix key in DecodedEnum", () => {
      const NegMapping = MappedLiteralKit([-1, "negative"])
      expect(NegMapping.DecodedEnum["n-1"]).toBe("negative")
      expect(NegMapping.EncodedEnum.negative).toBe(-1)
      expect(S.decodeUnknownSync(NegMapping)(-1)).toBe("negative")
      expect(S.encodeUnknownSync(NegMapping)("negative")).toBe(-1)
    })

    it("float numbers use n-prefix key in DecodedEnum", () => {
      const FloatMapping = MappedLiteralKit([0.5, "half"])
      expect(FloatMapping.DecodedEnum["n0.5"]).toBe("half")
      expect(FloatMapping.EncodedEnum.half).toBe(0.5)
      expect(S.decodeUnknownSync(FloatMapping)(0.5)).toBe("half")
      expect(S.encodeUnknownSync(FloatMapping)("half")).toBe(0.5)
    })

    it("empty string as from-value", () => {
      const EmptyMapping = MappedLiteralKit(["", "empty"])
      expect(EmptyMapping.DecodedEnum[""]).toBe("empty")
      expect(EmptyMapping.EncodedEnum.empty).toBe("")
      expect(S.decodeUnknownSync(EmptyMapping)("")).toBe("empty")
      expect(S.encodeUnknownSync(EmptyMapping)("empty")).toBe("")
    })

    it("decodeMap returns undefined for unknown keys", () => {
      const map: ReadonlyMap<string, unknown> = Status.decodeMap
      expect(map.get("UNKNOWN")).toBeUndefined()
    })

    it("encodeMap returns undefined for unknown keys", () => {
      const map: ReadonlyMap<string, unknown> = Status.encodeMap
      expect(map.get("unknown")).toBeUndefined()
    })

    it("decodeMap and encodeMap have correct sizes", () => {
      expect(Status.decodeMap.size).toBe(3)
      expect(Status.encodeMap.size).toBe(3)
      expect(HttpStatus.decodeMap.size).toBe(4)
      expect(HttpStatus.encodeMap.size).toBe(4)
      expect(Single.decodeMap.size).toBe(1)
      expect(Single.encodeMap.size).toBe(1)
    })

    it("separate mappings are independent", () => {
      expect(Status.From.Options).not.toEqual(HttpStatus.From.Options)
      expect(Status.DecodedEnum).not.toEqual(HttpStatus.DecodedEnum)
    })

    it("From and To LiteralKits have working is guards", () => {
      expect(HttpStatus.From.is.OK("OK")).toBe(true)
      expect(HttpStatus.From.is.OK("CREATED")).toBe(false)
      expect(HttpStatus.To.is.n200(200)).toBe(true)
      expect(HttpStatus.To.is.n200(201)).toBe(false)
    })
  })
})
