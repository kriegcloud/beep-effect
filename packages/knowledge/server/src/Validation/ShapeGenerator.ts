import { $KnowledgeServerId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import type { ParsedPropertyDefinition } from "../Ontology/OntologyParser";
import type { OntologyContext } from "../Ontology/OntologyService";

const $I = $KnowledgeServerId.create("Validation/ShapeGenerator");

export class ShapeSeverity extends BS.StringLiteralKit("Info", "Warning", "Violation").annotations(
  $I.annotations("ShapeSeverity", {
    description:
      "Severity level for SHACL validation findings: Info for informational messages, Warning for potential issues, Violation for constraint failures",
  })
) {}
export declare namespace ShapeSeverity {
  export type Type = typeof ShapeSeverity.Type;
  export type Encoded = typeof ShapeSeverity.Encoded;
}
const makeShapeSeverityKind = ShapeSeverity.toTagged("severity").composer({
  shapeId: S.String,
  targetClass: S.String,
  path: S.String,
  minCount: S.optional(S.Number),
  maxCount: S.optional(S.Number),
  datatype: S.optional(S.String),
  classIri: S.optional(S.String),
});

export class InfoPropertyShape extends S.Class<InfoPropertyShape>($I`InfoPropertyShape`)(
  makeShapeSeverityKind.Info({})
) {}

export class WarningPropertyShape extends S.Class<WarningPropertyShape>($I`WarningPropertyShape`)(
  makeShapeSeverityKind.Warning({})
) {}

export class ViolationPropertyShape extends S.Class<ViolationPropertyShape>($I`ViolationPropertyShape`)(
  makeShapeSeverityKind.Violation({})
) {}

export class PropertyShape extends S.Union(InfoPropertyShape, WarningPropertyShape, ViolationPropertyShape).annotations(
  $I.annotations("PropertyShape", {
    description: "Union of all possible property shapes",
  })
) {}

export declare namespace PropertyShape {
  export type Type = typeof PropertyShape.Type;
  export type Encoded = typeof PropertyShape.Encoded;
}

const toPropertyShape = (property: ParsedPropertyDefinition, domainIri: string): PropertyShape.Type => {
  const primaryRange = property.range[0];
  const isDatatype = property.rangeType === "datatype";
  return new ViolationPropertyShape({
    shapeId: `${domainIri}#${property.localName}-shape`,
    targetClass: domainIri,
    path: property.iri,
    minCount: 1,
    ...(property.isFunctional ? { maxCount: 1 } : {}),
    ...(primaryRange === undefined ? {} : isDatatype ? { datatype: primaryRange } : { classIri: primaryRange }),
  });
};

export const generateShapesFromOntology = (ontology: OntologyContext): ReadonlyArray<PropertyShape.Type> => {
  const shapes = A.empty<PropertyShape.Type>();

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
