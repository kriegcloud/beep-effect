import {
  OntoumlDiagramElement,
  OntoumlPackageContents,
  OntoumlProject,
  OntoumlPropertyAssignments,
} from "@beep/ontology";
import { describe, expect, it } from "@effect/vitest";
import { pipe, Result } from "effect";
import * as S from "effect/Schema";

const decode = <A, I, R>(schema: S.Schema<A, I, R>, input: unknown): A =>
  pipe(S.decodeUnknownResult(schema)(input), Result.getOrThrow);

describe("Ontouml schema models", () => {
  it("decodes a minimal OntoUML project", () => {
    const project = decode(OntoumlProject, {
      type: "Project",
      id: "project-1",
      name: { en: "Example Project" },
      description: null,
      model: {
        type: "Package",
        id: "model",
        name: "Model",
        description: null,
        contents: null,
        propertyAssignments: null,
      },
      diagrams: null,
    });

    expect(project).toBeInstanceOf(OntoumlProject);
    expect(project.model.id).toBe("model");
  });

  it("decodes recursive package contents", () => {
    const contents = decode(OntoumlPackageContents, [
      {
        type: "Class",
        id: "class-1",
        name: "Person",
        description: null,
        stereotype: "kind",
        properties: [
          {
            type: "Property",
            id: "property-1",
            name: "name",
            description: null,
            cardinality: "1",
            stereotype: null,
            propertyAssignments: null,
            propertyType: null,
            subsettedProperties: null,
            redefinedProperties: null,
            aggregationKind: null,
            isDerived: false,
            isOrdered: false,
            isReadOnly: false,
          },
        ],
        propertyAssignments: null,
        literals: null,
        isAbstract: false,
        isDerived: false,
        isExtensional: null,
        isPowertype: null,
        order: null,
        restrictedTo: ["functional-complex"],
      },
    ]);

    expect(contents?.[0]?.type).toBe("Class");
  });

  it("decodes property assignments with references and arrays", () => {
    const assignments = decode(OntoumlPropertyAssignments, {
      reviewed: true,
      rank: 1,
      source: { type: "Class", id: "class-1" },
      tags: ["stable", { type: "Literal", id: "literal-1" }],
    });

    expect(assignments?.reviewed).toBe(true);
    expect(assignments?.source).toMatchObject({ type: "Class", id: "class-1" });
  });

  it("decodes diagram elements with recursive children and extension fields", () => {
    const element = decode(OntoumlDiagramElement, {
      type: "Shape",
      id: "shape-1",
      source: { type: "Class", id: "class-1" },
      field: null,
      points: [{ x: 0, y: 0 }],
      font: { name: "Arial", size: 12, color: "#111" },
      line: { color: "#000", transparency: 0, weight: 1, style: "solid" },
      background: { color: "#fff", transparency: 0 },
      visibility: { attributes: true },
      elements: [
        {
          type: "Label",
          id: "label-1",
          source: { type: "Class", id: "class-1" },
          field: "name",
          points: null,
          font: null,
          line: null,
          background: null,
          visibility: null,
          elements: null,
        },
      ],
      xmiExtension: "allowed by the source schema",
    });

    expect(element.elements?.[0]?.type).toBe("Label");
    expect(element.xmiExtension).toBe("allowed by the source schema");
  });

  it("rejects invalid ids and duplicate unique arrays", () => {
    expect(Result.isFailure(S.decodeUnknownResult(OntoumlProject)({ type: "Project" }))).toBe(true);
    expect(
      Result.isFailure(
        S.decodeUnknownResult(OntoumlPackageContents)([
          {
            type: "Package",
            id: "model",
            name: "Model",
            description: null,
            contents: null,
            propertyAssignments: null,
          },
          {
            type: "Package",
            id: "model",
            name: "Model",
            description: null,
            contents: null,
            propertyAssignments: null,
          },
        ])
      )
    ).toBe(true);
  });
});
