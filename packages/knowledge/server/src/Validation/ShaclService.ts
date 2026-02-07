import { $KnowledgeServerId } from "@beep/identity/packages";
import { ShaclValidationError, type ValidationPolicyError } from "@beep/knowledge-domain/errors";
import { ShaclPolicy, ValidationFinding, type ValidationReport } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as N3 from "n3";
import { type OntologyContext, OntologyService, OntologyServiceLive } from "../Ontology/OntologyService";
import { hasType, materializeSubclassInference, nodesOfType, valuesForNodeAndPath } from "./ShaclParser";
import { generateShapesFromOntology, type PropertyShape } from "./ShapeGenerator";
import { enforceValidationPolicy, makeValidationReport } from "./ValidationReport";

const $I = $KnowledgeServerId.create("Validation/ShaclService");

const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";

const severityToKey = (severity: ValidationFinding["severity"]): keyof ShaclPolicy =>
  severity === "Violation" ? "violation" : severity === "Warning" ? "warning" : "info";

const datatypeMatches = (value: N3.Term, expectedDatatype: string): boolean => {
  if (value.termType !== "Literal") {
    return false;
  }

  if (value.datatype?.value === expectedDatatype) {
    return true;
  }

  return expectedDatatype === XSD_STRING && value.datatype?.value === undefined;
};

const validateShapeForNode = (
  graph: N3.Store,
  nodeIri: string,
  shape: PropertyShape,
  policy: ShaclPolicy
): ReadonlyArray<ValidationFinding> => {
  const findings: Array<ValidationFinding> = [];
  const values = valuesForNodeAndPath(graph, nodeIri, shape.path);
  const policyAction = policy[severityToKey(shape.severity)];

  if (policyAction === "ignore") {
    return findings;
  }

  if (shape.minCount !== undefined && values.length < shape.minCount) {
    findings.push(
      new ValidationFinding({
        shapeId: shape.shapeId,
        focusNode: nodeIri,
        path: shape.path,
        message: `Expected at least ${shape.minCount} values for ${shape.path}, found ${values.length}`,
        severity: shape.severity,
      })
    );
  }

  if (shape.maxCount !== undefined && values.length > shape.maxCount) {
    findings.push(
      new ValidationFinding({
        shapeId: shape.shapeId,
        focusNode: nodeIri,
        path: shape.path,
        message: `Expected at most ${shape.maxCount} values for ${shape.path}, found ${values.length}`,
        severity: shape.severity,
      })
    );
  }

  if (shape.datatype !== undefined) {
    for (const value of values) {
      if (!datatypeMatches(value, shape.datatype)) {
        findings.push(
          new ValidationFinding({
            shapeId: shape.shapeId,
            focusNode: nodeIri,
            path: shape.path,
            message: `Expected datatype ${shape.datatype} for ${shape.path}`,
            severity: shape.severity,
          })
        );
      }
    }
  }

  if (shape.classIri !== undefined) {
    for (const value of values) {
      if (value.termType !== "NamedNode" || !hasType(graph, value.value, shape.classIri)) {
        findings.push(
          new ValidationFinding({
            shapeId: shape.shapeId,
            focusNode: nodeIri,
            path: shape.path,
            message: `Expected value of ${shape.path} to have rdf:type ${shape.classIri}`,
            severity: shape.severity,
          })
        );
      }
    }
  }

  return findings;
};

export interface ValidateOptions {
  readonly policy?: ShaclPolicy;
  readonly maxInferenceDepth?: number;
}

export interface ShaclServiceShape {
  readonly generateShapes: (ontology: OntologyContext) => Effect.Effect<ReadonlyArray<PropertyShape>>;
  readonly validate: (
    graph: N3.Store,
    ontology: OntologyContext,
    options?: ValidateOptions
  ) => Effect.Effect<ValidationReport, ShaclValidationError | ValidationPolicyError>;
  readonly validateOntologyGraph: (
    graph: N3.Store,
    ontologyKey: string,
    ontologyContent: string,
    options?: ValidateOptions
  ) => Effect.Effect<ValidationReport, ShaclValidationError | ValidationPolicyError>;
}

export class ShaclService extends Context.Tag($I`ShaclService`)<ShaclService, ShaclServiceShape>() {}

const serviceEffect: Effect.Effect<ShaclServiceShape, never, OntologyService> = Effect.gen(function* () {
  const ontologyService = yield* OntologyService;

  const validate = (
    graph: N3.Store,
    ontology: OntologyContext,
    options?: ValidateOptions
  ): Effect.Effect<ValidationReport, ShaclValidationError | ValidationPolicyError> =>
    Effect.try({
      try: () => {
        const policy = options?.policy ?? new ShaclPolicy({});
        materializeSubclassInference(graph, options?.maxInferenceDepth ?? 8);

        const shapes = generateShapesFromOntology(ontology);
        const findings = A.flatMap(shapes, (shape) =>
          A.flatMap(nodesOfType(graph, shape.targetClass), (nodeIri) =>
            validateShapeForNode(graph, nodeIri, shape, policy)
          )
        );

        return makeValidationReport(findings);
      },
      catch: (cause) =>
        new ShaclValidationError({
          message: "SHACL validation failed",
          cause,
        }),
    }).pipe(
      Effect.tap((report) => enforceValidationPolicy(report, options?.policy ?? new ShaclPolicy({}))),
      Effect.withSpan("ShaclService.validate")
    );

  return ShaclService.of({
    generateShapes: (ontology: OntologyContext) => Effect.sync(() => generateShapesFromOntology(ontology)),

    validate,

    validateOntologyGraph: (
      graph: N3.Store,
      ontologyKey: string,
      ontologyContent: string,
      options?: ValidateOptions
    ): Effect.Effect<ValidationReport, ShaclValidationError | ValidationPolicyError> =>
      Effect.gen(function* () {
        const ontology = yield* ontologyService.load(ontologyKey, ontologyContent).pipe(
          Effect.mapError(
            (cause) =>
              new ShaclValidationError({
                message: "Failed to load ontology for SHACL validation",
                cause,
              })
          )
        );
        return yield* validate(graph, ontology, options);
      }),
  });
});

export const ShaclServiceLive = Layer.effect(ShaclService, serviceEffect).pipe(Layer.provide(OntologyServiceLive));
