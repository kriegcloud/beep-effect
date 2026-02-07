import type { ParsedPropertyDefinition } from "../Ontology/OntologyParser";
import type { OntologyContext } from "../Ontology/OntologyService";

export type ShapeSeverity = "Info" | "Warning" | "Violation";

export interface PropertyShape {
  readonly shapeId: string;
  readonly targetClass: string;
  readonly path: string;
  readonly minCount?: number;
  readonly maxCount?: number;
  readonly datatype?: string;
  readonly classIri?: string;
  readonly severity: ShapeSeverity;
}

const toPropertyShape = (property: ParsedPropertyDefinition, domainIri: string): PropertyShape => {
  const primaryRange = property.range[0];
  const isDatatype = property.rangeType === "datatype";
  return {
    shapeId: `${domainIri}#${property.localName}-shape`,
    targetClass: domainIri,
    path: property.iri,
    minCount: 1,
    ...(property.isFunctional ? { maxCount: 1 } : {}),
    ...(primaryRange === undefined ? {} : isDatatype ? { datatype: primaryRange } : { classIri: primaryRange }),
    severity: "Violation",
  };
};

export const generateShapesFromOntology = (ontology: OntologyContext): ReadonlyArray<PropertyShape> => {
  const shapes: Array<PropertyShape> = [];

  for (const cls of ontology.classes) {
    const props = ontology.getPropertiesForClass(cls.iri);
    for (const prop of props) {
      if (prop.domain.length === 0) {
        continue;
      }
      if (!prop.domain.includes(cls.iri)) {
        continue;
      }
      shapes.push(toPropertyShape(prop, cls.iri));
    }
  }

  return shapes;
};
