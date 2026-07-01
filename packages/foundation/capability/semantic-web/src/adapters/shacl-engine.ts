/**
 * Local SHACL validation adapter backing.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { A } from "@beep/utils";
import { Effect, Layer, pipe } from "effect";
import * as O from "effect/Option";
import { serializeTerm } from "../rdf.ts";
import {
  ShaclValidationResult,
  ShaclValidationService,
  ShaclValidationViolation,
} from "../services/shacl-validation.ts";
import { RDF_TYPE } from "../vocab/rdf.ts";
import type { ShaclValidationServiceShape } from "../services/shacl-validation.ts";

const emptySubjectKeys: Array<string> = [];
const emptyViolations: Array<ShaclValidationViolation> = [];

const makeViolation = (
  focusNode: string,
  path: ShaclValidationViolation["path"],
  message: string
): ShaclValidationViolation =>
  ShaclValidationViolation.make({
    focusNode,
    path,
    severity: "violation",
    message,
  });

/**
 * Bounded SHACL-inspired validation service live layer.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert"
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { BoundedShaclValidationServiceLive } from "@beep/semantic-web/adapters/shacl-engine"
 * import {
 *   ShaclValidationRequest,
 *   ShaclValidationService
 * } from "@beep/semantic-web/services/shacl-validation"
 *
 * const request = S.decodeUnknownSync(ShaclValidationRequest)({
 *   dataset: { quads: [] },
 *   shapes: []
 * })
 * const result = Effect.runSync(
 *   Effect.gen(function* () {
 *     const service = yield* ShaclValidationService
 *     return yield* service.validate(request)
 *   }).pipe(Effect.provide(BoundedShaclValidationServiceLive))
 * )
 * strictEqual(result.conforms, true)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const BoundedShaclValidationServiceLive = Layer.succeed(
  ShaclValidationService,
  ShaclValidationService.of({
    validate: Effect.fn((request) => {
      let violations: Array<ShaclValidationViolation> = emptyViolations;
      const subjectKeys = pipe(
        request.dataset.quads,
        A.reduce(emptySubjectKeys, (keys, quad) => {
          const subjectKey = serializeTerm(quad.subject);
          return pipe(keys, A.contains(subjectKey)) ? keys : pipe(keys, A.append(subjectKey));
        })
      );

      for (const shape of request.shapes) {
        for (const subjectKey of subjectKeys) {
          const subjectQuads = pipe(
            request.dataset.quads,
            A.filter((quad) => serializeTerm(quad.subject) === subjectKey)
          );
          const targetClass = O.isSome(shape.targetClass) ? shape.targetClass.value.value : undefined;
          const targetClassMatches =
            targetClass === undefined ||
            pipe(
              subjectQuads,
              A.some(
                (quad) =>
                  quad.predicate.value === RDF_TYPE.value &&
                  quad.object.termType === "NamedNode" &&
                  quad.object.value === targetClass
              )
            );

          if (!targetClassMatches) {
            continue;
          }

          for (const propertyShape of shape.properties) {
            const propertyQuads = pipe(
              subjectQuads,
              A.filter((quad) => quad.predicate.value === propertyShape.path.value)
            );

            if (O.isSome(propertyShape.minCount) && propertyQuads.length < propertyShape.minCount.value) {
              violations = pipe(
                violations,
                A.append(
                  makeViolation(
                    subjectKey,
                    propertyShape.path,
                    `Expected at least ${propertyShape.minCount.value} value(s) for ${propertyShape.path.value}.`
                  )
                )
              );
            }

            if (O.isSome(propertyShape.maxCount) && propertyQuads.length > propertyShape.maxCount.value) {
              violations = pipe(
                violations,
                A.append(
                  makeViolation(
                    subjectKey,
                    propertyShape.path,
                    `Expected at most ${propertyShape.maxCount.value} value(s) for ${propertyShape.path.value}.`
                  )
                )
              );
            }

            if (O.isSome(propertyShape.datatype)) {
              for (const quad of propertyQuads) {
                if (
                  quad.object.termType !== "Literal" ||
                  quad.object.datatype.value !== propertyShape.datatype.value.value
                ) {
                  violations = pipe(
                    violations,
                    A.append(
                      makeViolation(
                        subjectKey,
                        propertyShape.path,
                        `Expected datatype ${propertyShape.datatype.value.value} for ${propertyShape.path.value}.`
                      )
                    )
                  );
                }
              }
            }

            if (O.isSome(request.maxResults) && violations.length >= request.maxResults.value) {
              return Effect.succeed(
                ShaclValidationResult.make({
                  conforms: false,
                  violations: pipe(violations, A.take(request.maxResults.value)),
                  truncated: true,
                })
              );
            }
          }
        }
      }

      return Effect.succeed(
        ShaclValidationResult.make({
          conforms: violations.length === 0,
          violations,
          truncated: false,
        })
      );
    }),
  } satisfies ShaclValidationServiceShape)
);

/**
 * Backward-compatible alias for the bounded v1 SHACL adapter.
 *
 * @example
 * ```ts
 * import { strictEqual } from "node:assert"
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { ShaclValidationServiceLive } from "@beep/semantic-web/adapters/shacl-engine"
 * import {
 *   ShaclValidationRequest,
 *   ShaclValidationService
 * } from "@beep/semantic-web/services/shacl-validation"
 *
 * const request = S.decodeUnknownSync(ShaclValidationRequest)({
 *   dataset: { quads: [] },
 *   shapes: []
 * })
 * const result = Effect.runSync(
 *   Effect.gen(function* () {
 *     const service = yield* ShaclValidationService
 *     return yield* service.validate(request)
 *   }).pipe(Effect.provide(ShaclValidationServiceLive))
 * )
 * strictEqual(result.truncated, false)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const ShaclValidationServiceLive = BoundedShaclValidationServiceLive;
