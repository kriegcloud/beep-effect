import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  Activity,
  Association,
  Attribution,
  Collection,
  Delegation,
  Derivation,
  End,
  Entity,
  Generation,
  ObjectRef,
  Organization,
  Person,
  Plan,
  PrimarySource,
  ProvBundle,
  ProvDateTime,
  ProvO,
  Quotation,
  Revision,
  SoftwareAgent,
  Start,
  Usage,
} from "../../semantic-web/src/prov.ts";

const decodeUnknownSync = <Schema extends S.Decoder<unknown, never>>(schema: Schema) => S.decodeUnknownSync(schema);

const decodeActivity = decodeUnknownSync(Activity);
const decodeAssociation = decodeUnknownSync(Association);
const decodeAttribution = decodeUnknownSync(Attribution);
const decodeCollection = decodeUnknownSync(Collection);
const decodeDelegation = decodeUnknownSync(Delegation);
const decodeDerivation = decodeUnknownSync(Derivation);
const decodeEnd = decodeUnknownSync(End);
const decodeEntity = decodeUnknownSync(Entity);
const decodeGeneration = decodeUnknownSync(Generation);
const decodeObjectRef = decodeUnknownSync(ObjectRef);
const decodeOrganization = decodeUnknownSync(Organization);
const decodePerson = decodeUnknownSync(Person);
const decodePlan = decodeUnknownSync(Plan);
const decodePrimarySource = decodeUnknownSync(PrimarySource);
const decodeProvBundle = decodeUnknownSync(ProvBundle);
const decodeProvDateTime = decodeUnknownSync(ProvDateTime);
const decodeProvO = decodeUnknownSync(ProvO);
const decodeQuotation = decodeUnknownSync(Quotation);
const decodeRevision = decodeUnknownSync(Revision);
const decodeSoftwareAgent = decodeUnknownSync(SoftwareAgent);
const decodeStart = decodeUnknownSync(Start);
const decodeUsage = decodeUnknownSync(Usage);

const rawBundle = {
  lifecycle: {
    observedAt: "2026-03-08T12:00:00Z",
  },
  records: [
    {
      provType: "Entity",
      id: "thing:alice",
      value: "Alice",
    },
    {
      provType: "Activity",
      id: "activity:ingest",
      used: ["thing:alice"],
      startedAtTime: "2026-03-08T11:00:00Z",
      endedAtTime: "2026-03-08T12:00:00Z",
    },
    {
      provType: "SoftwareAgent",
      id: "agent:semantic-web",
      name: "semantic-web",
    },
  ],
} as const;

describe("ProvO", () => {
  it("decodes bounded provenance bundles through the current public entrypoint", () => {
    const decoded = decodeProvO(rawBundle);

    expect("records" in decoded).toBe(true);
    if ("records" in decoded) {
      expect(decoded.records).toHaveLength(3);
      expect(O.isSome(decoded.lifecycle)).toBe(true);
    }
  });

  it("decodes stable record variants and timestamp adjuncts", () => {
    expect(
      decodeEntity({
        provType: "Entity",
        id: "thing:alice",
        wasGeneratedBy: ["activity:ingest"],
        generatedAtTime: "2026-03-08T12:00:00Z",
      })
    ).toBeDefined();

    const activity = decodeActivity({
      provType: "Activity",
      id: "activity:ingest",
      used: ["thing:alice"],
      startedAtTime: "2026-03-08T11:00:00Z",
      endedAtTime: "2026-03-08T12:00:00Z",
    });

    expect(O.isSome(activity.startedAtTime)).toBe(true);
    expect(O.isSome(activity.endedAtTime)).toBe(true);
    expect(() => decodeProvDateTime("2026-03-08T12:00:00Z")).not.toThrow();
  });

  it("decodes extension-tier records that remain on the public semantic-web surface", () => {
    expect(decodePlan({ provType: "Plan", id: "plan:1", name: "Normalize bundle" })).toBeDefined();
    expect(decodeCollection({ provType: "Collection", id: "collection:1", hadMember: ["thing:alice"] })).toBeDefined();
    expect(decodePerson({ provType: "Person", id: "person:ada", name: "Ada" })).toBeDefined();
    expect(decodeOrganization({ provType: "Organization", id: "org:beep", name: "Beep" })).toBeDefined();
    expect(decodeSoftwareAgent({ provType: "SoftwareAgent", id: "agent:bot", name: "Bot" })).toBeDefined();
  });

  it("decodes stable and extension-tier relations with object references", () => {
    expect(
      decodeUsage({
        activity: "activity:ingest",
        entity: "thing:alice",
        atTime: "2026-03-08T11:30:00Z",
      })
    ).toBeDefined();

    expect(
      decodeGeneration({
        activity: "activity:ingest",
        entity: "thing:alice",
        atTime: "2026-03-08T12:00:00Z",
      })
    ).toBeDefined();

    expect(
      decodeAssociation({
        activity: "activity:ingest",
        agent: "agent:semantic-web",
        hadPlan: "plan:1",
      })
    ).toBeDefined();

    expect(decodeAttribution({ entity: "thing:alice", agent: "agent:semantic-web" })).toBeDefined();
    expect(decodeDelegation({ delegate: "agent:bot", responsible: "agent:semantic-web" })).toBeDefined();
    expect(decodeDerivation({ generatedEntity: "thing:alice:v2", usedEntity: "thing:alice:v1" })).toBeDefined();
    expect(decodePrimarySource({ entity: "thing:alice", source: "source:1" })).toBeDefined();
    expect(decodeQuotation({ entity: "thing:alice", source: "source:2" })).toBeDefined();
    expect(decodeRevision({ entity: "thing:alice:v2", source: "thing:alice:v1" })).toBeDefined();
    expect(decodeStart({ activity: "activity:ingest", trigger: "trigger:start" })).toBeDefined();
    expect(decodeEnd({ activity: "activity:ingest", trigger: "trigger:end" })).toBeDefined();
  });

  it("rejects invalid provenance values for the current schema surface", () => {
    expect(() => decodeProvO({ provType: "Bundle" })).toThrow();
    expect(() => decodeCollection({ provType: "Collection", id: "collection:1" })).toThrow();
    expect(() => decodeUsage({ activity: "activity:ingest" })).toThrow();
    expect(() => decodeObjectRef("not valid whitespace ref")).toThrow();
  });

  it("accepts direct bundle decoding without going through the union entrypoint", () => {
    const decoded = decodeProvBundle(rawBundle);

    expect(decoded.records).toHaveLength(3);
    expect(O.isSome(decoded.lifecycle)).toBe(true);
  });
});
