import { IRI } from "@beep/rdf/Iri";
import { makeNamedNode } from "@beep/rdf/Rdf";
import { XSD_STRING } from "@beep/rdf/Vocab/Xsd";
import * as S from "effect/Schema";

const iri = "https://example.org/value";
const node = makeNamedNode(iri);
const datatype = XSD_STRING.value;

S.is(IRI)(iri);
node.value;
datatype;
