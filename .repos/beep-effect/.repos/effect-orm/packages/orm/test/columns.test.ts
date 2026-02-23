import { pipe } from "effect"
import { describe, expect, it } from "vitest"
import * as Pg from "../src/dialects/postgres/columns.js"
import * as MySQL from "../src/dialects/mysql/columns.js"
import * as SQLite from "../src/dialects/sqlite/columns.js"
import * as MSSQL from "../src/dialects/mssql/columns.js"

describe("Postgres column type matching", () => {
  describe("category-level matching via matchCategory", () => {
    it("dispatches integer types to the integer handler", () => {
      expect(Pg.matchCategory({ _tag: "integer", type: "integer", category: "IntegerColumnType" })).toBe("integer")
      expect(Pg.matchCategory({ _tag: "bigint", type: "bigint", category: "IntegerColumnType" })).toBe("bigint")
      expect(Pg.matchCategory({ _tag: "serial", type: "serial", category: "IntegerColumnType" })).toBe("serial")
      expect(Pg.matchCategory({ _tag: "smallserial", type: "smallserial", category: "IntegerColumnType" })).toBe("smallserial")
    })

    it("dispatches floating point types", () => {
      expect(Pg.matchCategory({ _tag: "real", type: "real", category: "FloatingPointColumnType" })).toBe("real")
      expect(Pg.matchCategory({ _tag: "double precision", type: "double precision", category: "FloatingPointColumnType" })).toBe("double precision")
      expect(Pg.matchCategory({ _tag: "numeric", type: "numeric", category: "FloatingPointColumnType", precision: 10, scale: 2 })).toBe("numeric")
    })

    it("dispatches character types", () => {
      expect(Pg.matchCategory({ _tag: "text", type: "text", category: "CharacterColumnType" })).toBe("text")
      expect(Pg.matchCategory({ _tag: "varchar", type: "varchar", category: "CharacterColumnType", length: 255 })).toBe("varchar")
      expect(Pg.matchCategory({ _tag: "char", type: "char", category: "CharacterColumnType", length: 1 })).toBe("char")
    })

    it("dispatches boolean types", () => {
      expect(Pg.matchCategory({ _tag: "boolean", type: "boolean", category: "BooleanColumnType" })).toBe("boolean")
    })

    it("dispatches datetime types", () => {
      expect(Pg.matchCategory({ _tag: "date", type: "date", category: "DateTimeColumnType" })).toBe("date")
      expect(Pg.matchCategory({ _tag: "timestamp", type: "timestamp", category: "DateTimeColumnType", precision: 6, withTimezone: true })).toBe("timestamp")
      expect(Pg.matchCategory({ _tag: "interval", type: "interval", category: "DateTimeColumnType", fields: "day to hour" })).toBe("interval")
    })

    it("dispatches json types", () => {
      expect(Pg.matchCategory({ _tag: "json", type: "json", category: "JsonColumnType" })).toBe("json")
      expect(Pg.matchCategory({ _tag: "jsonb", type: "jsonb", category: "JsonColumnType" })).toBe("jsonb")
    })

    it("dispatches binary types", () => {
      expect(Pg.matchCategory({ _tag: "bytea", type: "bytea", category: "BinaryColumnType" })).toBe("bytea")
    })

    it("dispatches uuid types", () => {
      expect(Pg.matchCategory({ _tag: "uuid", type: "uuid", category: "UuidColumnType" })).toBe("uuid")
    })

    it("dispatches network types", () => {
      expect(Pg.matchCategory({ _tag: "inet", type: "inet", category: "NetworkColumnType" })).toBe("inet")
      expect(Pg.matchCategory({ _tag: "cidr", type: "cidr", category: "NetworkColumnType" })).toBe("cidr")
      expect(Pg.matchCategory({ _tag: "macaddr", type: "macaddr", category: "NetworkColumnType" })).toBe("macaddr")
    })

    it("dispatches geometric types", () => {
      expect(Pg.matchCategory({ _tag: "point", type: "point", category: "GeometricColumnType" })).toBe("point")
      expect(Pg.matchCategory({ _tag: "geometry", type: "geometry", category: "GeometricColumnType", srid: 4326, geometryType: "POINT" })).toBe("geometry")
    })

    it("dispatches vector types", () => {
      expect(Pg.matchCategory({ _tag: "vector", type: "vector", category: "VectorColumnType", dimensions: 1536 })).toBe("vector")
      expect(Pg.matchCategory({ _tag: "halfvec", type: "halfvec", category: "VectorColumnType", dimensions: 768 })).toBe("halfvec")
      expect(Pg.matchCategory({ _tag: "bit", type: "bit", category: "VectorColumnType", length: 8 })).toBe("bit")
    })

    it("dispatches enum types", () => {
      expect(Pg.matchCategory({ _tag: "enum", type: "enum", category: "EnumColumnType", enumName: "status", values: ["active", "inactive"] })).toBe("enum")
    })
  })

  describe("per-category _tag matching", () => {
    it("IntegerColumnType.match dispatches by _tag", () => {
      const result = Pg.IntegerColumnType.match(
        { _tag: "bigserial", type: "bigserial", category: "IntegerColumnType" },
        {
          integer: () => "is-integer",
          smallint: () => "is-smallint",
          bigint: () => "is-bigint",
          serial: () => "is-serial",
          smallserial: () => "is-smallserial",
          bigserial: () => "is-bigserial",
        }
      )
      expect(result).toBe("is-bigserial")
    })

    it("FloatingPointColumnType.match passes properties to handler", () => {
      const result = Pg.FloatingPointColumnType.match(
        { _tag: "numeric", type: "numeric", category: "FloatingPointColumnType", precision: 10, scale: 2 },
        {
          real: () => null,
          "double precision": () => null,
          numeric: (col) => ({ p: col.precision, s: col.scale }),
        }
      )
      expect(result).toEqual({ p: 10, s: 2 })
    })

    it("CharacterColumnType.match passes length to handler", () => {
      const result = Pg.CharacterColumnType.match(
        { _tag: "varchar", type: "varchar", category: "CharacterColumnType", length: 100 },
        {
          text: () => null,
          varchar: (col) => col.length,
          char: () => null,
        }
      )
      expect(result).toBe(100)
    })

    it("DateTimeColumnType.match passes timestamp properties", () => {
      const result = Pg.DateTimeColumnType.match(
        { _tag: "timestamp", type: "timestamp", category: "DateTimeColumnType", precision: 3, withTimezone: true },
        {
          date: () => null,
          time: () => null,
          timestamp: (col) => ({ p: col.precision, tz: col.withTimezone }),
          interval: () => null,
        }
      )
      expect(result).toEqual({ p: 3, tz: true })
    })

    it("VectorColumnType.match passes dimensions", () => {
      const result = Pg.VectorColumnType.match(
        { _tag: "vector", type: "vector", category: "VectorColumnType", dimensions: 1536 },
        {
          vector: (col) => col.dimensions,
          halfvec: (col) => col.dimensions,
          sparsevec: (col) => col.dimensions,
          bit: (col) => col.length,
        }
      )
      expect(result).toBe(1536)
    })

    it("EnumColumnType.match passes enum metadata", () => {
      const result = Pg.EnumColumnType.match(
        { _tag: "enum", type: "enum", category: "EnumColumnType", enumName: "role", values: ["admin", "user"] },
        {
          enum: (col) => ({ name: col.enumName, vals: col.values }),
        }
      )
      expect(result).toEqual({ name: "role", vals: ["admin", "user"] })
    })

    it("GeometricColumnType.match passes geometry properties", () => {
      const result = Pg.GeometricColumnType.match(
        { _tag: "geometry", type: "geometry", category: "GeometricColumnType", srid: 4326, geometryType: "POLYGON" },
        {
          point: () => null,
          line: () => null,
          geometry: (col) => ({ srid: col.srid, gtype: col.geometryType }),
        }
      )
      expect(result).toEqual({ srid: 4326, gtype: "POLYGON" })
    })
  })

  describe("data-last (pipeline) form", () => {
    it("matchCategory works in pipe", () => {
      const col = { _tag: "jsonb" as const, type: "jsonb" as const, category: "JsonColumnType" as const }
      const result = pipe(col, Pg.matchCategory)
      expect(result).toBe("jsonb")
    })

    it("per-category matcher works in pipe", () => {
      const col = { _tag: "uuid" as const, type: "uuid" as const, category: "UuidColumnType" as const }
      const result = pipe(col, Pg.matchUuidColumnType)
      expect(result).toBe("uuid")
    })

    it("inline match works in pipe", () => {
      const matcher = Pg.IntegerColumnType.match({
        integer: () => 4,
        smallint: () => 2,
        bigint: () => 8,
        serial: () => 4,
        smallserial: () => 2,
        bigserial: () => 8,
      })
      const col = { _tag: "bigint" as const, type: "bigint" as const, category: "IntegerColumnType" as const }
      expect(pipe(col, matcher)).toBe(8)
    })
  })

  describe("guards", () => {
    it("IntegerColumnType.guards validates by _tag", () => {
      const col = { _tag: "integer", type: "integer", category: "IntegerColumnType" }
      expect(Pg.IntegerColumnType.guards.integer(col)).toBe(true)
      expect(Pg.IntegerColumnType.guards.bigint(col)).toBe(false)
    })

    it("per-category guards validate each _tag variant", () => {
      expect(Pg.IntegerColumnType.guards.serial({ _tag: "serial", type: "serial", category: "IntegerColumnType" })).toBe(true)
      expect(Pg.IntegerColumnType.guards.serial({ _tag: "integer", type: "integer", category: "IntegerColumnType" })).toBe(false)
      expect(Pg.FloatingPointColumnType.guards.numeric({ _tag: "numeric", type: "numeric", category: "FloatingPointColumnType" })).toBe(true)
      expect(Pg.FloatingPointColumnType.guards.numeric({ _tag: "real", type: "real", category: "FloatingPointColumnType" })).toBe(false)
    })

    it("single-member category guards validate correctly", () => {
      const boolCol = { _tag: "boolean", type: "boolean", category: "BooleanColumnType" }
      const uuidCol = { _tag: "uuid", type: "uuid", category: "UuidColumnType" }
      const byteaCol = { _tag: "bytea", type: "bytea", category: "BinaryColumnType" }
      expect(Pg.BooleanColumnType.guards.boolean(boolCol)).toBe(true)
      expect(Pg.UuidColumnType.guards.uuid(uuidCol)).toBe(true)
      expect(Pg.BinaryColumnType.guards.bytea(byteaCol)).toBe(true)
      expect(Pg.BooleanColumnType.guards.boolean(uuidCol)).toBe(false)
    })

    it("isAnyOf filters by multiple tags", () => {
      const isTextLike = Pg.CharacterColumnType.isAnyOf(["text", "varchar"])
      expect(isTextLike({ _tag: "text", type: "text", category: "CharacterColumnType" })).toBe(true)
      expect(isTextLike({ _tag: "varchar", type: "varchar", category: "CharacterColumnType" })).toBe(true)
      expect(isTextLike({ _tag: "char", type: "char", category: "CharacterColumnType" })).toBe(false)
    })

    it("isAnyOf on ColumnTypeCategory filters by multiple categories", () => {
      const isNumeric = Pg.ColumnTypeCategory.isAnyOf(["IntegerColumnType", "FloatingPointColumnType"])
      expect(isNumeric({ _tag: "integer", type: "integer", category: "IntegerColumnType" })).toBe(true)
      expect(isNumeric({ _tag: "numeric", type: "numeric", category: "FloatingPointColumnType" })).toBe(true)
      expect(isNumeric({ _tag: "text", type: "text", category: "CharacterColumnType" })).toBe(false)
    })
  })

  describe("cases", () => {
    it("IntegerColumnType.cases provides access to individual schemas", () => {
      expect(Pg.IntegerColumnType.cases.integer).toBeDefined()
      expect(Pg.IntegerColumnType.cases.bigint).toBeDefined()
      expect(Pg.IntegerColumnType.cases.serial).toBeDefined()
    })

    it("ColumnTypeCategory.cases provides access to category schemas", () => {
      expect(Pg.ColumnTypeCategory.cases.IntegerColumnType).toBeDefined()
      expect(Pg.ColumnTypeCategory.cases.FloatingPointColumnType).toBeDefined()
      expect(Pg.ColumnTypeCategory.cases.CharacterColumnType).toBeDefined()
      expect(Pg.ColumnTypeCategory.cases.JsonColumnType).toBeDefined()
      expect(Pg.ColumnTypeCategory.cases.VectorColumnType).toBeDefined()
      expect(Pg.ColumnTypeCategory.cases.EnumColumnType).toBeDefined()
    })
  })

  describe("optional properties default to undefined", () => {
    it("varchar without length passes matchCategory", () => {
      expect(Pg.matchCategory({ _tag: "varchar", type: "varchar", category: "CharacterColumnType" })).toBe("varchar")
    })

    it("numeric without precision/scale passes matchCategory", () => {
      expect(Pg.matchCategory({ _tag: "numeric", type: "numeric", category: "FloatingPointColumnType" })).toBe("numeric")
    })

    it("timestamp without precision or timezone passes matchCategory", () => {
      expect(Pg.matchCategory({ _tag: "timestamp", type: "timestamp", category: "DateTimeColumnType" })).toBe("timestamp")
    })
  })
})

