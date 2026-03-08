import { Prov0 as Prov0Compat } from "@beep/schema/internal/ProvO/Prov0.ts";
import {
  AgentInfluence,
  Association,
  Attribution,
  Bundle,
  Collection,
  Delegation,
  EmptyCollection,
  EntityInfluence,
  EntityWithRequirements,
  Influence,
  InstantaneousEvent,
  Location,
  Organization,
  Person,
  Plan,
  PrimarySource,
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

const decodeUnknownSync = <Schema extends S.Top>(schema: Schema) =>
  S.decodeUnknownSync(schema as Schema & { readonly DecodingServices: never });

const decodeProvO = decodeUnknownSync(ProvO);
const decodeEntity = decodeUnknownSync(EntityWithRequirements);
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

describe("ProvO canonical surface", () => {
  it("keeps the Prov0 compatibility alias mapped to the canonical ProvO schema", () => {
    expect(Prov0Compat).toBe(ProvO);
  });

  it("accepts standalone agent roots at the canonical entrypoint", () => {
    expect(decodeProvO({ id: "agent-1", provType: "Agent" })).toBeDefined();
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

    if (
      O.isSome(decoded.generatedAtTime) &&
      O.isSome(decoded.invalidatedAtTime) &&
      O.isSome(decoded.value)
    ) {
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
    expect(() => decodeLocation({ id: "location-1" })).toThrow("Location values must carry a canonical Location type marker");
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
