// Full JSON Schema validation against the vendored CycloneDX 1.6 schema.
//
// `ajv` and `ajv-formats` are exact devDependency pins (W4-b); nothing in `src`
// reaches them. The vendored schema has two external `$ref`s, the SPDX license
// enumeration (`spdx.SNAPSHOT.schema.json`) and the JSF signature
// (`jsf-0.82.SNAPSHOT.schema.json`). Both are vendored beside it from the same
// `@cyclonedx/cyclonedx-library@10.1.0` release (`fixtures/VENDORED.md` pins
// their sha256). Their own `$id`s name the released `spdx.schema.json` and
// `jsf-0.82.schema.json`, so each is registered under the URI the `$ref`
// resolves to, the way the library itself maps them. `idn-email` and
// `iri-reference` are formats `ajv-formats` does not implement; they are
// registered as accept-all so the compile is explicit about what it does not
// check.

import { Ajv } from "ajv";
import { fullFormats } from "ajv-formats/dist/formats.js";
import * as A from "effect/Array";
import BOM_SCHEMA from "../fixtures/bom-1.6.SNAPSHOT.schema.json" with { type: "json" };
import JSF_SCHEMA from "../fixtures/jsf-0.82.SNAPSHOT.schema.json" with { type: "json" };
import SPDX_SCHEMA from "../fixtures/spdx.SNAPSHOT.schema.json" with { type: "json" };

const ajv = new Ajv({
  strict: false,
  allErrors: true,
  formats: { ...fullFormats, "idn-email": true, "iri-reference": true },
});
ajv.addSchema(SPDX_SCHEMA, "http://cyclonedx.org/schema/spdx.SNAPSHOT.schema.json");
ajv.addSchema(JSF_SCHEMA, "http://cyclonedx.org/schema/jsf-0.82.SNAPSHOT.schema.json");
const validate = ajv.compile(BOM_SCHEMA);

/** The full-schema violations of one emitted document, as `<instancePath> <keyword>` lines; empty when valid. */
export const cycloneDxViolations = (document: unknown): ReadonlyArray<string> =>
  validate(document) ? [] : A.map(validate.errors ?? [], (error) => `${error.instancePath} ${error.keyword}`);