describe("MySQL column type matching", () => {
  describe("category-level matching via matchCategory", () => {
    it("dispatches integer types", () => {
      expect(MySQL.matchCategory({ _tag: "int", type: "int", category: "IntegerColumnType" })).toBe("int")
      expect(MySQL.matchCategory({ _tag: "tinyint", type: "tinyint", category: "IntegerColumnType" })).toBe("tinyint")
      expect(MySQL.matchCategory({ _tag: "bigint", type: "bigint", category: "IntegerColumnType" })).toBe("bigint")
      expect(MySQL.matchCategory({ _tag: "serial", type: "serial", category: "IntegerColumnType" })).toBe("serial")
    })

    it("dispatches character types", () => {
      expect(MySQL.matchCategory({ _tag: "varchar", type: "varchar", category: "CharacterColumnType", length: 255 })).toBe("varchar")
      expect(MySQL.matchCategory({ _tag: "text", type: "text", category: "CharacterColumnType" })).toBe("text")
      expect(MySQL.matchCategory({ _tag: "longtext", type: "longtext", category: "CharacterColumnType" })).toBe("longtext")
    })

    it("dispatches binary types", () => {
      expect(MySQL.matchCategory({ _tag: "blob", type: "blob", category: "BinaryColumnType" })).toBe("blob")
      expect(MySQL.matchCategory({ _tag: "varbinary", type: "varbinary", category: "BinaryColumnType", length: 128 })).toBe("varbinary")
    })

    it("dispatches datetime types", () => {
      expect(MySQL.matchCategory({ _tag: "datetime", type: "datetime", category: "DateTimeColumnType", precision: 3 })).toBe("datetime")
      expect(MySQL.matchCategory({ _tag: "year", type: "year", category: "DateTimeColumnType" })).toBe("year")
    })

    it("dispatches json types", () => {
      expect(MySQL.matchCategory({ _tag: "json", type: "json", category: "JsonColumnType" })).toBe("json")
    })

    it("dispatches enum types", () => {
      expect(MySQL.matchCategory({ _tag: "enum", type: "enum", category: "EnumColumnType", enumName: "status", values: ["a", "b"] })).toBe("enum")
    })
  })

  describe("per-category _tag matching with MySQL-specific properties", () => {
    it("IntegerColumnType.match passes unsigned and autoIncrement", () => {
      const result = MySQL.IntegerColumnType.match(
        { _tag: "int", type: "int", category: "IntegerColumnType", unsigned: true, autoIncrement: true },
        {
          int: (col) => ({ unsigned: col.unsigned, auto: col.autoIncrement }),
          tinyint: () => null,
          smallint: () => null,
          mediumint: () => null,
          bigint: () => null,
          serial: () => null,
        }
      )
      expect(result).toEqual({ unsigned: true, auto: true })
    })

    it("FloatingPointColumnType.match passes decimal precision", () => {
      const result = MySQL.FloatingPointColumnType.match(
        { _tag: "decimal", type: "decimal", category: "FloatingPointColumnType", precision: 10, scale: 2 },
        {
          float: () => null,
          double: () => null,
          decimal: (col) => ({ p: col.precision, s: col.scale }),
          real: () => null,
        }
      )
      expect(result).toEqual({ p: 10, s: 2 })
    })
  })
})

