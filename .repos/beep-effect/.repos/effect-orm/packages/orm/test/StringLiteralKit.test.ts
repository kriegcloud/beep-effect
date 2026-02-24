import * as S from "effect/Schema"
import { describe, expect, it } from "vitest"
import { StringLiteralKit } from "../src/utils/StringLiteralKit.js"

const Status = StringLiteralKit("pending", "active", "completed")
const Binary = StringLiteralKit("yes", "no")
const Single = StringLiteralKit("only")
const Many = StringLiteralKit("a", "b", "c", "d", "e", "f")

describe("StringLiteralKit", () => {
  describe("construction", () => {
    it("creates from three literals", () => {
      expect(Status).toBeDefined()
    })

    it("creates from two literals", () => {
      expect(Binary).toBeDefined()
    })

    it("creates from a single literal", () => {
      expect(Single).toBeDefined()
    })

    it("creates from many literals", () => {
      expect(Many).toBeDefined()
    })
  })

  describe("Options", () => {
    it("exposes the exact tuple of literals", () => {
      expect(Status.Options).toEqual(["pending", "active", "completed"])
    })

    it("preserves insertion order", () => {
      expect(Status.Options[0]).toBe("pending")
      expect(Status.Options[1]).toBe("active")
      expect(Status.Options[2]).toBe("completed")
    })

    it("works for single literal", () => {
      expect(Single.Options).toEqual(["only"])
    })

    it("works for many literals", () => {
      expect(Many.Options).toEqual(["a", "b", "c", "d", "e", "f"])
    })
  })

  describe("Enum", () => {
    it("maps each literal to itself", () => {
      expect(Status.Enum.pending).toBe("pending")
      expect(Status.Enum.active).toBe("active")
      expect(Status.Enum.completed).toBe("completed")
    })

    it("has identity mapping (key === value)", () => {
      for (const lit of Status.Options) {
        expect(Status.Enum[lit as keyof typeof Status.Enum]).toBe(lit)
      }
    })

    it("works for single literal", () => {
      expect(Single.Enum.only).toBe("only")
    })

    it("works for binary literals", () => {
      expect(Binary.Enum.yes).toBe("yes")
      expect(Binary.Enum.no).toBe("no")
    })
  })

  describe("is (type guards)", () => {
    it("returns true for matching literal", () => {
      expect(Status.is.pending("pending")).toBe(true)
      expect(Status.is.active("active")).toBe(true)
      expect(Status.is.completed("completed")).toBe(true)
    })

    it("returns false for non-matching literal", () => {
      expect(Status.is.pending("active")).toBe(false)
      expect(Status.is.active("completed")).toBe(false)
      expect(Status.is.completed("pending")).toBe(false)
    })

    it("returns false for unknown strings", () => {
      expect(Status.is.pending("unknown")).toBe(false)
      expect(Status.is.active("")).toBe(false)
    })

    it("returns false for non-string values", () => {
      expect(Status.is.pending(42)).toBe(false)
      expect(Status.is.pending(null)).toBe(false)
      expect(Status.is.pending(undefined)).toBe(false)
      expect(Status.is.pending(true)).toBe(false)
      expect(Status.is.pending({})).toBe(false)
      expect(Status.is.pending([])).toBe(false)
    })

    it("each literal has its own guard", () => {
      for (const lit of Status.Options) {
        const guard = Status.is[lit as keyof typeof Status.is]
        expect(guard(lit)).toBe(true)
        for (const other of Status.Options) {
          if (other !== lit) {
            expect(guard(other)).toBe(false)
          }
        }
      }
    })

    it("works for single literal", () => {
      expect(Single.is.only("only")).toBe(true)
      expect(Single.is.only("other")).toBe(false)
    })
  })

  describe("Schema decoding", () => {
    const decode = S.decodeUnknownSync(Status)

    it("decodes valid string literals", () => {
      expect(decode("pending")).toBe("pending")
      expect(decode("active")).toBe("active")
      expect(decode("completed")).toBe("completed")
    })

    it("rejects invalid strings", () => {
      expect(() => decode("unknown")).toThrow()
      expect(() => decode("")).toThrow()
      expect(() => decode("PENDING")).toThrow()
    })

    it("rejects non-string values", () => {
      expect(() => decode(42)).toThrow()
      expect(() => decode(true)).toThrow()
      expect(() => decode(null)).toThrow()
      expect(() => decode(undefined)).toThrow()
      expect(() => decode({})).toThrow()
      expect(() => decode([])).toThrow()
    })

    it("decodes single literal kit", () => {
      const decodeSingle = S.decodeUnknownSync(Single)
      expect(decodeSingle("only")).toBe("only")
      expect(() => decodeSingle("other")).toThrow()
    })

    it("decodes binary literal kit", () => {
      const decodeBinary = S.decodeUnknownSync(Binary)
      expect(decodeBinary("yes")).toBe("yes")
      expect(decodeBinary("no")).toBe("no")
      expect(() => decodeBinary("maybe")).toThrow()
    })
  })

  describe("pickOptions", () => {
    it("returns the selected subset", () => {
      expect(Status.pickOptions("pending", "active")).toEqual([
        "pending",
        "active",
      ])
    })

    it("returns a single pick", () => {
      expect(Status.pickOptions("completed")).toEqual(["completed"])
    })

    it("preserves argument order", () => {
      expect(Status.pickOptions("completed", "pending")).toEqual([
        "completed",
        "pending",
      ])
    })

    it("works for all options", () => {
      expect(Status.pickOptions("pending", "active", "completed")).toEqual([
        "pending",
        "active",
        "completed",
      ])
    })
  })

  describe("omitOptions", () => {
    it("excludes specified literals", () => {
      expect(Status.omitOptions("completed")).toEqual(["pending", "active"])
    })

    it("excludes multiple literals", () => {
      expect(Status.omitOptions("pending", "completed")).toEqual(["active"])
    })

    it("preserves order of original literals", () => {
      const result = Status.omitOptions("active")
      expect(result).toEqual(["pending", "completed"])
      expect(result[0]).toBe("pending")
      expect(result[1]).toBe("completed")
    })

    it("returns empty when all are omitted", () => {
      expect(Status.omitOptions("pending", "active", "completed")).toEqual([])
    })

    it("returns all when none are omitted", () => {
      expect(Binary.omitOptions()).toEqual(["yes", "no"])
    })
  })

  describe("Literals interop", () => {
    it("exposes literals from the underlying schema", () => {
      expect(Status.literals).toEqual(["pending", "active", "completed"])
    })

    it("exposes members from the underlying schema", () => {
      expect(Status.members).toHaveLength(3)
    })

    it("pick creates a narrowed Literals schema", () => {
      const picked = Status.pick(["pending", "active"])
      const decode = S.decodeUnknownSync(picked)
      expect(decode("pending")).toBe("pending")
      expect(decode("active")).toBe("active")
      expect(() => decode("completed")).toThrow()
    })

    it("pick on single literal kit", () => {
      const picked = Single.pick(["only"])
      const decode = S.decodeUnknownSync(picked)
      expect(decode("only")).toBe("only")
    })
  })

  describe("edge cases", () => {
    it("single literal kit has all properties", () => {
      expect(Single.Options).toEqual(["only"])
      expect(Single.Enum.only).toBe("only")
      expect(Single.is.only("only")).toBe(true)
      expect(Single.pickOptions("only")).toEqual(["only"])
      expect(Single.omitOptions("only")).toEqual([])
    })

    it("many literals kit has all properties", () => {
      expect(Many.Options).toHaveLength(6)
      expect(Many.Enum.a).toBe("a")
      expect(Many.Enum.f).toBe("f")
      expect(Many.is.a("a")).toBe(true)
      expect(Many.is.f("f")).toBe(true)
      expect(Many.is.a("f")).toBe(false)
      expect(Many.pickOptions("a", "c", "e")).toEqual(["a", "c", "e"])
      expect(Many.omitOptions("b", "d", "f")).toEqual(["a", "c", "e"])
    })

    it("separate kits are independent", () => {
      expect(Status.Options).not.toEqual(Binary.Options)
      expect(Status.Enum).not.toEqual(Binary.Enum)
    })
  })
})
