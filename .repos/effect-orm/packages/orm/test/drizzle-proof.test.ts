import { describe, expect, it } from "vitest"
import {
  Column,
  type BigintDriverType,
  type TimestampDriverType,
  type DateDriverType,
  type EnumDriverType,
} from "../src/dialects/postgres/columns.js"
import {
  integer as pgInteger,
  varchar as pgVarchar,
  bigint as pgBigint,
  bigserial as pgBigserial,
  timestamp as pgTimestamp,
  date as pgDate,
  json as pgJson,
  jsonb as pgJsonb,
  text as pgText,
  boolean as pgBoolean,
  uuid as pgUuid,
  serial as pgSerial,
  numeric as pgNumeric,
  real as pgReal,
  pgEnum,
  type PgIntegerBuilder,
  type PgVarcharBuilder,
  type PgBigInt53Builder,
  type PgBigInt64Builder,
  type PgBigSerial53Builder,
  type PgBigSerial64Builder,
  type PgTimestampBuilder,
  type PgTimestampStringBuilder,
  type PgTimestampConfig,
  type PgDateBuilder,
  type PgDateStringBuilder,
  type PgJsonBuilder,
  type PgJsonbBuilder,
  type PgTextBuilder,
  type PgBooleanBuilder,
  type PgUUIDBuilder,
  type PgSerialBuilder,
  type PgNumericBuilder,
  type PgNumericNumberBuilder,
  type PgRealBuilder,
  type PgEnumColumnBuilder,
  type Precision,
} from "drizzle-orm/pg-core"

type StripUndefinedValues<T> = {
  [K in keyof T as undefined extends T[K]
    ? T[K] extends undefined
      ? never
      : K
    : K]: Exclude<T[K], undefined>
}

function stripUndefined<T extends Record<string, unknown>>(
  obj: T,
): StripUndefinedValues<T> {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }
  return result as StripUndefinedValues<T>
}

function toTimestampConfig<M extends "date" | "string">(col: {
  readonly mode: M
  readonly withTimezone?: boolean | undefined
  readonly precision?: number | undefined
}): PgTimestampConfig<M> {
  return {
    mode: col.mode,
    ...col.withTimezone !== undefined ? { withTimezone: col.withTimezone } : {},
    ...col.precision !== undefined ? { precision: col.precision as Precision } : {},
  }
}

