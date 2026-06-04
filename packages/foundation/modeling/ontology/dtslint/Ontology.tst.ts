import { $OntologyId } from "@beep/identity/packages";
import { Ontology } from "@beep/ontology";
import { XSD_STRING } from "@beep/rdf/Vocab/Xsd";

Ontology.create({
  identity: $OntologyId.create("ontology-dtslint"),
  baseIri: "https://example.org/ontology#",
  preferredPrefix: "ex",
  label: "Example",
}).Ont.dataPredicate({
  range: XSD_STRING,
});
