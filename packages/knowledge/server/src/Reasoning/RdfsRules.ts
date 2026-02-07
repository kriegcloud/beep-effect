import { type BlankNode, IRI, Literal, Quad } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";

const RDF_TYPE = IRI.make("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
const RDFS_DOMAIN = IRI.make("http://www.w3.org/2000/01/rdf-schema#domain");
const RDFS_RANGE = IRI.make("http://www.w3.org/2000/01/rdf-schema#range");
const RDFS_SUBCLASS_OF = IRI.make("http://www.w3.org/2000/01/rdf-schema#subClassOf");
const RDFS_SUBPROPERTY_OF = IRI.make("http://www.w3.org/2000/01/rdf-schema#subPropertyOf");

export interface RuleInference {
  readonly quad: Quad;
  readonly ruleId: string;
  readonly sourceQuadIds: ReadonlyArray<string>;
}

export interface Rule {
  readonly id: string;
  readonly description: string;
  readonly apply: (quads: ReadonlyArray<Quad>) => ReadonlyArray<RuleInference>;
}

export type RdfsRule = Rule;

const isLiteral = (term: IRI.Type | BlankNode.Type | Literal): term is Literal => Literal.is(term);

export const quadId = (q: Quad): string => {
  const objectStr = isLiteral(q.object)
    ? `"${q.object.value}"${q.object.datatype ?? ""}${q.object.language ?? ""}`
    : `${q.object}`;
  return `${q.subject}|${q.predicate}|${objectStr}|${q.graph ?? ""}`;
};

export const rdfs2: Rule = {
  id: "rdfs2",
  description: "Domain constraint propagation",
  apply: (quads) =>
    F.pipe(
      quads,
      A.filterMap((domainDecl) => {
        if (domainDecl.predicate !== RDFS_DOMAIN) return O.none();
        if (isLiteral(domainDecl.object)) return O.none();
        return O.some({
          property: domainDecl.subject,
          domainClass: domainDecl.object,
          domainDeclId: quadId(domainDecl),
        });
      }),
      A.flatMap(({ property, domainClass, domainDeclId }) =>
        F.pipe(
          quads,
          A.filter((q) => q.predicate === property),
          A.map(
            (dataQuad): RuleInference => ({
              quad: new Quad({
                subject: dataQuad.subject,
                predicate: RDF_TYPE,
                object: domainClass,
                graph: dataQuad.graph,
              }),
              ruleId: "rdfs2",
              sourceQuadIds: [quadId(dataQuad), domainDeclId],
            })
          )
        )
      )
    ),
};

export const rdfs3: Rule = {
  id: "rdfs3",
  description: "Range constraint propagation",
  apply: (quads) =>
    F.pipe(
      quads,
      A.filterMap((rangeDecl) => {
        if (rangeDecl.predicate !== RDFS_RANGE) return O.none();
        if (isLiteral(rangeDecl.object)) return O.none();
        return O.some({
          property: rangeDecl.subject,
          rangeClass: rangeDecl.object,
          rangeDeclId: quadId(rangeDecl),
        });
      }),
      A.flatMap(({ property, rangeClass, rangeDeclId }) =>
        F.pipe(
          quads,
          A.filterMap((dataQuad) => {
            if (dataQuad.predicate !== property) return O.none();
            if (isLiteral(dataQuad.object)) return O.none();
            return O.some<RuleInference>({
              quad: new Quad({
                subject: dataQuad.object,
                predicate: RDF_TYPE,
                object: rangeClass,
                graph: dataQuad.graph,
              }),
              ruleId: "rdfs3",
              sourceQuadIds: [quadId(dataQuad), rangeDeclId],
            });
          })
        )
      )
    ),
};

export const rdfs5: Rule = {
  id: "rdfs5",
  description: "Subproperty transitivity",
  apply: (quads) => {
    const subPropQuads = F.pipe(
      quads,
      A.filter((q) => q.predicate === RDFS_SUBPROPERTY_OF && !isLiteral(q.object))
    );

    return F.pipe(
      subPropQuads,
      A.flatMap((q1) =>
        F.pipe(
          subPropQuads,
          A.filterMap((q2) => {
            if (q1.object !== q2.subject) return O.none();
            return O.some<RuleInference>({
              quad: new Quad({
                subject: q1.subject,
                predicate: RDFS_SUBPROPERTY_OF,
                object: q2.object,
                graph: q1.graph,
              }),
              ruleId: "rdfs5",
              sourceQuadIds: [quadId(q1), quadId(q2)],
            });
          })
        )
      )
    );
  },
};

export const rdfs7: Rule = {
  id: "rdfs7",
  description: "Subproperty entailment",
  apply: (quads) => {
    const subPropQuads = F.pipe(
      quads,
      A.filter((q) => q.predicate === RDFS_SUBPROPERTY_OF)
    );

    return F.pipe(
      subPropQuads,
      A.filterMap((subPropDecl) => {
        const superProp = subPropDecl.object;
        if (!IRI.is(superProp)) return O.none();
        return O.some({ subProp: subPropDecl.subject, superProp, subPropDecl });
      }),
      A.flatMap(({ subProp, superProp, subPropDecl }) =>
        F.pipe(
          quads,
          A.filter((q) => q.predicate === subProp && q.predicate !== RDFS_SUBPROPERTY_OF),
          A.map(
            (dataQuad): RuleInference => ({
              quad: new Quad({
                subject: dataQuad.subject,
                predicate: superProp,
                object: dataQuad.object,
                graph: dataQuad.graph,
              }),
              ruleId: "rdfs7",
              sourceQuadIds: [quadId(dataQuad), quadId(subPropDecl)],
            })
          )
        )
      )
    );
  },
};

export const rdfs9: Rule = {
  id: "rdfs9",
  description: "Subclass entailment",
  apply: (quads) => {
    const typeQuads = F.pipe(
      quads,
      A.filter((q) => q.predicate === RDF_TYPE)
    );

    const subClassQuads = F.pipe(
      quads,
      A.filter((q) => q.predicate === RDFS_SUBCLASS_OF)
    );

    return F.pipe(
      typeQuads,
      A.filter((tq) => !isLiteral(tq.object)),
      A.flatMap((typeQuad) =>
        F.pipe(
          subClassQuads,
          A.filterMap((subClassDecl) => {
            if (subClassDecl.subject !== typeQuad.object) return O.none();
            if (isLiteral(subClassDecl.object)) return O.none();
            return O.some<RuleInference>({
              quad: new Quad({
                subject: typeQuad.subject,
                predicate: RDF_TYPE,
                object: subClassDecl.object,
                graph: typeQuad.graph,
              }),
              ruleId: "rdfs9",
              sourceQuadIds: [quadId(typeQuad), quadId(subClassDecl)],
            });
          })
        )
      )
    );
  },
};

export const rdfs11: Rule = {
  id: "rdfs11",
  description: "Subclass transitivity",
  apply: (quads) => {
    const subClassQuads = F.pipe(
      quads,
      A.filter((q) => q.predicate === RDFS_SUBCLASS_OF && !isLiteral(q.object))
    );

    return F.pipe(
      subClassQuads,
      A.flatMap((q1) =>
        F.pipe(
          subClassQuads,
          A.filterMap((q2) => {
            if (isLiteral(q2.object)) return O.none();
            if (q1.object !== q2.subject) return O.none();
            return O.some<RuleInference>({
              quad: new Quad({
                subject: q1.subject,
                predicate: RDFS_SUBCLASS_OF,
                object: q2.object,
                graph: q1.graph,
              }),
              ruleId: "rdfs11",
              sourceQuadIds: [quadId(q1), quadId(q2)],
            });
          })
        )
      )
    );
  },
};

export const rdfsRules: ReadonlyArray<Rule> = [rdfs2, rdfs3, rdfs5, rdfs7, rdfs9, rdfs11];
