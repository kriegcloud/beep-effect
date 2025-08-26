import { makeRule, Operands } from "@beep/logos/v2/internal";
import { BS } from "@beep/schema";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as S from "effect/Schema";

export namespace Ops {
  export class Eq extends Operands.Eq.Schema(
    BS.DateTimeUtcFromAllAcceptable,
    {},
  ) {}
  export class Neq extends Operands.Neq.Schema(
    BS.DateTimeUtcFromAllAcceptable,
    {},
  ) {}
  export class Gt extends Operands.Gt.Schema(
    BS.DateTimeUtcFromAllAcceptable,
    {},
  ) {}
  export class Gte extends Operands.Gte.Schema(
    BS.DateTimeUtcFromAllAcceptable,
    {},
  ) {}
  export class Lt extends Operands.Lt.Schema(
    BS.DateTimeUtcFromAllAcceptable,
    {},
  ) {}
  export class Lte extends Operands.Lte.Schema(
    BS.DateTimeUtcFromAllAcceptable,
    {},
  ) {}
  export class IsSameHour extends Operands.IsSameHour.Schema(
    BS.DateTimeUtcFromAllAcceptable,
    {},
  ) {}
  export class IsSameDay extends Operands.IsSameDay.Schema(
    BS.DateTimeUtcFromAllAcceptable,
    {},
  ) {}
  export class IsSameWeek extends Operands.IsSameWeek.Schema(
    BS.DateTimeUtcFromAllAcceptable,
    {},
  ) {}
  export class IsSameMonth extends Operands.IsSameMonth.Schema(
    BS.DateTimeUtcFromAllAcceptable,
    {},
  ) {}
  export class IsSameYear extends Operands.IsSameYear.Schema(
    BS.DateTimeUtcFromAllAcceptable,
    {},
  ) {}
  export class Between extends Operands.Between.Schema(
    S.Struct({
      min: BS.DateTimeUtcFromAllAcceptable,
      max: BS.DateTimeUtcFromAllAcceptable,
    }),
    {
      inclusive: S.Boolean.pipe(
        S.optional,
        S.withDefaults({
          decoding: F.constFalse,
          constructor: F.constFalse,
        }),
      ),
    },
  ) {}
  // export class Between extends BetweenNumeric {}
}

export const { Input, Rule: _Rule } = makeRule("date", {
  field: S.NonEmptyString,
  op: S.Union(
    Ops.Eq,
    Ops.Neq,
    Ops.Gt,
    Ops.Gte,
    Ops.Lt,
    Ops.Lte,
    Ops.IsSameHour,
    Ops.IsSameDay,
    Ops.IsSameWeek,
    Ops.IsSameMonth,
    Ops.IsSameYear,
    Ops.Between,
  ),
});

export class Rule extends S.encodedSchema(_Rule) {}

export namespace Input {
  export type Type = typeof Input.Type;
  export type Encoded = typeof Input.Encoded;
}

export namespace Rule {
  export type Type = typeof Rule.Type;
  export type Encoded = typeof Rule.Encoded;
}

export const make = (i: Omit<Input.Type, "id" | "type">) =>
  Input.make({
    ...i,
    type: "date",
  });

// — helper —
const epochMs = (dt: DateTime.Utc) => DateTime.toDate(dt).getTime();
const sameInstant = (a: DateTime.Utc, b: DateTime.Utc) =>
  epochMs(a) === epochMs(b);

/** Same hour (UTC) bucket */
const sameUtcHour = (a: DateTime.Utc, b: DateTime.Utc): boolean => {
  const da = DateTime.toDate(a);
  const db = DateTime.toDate(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate() &&
    da.getUTCHours() === db.getUTCHours()
  );
};

/** Same day (UTC) bucket */
const sameUtcDay = (a: DateTime.Utc, b: DateTime.Utc): boolean => {
  const da = DateTime.toDate(a);
  const db = DateTime.toDate(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
};

/** Same month (UTC) bucket */
const sameUtcMonth = (a: DateTime.Utc, b: DateTime.Utc): boolean => {
  const da = DateTime.toDate(a);
  const db = DateTime.toDate(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth()
  );
};

/** Same year (UTC) bucket */
const sameUtcYear = (a: DateTime.Utc, b: DateTime.Utc): boolean => {
  const da = DateTime.toDate(a);
  const db = DateTime.toDate(b);
  return da.getUTCFullYear() === db.getUTCFullYear();
};

/**
 * ISO week start (Monday) for a UTC DateTime as epoch ms.
 * Week bucket is Monday 00:00:00.000Z … Sunday 23:59:59.999Z.
 */
const startOfIsoWeekMs = (u: DateTime.Utc): number => {
  const d = DateTime.toDate(u);
  // JS: 0=Sun..6=Sat → ISO: Mon=0..Sun=6
  const isoDow = (d.getUTCDay() + 6) % 7;
  // Go back to Monday 00:00:00.000
  const start = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() - isoDow,
    0,
    0,
    0,
    0,
  );
  return start;
};

const sameIsoWeek = (a: DateTime.Utc, b: DateTime.Utc): boolean =>
  startOfIsoWeekMs(a) === startOfIsoWeekMs(b);

/**
 * DateRule.validate
 * - Decodes the input into DateTime.Utc via BS.DateTimeUtcFromAllAcceptable
 * - Uses effect/DateTime for strict comparisons
 * - Uses UTC bucket normalization for “isSame*” operators
 */
export const validate = (
  rule: Input.Type,
  value: string | number | Date | DateTime.Utc,
): boolean => {
  const utc = S.decodeUnknownOption(BS.DateTimeUtcFromAllAcceptable)(value);

  return F.pipe(
    utc,
    O.match({
      onNone: () => false,
      onSome: (v) =>
        Match.value(rule.op).pipe(
          Match.withReturnType<boolean>(),
          Match.tags({
            /** equality / inequality */
            eq: (op) => sameInstant(op.value, v),
            ne: (op) => !sameInstant(op.value, v),

            /** relational */
            gt: (op) => DateTime.lessThan(op.value, v), // v > op.value
            gte: (op) => DateTime.lessThanOrEqualTo(op.value, v), // v >= op.value
            lt: (op) => DateTime.greaterThan(op.value, v), // v < op.value
            lte: (op) => DateTime.greaterThanOrEqualTo(op.value, v), // v <= op.value

            /** same-unit buckets (UTC) */
            isSameHour: (op) => sameUtcHour(v, op.value),
            isSameDay: (op) => sameUtcDay(v, op.value),
            isSameWeek: (op) => sameIsoWeek(v, op.value), // ISO week (Mon–Sun)
            isSameMonth: (op) => sameUtcMonth(v, op.value),
            isSameYear: (op) => sameUtcYear(v, op.value),

            /** range */
            between: (op) => {
              const { min, max } = op.value;
              if (op.inclusive) {
                // min <= v <= max
                return (
                  DateTime.greaterThanOrEqualTo(v, min) &&
                  DateTime.lessThanOrEqualTo(v, max)
                );
              }
              // min < v < max
              return DateTime.greaterThan(v, min) && DateTime.lessThan(v, max);
            },
          }),
          Match.orElse(() => false),
        ),
    }),
  );
};