describe("SQLite column type matching", () => {
  describe("category-level matching via matchCategory", () => {
    it("dispatches integer types", () => {
      expect(SQLite.matchCategory({ _tag: "integer", type: "integer", category: "IntegerColumnType" })).toBe("integer")
    })

    it("dispatches floating point types", () => {
      expect(SQLite.matchCategory({ _tag: "real", type: "real", category: "FloatingPointColumnType" })).toBe("real")
      expect(SQLite.matchCategory({ _tag: "numeric", type: "numeric", category: "FloatingPointColumnType", precision: 5, scale: 2 })).toBe("numeric")
    })

    it("dispatches text types", () => {
      expect(SQLite.matchCategory({ _tag: "text", type: "text", category: "TextColumnType" })).toBe("text")
    })

    it("dispatches blob types", () => {
      expect(SQLite.matchCategory({ _tag: "blob", type: "blob", category: "BlobColumnType" })).toBe("blob")
    })
  })

  describe("per-category _tag matching", () => {
    it("FloatingPointColumnType.match passes numeric properties", () => {
      const result = SQLite.FloatingPointColumnType.match(
        { _tag: "numeric", type: "numeric", category: "FloatingPointColumnType", precision: 8, scale: 3 },
        {
          real: () => null,
          numeric: (col) => ({ p: col.precision, s: col.scale }),
        }
      )
      expect(result).toEqual({ p: 8, s: 3 })
    })
  })

  describe("SQLite has fewer categories than Postgres", () => {
    it("ColumnType.cases covers all four SQLite categories", () => {
      expect(SQLite.ColumnType.cases.IntegerColumnType).toBeDefined()
      expect(SQLite.ColumnType.cases.FloatingPointColumnType).toBeDefined()
      expect(SQLite.ColumnType.cases.TextColumnType).toBeDefined()
      expect(SQLite.ColumnType.cases.BlobColumnType).toBeDefined()
    })

    it("ColumnTypeLiteral covers all SQLite types", () => {
      expect(SQLite.ColumnTypeLiteral.Options).toEqual(["integer", "real", "numeric", "text", "blob"])
    })
  })
})

