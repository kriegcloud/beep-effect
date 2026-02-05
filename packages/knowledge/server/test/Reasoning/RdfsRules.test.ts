import { IRI, Quad } from "@beep/knowledge-domain/value-objects";
import { quadId, type RuleInference, rdfs2, rdfs3, rdfs9, rdfs11 } from "@beep/knowledge-server/Reasoning/RdfsRules";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Str from "effect/String";

const RDF_TYPE = IRI.make("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
const RDFS_DOMAIN = IRI.make("http://www.w3.org/2000/01/rdf-schema#domain");
const RDFS_RANGE = IRI.make("http://www.w3.org/2000/01/rdf-schema#range");
const RDFS_SUBCLASS_OF = IRI.make("http://www.w3.org/2000/01/rdf-schema#subClassOf");

const EX = "http://example.org/";
const ex = (name: string) => IRI.make(`${EX}${name}`);

describe("RdfsRules", () => {
  describe("quadId", () => {
    effect(
      "generates deterministic id for quad",
      Effect.fn(function* () {
        const quad = new Quad({
          subject: ex("alice"),
          predicate: RDF_TYPE,
          object: ex("Person"),
        });

        const id1 = quadId(quad);
        const id2 = quadId(quad);

        strictEqual(id1, id2);
        assertTrue(Str.includes("alice")(id1));
        assertTrue(Str.includes("Person")(id1));
      })
    );
  });

  describe("rdfs2 (domain constraint)", () => {
    effect(
      "infers subject type from property domain",
      Effect.fn(function* () {
        const quads = [
          new Quad({
            subject: ex("enrolledIn"),
            predicate: RDFS_DOMAIN,
            object: ex("Student"),
          }),
          new Quad({
            subject: ex("alice"),
            predicate: ex("enrolledIn"),
            object: ex("CS101"),
          }),
        ];

        const inferences = rdfs2.apply(quads);

        strictEqual(A.length(inferences), 1);
        strictEqual(inferences[0]?.ruleId, "rdfs2");
        strictEqual(inferences[0]?.quad.subject, ex("alice"));
        strictEqual(inferences[0]?.quad.predicate, RDF_TYPE);
        strictEqual(inferences[0]?.quad.object, ex("Student"));
      })
    );

    effect(
      "returns empty for no domain declarations",
      Effect.fn(function* () {
        const quads = [
          new Quad({
            subject: ex("alice"),
            predicate: ex("knows"),
            object: ex("bob"),
          }),
        ];

        const inferences = rdfs2.apply(quads);

        strictEqual(A.length(inferences), 0);
      })
    );
  });

  describe("rdfs3 (range constraint)", () => {
    effect(
      "infers object type from property range",
      Effect.fn(function* () {
        const quads = [
          new Quad({
            subject: ex("enrolledIn"),
            predicate: RDFS_RANGE,
            object: ex("Course"),
          }),
          new Quad({
            subject: ex("alice"),
            predicate: ex("enrolledIn"),
            object: ex("CS101"),
          }),
        ];

        const inferences = rdfs3.apply(quads);

        strictEqual(A.length(inferences), 1);
        strictEqual(inferences[0]?.ruleId, "rdfs3");
        strictEqual(inferences[0]?.quad.subject, ex("CS101"));
        strictEqual(inferences[0]?.quad.predicate, RDF_TYPE);
        strictEqual(inferences[0]?.quad.object, ex("Course"));
      })
    );
  });

  describe("rdfs9 (subclass entailment)", () => {
    effect(
      "infers type from subclass hierarchy",
      Effect.fn(function* () {
        const quads = [
          new Quad({
            subject: ex("alice"),
            predicate: RDF_TYPE,
            object: ex("Student"),
          }),
          new Quad({
            subject: ex("Student"),
            predicate: RDFS_SUBCLASS_OF,
            object: ex("Person"),
          }),
        ];

        const inferences = rdfs9.apply(quads);

        strictEqual(A.length(inferences), 1);
        strictEqual(inferences[0]?.ruleId, "rdfs9");
        strictEqual(inferences[0]?.quad.subject, ex("alice"));
        strictEqual(inferences[0]?.quad.predicate, RDF_TYPE);
        strictEqual(inferences[0]?.quad.object, ex("Person"));
      })
    );

    effect(
      "handles multiple instances of same class",
      Effect.fn(function* () {
        const quads = [
          new Quad({
            subject: ex("alice"),
            predicate: RDF_TYPE,
            object: ex("Student"),
          }),
          new Quad({
            subject: ex("bob"),
            predicate: RDF_TYPE,
            object: ex("Student"),
          }),
          new Quad({
            subject: ex("Student"),
            predicate: RDFS_SUBCLASS_OF,
            object: ex("Person"),
          }),
        ];

        const inferences = rdfs9.apply(quads);

        strictEqual(A.length(inferences), 2);
        assertTrue(A.some(inferences, (i: RuleInference) => i.quad.subject === ex("alice")));
        assertTrue(A.some(inferences, (i: RuleInference) => i.quad.subject === ex("bob")));
      })
    );
  });

  describe("rdfs11 (subclass transitivity)", () => {
    effect(
      "infers transitive subclass relationships",
      Effect.fn(function* () {
        const quads = [
          new Quad({
            subject: ex("Student"),
            predicate: RDFS_SUBCLASS_OF,
            object: ex("Person"),
          }),
          new Quad({
            subject: ex("Person"),
            predicate: RDFS_SUBCLASS_OF,
            object: ex("Agent"),
          }),
        ];

        const inferences = rdfs11.apply(quads);

        strictEqual(A.length(inferences), 1);
        strictEqual(inferences[0]?.ruleId, "rdfs11");
        strictEqual(inferences[0]?.quad.subject, ex("Student"));
        strictEqual(inferences[0]?.quad.predicate, RDFS_SUBCLASS_OF);
        strictEqual(inferences[0]?.quad.object, ex("Agent"));
      })
    );

    effect(
      "handles deep hierarchies",
      Effect.fn(function* () {
        const quads = [
          new Quad({
            subject: ex("A"),
            predicate: RDFS_SUBCLASS_OF,
            object: ex("B"),
          }),
          new Quad({
            subject: ex("B"),
            predicate: RDFS_SUBCLASS_OF,
            object: ex("C"),
          }),
          new Quad({
            subject: ex("C"),
            predicate: RDFS_SUBCLASS_OF,
            object: ex("D"),
          }),
        ];

        const inferences = rdfs11.apply(quads);

        assertTrue(A.length(inferences) >= 2);
      })
    );
  });
});
