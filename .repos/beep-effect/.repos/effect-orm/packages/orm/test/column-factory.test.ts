import { describe, expect, it } from "vitest"
import {
  Column,
  matchCategory,
  type BigintDriverType,
  type NumericDriverType,
  type DateDriverType,
  type TimestampDriverType,
  type JsonDriverType,
  type EnumDriverType
} from "../src/dialects/postgres/columns.js"

describe("Column factory", () => {
  describe("integer types", () => {
    it("Column.integer() produces correct fields", () => {
      const col = Column.integer()
      expect(col._tag).toBe("integer")
      expect(col.type).toBe("integer")
      expect(col.category).toBe("IntegerColumnType")
    })

    it("Column.smallint() produces correct fields", () => {
      const col = Column.smallint()
      expect(col._tag).toBe("smallint")
      expect(col.type).toBe("smallint")
      expect(col.category).toBe("IntegerColumnType")
    })

    it("Column.bigint() produces correct fields", () => {
      const col = Column.bigint()
      expect(col._tag).toBe("bigint")
      expect(col.type).toBe("bigint")
      expect(col.category).toBe("IntegerColumnType")
    })

    it("Column.serial() produces correct fields", () => {
      const col = Column.serial()
      expect(col._tag).toBe("serial")
      expect(col.type).toBe("serial")
      expect(col.category).toBe("IntegerColumnType")
    })

    it("Column.smallserial() produces correct fields", () => {
      const col = Column.smallserial()
      expect(col._tag).toBe("smallserial")
      expect(col.type).toBe("smallserial")
      expect(col.category).toBe("IntegerColumnType")
    })

    it("Column.bigserial() produces correct fields", () => {
      const col = Column.bigserial()
      expect(col._tag).toBe("bigserial")
      expect(col.type).toBe("bigserial")
      expect(col.category).toBe("IntegerColumnType")
    })
  })

  describe("floating point types", () => {
    it("Column.real() produces correct fields", () => {
      const col = Column.real()
      expect(col._tag).toBe("real")
      expect(col.type).toBe("real")
      expect(col.category).toBe("FloatingPointColumnType")
    })

    it("Column.doublePrecision() maps to _tag 'double precision'", () => {
      const col = Column.doublePrecision()
      expect(col._tag).toBe("double precision")
      expect(col.type).toBe("double precision")
      expect(col.category).toBe("FloatingPointColumnType")
    })

    it("Column.numeric() with precision and scale", () => {
      const col = Column.numeric({ precision: 10, scale: 2 })
      expect(col._tag).toBe("numeric")
      expect(col.type).toBe("numeric")
      expect(col.category).toBe("FloatingPointColumnType")
      expect(col.precision).toBe(10)
      expect(col.scale).toBe(2)
    })

    it("Column.numeric() without props", () => {
      const col = Column.numeric()
      expect(col._tag).toBe("numeric")
      expect(col.type).toBe("numeric")
      expect(col.category).toBe("FloatingPointColumnType")
    })
  })

  describe("character types", () => {
    it("Column.text() produces correct fields", () => {
      const col = Column.text()
      expect(col._tag).toBe("text")
      expect(col.type).toBe("text")
      expect(col.category).toBe("CharacterColumnType")
    })

    it("Column.varchar() with length", () => {
      const col = Column.varchar({ length: 255 })
      expect(col._tag).toBe("varchar")
      expect(col.type).toBe("varchar")
      expect(col.category).toBe("CharacterColumnType")
      expect(col.length).toBe(255)
    })

    it("Column.varchar() without props", () => {
      const col = Column.varchar()
      expect(col._tag).toBe("varchar")
      expect(col.type).toBe("varchar")
      expect(col.category).toBe("CharacterColumnType")
    })

    it("Column.char() with length", () => {
      const col = Column.char({ length: 1 })
      expect(col._tag).toBe("char")
      expect(col.type).toBe("char")
      expect(col.category).toBe("CharacterColumnType")
      expect(col.length).toBe(1)
    })
  })

  describe("boolean type", () => {
    it("Column.boolean() produces correct fields", () => {
      const col = Column.boolean()
      expect(col._tag).toBe("boolean")
      expect(col.type).toBe("boolean")
      expect(col.category).toBe("BooleanColumnType")
    })
  })

  describe("datetime types", () => {
    it("Column.date() produces correct fields", () => {
      const col = Column.date()
      expect(col._tag).toBe("date")
      expect(col.type).toBe("date")
      expect(col.category).toBe("DateTimeColumnType")
    })

    it("Column.time() with precision", () => {
      const col = Column.time({ precision: 3 })
      expect(col._tag).toBe("time")
      expect(col.type).toBe("time")
      expect(col.category).toBe("DateTimeColumnType")
      expect(col.precision).toBe(3)
    })

    it("Column.timestamp() with precision and timezone", () => {
      const col = Column.timestamp({ precision: 6, withTimezone: true })
      expect(col._tag).toBe("timestamp")
      expect(col.type).toBe("timestamp")
      expect(col.category).toBe("DateTimeColumnType")
      expect(col.precision).toBe(6)
      expect(col.withTimezone).toBe(true)
    })

    it("Column.interval() with fields", () => {
      const col = Column.interval({ fields: "day to hour" })
      expect(col._tag).toBe("interval")
      expect(col.type).toBe("interval")
      expect(col.category).toBe("DateTimeColumnType")
      expect(col.fields).toBe("day to hour")
    })
  })

  describe("json types", () => {
    it("Column.json() produces correct fields", () => {
      const col = Column.json()
      expect(col._tag).toBe("json")
      expect(col.type).toBe("json")
      expect(col.category).toBe("JsonColumnType")
    })

    it("Column.jsonb() produces correct fields", () => {
      const col = Column.jsonb()
      expect(col._tag).toBe("jsonb")
      expect(col.type).toBe("jsonb")
      expect(col.category).toBe("JsonColumnType")
    })
  })

  describe("binary type", () => {
    it("Column.bytea() produces correct fields", () => {
      const col = Column.bytea()
      expect(col._tag).toBe("bytea")
      expect(col.type).toBe("bytea")
      expect(col.category).toBe("BinaryColumnType")
    })
  })

  describe("uuid type", () => {
    it("Column.uuid() produces correct fields", () => {
      const col = Column.uuid()
      expect(col._tag).toBe("uuid")
      expect(col.type).toBe("uuid")
      expect(col.category).toBe("UuidColumnType")
    })
  })

  describe("network types", () => {
    it("Column.inet() produces correct fields", () => {
      const col = Column.inet()
      expect(col._tag).toBe("inet")
      expect(col.type).toBe("inet")
      expect(col.category).toBe("NetworkColumnType")
    })

    it("Column.cidr() produces correct fields", () => {
      const col = Column.cidr()
      expect(col._tag).toBe("cidr")
      expect(col.type).toBe("cidr")
      expect(col.category).toBe("NetworkColumnType")
    })

    it("Column.macaddr() produces correct fields", () => {
      const col = Column.macaddr()
      expect(col._tag).toBe("macaddr")
      expect(col.type).toBe("macaddr")
      expect(col.category).toBe("NetworkColumnType")
    })

    it("Column.macaddr8() produces correct fields", () => {
      const col = Column.macaddr8()
      expect(col._tag).toBe("macaddr8")
      expect(col.type).toBe("macaddr8")
      expect(col.category).toBe("NetworkColumnType")
    })
  })

  describe("geometric types", () => {
    it("Column.point() produces correct fields", () => {
      const col = Column.point()
      expect(col._tag).toBe("point")
      expect(col.type).toBe("point")
      expect(col.category).toBe("GeometricColumnType")
    })

    it("Column.line() produces correct fields", () => {
      const col = Column.line()
      expect(col._tag).toBe("line")
      expect(col.type).toBe("line")
      expect(col.category).toBe("GeometricColumnType")
    })

    it("Column.geometry() with srid and geometryType", () => {
      const col = Column.geometry({ srid: 4326, geometryType: "POINT" })
      expect(col._tag).toBe("geometry")
      expect(col.type).toBe("geometry")
      expect(col.category).toBe("GeometricColumnType")
      expect(col.srid).toBe(4326)
      expect(col.geometryType).toBe("POINT")
    })
  })

  describe("vector types", () => {
    it("Column.vector() with dimensions", () => {
      const col = Column.vector({ dimensions: 1536 })
      expect(col._tag).toBe("vector")
      expect(col.type).toBe("vector")
      expect(col.category).toBe("VectorColumnType")
      expect(col.dimensions).toBe(1536)
    })

    it("Column.halfvec() with dimensions", () => {
      const col = Column.halfvec({ dimensions: 768 })
      expect(col._tag).toBe("halfvec")
      expect(col.type).toBe("halfvec")
      expect(col.category).toBe("VectorColumnType")
      expect(col.dimensions).toBe(768)
    })

    it("Column.sparsevec() with dimensions", () => {
      const col = Column.sparsevec({ dimensions: 256 })
      expect(col._tag).toBe("sparsevec")
      expect(col.type).toBe("sparsevec")
      expect(col.category).toBe("VectorColumnType")
      expect(col.dimensions).toBe(256)
    })

    it("Column.bit() with length", () => {
      const col = Column.bit({ length: 8 })
      expect(col._tag).toBe("bit")
      expect(col.type).toBe("bit")
      expect(col.category).toBe("VectorColumnType")
      expect(col.length).toBe(8)
    })
  })

  describe("enum type", () => {
    it("Column.enum() with enumName and values", () => {
      const col = Column.enum({ enumName: "status", values: ["active", "inactive"] })
      expect(col._tag).toBe("enum")
      expect(col.type).toBe("enum")
      expect(col.category).toBe("EnumColumnType")
      expect(col.enumName).toBe("status")
      expect(col.values).toEqual(["active", "inactive"])
    })
  })

  describe("integration with matchCategory", () => {
    it("factory output is accepted by matchCategory", () => {
      expect(matchCategory(Column.integer())).toBe("integer")
      expect(matchCategory(Column.varchar({ length: 255 }))).toBe("varchar")
      expect(matchCategory(Column.numeric({ precision: 10, scale: 2 }))).toBe("numeric")
      expect(matchCategory(Column.doublePrecision())).toBe("double precision")
      expect(matchCategory(Column.uuid())).toBe("uuid")
      expect(matchCategory(Column.jsonb())).toBe("jsonb")
      expect(matchCategory(Column.vector({ dimensions: 1536 }))).toBe("vector")
      expect(matchCategory(Column.enum({ enumName: "status", values: ["active", "inactive"] }))).toBe("enum")
      expect(matchCategory(Column.timestamp({ precision: 6, withTimezone: true }))).toBe("timestamp")
      expect(matchCategory(Column.bytea())).toBe("bytea")
    })

    it("generic factory output with mode is accepted by matchCategory", () => {
      expect(matchCategory(Column.bigint({ mode: "number" }))).toBe("bigint")
      expect(matchCategory(Column.bigserial({ mode: "number" }))).toBe("bigserial")
      expect(matchCategory(Column.numeric({ mode: "number" }))).toBe("numeric")
      expect(matchCategory(Column.date({ mode: "string" }))).toBe("date")
      expect(matchCategory(Column.timestamp({ mode: "string" }))).toBe("timestamp")
      expect(matchCategory(Column.json({ mode: "text" }))).toBe("json")
      expect(matchCategory(Column.jsonb({ mode: "text" }))).toBe("jsonb")
    })
  })

  describe("generic mode inference", () => {
    it("Column.bigint() defaults mode to 'bigint'", () => {
      const col = Column.bigint()
      expect(col.mode).toBe("bigint")
      const _check: "bigint" = col.mode
      void _check
    })

    it("Column.bigint({ mode: 'number' }) narrows mode to 'number'", () => {
      const col = Column.bigint({ mode: "number" })
      expect(col.mode).toBe("number")
      const _check: "number" = col.mode
      void _check
    })

    it("Column.bigserial() defaults mode to 'bigint'", () => {
      const col = Column.bigserial()
      expect(col.mode).toBe("bigint")
      const _check: "bigint" = col.mode
      void _check
    })

    it("Column.bigserial({ mode: 'number' }) narrows mode to 'number'", () => {
      const col = Column.bigserial({ mode: "number" })
      expect(col.mode).toBe("number")
      const _check: "number" = col.mode
      void _check
    })

    it("Column.numeric() defaults mode to 'string'", () => {
      const col = Column.numeric()
      expect(col.mode).toBe("string")
      const _check: "string" = col.mode
      void _check
    })

    it("Column.numeric({ mode: 'number' }) narrows mode to 'number'", () => {
      const col = Column.numeric({ mode: "number" })
      expect(col.mode).toBe("number")
      const _check: "number" = col.mode
      void _check
    })

    it("Column.numeric({ precision: 10, scale: 2, mode: 'number' }) preserves all props", () => {
      const col = Column.numeric({ precision: 10, scale: 2, mode: "number" })
      expect(col.mode).toBe("number")
      expect(col.precision).toBe(10)
      expect(col.scale).toBe(2)
    })

    it("Column.date() defaults mode to 'date'", () => {
      const col = Column.date()
      expect(col.mode).toBe("date")
      const _check: "date" = col.mode
      void _check
    })

    it("Column.date({ mode: 'string' }) narrows mode to 'string'", () => {
      const col = Column.date({ mode: "string" })
      expect(col.mode).toBe("string")
      const _check: "string" = col.mode
      void _check
    })

    it("Column.timestamp() defaults mode to 'date'", () => {
      const col = Column.timestamp()
      expect(col.mode).toBe("date")
      const _check: "date" = col.mode
      void _check
    })

    it("Column.timestamp({ mode: 'string' }) narrows mode to 'string'", () => {
      const col = Column.timestamp({ mode: "string" })
      expect(col.mode).toBe("string")
      const _check: "string" = col.mode
      void _check
    })

    it("Column.timestamp({ precision: 6, withTimezone: true, mode: 'string' }) preserves all props", () => {
      const col = Column.timestamp({ precision: 6, withTimezone: true, mode: "string" })
      expect(col.mode).toBe("string")
      expect(col.precision).toBe(6)
      expect(col.withTimezone).toBe(true)
    })

    it("Column.json() defaults mode to 'json'", () => {
      const col = Column.json()
      expect(col.mode).toBe("json")
      const _check: "json" = col.mode
      void _check
    })

    it("Column.json({ mode: 'text' }) narrows mode to 'text'", () => {
      const col = Column.json({ mode: "text" })
      expect(col.mode).toBe("text")
      const _check: "text" = col.mode
      void _check
    })

    it("Column.jsonb() defaults mode to 'json'", () => {
      const col = Column.jsonb()
      expect(col.mode).toBe("json")
      const _check: "json" = col.mode
      void _check
    })

    it("Column.jsonb({ mode: 'text' }) narrows mode to 'text'", () => {
      const col = Column.jsonb({ mode: "text" })
      expect(col.mode).toBe("text")
      const _check: "text" = col.mode
      void _check
    })
  })

  describe("enum values generic", () => {
    it("Column.enum preserves literal tuple type", () => {
      const col = Column.enum({ enumName: "status", values: ["active", "inactive"] as const })
      expect(col.values).toEqual(["active", "inactive"])
      const _check: readonly ["active", "inactive"] = col.values
      void _check
    })

    it("Column.enum preserves single-element tuple", () => {
      const col = Column.enum({ enumName: "flag", values: ["on"] as const })
      expect(col.values).toEqual(["on"])
      const _check: readonly ["on"] = col.values
      void _check
    })
  })

  describe("driver type mappings", () => {
    it("BigintDriverType resolves correctly", () => {
      const _number: BigintDriverType<"number"> = 42
      const _bigint: BigintDriverType<"bigint"> = 42n
      void _number
      void _bigint
    })

    it("NumericDriverType resolves correctly", () => {
      const _number: NumericDriverType<"number"> = 42
      const _string: NumericDriverType<"string"> = "42.5"
      void _number
      void _string
    })

    it("DateDriverType resolves correctly", () => {
      const _date: DateDriverType<"date"> = new Date()
      const _string: DateDriverType<"string"> = "2024-01-01"
      void _date
      void _string
    })

    it("TimestampDriverType resolves correctly", () => {
      const _date: TimestampDriverType<"date"> = new Date()
      const _string: TimestampDriverType<"string"> = "2024-01-01T00:00:00Z"
      void _date
      void _string
    })

    it("JsonDriverType resolves correctly", () => {
      const _json: JsonDriverType<"json"> = { key: "value" }
      const _text: JsonDriverType<"text"> = '{"key":"value"}'
      void _json
      void _text
    })

    it("EnumDriverType resolves to union of values", () => {
      const _val: EnumDriverType<["active", "inactive"]> = "active"
      void _val
    })
  })
})
