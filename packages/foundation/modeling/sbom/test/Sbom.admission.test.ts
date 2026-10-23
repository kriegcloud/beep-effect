// `Sbom.generate` admits the whole document through one `SbomDocument.make`
// (W4-b): its inputs are already admitted components, and that single `make`
// validates and copies them once. The work is the document's node count, so it
// is exactly affine in components: the root, carried on the metadata, plus one
// node per dependency. A later edit that re-admitted each component (a
// `Component.make` in the sort, or a per-component document) would double that
// slope without failing any behavioural test. This guard counts the work
// instead of timing it: a counting `admission.admit` adds the node count of
// every value it is handed, then calls through.

import { admission } from "@beep/sbom/internal/admission";
import { Sbom } from "@beep/sbom/Sbom";
import { Component } from "@beep/sbom/SbomDocument";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as MutableRef from "effect/MutableRef";
import * as P from "effect/Predicate";
import type { SbomDocument } from "@beep/sbom/SbomDocument";
import type * as S from "effect/Schema";

/**
 * The nodes an admission walks: a document's components and the root on its
 * metadata, or one for any single component.
 */
const nodesOf = (input: unknown): number =>
  P.hasProperty(input, "components") && A.isArray(input.components) ? input.components.length + 1 : 1;

/**
 * The admission work of one build: the summed node counts every admission was
 * handed while it ran.
 *
 * **Gotchas**
 *
 * The counter replaces `admit` on the package's own `admission` object, not a
 * schema's `make`: `make` memoizes itself as a non-configurable own property on
 * first read, so under coverage's shared, non-isolated worker any earlier test
 * that built a document would make it impossible to wrap.
 */
class AdmissionCount extends Context.Service<
  AdmissionCount,
  { readonly admissionsOf: (build: () => unknown) => Effect.Effect<number> }
>()("@beep/sbom/test/Sbom.admission.test/AdmissionCount") {
  static readonly layer = Layer.effect(
    AdmissionCount,
    Effect.acquireRelease(
      Effect.sync(() => {
        const tally = MutableRef.make(0);
        const admit = admission.admit;
        // A plain swap rather than `vi.spyOn`: a spy records every call's
        // arguments and result, which would retain each admitted document.
        admission.admit = <Self extends S.Top>(schema: Self, input: Self["~type.make.in"]): Self["Type"] => {
          MutableRef.update(tally, (count) => count + nodesOf(input));
          return admit(schema, input);
        };
        return {
          admit,
          service: AdmissionCount.of({
            admissionsOf: Effect.fn("AdmissionCount.admissionsOf")((build: () => unknown) =>
              Effect.sync(() => {
                MutableRef.set(tally, 0);
                build();
                return MutableRef.get(tally);
              })
            ),
          }),
        };
      }),
      ({ admit }) =>
        Effect.sync(() => {
          admission.admit = admit;
        })
    ).pipe(Effect.map(({ service }) => service))
  );
}

const root = Component.make({ type: "application", name: "root", version: "1.0.0" });
const dependencies = A.makeBy(5_000, (index) =>
  Component.make({ type: "library", name: `dep-${index}`, version: "1.0.0", bomRef: `dep-${index}@1.0.0` })
);

/**
 * A deliberately re-admitting builder: it admits each component again before
 * the document, the shape a `Component.make` inside the sort would take.
 */
const readmittingGenerate = (components: ReadonlyArray<Component>): SbomDocument =>
  Sbom.generate({ root, components: A.map(components, (component) => admission.admit(Component, component)) });

describe("Sbom.generate admission", () => {
  it.layer(AdmissionCount.layer, { timeout: "5 seconds" })((it) => {
    it.effect("admission work is exactly affine in components: one document make over n + 1 nodes", () =>
      Effect.gen(function* () {
        const { admissionsOf } = yield* AdmissionCount;
        const generateOf = (components: ReadonlyArray<Component>) =>
          admissionsOf(() => Sbom.generate({ root, components }));
        const none = yield* generateOf(A.empty());
        const small = yield* generateOf(A.take(dependencies, 1_000));
        const large = yield* generateOf(dependencies);
        assert.strictEqual(none, 1, "the root on the metadata");
        assert.strictEqual(small, none + 1_000, `admissions(1k) = ${small}`);
        assert.strictEqual(large, none + 5_000, `admissions(5k) = ${large}`);
      })
    );

    it.effect("the counter flags a builder that re-admits each component", () =>
      Effect.gen(function* () {
        const { admissionsOf } = yield* AdmissionCount;
        const none = yield* admissionsOf(() => readmittingGenerate(A.empty()));
        const small = yield* admissionsOf(() => readmittingGenerate(A.take(dependencies, 1_000)));
        assert.strictEqual(none, 1);
        assert.strictEqual(small, none + 2 * 1_000, "each component is walked twice");
      })
    );
  });
});
