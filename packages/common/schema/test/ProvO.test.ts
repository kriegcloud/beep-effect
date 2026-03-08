import { readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ActivityWithRequirements,
  AgentInfluence,
  Association,
  Attribution,
  Bundle,
  Collection,
  Delegation,
  EmptyCollection,
  EntityInfluence,
  EntityWithRequirements,
  ExternalLink,
  Generation,
  Influence,
  InstantaneousEvent,
  Location,
  ObjectRef,
  Organization,
  Person,
  Plan,
  PrimarySource,
  Prov,
  ProvDateTime,
  ProvO,
  Quotation,
  Revision,
  Role,
  SoftwareAgent,
  Usage,
} from "@beep/schema/internal/ProvO/ProvO.ts";
import { describe, expect, it } from "@effect/vitest";
import { DateTime } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const testDir = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(testDir, "fixtures");
const decodeUnknownSync = <Schema extends S.Top>(schema: Schema) =>
  S.decodeUnknownSync(schema as Schema & { readonly DecodingServices: never });
const decodeJson = decodeUnknownSync(S.UnknownFromJsonString);
const decodeProvO = decodeUnknownSync(ProvO);
const decodeProv = decodeUnknownSync(Prov);
const decodeEntity = decodeUnknownSync(EntityWithRequirements);
const decodeActivity = decodeUnknownSync(ActivityWithRequirements);
const decodeBundle = decodeUnknownSync(Bundle);
const decodePlan = decodeUnknownSync(Plan);
const decodeCollection = decodeUnknownSync(Collection);
const decodeEmptyCollection = decodeUnknownSync(EmptyCollection);
const decodePerson = decodeUnknownSync(Person);
const decodeOrganization = decodeUnknownSync(Organization);
const decodeSoftwareAgent = decodeUnknownSync(SoftwareAgent);
const decodeLocation = decodeUnknownSync(Location);
const decodeRole = decodeUnknownSync(Role);
const decodeUsage = decodeUnknownSync(Usage);
const decodeAssociation = decodeUnknownSync(Association);
const decodeAttribution = decodeUnknownSync(Attribution);
const decodeDelegation = decodeUnknownSync(Delegation);
const decodeEntityInfluence = decodeUnknownSync(EntityInfluence);
const decodeAgentInfluence = decodeUnknownSync(AgentInfluence);
const decodePrimarySource = decodeUnknownSync(PrimarySource);
const decodeQuotation = decodeUnknownSync(Quotation);
const decodeRevision = decodeUnknownSync(Revision);
const decodeInfluence = decodeUnknownSync(Influence);
const decodeInstantaneousEvent = decodeUnknownSync(InstantaneousEvent);

const readFixture = (relativePath: string): unknown =>
  decodeJson(readFileSync(resolve(fixtureRoot, relativePath), "utf8"));

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

