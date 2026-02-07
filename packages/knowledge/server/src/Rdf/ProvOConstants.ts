import { IRI } from "@beep/knowledge-domain/value-objects";
import { PROV, RDF } from "../Ontology/constants";

export const XSD = {
  dateTime: "http://www.w3.org/2001/XMLSchema#dateTime",
} as const;

export const PROVENANCE_GRAPH_IRI = IRI.make("urn:beep:provenance");

export const ProvOConstants = {
  graph: PROVENANCE_GRAPH_IRI,
  Activity: IRI.make(PROV.Activity),
  Agent: IRI.make(PROV.Agent),
  Entity: IRI.make(PROV.Entity),
  used: IRI.make(PROV.used),
  wasGeneratedBy: IRI.make(PROV.wasGeneratedBy),
  wasAssociatedWith: IRI.make(PROV.wasAssociatedWith),
  startedAtTime: IRI.make(PROV.startedAtTime),
  endedAtTime: IRI.make(PROV.endedAtTime),
  rdfType: IRI.make(RDF.type),
  xsdDateTime: IRI.make(XSD.dateTime),
} as const;
