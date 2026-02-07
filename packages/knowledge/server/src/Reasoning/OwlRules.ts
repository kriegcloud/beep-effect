import { type BlankNode, IRI, Literal, Quad } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { quadId, type Rule, type RuleInference } from "./RdfsRules";

const OWL_SAME_AS = IRI.make("http://www.w3.org/2002/07/owl#sameAs");
const OWL_INVERSE_OF = IRI.make("http://www.w3.org/2002/07/owl#inverseOf");
const OWL_TRANSITIVE_PROPERTY = IRI.make("http://www.w3.org/2002/07/owl#TransitiveProperty");
const OWL_SYMMETRIC_PROPERTY = IRI.make("http://www.w3.org/2002/07/owl#SymmetricProperty");
const RDF_TYPE = IRI.make("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");

const isLiteral = (term: IRI.Type | BlankNode.Type | Literal): term is Literal => Literal.is(term);
const isResource = (term: IRI.Type | BlankNode.Type | Literal): term is IRI.Type | BlankNode.Type => !isLiteral(term);
const isIri = (term: IRI.Type | BlankNode.Type | Literal): term is IRI.Type => IRI.is(term);

const isSchemaPredicate = (predicate: IRI.Type): boolean =>
  predicate === OWL_SAME_AS || predicate === OWL_INVERSE_OF || predicate === RDF_TYPE;

export const owlSameAsSymmetry: Rule = {
  id: "owl-sameas-symmetry",
  description: "owl:sameAs is symmetric",
  apply: (quads) =>
    F.pipe(
      quads,
      A.filterMap((q) => {
        if (q.predicate !== OWL_SAME_AS || !isResource(q.object)) return O.none();
        return O.some<RuleInference>({
          quad: new Quad({
            subject: q.object,
            predicate: OWL_SAME_AS,
            object: q.subject,
            graph: q.graph,
          }),
          ruleId: "owl-sameas-symmetry",
          sourceQuadIds: [quadId(q)],
        });
      })
    ),
};

export const owlSameAsTransitivity: Rule = {
  id: "owl-sameas-transitivity",
  description: "owl:sameAs is transitive",
  apply: (quads) => {
    const sameAsQuads = F.pipe(
      quads,
      A.filter((q) => q.predicate === OWL_SAME_AS && isResource(q.object))
    );

    return F.pipe(
      sameAsQuads,
      A.flatMap((q1) =>
        F.pipe(
          sameAsQuads,
          A.filterMap((q2) => {
            if (q1.object !== q2.subject) return O.none();
            if (isLiteral(q2.object)) return O.none();

            return O.some<RuleInference>({
              quad: new Quad({
                subject: q1.subject,
                predicate: OWL_SAME_AS,
                object: q2.object,
                graph: q1.graph,
              }),
              ruleId: "owl-sameas-transitivity",
              sourceQuadIds: [quadId(q1), quadId(q2)],
            });
          })
        )
      )
    );
  },
};

export const owlSameAsPropertyPropagation: Rule = {
  id: "owl-sameas-property-propagation",
  description: "Propagate properties across owl:sameAs links",
  apply: (quads) => {
    const sameAsQuads = F.pipe(
      quads,
      A.filter((q) => q.predicate === OWL_SAME_AS && isResource(q.object))
    );

    const dataQuads = F.pipe(
      quads,
      A.filter((q) => !isSchemaPredicate(q.predicate))
    );

    const subjectPropagation = F.pipe(
      sameAsQuads,
      A.flatMap((sameAs) =>
        F.pipe(
          dataQuads,
          A.filter((q) => q.subject === sameAs.subject),
          A.filterMap((q) => {
            if (!isResource(sameAs.object)) return O.none();
            return O.some<RuleInference>({
              quad: new Quad({
                subject: sameAs.object,
                predicate: q.predicate,
                object: q.object,
                graph: q.graph,
              }),
              ruleId: "owl-sameas-property-propagation",
              sourceQuadIds: [quadId(sameAs), quadId(q)],
            });
          })
        )
      )
    );

    const objectPropagation = F.pipe(
      sameAsQuads,
      A.flatMap((sameAs) =>
        F.pipe(
          dataQuads,
          A.filterMap((q) => {
            if (!isResource(q.object)) return O.none();
            if (q.object !== sameAs.subject) return O.none();
            if (!isResource(sameAs.object)) return O.none();

            return O.some<RuleInference>({
              quad: new Quad({
                subject: q.subject,
                predicate: q.predicate,
                object: sameAs.object,
                graph: q.graph,
              }),
              ruleId: "owl-sameas-property-propagation",
              sourceQuadIds: [quadId(sameAs), quadId(q)],
            });
          })
        )
      )
    );

    return A.appendAll(subjectPropagation, objectPropagation);
  },
};

