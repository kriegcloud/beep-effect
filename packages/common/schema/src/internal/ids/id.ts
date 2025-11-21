import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/modules";

const baseId = `${SchemaId.identifier}` as const;

const primitiveBase = `${baseId}/primitives` as const;

export const Id = {
  primitives: {
    BinaryId: BeepId.from(`${primitiveBase}/binary`),
    BoolId: BeepId.from(`${primitiveBase}/bool`),
    ContentTypeId: BeepId.from(`${primitiveBase}/content-type`),
    FnId: BeepId.from(`${primitiveBase}/fn`),
    GeoId: BeepId.from(`${primitiveBase}/geo`),
    JsonId: BeepId.from(`${primitiveBase}/json`),
    LocalesId: BeepId.from(`${primitiveBase}/locales`),
    NetworkId: BeepId.from(`${primitiveBase}/network`),
    NumberId: BeepId.from(`${primitiveBase}/number`),
    PersonId: BeepId.from(`${primitiveBase}/person`),
    RegexId: BeepId.from(`${primitiveBase}/regex`),
    StringId: BeepId.from(`${primitiveBase}/string`),
    TemporalId: BeepId.from(`${primitiveBase}/temporal`),
  },
};