describe("ProvO fixtures", () => {
  for (const fixture of exampleFixtures) {
    it(`decodes ${basename(fixture)}`, () => {
      expect(() => decodeProvO(readFixture(fixture))).not.toThrow();
    });
  }

  for (const fixture of invalidProvFixtures) {
    it(`rejects ${basename(fixture)}`, () => {
      expect(() => decodeProvO(readFixture(fixture))).toThrow();
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

describe("ProvO canonical surface", () => {
  it("accepts standalone agent roots at the canonical entrypoint and inside Prov arrays", () => {
    expect(decodeProvO({ id: "agent-1", provType: "Agent" })).toBeDefined();
    expect(decodeProv([{ id: "agent-1", provType: "Agent" }])).toHaveLength(1);
  });
});

describe("ProvO scalar helpers", () => {
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

describe("ProvO expanded terms", () => {
  it("decodes entity scalar and temporal expanded properties", () => {
    const decoded = decodeEntity({
      id: "entity-1",
      provType: "Entity",
      generatedAtTime: "2024-01-01T00:00:00Z",
      invalidatedAtTime: "2024-01-02T00:00:00Z",
      value: "snapshot",
      atLocation: {
        provType: "Location",
      },
    });

    expect(O.isSome(decoded.generatedAtTime)).toBe(true);
    expect(O.isSome(decoded.invalidatedAtTime)).toBe(true);
    expect(O.isSome(decoded.value)).toBe(true);
    expect(O.isSome(decoded.atLocation)).toBe(true);

    if (O.isSome(decoded.generatedAtTime) && O.isSome(decoded.invalidatedAtTime) && O.isSome(decoded.value)) {
      expect(DateTime.formatIso(decoded.generatedAtTime.value)).toBe("2024-01-01T00:00:00.000Z");
      expect(DateTime.formatIso(decoded.invalidatedAtTime.value)).toBe("2024-01-02T00:00:00.000Z");
      expect(decoded.value.value).toBe("snapshot");
    }
  });

  it("rejects non-scalar prov:value payloads", () => {
    expect(() =>
      decodeEntity({
        id: "entity-2",
        provType: "Entity",
        value: {
          bad: true,
        },
      })
    ).toThrow();
  });

  it("exports explicit bundle, plan, collection, and agent subtype schemas", () => {
    expect(decodeBundle({ id: "bundle-1", provType: "Bundle" })).toBeDefined();
    expect(decodePlan({ id: "plan-1", provType: "Plan" })).toBeDefined();
    expect(
      decodeCollection({
        id: "collection-1",
        provType: "Collection",
        hadMember: ["member-1"],
      })
    ).toBeDefined();
    expect(
      decodeEmptyCollection({
        id: "collection-2",
        provType: "EmptyCollection",
        hadMember: [],
      })
    ).toBeDefined();
    expect(decodePerson({ id: "person-1", provType: "Person", name: "Ada" })).toBeDefined();
    expect(decodeOrganization({ id: "org-1", provType: "Organization", name: "OpenAI" })).toBeDefined();
    expect(decodeSoftwareAgent({ id: "sa-1", provType: "SoftwareAgent", name: "bot" })).toBeDefined();
  });

  it("accepts inline Location values and rejects untyped inline locations", () => {
    expect(decodeLocation({ provType: "Location" })).toBeDefined();
    expect(() => decodeLocation({ id: "location-1" })).toThrow(
      "Location values must carry a canonical Location type marker"
    );
  });
});

describe("ProvO qualified terms", () => {
  it("accepts typed Role values for qualified usage", () => {
    const decoded = decodeUsage({
      entity: {
        id: "entity-1",
        provType: "Entity",
      },
      hadRole: {
        provType: "Role",
      },
    });

    expect(O.isSome(decoded.hadRole)).toBe(true);
  });

  it("accepts typed Plan and Role values for qualified association", () => {
    expect(
      decodeAssociation({
        agent: {
          id: "agent-1",
          provType: "Agent",
        },
        hadRole: {
          provType: "Role",
        },
        hadPlan: {
          id: "plan-1",
          provType: "Plan",
        },
      })
    ).toBeDefined();
  });

  it("rejects untyped inline plans in hadPlan", () => {
    expect(() =>
      decodeAssociation({
        agent: {
          id: "agent-1",
          provType: "Agent",
        },
        hadPlan: {
          id: "plan-1",
        },
      })
    ).toThrow("Plan values must carry a canonical Plan type marker");
  });

  it("exports primary source, quotation, and revision qualified relations", () => {
    expect(
      decodePrimarySource({
        entity: {
          id: "entity-1",
          provType: "Entity",
        },
        type: "PrimarySource",
      })
    ).toBeDefined();

    expect(
      decodeQuotation({
        entity: {
          id: "entity-1",
          provType: "Entity",
        },
        type: "Quotation",
      })
    ).toBeDefined();

    expect(
      decodeRevision({
        entity: {
          id: "entity-1",
          provType: "Entity",
        },
        type: "Revision",
      })
    ).toBeDefined();
  });

  it("exports entity and agent influence bases plus hadRole-capable agent relations", () => {
    expect(
      decodeEntityInfluence({
        entity: {
          id: "entity-1",
          provType: "Entity",
        },
        hadRole: {
          provType: "Role",
        },
      })
    ).toBeDefined();

    expect(
      decodeAgentInfluence({
        agent: {
          id: "agent-1",
          provType: "Agent",
        },
        hadRole: {
          provType: "Role",
        },
      })
    ).toBeDefined();

    expect(
      decodeAttribution({
        agent: {
          id: "agent-1",
          provType: "Agent",
        },
        hadRole: {
          provType: "Role",
        },
      })
    ).toBeDefined();

    expect(
      decodeDelegation({
        agent: {
          id: "agent-1",
          provType: "Agent",
        },
        hadActivity: {
          id: "activity-1",
          provType: "Activity",
        },
        hadRole: {
          provType: "Role",
        },
      })
    ).toBeDefined();
  });

  it("supports generic Influence.influenced and instantaneous event location coverage", () => {
    expect(
      decodeInfluence({
        influenced: {
          id: "entity-1",
          provType: "Entity",
        },
        influencer: {
          id: "activity-1",
          provType: "Activity",
        },
        hadRole: {
          provType: "Role",
        },
      })
    ).toBeDefined();

    expect(
      decodeInstantaneousEvent({
        type: "InstantaneousEvent",
        atTime: "2024-01-01T00:00:00Z",
        atLocation: {
          provType: "Location",
        },
      })
    ).toBeDefined();
  });

  it("rejects untyped inline roles", () => {
    expect(() => decodeRole({ id: "role-1" })).toThrow("Role values must carry a canonical Role type marker");
  });
});

describe("ProvO invariants", () => {
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
