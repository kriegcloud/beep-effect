// Full JSON Schema validation against the vendored CycloneDX 1.6 schema.
//
// `ajv` and `ajv-formats` are exact devDependency pins (W4-b); nothing in `src`
// reaches them. The vendored schema has two external `$ref`s, the SPDX license
// enumeration (`spdx.SNAPSHOT.schema.json`) and the JSF signature
// (`jsf-0.82.SNAPSHOT.schema.json`). Neither is vendored yet (fetching them is a
// download this lane was not cleared to make; `fixtures/VENDORED.md` records the
// follow-up), so each is registered as a recorded stand-in: the emitter never
// writes a `signature`, and the SPDX id branch stays covered by the derived
// subset in `conformance.test.ts`, which asks `@beep/spdx` which ids are known.
// `idn-email` and `iri-reference` are formats `ajv-formats` does not implement;
// they are registered as accept-all so the compile is explicit about what it
// does not check.

import { Ajv } from "ajv";
import { fullFormats } from "ajv-formats/dist/formats.js";
import * as A from "effect/Array";
import BOM_SCHEMA from "../fixtures/bom-1.6.SNAPSHOT.schema.json" with { type: "json" };

/** The external schemas the vendored document names, as stand-ins until they are vendored. */
const STAND_INS = [
  { $id: "http://cyclonedx.org/schema/spdx.SNAPSHOT.schema.json", type: "string" },
  { $id: "http://cyclonedx.org/schema/jsf-0.82.SNAPSHOT.schema.json", definitions: { signature: {} } },
];

const ajv = new Ajv({
  strict: false,
  allErrors: true,
  formats: { ...fullFormats, "idn-email": true, "iri-reference": true },
});
ajv.addSchema(STAND_INS);
const validate = ajv.compile(BOM_SCHEMA);

/** The full-schema violations of one emitted document, as `<instancePath> <keyword>` lines; empty when valid. */
export const cycloneDxViolations = (document: unknown): ReadonlyArray<string> =>
  validate(document) ? [] : A.map(validate.errors ?? [], (error) => `${error.instancePath} ${error.keyword}`);