export const owlInverseOfRule: Rule = {
  id: "owl-inverse-of",
  description: "owl:inverseOf generates inverse triples",
  apply: (quads) => {
    const declarations = F.pipe(
      quads,
      A.filterMap((q) => {
        if (q.predicate !== OWL_INVERSE_OF || !isIri(q.object)) return O.none();
        if (!IRI.is(q.subject)) return O.none();
        return O.some({ forward: q.subject, inverse: q.object, sourceId: quadId(q) });
      })
    );

    return F.pipe(
      declarations,
      A.flatMap((decl) => {
        const direct = F.pipe(
          quads,
          A.filterMap((q) => {
            if (q.predicate !== decl.forward) return O.none();
            if (!isResource(q.object)) return O.none();

            return O.some<RuleInference>({
              quad: new Quad({
                subject: q.object,
                predicate: decl.inverse,
                object: q.subject,
                graph: q.graph,
              }),
              ruleId: "owl-inverse-of",
              sourceQuadIds: [decl.sourceId, quadId(q)],
            });
          })
        );

        const reverse = F.pipe(
          quads,
          A.filterMap((q) => {
            if (q.predicate !== decl.inverse) return O.none();
            if (!isResource(q.object)) return O.none();

            return O.some<RuleInference>({
              quad: new Quad({
                subject: q.object,
                predicate: decl.forward,
                object: q.subject,
                graph: q.graph,
              }),
              ruleId: "owl-inverse-of",
              sourceQuadIds: [decl.sourceId, quadId(q)],
            });
          })
        );

        return A.appendAll(direct, reverse);
      })
    );
  },
};

export const owlTransitivePropertyRule: Rule = {
  id: "owl-transitive-property",
  description: "owl:TransitiveProperty generates transitive closure",
  apply: (quads) => {
    const transitiveProps = F.pipe(
      quads,
      A.filterMap((q) => {
        if (q.predicate !== RDF_TYPE) return O.none();
        if (!isIri(q.object)) return O.none();
        if (q.object !== OWL_TRANSITIVE_PROPERTY) return O.none();
        if (!IRI.is(q.subject)) return O.none();
        return O.some(q.subject);
      })
    );

    return F.pipe(
      transitiveProps,
      A.flatMap((prop) => {
        const edges = F.pipe(
          quads,
          A.filterMap((q) => {
            if (q.predicate !== prop || !isResource(q.object)) return O.none();
            return O.some(q);
          })
        );

        return F.pipe(
          edges,
          A.flatMap((q1) =>
            F.pipe(
              edges,
              A.filterMap((q2) => {
                if (q1.object !== q2.subject) return O.none();
                if (!isResource(q2.object)) return O.none();
                return O.some<RuleInference>({
                  quad: new Quad({
                    subject: q1.subject,
                    predicate: prop,
                    object: q2.object,
                    graph: q1.graph,
                  }),
                  ruleId: "owl-transitive-property",
                  sourceQuadIds: [quadId(q1), quadId(q2)],
                });
              })
            )
          )
        );
      })
    );
  },
};

export const owlSymmetricPropertyRule: Rule = {
  id: "owl-symmetric-property",
  description: "owl:SymmetricProperty generates symmetric triples",
  apply: (quads) => {
    const symmetricProps = F.pipe(
      quads,
      A.filterMap((q) => {
        if (q.predicate !== RDF_TYPE) return O.none();
        if (!isIri(q.object)) return O.none();
        if (q.object !== OWL_SYMMETRIC_PROPERTY) return O.none();
        if (!IRI.is(q.subject)) return O.none();
        return O.some(q.subject);
      })
    );

    return F.pipe(
      symmetricProps,
      A.flatMap((prop) =>
        F.pipe(
          quads,
          A.filterMap((q) => {
            if (q.predicate !== prop || !isResource(q.object)) return O.none();

            return O.some<RuleInference>({
              quad: new Quad({
                subject: q.object,
                predicate: prop,
                object: q.subject,
                graph: q.graph,
              }),
              ruleId: "owl-symmetric-property",
              sourceQuadIds: [quadId(q)],
            });
          })
        )
      )
    );
  },
};

export const owlSameAsRules: ReadonlyArray<Rule> = [
  owlSameAsSymmetry,
  owlSameAsTransitivity,
  owlSameAsPropertyPropagation,
];

export const owlPropertyRules: ReadonlyArray<Rule> = [
  owlInverseOfRule,
  owlTransitivePropertyRule,
  owlSymmetricPropertyRule,
];

export const owlRules: ReadonlyArray<Rule> = [...owlSameAsRules, ...owlPropertyRules];
