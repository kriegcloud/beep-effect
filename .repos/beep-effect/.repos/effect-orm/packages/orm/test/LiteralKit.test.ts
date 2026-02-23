import * as S from "effect/Schema"
import { describe, expect, it } from "vitest"
import { LiteralKit } from "../src/utils/LiteralKit.js"

const HttpStatus = LiteralKit(200, 201, 400, 404, 500)
const Status = LiteralKit("pending", "active", "archived")
const Toggle = LiteralKit(true, false)
const BigNums = LiteralKit(1n, 2n, 3n)
const Single = LiteralKit(42)
const Mixed = LiteralKit("hello", 42, true, 1n)
const Many = LiteralKit(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11)

describe("LiteralKit", () => {
  describe("number literals", () => {
    it("Options is the exact tuple", () => {
      expect(HttpStatus.Options).toEqual([200, 201, 400, 404, 500])
    })

    it("preserves insertion order", () => {
      expect(HttpStatus.Options[0]).toBe(200)
      expect(HttpStatus.Options[4]).toBe(500)
    })

    it("Enum has n-prefixed keys mapping to values", () => {
      expect(HttpStatus.Enum.n200).toBe(200)
      expect(HttpStatus.Enum.n201).toBe(201)
      expect(HttpStatus.Enum.n400).toBe(400)
      expect(HttpStatus.Enum.n404).toBe(404)
      expect(HttpStatus.Enum.n500).toBe(500)
    })

    it("is guards return true for matching value", () => {
      expect(HttpStatus.is.n200(200)).toBe(true)
      expect(HttpStatus.is.n404(404)).toBe(true)
      expect(HttpStatus.is.n500(500)).toBe(true)
    })

    it("is guards return false for non-matching literal", () => {
      expect(HttpStatus.is.n200(201)).toBe(false)
      expect(HttpStatus.is.n404(200)).toBe(false)
    })

    it("is guards return false for wrong type", () => {
      expect(HttpStatus.is.n200("200")).toBe(false)
      expect(HttpStatus.is.n404(null)).toBe(false)
      expect(HttpStatus.is.n200(undefined)).toBe(false)
      expect(HttpStatus.is.n200(true)).toBe(false)
    })

    it("schema decodes valid numbers", () => {
      const decode = S.decodeUnknownSync(HttpStatus)
      expect(decode(200)).toBe(200)
      expect(decode(201)).toBe(201)
      expect(decode(404)).toBe(404)
      expect(decode(500)).toBe(500)
    })

    it("schema rejects invalid numbers", () => {
      const decode = S.decodeUnknownSync(HttpStatus)
      expect(() => decode(999)).toThrow()
      expect(() => decode(0)).toThrow()
    })

    it("schema rejects non-number values", () => {
      const decode = S.decodeUnknownSync(HttpStatus)
      expect(() => decode("200")).toThrow()
      expect(() => decode(true)).toThrow()
      expect(() => decode(null)).toThrow()
      expect(() => decode(undefined)).toThrow()
    })

    it("pickOptions returns the requested subset", () => {
      expect(HttpStatus.pickOptions(200, 201)).toEqual([200, 201])
    })

    it("pickOptions preserves argument order", () => {
      expect(HttpStatus.pickOptions(500, 200)).toEqual([500, 200])
    })

    it("pickOptions with single value", () => {
      expect(HttpStatus.pickOptions(404)).toEqual([404])
    })

    it("omitOptions excludes specified literals", () => {
      expect(HttpStatus.omitOptions(200, 201)).toEqual([400, 404, 500])
    })

    it("omitOptions preserves original order", () => {
      const result = HttpStatus.omitOptions(201, 500)
      expect(result).toEqual([200, 400, 404])
    })

    it("omitOptions with all values returns empty", () => {
      expect(HttpStatus.omitOptions(200, 201, 400, 404, 500)).toEqual([])
    })

    it("omitOptions with no values returns all", () => {
      expect(HttpStatus.omitOptions()).toEqual([200, 201, 400, 404, 500])
    })

    it("derive creates a new LiteralKit with subset", () => {
      const Success = HttpStatus.derive(200, 201)
      expect(Success.Options).toEqual([200, 201])
      expect(Success.Enum.n200).toBe(200)
      expect(Success.Enum.n201).toBe(201)
      expect(Success.is.n200(200)).toBe(true)
      expect(Success.is.n201(201)).toBe(true)
    })

    it("derived kit schema accepts its own values", () => {
      const Success = HttpStatus.derive(200, 201)
      const decode = S.decodeUnknownSync(Success)
      expect(decode(200)).toBe(200)
      expect(decode(201)).toBe(201)
    })

    it("derived kit schema rejects values from parent", () => {
      const Success = HttpStatus.derive(200, 201)
      const decode = S.decodeUnknownSync(Success)
      expect(() => decode(404)).toThrow()
      expect(() => decode(500)).toThrow()
    })
  })

  describe("string literals", () => {
    it("Options is the exact tuple", () => {
      expect(Status.Options).toEqual(["pending", "active", "archived"])
    })

    it("Enum keys are identity (key === value)", () => {
      expect(Status.Enum.pending).toBe("pending")
      expect(Status.Enum.active).toBe("active")
      expect(Status.Enum.archived).toBe("archived")
    })

    it("is guards return true for matching value", () => {
      expect(Status.is.pending("pending")).toBe(true)
      expect(Status.is.active("active")).toBe(true)
      expect(Status.is.archived("archived")).toBe(true)
    })

    it("is guards return false for non-matching literal", () => {
      expect(Status.is.pending("active")).toBe(false)
      expect(Status.is.active("archived")).toBe(false)
    })

    it("is guards return false for unknown strings", () => {
      expect(Status.is.pending("unknown")).toBe(false)
      expect(Status.is.pending("")).toBe(false)
    })

    it("is guards return false for non-string values", () => {
      expect(Status.is.pending(42)).toBe(false)
      expect(Status.is.pending(null)).toBe(false)
      expect(Status.is.pending(undefined)).toBe(false)
      expect(Status.is.pending(true)).toBe(false)
    })

    it("schema decodes valid strings", () => {
      const decode = S.decodeUnknownSync(Status)
      expect(decode("pending")).toBe("pending")
      expect(decode("active")).toBe("active")
      expect(decode("archived")).toBe("archived")
    })

    it("schema rejects invalid strings", () => {
      const decode = S.decodeUnknownSync(Status)
      expect(() => decode("unknown")).toThrow()
      expect(() => decode("")).toThrow()
      expect(() => decode("PENDING")).toThrow()
    })

    it("schema rejects non-string values", () => {
      const decode = S.decodeUnknownSync(Status)
      expect(() => decode(42)).toThrow()
      expect(() => decode(true)).toThrow()
      expect(() => decode(null)).toThrow()
    })

    it("pickOptions returns the requested subset", () => {
      expect(Status.pickOptions("pending", "active")).toEqual([
        "pending",
        "active",
      ])
    })

    it("omitOptions excludes specified literals", () => {
      expect(Status.omitOptions("archived")).toEqual(["pending", "active"])
    })

    it("derive creates a new LiteralKit", () => {
      const Active = Status.derive("pending", "active")
      expect(Active.Options).toEqual(["pending", "active"])
      expect(Active.Enum.pending).toBe("pending")
      expect(Active.is.active("active")).toBe(true)
      const decode = S.decodeUnknownSync(Active)
      expect(decode("pending")).toBe("pending")
      expect(() => decode("archived")).toThrow()
    })
  })

  describe("boolean literals", () => {
    it("Options is [true, false]", () => {
      expect(Toggle.Options).toEqual([true, false])
    })

    it("Enum has 'true' and 'false' string keys", () => {
      expect(Toggle.Enum.true).toBe(true)
      expect(Toggle.Enum.false).toBe(false)
    })

    it("is.true returns true for true", () => {
      expect(Toggle.is.true(true)).toBe(true)
    })

    it("is.true returns false for false", () => {
      expect(Toggle.is.true(false)).toBe(false)
    })

    it("is.false returns true for false", () => {
      expect(Toggle.is.false(false)).toBe(true)
    })

    it("is.false returns false for true", () => {
      expect(Toggle.is.false(true)).toBe(false)
    })

    it("is guards reject non-boolean values", () => {
      expect(Toggle.is.true("true")).toBe(false)
      expect(Toggle.is.false("false")).toBe(false)
      expect(Toggle.is.true(1)).toBe(false)
      expect(Toggle.is.false(0)).toBe(false)
      expect(Toggle.is.true(null)).toBe(false)
    })

    it("schema decodes valid booleans", () => {
      const decode = S.decodeUnknownSync(Toggle)
      expect(decode(true)).toBe(true)
      expect(decode(false)).toBe(false)
    })

    it("schema rejects non-boolean values", () => {
      const decode = S.decodeUnknownSync(Toggle)
      expect(() => decode("true")).toThrow()
      expect(() => decode("false")).toThrow()
      expect(() => decode(1)).toThrow()
      expect(() => decode(0)).toThrow()
      expect(() => decode(null)).toThrow()
    })

    it("pickOptions works with booleans", () => {
      expect(Toggle.pickOptions(true)).toEqual([true])
    })

    it("omitOptions works with booleans", () => {
      expect(Toggle.omitOptions(true)).toEqual([false])
    })

    it("derive works with booleans", () => {
      const TrueOnly = Toggle.derive(true)
      expect(TrueOnly.Options).toEqual([true])
      expect(TrueOnly.Enum.true).toBe(true)
      expect(TrueOnly.is.true(true)).toBe(true)
      const decode = S.decodeUnknownSync(TrueOnly)
      expect(decode(true)).toBe(true)
      expect(() => decode(false)).toThrow()
    })
  })

  describe("bigint literals", () => {
    it("Options is [1n, 2n, 3n]", () => {
      expect(BigNums.Options).toEqual([1n, 2n, 3n])
    })

    it("Enum has suffixed-n keys", () => {
      expect(BigNums.Enum["1n"]).toBe(1n)
      expect(BigNums.Enum["2n"]).toBe(2n)
      expect(BigNums.Enum["3n"]).toBe(3n)
    })

    it("is guards return true for matching bigint", () => {
      expect(BigNums.is["1n"](1n)).toBe(true)
      expect(BigNums.is["2n"](2n)).toBe(true)
      expect(BigNums.is["3n"](3n)).toBe(true)
    })

    it("is guards return false for non-matching bigint", () => {
      expect(BigNums.is["1n"](2n)).toBe(false)
      expect(BigNums.is["2n"](3n)).toBe(false)
    })

    it("is guards return false for number equivalents", () => {
      expect(BigNums.is["1n"](1)).toBe(false)
      expect(BigNums.is["2n"](2)).toBe(false)
    })

    it("is guards return false for non-bigint values", () => {
      expect(BigNums.is["1n"]("1n")).toBe(false)
      expect(BigNums.is["1n"](null)).toBe(false)
      expect(BigNums.is["1n"](undefined)).toBe(false)
    })

    it("schema decodes valid bigints", () => {
      const decode = S.decodeUnknownSync(BigNums)
      expect(decode(1n)).toBe(1n)
      expect(decode(2n)).toBe(2n)
      expect(decode(3n)).toBe(3n)
    })

    it("schema rejects invalid bigints", () => {
      const decode = S.decodeUnknownSync(BigNums)
      expect(() => decode(4n)).toThrow()
      expect(() => decode(0n)).toThrow()
    })

    it("schema rejects non-bigint values", () => {
      const decode = S.decodeUnknownSync(BigNums)
      expect(() => decode(1)).toThrow()
      expect(() => decode("1n")).toThrow()
    })

    it("pickOptions works with bigints", () => {
      expect(BigNums.pickOptions(1n, 3n)).toEqual([1n, 3n])
    })

    it("omitOptions works with bigints", () => {
      expect(BigNums.omitOptions(2n)).toEqual([1n, 3n])
    })

    it("derive works with bigints", () => {
      const Small = BigNums.derive(1n, 2n)
      expect(Small.Options).toEqual([1n, 2n])
      expect(Small.Enum["1n"]).toBe(1n)
      expect(Small.is["2n"](2n)).toBe(true)
      const decode = S.decodeUnknownSync(Small)
      expect(decode(1n)).toBe(1n)
      expect(() => decode(3n)).toThrow()
    })
  })

  describe("single literal", () => {
    it("Options is [42]", () => {
      expect(Single.Options).toEqual([42])
    })

    it("Enum.n42 === 42", () => {
      expect(Single.Enum.n42).toBe(42)
    })

    it("is.n42 works correctly", () => {
      expect(Single.is.n42(42)).toBe(true)
      expect(Single.is.n42(0)).toBe(false)
      expect(Single.is.n42("42")).toBe(false)
    })

    it("schema decodes the single value", () => {
      const decode = S.decodeUnknownSync(Single)
      expect(decode(42)).toBe(42)
    })

    it("schema rejects anything else", () => {
      const decode = S.decodeUnknownSync(Single)
      expect(() => decode(43)).toThrow()
      expect(() => decode("42")).toThrow()
    })

    it("pickOptions with the single value", () => {
      expect(Single.pickOptions(42)).toEqual([42])
    })

    it("omitOptions with the single value returns empty", () => {
      expect(Single.omitOptions(42)).toEqual([])
    })

    it("omitOptions with nothing returns all", () => {
      expect(Single.omitOptions()).toEqual([42])
    })

    it("derive with the single value", () => {
      const Derived = Single.derive(42)
      expect(Derived.Options).toEqual([42])
      expect(Derived.Enum.n42).toBe(42)
      expect(Derived.is.n42(42)).toBe(true)
    })
  })

  describe("mixed type literals", () => {
    it("Options contains all mixed values", () => {
      expect(Mixed.Options).toEqual(["hello", 42, true, 1n])
    })

    it("Enum uses correct key mapping for each type", () => {
      expect(Mixed.Enum.hello).toBe("hello")
      expect(Mixed.Enum.n42).toBe(42)
      expect(Mixed.Enum.true).toBe(true)
      expect(Mixed.Enum["1n"]).toBe(1n)
    })

    it("is guards use correct key mapping for each type", () => {
      expect(Mixed.is.hello("hello")).toBe(true)
      expect(Mixed.is.n42(42)).toBe(true)
      expect(Mixed.is.true(true)).toBe(true)
      expect(Mixed.is["1n"](1n)).toBe(true)
    })

    it("is guards do not cross-match types", () => {
      expect(Mixed.is.hello(42)).toBe(false)
      expect(Mixed.is.n42("hello")).toBe(false)
      expect(Mixed.is.true(1)).toBe(false)
      expect(Mixed.is["1n"](1)).toBe(false)
    })

    it("schema decodes all mixed types", () => {
      const decode = S.decodeUnknownSync(Mixed)
      expect(decode("hello")).toBe("hello")
      expect(decode(42)).toBe(42)
      expect(decode(true)).toBe(true)
      expect(decode(1n)).toBe(1n)
    })

    it("schema rejects values not in the set", () => {
      const decode = S.decodeUnknownSync(Mixed)
      expect(() => decode("world")).toThrow()
      expect(() => decode(43)).toThrow()
      expect(() => decode(false)).toThrow()
      expect(() => decode(2n)).toThrow()
    })

    it("pickOptions works across types", () => {
      expect(Mixed.pickOptions("hello", 42)).toEqual(["hello", 42])
    })

    it("omitOptions works across types", () => {
      expect(Mixed.omitOptions("hello", true)).toEqual([42, 1n])
    })

    it("derive works with mixed subset", () => {
      const Sub = Mixed.derive("hello", 1n)
      expect(Sub.Options).toEqual(["hello", 1n])
      expect(Sub.Enum.hello).toBe("hello")
      expect(Sub.Enum["1n"]).toBe(1n)
      expect(Sub.is.hello("hello")).toBe(true)
      expect(Sub.is["1n"](1n)).toBe(true)
      const decode = S.decodeUnknownSync(Sub)
      expect(decode("hello")).toBe("hello")
      expect(decode(1n)).toBe(1n)
      expect(() => decode(42)).toThrow()
      expect(() => decode(true)).toThrow()
    })
  })

  describe("derive chain", () => {
    const Full = LiteralKit(200, 201, 400, 404, 500)

    it("first derive produces correct kit", () => {
      const Success = Full.derive(200, 201)
      expect(Success.Options).toEqual([200, 201])
      expect(Success.Enum.n200).toBe(200)
      expect(Success.Enum.n201).toBe(201)
    })

    it("second derive from derived kit works", () => {
      const Success = Full.derive(200, 201)
      const Ok = Success.derive(200)
      expect(Ok.Options).toEqual([200])
      expect(Ok.Enum.n200).toBe(200)
      expect(Ok.is.n200(200)).toBe(true)
    })

    it("derived kit schema narrows at each level", () => {
      const Success = Full.derive(200, 201)
      const Ok = Success.derive(200)

      const decodeFull = S.decodeUnknownSync(Full)
      const decodeSuccess = S.decodeUnknownSync(Success)
      const decodeOk = S.decodeUnknownSync(Ok)

      expect(decodeFull(404)).toBe(404)
      expect(() => decodeSuccess(404)).toThrow()
      expect(() => decodeOk(201)).toThrow()
      expect(decodeOk(200)).toBe(200)
    })

    it("derived kits have independent Enum and is", () => {
      const Success = Full.derive(200, 201)
      const Errors = Full.derive(400, 404, 500)

      expect(Success.Enum.n200).toBe(200)
      expect(Errors.Enum.n400).toBe(400)
      expect(Success.is.n200(200)).toBe(true)
      expect(Errors.is.n500(500)).toBe(true)
    })

    it("derived kit has its own pickOptions and omitOptions", () => {
      const Success = Full.derive(200, 201, 400)
      expect(Success.pickOptions(200, 400)).toEqual([200, 400])
      expect(Success.omitOptions(400)).toEqual([200, 201])
    })
  })

  describe("Literals interop", () => {
    it("literals property matches Options", () => {
      expect(HttpStatus.literals).toEqual(HttpStatus.Options)
    })

    it("members has correct length", () => {
      expect(HttpStatus.members).toHaveLength(5)
    })

    it("members has correct length for string kit", () => {
      expect(Status.members).toHaveLength(3)
    })

    it("members has correct length for boolean kit", () => {
      expect(Toggle.members).toHaveLength(2)
    })

    it("pick creates a narrowed Literals schema that decodes correctly", () => {
      const picked = HttpStatus.pick([200, 201])
      const decode = S.decodeUnknownSync(picked)
      expect(decode(200)).toBe(200)
      expect(decode(201)).toBe(201)
      expect(() => decode(404)).toThrow()
    })

    it("pick on string kit", () => {
      const picked = Status.pick(["pending", "active"])
      const decode = S.decodeUnknownSync(picked)
      expect(decode("pending")).toBe("pending")
      expect(decode("active")).toBe("active")
      expect(() => decode("archived")).toThrow()
    })

    it("pick on single literal kit", () => {
      const picked = Single.pick([42])
      const decode = S.decodeUnknownSync(picked)
      expect(decode(42)).toBe(42)
    })
  })

  describe("edge cases", () => {
    it("separate kits are independent", () => {
      expect(HttpStatus.Options).not.toEqual(Status.Options)
      expect(HttpStatus.Enum).not.toEqual(Status.Enum)
    })

    it("kit with many literals has all properties", () => {
      expect(Many.Options).toHaveLength(12)
      expect(Many.Enum.n0).toBe(0)
      expect(Many.Enum.n11).toBe(11)
      expect(Many.is.n0(0)).toBe(true)
      expect(Many.is.n11(11)).toBe(true)
      expect(Many.is.n0(11)).toBe(false)
    })

    it("kit with many literals decodes all values", () => {
      const decode = S.decodeUnknownSync(Many)
      for (let i = 0; i <= 11; i++) {
        expect(decode(i)).toBe(i)
      }
      expect(() => decode(12)).toThrow()
      expect(() => decode(-1)).toThrow()
    })

    it("kit with many literals pickOptions and omitOptions", () => {
      expect(Many.pickOptions(0, 5, 10)).toEqual([0, 5, 10])
      expect(Many.omitOptions(0, 1, 2, 3, 4, 5, 6, 7, 8, 9)).toEqual([10, 11])
    })

    it("zero is a valid number literal", () => {
      const WithZero = LiteralKit(0, 1)
      expect(WithZero.Options).toEqual([0, 1])
      expect(WithZero.Enum.n0).toBe(0)
      expect(WithZero.is.n0(0)).toBe(true)
      expect(WithZero.is.n0(false)).toBe(false)
      expect(S.decodeUnknownSync(WithZero)(0)).toBe(0)
    })

    it("negative numbers use correct key mapping", () => {
      const Neg = LiteralKit(-1, 0, 1)
      expect(Neg.Enum["n-1"]).toBe(-1)
      expect(Neg.Enum.n0).toBe(0)
      expect(Neg.Enum.n1).toBe(1)
      expect(Neg.is["n-1"](-1)).toBe(true)
      expect(Neg.is["n-1"](1)).toBe(false)
    })

    it("bigint zero uses correct key mapping", () => {
      const BigZero = LiteralKit(0n, 1n)
      expect(BigZero.Enum["0n"]).toBe(0n)
      expect(BigZero.Enum["1n"]).toBe(1n)
      expect(BigZero.is["0n"](0n)).toBe(true)
      expect(BigZero.is["0n"](0)).toBe(false)
    })

    it("each guard is unique per literal value", () => {
      for (const lit of HttpStatus.Options) {
        const key = typeof lit === "number" ? `n${lit}` : String(lit)
        const guard = (
          HttpStatus.is as Record<string, (i: unknown) => boolean>
        )[key]
        expect(guard(lit)).toBe(true)
        for (const other of HttpStatus.Options) {
          if (other !== lit) {
            expect(guard(other)).toBe(false)
          }
        }
      }
    })
  })
})