describe("Drizzle proof-of-concept: Column -> Drizzle type flow", () => {
  describe("Part 1: Direct type flow -- mode generics narrow Drizzle builders", () => {
    it("bigint mode='number' -> PgBigInt53Builder", () => {
      const col = Column.bigint({ mode: "number" })
      const builder = pgBigint("score", { mode: col.mode })

      const _typeProof: PgBigInt53Builder = builder
      void _typeProof

      expect(col.mode).toBe("number")
      expect(col._tag).toBe("bigint")
    })

    it("bigint mode='bigint' (default) -> PgBigInt64Builder", () => {
      const col = Column.bigint()
      const builder = pgBigint("big_val", { mode: col.mode })

      const _typeProof: PgBigInt64Builder = builder
      void _typeProof

      expect(col.mode).toBe("bigint")
    })

    it("bigserial mode='number' -> PgBigSerial53Builder", () => {
      const col = Column.bigserial({ mode: "number" })
      const builder = pgBigserial("id", { mode: col.mode })

      const _typeProof: PgBigSerial53Builder = builder
      void _typeProof

      expect(col.mode).toBe("number")
    })

    it("bigserial mode='bigint' (default) -> PgBigSerial64Builder", () => {
      const col = Column.bigserial()
      const builder = pgBigserial("id", { mode: col.mode })

      const _typeProof: PgBigSerial64Builder = builder
      void _typeProof

      expect(col.mode).toBe("bigint")
    })

    it("timestamp mode='date' (default) -> PgTimestampBuilder", () => {
      const col = Column.timestamp()
      const builder = pgTimestamp("created_at", toTimestampConfig(col))

      const _typeProof: PgTimestampBuilder = builder
      void _typeProof

      expect(col.mode).toBe("date")
    })

    it("timestamp mode='string' -> PgTimestampStringBuilder", () => {
      const col = Column.timestamp({ mode: "string", withTimezone: true })
      const builder = pgTimestamp("created_at", toTimestampConfig(col))

      const _typeProof: PgTimestampStringBuilder = builder
      void _typeProof

      expect(col.mode).toBe("string")
      expect(col.withTimezone).toBe(true)
    })

    it("timestamp with all options preserves config through bridge", () => {
      const col = Column.timestamp({
        mode: "string",
        withTimezone: true,
        precision: 6,
      })
      const config = toTimestampConfig(col)
      const builder = pgTimestamp("ts", config)

      const _typeProof: PgTimestampStringBuilder = builder
      void _typeProof

      expect(col.mode).toBe("string")
      expect(col.withTimezone).toBe(true)
      expect(col.precision).toBe(6)
    })

    it("date mode='date' (default) -> PgDateBuilder", () => {
      const col = Column.date()
      const builder = pgDate("birth_date", { mode: col.mode })

      const _typeProof: PgDateBuilder = builder
      void _typeProof

      expect(col.mode).toBe("date")
    })

    it("date mode='string' -> PgDateStringBuilder", () => {
      const col = Column.date({ mode: "string" })
      const builder = pgDate("birth_date", { mode: col.mode })

      const _typeProof: PgDateStringBuilder = builder
      void _typeProof

      expect(col.mode).toBe("string")
    })

    it("numeric with precision and scale -> PgNumericBuilder (default string mode)", () => {
      const col = Column.numeric({ precision: 10, scale: 2 })
      const builder = pgNumeric("price", stripUndefined({
        precision: col.precision,
        scale: col.scale,
      }))

      const _typeProof: PgNumericBuilder = builder
      void _typeProof

      expect(col.mode).toBe("string")
    })

    it("numeric mode='number' -> PgNumericNumberBuilder", () => {
      const col = Column.numeric({ precision: 10, scale: 2, mode: "number" })
      const builder = pgNumeric("price", stripUndefined({
        precision: col.precision,
        scale: col.scale,
        mode: col.mode,
      }))

      const _typeProof: PgNumericNumberBuilder = builder
      void _typeProof

      expect(col.mode).toBe("number")
    })
  })

  describe("Part 2: Tag-dispatched builder record", () => {
    const toDrizzle = {
      integer: (name: string, _col: ReturnType<typeof Column.integer>) =>
        pgInteger(name),

      smallint: (name: string, _col: ReturnType<typeof Column.smallint>) =>
        pgInteger(name),

      serial: (name: string, _col: ReturnType<typeof Column.serial>) =>
        pgSerial(name),

      text: (name: string, _col: ReturnType<typeof Column.text>) =>
        pgText(name),

      varchar: (name: string, col: ReturnType<typeof Column.varchar>) =>
        col.length !== undefined
          ? pgVarchar(name, { length: col.length })
          : pgVarchar(name),

      boolean: (name: string, _col: ReturnType<typeof Column.boolean>) =>
        pgBoolean(name),

      uuid: (name: string, _col: ReturnType<typeof Column.uuid>) =>
        pgUuid(name),

      json: (name: string, _col: ReturnType<typeof Column.json>) =>
        pgJson(name),

      jsonb: (name: string, _col: ReturnType<typeof Column.jsonb>) =>
        pgJsonb(name),

      real: (name: string, _col: ReturnType<typeof Column.real>) =>
        pgReal(name),

      bigint: <M extends "bigint" | "number">(
        name: string,
        col: ReturnType<typeof Column.bigint<M>>,
      ) => pgBigint(name, { mode: col.mode }),

      bigserial: <M extends "bigint" | "number">(
        name: string,
        col: ReturnType<typeof Column.bigserial<M>>,
      ) => pgBigserial(name, { mode: col.mode }),

      timestamp: <M extends "date" | "string">(
        name: string,
        col: ReturnType<typeof Column.timestamp<M>>,
      ) => pgTimestamp(name, toTimestampConfig(col)),

      date: <M extends "date" | "string">(
        name: string,
        col: ReturnType<typeof Column.date<M>>,
      ) => pgDate(name, { mode: col.mode }),

      numeric: (
        name: string,
        col: ReturnType<typeof Column.numeric>,
      ) => pgNumeric(name, stripUndefined({
        precision: col.precision,
        scale: col.scale,
      })),
    } as const

    it("dispatches integer -> PgIntegerBuilder", () => {
      const col = Column.integer()
      const builder = toDrizzle.integer("id", col)

      const _typeProof: PgIntegerBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches varchar with length -> PgVarcharBuilder", () => {
      const col = Column.varchar({ length: 255 })
      const builder = toDrizzle.varchar("email", col)

      const _typeProof: PgVarcharBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches bigint<'number'> -> PgBigInt53Builder", () => {
      const col = Column.bigint({ mode: "number" })
      const builder = toDrizzle.bigint("score", col)

      const _typeProof: PgBigInt53Builder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches bigint<'bigint'> -> PgBigInt64Builder", () => {
      const col = Column.bigint()
      const builder = toDrizzle.bigint("big_val", col)

      const _typeProof: PgBigInt64Builder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches timestamp<'string'> -> PgTimestampStringBuilder", () => {
      const col = Column.timestamp({ mode: "string", withTimezone: true })
      const builder = toDrizzle.timestamp("ts", col)

      const _typeProof: PgTimestampStringBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches timestamp<'date'> -> PgTimestampBuilder", () => {
      const col = Column.timestamp()
      const builder = toDrizzle.timestamp("ts", col)

      const _typeProof: PgTimestampBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches date<'string'> -> PgDateStringBuilder", () => {
      const col = Column.date({ mode: "string" })
      const builder = toDrizzle.date("d", col)

      const _typeProof: PgDateStringBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches date<'date'> -> PgDateBuilder", () => {
      const col = Column.date()
      const builder = toDrizzle.date("d", col)

      const _typeProof: PgDateBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches serial -> PgSerialBuilder", () => {
      const col = Column.serial()
      const builder = toDrizzle.serial("id", col)

      const _typeProof: PgSerialBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches uuid -> PgUUIDBuilder", () => {
      const col = Column.uuid()
      const builder = toDrizzle.uuid("pk", col)

      const _typeProof: PgUUIDBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches boolean -> PgBooleanBuilder", () => {
      const col = Column.boolean()
      const builder = toDrizzle.boolean("active", col)

      const _typeProof: PgBooleanBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches json -> PgJsonBuilder", () => {
      const col = Column.json()
      const builder = toDrizzle.json("data", col)

      const _typeProof: PgJsonBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches jsonb -> PgJsonbBuilder", () => {
      const col = Column.jsonb()
      const builder = toDrizzle.jsonb("data", col)

      const _typeProof: PgJsonbBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches numeric -> PgNumericBuilder", () => {
      const col = Column.numeric({ precision: 10, scale: 2 })
      const builder = toDrizzle.numeric("price", col)

      const _typeProof: PgNumericBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })

    it("dispatches real -> PgRealBuilder", () => {
      const col = Column.real()
      const builder = toDrizzle.real("score", col)

      const _typeProof: PgRealBuilder = builder
      void _typeProof

      expect(builder).toBeDefined()
    })
  })

  describe("Part 3: Enum -- literal tuple preservation through pgEnum", () => {
    it("Column.enum values flow into pgEnum preserving tuple type", () => {
      const col = Column.enum({
        enumName: "user_status",
        values: ["active", "inactive", "banned"] as const,
      })

      const statusEnum = pgEnum(col.enumName, col.values)
      const statusCol = statusEnum("status")

      const _tupleProof: readonly ["active", "inactive", "banned"] = col.values
      void _tupleProof

      const _driverProof: EnumDriverType<typeof col.values> = "active"
      void _driverProof

      const _enumColProof: PgEnumColumnBuilder<
        ["active", "inactive", "banned"]
      > = statusCol
      void _enumColProof

      expect(col.values).toEqual(["active", "inactive", "banned"])
      expect(col.enumName).toBe("user_status")
      expect(statusEnum.enumValues).toEqual(["active", "inactive", "banned"])
    })

    it("single-value enum preserves singleton tuple", () => {
      const col = Column.enum({
        enumName: "toggle",
        values: ["on"] as const,
      })

      const toggleEnum = pgEnum(col.enumName, col.values)
      const toggleCol = toggleEnum("flag")

      const _colProof: PgEnumColumnBuilder<["on"]> = toggleCol
      void _colProof

      expect(toggleEnum.enumValues).toEqual(["on"])
    })
  })

  describe("Part 4: Mini table -- Column factories compose into Drizzle columns", () => {
    it("user table definition drives typed Drizzle column creation", () => {
      const userColumns = {
        id: Column.serial(),
        email: Column.varchar({ length: 255 }),
        name: Column.text(),
        score: Column.bigint({ mode: "number" }),
        balance: Column.numeric({ precision: 12, scale: 2 }),
        active: Column.boolean(),
        metadata: Column.jsonb(),
        externalId: Column.uuid(),
        createdAt: Column.timestamp({ withTimezone: true }),
        birthDate: Column.date({ mode: "string" }),
      }

      const drizzleId = pgSerial("id")
      const drizzleEmail = pgVarchar("email", {
        length: userColumns.email.length!,
      })
      const drizzleName = pgText("name")
      const drizzleScore = pgBigint("score", {
        mode: userColumns.score.mode,
      })
      const drizzleBalance = pgNumeric("balance", stripUndefined({
        precision: userColumns.balance.precision,
        scale: userColumns.balance.scale,
      }))
      const drizzleActive = pgBoolean("active")
      const drizzleMetadata = pgJsonb("metadata")
      const drizzleExternalId = pgUuid("external_id")
      const drizzleCreatedAt = pgTimestamp(
        "created_at",
        toTimestampConfig(userColumns.createdAt),
      )
      const drizzleBirthDate = pgDate("birth_date", {
        mode: userColumns.birthDate.mode,
      })

      const _idProof: PgSerialBuilder = drizzleId
      const _emailProof: PgVarcharBuilder = drizzleEmail
      const _nameProof: PgTextBuilder = drizzleName
      const _scoreProof: PgBigInt53Builder = drizzleScore
      const _balanceProof: PgNumericBuilder = drizzleBalance
      const _activeProof: PgBooleanBuilder = drizzleActive
      const _metadataProof: PgJsonbBuilder = drizzleMetadata
      const _externalIdProof: PgUUIDBuilder = drizzleExternalId
      const _createdAtProof: PgTimestampBuilder = drizzleCreatedAt
      const _birthDateProof: PgDateStringBuilder = drizzleBirthDate
      void _idProof
      void _emailProof
      void _nameProof
      void _scoreProof
      void _balanceProof
      void _activeProof
      void _metadataProof
      void _externalIdProof
      void _createdAtProof
      void _birthDateProof

      expect(userColumns.id._tag).toBe("serial")
      expect(userColumns.email.length).toBe(255)
      expect(userColumns.score.mode).toBe("number")
      expect(userColumns.createdAt.mode).toBe("date")
      expect(userColumns.createdAt.withTimezone).toBe(true)
      expect(userColumns.birthDate.mode).toBe("string")
      expect(userColumns.balance.precision).toBe(12)
      expect(userColumns.balance.scale).toBe(2)
    })

    it("driver types align between Column factory and Drizzle semantics", () => {
      const bigintNumCol = Column.bigint({ mode: "number" })
      const bigintBigCol = Column.bigint()
      const timestampDateCol = Column.timestamp()
      const timestampStrCol = Column.timestamp({ mode: "string" })
      const dateDateCol = Column.date()
      const dateStrCol = Column.date({ mode: "string" })

      const _bigintNum: BigintDriverType<typeof bigintNumCol.mode> = 42
      const _bigintBig: BigintDriverType<typeof bigintBigCol.mode> = 42n
      const _tsDate: TimestampDriverType<typeof timestampDateCol.mode> =
        new Date()
      const _tsStr: TimestampDriverType<typeof timestampStrCol.mode> =
        "2024-01-01T00:00:00Z"
      const _dDate: DateDriverType<typeof dateDateCol.mode> = new Date()
      const _dStr: DateDriverType<typeof dateStrCol.mode> = "2024-01-01"

      void _bigintNum
      void _bigintBig
      void _tsDate
      void _tsStr
      void _dDate
      void _dStr

      expect(typeof _bigintNum).toBe("number")
      expect(typeof _bigintBig).toBe("bigint")
      expect(_tsDate).toBeInstanceOf(Date)
      expect(typeof _tsStr).toBe("string")
      expect(_dDate).toBeInstanceOf(Date)
      expect(typeof _dStr).toBe("string")
    })

    it("enum column integrates into table definition", () => {
      const statusCol = Column.enum({
        enumName: "user_status",
        values: ["active", "inactive"] as const,
      })
      const roleCol = Column.enum({
        enumName: "user_role",
        values: ["admin", "member", "guest"] as const,
      })

      const statusEnum = pgEnum(statusCol.enumName, statusCol.values)
      const roleEnum = pgEnum(roleCol.enumName, roleCol.values)

      const drizzleStatus = statusEnum("status")
      const drizzleRole = roleEnum("role")

      const _statusProof: PgEnumColumnBuilder<["active", "inactive"]> =
        drizzleStatus
      const _roleProof: PgEnumColumnBuilder<["admin", "member", "guest"]> =
        drizzleRole
      void _statusProof
      void _roleProof

      type StatusValue = EnumDriverType<typeof statusCol.values>
      type RoleValue = EnumDriverType<typeof roleCol.values>
      const _sv: StatusValue = "active"
      const _rv: RoleValue = "guest"
      void _sv
      void _rv

      expect(statusEnum.enumName).toBe("user_status")
      expect(roleEnum.enumName).toBe("user_role")
      expect(statusEnum.enumValues).toEqual(["active", "inactive"])
      expect(roleEnum.enumValues).toEqual(["admin", "member", "guest"])
    })
  })
})
