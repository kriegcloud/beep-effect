/**
 * RDFS Entailment Rules
 *
 * Implements W3C RDFS entailment rules for semantic inference.
 * Each rule takes a set of quads and returns inferred quads with provenance.
 *
 * @module knowledge-server/Reasoning/RdfsRules
 * @since 0.1.0
 */
import { type BlankNode, IRI, Literal, Quad } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";

// ============================================================================
// Standard Namespace IRIs
// ============================================================================

/**
 * RDF namespace IRIs for standard vocabulary terms
 *
 * @since 0.1.0
 * @category constants
 */
const RDF_TYPE = IRI.make("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
const RDFS_DOMAIN = IRI.make("http://www.w3.org/2000/01/rdf-schema#domain");
const RDFS_RANGE = IRI.make("http://www.w3.org/2000/01/rdf-schema#range");
const RDFS_SUBCLASS_OF = IRI.make("http://www.w3.org/2000/01/rdf-schema#subClassOf");
const RDFS_SUBPROPERTY_OF = IRI.make("http://www.w3.org/2000/01/rdf-schema#subPropertyOf");

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Result of applying a single rule
 *
 * @since 0.1.0
 * @category types
 */
export interface RuleInference {
  readonly quad: Quad;
  readonly ruleId: string;
  readonly sourceQuadIds: ReadonlyArray<string>;
}

/**
 * RDFS rule interface
 *
 * @since 0.1.0
 * @category types
 */
export interface RdfsRule {
  readonly id: string;
  readonly description: string;
  readonly apply: (quads: ReadonlyArray<Quad>) => ReadonlyArray<RuleInference>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Type guard for Literal terms
 *
 * @since 0.1.0
 * @category guards
 */
const isLiteral = (term: IRI.Type | BlankNode.Type | Literal): term is Literal => Literal.is(term);

/**
 * Generate a deterministic ID for a quad (for deduplication and provenance)
 *
 * @since 0.1.0
 * @category utilities
 */
export const quadId = (q: Quad): string => {
  const objectStr = isLiteral(q.object)
    ? `"${q.object.value}"${q.object.datatype ?? ""}${q.object.language ?? ""}`
    : String(q.object);
  return `${q.subject}|${q.predicate}|${objectStr}|${q.graph ?? ""}`;
};

// ============================================================================
// RDFS Entailment Rules
// ============================================================================

/**
 * RDFS2: Domain constraint propagation
 *
 * Pattern: (?x ?p ?y), (?p rdfs:domain ?c) => (?x rdf:type ?c)
 *
 * If a property has a declared domain, then any subject using that property
 * is implicitly an instance of the domain class.
 *
 * @since 0.1.0
 * @category rules
 */
export const rdfs2: RdfsRule = {
  id: "rdfs2",
  description: "Domain constraint propagation",
  apply: (quads) =>
    F.pipe(
      quads,
      // Find all domain declarations with non-literal domain classes
      A.filterMap((domainDecl) => {
        if (domainDecl.predicate !== RDFS_DOMAIN) return O.none();
        if (isLiteral(domainDecl.object)) return O.none();
        return O.some({
          property: domainDecl.subject,
          domainClass: domainDecl.object,
          domainDeclId: quadId(domainDecl),
        });
      }),
      // For each domain declaration, find quads using that property
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

/**
 * RDFS3: Range constraint propagation
 *
 * Pattern: (?x ?p ?y), (?p rdfs:range ?c) => (?y rdf:type ?c)
 *
 * If a property has a declared range, then any object of that property
 * is implicitly an instance of the range class. Only applies when the
 * object is an IRI or BlankNode (not a literal).
 *
 * @since 0.1.0
 * @category rules
 */
export const rdfs3: RdfsRule = {
  id: "rdfs3",
  description: "Range constraint propagation",
  apply: (quads) =>
    F.pipe(
      quads,
      // Find all range declarations with non-literal range classes
      A.filterMap((rangeDecl) => {
        if (rangeDecl.predicate !== RDFS_RANGE) return O.none();
        if (isLiteral(rangeDecl.object)) return O.none();
        return O.some({
          property: rangeDecl.subject,
          rangeClass: rangeDecl.object,
          rangeDeclId: quadId(rangeDecl),
        });
      }),
      // For each range declaration, find quads using that property with non-literal objects
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

/**
 * RDFS5: Subproperty transitivity
 *
 * Pattern: (?p rdfs:subPropertyOf ?q), (?q rdfs:subPropertyOf ?r) => (?p rdfs:subPropertyOf ?r)
 *
 * The subproperty relationship is transitive.
 *
 * @since 0.1.0
 * @category rules
 */
export const rdfs5: RdfsRule = {
  id: "rdfs5",
  description: "Subproperty transitivity",
  apply: (quads) => {
    // Filter to valid subPropertyOf quads with non-literal objects
    const subPropQuads = F.pipe(
      quads,
      A.filter((q) => q.predicate === RDFS_SUBPROPERTY_OF && !isLiteral(q.object))
    );

    // Find transitive pairs: q1.object === q2.subject
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

/**
 * RDFS7: Subproperty entailment
 *
 * Pattern: (?x ?p ?y), (?p rdfs:subPropertyOf ?q) => (?x ?q ?y)
 *
 * If a property is a subproperty of another, any statement using the
 * subproperty also implies a statement using the superproperty.
 *
 * @since 0.1.0
 * @category rules
 */
export const rdfs7: RdfsRule = {
  id: "rdfs7",
  description: "Subproperty entailment",
  apply: (quads) => {
    const subPropQuads = F.pipe(
      quads,
      A.filter((q) => q.predicate === RDFS_SUBPROPERTY_OF)
    );

    const inferences: RuleInference[] = [];

    for (const subPropDecl of subPropQuads) {
      const subProp = subPropDecl.subject;
      const superProp = subPropDecl.object;

      // Skip if superproperty is not an IRI (invalid RDFS - properties must be IRIs)
      if (!IRI.is(superProp)) {
        continue;
      }

      // Find all quads using the subproperty (excluding subPropertyOf declarations)
      const usingSubProp = F.pipe(
        quads,
        A.filter((q) => q.predicate === subProp && q.predicate !== RDFS_SUBPROPERTY_OF)
      );

      for (const dataQuad of usingSubProp) {
        const inferredQuad = new Quad({
          subject: dataQuad.subject,
          predicate: superProp,
          object: dataQuad.object,
          graph: dataQuad.graph,
        });

        inferences.push({
          quad: inferredQuad,
          ruleId: "rdfs7",
          sourceQuadIds: [quadId(dataQuad), quadId(subPropDecl)],
        });
      }
    }

    return inferences;
  },
};

/**
 * RDFS9: Subclass entailment
 *
 * Pattern: (?x rdf:type ?c), (?c rdfs:subClassOf ?d) => (?x rdf:type ?d)
 *
 * If an instance belongs to a class, it also belongs to all superclasses.
 *
 * @since 0.1.0
 * @category rules
 */
export const rdfs9: RdfsRule = {
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

    const inferences: RuleInference[] = [];

    for (const typeQuad of typeQuads) {
      const instanceClass = typeQuad.object;

      // Skip if class is a literal (invalid RDFS)
      if (isLiteral(instanceClass)) {
        continue;
      }

      // Find superclasses
      const superClasses = F.pipe(
        subClassQuads,
        A.filter((q) => q.subject === instanceClass)
      );

      for (const subClassDecl of superClasses) {
        // Skip if superclass is a literal (invalid RDFS)
        if (isLiteral(subClassDecl.object)) {
          continue;
        }

        const inferredQuad = new Quad({
          subject: typeQuad.subject,
          predicate: RDF_TYPE,
          object: subClassDecl.object,
          graph: typeQuad.graph,
        });

        inferences.push({
          quad: inferredQuad,
          ruleId: "rdfs9",
          sourceQuadIds: [quadId(typeQuad), quadId(subClassDecl)],
        });
      }
    }

    return inferences;
  },
};

/**
 * RDFS11: Subclass transitivity
 *
 * Pattern: (?c rdfs:subClassOf ?d), (?d rdfs:subClassOf ?e) => (?c rdfs:subClassOf ?e)
 *
 * The subclass relationship is transitive.
 *
 * @since 0.1.0
 * @category rules
 */
export const rdfs11: RdfsRule = {
  id: "rdfs11",
  description: "Subclass transitivity",
  apply: (quads) => {
    const subClassQuads = F.pipe(
      quads,
      A.filter((q) => q.predicate === RDFS_SUBCLASS_OF)
    );

    const inferences: RuleInference[] = [];

    for (const q1 of subClassQuads) {
      // Skip if object is a literal (invalid RDFS)
      if (isLiteral(q1.object)) {
        continue;
      }

      for (const q2 of subClassQuads) {
        // Skip if object is a literal (invalid RDFS)
        if (isLiteral(q2.object)) {
          continue;
        }

        // If q1.object === q2.subject, infer transitivity
        if (q1.object === q2.subject) {
          const inferredQuad = new Quad({
            subject: q1.subject,
            predicate: RDFS_SUBCLASS_OF,
            object: q2.object,
            graph: q1.graph,
          });

          inferences.push({
            quad: inferredQuad,
            ruleId: "rdfs11",
            sourceQuadIds: [quadId(q1), quadId(q2)],
          });
        }
      }
    }

    return inferences;
  },
};

// ============================================================================
// Rule Collection
// ============================================================================

/**
 * All RDFS entailment rules
 *
 * The rules are ordered by their W3C rule number:
 * - rdfs2: Domain constraint propagation
 * - rdfs3: Range constraint propagation
 * - rdfs5: Subproperty transitivity
 * - rdfs7: Subproperty entailment
 * - rdfs9: Subclass entailment
 * - rdfs11: Subclass transitivity
 *
 * @since 0.1.0
 * @category rules
 */
export const rdfsRules: ReadonlyArray<RdfsRule> = [rdfs2, rdfs3, rdfs5, rdfs7, rdfs9, rdfs11];