describe("MSSQL column type matching", () => {
  describe("category-level matching via matchCategory", () => {
    it("dispatches integer types with identity", () => {
      expect(MSSQL.matchCategory({ _tag: "int", type: "int", category: "IntegerColumnType", identity: true })).toBe("int")
      expect(MSSQL.matchCategory({ _tag: "bigint", type: "bigint", category: "IntegerColumnType" })).toBe("bigint")
    })

    it("dispatches floating point types", () => {
      expect(MSSQL.matchCategory({ _tag: "decimal", type: "decimal", category: "FloatingPointColumnType", precision: 18, scale: 4 })).toBe("decimal")
      expect(MSSQL.matchCategory({ _tag: "real", type: "real", category: "FloatingPointColumnType" })).toBe("real")
    })

    it("dispatches character types", () => {
      expect(MSSQL.matchCategory({ _tag: "nvarchar", type: "nvarchar", category: "CharacterColumnType", length: 50 })).toBe("nvarchar")
      expect(MSSQL.matchCategory({ _tag: "ntext", type: "ntext", category: "CharacterColumnType" })).toBe("ntext")
    })

    it("dispatches binary types", () => {
      expect(MSSQL.matchCategory({ _tag: "varbinary", type: "varbinary", category: "BinaryColumnType", length: 256 })).toBe("varbinary")
    })

    it("dispatches boolean types (bit)", () => {
      expect(MSSQL.matchCategory({ _tag: "bit", type: "bit", category: "BooleanColumnType" })).toBe("bit")
    })

    it("dispatches datetime types", () => {
      expect(MSSQL.matchCategory({ _tag: "datetime2", type: "datetime2", category: "DateTimeColumnType", precision: 7 })).toBe("datetime2")
      expect(MSSQL.matchCategory({ _tag: "datetimeoffset", type: "datetimeoffset", category: "DateTimeColumnType" })).toBe("datetimeoffset")
    })
  })

  describe("per-category _tag matching with MSSQL-specific properties", () => {
    it("IntegerColumnType.match passes identity flag", () => {
      const result = MSSQL.IntegerColumnType.match(
        { _tag: "int", type: "int", category: "IntegerColumnType", identity: true },
        {
          bigint: () => null,
          int: (col) => col.identity,
          smallint: () => null,
          tinyint: () => null,
        }
      )
      expect(result).toBe(true)
    })

    it("FloatingPointColumnType.match passes precision and scale for decimal", () => {
      const result = MSSQL.FloatingPointColumnType.match(
        { _tag: "numeric", type: "numeric", category: "FloatingPointColumnType", precision: 18, scale: 6 },
        {
          float: () => null,
          real: () => null,
          decimal: () => null,
          numeric: (col) => ({ p: col.precision, s: col.scale }),
        }
      )
      expect(result).toEqual({ p: 18, s: 6 })
    })

    it("CharacterColumnType.match passes length for nvarchar", () => {
      const result = MSSQL.CharacterColumnType.match(
        { _tag: "nvarchar", type: "nvarchar", category: "CharacterColumnType", length: 100 },
        {
          char: () => null,
          varchar: () => null,
          text: () => null,
          nchar: () => null,
          nvarchar: (col) => col.length,
          ntext: () => null,
        }
      )
      expect(result).toBe(100)
    })

    it("DateTimeColumnType.match passes precision for datetime2", () => {
      const result = MSSQL.DateTimeColumnType.match(
        { _tag: "datetime2", type: "datetime2", category: "DateTimeColumnType", precision: 7 },
        {
          date: () => null,
          datetime: () => null,
          datetime2: (col) => col.precision,
          datetimeoffset: () => null,
          time: () => null,
        }
      )
      expect(result).toBe(7)
    })
  })
})

