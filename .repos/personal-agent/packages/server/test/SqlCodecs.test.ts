import { describe, expect, it } from "@effect/vitest"
import { DateTime, Schema } from "effect"
import fc from "fast-check"
import { sqlCursor, sqlInstant, sqlInstantNullable, sqlJsonColumn } from "../src/persistence/SqlCodecs.js"

describe("sqlInstant", () => {
  it("decode parses ISO string to DateTime.Utc", () => {
    const result = sqlInstant.decode("2026-01-15T10:30:00.000Z")
    expect(DateTime.formatIso(result)).toBe("2026-01-15T10:30:00.000Z")
  })

  it("encode formats DateTime.Utc to ISO string", () => {
    const instant = DateTime.fromDateUnsafe(new Date("2026-01-15T10:30:00.000Z"))
    const result = sqlInstant.encode(instant)
    expect(result).toBe("2026-01-15T10:30:00.000Z")
  })

  it("round-trips: encode(decode(s)) === s for valid ISO strings", () => {
    const iso = "2026-06-15T08:00:00.000Z"
    expect(sqlInstant.encode(sqlInstant.decode(iso))).toBe(iso)
  })

  it("decode throws on invalid input", () => {
    expect(() => sqlInstant.decode("not-a-date")).toThrow()
  })
})

describe("sqlInstantNullable", () => {
  it("decode returns null for null input", () => {
    expect(sqlInstantNullable.decode(null)).toBeNull()
  })

  it("encode returns null for null input", () => {
    expect(sqlInstantNullable.encode(null)).toBeNull()
  })

  it("decode parses non-null string", () => {
    const result = sqlInstantNullable.decode("2026-01-15T10:30:00.000Z")
    expect(result).not.toBeNull()
    expect(DateTime.formatIso(result!)).toBe("2026-01-15T10:30:00.000Z")
  })

  it("encode formats non-null DateTime", () => {
    const instant = DateTime.fromDateUnsafe(new Date("2026-01-15T10:30:00.000Z"))
    expect(sqlInstantNullable.encode(instant)).toBe("2026-01-15T10:30:00.000Z")
  })
})

describe("sqlJsonColumn", () => {
  const Tags = sqlJsonColumn(Schema.Array(Schema.String))

  it("decode parses JSON string to typed array", () => {
    const result = Tags.decode('["a","b","c"]')
    expect(result).toEqual(["a", "b", "c"])
  })

  it("encode serializes typed array to JSON string", () => {
    const result = Tags.encode(["x", "y"])
    expect(result).toBe('["x","y"]')
  })

  it("round-trips: encode(decode(s)) produces equivalent JSON", () => {
    const input = '["alpha","beta"]'
    expect(JSON.parse(Tags.encode(Tags.decode(input)))).toEqual(JSON.parse(input))
  })

  it("decode throws on invalid JSON", () => {
    expect(() => Tags.decode("not-json")).toThrow()
  })

  it("decode throws on wrong shape", () => {
    expect(() => Tags.decode('{"not":"an-array"}')).toThrow()
  })
})

describe("sqlCursor", () => {
  const CursorSchema = Schema.fromJsonString(
    Schema.Struct({ createdAt: Schema.String, rowid: Schema.Int })
  )
  const cursor = sqlCursor(CursorSchema)

  it("encode produces base64url string", () => {
    const result = cursor.encode({ createdAt: "2026-01-01T00:00:00Z", rowid: 42 })
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })

  it("round-trips: decode(encode(x)) === x", () => {
    const input = { createdAt: "2026-01-01T00:00:00Z", rowid: 42 }
    const encoded = cursor.encode(input)
    const decoded = cursor.decode(encoded)
    expect(decoded).toEqual(input)
  })

  it("decode returns null for garbage input", () => {
    expect(cursor.decode("not-valid-base64!!!")).toBeNull()
    expect(cursor.decode("")).toBeNull()
  })

  it("decode returns null for valid base64 but wrong shape", () => {
    const badJson = Buffer.from('{"wrong":"shape"}').toString("base64url")
    expect(cursor.decode(badJson)).toBeNull()
  })

  it("property: arbitrary cursors round-trip", () => {
    const CursorData = Schema.Struct({ createdAt: Schema.String, rowid: Schema.Int })
    const arb = Schema.toArbitrary(CursorData) as fc.Arbitrary<{
      readonly createdAt: string
      readonly rowid: number
    }>

    fc.assert(
      fc.property(arb, (data) => {
        const encoded = cursor.encode(data)
        const decoded = cursor.decode(encoded)
        expect(decoded).not.toBeNull()
        expect(decoded!.createdAt).toBe(data.createdAt)
        expect(decoded!.rowid).toBe(data.rowid)
      }),
      { numRuns: 200 }
    )
  })

  it("property: random strings never crash decode", () => {
    fc.assert(
      fc.property(fc.string(), (randomString) => {
        const decoded = cursor.decode(randomString)
        if (decoded !== null) {
          expect(typeof decoded.createdAt).toBe("string")
          expect(Number.isInteger(decoded.rowid)).toBe(true)
        }
      }),
      { numRuns: 500 }
    )
  })
})
