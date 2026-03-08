import { readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ActivityWithRequirements,
  EntityWithRequirements,
  ExternalLink,
  Generation,
  ObjectRef,
  Prov,
  Prov0,
  ProvDateTime,
} from "@beep/schema/internal/ProvO/Prov0.ts";
import { describe, expect, it } from "@effect/vitest";
import { DateTime } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const testDir = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(testDir, "fixtures");
const decodeUnknownSync = <Schema extends S.Top>(schema: Schema) =>
  S.decodeUnknownSync(schema as Schema & { readonly DecodingServices: never });
const decodeJson = decodeUnknownSync(S.UnknownFromJsonString);
const decodeProv0 = decodeUnknownSync(Prov0);
const decodeProv = decodeUnknownSync(Prov);
const decodeEntity = decodeUnknownSync(EntityWithRequirements);
const decodeActivity = decodeUnknownSync(ActivityWithRequirements);

const readFixture = (relativePath: string): unknown => decodeJson(readFileSync(resolve(fixtureRoot, relativePath), "utf8"));

const exampleFixtures = [
  "prov/examples/example-activity.json",
  "prov/examples/example-activityinfluence.json",
  "prov/examples/example-llm.json",
  "prov/examples/example-withrefs.json",
  "prov/examples/example.json",
  "prov/examples/simple-rel.json",
] as const;

const invalidProvFixtures = [
  "prov/tests/ambiguous-type-fail.json",
  "prov/tests/relationship-fail.json",
  "prov/tests/sequential-time-fail.json",
] as const;

describe("Prov0 fixtures", () => {
  for (const fixture of exampleFixtures) {
    it(`decodes ${basename(fixture)}`, () => {
      expect(() => decodeProv0(readFixture(fixture))).not.toThrow();
    });
  }

  for (const fixture of invalidProvFixtures) {
    it(`rejects ${basename(fixture)}`, () => {
      expect(() => decodeProv0(readFixture(fixture))).toThrow();
    });
  }

  it("rejects the prov-activity entity fixture for an activity-only schema", () => {
    expect(() => decodeActivity(readFixture("prov-activity/tests/entity-fail.json"))).toThrow(
      'Expected "Activity" | "prov:Activity", got "Entity"'
    );
  });

  it("decodes qualified generation timestamps from the upstream influence fixture", () => {
    const decoded = decodeEntity(readFixture("prov/examples/example-activityinfluence.json"));

    if (O.isNone(decoded.qualifiedGeneration)) {
      throw new Error("Expected an entity root with qualifiedGeneration members.");
    }

    const qualifiedGeneration = decoded.qualifiedGeneration.value;
    if (!globalThis.Array.isArray(qualifiedGeneration)) {
      throw new Error("Expected qualifiedGeneration to decode as an array.");
    }

    const [generation] = qualifiedGeneration;
    if (!(generation instanceof Generation)) {
      throw new Error("Expected the first qualified generation member to decode as Generation.");
    }

    expect(O.isSome(generation.atTime)).toBe(true);
    if (O.isNone(generation.atTime)) {
      throw new Error("Expected the qualified generation to carry an atTime value.");
    }

    expect(DateTime.formatIso(generation.atTime.value)).toBe("2018-10-25T15:46:38.058Z");
  });
});

describe("Prov0 scalar helpers", () => {
  it("accepts IRI, CURIE, and local object references", () => {
    const decodeObjectRef = S.decodeUnknownSync(ObjectRef);

    expect(decodeObjectRef("https://example.org/things/1")).toBe("https://example.org/things/1");
    expect(decodeObjectRef("thing:DP-1-S1")).toBe("thing:DP-1-S1");
    expect(decodeObjectRef("localIdentifier")).toBe("localIdentifier");
  });

  it("rejects malformed object references", () => {
    expect(() => S.decodeUnknownSync(ObjectRef)("bad value with spaces")).toThrow(
      "Object references must be valid IRIs, CURIEs, or local identifiers"
    );
  });

  it("decodes external links with required and optional members", () => {
    const minimal = S.decodeUnknownSync(ExternalLink)({
      href: "https://example.org/spec",
      rel: "related",
    });
    const complete = S.decodeUnknownSync(ExternalLink)({
      href: "https://example.org/spec",
      rel: "alternate",
      anchor: "#section-1",
      type: "text/html",
      hreflang: "en",
      title: "Spec",
      length: 42,
    });

    expect(minimal.href).toBe("https://example.org/spec");
    expect(minimal.rel).toBe("related");
    expect(O.isNone(minimal.title)).toBe(true);
    expect(O.isSome(complete.title)).toBe(true);
    expect(O.isSome(complete.length)).toBe(true);

    if (O.isSome(complete.title) && O.isSome(complete.length)) {
      expect(complete.title.value).toBe("Spec");
      expect(complete.length.value).toBe(42);
    }
  });

  it("normalizes PROV timestamps to DateTime.Utc and encodes canonical ISO output", () => {
    const decoded = S.decodeUnknownSync(ProvDateTime)("2024-11-19T05:07:34.304708Z");

    expect(DateTime.toEpochMillis(decoded)).toBe(1731992854304);
    expect(S.encodeSync(ProvDateTime)(decoded)).toBe("2024-11-19T05:07:34.304Z");
  });
});

describe("Prov0 invariants", () => {
  it("enforces collection and empty collection semantics", () => {
    expect(
      decodeEntity({
        id: "collection-1",
        provType: "Entity",
        type: "Collection",
        hadMember: [{ id: "member-1", provType: "Entity" }],
      })
    ).toBeDefined();

    expect(
      decodeEntity({
        id: "collection-2",
        provType: "Entity",
        type: "EmptyCollection",
        hadMember: [],
      })
    ).toBeDefined();

    expect(() =>
      decodeEntity({
        id: "collection-3",
        provType: "Entity",
        type: "Collection",
        hadMember: [],
      })
    ).toThrow("Entity collection fields must align with Collection or EmptyCollection semantics");

    expect(() =>
      decodeEntity({
        id: "collection-4",
        provType: "Entity",
        type: "EmptyCollection",
        hadMember: [{ id: "member-2", provType: "Entity" }],
      })
    ).toThrow("Entity collection fields must align with Collection or EmptyCollection semantics");
  });

  it("accepts standalone agents at the root and inside Prov arrays", () => {
    expect(decodeProv0({ id: "agent-1", provType: "Agent" })).toBeDefined();
    expect(decodeProv([{ id: "agent-1", provType: "Agent" }])).toHaveLength(1);
  });

  it("rejects activities that use entities generated by later activities", () => {
    expect(() =>
      decodeActivity({
        id: "activity-1",
        provType: "Activity",
        endedAtTime: "2021-01-01T00:00:00Z",
        used: {
          id: "entity-1",
          provType: "Entity",
          wasGeneratedBy: {
            id: "activity-2",
            provType: "Activity",
            endedAtTime: "2029-01-01T00:00:00Z",
          },
        },
      })
    ).toThrow("Activities must not use inline entities generated by later activities");
  });
});
