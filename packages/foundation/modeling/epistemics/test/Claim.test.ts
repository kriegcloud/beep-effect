import { makeClaimEnvelope, validAt, versionsAt } from "@beep/epistemics/Claim";
import { $EpistemicsId } from "@beep/identity/packages";
import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as SchemaAST from "effect/SchemaAST";

const Knows = S.TaggedStruct("Knows", { left: S.String, right: S.String });

const bind = (path: string) =>
  makeClaimEnvelope({
    $I: $EpistemicsId.create(path),
    proposition: Knows,
    ids: {
      claimVersion: S.String.pipe(S.brand("TestClaimVersionId")),
      assertion: S.String.pipe(S.brand("TestAssertionId")),
      activity: S.String.pipe(S.brand("TestActivityId")),
      principal: S.String.pipe(S.brand("TestPrincipalId")),
    },
  });

const { ClaimVersion } = bind("test/ClaimA");
const absent = { _tag: "Absent", reason: "not-assessed" } as const;

const encoded = (
  id: string,
  validTime: unknown,
  recordedAt: number,
  expiredAt: number | null,
  review = "Proposed"
) => ({
  id,
  logicalKey: "Knows|a|b",
  proposition: { _tag: "Knows", left: "a", right: "b" },
  supportedBy: ["asrt-1"],
  challengedBy: [],
  validTime,
  knowledge: { recordedAt, expiredAt },
  supersedes: null,
  review: { _tag: review },
  signals: {
    sourceTrust: absent,
    sourceAssertedConfidence: absent,
    extractorConfidence: absent,
    validator: absent,
    reviewer: absent,
  },
});

const decode = S.decodeUnknownEffect(ClaimVersion);
const encode = S.encodeEffect(ClaimVersion);
const at = DateTime.makeUnsafe;

describe("Claim envelope", () => {
  it.effect("round-trips an encoded claim version unchanged", () =>
    Effect.gen(function* () {
      const row = encoded("cv-1", { _tag: "Interval", validFrom: 100, validTo: null }, 50, null);
      expect(yield* encode(yield* decode(row))).toEqual(row);
    })
  );

  it("gives each binding its own schema identifiers", () => {
    const other = bind("test/ClaimB").ClaimVersion;
    expect(SchemaAST.resolveIdentifier(ClaimVersion.ast)).not.toEqual(SchemaAST.resolveIdentifier(other.ast));
  });

  it("never selects unknown valid time", () => {
    expect(validAt({ _tag: "Unknown" }, at(0))).toBe(false);
  });

  it.effect("reads bitemporally: knowledge interval, valid interval and review state", () =>
    Effect.gen(function* () {
      const ledger = yield* Effect.forEach(
        [
          encoded("cv-old", { _tag: "Interval", validFrom: 0, validTo: null }, 10, 200),
          encoded("cv-new", { _tag: "Interval", validFrom: 0, validTo: null }, 200, null),
          encoded("cv-unknown", { _tag: "Unknown" }, 10, null),
        ],
        (row) => decode(row)
      );
      const ids = (asOf: number) =>
        A.map(versionsAt(ledger, { asOf: at(asOf), validAt: at(50), states: ["Proposed"] }), (v) => v.id);
      expect(ids(100)).toEqual(["cv-old"]);
      expect(ids(200)).toEqual(["cv-new"]);
      expect(versionsAt(ledger, { asOf: at(200), validAt: at(50), states: ["Accepted"] })).toEqual([]);
    })
  );
});