describe("cross-dialect pattern matching", () => {
  it("same logical operation produces correct result per dialect", () => {
    const pgResult = Pg.matchCategory({ _tag: "text", type: "text", category: "CharacterColumnType" })
    const mysqlResult = MySQL.matchCategory({ _tag: "text", type: "text", category: "CharacterColumnType" })
    const mssqlResult = MSSQL.matchCategory({ _tag: "text", type: "text", category: "CharacterColumnType" })

    expect(pgResult).toBe("text")
    expect(mysqlResult).toBe("text")
    expect(mssqlResult).toBe("text")
  })

  it("custom match handlers can return arbitrary shapes", () => {
    const pgSizer = Pg.IntegerColumnType.match({
      smallint: () => 2,
      integer: () => 4,
      bigint: () => 8,
      serial: () => 4,
      smallserial: () => 2,
      bigserial: () => 8,
    })

    expect(pgSizer({ _tag: "smallint", type: "smallint", category: "IntegerColumnType" })).toBe(2)
    expect(pgSizer({ _tag: "bigint", type: "bigint", category: "IntegerColumnType" })).toBe(8)
  })

  it("matchCategory composition delegates _tag matching through category", () => {
    const pgEnumCol = { _tag: "enum" as const, type: "enum" as const, category: "EnumColumnType" as const, enumName: "x", values: ["a"] }
    const mysqlEnumCol = { _tag: "enum" as const, type: "enum" as const, category: "EnumColumnType" as const, enumName: "x", values: ["a"] }

    expect(Pg.matchCategory(pgEnumCol)).toBe("enum")
    expect(MySQL.matchCategory(mysqlEnumCol)).toBe("enum")
  })
})
