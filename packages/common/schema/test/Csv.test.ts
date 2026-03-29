import { $ScratchId } from "@beep/identity";
import { CSV } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit } from "effect";
import * as S from "effect/Schema";

const $I = $ScratchId.create("csv_test");

class UserRow extends S.Class<UserRow>($I`UserRow`)(
  {
    id: S.NumberFromString,
    first_name: S.String,
    last_name: S.String,
    address: S.String,
  },
  $I.annote("UserRow", {
    description: "CSV user row used in tests.",
  })
) {}

class OptionalUserRow extends S.Class<OptionalUserRow>($I`OptionalUserRow`)(
  {
    id: S.NumberFromString,
    first_name: S.String,
    nickname: S.optionalKey(S.String),
  },
  $I.annote("OptionalUserRow", {
    description: "CSV user row with an optional encoded field.",
  })
) {}

class InvalidNumberRow extends S.Class<InvalidNumberRow>($I`InvalidNumberRow`)(
  {
    id: S.Number,
    name: S.String,
  },
  $I.annote("InvalidNumberRow", {
    description: "CSV row with a non-string boundary number field.",
  })
) {}

describe("CSV", () => {
  it.effect("decodes headered CSV text into typed row arrays", () =>
    Effect.gen(function* () {
      const csv = CSV(UserRow);
      const rows = yield* S.decodeUnknownEffect(csv)(
        "id,first_name,last_name,address\n1,Ada,Lovelace,London\n2,Grace,Hopper,New York"
      );

      expect(rows).toHaveLength(2);
      expect(rows[0]).toBeInstanceOf(UserRow);
      expect(rows[0].id).toBe(1);
      expect(rows[1].last_name).toBe("Hopper");
    })
  );

  it.effect("maps input columns by header name even when the file order differs", () =>
    Effect.gen(function* () {
      const csv = CSV(UserRow);
      const rows = yield* S.decodeUnknownEffect(csv)(
        "address,last_name,id,first_name\nLondon,Lovelace,1,Ada\nNew York,Hopper,2,Grace"
      );

      expect(rows[0].first_name).toBe("Ada");
      expect(rows[0].address).toBe("London");
      expect(rows[1].id).toBe(2);
    })
  );

  it.effect("supports delimiter, quoting, trimming, skipRows, skipLines, and maxRows", () =>
    Effect.gen(function* () {
      const csv = CSV(UserRow, {
        delimiter: ";",
        maxRows: 1,
        quote: '"',
        skipLines: 1,
        skipRows: 1,
        trim: true,
      });

      const rows = yield* S.decodeUnknownEffect(csv)(
        '# comment to skip entirely\nid;first_name;last_name;address\n1; Ada ;Lovelace;"London, UK"\n2;Grace;Hopper;"New\nYork"'
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe(2);
      expect(rows[0].address).toBe("New\nYork");
    })
  );

  it.effect("encodes rows back to branded CSV text in schema field order", () =>
    Effect.gen(function* () {
      const csv = CSV(UserRow);
      const rows = [
        new UserRow({
          address: "London, UK",
          first_name: "Ada",
          id: 1,
          last_name: "Lovelace",
        }),
      ];

      const encoded = yield* S.encodeEffect(csv)(rows);

      expect(encoded).toBe('id,first_name,last_name,address\n1,Ada,Lovelace,"London, UK"');

      const roundTrip = yield* S.decodeUnknownEffect(csv)(encoded);
      expect(roundTrip[0].address).toBe("London, UK");
      expect(roundTrip[0].id).toBe(1);
    })
  );

  it.effect("renders missing optional encoded fields as empty cells", () =>
    Effect.gen(function* () {
      const csv = CSV(OptionalUserRow);
      const rows = [
        new OptionalUserRow({
          first_name: "Ada",
          id: 1,
        }),
      ];

      const encoded = yield* S.encodeEffect(csv)(rows);

      expect(encoded).toBe("id,first_name,nickname\n1,Ada,");
    })
  );

  it.effect("rejects duplicate headers", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        S.decodeUnknownEffect(CSV(UserRow))("id,id,last_name,address\n1,2,Lovelace,London")
      );

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);
        expect(rendered).toContain("Duplicate headers found [id]");
      }
    })
  );

  it.effect("rejects missing or unexpected headers", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        S.decodeUnknownEffect(CSV(UserRow))("id,first_name,address,unexpected\n1,Ada,London,nope")
      );

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);
        expect(rendered).toContain("CSV header mismatch");
        expect(rendered).toContain("missing: last_name");
        expect(rendered).toContain("unexpected: unexpected");
      }
    })
  );

  it.effect("rejects row length mismatches when strict column handling is enabled", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        S.decodeUnknownEffect(CSV(UserRow, { strictColumnHandling: true }))(
          "id,first_name,last_name,address\n1,Ada,Lovelace"
        )
      );

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);
        expect(rendered).toContain("Column header mismatch expected: 4 columns got: 3");
      }
    })
  );

  it.effect("fails when the row schema does not model a CSV text boundary", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(S.decodeUnknownEffect(CSV(InvalidNumberRow))("id,name\n1,Ada"));

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);
        expect(rendered).toContain("Expected number");
      }
    })
  );

  it.effect("fails to encode non-string-compatible field output", () =>
    Effect.gen(function* () {
      const csv = CSV(InvalidNumberRow);
      const rows = [new InvalidNumberRow({ id: 1, name: "Ada" })];
      const result = yield* Effect.exit(S.encodeEffect(csv)(rows));

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);
        expect(rendered).toContain("Encoded CSV field 'id' must be a string-compatible value.");
      }
    })
  );
});
